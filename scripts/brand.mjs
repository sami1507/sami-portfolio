import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The logo is vector geometry. No remote assets, system fonts, or font converters
// are involved in its export. The website's approved Mark remains the source.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = resolve(root, "public/brand");
await mkdir(destination, { recursive: true });
const iconSource = await readFile(
  resolve(root, "src/components/Icons.tsx"),
  "utf8",
);
const markSection = iconSource.match(
  /export function Mark\(\)[\s\S]*?(?=export function)/,
)?.[0];
const markPath = markSection?.match(/\bd="([^"]+)"/)?.[1];
const approvedPath =
  "M29 10H16a6 6 0 0 0 0 12h8a4 4 0 1 1 0 8H11M20 30 30 10l9 20M26 24h10";
if (
  markPath !== approvedPath ||
  !markSection.includes('cx="8" cy="30" r="2"')
) {
  throw new Error(
    "The website Mark has changed. Review the brand exports before regenerating them.",
  );
}

const palette = {
  charcoal: "#0C1012",
  ivory: "#F4F1E9",
  secondary: "#A1ABA9",
  lime: "#B8F16C",
  success: "#B8F16C",
  warning: "#F0CA72",
  error: "#FFAEA5",
};
const variants = [
  {
    name: "on-dark",
    mark: palette.lime,
    lettering: palette.ivory,
    background: palette.charcoal,
  },
  {
    name: "on-light",
    mark: palette.charcoal,
    lettering: palette.charcoal,
    background: palette.ivory,
  },
  {
    name: "mono-white",
    mark: "#FFFFFF",
    lettering: "#FFFFFF",
    background: palette.charcoal,
  },
  {
    name: "mono-black",
    mark: "#000000",
    lettering: "#000000",
    background: "#FFFFFF",
  },
];
const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${escapeXml(title)}</title>${body}</svg>`;
}
function mark(color) {
  return `<g fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"><path d="${markPath}"/></g><circle cx="8" cy="30" r="2" fill="${color}"/>`;
}

