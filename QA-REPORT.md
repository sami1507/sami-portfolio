# Verification report — 8 November 2026

The four-language production static export passed the build, TypeScript and browser checks and exceeded the Lighthouse score target. English remains the default; Arabic and Hebrew use RTL, and German uses LTR. The completed audit encountered a Windows cleanup error after saving its measurements; the tooling fix and verification are documented below. Publication is pending explicit authorization after automatic approval review rejected sending a source-repository credential to Sites. No code was uploaded or deployed by that rejected operation.

## Measured Lighthouse results

Lighthouse 13.6.0, installed Chrome 156, Node 24.19.0, Windows 10.0.26300, Intel Core i7-14700F. The production export was served at `http://127.0.0.1:3000` using `npm start`, with gzip for text assets. These are local production measurements, not a claim about an unaudited hosted deployment.

Each row contains the median of **three** runs. All 30 individual runs scored at least 95 for performance, and 100 for accessibility, best practices and SEO.

| Page | Device | Performance | Accessibility | Best practices | SEO | Performance range |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| English home `/` | Mobile | 95 | 100 | 100 | 100 | 95–96 |
| English home `/` | Desktop | 100 | 100 | 100 | 100 | 100 |
| Arabic home `/ar/` | Mobile | 97 | 100 | 100 | 100 | 97–99 |
| Arabic home `/ar/` | Desktop | 100 | 100 | 100 | 100 | 100 |
| Hebrew home `/he/` | Mobile | 99 | 100 | 100 | 100 | 99–100 |
| Hebrew home `/he/` | Desktop | 100 | 100 | 100 | 100 | 100 |
| German home `/de/` | Mobile | 99 | 100 | 100 | 100 | 95–100 |
| German home `/de/` | Desktop | 100 | 100 | 100 | 100 | 100 |
| PATHY `/projects/pathy/` | Mobile | 100 | 100 | 100 | 100 | 100 |
| PATHY `/projects/pathy/` | Desktop | 100 | 100 | 100 | 100 | 100 |

- Mobile: simulated network throttling, 150 ms RTT, 1638.4 Kbps throughput, 4× CPU slowdown; 412 × 823 viewport at DPR 1.75.
- Desktop: official Lighthouse desktop configuration, 40 ms RTT, 10240 Kbps throughput, 1× CPU; 1350 × 940 viewport at DPR 1.
- Cumulative layout shift was **0 in all 30 runs**. Variation between runs is retained in the summary, rather than selecting the best result. No Lighthouse runtime errors were reported.
- Final summary timestamp: `2026-11-08T06:48:42.980Z`.
- Raw scores, per-run metrics, audit findings and settings: [verification/lighthouse-summary.json](verification/lighthouse-summary.json). Full local JSON/HTML reports: `artifacts/lighthouse/`.
- The full audit initially exited with code 1 after saving all 30 measurements: chrome-launcher's asynchronous cleanup callback threw a Windows `EPERM` error while deleting its temporary profile. The measured page scores are retained unchanged. `scripts/audit-browser.mjs` now gives Chrome an explicit isolated temporary profile, validates its path before cleanup, and records cleanup failures without an uncaught callback. A separate real Chrome launch/shutdown check passed with exit code 0 and no cleanup warning. The website did not change after these measurements; the 30-run audit was not repeated for this tooling-only fix.

Initial measurements identified uncompressed text assets, unnecessary Next.js prefetch requests on static hosting, and delayed Arabic font loading. The final export uses regular semantic links, compressed local serving, self-hosted font subsets and explicit font preloads. The table above reports the final implementation only.

## Build and browser checks

- `npm run build`: passed, producing four home pages, twelve project case studies, four-language 404 content, sitemap and robots.
- `npm run typecheck`: passed.
- `npm run test:e2e`: **61 passed**, reported duration 1.3 minutes.
- All four home pages checked at **360, 390, 768 and 1440 px**: no horizontal overflow, missing images or JavaScript console errors.
- All twelve localized case studies checked at 390 and 1440 px, including axe WCAG A/AA checks and actual screenshots.
- Passed: every language pair retains the home or case-study path; `/` stays English even with Arabic, Hebrew or German browser preferences; project links resolve; mobile menu opens by keyboard and closes with Escape/navigation; language options are keyboard accessible; skip link focuses main content; clipboard copies the real email; reduced motion removes animation; page metadata and true 404 responses work. A separate browser check confirmed Escape closes the language selector and restores focus to its trigger.
- Automated axe checks found no violations in the tested home and case-study views. This does not constitute a complete manual WCAG certification.

