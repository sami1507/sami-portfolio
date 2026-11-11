import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const output = resolve("public/images");
await mkdir(output, { recursive: true });
const sources = [
  ["map-trails.png", "pathy-map.webp"],
  ["discover-en.png", "pathy-discover.webp"],
  ["trail-details-offline.png", "pathy-offline.webp"],
  ["guidance-offline.png", "pathy-guidance.webp"],
];
for (const [source, target] of sources) {
  await sharp(resolve("../docs/screenshots", source))
    .resize({ width: 540, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(resolve(output, target));
}
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0C1012"/><g fill="none" stroke="#344638" stroke-width="1">${Array.from({ length: 12 }, (_, i) => `<path d="M${720 + i * 22} -50 C${400 + i * 25} 200,${1100 + i * 12} 300,${800 + i * 22} 700"/>`).join("")}</g><rect x="70" y="70" width="9" height="9" rx="4.5" fill="#B8F16C"/><text x="98" y="85" font-family="Arial,sans-serif" font-size="20" fill="#F4F1E9">SAMI ABU RAAED</text><text x="70" y="255" font-family="Arial,sans-serif" font-size="79" letter-spacing="-4" fill="#F4F1E9">Building useful</text><text x="70" y="350" font-family="Arial,sans-serif" font-size="79" letter-spacing="-4" fill="#B8F16C">digital experiences.</text><path d="M76 440h1048" stroke="#344638"/><text x="70" y="506" font-family="Arial,sans-serif" font-size="22" fill="#A1ABA9">Software Developer / Android · Web · AI</text><text x="1080" y="110" font-family="Arial,sans-serif" font-size="45" fill="#B8F16C">↗</text></svg>`;
await sharp(Buffer.from(cover)).png().toFile(resolve(output, "og-cover.png"));
const icon = await readFile(resolve("public/favicon.svg"));
await sharp(icon).resize(64, 64).png().toFile(resolve("public/favicon.png"));
await sharp(icon)
  .resize(180, 180)
  .png()
  .toFile(resolve("public/apple-touch-icon.png"));
console.log(
  "Optimized original PATHY captures and generated social/favicon assets.",
);
