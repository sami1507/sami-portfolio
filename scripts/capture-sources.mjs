import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("artifacts/source-captures", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const captures = [];
try {
  for (const [name, url] of [
    ["travelscan", "https://travel-scan-ai.vercel.app"],
    ["taskflow", "https://sami1507.github.io/taskflow-kanban/"],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      colorScheme: "light",
    });
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.evaluate(() => document.fonts.ready);
    const title = await page.title();
    const body = await page.locator("body").innerText();
    if (!response?.ok() || body.includes("DEPLOYMENT_NOT_FOUND"))
      throw new Error(`${name} did not serve its app`);
    const raw = await page.screenshot({
      path: `artifacts/source-captures/${name}.png`,
      animations: "disabled",
      ...(name === "travelscan"
        ? { clip: { x: 0, y: 0, width: 1440, height: 700 } }
        : {}),
    });
    await sharp(raw).webp({ quality: 88 }).toFile(`public/images/${name}.webp`);
    captures.push({
      name,
      url: page.url(),
      status: response.status(),
      title,
      capturedAt: new Date().toISOString(),
      visibleText: body.slice(0, 5000),
    });
    console.log(
      JSON.stringify({
        name,
        status: response.status(),
        title,
        body: body.slice(0, 600),
      }),
    );
    await page.close();
  }
  await writeFile(
    "artifacts/source-captures/provenance.json",
    JSON.stringify(captures, null, 2),
  );
} finally {
  await browser.close();
}
