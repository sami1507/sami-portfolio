import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts/screenshots", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
try {
  for (const [locale, width] of [
    ["en", 1440],
    ["en", 390],
    ["ar", 1440],
    ["ar", 390],
    ["he", 1440],
    ["he", 390],
    ["de", 1440],
    ["de", 390],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
    });
    await page.goto(
      `http://127.0.0.1:3000/${locale === "en" ? "" : `${locale}/`}`,
      {
        waitUntil: "networkidle",
      },
    );
    await page.evaluate(() => document.fonts.ready);
    for (const img of await page.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((image) => image.decode());
    }
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForFunction(() => window.scrollY === 0);
    await page.screenshot({
      path: `artifacts/screenshots/hero-${locale}-${width}.png`,
      animations: "disabled",
    });
    await page.screenshot({
      path: `artifacts/screenshots/full-${locale}-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    console.log(
      JSON.stringify({
        locale,
        width,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
        title: await page.title(),
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
