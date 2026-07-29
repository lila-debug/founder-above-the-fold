import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  catalogue: await readFile("apps/web/src/lib/commerce-offers.ts", "utf8"),
  stripe: await readFile("scripts/provision-stripe-sandbox-catalogue.mjs", "utf8"),
  terms: await readFile("apps/web/src/app/terms/page.tsx", "utf8"),
  launch: await readFile("docs/24-product-hunt-launch-kit.md", "utf8"),
  responses: await readFile("docs/25-product-hunt-response-plan.md", "utf8"),
};

for (const [label, text] of Object.entries(files)) {
  assert.match(text, /founder_transformation/, `BLOCKED: ${label} lost the transformation offer key.`);
  assert.match(text, /7,500|750000/, `BLOCKED: ${label} lost the CA$7,500 price.`);
  for (const retired of ["mac_licence", "profile_setup", "founder_os", "visibility_ops"]) {
    assert.doesNotMatch(text, new RegExp(`key:\\s*[\"']${retired}[\"']`), `BLOCKED: ${label} restored retired offer ${retired}.`);
  }
}
console.log("PASS public catalogue, Stripe jig and terms align to one CA$7,500 transformation.");
