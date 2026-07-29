import assert from "node:assert/strict";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const secretKey = required("STRIPE_SECRET_KEY");
const expectedAccountId = required("STRIPE_EXPECTED_ACCOUNT_ID");
const expectedCountry = required("STRIPE_EXPECTED_ACCOUNT_COUNTRY").toUpperCase();
const priceId = required("STRIPE_PRICE_FOUNDER_TRANSFORMATION");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
const deviceHashSecret = process.env.LICENCE_DEVICE_HASH_SECRET?.trim() ?? "";
const signingPrivate = process.env.LICENCE_SIGNING_PRIVATE_KEY?.trim() ?? "";
const signingPublic = process.env.LICENCE_SIGNING_PUBLIC_KEY?.trim() ?? "";
const mode = process.env.STRIPE_MODE?.trim() || "sandbox";
const liveMode = mode === "live";

assert.ok(mode === "sandbox" || mode === "live", "BLOCKED: STRIPE_MODE must be sandbox or live.");
assert.match(expectedAccountId, /^acct_/, "BLOCKED: STRIPE_EXPECTED_ACCOUNT_ID must begin with acct_.");
assert.match(
  secretKey,
  liveMode ? /^(sk|rk)_live_/ : /^(sk|rk)_test_/,
  `BLOCKED: STRIPE_SECRET_KEY must match STRIPE_MODE=${mode}.`,
);
assert.match(priceId, /^price_/, "BLOCKED: STRIPE_PRICE_FOUNDER_TRANSFORMATION must begin with price_.");
if (webhookSecret) {
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: STRIPE_WEBHOOK_SECRET must begin with whsec_.");
}
if (deviceHashSecret || signingPrivate || signingPublic) validateLicenceKeys();

const [account, price, productPage, oneTimePage, recurringPage] = await Promise.all([
  stripeGet("/v1/account"),
  stripeGet(`/v1/prices/${encodeURIComponent(priceId)}?expand%5B%5D=product`),
  stripeGet("/v1/products?active=true&limit=100"),
  stripeGet("/v1/prices?active=true&type=one_time&limit=100"),
  stripeGet("/v1/prices?active=true&type=recurring&limit=100"),
]);

assert.equal(account.id, expectedAccountId, "BLOCKED: the runtime key belongs to a different Stripe account.");
assert.equal(account.country, expectedCountry, "BLOCKED: Stripe account country does not match the expected cabinet.");
assert.equal(price.livemode, liveMode, "BLOCKED: the transformation price belongs to the wrong Stripe mode.");
assert.equal(price.active, true, "BLOCKED: the transformation price is inactive.");
assert.equal(price.type, "one_time", "BLOCKED: the transformation must be a one-time price.");
assert.equal(price.currency, "cad", "BLOCKED: the transformation price must use CAD.");
assert.equal(price.unit_amount, 750000, `BLOCKED: expected CAD 7,500.00, received ${formatAmount(price.unit_amount)}.`);
const product = typeof price.product === "object" ? price.product : null;
assert.ok(product?.active, "BLOCKED: the transformation product is missing or inactive.");
assert.equal(
  product.metadata?.founder_offer_key,
  "founder_transformation",
  "BLOCKED: the product is not labelled as the approved transformation offer.",
);
if (!liveMode) {
  assert.equal(productPage.has_more, false, "BLOCKED: the isolated staging product catalogue exceeds one page.");
  assert.deepEqual(productPage.data.map((item) => item.id), [product.id], "BLOCKED: the isolated staging sandbox must contain exactly one active product.");
  assert.equal(oneTimePage.has_more, false, "BLOCKED: the isolated staging price catalogue exceeds one page.");
  assert.deepEqual(oneTimePage.data.map((item) => item.id), [price.id], "BLOCKED: the isolated staging sandbox must contain exactly one active one-time price.");
  assert.deepEqual(recurringPage.data, [], "BLOCKED: the one-offer staging sandbox must contain no recurring prices.");
}

if (liveMode) {
  assert.equal(process.env.STRIPE_LIVE_APPROVED, "true", "BLOCKED: live Stripe owner approval is missing.");
  assert.equal(process.env.STRIPE_AUTOMATIC_TAX_ENABLED, "true", "BLOCKED: live automatic-tax approval is missing.");
  assert.equal(new URL(required("NEXT_PUBLIC_APP_URL")).protocol, "https:", "BLOCKED: live Stripe requires HTTPS.");
  assert.equal(expectedCountry, "CA", "BLOCKED: the documented Canadian seller requires STRIPE_EXPECTED_ACCOUNT_COUNTRY=CA before live mode.");
} else {
  assert.equal(expectedCountry, "US", "BLOCKED: this evidence-only staging cabinet must remain bound to the US sandbox.");
  assert.equal(
    required("STRIPE_STAGING_VERCEL_PROJECT"),
    "founder-above-the-fold-stripe-staging",
    "BLOCKED: sandbox preflight is bound to the dedicated staging Vercel project.",
  );
  assert.equal(new URL(required("STRIPE_STAGING_BASE_URL")).protocol, "https:", "BLOCKED: staging requires an HTTPS base URL.");
}

console.log(`PASS Stripe ${mode} runtime key is bound to expected account ${account.id}.`);
console.log(`PASS account country: ${account.country}.`);
console.log(`PASS Founder transformation: ${price.id}, CAD 7,500.00 once.`);
console.log(webhookSecret ? "PASS webhook signing secret has the expected shape." : "BLOCKED webhook signing secret is not fitted yet.");
if (!webhookSecret) process.exitCode = 1;
console.log(
  deviceHashSecret && signingPrivate && signingPublic
    ? "PASS device hashing and signed licence receipt keys match without exposing them."
    : "BLOCKED device hashing and signed licence receipt keys are not fitted yet.",
);
if (!(deviceHashSecret && signingPrivate && signingPublic)) process.exitCode = 1;
console.log(
  process.env.STRIPE_CHECKOUT_ENABLED === "true"
    ? `AUDIT ${mode} checkout is enabled; lifecycle evidence must be current.`
    : `PASS ${mode} checkout remains safely disabled.`,
);

function validateLicenceKeys() {
  assert.ok(Buffer.byteLength(deviceHashSecret) >= 32, "BLOCKED: LICENCE_DEVICE_HASH_SECRET must contain at least 32 bytes.");
  try {
    const privateKey = createPrivateKey({ key: Buffer.from(signingPrivate, "base64"), format: "der", type: "pkcs8" });
    const publicKey = createPublicKey({ key: Buffer.from(signingPublic, "base64"), format: "der", type: "spki" });
    const probe = Buffer.from("founder-above-the-fold-preflight");
    assert.equal(verify(null, probe, publicKey, sign(null, probe, privateKey)), true);
  } catch {
    throw new Error("BLOCKED: the Ed25519 licence signing keypair is invalid or mismatched.");
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}

async function stripeGet(path) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) throw new Error(`BLOCKED: Stripe returned HTTP ${response.status}; inspect the sandbox configuration.`);
  return response.json();
}

function formatAmount(value) {
  return Number.isSafeInteger(value) ? `CAD ${(value / 100).toFixed(2)}` : "a non-fixed amount";
}
