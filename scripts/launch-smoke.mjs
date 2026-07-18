import assert from "node:assert/strict";

const baseUrl = (process.env.LAUNCH_SMOKE_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const results = [];

await expectStatus("public landing", "/", 200);
await expectStatus("privacy panel", "/privacy", 200);
await expectStatus("cookie panel", "/cookies", 200);
await expectStatus("terms panel", "/terms", 200);
await expectStatus("product showroom", "/product", 200);
await expectStatus("pricing preview", "/pricing", 200);
await expectStatus("private beta waitlist", "/waitlist", 200);
await expectStatus("public no-write demo", "/try", 200);
await expectStatus("interactive build manual", "/manual", 200);
await expectStatus("health panel", "/api/mcp/health", 200);
await expectStatus("draft read owner lock", "/api/posts", 401);
await expectStatus("mobile session owner lock", "/api/mobile/session", 401);
await expectStatus("mobile LinkedIn start owner lock", "/api/mobile/linkedin/start", 401, {
  method: "POST",
});
await expectStatus("mobile logout fastener validation", "/api/mobile/auth/logout", 400, {
  method: "POST",
});

await expectStatus("dashboard owner redirect", "/dashboard", 307, {
  redirect: "manual",
});
await expectRedirect(
  "LinkedIn start owner lock",
  "/api/auth/linkedin/start",
  "/?linkedin=owner-sign-in-required#command-centre",
);
await expectLinkedInCallbackRedirect(
  "LinkedIn callback missing-key return",
  "/api/auth/linkedin/callback",
);
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
await expectStatus("template drawer owner lock", "/api/templates", 401);
await expectStatus("analytics owner lock", "/api/analytics/posts", 401);
await expectStatus("analytics refresh owner lock", "/api/analytics/refresh", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
await expectStatus("LinkedIn disconnect owner lock", "/api/auth/linkedin/disconnect", 401, {
  method: "POST",
});
await expectStatus("owner export lock", "/api/owner/export", 401);
await expectStatus("owner deletion lock", "/api/owner/delete", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ confirmation: "DELETE MY FOUNDER WORKSPACE" }),
});
await expectStatus("cron lock", "/api/cron/publish-due", 401, {
  method: "POST",
});
await expectStatus("analytics cron lock", "/api/cron/sync-analytics", 401, {
  method: "POST",
});
await expectStatus("Stripe checkout fuse", "/api/commerce/stripe/checkout", 503, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "launch-smoke@example.test", termsAccepted: true, offerKey: "mac_licence" }),
});
await expectStatus("Stripe webhook signature clamp", "/api/webhooks/stripe", 400, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
await expectStatus("live Checkout reference refusal", "/api/commerce/stripe/receipt?session_id=cs_live_never_trust_123456", 400);

if (process.env.LAUNCH_SMOKE_CRON_SECRET) {
  await expectStatus("authorised publishing conveyor", "/api/cron/publish-due", 200, {
    method: "POST",
    headers: { "x-cron-secret": process.env.LAUNCH_SMOKE_CRON_SECRET },
  });
}
await expectStatus("invalid magic-link input", "/api/auth/magic-link", 400, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "not-an-email" }),
});
await expectStatus("invalid mobile magic-link input", "/api/mobile/auth/magic-link", 400, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "not-an-email" }),
});

if (process.env.LAUNCH_SMOKE_EXPECT_AUTH_SETUP_LOCK === "true") {
  await expectOneOfStatus("production auth setup lock", "/api/auth/magic-link", [403, 503], {
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
assert.equal(health.safety.officialApiPublishing, true);
assert.equal(
  health.capabilities.queueScheduling,
  health.database.ok ? "available" : "setup_required",
);
assert.ok(["available", "setup_required"].includes(health.capabilities.mobileAuth));
assert.equal(
  health.capabilities.templateLibrary,
  health.database.ok ? "available" : "setup_required",
);
assert.ok(
  ["available", "permission_required", "connection_required", "setup_required"].includes(
    health.capabilities.analytics,
  ),
);
assert.ok(
  ["verified", "configured_not_proved", "setup_required"].includes(
    health.proofs.ownerSignIn,
  ),
);
assert.ok(["verified", "not_proved"].includes(health.proofs.linkedinOAuth));
assert.ok(["verified", "not_proved"].includes(health.proofs.officialTextPost));
assert.ok(
  ["configured_browser_proof_required", "setup_required"].includes(
    health.proofs.consent,
  ),
);
assert.ok(
  ["configured_confirmation_proof_required", "setup_required"].includes(
    health.proofs.waitlist,
  ),
);
assert.ok(
  ["available", "connection_required", "setup_required"].includes(
    health.capabilities.officialApiPublishing,
  ),
);
assert.ok(
  ["configured_test_checkout", "configured_safely_disabled", "live_key_blocked", "setup_required"].includes(
    health.capabilities.stripeSandbox,
  ),
);
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
assert.ok(
  ["setup_required", "not_connected"].includes(linkedInStatus.state),
  `LinkedIn status should remain locked, got ${linkedInStatus.state}`,
);
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
assert.match(landingHtml, /href="\/waitlist"/);
assert.match(
  landingResponse.headers.get("content-security-policy") ?? "",
  /frame-ancestors 'none'/,
);
assert.equal(landingResponse.headers.get("x-frame-options"), "DENY");
assert.equal(landingResponse.headers.get("x-content-type-options"), "nosniff");
results.push("public preview labels, links, and security headers are fitted");

const waitlistResponse = await fetch(`${baseUrl}/waitlist`, { redirect: "manual" });
const waitlistHtml = await waitlistResponse.text();
assert.match(waitlistHtml, /Join the first fitting/);
assert.match(waitlistHtml, /privacy panel/);
assert.match(waitlistHtml, /No scraped contacts/);
assert.match(
  waitlistResponse.headers.get("content-security-policy") ?? "",
  /form-action 'self' https:\/\/waitlister\.me/,
);
results.push("waitlist route, consent copy, safety boundary, and form socket are fitted");

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

async function expectOneOfStatus(label, path, expectedStatuses, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });

  assert.ok(
    expectedStatuses.includes(response.status),
    `${label}: expected one of ${expectedStatuses.join(", ")}, got ${response.status}`,
  );
  results.push(`${label} returned ${response.status}`);
}

async function expectRedirect(label, path, expectedPath) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  assert.equal(response.status, 307, `${label}: expected 307, got ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, `${label}: redirect location is missing`);
  const redirectUrl = new URL(location, baseUrl);
  assert.equal(
    `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`,
    expectedPath,
    `${label}: wrong redirect target`,
  );
  results.push(`${label} returned to its labelled socket`);
}

async function expectLinkedInCallbackRedirect(label, path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  assert.equal(response.status, 307, `${label}: expected 307, got ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, `${label}: redirect location is missing`);
  const redirectUrl = new URL(location, baseUrl);
  assert.equal(redirectUrl.pathname, "/", `${label}: wrong return panel`);
  assert.equal(redirectUrl.hash, "#command-centre", `${label}: command-centre anchor missing`);
  assert.ok(
    ["missing-code", "owner-email-missing"].includes(
      redirectUrl.searchParams.get("linkedin") ?? "",
    ),
    `${label}: unexpected callback state`,
  );
  results.push(`${label} returned to its labelled socket`);
}

function hasTokenShapedKey(value) {
  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(([key, child]) => {
    if (/token|secret|ciphertext|authorization/i.test(key)) return true;
    return hasTokenShapedKey(child);
  });
}
