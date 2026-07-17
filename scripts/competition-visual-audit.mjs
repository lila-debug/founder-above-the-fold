import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const baseUrl = process.env.COMPETITION_BASE_URL ?? "http://127.0.0.1:3100";
const outputDir = new URL("../output/competition-polish/", import.meta.url);

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "judge-wide", width: 2048, height: 1152 },
];

const screens = [
  "Welcome",
  "Log in",
  "Sign up",
  "One-time purchase",
  "Build complete",
  "Dashboard",
  "Files",
  "Profile photo",
  "Profile editor",
  "Links",
  "Perks Hub",
  "Voice to text",
  "Local AI",
  "Privacy & settings",
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const evidence = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(`${baseUrl}/product`, { waitUntil: "networkidle" });

    for (const screen of screens) {
      await page.getByRole("button", { name: "Open screen index" }).click();
      await page.getByRole("button", { name: new RegExp(screen, "i") }).click();
      await page.locator(".saas-screen-frame").waitFor({ state: "visible" });
      await page.waitForTimeout(360);

      const slug = screen.toLowerCase().replaceAll(" ", "-");
      const fileName = `${viewport.name}-${slug}.png`;
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: fileURLToPath(new URL(fileName, outputDir)),
      });

      const measurements = await page.evaluate(() => {
        const title = document.querySelector(".saas-screen-frame h2");
        const panel = document.querySelector(".saas-screen-frame > *");
        const stage = document.querySelector(".saas-stage");
        const header = document.querySelector(".saas-header");
        const titleRect = title?.getBoundingClientRect();
        const panelRect = panel?.getBoundingClientRect();

        return {
          bodyScrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          horizontalOverflow: document.body.scrollWidth > window.innerWidth,
          headerHeight: Math.round(header?.getBoundingClientRect().height ?? 0),
          panelTop: Math.round(panelRect?.top ?? 0),
          panelVisibleInFirstViewport: (panelRect?.top ?? Infinity) < window.innerHeight * 0.22,
          stageWidth: Math.round(stage?.getBoundingClientRect().width ?? 0),
          titleClipped:
            titleRect && panelRect
              ? titleRect.left < panelRect.left ||
                titleRect.right > panelRect.right ||
                titleRect.top < panelRect.top ||
                titleRect.bottom > panelRect.bottom
              : null,
          titleRight: Math.round(titleRect?.right ?? 0),
          panelRight: Math.round(panelRect?.right ?? 0),
        };
      });

      evidence.push({ viewport, screen, fileName, consoleErrors: [...consoleErrors], ...measurements });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(new URL("audit.json", outputDir), `${JSON.stringify(evidence, null, 2)}\n`);

const failures = evidence.filter(
  (item) => item.horizontalOverflow || item.titleClipped || !item.panelVisibleInFirstViewport || item.consoleErrors.length,
);

console.log(JSON.stringify({ baseUrl, evidence, failures }, null, 2));
if (failures.length) process.exitCode = 1;
