# Portfolio delivery state

Owner: Sami Abu Raaed. Public source repository: [sami1507/sami-portfolio](https://github.com/sami1507/sami-portfolio). This pass began on 11 November 2026 from commit `0230a23`.

**Current state:** implementation, a clean dependency installation and production build, 24 unit tests, and 82 browser tests are verified locally. Fresh Lighthouse measurements, final delivery packaging, and a remote GitHub Actions run remain pending at this checkpoint. Public source does not mean the website is published.

## Scope and decisions

- Visitor journey: introduction → real project evidence → case study → email / verified profile / optional real résumé.
- Next.js, TypeScript, static export, and the charcoal/ivory/lime identity are retained. English is the root/default; Arabic and Hebrew use RTL; German uses LTR.
- Four home pages and twelve localized case studies share content data. Project images remain authentic captures with translated descriptions.
- Owner-confirmed roles: PATHY is an academic project by two people with divided programming responsibilities; TravelScan AI is a solo academic project; TaskFlow is a solo personal project.
- No API keys, database, accounts, payments, contact-submission backend, analytics, or AI integration are required by this portfolio. The featured projects' services belong to those separate applications.
- A configured HTTPS origin supplies build metadata; it is not evidence of a live website. Hosting publication and its audience remain separate from source publication.

## Requirements status

| Requirement                                           | Status                          | Evidence / remaining work                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four languages, RTL, default English, 12 case studies | Verified locally                | Covered by 82 passing browser tests; language switching preserves the current page.                                                                           |
| Responsive and accessible interaction                 | Verified within test scope      | 360, 390, 768 and 1440 px; keyboard/menu focus, reduced motion, images, axe checks and case studies on phone/desktop. Not a full accessibility certification. |
| Distinct identity and reusable brand kit              | Complete                        | Approved SA path; SVG/transparent PNG lockup/icon variants, contact sheet, manifest, semantic colors and BRAND.md.                                            |
| Accurate content and real contact behavior            | Complete                        | Verified sources and confirmed roles; mailto/clipboard with real failure handling; no simulated mail delivery.                                                |
| Genuine résumé                                        | Optional input missing          | Real local PDF or public HTTPS URL supported; link hidden until configured. Local path, signature and size checks implemented.                                |
| Origin configuration / SEO                            | Implemented and locally tested  | Explicit HTTPS origin; noindex/empty sitemap when unset; release preflight requires origin. No hosted verification implied.                                   |
| Static server / security semantics                    | Verified locally                | Unit tests cover traversal/symlinks, redirects, compression/HEAD, actual 404s, MIME, CSP hashes and startup failures.                                         |
| Dependency advisory check                             | Passed                          | sharp 0.35.5; recorded npm audit reports zero known vulnerabilities, not a guarantee against undiscovered issues.                                             |
| Clean installation / production build                 | Passed                          | Separate clean delivery copy at D:/sami-portfolio-delivery-20261111.                                                                                          |
| Unit / browser regressions                            | Passed                          | 22 unit tests; 82 Playwright tests, reported duration 3.8 minutes.                                                                                            |
| Fresh Lighthouse ≥90 target                           | Pending                         | Current-bundle audit in progress. 8 November results are historical only.                                                                                     |
| Portable setup / CI definition                        | Implemented; remote run pending | .env.example, API_SETUP, browser fallback and GitHub Actions workflow exist. No successful remote run recorded yet.                                           |
| Final source/static package and screenshots           | Pending final assembly          | Current captures, audit evidence and delivery files are being collected.                                                                                      |
| Public website / live domain                          | Not published                   | Exact hosting target, final origin, audience and publication authorization still need to be settled for deployment.                                           |

## Verified results for this pass

- Clean `npm ci` and production build passed in the separate delivery checkout.
- **24 unit tests passed**, covering public configuration, actual static HTTP behavior, generated CSP hashes and unambiguous static-host cache policies. No tests were skipped. `verification/unit-tests.txt` records the result.
- Standalone formatting and TypeScript checks passed.
- **82 Playwright tests passed in 3.8 minutes.** `artifacts/test-results/.last-run.json` records `passed` with no failed tests; the HTML report is under `artifacts/playwright-report/`.
- `artifacts/dependency-audit.json` records **zero vulnerabilities in every severity**. The prior sharp finding was resolved with version 0.35.5.
- Brand generation checked dimensions, nonempty content and transparency for 20 standalone PNGs. Repeating the final script preserved asset hashes; the contact sheet was visually reviewed.
- The retained full Lighthouse summary is currently dated 8 November. It must not be presented as the score of the changed 11 November bundle. Fresh measured results will be added to QA-REPORT.md.

## Source and workstation

The authoritative source is `C:/Users/User/OneDrive/Desktop/pathy/PATHY/PATHY/portfolio`. The older `D:/sami-portfolio-20261107` holds workstation-specific dependency/output junction targets; clean validation uses `D:/sami-portfolio-delivery-20261111`. Synchronize build copies from the source. A normal checkout needs neither a D drive nor the Android repository.

## Remaining inputs and delivery actions

1. Finish fresh Lighthouse, review current screenshots and record actual measurements and conditions.
2. Finish source/static packaging and the authorized source update; record the real remote CI result when available.
3. Supply the genuine résumé PDF or public HTTPS file URL if the link is desired. Its absence does not prevent the rest of the site from running.
4. Confirm the exact hosting project/account, final HTTPS origin, audience and publication authorization. No API provider setup is needed.
5. Supply per-feature PATHY contribution details only if stronger individual attribution is wanted.

Operation: README.md / README.ar.md. Configuration: API_SETUP.md. Provenance: ASSET-LICENSES.md / CONTENT-SOURCES.md. Measured evidence: QA-REPORT.md.
