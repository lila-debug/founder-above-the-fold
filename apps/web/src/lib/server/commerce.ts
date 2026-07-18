import { createHash, randomBytes, randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { commerceOffers, isCommerceOfferKey, type CommerceOfferKey } from "../commerce-offers";
import { sendLicenceRecoveryEmail } from "../auth/email";
import { getDbPool } from "./db";
import { getConfiguredStripeMode, getStripeClient, getStripeConfig, getStripeOfferPriceId, stripeObjectMatchesConfiguredMode } from "./stripe";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePurchaserEmail(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 320 || !emailPattern.test(normalized)) {
    throw new Error("Enter a valid purchaser email address.");
  }
  return normalized;
}

export function normalizeCheckoutSessionId(value: string) {
  const normalized = value.trim();
  const prefix = getConfiguredStripeMode() === "live" ? "cs_live_" : "cs_test_";
  if (!normalized.startsWith(prefix) || !/^cs_(test|live)_[A-Za-z0-9_]{8,240}$/.test(normalized)) {
    throw new Error("The checkout reference is invalid.");
  }
  return normalized;
}

export async function createStripeSandboxCheckout(input: {
  email: string;
  termsAccepted: boolean;
  offerKey: CommerceOfferKey;
}) {
  if (!input.termsAccepted) throw new Error("Accept the licence and refund terms before checkout.");

  const email = normalizePurchaserEmail(input.email);
  const config = getStripeConfig({ requireCheckoutEnabled: true });
  const offer = commerceOffers[input.offerKey];
  const priceId = getStripeOfferPriceId(input.offerKey);
  const stripe = getStripeClient();
  const pool = getDbPool();
  const intentId = randomUUID();

  const recent = await pool.query<{ count: string }>(
    `select count(*)::text as count from stripe_checkout_intents
     where purchaser_email = $1 and created_at > now() - interval '1 hour'`,
    [email],
  );
  if (Number(recent.rows[0]?.count ?? 0) >= 5) {
    throw new Error("Too many checkout attempts. Try again later.");
  }

  await pool.query(
    `insert into stripe_checkout_intents (id, purchaser_email, offer_key, checkout_mode)
     values ($1, $2, $3, $4)`,
    [intentId, email, input.offerKey, offer.billing],
  );

  try {
    const session = await stripe.checkout.sessions.create({
      mode: offer.billing,
      customer_email: email,
      client_reference_id: intentId,
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: "required",
      customer_creation: "always",
      automatic_tax: { enabled: config.automaticTaxEnabled },
      ...(offer.billing === "payment"
        ? { payment_intent_data: { metadata: { purchase_intent_id: intentId, offer_key: input.offerKey } } }
        : { subscription_data: { metadata: { purchase_intent_id: intentId, offer_key: input.offerKey } } }),
      metadata: { purchase_intent_id: intentId, offer_key: input.offerKey, licence_major_version: "1" },
      success_url: new URL("/purchase/success?session_id={CHECKOUT_SESSION_ID}", config.baseUrl).toString(),
      cancel_url: new URL("/pricing?checkout=cancelled", config.baseUrl).toString(),
    }, { idempotencyKey: `founder-checkout-${intentId}` });

    if (session.livemode) throw new Error("Stripe returned a live checkout in sandbox mode.");
    if (!session.url) throw new Error("Stripe did not return a hosted checkout URL.");

    await pool.query(
      `update stripe_checkout_intents
       set status = 'checkout_open', stripe_checkout_session_id = $2
       where id = $1`,
      [intentId, session.id],
    );

    return { url: session.url };
  } catch (cause) {
    await pool.query(`update stripe_checkout_intents set status = 'failed' where id = $1`, [intentId]);
    throw cause;
  }
}

export async function applyStripeEvent(event: Stripe.Event) {
  if (!stripeObjectMatchesConfiguredMode(event.livemode)) {
    throw new Error("Stripe event mode does not match the configured payment cabinet.");
  }
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const inserted = await client.query(
      `insert into stripe_webhook_events
         (stripe_event_id, event_type, provider_created_at)
       values ($1, $2, to_timestamp($3))
       on conflict (stripe_event_id) do nothing
       returning stripe_event_id`,
      [event.id, event.type, event.created],
    );
    if (inserted.rowCount === 0) {
      await client.query("rollback");
      return { duplicate: true, applied: false };
    }

    let applied = false;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      applied = await applyPaidCheckout(client, event.data.object as Stripe.Checkout.Session, event.created);
    } else if (event.type === "checkout.session.expired") {
      applied = await applyCheckoutStopped(client, event.data.object as Stripe.Checkout.Session, "cancelled");
    } else if (event.type === "checkout.session.async_payment_failed") {
      applied = await applyCheckoutStopped(client, event.data.object as Stripe.Checkout.Session, "failed");
    } else if (event.type === "charge.refunded") {
      applied = await applyRefund(client, event.data.object as Stripe.Charge);
    } else if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
      applied = await applyDispute(client, event.data.object as Stripe.Dispute, event.type);
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      applied = await applySubscription(client, event.data.object as Stripe.Subscription);
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      applied = await applyInvoice(client, event.data.object as Stripe.Invoice, event.type);
    }

    await client.query(
      `update stripe_webhook_events set applied = $2 where stripe_event_id = $1`,
      [event.id, applied],
    );
    await client.query("commit");
    return { duplicate: false, applied };
  } catch (cause) {
    await client.query("rollback");
    throw cause;
  } finally {
    client.release();
  }
}

