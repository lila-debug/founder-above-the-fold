import assert from "node:assert/strict";
import test from "node:test";
import { normalizeCheckoutSessionId, normalizePurchaserEmail } from "./commerce";
import { getStripeSandboxConfig, resetStripeClientForTests } from "./stripe";

const stripeNames = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_FOUNDER_TRANSFORMATION",
  "STRIPE_CHECKOUT_ENABLED",
  "STRIPE_MODE",
  "STRIPE_LIVE_APPROVED",
  "STRIPE_AUTOMATIC_TAX_ENABLED",
  "STRIPE_EXPECTED_ACCOUNT_COUNTRY",
  "NEXT_PUBLIC_APP_URL",
] as const;

test.afterEach(() => {
  for (const name of stripeNames) delete process.env[name];
  resetStripeClientForTests();
});

test("normalizes purchaser email without accepting malformed input", () => {
  assert.equal(normalizePurchaserEmail("  Founder@Example.CA "), "founder@example.ca");
  assert.throws(() => normalizePurchaserEmail("not-an-email"), /valid purchaser/);
});

test("accepts only Stripe sandbox Checkout Session references", () => {
  assert.equal(
    normalizeCheckoutSessionId(" cs_test_checkout_reference_123456 "),
    "cs_test_checkout_reference_123456",
  );
  assert.throws(() => normalizeCheckoutSessionId("cs_live_checkout_reference_123456"), /invalid/i);
  process.env.STRIPE_MODE = "live";
  assert.equal(normalizeCheckoutSessionId("cs_live_checkout_reference_123456"), "cs_live_checkout_reference_123456");
  assert.throws(() => normalizeCheckoutSessionId("cs_other_not_allowed_123456"), /invalid/i);
  assert.throws(() => normalizeCheckoutSessionId("cs_test_short"), /invalid/i);
});

test("refuses a live Stripe key even when every other slot is fitted", () => {
  fitConfig("sk_live_never_use_this_test_value");
  assert.throws(() => getStripeSandboxConfig(), /other payment cabinet/);
});

test("live mode requires its separate owner, tax, HTTPS, and checkout fasteners", () => {
  fitConfig("sk_live_fake_key_for_unit_test");
  process.env.STRIPE_MODE = "live";
  assert.throws(() => getStripeSandboxConfig(), /owner approval/);
  process.env.STRIPE_LIVE_APPROVED = "true";
  assert.throws(() => getStripeSandboxConfig(), /automatic-tax/);
  process.env.STRIPE_AUTOMATIC_TAX_ENABLED = "true";
  assert.throws(() => getStripeSandboxConfig(), /Canadian account-country/);
  process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY = "US";
  assert.throws(() => getStripeSandboxConfig(), /Canadian account-country/);
  process.env.STRIPE_EXPECTED_ACCOUNT_COUNTRY = "CA";
  assert.equal(getStripeSandboxConfig().mode, "live");
  assert.throws(() => getStripeSandboxConfig({ requireCheckoutEnabled: true }), /disabled/);
});

test("keeps a valid sandbox configuration locked until checkout is explicitly enabled", () => {
  fitConfig("sk_test_fake_key_for_unit_test");
  assert.equal(getStripeSandboxConfig().priceId, "price_fake_for_unit_test");
  assert.throws(
    () => getStripeSandboxConfig({ requireCheckoutEnabled: true }),
    /checkout is disabled/,
  );
  process.env.STRIPE_CHECKOUT_ENABLED = "true";
  assert.equal(getStripeSandboxConfig({ requireCheckoutEnabled: true }).baseUrl.origin, "https://example.test");
});

function fitConfig(secretKey: string) {
  process.env.STRIPE_SECRET_KEY = secretKey;
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake_for_unit_test";
  process.env.STRIPE_PRICE_FOUNDER_TRANSFORMATION = "price_fake_for_unit_test";
  process.env.STRIPE_CHECKOUT_ENABLED = "false";
  process.env.NEXT_PUBLIC_APP_URL = "https://example.test";
}
