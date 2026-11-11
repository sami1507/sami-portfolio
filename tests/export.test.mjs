import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prepareExport } from "../scripts/prepare-export.mjs";

async function fixture(t, pages) {
  const parent = path.resolve(os.tmpdir());
  const directory = await mkdtemp(path.join(parent, "sami-export-test-"));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(directory)), parent);
    assert.ok(path.basename(directory).startsWith("sami-export-test-"));
    await rm(directory, { recursive: true, force: true, maxRetries: 2 });
  });
  for (const [file, html] of Object.entries(pages)) {
    const target = path.join(directory, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  return directory;
}

function parseRules(source) {
  const rules = [];
  for (const line of source.split("\n")) {
    if (!line) continue;
    if (!line.startsWith(" ")) rules.push({ route: line, headers: [] });
    else {
      const colon = line.indexOf(":");
      rules
        .at(-1)
        .headers.push([
          line.slice(0, colon).trim().toLowerCase(),
          line.slice(colon + 1).trim(),
        ]);
    }
  }
  return rules;
}

// Cloudflare combines headers from all matching rules; a specific route does
// not replace the same header set by a wildcard rule.
function matchingValues(rules, url, header) {
  return rules
    .filter(({ route }) =>
      route.endsWith("*") ? url.startsWith(route.slice(0, -1)) : route === url,
    )
    .flatMap(({ headers }) =>
      headers.filter(([name]) => name === header).map(([, value]) => value),
    );
}

test("static headers give immutable assets one cache policy and each HTML route its own CSP", async (t) => {
  const scripts = {
    home: "self.home=1;",
    arabic: "self.arabic=2;",
    study: "self.study=3;",
  };
  const directory = await fixture(t, {
    "index.html": `<script>${scripts.home}</script>`,
    "ar/index.html": `<script>${scripts.arabic}</script>`,
    "projects/pathy/index.html": `<script>${scripts.study}</script>`,
    "404.html": "<h1>Not found</h1>",
  });
  const result = await prepareExport({ directory });
  const rules = parseRules(
    await readFile(path.join(directory, "_headers"), "utf8"),
  );
  assert.equal(result.htmlPages, 4);
  assert.equal(result.headerRules, 10);
  assert.deepEqual(
    matchingValues(rules, "/_next/static/app.js", "cache-control"),
    ["public, max-age=31536000, immutable"],
  );
  assert.deepEqual(
    matchingValues(rules, "/_next/static/app.js", "content-security-policy"),
    [],
  );
  assert.deepEqual(matchingValues(rules, "/health.json", "cache-control"), [
    "no-cache",
  ]);
  const routes = {
    "/": scripts.home,
    "/index.html": scripts.home,
    "/ar/": scripts.arabic,
    "/ar/index.html": scripts.arabic,
    "/projects/pathy/": scripts.study,
  };
  for (const [route, script] of Object.entries(routes)) {
    assert.deepEqual(
      matchingValues(rules, route, "cache-control"),
      ["no-cache"],
      route,
    );
    const policies = matchingValues(rules, route, "content-security-policy");
    assert.equal(policies.length, 1, route);
    const hash = createHash("sha256").update(script).digest("base64");
    assert.ok(policies[0].includes(`'sha256-${hash}'`), route);
    assert.deepEqual(
      matchingValues(rules, route, "x-content-type-options"),
      ["nosniff"],
      route,
    );
  }
  const health = JSON.parse(
    await readFile(path.join(directory, "health.json"), "utf8"),
  );
  assert.equal(health.htmlPages, 4);
  assert.equal(health.status, "ok");
});

test("preparation fails explicitly when an export is missing or exceeds host header limits", async (t) => {
  const missing = await fixture(t, { "404.html": "<h1>Missing</h1>" });
  await assert.rejects(
    prepareExport({ directory: missing }),
    /missing index.html/,
  );
  const oversized = await fixture(t, {
    "index.html": Array.from(
      { length: 40 },
      (_, i) => `<script>self.value=${i};</script>`,
    ).join(""),
  });
  await assert.rejects(
    prepareExport({ directory: oversized }),
    /header-line limit/,
  );
  const pages = { "index.html": "<h1>Home</h1>" };
  for (let i = 0; i < 49; i++)
    pages[`project-${i}/index.html`] = "<h1>Project</h1>";
  const excessive = await fixture(t, pages);
  await assert.rejects(
    prepareExport({ directory: excessive }),
    /header rules exceed/,
  );
});
