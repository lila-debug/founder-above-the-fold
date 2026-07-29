import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const linkRoot = path.join(root, ".context", "stripe-staging-vercel");
const projectFile = path.join(linkRoot, ".vercel", "project.json");
const canonicalProjectId = "prj_6w4u0Tb8mCz57OrObk6VqM8ZDaJ7";
const canonicalProjectName = "founder-above-the-fold";
const expectedProjectName = required("STRIPE_STAGING_VERCEL_PROJECT");
const apply = process.env.APPLY_STRIPE_SANDBOX_WEBHOOK === "true";
const deploymentApproved = process.env.STAGING_DEPLOYMENT_APPROVED === "true";
const enableCheckout = process.env.ENABLE_STRIPE_SANDBOX_CHECKOUT === "true";
const provisioningKey = required("STRIPE_PROVISIONING_KEY");
const runtimeKey = required("STRIPE_SECRET_KEY");
const expectedAccountId = required("STRIPE_EXPECTED_ACCOUNT_ID");
const expectedCountry = required("STRIPE_EXPECTED_ACCOUNT_COUNTRY").toUpperCase();
const priceId = required("STRIPE_PRICE_FOUNDER_TRANSFORMATION");
const baseUrl = new URL(required("STRIPE_STAGING_BASE_URL"));
const endpointUrl = new URL("/api/webhooks/stripe", baseUrl).toString();
const events = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
];

assert.equal(expectedProjectName, "founder-above-the-fold-stripe-staging", "BLOCKED: the staging project name is fixed by the cabinet plan.");
assert.notEqual(expectedProjectName, canonicalProjectName, "BLOCKED: canonical Vercel project is forbidden.");
assert.match(provisioningKey, /^(sk|rk)_test_/, "BLOCKED: provisioning accepts only a Stripe test key.");
assert.match(runtimeKey, /^(sk|rk)_test_/, "BLOCKED: runtime accepts only a Stripe test key.");
assert.notEqual(provisioningKey, runtimeKey, "BLOCKED: runtime and provisioning Stripe keys must be separate.");
assert.match(expectedAccountId, /^acct_/, "BLOCKED: STRIPE_EXPECTED_ACCOUNT_ID must begin with acct_.");
assert.equal(expectedCountry, "US", "BLOCKED: this evidence-only staging cabinet must remain in the US sandbox.");
assert.match(priceId, /^price_/, "BLOCKED: the transformation price ID is invalid.");
assert.equal(baseUrl.protocol, "https:", "BLOCKED: the deployed webhook socket must use HTTPS.");

const project = JSON.parse(await readFile(projectFile, "utf8"));
assert.equal(project.projectName, expectedProjectName, "BLOCKED: .context Vercel linkage points to the wrong project.");
assert.notEqual(project.projectId, canonicalProjectId, "BLOCKED: canonical Vercel project ID is forbidden.");
assert.notEqual(project.projectName, canonicalProjectName, "BLOCKED: canonical Vercel project name is forbidden.");

const account = await stripeRequest("/v1/account");
assert.equal(account.id, expectedAccountId, "BLOCKED: the provisioning key belongs to a different Stripe account.");
assert.equal(account.country, expectedCountry, "BLOCKED: the provisioning key belongs to the wrong country cabinet.");

const price = await stripeRequest(`/v1/prices/${encodeURIComponent(priceId)}?expand%5B%5D=product`);
assert.equal(price.livemode, false, "BLOCKED: the transformation price is live.");
assert.equal(price.active, true, "BLOCKED: the transformation price is inactive.");
assert.equal(price.currency, "cad", "BLOCKED: the transformation price must be CAD.");
assert.equal(price.unit_amount, 750000, "BLOCKED: the transformation price must be CA$7,500.");
assert.equal(price.type, "one_time", "BLOCKED: the transformation price must be one-time.");
assert.equal(price.product?.metadata?.founder_offer_key, "founder_transformation", "BLOCKED: the price product is not the approved offer.");

