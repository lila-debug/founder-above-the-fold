import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const envFile = path.join(root, "apps", "web", ".env.local");
const apply = process.env.APPLY_STRIPE_SANDBOX_CATALOGUE === "true";
const approved = process.env.STRIPE_CATALOGUE_APPROVED === "true";
const secretKey = required("STRIPE_SECRET_KEY");
const offers = [
  {
    key: "mac_licence",
    name: "Founder Above the Fold — Private macOS Licence",
    description: "One owner-controlled macOS licence for the current major version.",
    amount: 19900,
    billing: "one_time",
    env: "STRIPE_PRICE_MAC_LICENCE",
  },
  {
    key: "profile_setup",
    name: "Founder Above the Fold — LinkedIn Profile Setup Concierge",
    description: "Headline, About, experience, featured-link plan, content pillars and first ten posts.",
    amount: 49900,
    billing: "one_time",
    env: "STRIPE_PRICE_PROFILE_SETUP",
  },
  {
    key: "founder_os",
    name: "Founder Above the Fold — Founder Profile OS",
    description: "The passwordless LinkedIn operating system for founders who hate doing LinkedIn.",
    amount: 6900,
    billing: "monthly",
    env: "STRIPE_PRICE_FOUNDER_OS",
  },
  {
    key: "visibility_ops",
    name: "Founder Above the Fold — Done-With-You Founder Visibility Ops",
    description: "Limited-capacity founder positioning, drafting, voice review and publishing support.",
    amount: 75000,
    billing: "monthly",
    env: "STRIPE_PRICE_VISIBILITY_OPS",
  },
];

assert.match(secretKey, /^(sk|rk)_test_/, "BLOCKED: catalogue fitting accepts only a Stripe test key.");
if (apply) assert.equal(approved, true, "BLOCKED: set STRIPE_CATALOGUE_APPROVED=true only after the owner approves the exact four prices.");

const account = await stripeRequest("/v1/account");
assert.equal(account.charges_enabled, false, "BLOCKED: this jig is for the sandbox cabinet, not a charge-enabled live account.");
const products = await stripeList("/v1/products", { active: "true" });
const prices = await stripeList("/v1/prices", { active: "true", type: "one_time" });
const recurringPrices = await stripeList("/v1/prices", { active: "true", type: "recurring" });
prices.push(...recurringPrices);

const fitted = {};
for (const offer of offers) {
  const productMatches = products.filter((product) =>
    product.metadata?.founder_offer_key === offer.key
    || (offer.key === "mac_licence" && product.name === "Founder Above the Fold"),
  );
  assert.ok(productMatches.length <= 1, `BLOCKED: ${offer.key} has ${productMatches.length} matching active products.`);
  let product = productMatches[0];
  if (!product) {
    console.log(`${apply ? "FIT" : "MISSING"} product: ${offer.name}.`);
    if (apply) product = await createProduct(offer);
  } else {
    console.log(`PASS product: ${offer.name} reuses ${product.id}.`);
  }

  const priceMatches = product
    ? prices.filter((price) => price.product === product.id && priceMatchesOffer(price, offer))
    : [];
  assert.ok(priceMatches.length <= 1, `BLOCKED: ${offer.key} has ${priceMatches.length} matching active prices.`);
  let price = priceMatches[0];
  if (!price) {
    console.log(`${apply ? "FIT" : "MISSING"} price: ${formatOffer(offer)}.`);
    if (apply) {
      assert.ok(product, `BLOCKED: ${offer.key} product was not created.`);
      price = await createPrice(product.id, offer);
    }
  } else {
    console.log(`PASS price: ${formatOffer(offer)} reuses ${price.id}.`);
  }
  if (price) fitted[offer.env] = price.id;
}

if (!apply) {
  console.log(`DRY RUN ${Object.keys(fitted).length}/4 exact sandbox prices exist; no Stripe or local state changed.`);
  process.exit();
}

assert.equal(Object.keys(fitted).length, offers.length, "BLOCKED: not every offer returned a price ID.");
await fitLocalEnv(envFile, {
  STRIPE_PRICE_ID: fitted.STRIPE_PRICE_MAC_LICENCE,
  ...fitted,
});
console.log("PASS four non-secret Stripe price IDs fitted to the ignored local environment panel.");
console.log("NEXT run npm run check:stripe, then fit the deployed webhook socket before enabling sandbox checkout.");

function priceMatchesOffer(price, offer) {
  if (price.currency !== "cad" || price.unit_amount !== offer.amount) return false;
  if (offer.billing === "one_time") return price.type === "one_time";
  return price.type === "recurring" && price.recurring?.interval === "month" && price.recurring?.interval_count === 1;
}

async function createProduct(offer) {
  return stripeRequest("/v1/products", {
    method: "POST",
    body: new URLSearchParams({
      name: offer.name,
      description: offer.description,
      "metadata[founder_offer_key]": offer.key,
      "metadata[product]": "founder_above_the_fold",
    }),
    idempotencyKey: `founder-product-${offer.key}-v1`,
  });
}

async function createPrice(productId, offer) {
  const body = new URLSearchParams({
    product: productId,
    currency: "cad",
    unit_amount: String(offer.amount),
    "metadata[founder_offer_key]": offer.key,
  });
  if (offer.billing === "monthly") body.set("recurring[interval]", "month");
  return stripeRequest("/v1/prices", {
    method: "POST",
    body,
    idempotencyKey: `founder-price-${offer.key}-cad-${offer.amount}-v1`,
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
      Authorization: `Bearer ${secretKey}`,
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

function formatOffer(offer) {
  return `${offer.name} · CAD ${(offer.amount / 100).toFixed(2)} ${offer.billing === "monthly" ? "per month" : "once"}`;
}
