import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { launchAuditBrowser } from "./audit-browser.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const origin = process.env.AUDIT_URL || "http://127.0.0.1:3000";
const output = path.resolve("artifacts/lighthouse");
const chromePath =
  process.env.CHROME_PATH ||
  (process.platform === "win32" &&
  existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : chromium.executablePath());
const repeat = Number(process.env.AUDIT_RUNS || 3);
if (!Number.isSafeInteger(repeat) || repeat < 1 || repeat > 10)
  throw new Error("AUDIT_RUNS must be an integer from 1 to 10.");
const categoryIds = ["performance", "accessibility", "best-practices", "seo"];
await mkdir(output, { recursive: true });
const readiness = await fetch(origin);
if (!readiness.ok)
  throw new Error(
    `Production preview returned ${readiness.status}. Build and start it first.`,
  );
const browser = await launchAuditBrowser(chromePath);
const { chrome } = browser;
const measurements = [];
let cleanupWarning = null;
try {
  for (const route of ["/", "/ar/", "/he/", "/de/", "/projects/pathy/"]) {
    for (const device of ["mobile", "desktop"]) {
      const runs = repeat;
      for (let run = 1; run <= runs; run++) {
        const result = await lighthouse(
          new URL(route, origin).href,
          {
            port: chrome.port,
            onlyCategories: categoryIds,
            output: ["json", "html"],
            logLevel: "error",
          },
          device === "desktop" ? desktopConfig : undefined,
        );
        if (!result?.lhr) throw new Error(`No Lighthouse report for ${route}`);
        const { lhr, report } = result;
        const stem = `${route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-|-$/g, "")}-${device}-${run}`;
        await writeFile(path.join(output, `${stem}.json`), report[0]);
        await writeFile(path.join(output, `${stem}.html`), report[1]);
        const entry = {
          route,
          device,
          run,
          fetchTime: lhr.fetchTime,
          lighthouseVersion: lhr.lighthouseVersion,
          scores: Object.fromEntries(
            categoryIds.map((id) => [
              id,
              Math.round((lhr.categories[id]?.score || 0) * 100),
            ]),
          ),
          metrics: Object.fromEntries(
            [
              "first-contentful-paint",
              "largest-contentful-paint",
              "total-blocking-time",
              "cumulative-layout-shift",
              "speed-index",
            ].map((id) => [id, lhr.audits[id]?.displayValue]),
          ),
          failedAudits: Object.values(lhr.audits)
            .filter(
              (audit) =>
                audit.score !== null &&
                audit.score < 1 &&
                audit.scoreDisplayMode !== "informative",
            )
            .map((audit) => ({
              id: audit.id,
              title: audit.title,
              score: audit.score,
              value: audit.displayValue,
            })),
          runtimeError: lhr.runtimeError || null,
          environment: lhr.environment,
          configSettings: {
            formFactor: lhr.configSettings.formFactor,
            throttlingMethod: lhr.configSettings.throttlingMethod,
            throttling: lhr.configSettings.throttling,
            screenEmulation: lhr.configSettings.screenEmulation,
          },
        };
        measurements.push(entry);
        console.log(
          JSON.stringify({
            route,
            device,
            run,
            scores: entry.scores,
            metrics: entry.metrics,
          }),
        );
      }
    }
  }
} finally {
  cleanupWarning = await browser.close();
  if (cleanupWarning) {
    console.warn(
      "Chrome temporary-profile cleanup failed; completed measurements are retained.",
    );
  }
}

const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const groups = [
  ...new Set(measurements.map((m) => `${m.route}|${m.device}`)),
].map((key) => {
  const selected = measurements.filter((m) => `${m.route}|${m.device}` === key);
  return {
    route: selected[0].route,
    device: selected[0].device,
    runs: selected.length,
    medianScores: Object.fromEntries(
      categoryIds.map((id) => [id, median(selected.map((m) => m.scores[id]))]),
    ),
  };
});
const summary = {
  date: new Date().toISOString(),
  origin,
  build: "Next.js production static export; npm run build && npm start",
  platform: `${os.platform()} ${os.release()}`,
  cpu: os.cpus()[0]?.model,
  node: process.version,
  groups,
  measurements,
  cleanupWarning,
};
await writeFile(
  path.join(output, "summary.json"),
  JSON.stringify(summary, null, 2),
);
console.log(`Saved actual reports to ${output}`);
console.log(JSON.stringify(groups, null, 2));
if (
  groups.some((group) =>
    Object.values(group.medianScores).some((score) => score < 90),
  )
)
  process.exitCode = 1;
