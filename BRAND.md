# Sami Abu Raaed — brand assets

The identity pairs an interlocking **SA** path with restrained typography and a thin route motif. The approved monogram remains the exact path and dot from `src/components/Icons.tsx`, including its stroke width and joins. The export script adds space around it; it does not redraw the mark.

The full lockup reads **SAMI / ABU RAAED**. Its geometric capitals are custom SVG paths, so the logo does not depend on installed fonts. The name stays in Latin characters in the brand assets; the website's surrounding content uses the reader's selected language.

## Ready-to-use files

All standalone logo files have transparent backgrounds. “On dark” and “on light” describe the intended surface, not a background baked into the file.

| Use                        | Files in `public/brand/`                            | Appearance                                         |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Primary full logo          | `sami-lockup-on-dark.svg` / `.png`                  | Lime mark, ivory lettering                         |
| Full logo on pale surfaces | `sami-lockup-on-light.svg` / `.png`                 | Charcoal mark and lettering                        |
| One-color light logo       | `sami-lockup-mono-white.svg` / `.png`               | Pure white                                         |
| One-color dark logo        | `sami-lockup-mono-black.svg` / `.png`               | Pure black                                         |
| Standalone monogram        | `sami-icon-{variant}.svg` / `.png`                  | The same four variants                             |
| Small raster monograms     | `sami-icon-{variant}-256.png`, `-64.png`, `-32.png` | Explicit pixel sizes                               |
| Visual reference           | `brand-contact-sheet.svg` / `.png`                  | Variants, actual-size icons, palette               |
| Technical inventory        | `manifest.json`                                     | Dimensions, alpha checks, SHA-256 hashes, contrast |

Full-logo SVGs use a **600 × 200** viewBox; their PNGs are **1200 × 400**. Icon SVGs use **64 × 64**; the unsuffixed icon PNG is **512 × 512**. The contact sheet is **1440 × 1240**.

Use SVG for web layouts and scalable print artwork. Use PNG when an application cannot accept SVG. Keep the original aspect ratio. The SVGs contain vector paths rather than editable text; update the script when lettering needs to change.

Browser assets at `public/favicon.svg`, `public/favicon.png` (64 × 64), and `public/apple-touch-icon.png` (180 × 180) use the same approved mark on a charcoal tile with rounded corners. Their background is intentional. The existing social image `public/images/og-cover.png` remains unchanged.

## Size, spacing, and placement

- Display the full lockup at **360 CSS pixels wide or larger**, so the secondary name stays readable. Below that size, use the monogram with the person's name as ordinary adjacent text when needed.
- Display the monogram at **32 × 32 CSS pixels or larger** in normal layouts. The browser favicon is the limited 16-pixel exception; it functions as a recognizable symbol, not readable initials or a substitute for a page title.
- Keep clearspace of at least **4 units of the original 40-unit monogram viewBox**, scaled with the mark, between the visible artwork and other content. Existing export padding is part of the asset; do not trim tightly against the stroke or dot.
- Keep strokes, the dot, proportions, and lettering spacing intact. Do not stretch, rotate, add glow, use gradients, or separate the dot from the mark.
- Place the lime/ivory version on charcoal or another verified dark surface. Use charcoal or black on pale surfaces. Avoid lime artwork on ivory: it lacks enough contrast for this identity's small details.
- Place the lockup on a quiet surface. If using photography, put it on a solid panel instead of over a busy crop.
- In RTL interfaces, keep the internal Latin lockup direction unchanged and position the asset using the surrounding layout. Do not mirror the monogram or letters.

The contact sheet includes actual-size samples at 16, 24, 32, 48, and 64 pixels. Review the intended size on its final surface; a large preview does not establish small-size legibility.

## Palette and semantic colors

| Token / purpose                           | Hex       | Contrast against charcoal |
| ----------------------------------------- | --------- | ------------------------- |
| Charcoal — page background                | `#0C1012` | —                         |
| Ivory — primary text                      | `#F4F1E9` | 16.94:1                   |
| Secondary — supporting text               | `#A1ABA9` | 8.11:1                    |
| Lime — selected actions and small accents | `#B8F16C` | 14.42:1                   |
| Success                                   | `#B8F16C` | 14.42:1                   |
| Warning                                   | `#F0CA72` | 12.20:1                   |
| Error                                     | `#FFAEA5` | 10.79:1                   |

