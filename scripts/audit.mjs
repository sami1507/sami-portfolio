import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { launchAuditBrowser } from "./audit-browser.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const origin = process.env.AUDIT_URL || "http://127.0.0.1:3000";
const knownRoutes = ["/", "/ar/", "/he/", "/de/", "/projects/pathy/"];
const knownDevices = ["mobile", "desktop"];
const [routeFilter, deviceFilter, ...extraArguments] = process.argv.slice(2);
if (
  extraArguments.length ||
  (routeFilter !== undefined && !knownRoutes.includes(routeFilter)) ||
  (deviceFilter !== undefined && !knownDevices.includes(deviceFilter))
)
  throw new Error(
    `Usage: npm run audit -- [route] [mobile|desktop]. Routes: ${knownRoutes.join(", ")}`,
  );
const routeName = (route) =>
  route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-|-$/g, "");
const output = path.resolve(
  "artifacts/lighthouse",
  routeFilter
    ? `recheck-${routeName(routeFilter)}${deviceFilter ? `-${deviceFilter}` : ""}`
    : ".",
);
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
const measurements = [];
const failures = [];
const cleanupWarnings = [];
for (const route of routeFilter ? [routeFilter] : knownRoutes) {
  for (const device of deviceFilter ? [deviceFilter] : knownDevices) {
    for (let run = 1; run <= repeat; run++) {
      let browser;
      let entry;
      try {
        // Lighthouse must not inherit cache, storage or protocol state from an earlier run.
        browser = await launchAuditBrowser(chromePath);
        const result = await lighthouse(
          new URL(route, origin).href,
          {
            port: browser.chrome.port,
            onlyCategories: categoryIds,
            output: ["json", "html"],
            logLevel: "error",
          },
          device === "desktop" ? desktopConfig : undefined,
        );
        if (!result?.lhr) throw new Error(`No Lighthouse report for ${route}`);
        const { lhr, report } = result;
        const stem = `${routeName(route)}-${device}-${run}`;
        await writeFile(path.join(output, `${stem}.json`), report[0]);
        await writeFile(path.join(output, `${stem}.html`), report[1]);
        entry = {
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
          runWarnings: lhr.runWarnings || [],
          cleanupWarning: null,
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
      } catch (error) {
        failures.push({ route, device, run, error: String(error) });
        console.error(
          `Lighthouse failed for ${route} (${device}, run ${run}): ${error}`,
        );
      } finally {
        if (browser) {
          let warning;
          try {
            warning = await browser.close();
          } catch (error) {
            warning = String(error);
          }
          if (warning) {
            cleanupWarnings.push({ route, device, run, warning });
            if (entry) entry.cleanupWarning = warning;
            console.warn(
              `Chrome cleanup warning for ${route} (${device}, run ${run}); measurement retained.`,
            );
          }
        }
      }
    }
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
  browserIsolation: "Fresh browser and temporary profile per measurement",
  filters: { route: routeFilter || null, device: deviceFilter || null },
  groups,
  measurements,
  failures,
  cleanupWarnings,
  cleanupWarning: cleanupWarnings.length
    ? cleanupWarnings
        .map(
          (item) =>
            `${item.route} ${item.device} run ${item.run}: ${item.warning}`,
        )
        .join("\n")
    : null,
};
await writeFile(
  path.join(output, "summary.json"),
  JSON.stringify(summary, null, 2),
);
console.log(`Saved actual reports to ${output}`);
console.log(JSON.stringify(groups, null, 2));
if (
  failures.length ||
  measurements.some((measurement) => measurement.runtimeError) ||
  groups.some((group) =>
    Object.values(group.medianScores).some((score) => score < 90),
  )
)
  process.exitCode = 1;
