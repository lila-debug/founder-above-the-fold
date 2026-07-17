import assert from "node:assert/strict";
import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const secretKey = required("STRIPE_SECRET_KEY");
const priceId = required("STRIPE_PRICE_ID");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
const expectedAmount = Number(process.env.STRIPE_EXPECTED_UNIT_AMOUNT_CAD ?? "19900");
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
assert.match(priceId, /^price_/, "BLOCKED: STRIPE_PRICE_ID must begin with price_.");
assert.ok(Number.isSafeInteger(expectedAmount) && expectedAmount > 0, "BLOCKED: expected CAD amount is invalid.");

const [account, price] = await Promise.all([
  stripeGet("/v1/account"),
  stripeGet(`/v1/prices/${encodeURIComponent(priceId)}?expand%5B%5D=product`),
]);

assert.equal(price.livemode, liveMode, `BLOCKED: the configured price does not belong to ${mode} mode.`);
assert.equal(price.active, true, "BLOCKED: the configured Stripe price is inactive.");
assert.equal(price.type, "one_time", "BLOCKED: the Founder licence must be a one-time price.");
assert.equal(price.currency, "cad", "BLOCKED: the Founder licence price must use CAD.");
assert.equal(
  price.unit_amount,
  expectedAmount,
  `BLOCKED: expected CAD ${(expectedAmount / 100).toFixed(2)}, received ${formatAmount(price.unit_amount)}.`,
);

const product = typeof price.product === "object" ? price.product : null;
assert.ok(product && product.active, "BLOCKED: the Stripe product is missing or inactive.");
if (expectedCountry) {
  assert.equal(account.country, expectedCountry, "BLOCKED: Stripe account country does not match the approved legal cabinet.");
}
if (liveMode) {
  assert.equal(process.env.STRIPE_LIVE_APPROVED, "true", "BLOCKED: live Stripe owner approval is missing.");
  assert.equal(process.env.STRIPE_AUTOMATIC_TAX_ENABLED, "true", "BLOCKED: live automatic-tax approval is missing.");
  assert.equal(new URL(required("NEXT_PUBLIC_APP_URL")).protocol, "https:", "BLOCKED: live Stripe requires HTTPS.");
  assert.ok(expectedCountry, "BLOCKED: confirm STRIPE_EXPECTED_ACCOUNT_COUNTRY before live mode.");
}

console.log(`PASS Stripe ${mode} key authenticated without exposing it.`);
console.log(`PASS account country: ${account.country ?? "not reported"}.`);
console.log(`PASS one-time price: ${price.id}, CAD ${(price.unit_amount / 100).toFixed(2)}.`);
console.log(`PASS product: ${product.name ?? product.id}.`);
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
