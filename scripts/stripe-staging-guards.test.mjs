import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const files = {
  preflight: await readFile(new URL("./stripe-sandbox-preflight.mjs", import.meta.url), "utf8"),
  catalogue: await readFile(new URL("./provision-stripe-sandbox-catalogue.mjs", import.meta.url), "utf8"),
  webhook: await readFile(new URL("./provision-stripe-sandbox-webhook.mjs", import.meta.url), "utf8"),
  deploy: await readFile(new URL("./deploy-stripe-staging.mjs", import.meta.url), "utf8"),
};

test("every Stripe staging jig binds account identity, country and test keys", () => {
  for (const [name, source] of Object.entries({
    preflight: files.preflight,
    catalogue: files.catalogue,
    webhook: files.webhook,
  })) {
    assert.match(source, /STRIPE_EXPECTED_ACCOUNT_ID/, `${name} lost account binding`);
    assert.match(source, /STRIPE_EXPECTED_ACCOUNT_COUNTRY/, `${name} lost country binding`);
    assert.match(source, /_test_/, `${name} lost test-key binding`);
  }
});

test("catalogue is one CA$7,500 transformation and webhook omits subscriptions", () => {
  assert.match(files.catalogue, /founder_transformation/);
  assert.match(files.catalogue, /750000/);
  for (const retired of ["mac_licence", "profile_setup", "founder_os", "visibility_ops"]) {
    assert.doesNotMatch(files.catalogue, new RegExp(`key:\\s*[\"']${retired}[\"']`));
  }
  assert.doesNotMatch(files.webhook, /customer\.subscription|invoice\.(paid|payment_failed)/);
});

test("Vercel jigs reject the canonical project and require staging approval", () => {
  for (const source of [files.webhook, files.deploy]) {
    assert.match(source, /founder-above-the-fold-stripe-staging/);
    assert.match(source, /prj_6w4u0Tb8mCz57OrObk6VqM8ZDaJ7/);
    assert.match(source, /STAGING_DEPLOYMENT_APPROVED/);
  }
});
