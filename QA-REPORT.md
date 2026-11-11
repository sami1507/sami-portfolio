# Verification report — 11 November 2026 delivery checkpoint

The current implementation passed a clean dependency installation, a production static build, **22 unit tests**, and **82 Playwright tests**. Fresh Lighthouse measurements for this delivery and the remote GitHub Actions run are **pending**. The earlier Lighthouse results below belong to the 8 November bundle, not the changed current bundle.

This is local production verification. A configured public origin in generated metadata does not mean a website is live. The source repository is public; the portfolio website has not been published or verified on a live domain in this delivery.

## Current verified checks

| Check                               | Result                      | Evidence / scope                                                                                                                                                           |
| ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean npm ci                        | Passed                      | Separate delivery copy at D:/sami-portfolio-delivery-20261111, independent of the previous dependency installation.                                                        |
| Production static build             | Passed                      | Four home pages, twelve localized case studies and static supporting files.                                                                                                |
| Unit tests                          | **22 passed**               | Public configuration and real HTTP behavior in tests/config.test.mjs and tests/server.test.mjs.                                                                            |
| Browser tests                       | **82 passed**               | Reported duration **3.8 minutes**; artifacts/test-results/.last-run.json is passed with no failures. HTML report: artifacts/playwright-report/index.html.                  |
| Dependency audit                    | **0 known vulnerabilities** | artifacts/dependency-audit.json reports zero in every severity; sharp is 0.35.5. This is the recorded advisory scan, not a guarantee against undiscovered vulnerabilities. |
| Brand exports                       | Passed                      | Dimensions/content/alpha verified for 20 transparent standalone PNGs; repeat generation retained asset hashes; contact sheet visually reviewed.                            |
| Fresh Lighthouse on current bundle  | **Pending**                 | Current audit is being run; no fresh scores claimed yet.                                                                                                                   |
| GitHub Actions on current update    | **Pending**                 | Workflow implemented; no successful remote run recorded yet.                                                                                                               |
| Public deployment and hosted checks | **Not performed**           | No live-domain performance, TLS, headers or routing claim.                                                                                                                 |

The production build passed its framework checks. This checkpoint does not add a separate new formatting/typecheck command result unless recorded by the final verification pass.

## Current browser coverage

The passing suite covers English, Arabic, Hebrew and German, including:

- Home pages at **360, 390, 768 and 1440 px**, with no horizontal overflow or missing project images in the assertions.
- All twelve localized case studies at phone/desktop widths and automated axe checks on tested home/case-study views.
- English at `/` regardless of other browser-language preferences; every language-switch pair retains the current home or case-study path.
- Internal project links, localized metadata, canonical/sitemap behavior and real HTTP 404 responses.
- Keyboard operation, visible focus, skip link, mobile-menu behavior and reduced motion.
- Clipboard success, denial, unavailability and repeated clicks while a write is pending. Failure keeps the address and mailto link usable; the website does not send mail.
- Core content, navigation, projects, language choices and contact without JavaScript.
- Same-origin runtime assets/fonts and no résumé link before a genuine file URL is configured.

These are automated browser and viewport-emulation checks, not physical-device tests or complete manual WCAG certification. Fresh selected screenshots and final visual-review notes are being assembled.

## Current unit and server coverage

The 22 passing tests exercise public-origin and résumé URL parsing, release preflight, local PDF validation, GET/HEAD, gzip negotiation, unacceptable encodings, MIME/cache behavior, query-preserving directory redirects, malformed URLs, traversal, hidden files, escaping/hidden-target symlinks, actual 404s, method restriction, exact current inline-script CSP hashes, aborted clients and startup errors.

No API credentials, database, authentication service, webhook or contact backend is required. There is no missing API integration or fabricated mail-delivery test. The showcased applications' integrations are outside this portfolio's test scope.

## Fresh Lighthouse — pending

The current audit targets `/`, `/ar/`, `/he/`, `/de/` and `/projects/pathy/` on mobile/desktop. The default three repetitions produce **30 measurements** with median scores and full per-run data. `AUDIT_RUNS` must be an integer from **1 to 10**.

Browser selection is `CHROME_PATH`, standard installed Windows Chrome when available, then Playwright Chromium. `AUDIT_URL` defaults to `http://127.0.0.1:3000`; the production preview must already be running. Final evidence must record browser/Lighthouse versions, origin, OS/hardware, throttling, all measured groups and any cleanup warning.

Do not infer the ≥90 target from successful tests or historical scores. An unconfigured preview deliberately has noindex metadata and an empty sitemap, affecting SEO; record whether a public origin was configured for the measured build. Such configuration does not publish the site.

## Remaining current-delivery checks

Fresh Lighthouse results and screenshots, final source/static packages, actual remote CI after the authorized source update, and any separately authorized website deployment remain to be recorded. The true résumé is optional missing owner input and its link is hidden. No API/database setup is missing.

Use `npm ci`, `npm run format:check`, `npm run typecheck`, `npm run test:unit`, `npm run build`, and `npm run test:e2e` to reproduce the local chain. For Lighthouse, start `npm start` and run `npm run audit` from another terminal. Install Playwright Chromium on a clean machine if needed. See API_SETUP.md and README.md for configuration and the workstation-specific build copy.

## Historical evidence — 8 November 2026 bundle

**Everything below describes the earlier bundle and its earlier checks.** Its 61-test result, scores, source fingerprint and visual-review notes do not supersede the current results above. The existing verification/lighthouse-summary.json currently carries the earlier timestamp; the final delivery pass will clearly date its new replacement. The earlier site's configured origin likewise did not establish publication.

### Measured Lighthouse results

