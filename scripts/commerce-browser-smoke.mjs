import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
let checks = 0;

try {
  for (const fixture of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport: fixture });
    page.setDefaultTimeout(7_500);
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    console.log(`CHECK ${fixture.name}: locked checkout panel`);
    await page.goto(`${baseUrl}/pricing`, { waitUntil: "domcontentloaded" });
    await expectText(page, "CA$199");
    await expectText(page, "Mac licence safely locked");
    const checkoutButton = page.getByRole("button", { name: "Open secure test checkout" });
    if (!(await checkoutButton.isDisabled())) throw new Error(`${fixture.name}: locked checkout button is enabled.`);
    for (const offer of ["Profile setup", "Self-serve SaaS", "Visibility ops"]) {
      await page.getByRole("button", { name: new RegExp(offer, "i") }).click();
      await expectText(page, `${offer} safely locked`);
      if (!(await checkoutButton.isDisabled())) throw new Error(`${fixture.name}: ${offer} checkout button is enabled.`);
      checks += 2;
    }
    await page.getByRole("button", { name: /Mac licence/i }).click();
    checks += 3;

    await page.getByRole("button", { name: "Recover an existing licence" }).click();
    await page.getByLabel("Purchaser email").fill(`missing-${fixture.name}@example.ca`);
    await page.getByRole("button", { name: "Send private recovery link" }).click();
    await expectText(page, "If an active licence matches that address");
    checks += 2;

    await page.goto(`${baseUrl}/pricing?checkout=cancelled`, { waitUntil: "domcontentloaded" });
    await expectText(page, "Checkout closed. The return link created no licence");
    checks += 1;

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) throw new Error(`${fixture.name}: pricing panel overflows horizontally.`);
    if (consoleErrors.length) throw new Error(`${fixture.name}: console errors: ${consoleErrors.join(" | ")}`);
    checks += 2;

    console.log(`CHECK ${fixture.name}: untrusted return reference`);
    await page.goto(`${baseUrl}/purchase/success?session_id=cs_test_browser_missing_123456`, { waitUntil: "domcontentloaded" });
    await expectText(page, "Payment needs inspection");
    if (await page.getByText("Licence fitted", { exact: true }).count()) {
      throw new Error(`${fixture.name}: unknown return reference unlocked a licence.`);
    }
    checks += 2;
    await page.close();
  }

  console.log(`PASS ${checks} commerce browser checks across desktop and mobile.`);
} finally {
  await browser.close();
}

async function expectText(page, text) {
  const locator = page.getByText(text, { exact: false }).first();
  await locator.waitFor({ state: "visible" });
}
