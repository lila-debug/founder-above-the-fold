import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.CONTRA_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const outputDir = path.resolve("output/contra-buildathon/browser");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(`desktop console: ${message.text()}`);
  });
  desktop.on("pageerror", (error) => errors.push(`desktop page: ${error.message}`));

  await desktop.goto(`${baseUrl}/manual`, { waitUntil: "networkidle" });
  await desktop.getByRole("heading", { name: /Place the parts/i }).waitFor();
  await assertNoOverflow(desktop, "manual desktop");

  const betaButton = desktop.getByRole("button", { name: "Start beta tester mode" });
  await betaButton.click();
  const betaOnButton = desktop.getByRole("button", { name: "Beta tester mode on" });
  await betaOnButton.waitFor();
  assert.equal(await betaOnButton.getAttribute("aria-pressed"), "true");

  await desktop.getByRole("button", { name: /1 · Insert demo draft/i }).click();
  await desktop.getByRole("button", { name: /2B · Fail voice/i }).click();
  await desktop.getByText(/Voice failed. The queue clamp is correctly locked/i).waitFor();
  await desktop.getByRole("button", { name: /2A · Pass voice/i }).click();
  await desktop.getByRole("button", { name: /3 · Fit queue/i }).click();
  await desktop.getByText(/Demo draft fitted into the sandbox queue/i).waitFor();

  await desktop.getByRole("button", { name: "Manual problem" }).click();
  await desktop.getByPlaceholder(/Where did the tester stop/i).fill(
    "The tester expected the live light to change after a manual check.",
  );
  await desktop.getByRole("button", { name: "Fasten note locally" }).click();
  await desktop.getByText(/Breakpoint fastened locally/i).waitFor();
  await desktop.getByText(/1 saved/i).waitFor();
  await desktop.screenshot({ path: path.join(outputDir, "manual-desktop-operated.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  mobile.on("console", (message) => {
    if (message.type() === "error") errors.push(`mobile console: ${message.text()}`);
  });
  mobile.on("pageerror", (error) => errors.push(`mobile page: ${error.message}`));

  for (const route of ["/manual", "/try"]) {
    await mobile.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await assertNoOverflow(mobile, `${route} mobile`);
    await mobile.screenshot({
      path: path.join(outputDir, `${route.slice(1)}-mobile.png`),
      fullPage: true,
    });
  }

  assert.deepEqual(errors, []);
  console.log(
    "PASS Contra judge path: interactive parts, beta mode, fail/pass/queue trigger, breakpoint capture, desktop/mobile layout, zero console errors",
  );
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
