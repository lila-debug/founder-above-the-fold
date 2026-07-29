import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.PRODUCT_HUNT_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const requestedWaitlistMode = process.env.PRODUCT_HUNT_WAITLIST_MODE ?? "auto";
const outputDir = path.resolve("output/product-hunt/browser");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];
let resolvedWaitlistMode = requestedWaitlistMode;

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(`desktop console: ${message.text()}`);
  });
  desktop.on("pageerror", (error) => errors.push(`desktop page: ${error.message}`));

  await desktop.setViewportSize({ width: 1024, height: 1000 });
  await desktop.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await assertNoOverflow(desktop, "landing tablet");
  const hero = desktop.locator("h1").first();
  await hero.waitFor();
  const heroBox = await hero.boundingBox();
  assert.ok(heroBox, "landing hero headline is missing");
  assert.ok(heroBox.width >= 320, `landing tablet/desktop headline column is too narrow: ${heroBox.width}px`);
  assert.ok(heroBox.x >= 0 && heroBox.x + heroBox.width <= 1024, "landing headline is clipped horizontally");
  await desktop.setViewportSize({ width: 1440, height: 1000 });

  await desktop.goto(`${baseUrl}/waitlist`, { waitUntil: "domcontentloaded" });
  await assertNoOverflow(desktop, "waitlist desktop");
  const lockedPanel = desktop.getByText("Signup socket being fitted");
  const form = desktop.locator("form").first();
  const hasForm = (await form.count()) > 0;
  const formAction = hasForm ? await form.getAttribute("action") : null;
  resolvedWaitlistMode = requestedWaitlistMode === "auto"
    ? (hasForm ? (formAction ? "external" : "internal") : "locked")
    : requestedWaitlistMode;
  if (resolvedWaitlistMode === "locked") {
    await lockedPanel.waitFor();
    assert.equal(await desktop.locator("form").count(), 0);
  } else if (resolvedWaitlistMode === "internal") {
    await desktop.getByLabel("Work email").waitFor();
    await desktop.getByRole("button", { name: /Request my place/i }).waitFor();
    const invalidResponse = await desktop.request.post(`${baseUrl}/api/waitlist`, {
      data: {},
    });
    assert.equal(invalidResponse.status(), 400, "internal waitlist validation clamp must refuse incomplete data");
  } else {
    assert.equal(hasForm, true, "waitlist live mode requires a configured Waitlister form");
    assert.match(formAction ?? "", /^https:\/\/waitlister\.me\/s\/[a-zA-Z0-9_-]+$/);
  }
  await desktop.screenshot({ path: path.join(outputDir, "waitlist-desktop.png"), fullPage: true });

  await desktop.goto(`${baseUrl}/pricing`, { waitUntil: "domcontentloaded" });
  const transformation = desktop.getByRole("button", { name: /Founder transformation/i });
  await transformation.waitFor();
  assert.match(await transformation.innerText(), /CA\$7,500/);
  for (const retiredPrice of ["CA$199", "CA$499", "CA$69", "CA$750"]) {
    assert.equal(
      await desktop.getByText(retiredPrice, { exact: false }).count(),
      0,
      `retired price ${retiredPrice} returned to the public catalogue`,
    );
  }
  await assertNoOverflow(desktop, "pricing desktop");

  await desktop.goto(`${baseUrl}/try`, { waitUntil: "domcontentloaded" });
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
    await mobile.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await assertNoOverflow(mobile, `${route} mobile`);
    await mobile.screenshot({
      path: path.join(outputDir, `${route.slice(1)}-mobile.png`),
      fullPage: true,
    });
  }

  assert.deepEqual(errors, []);
  console.log(`PASS Product Hunt browser jig: waitlist=${resolvedWaitlistMode}, fail/pass/queue clamp, desktop/mobile layout, zero console errors`);
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
