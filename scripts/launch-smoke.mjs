import assert from "node:assert/strict";

const baseUrl = (process.env.LAUNCH_SMOKE_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const results = [];

await expectStatus("public landing", "/", 200);
await expectStatus("privacy panel", "/privacy", 200);
await expectStatus("cookie panel", "/cookies", 200);
await expectStatus("health panel", "/api/mcp/health", 200);
await expectStatus("draft read owner lock", "/api/posts", 401);

await expectStatus("dashboard owner redirect", "/dashboard", 307, {
  redirect: "manual",
});
await expectStatus("draft write owner lock", "/api/posts", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ body: "Launch smoke draft" }),
});
await expectStatus("profile write owner lock", "/api/profile-copy", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ field: "headline", content: "Launch smoke" }),
});
await expectStatus("cron lock", "/api/cron/publish-due", 401, {
  method: "POST",
});

if (process.env.LAUNCH_SMOKE_CRON_SECRET) {
  await expectStatus("authorised cron truth state", "/api/cron/publish-due", 501, {
    method: "POST",
    headers: { "x-cron-secret": process.env.LAUNCH_SMOKE_CRON_SECRET },
  });
}
await expectStatus("invalid magic-link input", "/api/auth/magic-link", 400, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "not-an-email" }),
});

if (process.env.LAUNCH_SMOKE_EXPECT_AUTH_SETUP_LOCK === "true") {
  await expectStatus("production development-auth lock", "/api/auth/magic-link", 503, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "owner@example.test" }),
  });
}

const healthResponse = await fetch(`${baseUrl}/api/mcp/health`, {
  redirect: "manual",
});
const health = await healthResponse.json();
assert.equal(health.safety.scraping, false);
assert.equal(health.safety.browserAutomation, false);
assert.equal(health.safety.automatedMessages, false);
assert.equal(health.safety.officialApiPublishing, false);
assert.equal(health.capabilities.queueScheduling, "not_implemented");
assert.equal(health.capabilities.officialApiPublishing, "not_implemented");
assert.equal(healthResponse.headers.get("cache-control"), "no-store");
assert.doesNotMatch(
  JSON.stringify(health),
  /Bearer\s|postgres:\/\/|replace-with|BEGIN [A-Z ]*PRIVATE KEY/i,
);
results.push("health is truthful, uncached, and redacted");

const linkedInResponse = await fetch(`${baseUrl}/api/linkedin/status`, {
  redirect: "manual",
});
assert.equal(linkedInResponse.status, 200);
const linkedInStatus = await linkedInResponse.json();
assert.equal(linkedInStatus.state, "setup_required");
assert.equal(linkedInStatus.ownerAuthenticated, false);
assert.equal(linkedInStatus.canConnect, false);
assert.equal(hasTokenShapedKey(linkedInStatus), false);
results.push("LinkedIn setup response exposes no token-shaped fields");

const landingResponse = await fetch(`${baseUrl}/`, { redirect: "manual" });
const landingHtml = await landingResponse.text();
assert.match(landingHtml, /Private beta build/);
assert.match(landingHtml, /Publishing stays locked until setup passes/);
assert.match(landingHtml, /href="\/privacy"/);
assert.match(landingHtml, /href="\/cookies"/);
assert.match(
  landingResponse.headers.get("content-security-policy") ?? "",
  /frame-ancestors 'none'/,
);
assert.equal(landingResponse.headers.get("x-frame-options"), "DENY");
assert.equal(landingResponse.headers.get("x-content-type-options"), "nosniff");
results.push("public preview labels, links, and security headers are fitted");

for (const result of results) {
  console.log(`PASS ${result}`);
}

console.log(`PASS ${results.length} launch assemblies inspected at ${baseUrl}`);

async function expectStatus(label, path, expected, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });

  assert.equal(response.status, expected, `${label}: expected ${expected}, got ${response.status}`);
  results.push(`${label} returned ${expected}`);
}

function hasTokenShapedKey(value) {
  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(([key, child]) => {
    if (/token|secret|ciphertext|authorization/i.test(key)) return true;
    return hasTokenShapedKey(child);
  });
}
