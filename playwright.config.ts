import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "artifacts/test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "artifacts/playwright-report" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    launchOptions: {
      // CHROME_PATH wins everywhere. Without it, Windows uses the installed
      // Chrome; other systems fall back to Playwright's own Chromium.
      executablePath:
        process.env.CHROME_PATH ||
        (process.platform === "win32"
          ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
          : undefined),
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
