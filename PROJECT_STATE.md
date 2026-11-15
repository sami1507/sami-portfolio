# Portfolio delivery state

Owner: Sami Abu Raaed. Public source: [sami1507/sami-portfolio](https://github.com/sami1507/sami-portfolio). Delivery work began on 11 November 2026 from `0230a23`; the implementation was uploaded in `f0050fc`. The parent Android repository and its existing work were preserved.

**Current status — 15 November 2026:** [the portfolio is published publicly](https://sami-abu-raaed-studio.samiaburaed42.chatgpt.site) through Sites, with a successful deployment of source `0451b5c535965df1467712fbcb57e9cde6420cd3`. All 16 pages and representative supporting resources passed anonymous HTTP checks without cookies or authentication; missing routes return a real 404. English/Arabic navigation and the Arabic PATHY case study were also checked in the live browser. Local Lighthouse results remain separate from live-host verification. No database or API keys are required. The résumé link is intentionally absent until its real file is supplied.

## Scope and decisions

- Visitor journey: introduction → real project evidence → case study → email / verified profile / optional real résumé.
- Preserve Next.js, TypeScript, static export and the charcoal/ivory/lime identity. English is the default root; Arabic and Hebrew are RTL; German is LTR.
- Four localized home pages and twelve case studies use separate content data. Images are real project captures with translated captions/alt text.
- Owner-confirmed roles: PATHY is an academic two-person programming project with divided responsibilities; TravelScan AI is solo academic; TaskFlow is solo personal. No fabricated employment, clients, usage figures or results.
- Accounts, databases, payments, analytics, mail-submission services, webhooks and AI APIs are not part of this portfolio. Featured-project integrations belong to their separate applications.
- Publication is evidenced by the successful Sites deployment recorded below. The public source repository and local audit reports remain separate evidence.

## Requirement register

| Requirement                                        | Status                                        | Evidence / remaining action                                                                                                                                                                                                   |
| -------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four languages, RTL, English default, case studies | Complete and tested                           | 82 browser tests on Windows and Linux; language changes preserve the current page.                                                                                                                                            |
| Responsive accessible interaction                  | Verified within scope                         | 360/390/768/1440 px, keyboard, focus, reduced motion, axe, no-JS paths and same-origin assets. Not full WCAG certification.                                                                                                   |
| Identity and logo assets                           | Complete                                      | Exact approved SA mark, full lockup/icons, SVG/transparent PNG/light/dark/mono variants, favicon, social image, tokens, brand guide and license inventory.                                                                    |
| Real content and contact                           | Complete and tested                           | Confirmed project roles; honest clipboard pending/success/failure; email and external profiles remain usable. No fake message delivery.                                                                                       |
| Résumé                                             | Optional owner input                          | Local PDF or public HTTPS setting; no code change needed. Missing/unsafe/invalid/oversized local PDFs fail preflight.                                                                                                         |
| Build configuration and SEO                        | Complete and tested locally                   | HTTPS origin validation; unconfigured noindex preview; canonical/hreflang/sitemap in configured build; release preflight.                                                                                                     |
| Static server and export security                  | Complete and tested                           | Actual HTTP tests, traversal/symlink containment, headers/CSP, 404s, safe MIME and cache behavior.                                                                                                                            |
| Dependencies                                       | Verified                                      | sharp 0.35.5; npm audit records zero known vulnerabilities.                                                                                                                                                                   |
| Clean setup and production build                   | Passed                                        | Separate clean Windows install plus Ubuntu CI install/build. No parent Android repository needed for normal builds.                                                                                                           |
| Unit/browser checks                                | Passed                                        | 25 local unit tests, zero skipped; 82 E2E tests locally and in CI. Formatting and TypeScript passed.                                                                                                                          |
| Lighthouse ≥90 target                              | Met by measured medians                       | 30 original measurements: performance medians 96–100, other categories 100. One 89/92 outlier and browser-cache/cleanup warnings are retained in QA-REPORT.md.                                                                |
| CI                                                 | Passed                                        | [GitHub Actions run 43109934700](https://github.com/sami1507/sami-portfolio/actions/runs/43109934700) on `0451b5c`: 25 unit tests and 82 E2E tests passed. Public repository unchanged; CI checks only.                       |
| Packaging and screenshots                          | Complete                                      | Static ZIP checked (228 entries); brand ZIP; current desktop/mobile captures; source archive generated from the final delivery commit.                                                                                        |
| Hosted operation                                   | Published publicly; anonymous access verified | Sites version 1 succeeded on 15 November 2026. All 16 routes, sitemap, robots, health and representative assets returned 200 without authentication; missing routes returned 404. Host header limitations are recorded below. |

## Publication record and history

- **11–12 November 2026:** the source, static packages, local audits and Linux CI were completed. At that handoff the website had not yet been published; hosting and publication were outstanding.
- **15 November 2026:** after explicit owner authorization, Sites published version 1 successfully with a public audience (access revision 2).

| Field         | Recorded value                                                                      |
| ------------- | ----------------------------------------------------------------------------------- |
| Live URL      | https://sami-abu-raaed-studio.samiaburaed42.chatgpt.site                            |
| Sites project | `appgprj_6aef3c1bf2a4819193de81d06e79da6f`                                          |
| Version 1     | `appgprj_6aef3c1bf2a4819193de81d06e79da6f~appgver_62c4caa37b7c81918852282fd6a022e6` |
| Deployment    | `appgdep_6af9b39a69488191a61012a7abde0c59` — succeeded                              |
| Source commit | `0451b5c535965df1467712fbcb57e9cde6420cd3`                                          |
| Audience      | Public, revision 2                                                                  |

## Current handoff checkpoint

The current application tests and build pass. The final isolated Chrome for Testing 158 recheck scored 100 in every category in all three runs, without page-audit warnings. The original 30 measurements and the intermediate system-Chrome recheck remain available. Two Windows audit-browser shutdowns retained temporary profiles after a timeout; this tooling limitation is documented and does not affect the website. The final source archive is generated from the delivery commit, with SHA-256 checksums alongside the packages. No owner-provided application code remains for the current scope.

Evidence: QA-REPORT.md, verification/lighthouse-summary.json, verification/unit-tests.txt, verification/dependency-audit.json and verification/ci-result.json. Local full browser/Lighthouse reports are under artifacts/; selected handoff files are under deliverables/.

## Workstation and operation

Authoritative source: `C:/Users/User/OneDrive/Desktop/pathy/PATHY/PATHY/portfolio`. A clean, runnable validation copy is `D:/sami-portfolio-delivery-20261111`. Existing dependency, build-cache and artifact junctions still target `D:/sami-portfolio-20261107`. For publication, the old `out` junction was preserved under `.sites-runtime/out-before-publication`, and the clean verified output was copied into a real local `out` directory. A normal fresh checkout needs neither this D drive nor the Android repository. Synchronize source before building a workstation copy.

Run/edit/deploy: README.md and README.ar.md. Public settings and host configuration: API_SETUP.md. Identity/provenance: BRAND.md, ASSET-LICENSES.md and CONTENT-SOURCES.md. Keep a prior static release for rollback; there is no application data store to migrate or restore.

## Owner inputs

1. Optional genuine résumé PDF or public HTTPS URL, entered as NEXT_PUBLIC_RESUME_URL; verify the actual file opens.
2. Optional feature-by-feature PATHY contribution detail only if more individual attribution is desired. The current shared-team wording is accurate without it.

The current host and public origin are established. Rebuild if that origin changes. Anonymous live verification is saved in `deliverables/public-deployment-verification.json`: all four homes and twelve case studies have correct language, direction and canonical URLs; sitemap, robots, health, representative scripts/styles/images/fonts and favicon return 200; missing routes return 404. The live browser confirmed English/Arabic switching and the Arabic PATHY page. No message was sent and no résumé exists to verify.

**Hosting limitations:** the current Sites static host does not apply the supplied `_headers` configuration. Custom CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy headers are absent. Hashed JS/CSS use revalidation instead of immutable caching, and WOFF2 uses `application/octet-stream`. The fonts load and public navigation works. Local header/security tests do not prove those headers are active on this host; no live Lighthouse score is claimed.
