import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { createStaticServer, parsePort } from "../scripts/serve.mjs";
import { securityHeaders } from "../scripts/security-headers.mjs";

const script = 'self.__next_f.push([1,"שלום — hello"]);';
const html = `<!doctype html><html><head><script src="/app.js"></script></head><body><h1>Portfolio</h1><script>${script}</script></body></html>`;
const temporaryParent = path.resolve(os.tmpdir());
let fixture;
let root;
let server;
let port;
let linksAvailable = true;

before(async () => {
  fixture = await mkdtemp(path.join(temporaryParent, "sami-server-test-"));
  root = path.join(fixture, "out");
  for (const folder of [
    root,
    path.join(root, "nested"),
    path.join(root, "with space"),
    path.join(root, "_next/static"),
    path.join(root, ".hidden"),
    path.join(fixture, "private"),
  ]) {
    await mkdir(folder, { recursive: true });
  }
  for (const [file, data] of Object.entries({
    "index.html": html,
    "404.html":
      "<!doctype html><h1>Missing page</h1><script>window.missing=true;</script>",
    "nested/index.html": html,
    "with space/index.html": html,
    "app.js": script,
    "style.css": "body{color:#123}",
    "data.json": '{"public":true}',
    "font.woff2": Buffer.from([0, 1, 2, 3, 4]),
    "_next/static/runtime.js": script,
    ".env": "fixture-private-value",
    ".hidden/visible.txt": "fixture-private-value",
    "credentials.json": '{"fixture":"private"}',
    "private.key": "fixture-private-value",
    "large.txt": "transfer fixture\n".repeat(300_000),
  }))
    await writeFile(path.join(root, file), data);
  await writeFile(
    path.join(fixture, "private/visible.txt"),
    "fixture-private-value",
  );
  try {
    await symlink(
      path.join(fixture, "private"),
      path.join(root, "escape"),
      "junction",
    );
    await symlink(
      path.join(root, ".hidden"),
      path.join(root, "hidden-alias"),
      "junction",
    );
  } catch (error) {
    if (!["EPERM", "EACCES", "ENOTSUP"].includes(error.code)) throw error;
    linksAvailable = false;
  }
  server = await createStaticServer({ directory: root });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  port = server.address().port;
});

after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  if (fixture) {
    // Remove only this invocation's freshly allocated fixture, never an arbitrary path.
    assert.equal(path.dirname(path.resolve(fixture)), temporaryParent);
    assert.ok(path.basename(fixture).startsWith("sami-server-test-"));
    await rm(fixture, { recursive: true, force: true, maxRetries: 2 });
  }
});

function request(target, { method = "GET", headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: target,
        method,
        headers,
        agent: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.once("error", reject);
        res.once("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    req.once("error", reject);
    req.setTimeout(5_000, () =>
      req.destroy(new Error("Fixture request timed out")),
    );
    req.end();
  });
}

test("GET serves the export and HEAD preserves representation headers without a body", async () => {
  const get = await request("/");
  const head = await request("/", { method: "HEAD" });
  assert.equal(get.status, 200);
  assert.equal(get.body.toString(), html);
  assert.match(get.headers["content-type"], /^text\/html; charset=utf-8$/);
  assert.equal(head.status, 200);
  assert.equal(head.body.length, 0);
  for (const header of [
    "content-type",
    "content-length",
    "vary",
    "content-security-policy",
    "cache-control",
  ]) {
    assert.equal(head.headers[header], get.headers[header], header);
  }
  assert.equal(Number(get.headers["content-length"]), Buffer.byteLength(html));
});

test("gzip is negotiated, round-trips UTF-8, and HEAD declares the same encoding", async () => {
  const headers = { "Accept-Encoding": "br, GZip; q=0.8" };
  const get = await request("/", { headers });
  const head = await request("/", { method: "HEAD", headers });
  assert.equal(get.headers["content-encoding"], "gzip");
  assert.equal(gunzipSync(get.body).toString(), html);
  assert.equal(get.headers.vary, "Accept-Encoding");
  assert.equal(head.headers["content-encoding"], "gzip");
  assert.equal(head.body.length, 0);
  assert.equal(head.headers["content-length"], undefined);
});