Ratios above are calculated from the solid sRGB hex values using relative luminance; they are not measurements of text rendered over translucent layers or images. Ivory, secondary, lime, warning, and error all exceed 4.5:1 against the specified charcoal. Charcoal text is suitable on the listed light semantic fills. Recheck contrast when changing either surface or opacity.

Use lime sparingly for focus, a primary action, and small route details. Success may share lime but must include a readable status label. Likewise, warnings and errors need words or an appropriate labelled icon; color alone must not carry their meaning. Never use a visual success state to imply that an unconnected action completed.

## Typography and licenses

Website typography is configured in `src/app/globals.css`; these are the shipped, locally hosted font files:

| Language         | Typeface and files                                                       | Source and license                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English / German | Manrope Variable, `public/fonts/manrope.woff2`                           | [Fontsource Manrope](https://fontsource.org/fonts/manrope), `@fontsource-variable/manrope`; [local OFL text](public/fonts/Manrope-LICENSE.txt)                                |
| Arabic           | IBM Plex Sans Arabic, `ibm-arabic-400.woff2`, `-500.woff2`, `-600.woff2` | [Fontsource IBM Plex Sans Arabic](https://fontsource.org/fonts/ibm-plex-sans-arabic), `@fontsource/ibm-plex-sans-arabic`; [local OFL text](public/fonts/IBM-Plex-LICENSE.txt) |
| Hebrew           | Heebo Variable, `public/fonts/heebo.woff2`                               | [Fontsource Heebo](https://fontsource.org/fonts/heebo), `@fontsource-variable/heebo`; [local OFL text](public/fonts/Heebo-LICENSE.txt)                                        |

The included notices identify the Manrope Project Authors, IBM Corp., and the Heebo Project Authors respectively. The fonts are distributed under the **SIL Open Font License 1.1**. Keep the accompanying notices when distributing the font files and follow their terms for modifications or redistribution. These fonts are third-party resources, not exclusive brand property.

Use Manrope's restrained weights for Latin text and the existing Arabic/Hebrew font stacks for their scripts. Do not force Latin letter-spacing onto Arabic or Hebrew. The geometric logo lettering is separate from these typefaces and is not intended as a body font.

## Regeneration and verification

From a checkout with the project's dependencies installed:

```sh
node scripts/brand.mjs
```

No network access, new dependency, external font, or image generation service is required. The script uses the installed `sharp` renderer, reads and checks the approved mark, writes the brand exports, and updates the favicon and touch icon. It stops if the website's mark has changed, so a new mark cannot silently produce inconsistent exports.

The run checks nonempty image content, declared pixel dimensions, and alpha transparency for every standalone logo PNG. `manifest.json` records the renderer version, hashes, and contrast calculations without a volatile generation timestamp. Repeating the script with the same source and renderer yields the same assets. Browser-rendered SVG and different rasterizer versions can differ slightly in antialiasing.

`npm run assets` regenerates the existing project imagery and reads the unified favicon SVG for its raster icons. It does not generate this brand kit; run the brand script when changing or delivering the identity assets.

## Provenance and limits of reuse

- The SA geometry comes from the approved website component. Its exact `d` value and source location are recorded in `manifest.json`. The SAMI / ABU RAAED lettering and contact-sheet labels were drawn as vector paths in `scripts/brand.mjs` for this delivery.
- The brand kit does not assert trademark registration, exclusive legal rights, or clearance against other identities. It does not transfer ownership of third-party fonts, map data, software names, or project assets.
- The images in `public/images/pathy-*.webp` are derived from PATHY emulator captures in the parent repository's `docs/screenshots`; they are not photographs of a physical phone. PATHY is an academic project built by two people with divided programming responsibilities. The images do not establish exclusive authorship or field-tested reliability.
- `travelscan.webp` and `taskflow.webp` are actual website captures. Their capture and content evidence belongs in `CONTENT-SOURCES.md` and the QA records. A screenshot shows the captured state; it does not establish all functionality, usage figures, or commercial outcomes.
- Project screenshots may include third-party maps, interface libraries, provider marks, imagery, or data. Do not treat them as freely licensed brand artwork, remove required map/provider attribution, or redistribute their underlying assets separately without checking the relevant terms. Keep their use tied to describing the actual project.
- Decorative device/browser frames are presentation treatments around real captures, not claims that the hardware or browser interface was designed by Sami. Never replace a capture with an invented product screen without an explicit illustration label.

The source evidence and user's confirmed contribution boundaries take precedence over promotional shorthand.
