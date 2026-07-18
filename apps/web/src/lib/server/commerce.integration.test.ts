import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync } from "node:crypto";
import Stripe from "stripe";
import { POST as handleStripeWebhook } from "@/app/api/webhooks/stripe/route";
import {
  applyStripeEvent,
  getCheckoutReceiptStatus,
  inspectLicenceRecoveryToken,
  requestLicenceRecovery,
} from "./commerce";
import { dbQuery, getDbPool } from "./db";
import { resetStripeClientForTests } from "./stripe";
import { activateLicenceDevice, verifyLicenceReceipt } from "./licence-receipts";

const databaseUrl = process.env.DATABASE_URL;
const parsedDatabaseUrl = databaseUrl ? new URL(databaseUrl) : null;
if (!parsedDatabaseUrl || !["127.0.0.1", "localhost"].includes(parsedDatabaseUrl.hostname)) {
  throw new Error("Commerce integration tests refuse to run unless DATABASE_URL points to local Postgres.");
}

const originalFetch = globalThis.fetch;
const sentEmails: Array<{ to: string[]; text: string }> = [];
globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
  const payload = JSON.parse(String(init?.body)) as { to: string[]; text: string };
  sentEmails.push(payload);
  return Response.json({ id: "email_test_recovery" });
}) as typeof fetch;

process.env.AUTH_PROVIDER = "resend";
process.env.RESEND_API_KEY = "re_test_only";
process.env.MAGIC_LINK_FROM = "Founder Above the Fold <test@example.test>";
process.env.NEXT_PUBLIC_APP_URL = "https://example.test";
process.env.STRIPE_SECRET_KEY = "sk_test_integration_only";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_integration_only";
process.env.STRIPE_PRICE_ID = "price_integration_only";
const signingKeys = generateKeyPairSync("ed25519");
process.env.LICENCE_DEVICE_HASH_SECRET = "integration-device-hash-secret-at-least-32-bytes";
process.env.LICENCE_SIGNING_PRIVATE_KEY = signingKeys.privateKey
  .export({ format: "der", type: "pkcs8" })
  .toString("base64");
process.env.LICENCE_SIGNING_PUBLIC_KEY = signingKeys.publicKey
  .export({ format: "der", type: "spki" })
  .toString("base64");

let recoveryToken = "";
let signedReceipt = "";

