import * as chromeLauncher from "chrome-launcher";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const closeTimeoutMs = 15_000;

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
  // chrome-launcher.kill() returns void: on Windows it issues taskkill, but
  // Chrome can still hold profile files until the ChildProcess closes.
  const ownedProcess = chrome.process;
  let processClosed = false;
  let resolveProcessClosed;
  const processClose = new Promise((resolve) => {
    resolveProcessClosed = resolve;
  });
  const onProcessClose = () => {
    processClosed = true;
    resolveProcessClosed();
  };
  ownedProcess.once("close", onProcessClose);
  let closeResult;

  async function closeOwnedBrowser() {
    const warnings = [];
    let timeout;
    try {
      if (!processClosed) chrome.kill();
    } catch (error) {
      warnings.push(String(error));
    }
    let closed;
    try {
      closed =
        processClosed ||
        (await Promise.race([
          processClose.then(() => true),
          new Promise((resolve) => {
            timeout = setTimeout(() => resolve(false), closeTimeoutMs);
          }),
        ]));
    } finally {
      clearTimeout(timeout);
      ownedProcess.removeListener("close", onProcessClose);
    }
    if (!closed) {
      warnings.push(
        `Timed out after ${closeTimeoutMs} ms waiting for the owned Chrome process to close; its temporary profile was retained.`,
      );
      return warnings.join("\n");
    }
    // Delete only the exact fresh profile created by this invocation, after
    // the owned process has closed. Never clean up a still-running profile.
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
          retryDelay: 500,
        });
      } catch (error) {
        warnings.push(String(error));
      }
    }
    return warnings.length ? warnings.join("\n") : null;
  }

  return {
    chrome,
    close() {
      closeResult ??= closeOwnedBrowser();
      return closeResult;
    },
  };
}
