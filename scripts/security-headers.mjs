import { createHash } from "node:crypto";

/**
 * Next's exported HTML contains inline bootstrap scripts. Hash the exact script
 * text from the response instead of allowing arbitrary inline JavaScript.
 * Static hosting adapters can reuse this function with each emitted HTML file.
 */
export function securityHeaders(html = "") {
  const hashes = new Set();
  const scripts =
    /<script\b(?:[^"'<>]|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script\s*>/gi;
  // The HTML parser normalizes CRLF/CR before evaluating script text.
  for (const match of html.replace(/\r\n?/g, "\n").matchAll(scripts)) {
    if (match[1].length) {
      hashes.add(
        `'sha256-${createHash("sha256").update(match[1], "utf8").digest("base64")}'`,
      );
    }
  }
  const policy = [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'none'",
    `script-src 'self' ${[...hashes].sort().join(" ")}`.trim(),
    "script-src-attr 'none'",
    // Inline styles support framework-generated style attributes; scripts stay hashed.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'none'",
  ].join("; ");
  return {
    "Content-Security-Policy": policy,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  };
}
