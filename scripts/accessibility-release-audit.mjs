import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.ACCESSIBILITY_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const outputDir = path.resolve("output/production-readiness/accessibility");
const axeSource = await readFile(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");
const routes = [
  ["01-owner-sign-in", "/login"],
  ["02-sign-up", "/signup"],
  ["03-pricing", "/pricing"],
  ["04-purchase-result", "/purchase/success"],
  ["05-licence-recovery", "/purchase/recover/confirm"],
  ["06-perks", "/perks"],
  ["07-build-manual", "/manual"],
  ["08-try-the-mechanism", "/try"],
  ["09-private-beta-waitlist", "/waitlist"],
  ["10-no-circle-of-hell", "/no-circles"],
  ["11-privacy", "/privacy"],
  ["12-cookies", "/cookies"],
  ["13-terms", "/terms"],
  ["14-product-showroom", "/product"],
];
const fixtures = [
  { name: "desktop", width: 1440, height: 1000, isMobile: false },
  { name: "reflow-200", width: 640, height: 900, isMobile: false },
  { name: "portrait", width: 390, height: 844, isMobile: true },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];

try {
  for (const fixture of fixtures) {
    for (const [slug, route] of routes) {
      const page = await browser.newPage({
        viewport: { width: fixture.width, height: fixture.height },
        isMobile: fixture.isMobile,
        reducedMotion: "reduce",
      });
      const runtimeErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") runtimeErrors.push(message.text());
      });
      page.on("pageerror", (error) => runtimeErrors.push(error.message));

      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      assert.equal(response?.status(), 200, `${fixture.name} ${route}: expected HTTP 200`);
      await page.locator("main").waitFor();
      await page.addScriptTag({ content: axeSource });
      const axeResult = await page.evaluate(async () => await axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      }));
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      const smallTargets = fixture.isMobile ? await page.evaluate(() => {
        const controls = [...document.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role='button'][tabindex]:not([aria-disabled='true'])")];
        return controls.flatMap((element) => {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") return [];
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return [];
          if (rect.right < 0 || rect.left > innerWidth || rect.bottom < 0 || rect.top > innerHeight + document.documentElement.scrollHeight) return [];
          if (element instanceof HTMLInputElement && ["checkbox", "radio", "file"].includes(element.type)) {
            const label = element.closest("label")?.getBoundingClientRect();
            if (label && label.width >= 44 && label.height >= 44) return [];
          }
          return rect.width < 44 || rect.height < 44
            ? [{ tag: element.tagName, text: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 60), width: rect.width, height: rect.height }]
            : [];
        });
      }) : [];
      const keyboard = await probeKeyboard(page);

      const record = {
        fixture: fixture.name,
        route,
        status: response.status(),
        cameraRightClear: dimensions.scrollWidth <= dimensions.clientWidth,
        violations: axeResult.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
          targets: violation.nodes.flatMap((node) => node.target),
        })),
        incomplete: axeResult.incomplete.map((item) => ({ id: item.id, nodes: item.nodes.length })),
        smallTargets,
        keyboard,
        runtimeErrors,
      };
      records.push(record);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputDir, "audit.json"), `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), records }, null, 2)}\n`);

const failures = records.filter((record) =>
  !record.cameraRightClear || record.violations.length || record.smallTargets.length ||
  record.keyboard.missing.length || record.keyboard.invisibleFocus.length || record.runtimeErrors.length,
);
for (const record of records) {
  const state = failures.includes(record) ? "FAIL" : "PASS";
  console.log(`${state} ${record.fixture} ${record.route}: axe=${record.violations.length}, targets=${record.smallTargets.length}, keyboard=${record.keyboard.missing.length + record.keyboard.invisibleFocus.length}, overflow=${record.cameraRightClear ? "clear" : "blocked"}, console=${record.runtimeErrors.length}`);
}

assert.deepEqual(failures, [], `${failures.length} accessibility/reflow assemblies failed; inspect ${path.join(outputDir, "audit.json")}`);
console.log(`PASS ${records.length} WCAG AA, keyboard, target-size, camera-right and console assemblies.`);

async function probeKeyboard(page) {
  const ids = await page.evaluate(() => {
    const selector = "a[href],button:not([disabled]),input:not([disabled]):not([tabindex='-1']),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
    let index = 0;
    return [...document.querySelectorAll(selector)].flatMap((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || !rect.width || !rect.height) return [];
      element.dataset.a11yTab = String(index++);
      return [element.dataset.a11yTab];
    });
  });
  await page.evaluate(() => {
    document.body.tabIndex = -1;
    document.body.focus();
  });
  const seen = new Set();
  const invisibleFocus = [];
  for (let index = 0; index < ids.length + 2; index += 1) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) return null;
      const style = getComputedStyle(element);
      return {
        id: element.dataset.a11yTab,
        label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 80) || element.tagName,
        outlineVisible: style.outlineStyle !== "none" && style.outlineWidth !== "0px",
        shadowVisible: style.boxShadow !== "none",
      };
    });
    if (!focus?.id) continue;
    seen.add(focus.id);
    if (!focus.outlineVisible && !focus.shadowVisible) invisibleFocus.push(focus.label);
  }
  return {
    count: ids.length,
    missing: ids.filter((id) => !seen.has(id)),
    invisibleFocus,
  };
}
