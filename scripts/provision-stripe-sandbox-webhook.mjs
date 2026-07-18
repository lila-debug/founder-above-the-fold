import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apply = process.env.APPLY_STRIPE_SANDBOX_WEBHOOK === "true";
const deploymentApproved = process.env.PRODUCTION_DEPLOYMENT_APPROVED === "true";
const enableCheckout = process.env.ENABLE_STRIPE_SANDBOX_CHECKOUT === "true";
const secretKey = required("STRIPE_SECRET_KEY");
const offerPriceSlots = {
  STRIPE_PRICE_MAC_LICENCE: process.env.STRIPE_PRICE_MAC_LICENCE?.trim() || process.env.STRIPE_PRICE_ID?.trim() || "",
  STRIPE_PRICE_PROFILE_SETUP: process.env.STRIPE_PRICE_PROFILE_SETUP?.trim() || "",
  STRIPE_PRICE_FOUNDER_OS: process.env.STRIPE_PRICE_FOUNDER_OS?.trim() || "",
  STRIPE_PRICE_VISIBILITY_OPS: process.env.STRIPE_PRICE_VISIBILITY_OPS?.trim() || "",
};
const baseUrl = new URL(process.env.STRIPE_WEBHOOK_BASE_URL ?? "https://www.founderaccount.com");
const endpointUrl = new URL("/api/webhooks/stripe", baseUrl).toString();
const events = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
];
const missingPriceSlots = Object.entries(offerPriceSlots)
  .filter(([, value]) => !value)
  .map(([name]) => name);

assert.match(secretKey, /^(sk|rk)_test_/, "BLOCKED: provisioning accepts only a Stripe test key.");
for (const [name, value] of Object.entries(offerPriceSlots)) {
  if (value) assert.match(value, /^price_/, `BLOCKED: ${name} is invalid.`);
}
assert.equal(baseUrl.protocol, "https:", "BLOCKED: the deployed webhook socket must use HTTPS.");

const routeProbe = await fetch(endpointUrl, { method: "POST" });
const routeReady = routeProbe.status === 400;
console.log(`${routeReady ? "PASS" : "BLOCKED"} deployed webhook socket: HTTP ${routeProbe.status} ${endpointUrl}`);

const listed = await stripeRequest("/v1/webhook_endpoints?limit=100");
const matches = listed.data.filter((item) => item.url === endpointUrl && item.status !== "disabled");
console.log(`AUDIT matching enabled Stripe sandbox endpoints: ${matches.length}.`);
for (const endpoint of matches) {
  const missingEvents = events.filter((event) => !endpoint.enabled_events.includes(event));
  console.log(`${missingEvents.length ? "BLOCKED" : "PASS"} endpoint ${endpoint.id}: ${missingEvents.length ? `missing ${missingEvents.join(", ")}` : "event drawer complete"}.`);
}

if (!apply) {
  if (missingPriceSlots.length) {
    console.log(`BLOCKED webhook fitting still needs price slots: ${missingPriceSlots.join(", ")}.`);
  }
  console.log("DRY RUN no Stripe or Vercel state changed.");
  if (!routeReady || matches.length > 1 || missingPriceSlots.length) process.exitCode = 1;
  process.exit();
}

assert.equal(deploymentApproved, true, "BLOCKED: set PRODUCTION_DEPLOYMENT_APPROVED=true only after explicit owner approval.");
assert.equal(routeReady, true, "BLOCKED: deploy the webhook route before creating the Stripe endpoint.");
assert.ok(matches.length <= 1, "BLOCKED: multiple matching endpoints require manual inspection.");
assert.equal(missingPriceSlots.length, 0, `BLOCKED: fit the missing price slots first (${missingPriceSlots.join(", ")}).`);
await access(path.join(root, ".vercel", "project.json"));

let endpoint = matches[0];
let createdEndpointId = null;
let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

if (!endpoint) {
  const form = new URLSearchParams({
    url: endpointUrl,
    description: "Founder Above the Fold sandbox fulfilment",
  });
  for (const event of events) form.append("enabled_events[]", event);
  endpoint = await stripeRequest("/v1/webhook_endpoints", { method: "POST", body: form });
  createdEndpointId = endpoint.id;
  webhookSecret = endpoint.secret ?? "";
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: Stripe created an endpoint without returning its signing secret.");
  console.log(`PASS created Stripe sandbox endpoint ${endpoint.id}; secret withheld from output.`);
} else {
  const missingEvents = events.filter((event) => !endpoint.enabled_events.includes(event));
  assert.deepEqual(missingEvents, [], "BLOCKED: update the existing endpoint event drawer before fitting it.");
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: an existing endpoint secret cannot be retrieved; fit its current secret locally or rotate it deliberately.");
}

const slots = {
  STRIPE_MODE: "sandbox",
  STRIPE_SECRET_KEY: secretKey,
  STRIPE_WEBHOOK_SECRET: webhookSecret,
  STRIPE_PRICE_ID: offerPriceSlots.STRIPE_PRICE_MAC_LICENCE,
  ...offerPriceSlots,
  STRIPE_EXPECTED_UNIT_AMOUNT_CAD: process.env.STRIPE_EXPECTED_UNIT_AMOUNT_CAD ?? "19900",
  STRIPE_AUTOMATIC_TAX_ENABLED: "false",
  STRIPE_LIVE_APPROVED: "false",
  STRIPE_CHECKOUT_ENABLED: enableCheckout ? "true" : "false",
  LICENCE_DEVICE_HASH_SECRET: required("LICENCE_DEVICE_HASH_SECRET"),
  LICENCE_SIGNING_PRIVATE_KEY: required("LICENCE_SIGNING_PRIVATE_KEY"),
  LICENCE_SIGNING_PUBLIC_KEY: required("LICENCE_SIGNING_PUBLIC_KEY"),
};

try {
  for (const [name, value] of Object.entries(slots)) {
    execFileSync("vercel", ["env", "add", name, "production", "--force"], {
      cwd: root,
      input: `${value}\n`,
      stdio: ["pipe", "pipe", "pipe"],
    });
    console.log(`PASS fitted encrypted Vercel production slot ${name}.`);
  }
} catch (cause) {
  if (createdEndpointId) {
    await stripeRequest(`/v1/webhook_endpoints/${encodeURIComponent(createdEndpointId)}`, { method: "DELETE" });
    console.log(`ROLLBACK removed newly created endpoint ${createdEndpointId} after Vercel fitting failed.`);
  }
  throw cause;
}

console.log(`PASS sandbox cabinet fitted with checkout ${enableCheckout ? "enabled" : "disabled"}.`);
console.log("NEXT redeploy production so the encrypted slots enter the running build, then perform the genuine sandbox lifecycle.");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}

async function stripeRequest(urlPath, init = {}) {
  const response = await fetch(`https://api.stripe.com${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init.body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`BLOCKED: Stripe returned HTTP ${response.status}: ${result.error?.message ?? "inspect the provider cabinet"}.`);
  return result;
}
