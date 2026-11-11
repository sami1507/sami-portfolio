import * as chromeLauncher from "chrome-launcher";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function launchAuditBrowser(chromePath) {
  const temporaryRoot = path.resolve(os.tmpdir());
  const profile = await mkdtemp(
    path.join(temporaryRoot, "sami-portfolio-audit-"),
  );
  const chrome = await chromeLauncher.launch({
    chromePath,
    // An explicitly owned profile prevents chrome-launcher's asynchronous
    // Windows cleanup callback from throwing after the reports are saved.
    userDataDir: profile,
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  return {
    chrome,
    async close() {
      const warnings = [];
      try {
        await chrome.kill();
      } catch (error) {
        warnings.push(String(error));
      }
      // Delete only the exact fresh profile created by this invocation.
      const target = path.resolve(profile);
      if (
        path.dirname(target) !== temporaryRoot ||
        !path.basename(target).startsWith("sami-portfolio-audit-")
      ) {
        warnings.push("Temporary profile path failed the containment check.");
      } else {
        try {
          await rm(target, {
            recursive: true,
            force: true,
            maxRetries: 2,
            retryDelay: 100,
          });
        } catch (error) {
          // Windows can retain a log-file handle until this process exits.
          warnings.push(String(error));
        }
      }
      return warnings.length ? warnings.join("\n") : null;
    },
  };
}