const routeProbe = await fetch(endpointUrl, { method: "POST" });
const routeReady = routeProbe.status === 400;
console.log(`${routeReady ? "PASS" : "BLOCKED"} deployed webhook socket: HTTP ${routeProbe.status} ${endpointUrl}`);

const listed = await stripeRequest("/v1/webhook_endpoints?limit=100");
const matches = listed.data.filter((item) => item.url === endpointUrl && item.status !== "disabled");
console.log(`AUDIT matching enabled Stripe sandbox endpoints: ${matches.length}.`);
for (const endpoint of matches) {
  const exactDrawer = sameMembers(endpoint.enabled_events, events);
  console.log(`${exactDrawer ? "PASS" : "BLOCKED"} endpoint ${endpoint.id}: ${exactDrawer ? "exact event drawer" : "event drawer differs"}.`);
}

if (!apply) {
  console.log("DRY RUN no Stripe or Vercel state changed.");
  if (!routeReady || matches.length !== 1 || !sameMembers(matches[0]?.enabled_events ?? [], events)) process.exitCode = 1;
  process.exit();
}

assert.equal(deploymentApproved, true, "BLOCKED: set STAGING_DEPLOYMENT_APPROVED=true only for the dedicated staging project.");
assert.equal(routeReady, true, "BLOCKED: deploy the webhook route before creating its Stripe endpoint.");
assert.ok(matches.length <= 1, "BLOCKED: multiple matching endpoints require manual inspection.");

let endpoint = matches[0];
let createdEndpointId = null;
let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";

if (!endpoint) {
  const form = new URLSearchParams({
    url: endpointUrl,
    description: "Founder Above the Fold US native sandbox staging fulfilment",
  });
  for (const event of events) form.append("enabled_events[]", event);
  endpoint = await stripeRequest("/v1/webhook_endpoints", { method: "POST", body: form });
  createdEndpointId = endpoint.id;
  webhookSecret = endpoint.secret ?? "";
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: Stripe created an endpoint without returning its signing secret.");
  console.log(`PASS created Stripe sandbox endpoint ${endpoint.id}; secret withheld from output.`);
} else {
  assert.equal(sameMembers(endpoint.enabled_events, events), true, "BLOCKED: the existing endpoint event drawer is not exact.");
  assert.match(webhookSecret, /^whsec_/, "BLOCKED: fit the existing endpoint secret locally; Stripe cannot reveal it again.");
}

const slots = {
  STRIPE_MODE: "sandbox",
  STRIPE_SECRET_KEY: runtimeKey,
  STRIPE_WEBHOOK_SECRET: webhookSecret,
  STRIPE_PRICE_FOUNDER_TRANSFORMATION: priceId,
  STRIPE_EXPECTED_ACCOUNT_ID: expectedAccountId,
  STRIPE_EXPECTED_ACCOUNT_COUNTRY: expectedCountry,
  STRIPE_STAGING_BASE_URL: baseUrl.origin,
  STRIPE_STAGING_VERCEL_PROJECT: expectedProjectName,
  NEXT_PUBLIC_APP_URL: baseUrl.origin,
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
      cwd: linkRoot,
      input: `${value}\n`,
      stdio: ["pipe", "pipe", "pipe"],
    });
    console.log(`PASS fitted encrypted staging Vercel slot ${name}.`);
  }
} catch (cause) {
  if (createdEndpointId) {
    await stripeRequest(`/v1/webhook_endpoints/${encodeURIComponent(createdEndpointId)}`, { method: "DELETE" });
    console.log(`ROLLBACK removed newly created endpoint ${createdEndpointId} after staging Vercel fitting failed.`);
  }
  throw cause;
}

console.log(`PASS staging cabinet fitted with checkout ${enableCheckout ? "enabled" : "disabled"}.`);

function sameMembers(left, right) {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}

async function stripeRequest(urlPath, init = {}) {
  const response = await fetch(`https://api.stripe.com${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${provisioningKey}`,
      ...(init.body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`BLOCKED: Stripe returned HTTP ${response.status}: ${result.error?.message ?? "inspect the provider cabinet"}.`);
  return result;
}