## Visual review and evidence

Reviewed actual browser captures of the desktop/mobile hero, full home pages, Arabic and Hebrew RTL layouts, German text wrapping and case studies. Hebrew uses a locally hosted 12 KB Heebo font subset. Project images retain their original interface language, with translated captions and alternative text. The hero combines actual PATHY emulator imagery with a real TravelScan browser capture.

Screenshots are in `artifacts/screenshots/`; selected copies are in `deliverables/`. These are browser viewport emulations, not photographs of physical phones.

TravelScan AI and TaskFlow live landing pages returned HTTP 200 and their expected interfaces when captured. This verifies those pages, not authenticated downstream features. PATHY images are original repository emulator captures. Content sources and the owner-confirmed team/solo distinctions are documented in [CONTENT-SOURCES.md](CONTENT-SOURCES.md).

## Update — 11 November 2026: screenshot-window layout fix

**Defect.** Reviewing real browser captures showed that the project screenshot windows were taller than their fixed-height cards at almost every width. The caption band then sat on top of the capture (on the English home page the TravelScan caption overlapped the orange call-to-action), TaskFlow was clipped at the top, and the two cards in the home grid used different image shapes. A measurement of window versus caption position over 12 widths (360–1920 px) and 6 pages found overlap or clipping in 107 of 120 cases; the Nov 8 automated checks did not measure this.

**Fix** (`src/app/globals.css` only; no content, markup or image changes). Card height now follows the screenshot window instead of a fixed pixel height per breakpoint, both captures share one 1440:700 window ratio, and the bottom padding reserves the caption band plus the window's tilt. TravelScan is shown whole; TaskFlow loses only its empty lower part (a 3% top-anchored zoom keeps its footer line from being cut in half). The same layout applies to the home cards and the case-study covers.

**Verification (this update only).**
- Re-measured the same 120 cases: 0 overlap or clipping.
- Added a regression test per language (`screenshot windows never collide with their captions`, six widths, home plus two case studies); it fails on the previous CSS (window 4.5 px under the caption at 360 px) and passes on the fix.
- `npm run typecheck` and `npm run build` pass; `npm run test:e2e`: **65 passed** (61 previous + 4 new), three consecutive full runs, on Linux with Playwright's Chromium. One earlier full run right after a rebuild reported many failures that did not recur in the next three runs and whose cause was not identified.
- Viewed actual captures of English, Arabic and German at desktop, tablet and phone widths.
- `npm run dev` serves all routes and returns a real 404 for unknown pages.
- Single Lighthouse runs (not the 30-run median above; different machine): accessibility, best practices and SEO 100 and CLS 0 on English, Arabic and TaskFlow pages in mobile and desktop; performance 100 everywhere except English mobile at 94 in that one run.

**Limits.** The Source fingerprint above describes the Nov 8 delivery. It no longer matches the changed `src/`, and it could not be reproduced from the committed files with the stated procedure (likely a line-ending difference from the Windows workstation), so no replacement is given here. The 30-run Lighthouse audit was not repeated.

## Reproduce and remaining inputs

Use `npm ci`, `npm run build`, `npm start`, then `npm run test:e2e` and `npm run audit` from another terminal. Set `CHROME_PATH` to use a specific Chrome; otherwise Windows uses its installed Chrome and other systems use Playwright's Chromium. See [README.md](README.md) and [README.ar.md](README.ar.md) for this workstation's D-drive build copy and normal fresh-checkout instructions.

The genuine résumé PDF is still required before enabling the résumé link. More detailed individual feature attribution within PATHY's two-person team can be added if supplied. No employment history, clients, users or success percentages were invented.

Source fingerprint: `ff629000e33d64825fd61b5e728bfe08aaae7e534ce7b1134f641c0fa3c2442a`. SHA-256 input: files under `src/` and `public/` sorted by full path, followed by `package-lock.json`; for each file, concatenate its UTF-8 relative path using `/`, one NUL byte, and its raw bytes. Audit tooling and documentation are outside this website fingerprint.
