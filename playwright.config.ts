import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const windowsChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const executablePath =
  process.env.CHROME_PATH ||
  (process.platform === "win32" && existsSync(windowsChrome)
    ? windowsChrome
    : undefined);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || "3000"}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  outputDir: "artifacts/test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "artifacts/playwright-report" }],
  ],
  use: {
    baseURL,
    launchOptions: { executablePath },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
