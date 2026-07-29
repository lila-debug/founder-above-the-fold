import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const linkRoot = path.join(root, ".context", "stripe-staging-vercel");
const projectFile = path.join(linkRoot, ".vercel", "project.json");
const expectedName = required("STRIPE_STAGING_VERCEL_PROJECT");
const baseUrl = new URL(required("STRIPE_STAGING_BASE_URL"));
const approved = process.env.STAGING_DEPLOYMENT_APPROVED === "true";
const canonicalId = "prj_6w4u0Tb8mCz57OrObk6VqM8ZDaJ7";

assert.equal(approved, true, "BLOCKED: set STAGING_DEPLOYMENT_APPROVED=true only for the dedicated staging deployment.");
assert.equal(expectedName, "founder-above-the-fold-stripe-staging", "BLOCKED: staging project name is fixed.");
assert.equal(baseUrl.protocol, "https:", "BLOCKED: staging deployment requires HTTPS.");

const project = JSON.parse(await readFile(projectFile, "utf8"));
assert.equal(project.projectName, expectedName, "BLOCKED: .context Vercel linkage points to the wrong project.");
assert.notEqual(project.projectId, canonicalId, "BLOCKED: the canonical Vercel project ID is forbidden.");
assert.notEqual(project.projectName, "founder-above-the-fold", "BLOCKED: the canonical Vercel project is forbidden.");

execFileSync("vercel", [root, "--prod", "--yes", "--project", expectedName], {
  cwd: linkRoot,
  env: process.env,
  stdio: "inherit",
});

const [webhook, pricing] = await Promise.all([
  fetch(new URL("/api/webhooks/stripe", baseUrl), { method: "POST" }),
  fetch(new URL("/pricing", baseUrl)),
]);
assert.equal(webhook.status, 400, "BLOCKED: unsigned staging webhook probe must return HTTP 400.");
assert.equal(pricing.status, 200, "BLOCKED: staging pricing route is unavailable.");
console.log(`PASS dedicated staging deployment answers at ${baseUrl.origin}.`);
console.log(`PASS unsigned webhook probe returned HTTP ${webhook.status}.`);
console.log(`AUDIT checkout fuse was deployed as ${process.env.STRIPE_CHECKOUT_ENABLED === "true" ? "enabled" : "disabled"}.`);

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`BLOCKED: ${name} is missing.`);
  return value;
}