test("Stripe sandbox receipt and recovery conveyor uses real database state", async (t) => {
  await dbQuery("truncate stripe_webhook_events, licence_recovery_requests, founder_licences, founder_commerce_access, stripe_checkout_intents restart identity cascade");
  const intentId = "11111111-1111-4111-8111-111111111111";
  const sessionId = "cs_test_checkout_integration_123456";
  await dbQuery(
    `insert into stripe_checkout_intents
       (id, purchaser_email, status, stripe_checkout_session_id)
     values ($1, 'buyer@example.ca', 'checkout_open', $2)`,
    [intentId, sessionId],
  );

  await t.test("paid event creates exactly one receipt and duplicate event is inert", async () => {
    const paid = checkoutEvent("evt_test_paid_once", intentId, sessionId);
    assert.deepEqual(await applyStripeEvent(paid), { duplicate: false, applied: true });
    assert.deepEqual(await applyStripeEvent(paid), { duplicate: true, applied: false });

    const counts = await dbQuery<{ licences: number; events: number }>(
      `select
         (select count(*)::int from founder_licences) as licences,
         (select count(*)::int from stripe_webhook_events) as events`,
    );
    assert.deepEqual(counts.rows[0], { licences: 1, events: 1 });
    const receipt = await getCheckoutReceiptStatus(sessionId);
    assert.equal(receipt.state, "active");
  });

  await t.test("recovery response does not enumerate buyers and private link resolves active receipt", async () => {
    sentEmails.length = 0;
    const missing = await requestLicenceRecovery("unknown@example.ca");
    const active = await requestLicenceRecovery("BUYER@example.ca");
    assert.deepEqual(active, missing);
    assert.equal(sentEmails.length, 1);
    assert.deepEqual(sentEmails[0]?.to, ["buyer@example.ca"]);

    const match = sentEmails[0]?.text.match(/https:\/\/example\.test\/purchase\/recover\/confirm\?token=([A-Za-z0-9_-]+)/);
    assert.ok(match?.[1]);
    recoveryToken = match[1];
    const recovered = await inspectLicenceRecoveryToken(recoveryToken);
    assert.equal(recovered?.status, "active");
    assert.equal(recovered?.majorVersion, 1);
    assert.equal(await inspectLicenceRecoveryToken("not-a-valid-token"), null);
  });

  await t.test("recovery handle fits one hashed device and returns a verifiable offline receipt", async () => {
    const first = await activateLicenceDevice({
      recoveryToken,
      deviceId: "device-test-stable-identifier-0001",
      deviceLabel: "Test Mac",
    });
    assert.equal(first.activated, true);
    signedReceipt = first.receipt;
    assert.equal((await verifyLicenceReceipt(signedReceipt)).valid, true);

    const sameDevice = await activateLicenceDevice({
      recoveryToken,
      deviceId: "device-test-stable-identifier-0001",
      deviceLabel: "Test Mac renamed",
    });
    assert.equal(sameDevice.activated, true);
    await assert.rejects(
      activateLicenceDevice({
        recoveryToken,
        deviceId: "device-test-stable-identifier-0002",
        deviceLabel: "Second Test Mac",
      }),
      /device allowance/i,
    );
    assert.equal((await verifyLicenceReceipt(`${signedReceipt}tampered`)).valid, false);

    const stored = await dbQuery<{ count: number; raw_identifier_rows: number }>(
      `select count(*)::int as count,
              count(*) filter (where device_hash like '%device-test%')::int as raw_identifier_rows
       from founder_licence_devices`,
    );
    assert.deepEqual(stored.rows[0], { count: 1, raw_identifier_rows: 0 });
  });

  await t.test("raw-body webhook route rejects forgery and accepts the matching signature", async () => {
    const signedIntentId = "22222222-2222-4222-8222-222222222222";
    const signedSessionId = "cs_test_signed_route_123456789";
    await dbQuery(
      `insert into stripe_checkout_intents
         (id, purchaser_email, status, stripe_checkout_session_id)
       values ($1, 'signed@example.ca', 'checkout_open', $2)`,
      [signedIntentId, signedSessionId],
    );
    const event = checkoutEvent("evt_test_signed_route", signedIntentId, signedSessionId, "pi_test_signed_route");
    const payload = JSON.stringify(event);

    const forged = await handleStripeWebhook(new Request("https://example.test/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=forged" },
      body: payload,
    }));
    assert.equal(forged.status, 400);
    assert.equal((await getCheckoutReceiptStatus(signedSessionId)).state, "processing");

    const signature = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });
    const accepted = await handleStripeWebhook(new Request("https://example.test/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: payload,
    }));
    assert.equal(accepted.status, 200);
    assert.equal((await getCheckoutReceiptStatus(signedSessionId)).state, "active");
  });

  await t.test("expired and failed sessions close their intent without creating a licence", async () => {
    for (const fixture of [
      { suffix: "expired", type: "checkout.session.expired" as const, expected: "cancelled" },
      { suffix: "failed", type: "checkout.session.async_payment_failed" as const, expected: "failed" },
    ]) {
      const intentId = fixture.suffix === "expired"
        ? "33333333-3333-4333-8333-333333333333"
        : "44444444-4444-4444-8444-444444444444";
      const sessionId = `cs_test_${fixture.suffix}_session_123456`;
      await dbQuery(
        `insert into stripe_checkout_intents
           (id, purchaser_email, status, stripe_checkout_session_id)
         values ($1, $2, 'checkout_open', $3)`,
        [intentId, `${fixture.suffix}@example.ca`, sessionId],
      );
      const result = await applyStripeEvent(stoppedCheckoutEvent(
        `evt_test_${fixture.suffix}`,
        fixture.type,
        intentId,
        sessionId,
      ));
      assert.equal(result.applied, true);
      assert.equal((await getCheckoutReceiptStatus(sessionId)).state, fixture.expected);
      const licence = await dbQuery<{ count: number }>(
        "select count(*)::int as count from founder_licences where stripe_checkout_session_id = $1",
        [sessionId],
      );
      assert.equal(licence.rows[0]?.count, 0);
    }
  });

  await t.test("subscription checkout fits SaaS access without minting a Mac licence", async () => {
    const subscriptionIntentId = "55555555-5555-4555-8555-555555555555";
    const subscriptionSessionId = "cs_test_founder_os_subscription_123456";
    await dbQuery(
      `insert into stripe_checkout_intents
         (id, purchaser_email, status, stripe_checkout_session_id, offer_key, checkout_mode)
       values ($1, 'saas@example.ca', 'checkout_open', $2, 'founder_os', 'subscription')`,
      [subscriptionIntentId, subscriptionSessionId],
    );
    const paid = checkoutEvent(
      "evt_test_saas_paid",
      subscriptionIntentId,
      subscriptionSessionId,
      null,
      "sub_test_founder_os",
      "founder_os",
    );
    assert.deepEqual(await applyStripeEvent(paid), { duplicate: false, applied: true });
    const active = await getCheckoutReceiptStatus(subscriptionSessionId);
    assert.equal(active.state, "active");
    assert.equal(active.offerKey, "founder_os");

    await applyStripeEvent(subscriptionEvent("evt_test_saas_past_due", "past_due"));
    assert.equal((await getCheckoutReceiptStatus(subscriptionSessionId)).state, "past_due");
    const counts = await dbQuery<{ licences: number; access: number }>(
      `select
         (select count(*)::int from founder_licences where stripe_checkout_session_id = $1) as licences,
         (select count(*)::int from founder_commerce_access where stripe_checkout_session_id = $1) as access`,
      [subscriptionSessionId],
    );
    assert.deepEqual(counts.rows[0], { licences: 0, access: 1 });
  });

  await t.test("disputes and refunds change the same receipt instead of minting another", async () => {
    await applyStripeEvent(disputeEvent("evt_test_dispute_open", "charge.dispute.created", "needs_response"));
    assert.equal((await getCheckoutReceiptStatus(sessionId)).state, "disputed");

    await applyStripeEvent(disputeEvent("evt_test_dispute_won", "charge.dispute.closed", "won"));
    assert.equal((await getCheckoutReceiptStatus(sessionId)).state, "active");

    await applyStripeEvent(disputeEvent("evt_test_dispute_lost", "charge.dispute.closed", "lost"));
    assert.equal((await getCheckoutReceiptStatus(sessionId)).state, "revoked");

    await dbQuery("update founder_licences set status = 'active'");
    await applyStripeEvent(refundEvent("evt_test_full_refund"));
    assert.equal((await getCheckoutReceiptStatus(sessionId)).state, "refunded");
    assert.deepEqual(await verifyLicenceReceipt(signedReceipt), { valid: false, state: "inactive" });
    const count = await dbQuery<{ count: number }>(
      "select count(*)::int as count from founder_licences where stripe_payment_intent_id = 'pi_test_founder_purchase'",
    );
    assert.equal(count.rows[0]?.count, 1);
  });
});