export async function getCheckoutReceiptStatus(sessionIdInput: string) {
  const sessionId = normalizeCheckoutSessionId(sessionIdInput);
  const result = await getDbPool().query<{
    intent_status: string;
    licence_status: "active" | "refunded" | "disputed" | "revoked" | null;
    major_version: number | null;
    offer_key: string;
    order_status: string | null;
    purchased_at: Date | null;
  }>(
    `select
       intent.status as intent_status,
       licence.status as licence_status,
       licence.major_version,
       licence.purchased_at,
       intent.offer_key,
       access.status as order_status
     from stripe_checkout_intents intent
     left join founder_licences licence
       on licence.stripe_checkout_session_id = intent.stripe_checkout_session_id
     left join founder_commerce_access access
       on access.stripe_checkout_session_id = intent.stripe_checkout_session_id
     where intent.stripe_checkout_session_id = $1`,
    [sessionId],
  );

  const row = result.rows[0];
  if (!row) return { state: "not_found" as const };
  const offerKey = isCommerceOfferKey(row.offer_key) ? row.offer_key : "mac_licence";
  const fulfilledState = row.licence_status ?? row.order_status;
  if (!fulfilledState) {
    return {
      offerKey,
      state: row.intent_status === "failed"
        ? "failed" as const
        : row.intent_status === "cancelled"
          ? "cancelled" as const
          : "processing" as const,
    };
  }

  return {
    state: fulfilledState as "active" | "past_due" | "cancelled" | "refunded" | "disputed" | "revoked",
    offerKey,
    majorVersion: row.major_version,
    purchasedAt: row.purchased_at?.toISOString() ?? null,
  };
}

export async function requestLicenceRecovery(emailInput: string) {
  const email = normalizePurchaserEmail(emailInput);
  const pool = getDbPool();
  const genericResult = {
    accepted: true as const,
    message: "If an active licence matches that address, a private recovery link is on its way.",
  };

  const recent = await pool.query<{ count: string }>(
    `select count(*)::text as count from licence_recovery_requests
     where requested_email = $1 and created_at > now() - interval '1 hour'`,
    [email],
  );
  if (Number(recent.rows[0]?.count ?? 0) >= 5) return genericResult;

  const licence = await pool.query<{ id: string }>(
    `select id from founder_licences
     where purchaser_email = $1 and status = 'active'
     order by purchased_at desc limit 1`,
    [email],
  );
  const licenceId = licence.rows[0]?.id;
  if (!licenceId) return genericResult;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashRecoveryToken(token);
  const requestId = randomUUID();
  await pool.query(
    `insert into licence_recovery_requests
       (id, licence_id, requested_email, token_hash, expires_at)
     values ($1, $2, $3, $4, now() + interval '15 minutes')`,
    [requestId, licenceId, email, tokenHash],
  );

  const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  const recoveryLink = new URL("/purchase/recover/confirm", baseUrl);
  recoveryLink.searchParams.set("token", token);

  try {
    await sendLicenceRecoveryEmail({ email, recoveryLink: recoveryLink.toString() });
  } catch (cause) {
    await pool.query(`delete from licence_recovery_requests where id = $1`, [requestId]);
    throw cause;
  }

  return genericResult;
}

export async function inspectLicenceRecoveryToken(tokenInput: string) {
  const token = tokenInput.trim();
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null;
  const tokenHash = hashRecoveryToken(token);
  const result = await getDbPool().query<{
    id: string;
    status: "active" | "refunded" | "disputed" | "revoked";
    major_version: number;
    device_allowance: number;
    purchased_at: Date;
  }>(
    `update licence_recovery_requests request
     set opened_at = coalesce(request.opened_at, now())
     from founder_licences licence
     where request.token_hash = $1
       and request.expires_at > now()
       and licence.id = request.licence_id
     returning licence.id, licence.status, licence.major_version,
               licence.device_allowance, licence.purchased_at`,
    [tokenHash],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    majorVersion: row.major_version,
    deviceAllowance: row.device_allowance,
    purchasedAt: row.purchased_at.toISOString(),
  };
}

function hashRecoveryToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function applyCheckoutStopped(
  client: import("pg").PoolClient,
  session: Stripe.Checkout.Session,
  status: "cancelled" | "failed",
) {
  if (!stripeObjectMatchesConfiguredMode(session.livemode)) return false;
  const intentId = session.metadata?.purchase_intent_id;
  if (!intentId) return false;
  const result = await client.query(
    `update stripe_checkout_intents set status = $2
     where id = $1 and status in ('created', 'checkout_open')`,
    [intentId, status],
  );
  return (result.rowCount ?? 0) > 0;
}

