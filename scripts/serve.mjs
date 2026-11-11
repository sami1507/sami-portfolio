import http from "node:http";
import { open, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { pathToFileURL } from "node:url";
import { createGzip } from "node:zlib";
import { securityHeaders } from "./security-headers.mjs";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};
const compressible = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".txt",
  ".xml",
  ".svg",
  ".webmanifest",
]);
const privateNames = new Set([
  "credentials.json",
  "secrets.json",
  "package.json",
  "package-lock.json",
  "id_rsa",
  "id_ed25519",
]);
const missingCodes = new Set(["ENOENT", "ENOTDIR", "EACCES", "EPERM"]);

function within(root, file) {
  const relative = path.relative(root, file);
  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`)
  );
}

function privatePath(relative) {
  return relative
    .split(/[\\/]/)
    .some(
      (segment) =>
        segment.startsWith(".") || privateNames.has(segment.toLowerCase()),
    );
}

class HttpError extends Error {
  constructor(status) {
    super(http.STATUS_CODES[status]);
    this.status = status;
  }
}

function requestPath(target) {
  // URL() normalizes dot segments before they can be rejected; parse origin-form directly.
  if (
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("#")
  ) {
    throw new HttpError(400);
  }
  const question = target.indexOf("?");
  const rawPath = question < 0 ? target : target.slice(0, question);
  const query = question < 0 ? "" : target.slice(question);
  let pathname;
  try {
    pathname = decodeURIComponent(rawPath);
  } catch {
    throw new HttpError(400);
  }
  if (
    pathname.startsWith("//") ||
    /[\\:"<>|?*\u0000-\u001f\u007f]/.test(pathname)
  ) {
    throw new HttpError(400);
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === ".."))
    throw new HttpError(403);
  // Prevent hidden files and Windows aliases (trailing dots/spaces and device names).
  if (
    privatePath(segments.join("/")) ||
    segments.some(
      (segment) =>
        /[. ]$/.test(segment) ||
        /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment),
    )
  )
    throw new HttpError(404);
  return { segments, query, trailingSlash: pathname.endsWith("/") };
}

function encoding(header, canCompress) {
  const values = new Map();
  for (const item of String(header || "")
    .toLowerCase()
    .split(",")) {
    const [name, ...parameters] = item.trim().split(";");
    if (!name) continue;
    let quality = 1;
    for (const parameter of parameters) {
      const match = parameter.trim().match(/^q\s*=\s*(.*)$/);
      if (match)
        quality = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(match[1])
          ? Number(match[1])
          : 0;
    }
    values.set(name.trim(), quality);
  }
  const gzip = values.get("gzip") ?? values.get("*") ?? 0;
  const identity = values.get("identity") ?? (values.get("*") === 0 ? 0 : 1);
  if (canCompress && gzip > 0 && (!values.has("identity") || gzip >= identity))
    return "gzip";
  if (identity > 0) return "identity";
  return canCompress && gzip > 0 ? "gzip" : null;
}

function textResponse(req, res, status, extra = {}) {
  if (res.destroyed || res.headersSent) return;
  const body = Buffer.from(http.STATUS_CODES[status] || "Error");
  res.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    ...extra,
  });
  res.end(req.method === "HEAD" ? undefined : body);
}

/** Build an unbound, read-only static server; importing this module does not listen. */
export async function createStaticServer({
  directory = path.resolve("out"),
} = {}) {
  let root;
  try {
    root = await realpath(directory);
    const entry = await realpath(path.join(root, "index.html"));
    if (
      !within(root, entry) ||
      privatePath(path.relative(root, entry)) ||
      !(await stat(entry)).isFile()
    )
      throw new Error();
  } catch {
    throw new Error(
      "Missing or unsafe out/index.html. Run npm run build before npm start.",
    );
  }

  async function resolveFile(file) {
    let resolved;
    try {
      resolved = await realpath(file);
    } catch (error) {
      if (missingCodes.has(error.code)) return null;
      throw error;
    }
    if (!within(root, resolved)) throw new HttpError(403);
    if (privatePath(path.relative(root, resolved))) throw new HttpError(404);
    return { file: resolved, info: await stat(resolved) };
  }

  async function replyFile(req, res, file, status = 200) {
    const extension = path.extname(file).toLowerCase();
    if (!mime[extension]) throw new HttpError(404);
    const selectedEncoding = encoding(
      req.headers["accept-encoding"],
      compressible.has(extension),
    );
    if (!selectedEncoding)
      return textResponse(req, res, 406, { Vary: "Accept-Encoding" });
    const handle = await open(file, "r");
    try {
      const info = await handle.stat();
      if (!info.isFile()) throw new HttpError(404);
      const html =
        extension === ".html" || extension === ".htm"
          ? await handle.readFile()
          : null;
      if (req.aborted || res.destroyed) return;
      const relative = path.relative(root, file).split(path.sep).join("/");
      res.writeHead(status, {
        ...securityHeaders(html ? html.toString("utf8") : ""),
        "Content-Type": mime[extension],
        Vary: "Accept-Encoding",
        ...(selectedEncoding === "gzip"
          ? { "Content-Encoding": "gzip" }
          : { "Content-Length": html ? html.length : info.size }),
        "Cache-Control":
          relative.startsWith("_next/static/") && status === 200
            ? "public, max-age=31536000, immutable"
            : "no-cache",
      });
      if (req.method === "HEAD") return res.end();
      // Hash and send the same HTML buffer. Other assets stream from one open handle.
      const stream = html
        ? Readable.from([html])
        : handle.createReadStream({ autoClose: false });
      if (selectedEncoding === "gzip")
        await pipeline(stream, createGzip(), res);
      else await pipeline(stream, res);
    } finally {
      await handle.close();
    }
  }

  async function notFound(req, res) {
    try {
      const fallback = await resolveFile(path.join(root, "404.html"));
      if (fallback?.info.isFile())
        return await replyFile(req, res, fallback.file, 404);
    } catch (error) {
      if (!(error instanceof HttpError) && !missingCodes.has(error.code))
        throw error;
    }
    textResponse(req, res, 404);
  }

  const server = http.createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method || ""))
      return textResponse(req, res, 405, { Allow: "GET, HEAD" });
    try {
      const { segments, query, trailingSlash } = requestPath(req.url || "/");
      const candidate = path.resolve(root, ...segments);
      if (!within(root, candidate)) throw new HttpError(403);
      const entry = await resolveFile(candidate);
      if (entry?.info.isDirectory()) {
        if (!trailingSlash) {
          // Re-encoding guarantees a same-origin Location, including encoded slashes.
          const location = `/${segments.map(encodeURIComponent).join("/")}/${query}`;
          res.writeHead(308, {
            ...securityHeaders(),
            Location: location,
            "Content-Length": 0,
            "Cache-Control": "no-cache",
          });
          return res.end();
        }
        const index = await resolveFile(path.join(entry.file, "index.html"));
        if (index?.info.isFile()) return await replyFile(req, res, index.file);
      } else if (entry?.info.isFile())
        return await replyFile(req, res, entry.file);
      await notFound(req, res);
    } catch (error) {
      // Aborted clients terminate pipelines; do not write again on closed sockets.
      if (res.destroyed || req.aborted) return;
      if (res.headersSent) return res.destroy();
      if (error instanceof HttpError && error.status === 404)
        return notFound(req, res).catch(() => textResponse(req, res, 500));
      textResponse(req, res, error instanceof HttpError ? error.status : 500);
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;
  return server;
}

export function parsePort(value = "3000") {
  if (
    !/^\d+$/.test(String(value)) ||
    Number(value) < 1 ||
    Number(value) > 65535
  ) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return Number(value);
}

async function main() {
  const port = parsePort(process.env.PORT);
  const host = process.env.HOST || "127.0.0.1";
  const server = await createStaticServer();
  await new Promise((resolve, reject) => {
    server.once("error", (error) =>
      reject(
        new Error(
          error.code === "EADDRINUSE"
            ? `Port ${port} on ${host} is already in use.`
            : `Could not listen on ${host}:${port} (${error.code || error.message}).`,
        ),
      ),
    );
    server.listen(port, host, resolve);
  });
  const shownHost = host.includes(":") ? `[${host}]` : host;
  console.log(`Production static preview: http://${shownHost}:${port}`);
  const shutdown = () => {
    server.close();
    setTimeout(() => server.closeAllConnections(), 2_000).unref();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    console.error(`Unable to start static preview: ${error.message}`);
    process.exitCode = 1;
  });
}
