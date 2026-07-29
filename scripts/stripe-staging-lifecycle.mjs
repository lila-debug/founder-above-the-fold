import assert from "node:assert/strict";
import pg from "pg";

const { Client } = pg;
assert.equal(process.env.STRIPE_TEST_SUBMISSION_APPROVED, "true", "BLOCKED: genuine Stripe test submission needs explicit approval.");
assert.equal(process.env.STRIPE_MODE, "sandbox", "BLOCKED: lifecycle checks accept sandbox mode only.");
assert.equal(process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY, "US", "BLOCKED: lifecycle evidence belongs to the US sandbox only.");
assert.equal(process.env.STRIPE_CHECKOUT_ENABLED, "true", "BLOCKED: enable only staging checkout for the approved test window.");

const baseUrl = new URL(required("STRIPE_STAGING_BASE_URL"));
const databaseUrl = required("DATABASE_URL");
const successfulSessionId = required("STRIPE_LIFECYCLE_SUCCESS_SESSION_ID");
const purchaserEmail = required("STRIPE_LIFECYCLE_PURCHASER_EMAIL").toLowerCase();
assert.match(successfulSessionId, /^cs_test_/, "BLOCKED: lifecycle session must be a Stripe test Checkout Session.");

const unknownReceipt = await fetch(new URL("/api/commerce/stripe/receipt?session_id=cs_test_unknown_lifecycle_123456", baseUrl));
const unknownBody = await unknownReceipt.json();
assert.equal(unknownBody.state, "not_found", "BLOCKED: unknown return link produced access.");

const forgedWebhook = await fetch(new URL("/api/webhooks/stripe", baseUrl), {
  method: "POST",
  headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=forged" },
  body: "{}",
});
assert.equal(forgedWebhook.status, 400, "BLOCKED: forged webhook signature was not rejected.");

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  const receipt = await client.query(
    `select intent.offer_key, intent.status,
            count(distinct licence.id)::int as licences,
            count(distinct access.id)::int as access_records
     from stripe_checkout_intents intent
     left join founder_licences licence
       on licence.stripe_checkout_session_id = intent.stripe_checkout_session_id
     left join founder_commerce_access access
       on access.stripe_checkout_session_id = intent.stripe_checkout_session_id
     where intent.stripe_checkout_session_id = $1
       and intent.purchaser_email = $2
     group by intent.offer_key, intent.status`,
    [successfulSessionId, purchaserEmail],
  );
  assert.deepEqual(
    receipt.rows[0],
    { offer_key: "founder_transformation", status: "paid", licences: 1, access_records: 1 },
    "BLOCKED: successful transformation did not fit exactly one licence and one access record.",
  );

  const duplicates = await client.query(
    `select count(*)::int as count
     from stripe_webhook_events
     where event_type in (
       'checkout.session.completed',
       'checkout.session.async_payment_succeeded',
       'checkout.session.async_payment_failed',
       'checkout.session.expired',
       'charge.refunded',
       'charge.dispute.created',
       'charge.dispute.closed'
     )`,
  );
  assert.ok((duplicates.rows[0]?.count ?? 0) >= 1, "BLOCKED: no genuine staging webhook evidence is recorded.");
} finally {
  await client.end();
}

console.log("PASS successful transformation created one service-access record and one Mac licence.");
console.log("PASS unknown return and forged webhook probes unlocked nothing.");
console.log("AUDIT refund, dispute and failed-payment state transitions remain scenario-specific manual evidence rows.");
console.log("NEXT set STRIPE_CHECKOUT_ENABLED=false, redeploy staging, and record the final evidence IDs.");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}