// Custom monoline capitals for the vector wordmark. These are drawing paths,
// not outlines extracted from Manrope, IBM Plex, Heebo, or another font.
const letters = {
  A: [32, "M1 38 16 2 31 38M6 26h20"],
  B: [30, "M2 38V2h13c17 0 17 18 0 18H2m13 0c19 0 19 18 0 18H2"],
  C: [30, "M28 5C2-6-8 46 28 35"],
  D: [32, "M2 38V2h9c26 0 26 36 0 36H2"],
  E: [28, "M26 2H2v36h24M2 20h19"],
  F: [28, "M26 2H2v36M2 20h19"],
  G: [32, "M29 6C1-8-9 49 29 35V21H18"],
  H: [32, "M2 2v36M30 2v36M2 20h28"],
  I: [6, "M3 2v36"],
  J: [26, "M24 2v25C24 42 2 42 2 27"],
  K: [30, "M2 2v36M28 2 2 23m10-9 17 24"],
  L: [28, "M2 2v36h24"],
  M: [36, "M2 38V2l16 21L34 2v36"],
  N: [32, "M2 38V2l28 36V2"],
  O: [34, "M17 2C-3 2-3 38 17 38S37 2 17 2Z"],
  P: [30, "M2 38V2h12c19 0 19 19 0 19H2"],
  Q: [34, "M17 2C-3 2-3 38 17 38S37 2 17 2ZM21 27l12 12"],
  R: [32, "M2 38V2h12c19 0 19 19 0 19H2m13 0 15 17"],
  S: [30, "M28 3H11C-2 3-2 20 11 20h8c15 0 15 17 0 17H2"],
  T: [30, "M1 2h28M15 2v36"],
  U: [32, "M2 2v23c0 18 28 18 28 0V2"],
  V: [32, "M1 2 16 38 31 2"],
  W: [44, "M1 2 11 38 22 13 33 38 43 2"],
  X: [30, "M1 2 29 38M29 2 1 38"],
  Y: [30, "M1 2 15 21 29 2M15 21v17"],
  Z: [30, "M2 2h26L2 38h26"],
  0: [28, "M14 2C-2 2-2 38 14 38S30 2 14 2ZM4 32 24 8"],
  1: [20, "M2 9 11 2v36M2 38h18"],
  2: [28, "M2 10C2-2 26-2 26 10c0 10-24 17-24 28h24"],
  3: [28, "M2 3h24L13 18c19-3 19 23-10 19"],
  4: [28, "M21 38V2L1 27h27"],
  5: [28, "M26 2H3v16c32-7 32 26-1 19"],
  6: [28, "M24 3C-3-5-7 43 17 38c20-5 5-29-14-14"],
  7: [28, "M1 2h26L9 38"],
  8: [
    28,
    "M14 2C-1 2-1 20 14 20S29 2 14 2ZM14 20C-3 20-3 38 14 38S31 20 14 20Z",
  ],
  9: [28, "M4 37C31 45 35-3 11 2-9 7 6 31 25 16"],
  " ": [18, ""],
  "/": [20, "M1 38 19 2"],
  "-": [22, "M2 20h18"],
  "+": [26, "M2 20h22M13 9v22"],
  ".": [6, "M3 36v2"],
  "#": [30, "M11 2 5 38M25 2 19 38M2 14h27M1 27h27"],
};
function vectorText(text, x, y, height, color, tracking = 8, weight = 2.6) {
  let cursor = 0;
  const paths = [...text.toUpperCase()]
    .map((letter) => {
      const glyph = letters[letter];
      if (!glyph) throw new Error(`No custom vector glyph for ${letter}`);
      const result = glyph[1]
        ? `<path transform="translate(${cursor} 0)" d="${glyph[1]}"/>`
        : "";
      cursor += glyph[0] + tracking;
      return result;
    })
    .join("");
  return `<g transform="translate(${x} ${y}) scale(${height / 40})" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`;
}
function lockup(variant) {
  return `<g transform="translate(26 20) scale(3.75)">${mark(variant.mark)}</g>${vectorText("SAMI", 224, 45, 76, variant.lettering, 10, 3)}${vectorText("ABU RAAED", 226, 140, 20, variant.lettering, 9, 3.1)}`;
}
function icon(variant) {
  return `<g transform="translate(-.2 3.3) scale(1.4)">${mark(variant.mark)}</g>`;
}
const assets = [];
async function writeSvgAndPng(name, xml, sizes) {
  const svgName = `${name}.svg`;
  await writeFile(resolve(destination, svgName), xml + "\n", "utf8");
  assets.push({
    file: svgName,
    format: "svg",
    sha256: createHash("sha256")
      .update(xml + "\n")
      .digest("hex"),
  });
  for (const [width, height, suffix = ""] of sizes) {
    const pngName = `${name}${suffix}.png`;
    const bytes = await sharp(Buffer.from(xml))
      .resize(width, height)
      .png()
      .toBuffer();
    await writeFile(resolve(destination, pngName), bytes);
    const metadata = await sharp(bytes).metadata();
    const { data, info } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let transparent = 0;
    let visible = 0;
    for (let i = 3; i < data.length; i += info.channels) {
      if (data[i] === 0) transparent++;
      if (data[i] > 0) visible++;
    }
    if (!visible || metadata.width !== width || metadata.height !== height)
      throw new Error(`Bad export ${pngName}`);
    assets.push({
      file: pngName,
      format: "png",
      width,
      height,
      hasAlpha: metadata.hasAlpha,
      transparentPixels: transparent,
      visiblePixels: visible,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
}
for (const variant of variants) {
  await writeSvgAndPng(
    `sami-lockup-${variant.name}`,
    svg(600, 200, `Sami Abu Raaed logo / ${variant.name}`, lockup(variant)),
    [[1200, 400]],
  );
  await writeSvgAndPng(
    `sami-icon-${variant.name}`,
    svg(64, 64, `Sami Abu Raaed monogram / ${variant.name}`, icon(variant)),
    [
      [512, 512],
      [256, 256, "-256"],
      [64, 64, "-64"],
      [32, 32, "-32"],
    ],
  );
}

// Use the exact approved mark for browser/bookmark surfaces too. Their opaque
// charcoal tile is intentional; standalone brand assets remain transparent.
const tile = `<rect width="64" height="64" rx="16" fill="${palette.charcoal}"/>${icon(variants[0])}`;
const favicon = svg(64, 64, "Sami Abu Raaed", tile);
await writeFile(resolve(root, "public/favicon.svg"), favicon + "\n", "utf8");
await sharp(Buffer.from(favicon))
  .resize(64, 64)
  .png()
  .toFile(resolve(root, "public/favicon.png"));
await sharp(Buffer.from(favicon))
  .resize(180, 180)
  .png()
  .toFile(resolve(root, "public/apple-touch-icon.png"));

const label = (text, x, y, color = palette.secondary, height = 11) =>
  vectorText(text, x, y, height, color, 7, 2.3);
let sheet = `<rect width="1440" height="1240" fill="${palette.charcoal}"/>`;
sheet += label("SAMI ABU RAAED / IDENTITY SYSTEM", 56, 36, palette.ivory, 18);
sheet += label(
  "APPROVED SA MARK + CUSTOM VECTOR LETTERING",
  56,
  75,
  palette.secondary,
  11,
);
sheet += `<path d="M56 112H1384" stroke="#344638"/>`;
sheet += `<g transform="translate(48 126) scale(1.35)">${lockup(variants[0])}</g>`;
sheet += `<path d="M1000 170C1180 110 1140 320 1324 275" fill="none" stroke="${palette.lime}" stroke-width="1.2"/><circle cx="1000" cy="170" r="4" fill="${palette.lime}"/><circle cx="1324" cy="275" r="4" fill="${palette.lime}"/>`;
sheet += label("01 / PRIMARY ON DARK", 914, 338, palette.secondary, 11);

variants.forEach((variant, index) => {
  const x = 56 + (index % 2) * 680;
  const y = 428 + Math.floor(index / 2) * 235;
  sheet += `<rect x="${x}" y="${y}" width="648" height="204" rx="12" fill="${variant.background}" stroke="#344638"/>`;
  sheet += `<g transform="translate(${x + 5} ${y - 4}) scale(.85)">${lockup(variant)}</g>`;
  const caption = `${String(index + 1).padStart(2, "0")} / ${variant.name.replaceAll("-", " ")}`;
  sheet += label(caption, x + 28, y + 177, variant.lettering, 10);
});
sheet += label("ICON / ACTUAL PIXEL SIZES", 56, 930, palette.ivory, 12);
let smallX = 56;
for (const size of [16, 24, 32, 48, 64]) {
  sheet += `<g transform="translate(${smallX} 971) scale(${size / 64})">${tile}</g>`;
  sheet += label(String(size), smallX, 1050, palette.secondary, 10);
  smallX += size + 48;
}
sheet += label(
  "USE THE ICON ALONE BELOW 360 PX LOCKUP WIDTH",
  680,
  965,
  palette.secondary,
  10,
);
sheet += label(
  "MINIMUM ICON 32 PX / FAVICON EXCEPTION 16 PX",
  680,
  995,
  palette.secondary,
  10,
);
sheet += `<path d="M56 1090H1384" stroke="#344638"/>`;
const swatches = [
  ["CHARCOAL", palette.charcoal],
  ["IVORY", palette.ivory],
  ["SECONDARY", palette.secondary],
  ["LIME / SUCCESS", palette.lime],
  ["WARNING", palette.warning],
  ["ERROR", palette.error],
];
swatches.forEach(([name, color], index) => {
  const x = 56 + index * 224;
  sheet += `<rect x="${x}" y="1124" width="200" height="30" rx="4" fill="${color}" stroke="#344638"/>`;
  sheet += label(name, x, 1168, palette.ivory, 9);
  sheet += label(color, x, 1190, palette.secondary, 10);
});
await writeSvgAndPng(
  "brand-contact-sheet",
  svg(
    1440,
    1240,
    "Sami Abu Raaed brand contact sheet with logo variants, actual-size icons and palette",
    sheet,
  ),
  [[1440, 1240]],
);

function luminance(hex) {
  const values = hex
    .slice(1)
    .match(/../g)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a, b) {
  const [bright, dark] = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return Number(((bright + 0.05) / (dark + 0.05)).toFixed(2));
}
const manifest = {
  source: "src/components/Icons.tsx#Mark",
  approvedMarkPath: markPath,
  renderer: `sharp ${sharp.versions.sharp} / libvips ${sharp.versions.vips}`,
  logoText: "Custom vector paths; no font dependencies",
  palette,
  contrastOnCharcoal: Object.fromEntries(
    Object.entries(palette)
      .filter(([name]) => name !== "charcoal")
      .map(([name, color]) => [name, contrast(color, palette.charcoal)]),
  ),
  assets,
};
await writeFile(
  resolve(destination, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8",
);
const transparentExports = assets.filter(
  (asset) => asset.format === "png" && asset.file !== "brand-contact-sheet.png",
);
if (
  transparentExports.some(
    (asset) => !asset.hasAlpha || !asset.transparentPixels,
  )
)
  throw new Error("A standalone logo export lost transparency");
console.log(
  JSON.stringify(
    {
      assets: assets.length,
      transparentLogoPngs: transparentExports.length,
      contrastOnCharcoal: manifest.contrastOnCharcoal,
      contactSheet: "public/brand/brand-contact-sheet.png",
      unifiedFavicons: true,
    },
    null,
    2,
  ),
);
