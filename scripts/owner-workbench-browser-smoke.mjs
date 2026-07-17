import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.OWNER_BROWSER_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
const secret = process.env.MAGIC_LINK_SECRET ?? "";
const ownerEmail = process.env.DISPATCH_OWNER_EMAIL ?? "owner@example.test";
const output = path.resolve("output", "owner-browser");

assert.equal(new URL(baseUrl).hostname, "127.0.0.1", "browser jig runs only against 127.0.0.1");
assert.ok(["127.0.0.1", "localhost"].includes(databaseUrl.hostname), "browser jig requires local Postgres");
assert.match(databaseUrl.pathname, /test/i, "browser jig requires a database named as a test fixture");
assert.ok(secret.length >= 32, "browser jig requires the server's test MAGIC_LINK_SECRET");
assert.equal(process.env.OWNER_BROWSER_ALLOW_DESTRUCTIVE_LOCAL, "true", "set the explicit local cleanup fuse");

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const sessionToken = createSessionToken(ownerEmail, secret);

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await fitSession(desktop, sessionToken);
  const page = await desktop.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`desktop console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`desktop page: ${error.message}`));

  await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Content studio/ }).click();
  await page.getByRole("heading", { name: "Draft workbench" }).waitFor();
  await page.getByRole("button", { name: "New draft" }).click();
  await page.getByLabel("Draft body").fill("This game changer will analyze color!!!");
  await page.getByLabel("Pillar").fill("Browser safety proof");
  await page.getByLabel("Archetype").fill("Diagnostic");
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByText("Draft inserted.", { exact: true }).waitFor();

  const queueButton = page.getByRole("button", { name: "Queue post" });
  await page.getByRole("button", { name: "Voice check" }).click();
  await page.getByText("Voice check failed. Inspect the saved output before queueing.", { exact: true }).waitFor();
  assert.equal(await queueButton.isDisabled(), true, "failed voice copy remains outside the queue");

  const approvedBody =
    "A clear product system helps founders decide what matters and explain the trade-off.";
  await page.getByLabel("Draft body").fill(approvedBody);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Draft fastened.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Voice check" }).click();
  await page.getByText("Voice check passed for this body hash.", { exact: true }).waitFor();
  assert.equal(await queueButton.isEnabled(), true, "current voice-passed revision can queue");
  await queueButton.click();
  await page.getByText("Post locked into the publishing queue.", { exact: true }).waitFor();

  await page.getByRole("button", { name: /Queue/ }).first().click();
  await page.getByText(approvedBody, { exact: true }).waitFor();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByText("Post removed from the publishing queue.", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, "desktop-queue-cancelled.png"), fullPage: true });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await fitSession(mobile, sessionToken);
  const mobilePage = await mobile.newPage();
  mobilePage.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  mobilePage.on("pageerror", (error) => errors.push(`mobile page: ${error.message}`));
  await mobilePage.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
  await mobilePage.getByRole("button", { name: "Content", exact: true }).click();
  await mobilePage.getByRole("heading", { name: "Draft workbench" }).waitFor();
  const overflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.ok(overflow <= 1, `mobile workbench overflowed by ${overflow}px`);
  await mobilePage.screenshot({ path: path.join(output, "mobile-content.png"), fullPage: true });

  const cleanup = await mobilePage.request.post(`${baseUrl}/api/owner/delete`, {
    data: { confirmation: "DELETE MY FOUNDER WORKSPACE" },
  });
  assert.equal(cleanup.status(), 200, "local owner fixture cleanup");
  await mobile.close();

  assert.deepEqual(errors, []);
  console.log("PASS owner browser: dev session, failed voice lock, exact-body pass, queue and cancel.");
  console.log("PASS owner browser: 390px workbench has no horizontal overflow or console errors.");
  console.log(`PASS evidence captured in ${output}.`);
} finally {
  await browser.close();
}

async function fitSession(context, value) {
  await context.addCookies([
    {
      name: "dispatch_session",
      value,
      url: baseUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

function createSessionToken(email, signingSecret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ email, iat: now, exp: now + 3600, type: "session" }),
  ).toString("base64url");
  const signature = createHmac("sha256", signingSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
