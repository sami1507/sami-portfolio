import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream";

const root = path.resolve("out");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
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

if (!existsSync(path.join(root, "index.html"))) {
  console.error("Missing out/index.html. Run npm run build before npm start.");
  process.exit(1);
}

async function replyFile(req, res, file, status = 200) {
  const info = await stat(file);
  const compress =
    /\b(?:gzip)\b/.test(req.headers["accept-encoding"] || "") &&
    /\.(?:html|css|js|mjs|json|txt|xml|svg)$/.test(file);
  res.writeHead(status, {
    "Content-Type":
      mime[path.extname(file).toLowerCase()] || "application/octet-stream",
    ...(compress
      ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" }
      : { "Content-Length": info.size }),
    "Cache-Control": file.includes(
      `${path.sep}_next${path.sep}static${path.sep}`,
    )
      ? "public, max-age=31536000, immutable"
      : "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (req.method === "HEAD") return res.end();
  const stream = createReadStream(file);
  if (compress) pipeline(stream, createGzip(), res, () => {});
  else pipeline(stream, res, () => {});
}

const server = http.createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method || "")) {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url || "/", `http://${host}:${port}`).pathname,
    );
    if (pathname.includes("\0") || pathname.includes("\\")) {
      res.writeHead(400).end("Bad request");
      return;
    }
    const file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res
          .writeHead(308, {
            Location: `${pathname}/${new URL(req.url, `http://${host}:${port}`).search}`,
          })
          .end();
        return;
      }
      const index = path.join(file, "index.html");
      if (existsSync(index)) return await replyFile(req, res, index);
    } else if (info?.isFile()) return await replyFile(req, res, file);
    const notFound = path.join(root, "404.html");
    if (existsSync(notFound)) return await replyFile(req, res, notFound, 404);
    res
      .writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Not found");
  } catch {
    res
      .writeHead(400, { "Content-Type": "text/plain; charset=utf-8" })
      .end("Bad request");
  }
});

server.listen(port, host, () =>
  console.log(`Production static preview: http://${host}:${port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