async function applyPaidCheckout(
  client: import("pg").PoolClient,
  session: Stripe.Checkout.Session,
  created: number,
) {
  if (!stripeObjectMatchesConfiguredMode(session.livemode) || session.payment_status !== "paid") return false;
  const intentId = session.metadata?.purchase_intent_id;
  if (!intentId) return false;

  const intent = await client.query<{ purchaser_email: string; offer_key: string; checkout_mode: string }>(
    `select purchaser_email, offer_key, checkout_mode from stripe_checkout_intents where id = $1 for update`,
    [intentId],
  );
  const email = intent.rows[0]?.purchaser_email;
  const offerKey = intent.rows[0]?.offer_key;
  if (!email || !isCommerceOfferKey(offerKey)) return false;

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
  const customerId = typeof session.customer === "string" ? session.customer : null;
  if (offerKey === "mac_licence") {
    await client.query(
      `insert into founder_licences
       (purchaser_email, stripe_customer_id, stripe_checkout_session_id,
        stripe_payment_intent_id, status, purchased_at)
     values ($1, $2, $3, $4, 'active', to_timestamp($5))
     on conflict (stripe_checkout_session_id) do nothing`,
      [email, customerId, session.id, paymentIntentId, created],
    );
  } else {
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    await client.query(
      `insert into founder_commerce_access
         (purchaser_email, offer_key, billing_kind, stripe_customer_id,
          stripe_checkout_session_id, stripe_payment_intent_id, stripe_subscription_id,
          status, purchased_at)
       values ($1, $2, $3, $4, $5, $6, $7, 'active', to_timestamp($8))
       on conflict (stripe_checkout_session_id) do nothing`,
      [email, offerKey, intent.rows[0]?.checkout_mode, customerId, session.id, paymentIntentId, subscriptionId, created],
    );
  }
  await client.query(
    `update stripe_checkout_intents set status = 'paid', stripe_checkout_session_id = $2 where id = $1`,
    [intentId, session.id],
  );
  return true;
}

async function applyRefund(client: import("pg").PoolClient, charge: Stripe.Charge) {
  if (!stripeObjectMatchesConfiguredMode(charge.livemode) || !charge.refunded) return false;
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return false;
  const result = await client.query(
    `with licence as (
       update founder_licences set status = 'refunded'
       where stripe_payment_intent_id = $1 and status <> 'refunded' returning 1
     ), access as (
       update founder_commerce_access set status = 'refunded'
       where stripe_payment_intent_id = $1 and status <> 'refunded' returning 1
     ) select (select count(*) from licence) + (select count(*) from access) as changed`,
    [paymentIntentId],
  );
  return Number(result.rows[0]?.changed ?? 0) > 0;
}

async function applyDispute(
  client: import("pg").PoolClient,
  dispute: Stripe.Dispute,
  eventType: "charge.dispute.created" | "charge.dispute.closed",
) {
  if (!stripeObjectMatchesConfiguredMode(dispute.livemode)) return false;
  const paymentIntentId = typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
  if (!paymentIntentId) return false;
  const nextStatus = eventType === "charge.dispute.created"
    ? "disputed"
    : dispute.status === "won"
      ? "active"
      : "revoked";
  const result = await client.query(
    `with licence as (
       update founder_licences set status = $2
       where stripe_payment_intent_id = $1 and status <> 'refunded' returning 1
     ), access as (
       update founder_commerce_access set status = $2
       where stripe_payment_intent_id = $1 and status <> 'refunded' returning 1
     ) select (select count(*) from licence) + (select count(*) from access) as changed`,
    [paymentIntentId, nextStatus],
  );
  return Number(result.rows[0]?.changed ?? 0) > 0;
}

async function applySubscription(client: import("pg").PoolClient, subscription: Stripe.Subscription) {
  if (!stripeObjectMatchesConfiguredMode(subscription.livemode)) return false;
  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "past_due" || subscription.status === "unpaid" || subscription.status === "paused"
      ? "past_due"
      : "cancelled";
  const result = await client.query(
    `update founder_commerce_access set status = $2
     where stripe_subscription_id = $1 and status <> 'refunded'`,
    [subscription.id, status],
  );
  return (result.rowCount ?? 0) > 0;
}

async function applyInvoice(
  client: import("pg").PoolClient,
  invoice: Stripe.Invoice,
  eventType: "invoice.paid" | "invoice.payment_failed",
) {
  if (!stripeObjectMatchesConfiguredMode(invoice.livemode)) return false;
  const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === "string"
    ? invoice.parent.subscription_details.subscription
    : null;
  if (!subscriptionId) return false;
  const result = await client.query(
    `update founder_commerce_access set status = $2
     where stripe_subscription_id = $1 and status <> 'refunded'`,
    [subscriptionId, eventType === "invoice.paid" ? "active" : "past_due"],
  );
  return (result.rowCount ?? 0) > 0;
}