test("gzip exclusions, wildcard precedence, identity preference, and unacceptable encodings are respected", async () => {
  for (const value of [
    "gzip;q=0",
    "gzip;q=0, *;q=1",
    "gzip;q=invalid",
    "gzip;q=0.2, identity;q=1",
  ]) {
    const result = await request("/style.css", {
      headers: { "Accept-Encoding": value },
    });
    assert.equal(result.status, 200, value);
    assert.equal(result.headers["content-encoding"], undefined, value);
    assert.equal(result.headers.vary, "Accept-Encoding", value);
    assert.equal(result.body.toString(), "body{color:#123}");
  }
  const wildcard = await request("/style.css", {
    headers: { "Accept-Encoding": "*;q=0.5" },
  });
  assert.equal(wildcard.headers["content-encoding"], "gzip");
  const impossible = await request("/", {
    headers: { "Accept-Encoding": "gzip;q=0, identity;q=0" },
  });
  assert.equal(impossible.status, 406);
  assert.equal(impossible.headers.vary, "Accept-Encoding");
});

test("binary fonts retain MIME and identity bytes; versioned Next assets alone are immutable", async () => {
  const font = await request("/font.woff2", {
    headers: { "Accept-Encoding": "gzip" },
  });
  assert.equal(font.headers["content-type"], "font/woff2");
  assert.equal(font.headers["content-encoding"], undefined);
  assert.deepEqual(font.body, Buffer.from([0, 1, 2, 3, 4]));
  const next = await request("/_next/static/runtime.js");
  assert.equal(next.headers["content-type"], "text/javascript; charset=utf-8");
  assert.equal(
    next.headers["cache-control"],
    "public, max-age=31536000, immutable",
  );
  assert.equal(
    (await request("/data.json")).headers["cache-control"],
    "no-cache",
  );
});

test("directory redirects preserve the query, encode the path, and stay on the same origin", async () => {
  const response = await request("/nested?filter=a%20b&sort=desc");
  assert.equal(response.status, 308);
  assert.equal(response.headers.location, "/nested/?filter=a%20b&sort=desc");
  assert.equal(response.body.length, 0);
  assert.equal(
    (await request("/with%20space?q=1")).headers.location,
    "/with%20space/?q=1",
  );
  assert.equal((await request("/nested/")).status, 200);
  for (const target of [
    "//evil.example/nested",
    "/%2fevil.example/nested",
    "http://evil.example/",
  ]) {
    const bad = await request(target);
    assert.equal(bad.status, 400, target);
    assert.equal(bad.headers.location, undefined, target);
  }
});

test("malformed escapes, control characters, Windows streams, and backslashes are rejected", async () => {
  for (const target of [
    "/%zz",
    "/%E0%A4%A",
    "/bad%00name",
    "/bad%0dname",
    "/folder%5cfile",
    "/style.css%3Asecret",
    "/bad%22name",
    "/bad%3fname",
  ]) {
    assert.equal((await request(target)).status, 400, target);
  }
});

test("raw and encoded parent traversal never resolve outside the public directory", async () => {
  for (const target of [
    "/../private/visible.txt",
    "/%2e%2e/private/visible.txt",
    "/nested/%2e%2e/index.html",
    "/.%2e%2fprivate/visible.txt",
  ]) {
    assert.equal((await request(target)).status, 403, target);
  }
});

test("hidden paths and private/non-public file types are not exposed", async () => {
  for (const target of [
    "/.env",
    "/%2eenv",
    "/.hidden/visible.txt",
    "/credentials.json",
    "/private.key",
    "/index.html.",
    "/NUL.txt",
  ]) {
    const result = await request(target);
    assert.equal(result.status, 404, target);
    assert.ok(
      !result.body.toString().includes("fixture-private-value"),
      target,
    );
  }
});

test("directory symlinks cannot escape the root or alias a hidden directory", async (t) => {
  if (!linksAvailable)
    return t.skip(
      "This environment does not permit directory symlinks/junctions.",
    );
  assert.equal((await request("/escape/visible.txt")).status, 403);
  assert.equal((await request("/escape")).status, 403);
  assert.equal((await request("/hidden-alias/visible.txt")).status, 404);
});

