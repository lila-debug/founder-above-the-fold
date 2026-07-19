import assert from "node:assert/strict";

const baseUrl = (process.env.PRODUCTION_LAUNCH_BASE_URL ?? "https://www.founderaccount.com").replace(/\/$/, "");
const allowIncomplete = process.env.ALLOW_INCOMPLETE === "true";
const checks = [];

const [home, demo, waitlist, waitlistValidation, cookies, thumbnail, galleryHero, stripeWebhook, healthResponse, linkedinResponse, mobileSession] = await Promise.all([
  get("/"),
  get("/try"),
  get("/waitlist"),
  request("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }),
  get("/cookies"),
  get("/product-hunt/gallery/thumbnail-240.png"),
  get("/product-hunt/gallery/01-build-the-week.png"),
  request("/api/webhooks/stripe", { method: "POST" }),
  get("/api/mcp/health"),
  get("/api/linkedin/status"),
  get("/api/mobile/session"),
]);

const health = parseJson(healthResponse, "health");
const linkedin = parseJson(linkedinResponse, "LinkedIn status");

record("primary public route", home.status === 200, `HTTP ${home.status}`);
record("immediate-access demo", demo.status === 200, `HTTP ${demo.status}`);
record("private-beta intake", waitlist.status === 200, `HTTP ${waitlist.status}`);
record("Product Hunt thumbnail socket", thumbnail.status === 200 && thumbnail.contentType.startsWith("image/png"), `HTTP ${thumbnail.status}, ${thumbnail.contentType || "no content type"}`);
record("Product Hunt gallery socket", galleryHero.status === 200 && galleryHero.contentType.startsWith("image/png"), `HTTP ${galleryHero.status}, ${galleryHero.contentType || "no content type"}`);
record("Stripe webhook route", stripeWebhook.status === 400, `unsigned probe HTTP ${stripeWebhook.status}`);
record("database", health.database?.ok === true, health.database?.status ?? "unknown");
record("mobile auth migration", health.capabilities?.mobileAuth === "available", health.capabilities?.mobileAuth ?? "unknown");
record("mobile session route", mobileSession.status === 401, `HTTP ${mobileSession.status}`);
record(
  "production owner sign-in configuration",
  health.env?.authProvider === "resend" && health.env?.authReady === true,
  `provider=${health.env?.authProvider ?? "unknown"}, ready=${String(health.env?.authReady)}`,
);
record(
  "audited owner sign-in proof",
  health.proofs?.ownerSignIn === "verified",
  health.proofs?.ownerSignIn ?? "proof light unavailable",
);
record(
  "Cookiebot configuration",
  health.env?.consent?.NEXT_PUBLIC_COOKIEBOT_ID === "configured" && home.body.includes("consent.cookiebot.com/uc.js"),
  health.proofs?.consent ?? "proof light unavailable",
);
record(
  "cookie declaration surface",
  cookies.status === 200 && !cookies.body.includes("Cookiebot is not configured"),
  cookies.status === 200 ? "route available" : `HTTP ${cookies.status}`,
);
record(
  "private-beta intake storage",
  waitlistValidation.status === 400 && health.database?.ok === true,
  `validation HTTP ${waitlistValidation.status}, database=${health.database?.ok === true ? "ready" : "blocked"}`,
);
record(
  "private-beta confirmation email",
  health.proofs?.waitlist === "configured_confirmation_proof_required",
  health.proofs?.waitlist ?? "proof light unavailable",
);
record(
  "LinkedIn OAuth proof",
  linkedin.state === "connected" && health.proofs?.linkedinOAuth === "verified",
  `state=${linkedin.state ?? "unknown"}, proof=${health.proofs?.linkedinOAuth ?? "unavailable"}`,
);
record(
  "official text-post proof",
  health.proofs?.officialTextPost === "verified",
  health.proofs?.officialTextPost ?? "proof light unavailable",
);
record(
  "Stripe payment rail",
  health.capabilities?.stripeSandbox === "configured_live_checkout",
  health.capabilities?.stripeSandbox ?? "commerce proof light unavailable",
);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "BLOCKED"} ${check.label}: ${check.detail}`);
}

const blocked = checks.filter((check) => !check.pass);
if (blocked.length && !allowIncomplete) {
  console.error(`BLOCKED ${blocked.length} production launch fastener(s) remain at ${baseUrl}`);
  process.exitCode = 1;
} else if (blocked.length) {
  console.log(`AUDIT ${blocked.length} production launch fastener(s) remain at ${baseUrl}`);
} else {
  console.log(`PASS all production launch preflight checks at ${baseUrl}`);
}

async function get(path) {
  return request(path, { redirect: "follow" });
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    status: response.status,
    body: await response.text(),
    contentType: response.headers.get("content-type") ?? "",
  };
}

function parseJson(response, label) {
  assert.equal(response.status, 200, `${label}: expected HTTP 200, got ${response.status}`);
  try {
    return JSON.parse(response.body);
  } catch {
    throw new Error(`${label}: response is not JSON`);
  }
}

function record(label, pass, detail) {
  checks.push({ label, pass, detail });
}
