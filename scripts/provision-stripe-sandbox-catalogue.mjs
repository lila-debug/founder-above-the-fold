import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const envFile = path.resolve(process.env.STRIPE_ENV_FILE ?? path.join(root, "apps", "web", ".env.stripe-sandbox.local"));
const apply = process.env.APPLY_STRIPE_SANDBOX_CATALOGUE === "true";
const approved = process.env.STRIPE_CATALOGUE_APPROVED === "true";
const provisioningKey = required("STRIPE_PROVISIONING_KEY");
const expectedAccountId = required("STRIPE_EXPECTED_ACCOUNT_ID");
const expectedCountry = required("STRIPE_EXPECTED_ACCOUNT_COUNTRY").toUpperCase();
const offer = {
  key: "founder_transformation",
  name: "Founder Above the Fold — Founder Transformation",
  description: "Founder positioning, profile assembly, launch content, private operating workbench and handover.",
  amount: 750000,
  env: "STRIPE_PRICE_FOUNDER_TRANSFORMATION",
};

assert.match(provisioningKey, /^(sk|rk)_test_/, "BLOCKED: catalogue fitting accepts only a Stripe test provisioning key.");
assert.match(expectedAccountId, /^acct_/, "BLOCKED: STRIPE_EXPECTED_ACCOUNT_ID must begin with acct_.");
assert.equal(expectedCountry, "US", "BLOCKED: the non-promotable staging cabinet must be a US Stripe sandbox.");
if (apply) {
  assert.equal(approved, true, "BLOCKED: set STRIPE_CATALOGUE_APPROVED=true only after approval of the exact CA$7,500 price.");
}

const account = await stripeRequest("/v1/account");
assert.equal(account.id, expectedAccountId, "BLOCKED: the provisioning key belongs to a different Stripe account.");
assert.equal(account.country, expectedCountry, "BLOCKED: the provisioning key belongs to the wrong country cabinet.");

const products = await stripeList("/v1/products", { active: "true" });
const prices = await stripeList("/v1/prices", { active: "true", type: "one_time" });
const productMatches = products.filter((product) => product.metadata?.founder_offer_key === offer.key);
assert.equal(products.length, productMatches.length, "BLOCKED: the isolated sandbox contains another active product.");
assert.ok(productMatches.length <= 1, `BLOCKED: ${offer.key} has ${productMatches.length} matching active products.`);

let product = productMatches[0];
if (!product) {
  console.log(`${apply ? "FIT" : "MISSING"} product: ${offer.name}.`);
  if (apply) product = await createProduct();
} else {
  assert.equal(product.name, offer.name, "BLOCKED: the labelled transformation product has an unexpected name.");
  console.log(`PASS product: ${offer.name} reuses ${product.id}.`);
}

const labelledPrices = product
  ? prices.filter((price) => price.product === product.id && price.metadata?.founder_offer_key === offer.key)
  : [];
assert.equal(prices.length, labelledPrices.length, "BLOCKED: the isolated sandbox contains another active one-time price.");
const recurringPrices = await stripeList("/v1/prices", { active: "true", type: "recurring" });
assert.equal(recurringPrices.length, 0, "BLOCKED: the one-offer staging sandbox must not contain recurring prices.");
const exactPrices = labelledPrices.filter(priceMatchesOffer);
assert.equal(labelledPrices.length, exactPrices.length, "BLOCKED: an active labelled price does not match CA$7,500 once.");
assert.ok(exactPrices.length <= 1, `BLOCKED: ${offer.key} has ${exactPrices.length} matching active prices.`);

let price = exactPrices[0];
if (!price) {
  console.log(`${apply ? "FIT" : "MISSING"} price: CAD 7,500.00 once.`);
  if (apply) {
    assert.ok(product, "BLOCKED: the transformation product was not created.");
    price = await createPrice(product.id);
  }
} else {
  console.log(`PASS price: CAD 7,500.00 once reuses ${price.id}.`);
}

if (!apply) {
  console.log(`DRY RUN ${price ? "1/1 exact price exists" : "0/1 exact prices exist"}; no Stripe or local state changed.`);
  if (!price) process.exitCode = 1;
  process.exit();
}

assert.ok(price, "BLOCKED: the approved transformation price was not returned.");
await fitLocalEnv(envFile, { [offer.env]: price.id });
console.log(`PASS one non-secret Stripe price ID fitted to ${path.relative(root, envFile)}.`);
console.log("NEXT run npm run staging:stripe:preflight before fitting the webhook socket.");

function priceMatchesOffer(candidate) {
  return candidate.currency === "cad"
    && candidate.unit_amount === offer.amount
    && candidate.type === "one_time";
}

async function createProduct() {
  return stripeRequest("/v1/products", {
    method: "POST",
    body: new URLSearchParams({
      name: offer.name,
      description: offer.description,
      "metadata[founder_offer_key]": offer.key,
      "metadata[product]": "founder_above_the_fold",
      "metadata[cabinet]": "stripe_native_us_staging",
    }),
    idempotencyKey: "founder-product-founder-transformation-v1",
  });
}

async function createPrice(productId) {
  return stripeRequest("/v1/prices", {
    method: "POST",
    body: new URLSearchParams({
      product: productId,
      currency: "cad",
      unit_amount: String(offer.amount),
      "metadata[founder_offer_key]": offer.key,
      "metadata[cabinet]": "stripe_native_us_staging",
    }),
    idempotencyKey: "founder-price-founder-transformation-cad-750000-v1",
  });
}

async function stripeList(urlPath, query) {
  const data = [];
  let startingAfter = "";
  do {
    const params = new URLSearchParams({ ...query, limit: "100" });
    if (startingAfter) params.set("starting_after", startingAfter);
    const page = await stripeRequest(`${urlPath}?${params}`);
    data.push(...page.data);
    startingAfter = page.has_more ? page.data.at(-1)?.id ?? "" : "";
  } while (startingAfter);
  return data;
}

async function stripeRequest(urlPath, init = {}) {
  const response = await fetch(`https://api.stripe.com${urlPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${provisioningKey}`,
      ...(init.body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`BLOCKED: Stripe returned HTTP ${response.status}: ${result.error?.message ?? "inspect the sandbox cabinet"}.`);
  return result;
}

async function fitLocalEnv(file, values) {
  let text = "";
  try {
    text = await readFile(file, "utf8");
  } catch (cause) {
    if (cause?.code !== "ENOENT") throw cause;
  }
  const lines = text ? text.replace(/\n?$/, "\n").split("\n") : [];
  for (const [name, value] of Object.entries(values)) {
    const index = lines.findIndex((line) => line.startsWith(`${name}=`));
    const fittedLine = `${name}=${value}`;
    if (index >= 0) lines[index] = fittedLine;
    else lines.push(fittedLine);
  }
  await writeFile(file, `${lines.filter(Boolean).join("\n")}\n`, { mode: 0o600 });
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}
