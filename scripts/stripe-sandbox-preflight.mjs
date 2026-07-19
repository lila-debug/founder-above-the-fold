import assert from "node:assert/strict";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const secretKey = required("STRIPE_SECRET_KEY");
const offerSpecs = [
  { label: "Mac licence", id: process.env.STRIPE_PRICE_MAC_LICENCE?.trim() || required("STRIPE_PRICE_ID"), amount: 19900, type: "one_time" },
  { label: "Profile setup", id: required("STRIPE_PRICE_PROFILE_SETUP"), amount: 49900, type: "one_time" },
  { label: "Founder Profile OS", id: required("STRIPE_PRICE_FOUNDER_OS"), amount: 6900, type: "recurring" },
  { label: "Visibility Ops", id: required("STRIPE_PRICE_VISIBILITY_OPS"), amount: 75000, type: "recurring" },
];
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
const deviceHashSecret = process.env.LICENCE_DEVICE_HASH_SECRET?.trim() ?? "";
const signingPrivate = process.env.LICENCE_SIGNING_PRIVATE_KEY?.trim() ?? "";
const signingPublic = process.env.LICENCE_SIGNING_PUBLIC_KEY?.trim() ?? "";
const mode = process.env.STRIPE_MODE?.trim() || "sandbox";
const liveMode = mode === "live";
const expectedCountry = process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY?.trim().toUpperCase() ?? "";

assert.ok(mode === "sandbox" || mode === "live", "BLOCKED: STRIPE_MODE must be sandbox or live.");

assert.match(
  secretKey,
  liveMode ? /^(sk|rk)_live_/ : /^(sk|rk)_test_/,
  `BLOCKED: STRIPE_SECRET_KEY must match STRIPE_MODE=${mode}.`,
);
if (webhookSecret) {
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: STRIPE_WEBHOOK_SECRET must begin with whsec_.");
}
if (deviceHashSecret || signingPrivate || signingPublic) {
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
for (const offer of offerSpecs) assert.match(offer.id, /^price_/, `BLOCKED: ${offer.label} price must begin with price_.`);

const [account, ...prices] = await Promise.all([
  stripeGet("/v1/account"),
  ...offerSpecs.map((offer) => stripeGet(`/v1/prices/${encodeURIComponent(offer.id)}?expand%5B%5D=product`)),
]);

for (const [index, price] of prices.entries()) {
  const offer = offerSpecs[index];
  assert.equal(price.livemode, liveMode, `BLOCKED: ${offer.label} belongs to the wrong Stripe mode.`);
  assert.equal(price.active, true, `BLOCKED: ${offer.label} price is inactive.`);
  assert.equal(price.type, offer.type, `BLOCKED: ${offer.label} has the wrong billing type.`);
  assert.equal(price.currency, "cad", `BLOCKED: ${offer.label} must use CAD.`);
  assert.equal(price.unit_amount, offer.amount, `BLOCKED: ${offer.label} expected CAD ${(offer.amount / 100).toFixed(2)}, received ${formatAmount(price.unit_amount)}.`);
  if (offer.type === "recurring") assert.equal(price.recurring?.interval, "month", `BLOCKED: ${offer.label} must recur monthly.`);
  const product = typeof price.product === "object" ? price.product : null;
  assert.ok(product && product.active, `BLOCKED: ${offer.label} product is missing or inactive.`);
}
if (expectedCountry) {
  assert.equal(account.country, expectedCountry, "BLOCKED: Stripe account country does not match the approved legal cabinet.");
}
if (liveMode) {
  assert.equal(process.env.STRIPE_LIVE_APPROVED, "true", "BLOCKED: live Stripe owner approval is missing.");
  assert.equal(process.env.STRIPE_AUTOMATIC_TAX_ENABLED, "true", "BLOCKED: live automatic-tax approval is missing.");
  assert.equal(new URL(required("NEXT_PUBLIC_APP_URL")).protocol, "https:", "BLOCKED: live Stripe requires HTTPS.");
  assert.equal(expectedCountry, "CA", "BLOCKED: the documented Canadian seller requires STRIPE_EXPECTED_ACCOUNT_COUNTRY=CA before live mode.");
}

console.log(`PASS Stripe ${mode} key authenticated without exposing it.`);
console.log(`PASS account country: ${account.country ?? "not reported"}.`);
for (const [index, price] of prices.entries()) {
  console.log(`PASS ${offerSpecs[index].label}: ${price.id}, CAD ${(price.unit_amount / 100).toFixed(2)} ${price.type === "recurring" ? "per month" : "once"}.`);
}
if (webhookSecret) {
  console.log("PASS webhook signing secret has the expected shape.");
} else {
  console.log("BLOCKED webhook signing secret is not fitted yet.");
  process.exitCode = 1;
}
if (deviceHashSecret && signingPrivate && signingPublic) {
  console.log("PASS device hashing and Ed25519 licence receipt keys match without exposing them.");
} else {
  console.log("BLOCKED device hashing and signed licence receipt keys are not fitted yet.");
  process.exitCode = 1;
}
console.log(
  process.env.STRIPE_CHECKOUT_ENABLED === "true"
    ? `AUDIT ${mode} checkout is enabled; signed fulfilment and recovery evidence must be current.`
    : `PASS ${mode} checkout remains safely disabled.`,
);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}

async function stripeGet(path) {
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) {
    throw new Error(`BLOCKED: Stripe returned HTTP ${response.status}; inspect the sandbox configuration.`);
  }
  return response.json();
}

function formatAmount(value) {
  return Number.isSafeInteger(value) ? `CAD ${(value / 100).toFixed(2)}` : "a non-fixed amount";
}
