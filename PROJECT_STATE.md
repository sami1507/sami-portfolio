# Portfolio delivery state

Owner: Sami Abu Raaed. Public source: [sami1507/sami-portfolio](https://github.com/sami1507/sami-portfolio). Delivery work began on 11 November 2026 from `0230a23`; the implementation was uploaded in `f0050fc`. The parent Android repository and its existing work were preserved.

**Readiness:** the current portfolio is implemented and locally tested, with successful Linux CI. It is ready for hosting settings, authorized publication and live-host verification. The website has not been newly published. No database or API keys are required. The résumé link is intentionally absent until its real file is supplied.

## Scope and decisions

- Visitor journey: introduction → real project evidence → case study → email / verified profile / optional real résumé.
- Preserve Next.js, TypeScript, static export and the charcoal/ivory/lime identity. English is the default root; Arabic and Hebrew are RTL; German is LTR.
- Four localized home pages and twelve case studies use separate content data. Images are real project captures with translated captions/alt text.
- Owner-confirmed roles: PATHY is an academic two-person programming project with divided responsibilities; TravelScan AI is solo academic; TaskFlow is solo personal. No fabricated employment, clients, usage figures or results.
- Accounts, databases, payments, analytics, mail-submission services, webhooks and AI APIs are not part of this portfolio. Featured-project integrations belong to their separate applications.
- Public GitHub source does not imply a published website. A configured canonical origin is build metadata, not proof of deployment.

## Requirement register

| Requirement                                        | Status                                     | Evidence / remaining action                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four languages, RTL, English default, case studies | Complete and tested                        | 82 browser tests on Windows and Linux; language changes preserve the current page.                                                                             |
| Responsive accessible interaction                  | Verified within scope                      | 360/390/768/1440 px, keyboard, focus, reduced motion, axe, no-JS paths and same-origin assets. Not full WCAG certification.                                    |
| Identity and logo assets                           | Complete                                   | Exact approved SA mark, full lockup/icons, SVG/transparent PNG/light/dark/mono variants, favicon, social image, tokens, brand guide and license inventory.     |
| Real content and contact                           | Complete and tested                        | Confirmed project roles; honest clipboard pending/success/failure; email and external profiles remain usable. No fake message delivery.                        |
| Résumé                                             | Optional owner input                       | Local PDF or public HTTPS setting; no code change needed. Missing/unsafe/invalid/oversized local PDFs fail preflight.                                          |
| Build configuration and SEO                        | Complete and tested locally                | HTTPS origin validation; unconfigured noindex preview; canonical/hreflang/sitemap in configured build; release preflight.                                      |
| Static server and export security                  | Complete and tested                        | Actual HTTP tests, traversal/symlink containment, headers/CSP, 404s, safe MIME and cache behavior.                                                             |
| Dependencies                                       | Verified                                   | sharp 0.35.5; npm audit records zero known vulnerabilities.                                                                                                    |
| Clean setup and production build                   | Passed                                     | Separate clean Windows install plus Ubuntu CI install/build. No parent Android repository needed for normal builds.                                            |
| Unit/browser checks                                | Passed                                     | 24 unit tests, zero skipped; 82 E2E tests locally and in CI. Formatting and TypeScript passed.                                                                 |
| Lighthouse ≥90 target                              | Met by measured medians                    | 30 original measurements: performance medians 96–100, other categories 100. One 89/92 outlier and browser-cache/cleanup warnings are retained in QA-REPORT.md. |
| CI                                                 | Passed                                     | GitHub Actions run43104100780 on f0050fc; public repository unchanged. CI checks only, no deployment.                                                          |
| Packaging and screenshots                          | Complete                                   | Static ZIP checked (228 entries); brand ZIP; current desktop/mobile captures; source archive generated from the final delivery commit.                         |
| Hosted operation                                   | Awaits external settings/live verification | Choose final hosting target/origin; publish only after authorization; check HTTPS, routing, headers, sitemap and contact on that host.                         |

## Current handoff checkpoint

The current application tests and build pass. The final isolated Chrome for Testing 158 recheck scored 100 in every category in all three runs, without page-audit warnings. The original 30 measurements and the intermediate system-Chrome recheck remain available. Two Windows audit-browser shutdowns retained temporary profiles after a timeout; this tooling limitation is documented and does not affect the website. The final source archive is generated from the delivery commit, with SHA-256 checksums alongside the packages. No owner-provided application code remains for the current scope.

Evidence: QA-REPORT.md, verification/lighthouse-summary.json, verification/unit-tests.txt, verification/dependency-audit.json and verification/ci-result.json. Local full browser/Lighthouse reports are under artifacts/; selected handoff files are under deliverables/.

## Workstation and operation

Authoritative source: `C:/Users/User/OneDrive/Desktop/pathy/PATHY/PATHY/portfolio`. A clean, runnable validation copy is `D:/sami-portfolio-delivery-20261111`. The older `D:/sami-portfolio-20261107` owns existing dependency/output junction targets; the tested output was copied there. A normal fresh checkout needs neither this D drive nor the Android repository. Synchronize source before building a workstation copy.

Run/edit/deploy: README.md and README.ar.md. Public settings and host configuration: API_SETUP.md. Identity/provenance: BRAND.md, ASSET-LICENSES.md and CONTENT-SOURCES.md. Keep a prior static release for rollback; there is no application data store to migrate or restore.

## Owner inputs

1. Final hosting project/account and HTTPS origin, entered as NEXT_PUBLIC_SITE_URL; publication authorization and host setup. Rebuild when the origin changes.
2. Optional genuine résumé PDF or public HTTPS URL, entered as NEXT_PUBLIC_RESUME_URL; verify the actual file opens.
3. Optional feature-by-feature PATHY contribution detail only if more individual attribution is desired. The current shared-team wording is accurate without it.

After publication, verify the four homes, a case study in each language, a real 404, health.json, response headers, fonts/images, contact behavior, résumé if present, robots and sitemap. The current delivery makes no claim of live hosting verification.
