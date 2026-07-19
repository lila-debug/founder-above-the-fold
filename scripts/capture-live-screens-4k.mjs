import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.LIVE_SCREEN_BASE_URL ?? "https://www.founderaccount.com").replace(/\/$/, "");
const outputRoot = path.resolve(
  process.env.LIVE_SCREEN_OUTPUT_ROOT ?? "output/live-screen-captures-4k-2026-07-19",
);

const screens = [
  ["01", "owner-sign-in", "/login"],
  ["02", "sign-up", "/signup"],
  ["03", "pricing", "/pricing"],
  ["04", "purchase-result", "/purchase/success"],
  ["05", "licence-recovery", "/purchase/recover/confirm"],
  ["06", "perks", "/perks"],
  ["07", "build-manual", "/manual"],
  ["08", "try-the-mechanism", "/try"],
  ["09", "private-beta-waitlist", "/waitlist"],
  ["10", "no-circle-of-hell", "/no-circles"],
  ["11", "privacy", "/privacy"],
  ["12", "cookies", "/cookies"],
  ["13", "terms", "/terms"],
  ["14", "product-showroom", "/product"],
];

const formats = [
  { id: "16x9", cssWidth: 1920, cssHeight: 1080, pixelWidth: 3840, pixelHeight: 2160 },
  {
    id: "9x16",
    cssWidth: 540,
    cssHeight: 960,
    pixelWidth: 2160,
    pixelHeight: 3840,
    deviceScaleFactor: 4,
  },
];

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

try {
  for (const format of formats) {
    const formatDir = path.join(outputRoot, format.id);
    await mkdir(formatDir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: format.cssWidth, height: format.cssHeight },
      screen: { width: format.cssWidth, height: format.cssHeight },
      deviceScaleFactor: format.deviceScaleFactor ?? 2,
      isMobile: format.id === "9x16",
      reducedMotion: "reduce",
      colorScheme: "light",
    });

    for (const [number, slug, route] of screens) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.waitForTimeout(700);
      await page.evaluate(() => window.scrollTo(0, 0));

      const audit = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity) !== 0 &&
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < viewportHeight &&
            rect.right > 0 &&
            rect.left < viewportWidth
          );
        };

        const elements = [...document.querySelectorAll("body *")].filter(visible);
        const horizontalOffenders = elements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: String(element.className || "").slice(0, 120),
              text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            };
          })
          .filter(
            (item) =>
              item.tag !== "svg" && (item.left < -1 || item.right > viewportWidth + 1),
          )
          .slice(0, 30);

        const circularElements = elements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const radius = getComputedStyle(element).borderRadius;
            const radiusValue = Number.parseFloat(radius);
            return {
              tag: element.tagName.toLowerCase(),
              className: String(element.className || "").slice(0, 120),
              text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
              radius,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              radiusValue,
            };
          })
          .filter(
            (item) =>
              item.width >= 12 &&
              item.height >= 12 &&
              (item.radius.includes("50%") || item.radiusValue >= Math.min(item.width, item.height) * 0.45),
          )
          .slice(0, 30);

        const backgroundCounts = new Map();
        for (const element of [document.body, ...elements]) {
          const colour = getComputedStyle(element).backgroundColor;
          if (colour !== "rgba(0, 0, 0, 0)" && colour !== "transparent") {
            backgroundCounts.set(colour, (backgroundCounts.get(colour) ?? 0) + 1);
          }
        }

        return {
          viewportWidth,
          viewportHeight,
          largeBreakpointActive: matchMedia("(min-width: 1024px)").matches,
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          horizontalOffenders,
          circularElements,
          theme: {
            bodyBackground: getComputedStyle(document.body).backgroundColor,
            bodyColour: getComputedStyle(document.body).color,
            bodyFont: getComputedStyle(document.body).fontFamily,
            dominantBackgrounds: [...backgroundCounts.entries()]
              .sort((left, right) => right[1] - left[1])
              .slice(0, 8),
          },
        };
      });

      const screenshot = await page.screenshot({
        animations: "disabled",
        fullPage: false,
        type: "png",
      });
      const pngWidth = screenshot.readUInt32BE(16);
      const pngHeight = screenshot.readUInt32BE(20);
      const fileName = `${number}-${slug}.png`;
      await writeFile(path.join(formatDir, fileName), screenshot);

      report.push({
        format: format.id,
        screen: slug,
        route,
        requestedUrl: `${baseUrl}${route}`,
        finalUrl: page.url(),
        title: await page.title(),
        status: response?.status() ?? null,
        fileName: `${format.id}/${fileName}`,
        pngWidth,
        pngHeight,
        expectedPixelWidth: format.pixelWidth,
        expectedPixelHeight: format.pixelHeight,
        exactDimensions: pngWidth === format.pixelWidth && pngHeight === format.pixelHeight,
        cameraRightClear: audit.horizontalOffenders.length === 0,
        consoleErrors,
        ...audit,
      });

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outputRoot, "audit.json"), `${JSON.stringify(report, null, 2)}\n`);

const failures = report.filter(
  (item) => !item.exactDimensions || !item.cameraRightClear || item.consoleErrors.length > 0,
);

console.log(
  JSON.stringify(
    {
      baseUrl,
      outputRoot,
      captures: report.length,
      exactDimensionCaptures: report.filter((item) => item.exactDimensions).length,
      cameraRightClearCaptures: report.filter((item) => item.cameraRightClear).length,
      circularElementCaptures: report.filter((item) => item.circularElements.length > 0).length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length > 0) process.exitCode = 1;