test("custom 404 uses HTML security headers and HEAD never transmits its body", async () => {
  const get = await request("/does-not-exist/");
  const head = await request("/does-not-exist/", { method: "HEAD" });
  assert.equal(get.status, 404);
  assert.match(get.body.toString(), /Missing page/);
  assert.match(get.headers["content-type"], /^text\/html/);
  assert.equal(head.status, 404);
  assert.equal(head.body.length, 0);
  assert.equal(head.headers["content-length"], get.headers["content-length"]);
});

test("only GET and HEAD are accepted", async () => {
  for (const method of ["POST", "PUT", "DELETE", "OPTIONS"]) {
    const result = await request("/", { method });
    assert.equal(result.status, 405, method);
    assert.equal(result.headers.allow, "GET, HEAD");
    assert.equal(result.headers["x-content-type-options"], "nosniff");
  }
});

test("CSP authorizes exact Next inline text without unsafe inline scripts and blocks unused capabilities", async () => {
  const response = await request("/");
  const hash = createHash("sha256").update(script).digest("base64");
  const policy = response.headers["content-security-policy"];
  const scriptDirective = policy
    .split(";")
    .find((entry) => entry.trim().startsWith("script-src "));
  assert.ok(scriptDirective.includes(`'sha256-${hash}'`));
  assert.ok(!scriptDirective.includes("unsafe-inline"));
  assert.ok(!scriptDirective.includes("unsafe-eval"));
  assert.match(policy, /frame-ancestors 'none'/);
  assert.match(policy, /base-uri 'none'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /connect-src 'self'/);
  assert.equal(response.headers["x-frame-options"], "DENY");
  assert.match(response.headers["permissions-policy"], /geolocation=\(\)/);
});

test("CSP hashes follow HTML newline normalization and handle quoted greater-than attributes", () => {
  const body = "window.example = 1;\nwindow.second = 2;\n";
  const document = `<script data-label="a > b">${body.replaceAll("\n", "\r\n")}</script>`;
  const hash = createHash("sha256").update(body).digest("base64");
  assert.ok(
    securityHeaders(document)["Content-Security-Policy"].includes(
      `'sha256-${hash}'`,
    ),
  );
});

test("CSP is regenerated for changed HTML rather than using stale script hashes", async () => {
  const changed = "window.updated=42;";
  await writeFile(
    path.join(root, "updated.html"),
    `<script data-note="x > y">${changed}</script>`,
  );
  const response = await request("/updated.html");
  const hash = createHash("sha256").update(changed).digest("base64");
  assert.ok(
    response.headers["content-security-policy"].includes(`'sha256-${hash}'`),
  );
  assert.equal(
    response.body.toString(),
    `<script data-note="x > y">${changed}</script>`,
  );
});

test("aborting a large response leaves the server usable", async () => {
  await new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: "127.0.0.1", port, path: "/large.txt", agent: false },
      (res) => {
        res.once("data", () => {
          res.destroy();
          req.destroy();
          resolve();
        });
        res.on("error", () => {});
      },
    );
    req.once("error", (error) => {
      if (error.code !== "ECONNRESET") reject(error);
    });
  });
  assert.equal((await request("/")).status, 200);
});

test("startup refuses missing exports and invalid ports with actionable errors", async () => {
  await assert.rejects(
    createStaticServer({ directory: path.join(fixture, "private") }),
    /Run npm run build/,
  );
  for (const value of ["", "0", "-1", "65536", "3000.5", "3e3", "abc"]) {
    assert.throws(() => parsePort(value), /PORT must be an integer/);
  }
  assert.equal(parsePort(), 3000);
  assert.equal(parsePort("65535"), 65535);
});

test("CLI reports an occupied port and exits unsuccessfully", async () => {
  const entry = fileURLToPath(new URL("../scripts/serve.mjs", import.meta.url));
  const child = spawn(process.execPath, [entry], {
    cwd: fixture,
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  assert.equal(code, 1);
  assert.match(stderr, /already in use/);
});
