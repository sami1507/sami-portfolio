import test from "node:test";
import assert from "node:assert/strict";
import { readPublicSettings } from "../src/lib/public-settings.mjs";
import { loadPublicTestEnv } from "../scripts/load-public-test-env.mjs";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

test("browser tests load only public production settings in order while existing values win", async () => {
  const temporaryRoot = path.resolve(os.tmpdir());
  const fixture = await mkdtemp(
    path.join(temporaryRoot, "portfolio-test-env-"),
  );
  const files = [
    ".env.production.local",
    ".env.local",
    ".env.production",
    ".env",
  ];
  try {
    for (const [index, file] of files.entries()) {
      await writeFile(
        path.join(fixture, file),
        [
          `NEXT_PUBLIC_SITE_URL="https://source-${index}.example"`,
          `NEXT_PUBLIC_RESUME_URL='/source-${index}.pdf'`,
          "PORT=9999",
          "CHROME_PATH=/fixture/browser",
          "API_KEY=fixture-private-value",
        ].join("\n"),
      );
    }
    const explicit = {
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_RESUME_URL: "https://existing.example/cv.pdf",
      PORT: "4000",
    };
    loadPublicTestEnv(fixture, explicit);
    assert.deepEqual(explicit, {
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_RESUME_URL: "https://existing.example/cv.pdf",
      PORT: "4000",
    });
    for (const [index, file] of files.entries()) {
      const environment = { PORT: "4000" };
      loadPublicTestEnv(fixture, environment);
      assert.deepEqual(environment, {
        PORT: "4000",
        NEXT_PUBLIC_SITE_URL: `https://source-${index}.example`,
        NEXT_PUBLIC_RESUME_URL: `/source-${index}.pdf`,
      });
      await rm(path.join(fixture, file));
    }
    const missing = {};
    loadPublicTestEnv(fixture, missing);
    assert.deepEqual(missing, {});
  } finally {
    if (
      path.dirname(path.resolve(fixture)) !== temporaryRoot ||
      !path.basename(fixture).startsWith("portfolio-test-env-")
    )
      throw new Error("Fixture cleanup escaped its temporary root.");
    await rm(fixture, { recursive: true, force: true });
  }
});

test("unconfigured preview has no résumé or publishable origin", () => {
  assert.deepEqual(readPublicSettings(), {
    siteUrl: null,
    resume: null,
    configured: false,
  });
});
test("HTTPS origin is normalized and an optional local PDF can be enabled", () => {
  assert.deepEqual(
    readPublicSettings({
      siteUrl: " https://portfolio.example/ ",
      resumeUrl: "/files/sami-cv.pdf",
    }),
    {
      siteUrl: "https://portfolio.example",
      resume: "/files/sami-cv.pdf",
      configured: true,
    },
  );
});
test("reject unsafe or ambiguous site origins without exposing their values", () => {
  for (const siteUrl of [
    "invalid",
    "http://example.com",
    "https://example.com/base",
    "https://example.com?key=secret",
    "https://user:secret@example.com",
    "https://example.com/#top",
  ]) {
    assert.throws(
      () => readPublicSettings({ siteUrl }),
      (error) =>
        error.message.includes("NEXT_PUBLIC_SITE_URL") &&
        !error.message.includes("secret"),
    );
  }
});
test("résumé accepts HTTPS, rejects script URLs, protocol-relative paths and traversal", () => {
  assert.equal(
    readPublicSettings({ resumeUrl: "https://files.example/cv.pdf" }).resume,
    "https://files.example/cv.pdf",
  );
  for (const resumeUrl of [
    "javascript:alert(1)",
    "//example.com/cv.pdf",
    "/../cv.pdf",
    "/%2e%2e/cv.pdf",
    "/cv.html",
    "/cv\\file.pdf",
    "https://user:secret@example.com/cv.pdf",
  ]) {
    assert.throws(
      () => readPublicSettings({ resumeUrl }),
      /NEXT_PUBLIC_RESUME_URL/,
    );
  }
});

test("release preflight requires an origin and validates local PDFs before building", async () => {
  const temporaryRoot = path.resolve(os.tmpdir());
  const fixture = await mkdtemp(
    path.join(temporaryRoot, "portfolio-config-test-"),
  );
  const script = fileURLToPath(
    new URL("../scripts/check-config.mjs", import.meta.url),
  );
  const run = (resumeUrl = "", siteUrl = "https://portfolio.example") =>
    spawnSync(process.execPath, [script, "--release"], {
      cwd: fixture,
      env: {
        ...process.env,
        NODE_ENV: "test",
        NEXT_PUBLIC_SITE_URL: siteUrl,
        NEXT_PUBLIC_RESUME_URL: resumeUrl,
      },
      encoding: "utf8",
    });
  try {
    await mkdir(path.join(fixture, "public"));
    assert.equal(run().status, 0);
    assert.equal(run("", "").status, 1);
    assert.match(run("/cv.pdf").stderr, /missing file/);
    await writeFile(path.join(fixture, "public", "cv.pdf"), "not a PDF");
    assert.match(run("/cv.pdf").stderr, /not a PDF/);
    // Isolated format fixture, never copied into the portfolio's public assets.
    await writeFile(
      path.join(fixture, "public", "cv.pdf"),
      "%PDF-1.7\nfixture\n%%EOF",
    );
    assert.equal(run("/cv.pdf").status, 0);
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
    oversized.write("%PDF-1.7");
    await writeFile(path.join(fixture, "public", "cv.pdf"), oversized);
    assert.match(run("/cv.pdf").stderr, /at most 10 MB/);
  } finally {
    if (
      path.dirname(path.resolve(fixture)) !== temporaryRoot ||
      !path.basename(fixture).startsWith("portfolio-config-test-")
    )
      throw new Error("Fixture cleanup escaped its temporary root.");
    await rm(fixture, { recursive: true, force: true });
  }
});
