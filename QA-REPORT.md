# Verification report — 11 November 2026

The four-language portfolio is locally verified and ready for hosting configuration and live deployment verification. Its source repository is public. No new website deployment was performed. The genuine résumé remains optional owner input; no API keys or database are required.

## Build, tests and security

| Check                         | Actual result                                                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean installation            | `npm ci` passed in a separate directory, `D:/sami-portfolio-delivery-20261111`.                                                                                                                                                                           |
| Production builds             | Unconfigured preview and configured release builds passed; four homes, twelve case studies, static metadata, 19 HTML files and a build-health document.                                                                                                   |
| Formatting / TypeScript       | Both standalone checks passed.                                                                                                                                                                                                                            |
| Unit tests                    | **24 passed, zero failures/skips**: settings, PDF preflight, actual HTTP server, generated host headers and CSP hashes. See `verification/unit-tests.txt`.                                                                                                |
| Browser tests on Windows      | **82 passed in 3.8 minutes** against the production export.                                                                                                                                                                                               |
| Unconfigured preview metadata | Four additional locale checks passed: no canonical/alternate links, noindex metadata.                                                                                                                                                                     |
| Dependency advisory scan      | **Zero known vulnerabilities** after updating sharp to 0.35.5. See `verification/dependency-audit.json`.                                                                                                                                                  |
| Linux CI                      | [Run 43104100780](https://github.com/sami1507/sami-portfolio/actions/runs/43104100780) passed for implementation commit `f0050fc`: Ubuntu 26.04, Node 24.22.2, clean install, formatting, types, 24 unit tests, build and 82 browser tests (1.9 minutes). |
| CI evidence                   | [Reports and screenshots](https://github.com/sami1507/sami-portfolio/actions/runs/43104100780/artifacts/13893411967); retention is 14 days. Durable run details: `verification/ci-result.json`.                                                           |

The server tests exercise GET/HEAD, compression negotiation, MIME/cache behavior, redirects, invalid URLs, traversal and symlink containment, private-file rejection, actual 404s, method restriction, inline-script CSP hashes, aborted clients and startup failures. Generated `_headers` keeps each versioned asset's immutable cache policy separate from HTML no-cache rules. The export is within the host's rule/line limits. This is scoped application verification, not a penetration-test certification.

## Browser and visual review

All four home pages were tested at **360, 390, 768 and 1440 px**. All twelve localized case studies were tested on phone and desktop. Checks cover no horizontal overflow, decoded real images, console errors, keyboard/skip-link/menu focus, reduced motion, every language pair preserving the route, and English as the default regardless of browser language.

Clipboard tests cover success, denial, unavailable APIs and repeated activation while a write is pending. The visible email and mailto link remain usable on failure; the website does not send messages. Core content, projects, language choices and contact work without JavaScript. Runtime images, scripts and fonts are same-origin. No résumé link is shown while its setting is empty.

Automated axe checks found no violations in the tested home/case-study views. Actual current captures were visually reviewed: English desktop hero/full page, Arabic/Hebrew/German mobile layouts, Arabic TravelScan case study and desktop PATHY. Text wrapping, image proportions, section rhythm and RTL were checked. Eight fresh home captures (four languages, desktop/mobile) recorded zero horizontal overflow. These are browser emulations, not physical-device testing or full manual WCAG certification.

The brand contact sheet and transparent PNG variants were inspected. Twenty standalone PNGs passed dimensions/content/alpha checks; repeat generation retained hashes. The favicon matches the approved SA path. Fonts and their OFL notices are bundled locally. See `BRAND.md` and `ASSET-LICENSES.md`.

## Lighthouse — actual production measurements

Lighthouse **13.6.0**, Headless Chrome **157**, Node **24.19.0**, Windows **10.0.26300**, Intel Core **i7-14700F**. Production static files were served with gzip at `http://127.0.0.1:3000`. The measured build used the assigned HTTPS origin for canonical metadata; this does not publish that origin.

Each row is the median of **three runs**, 30 measurements in total. No run has been discarded. The median target of at least 90 was met in every measured group; individual variation and the outlier are retained below.

| Page             | Device  | Performance | Accessibility | Best practices | SEO | Individual performance |
| ---------------- | ------- | ----------: | ------------: | -------------: | --: | ---------------------- |
| English home     | Mobile  |          99 |           100 |            100 | 100 | 98–99                  |
| English home     | Desktop |          96 |           100 |            100 | 100 | 96–100                 |
| Arabic home      | Mobile  |         100 |           100 |            100 | 100 | 100                    |
| Arabic home      | Desktop |         100 |           100 |            100 | 100 | 99–100                 |
| Hebrew home      | Mobile  |         100 |           100 |            100 | 100 | 100                    |
| Hebrew home      | Desktop |         100 |           100 |            100 | 100 | 100                    |
| German home      | Mobile  |          99 |           100 |            100 | 100 | 90–100                 |
| German home      | Desktop |         100 |           100 |            100 | 100 | 100                    |
| PATHY case study | Mobile  |         100 |           100 |            100 | 100 | 100                    |
| PATHY case study | Desktop |         100 |           100 |            100 | 100 | 89–100                 |

- Mobile uses Lighthouse simulated throttling: 150 ms RTT, 1638.4 Kbps throughput, 4× CPU slowdown; 412×823 at DPR 1.75.
- Desktop uses Lighthouse's official desktop configuration: 40 ms RTT, 10240 Kbps throughput, 1× CPU; 1350×940 at DPR 1.
- CLS ranged from **0 to 0.002**. No Lighthouse runtime errors occurred.
- The original 30-run audit ended at `2026-11-11T21:40:16.097Z`, exit code 0 under its median threshold rule. Raw results and warnings: `verification/lighthouse-summary.json`; complete HTML/JSON reports: `artifacts/lighthouse/`.
- Six runs warned that clearing browser origin data/cache timed out. In the last PATHY desktop run, fetching robots.txt also timed out: performance was **89** and SEO **92**, although the other two PATHY desktop runs were 100 in every category. Subsequent direct HTTP checks returned the valid robots.txt with status 200 in **61, 4 and 1 ms**.
- Windows also retained a profile-file handle during cleanup (`EBUSY`). These are recorded audit-environment limitations, not silently excluded measurements. The original audit reused one browser; the tool now isolates every measurement, records all warnings, and waits for the owned process to close before deleting its exact temporary profile.

### Isolated rechecks and tooling limitation

The first isolated recheck with installed Chrome 157 produced performance scores **98, 100 and 95** (median 98), with 100 in the other categories. Cache-clearing warnings persisted, including an incomplete-load warning in its last run. Those results remain in `verification/lighthouse-system-recheck.json`; they are not substituted for the original measurements.

A second recheck used the pinned Playwright **Chrome for Testing 158.0.8127.18**, three fresh browsers and the same unchanged PATHY production page. **All three runs scored 100 in all four categories**, with CLS 0, no Lighthouse runtime errors, and no page-audit warnings. See `verification/lighthouse-recheck.json`. The script exited successfully. Reproduce with `CHROME_PATH` set to that test browser and `npm run audit -- /projects/pathy/ desktop`; each recheck is saved separately from the full audit.

Two of these last three browser shutdowns exceeded the 15-second process-close deadline on Windows. The helper reported that cleanup limitation and retained their temporary profiles rather than deleting an active profile. A separate real-page navigation/close check observed closure, removed its profile and returned no warning (21.9 seconds total including synchronous Windows termination). This is a remaining local audit-tool cleanup limitation; it does not affect the shipped static website. No further page or design changes were made to obtain the recheck scores.

## Delivery and remaining live checks

Source, static export and brand ZIPs, plus actual phone/desktop screenshots, are assembled in `deliverables/`. The static archive's 228 entries were checked for all four language roots, case studies, robots/sitemap, true 404 document, health and header files; source/dependency/secret folders are not web assets. The tested export was synchronized to the workstation's output junction.

For a fresh checkout use `npm ci`, install Playwright Chromium if testing, then `npm run verify`. For an indexed release, set `NEXT_PUBLIC_SITE_URL` and use `npm run build:release`; preview it with `npm start`. See README.md / README.ar.md and API_SETUP.md for the exact commands and workstation-specific paths.

Remaining owner actions are the final hosting target and HTTPS origin, optional genuine résumé, and authorization/configuration for publishing. After deployment, verify routing, HTTPS, response headers, canonical/sitemap, contact controls and the résumé on the actual host. No hosted Lighthouse result, actual outbound mail delivery, physical-device compatibility, authentication flow, or featured-project downstream API operation is claimed by this portfolio's tests. No database migrations, API credentials or application code remain to be supplied for the portfolio's current scope.