Lighthouse 13.6.0, installed Chrome 156, Node 24.19.0, Windows 10.0.26300, Intel Core i7-14700F. The production export was served at `http://127.0.0.1:3000` using `npm start`, with gzip for text assets. These are local production measurements, not a claim about an unaudited hosted deployment.

Each row contains the median of **three** runs. All 30 individual runs scored at least 95 for performance, and 100 for accessibility, best practices and SEO.

| Page                     | Device  | Performance | Accessibility | Best practices | SEO | Performance range |
| ------------------------ | ------- | ----------: | ------------: | -------------: | --: | ----------------- |
| English home `/`         | Mobile  |          95 |           100 |            100 | 100 | 95–96             |
| English home `/`         | Desktop |         100 |           100 |            100 | 100 | 100               |
| Arabic home `/ar/`       | Mobile  |          97 |           100 |            100 | 100 | 97–99             |
| Arabic home `/ar/`       | Desktop |         100 |           100 |            100 | 100 | 100               |
| Hebrew home `/he/`       | Mobile  |          99 |           100 |            100 | 100 | 99–100            |
| Hebrew home `/he/`       | Desktop |         100 |           100 |            100 | 100 | 100               |
| German home `/de/`       | Mobile  |          99 |           100 |            100 | 100 | 95–100            |
| German home `/de/`       | Desktop |         100 |           100 |            100 | 100 | 100               |
| PATHY `/projects/pathy/` | Mobile  |         100 |           100 |            100 | 100 | 100               |
| PATHY `/projects/pathy/` | Desktop |         100 |           100 |            100 | 100 | 100               |

- Mobile: simulated network throttling, 150 ms RTT, 1638.4 Kbps throughput, 4× CPU slowdown; 412 × 823 viewport at DPR 1.75.
- Desktop: official Lighthouse desktop configuration, 40 ms RTT, 10240 Kbps throughput, 1× CPU; 1350 × 940 viewport at DPR 1.
- Cumulative layout shift was **0 in all 30 runs**. Variation between runs is retained in the summary, rather than selecting the best result. No Lighthouse runtime errors were reported.
- Final summary timestamp: `2026-11-08T06:48:42.980Z`.
- Raw scores, per-run metrics, audit findings and settings: [verification/lighthouse-summary.json](verification/lighthouse-summary.json). Full local JSON/HTML reports: `artifacts/lighthouse/`.
- The full audit initially exited with code 1 after saving all 30 measurements: chrome-launcher's asynchronous cleanup callback threw a Windows `EPERM` error while deleting its temporary profile. The measured page scores are retained unchanged. `scripts/audit-browser.mjs` now gives Chrome an explicit isolated temporary profile, validates its path before cleanup, and records cleanup failures without an uncaught callback. A separate real Chrome launch/shutdown check passed with exit code 0 and no cleanup warning. The website did not change after these measurements; the 30-run audit was not repeated for this tooling-only fix.

Initial measurements identified uncompressed text assets, unnecessary Next.js prefetch requests on static hosting, and delayed Arabic font loading. The final export uses regular semantic links, compressed local serving, self-hosted font subsets and explicit font preloads. The table above reports the final implementation only.

### Build and browser checks

- `npm run build`: passed, producing four home pages, twelve project case studies, four-language 404 content, sitemap and robots.
- `npm run typecheck`: passed.
- `npm run test:e2e`: **61 passed**, reported duration 1.3 minutes.
- All four home pages checked at **360, 390, 768 and 1440 px**: no horizontal overflow, missing images or JavaScript console errors.
- All twelve localized case studies checked at 390 and 1440 px, including axe WCAG A/AA checks and actual screenshots.
- Passed: every language pair retains the home or case-study path; `/` stays English even with Arabic, Hebrew or German browser preferences; project links resolve; mobile menu opens by keyboard and closes with Escape/navigation; language options are keyboard accessible; skip link focuses main content; clipboard copies the real email; reduced motion removes animation; page metadata and true 404 responses work. A separate browser check confirmed Escape closes the language selector and restores focus to its trigger.
- Automated axe checks found no violations in the tested home and case-study views. This does not constitute a complete manual WCAG certification.

### Visual review and evidence

Reviewed actual browser captures of the desktop/mobile hero, full home pages, Arabic and Hebrew RTL layouts, German text wrapping and case studies. Hebrew uses a locally hosted 12 KB Heebo font subset. Project images retain their original interface language, with translated captions and alternative text. The hero combines actual PATHY emulator imagery with a real TravelScan browser capture.

Screenshots are in `artifacts/screenshots/`; selected copies are in `deliverables/`. These are browser viewport emulations, not photographs of physical phones.

TravelScan AI and TaskFlow live landing pages returned HTTP 200 and their expected interfaces when captured. This verifies those pages, not authenticated downstream features. PATHY images are original repository emulator captures. Content sources and the owner-confirmed team/solo distinctions are documented in [CONTENT-SOURCES.md](CONTENT-SOURCES.md).

### Reproduce and remaining inputs

Use `npm ci`, `npm run build`, `npm start`, then `npm run test:e2e` and `npm run audit` from another terminal. Set `CHROME_PATH` when Chrome is not at the configured Windows path. See [README.md](README.md) and [README.ar.md](README.ar.md) for this workstation's D-drive build copy and normal fresh-checkout instructions.

The genuine résumé PDF is still required before enabling the résumé link. More detailed individual feature attribution within PATHY's two-person team can be added if supplied. No employment history, clients, users or success percentages were invented.

Source fingerprint: `ff629000e33d64825fd61b5e728bfe08aaae7e534ce7b1134f641c0fa3c2442a`. SHA-256 input: files under `src/` and `public/` sorted by full path, followed by `package-lock.json`; for each file, concatenate its UTF-8 relative path using `/`, one NUL byte, and its raw bytes. Audit tooling and documentation are outside this website fingerprint.
