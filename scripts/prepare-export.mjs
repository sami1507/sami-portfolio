import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { securityHeaders } from "./security-headers.mjs";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    ),
  );
  return files.flat();
}
export async function prepareExport({ directory = path.resolve("out") } = {}) {
  const root = path.resolve(directory);
  const files = await walk(root);
  const pages = files.filter((file) => file.endsWith(".html"));
  if (!files.includes(path.join(root, "index.html")))
    throw new Error("Static export is missing index.html.");
  const common = Object.entries(securityHeaders()).filter(
    ([name]) => name !== "Content-Security-Policy",
  );
  const rules = [
    "/*",
    ...common.map(([name, value]) => `  ${name}: ${value}`),
    "",
    "/_next/static/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
    "/health.json",
    "  Cache-Control: no-cache",
    "",
  ];
  // Matching _headers rules are merged by static hosts. Keep no-cache off the
  // wildcard rule so it cannot conflict with immutable versioned Next assets.
  let ruleCount = 3;
  for (const page of pages) {
    const relative = path.relative(root, page).split(path.sep).join("/");
    const html = await readFile(page, "utf8");
    const policy = `  Content-Security-Policy: ${securityHeaders(html)["Content-Security-Policy"]}`;
    if (policy.length > 2000)
      throw new Error(
        `CSP exceeds the static host header-line limit for ${relative}.`,
      );
    const paths =
      relative === "index.html"
        ? ["/", "/index.html"]
        : relative.endsWith("/index.html")
          ? [`/${relative.slice(0, -10)}`, `/${relative}`]
          : [`/${relative}`];
    for (const route of paths) {
      rules.push(route, policy, "  Cache-Control: no-cache", "");
      ruleCount++;
    }
  }
  if (ruleCount > 100)
    throw new Error(
      "Static header rules exceed the host limit; split the hosting configuration before release.",
    );
  await writeFile(path.join(root, "_headers"), rules.join("\n"));
  await writeFile(
    path.join(root, "health.json"),
    JSON.stringify(
      {
        status: "ok",
        kind: "static-build",
        application: "sami-portfolio",
        locales: ["en", "ar", "he", "de"],
        htmlPages: pages.length,
      },
      null,
      2,
    ) + "\n",
  );
  return { htmlPages: pages.length, headerRules: ruleCount };
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const result = await prepareExport();
  console.log(
    `Prepared ${result.htmlPages} HTML pages, ${result.headerRules} static-host header rules and health.json.`,
  );
}
