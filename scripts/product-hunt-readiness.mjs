import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.PRODUCT_HUNT_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const waitlistMode = process.env.PRODUCT_HUNT_WAITLIST_MODE ?? "live";
const outputDir = path.resolve("output/product-hunt/browser");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(`desktop console: ${message.text()}`);
  });
  desktop.on("pageerror", (error) => errors.push(`desktop page: ${error.message}`));

  await desktop.goto(`${baseUrl}/waitlist`, { waitUntil: "networkidle" });
  await assertNoOverflow(desktop, "waitlist desktop");
  if (waitlistMode === "locked") {
    await desktop.getByText("Signup socket being fitted").waitFor();
    assert.equal(await desktop.locator("form").count(), 0);
  } else {
    const formAction = await desktop.locator("form").getAttribute("action");
    assert.match(formAction ?? "", /^https:\/\/waitlister\.me\/s\/[a-zA-Z0-9_-]+$/);
  }
  await desktop.screenshot({ path: path.join(outputDir, "waitlist-desktop.png"), fullPage: true });

  await desktop.goto(`${baseUrl}/try`, { waitUntil: "networkidle" });
  const queueButton = desktop.getByRole("button", { name: /Fit draft to demo queue/i });
  assert.equal(await queueButton.isDisabled(), true);
  await desktop.getByLabel("Founder draft").fill("We optimize and automate DMs for every founder using our platform.");
  await desktop.getByRole("button", { name: /Run demo clamp/i }).click();
  await desktop.getByText("Queue remains locked").waitFor();
  assert.equal(await queueButton.isDisabled(), true);
  await desktop.getByLabel("Founder draft").fill(
    "A credible founder profile makes the work legible before the first conversation begins.",
  );
  await desktop.getByRole("button", { name: /Run demo clamp/i }).click();
  await desktop.getByText("Demo voice passed").waitFor();
  assert.equal(await queueButton.isEnabled(), true);
  await queueButton.click();
  await desktop.getByText(/Queued locally for the demonstration/i).waitFor();
  await desktop.screenshot({ path: path.join(outputDir, "try-desktop-passed.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  mobile.on("pageerror", (error) => errors.push(`mobile page: ${error.message}`));

  for (const route of ["/try", "/waitlist"]) {
    await mobile.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await assertNoOverflow(mobile, `${route} mobile`);
    await mobile.screenshot({
      path: path.join(outputDir, `${route.slice(1)}-mobile.png`),
      fullPage: true,
    });
  }

  assert.deepEqual(errors, []);
  console.log(`PASS Product Hunt browser jig: waitlist=${waitlistMode}, fail/pass/queue clamp, desktop/mobile layout, zero console errors`);
} finally {
  await browser.close();
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scrollWidth <= dimensions.clientWidth,
    `${label}: horizontal overflow ${dimensions.scrollWidth} > ${dimensions.clientWidth}`,
  );
}