test.after(async () => {
  globalThis.fetch = originalFetch;
  resetStripeClientForTests();
  await getDbPool().end();
});

function checkoutEvent(
  id: string,
  intentId: string,
  sessionId: string,
  paymentIntentId: string | null = "pi_test_founder_purchase",
  subscriptionId: string | null = null,
  offerKey = "mac_licence",
) {
  return {
    id,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        livemode: false,
        payment_status: "paid",
        metadata: { purchase_intent_id: intentId, offer_key: offerKey },
        payment_intent: paymentIntentId,
        subscription: subscriptionId,
        customer: "cus_test_founder",
      },
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type: "checkout.session.completed",
  } as unknown as Stripe.Event;
}

function subscriptionEvent(id: string, status: string) {
  return {
    id,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    data: { object: { id: "sub_test_founder_os", object: "subscription", livemode: false, status } },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type: "customer.subscription.updated",
  } as unknown as Stripe.Event;
}

function disputeEvent(
  id: string,
  type: "charge.dispute.created" | "charge.dispute.closed",
  status: string,
) {
  return {
    id,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    data: { object: { object: "dispute", livemode: false, payment_intent: "pi_test_founder_purchase", status } },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type,
  } as unknown as Stripe.Event;
}

function stoppedCheckoutEvent(
  id: string,
  type: "checkout.session.expired" | "checkout.session.async_payment_failed",
  intentId: string,
  sessionId: string,
) {
  return {
    id,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        livemode: false,
        metadata: { purchase_intent_id: intentId },
      },
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type,
  } as unknown as Stripe.Event;
}

function refundEvent(id: string) {
  return {
    id,
    object: "event",
    created: Math.floor(Date.now() / 1000),
    data: { object: { object: "charge", livemode: false, refunded: true, payment_intent: "pi_test_founder_purchase" } },
    livemode: false,
    pending_webhooks: 0,
    request: null,
    type: "charge.refunded",
  } as unknown as Stripe.Event;
}
