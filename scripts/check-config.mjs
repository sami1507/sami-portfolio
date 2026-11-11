import { loadEnvFile } from "node:process";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { readPublicSettings } from "../src/lib/public-settings.mjs";

const mode = process.env.NODE_ENV || "production";
for (const name of [
  `.env.${mode}.local`,
  ".env.local",
  `.env.${mode}`,
  ".env",
]) {
  try {
    loadEnvFile(name);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
try {
  const settings = readPublicSettings({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    resumeUrl: process.env.NEXT_PUBLIC_RESUME_URL,
  });
  if (!settings.configured && process.argv.includes("--release")) {
    throw new Error(
      "Set NEXT_PUBLIC_SITE_URL to your final HTTPS origin before creating a release build.",
    );
  }
  console.log(
    settings.configured
      ? "Site origin: configured. Canonical URLs and sitemap enabled."
      : "Preview mode: no public origin configured. Search indexing and sitemap entries are disabled.",
  );
  if (settings.resume?.startsWith("/")) {
    const publicRoot = await realpath("public");
    let file;
    try {
      file = await realpath(path.join(publicRoot, settings.resume));
    } catch {
      throw new Error(
        "NEXT_PUBLIC_RESUME_URL points to a missing file. Add the real PDF under public/ or leave this setting empty.",
      );
    }
    if (!file.startsWith(publicRoot + path.sep))
      throw new Error("The résumé file must remain inside public/.");
    const bytes = await readFile(file);
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw new Error("The configured résumé is not a PDF file.");
    if (bytes.length > 10 * 1024 * 1024)
      throw new Error("The résumé PDF must be at most 10 MB.");
    console.log("Résumé: local PDF found and validated.");
  } else {
    console.log(
      settings.resume
        ? "Résumé: HTTPS link configured. Verify the external file manually before publishing."
        : "Résumé: optional; link hidden until a real file is configured.",
    );
  }
  console.log(
    "External API keys / database: not required by this static portfolio.",
  );
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 1;
}
