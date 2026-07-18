import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  catalogue: await readFile("apps/web/src/lib/commerce-offers.ts", "utf8"),
  launch: await readFile("docs/24-product-hunt-launch-kit.md", "utf8"),
  responses: await readFile("docs/25-product-hunt-response-plan.md", "utf8"),
  stripe: await readFile("scripts/provision-stripe-sandbox-catalogue.mjs", "utf8"),
};

const offers = [
  { amount: "199", cadence: "once", key: "mac_licence" },
  { amount: "499", cadence: "once", key: "profile_setup" },
  { amount: "69", cadence: "month", key: "founder_os" },
  { amount: "750", cadence: "month", key: "visibility_ops" },
];

for (const offer of offers) {
  assert.match(files.catalogue, new RegExp(`${offer.key}[\\s\\S]*?CA\\$${offer.amount}`), `BLOCKED: catalogue lost ${offer.key} price.`);
  assert.match(files.stripe, new RegExp(`${offer.key}[\\s\\S]*?amount: ${offer.amount}00`), `BLOCKED: Stripe jig lost ${offer.key} amount.`);
  assert.match(files.launch, new RegExp(`CA\\$${offer.amount}`), `BLOCKED: launch kit lost CA$${offer.amount}.`);
  assert.match(files.responses, new RegExp(`CA\\$${offer.amount}`), `BLOCKED: response board lost CA$${offer.amount}.`);
}
assert.match(files.catalogue, /Five launch seats only/);
assert.match(files.launch, /five service seats/i);
assert.match(files.responses, /five seats/i);
console.log("PASS four Stripe offers, Product Hunt copy, response board and five-seat service clamp are aligned.");
