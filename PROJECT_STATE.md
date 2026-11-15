# Portfolio delivery state

Owner: Sami Abu Raaed. Public source: [sami1507/sami-portfolio](https://github.com/sami1507/sami-portfolio). Delivery work began on 11 November 2026 from `0230a23`; the implementation was uploaded in `f0050fc`. The parent Android repository and its existing work were preserved.

**Current status — 15 November 2026:** [the portfolio is published publicly](https://sami-abu-raaed-studio.samiaburaed42.chatgpt.site), now including Mizan and Basira. Sites version 2 deployed source `31f7cbc27c73f21e97b721cf51def74610a0107b` successfully. All 24 localized routes passed anonymous verification; all four homes link both additions, their eight case studies and images are available, and missing routes return 404. Both new English case studies were opened in the public browser. The build, 25 unit tests, 90 browser tests and 20 affected checks after visual refinement passed; GitHub CI also passed. A fresh Lighthouse attempt did not complete, so historical scores below are not scores for this expanded release. No database or API keys are required. The résumé remains optional.

## Scope and decisions

- Visitor journey: introduction → real project evidence → case study → email / verified profile / optional real résumé.
- Preserve Next.js, TypeScript, static export and the charcoal/ivory/lime identity. English is the default root; Arabic and Hebrew are RTL; German is LTR.
- Four localized home pages and twenty case studies use separate content data. Images are real project captures with translated captions/alt text.
- Owner-confirmed roles: PATHY is an academic two-person programming project with divided responsibilities; TravelScan AI is solo academic; TaskFlow, Mizan and Basira are solo personal projects. No fabricated employment, clients, usage figures or results.
- Mizan and Basira have four-language case studies and genuine demo captures. Mizan links to its public repository; no live URL was verified. Basira's source and application remain private, with no invented or inaccessible public link.
- Accounts, databases, payments, analytics, mail-submission services, webhooks and AI APIs are not part of this portfolio. Featured-project integrations belong to their separate applications.
- Publication is evidenced by the successful Sites deployment recorded below. The public source repository and local audit reports remain separate evidence.

## Requirement register

| Requirement                                         | Status                                        | Evidence / remaining action                                                                                                                                                                           |
| --------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four languages, RTL, English default, five projects | Complete and tested                           | Four homes and twenty case studies; 90 browser tests plus 20 affected checks after thumbnail refinement. Language changes preserve the current page.                                                  |
| Responsive accessible interaction                   | Verified within scope                         | 360/390/768/1440 px, keyboard, focus, reduced motion, axe, no-JS paths and same-origin assets. Not full WCAG certification.                                                                           |
| Identity and logo assets                            | Complete                                      | Exact approved SA mark, full lockup/icons, SVG/transparent PNG/light/dark/mono variants, favicon, social image, tokens, brand guide and license inventory.                                            |
| Real content and contact                            | Complete and tested                           | Confirmed project roles; honest clipboard pending/success/failure; email and external profiles remain usable. No fake message delivery.                                                               |
| Résumé                                              | Optional owner input                          | Local PDF or public HTTPS setting; no code change needed. Missing/unsafe/invalid/oversized local PDFs fail preflight.                                                                                 |
| Build configuration and SEO                         | Complete and tested locally                   | HTTPS origin validation; unconfigured noindex preview; canonical/hreflang/sitemap in configured build; release preflight.                                                                             |
| Static server and export security                   | Complete and tested                           | Actual HTTP tests, traversal/symlink containment, headers/CSP, 404s, safe MIME and cache behavior.                                                                                                    |
| Dependencies                                        | Verified                                      | sharp 0.35.5; npm audit records zero known vulnerabilities.                                                                                                                                           |
| Clean setup and production build                    | Passed                                        | Separate clean Windows install plus Ubuntu CI install/build. No parent Android repository needed for normal builds.                                                                                   |
| Unit/browser checks                                 | Passed                                        | 25 local unit tests, zero skipped; 90 browser tests and 20 affected rechecks passed. Formatting, TypeScript and production build passed.                                                              |
| Lighthouse ≥90 target                               | Historical baseline only for this release     | Original 30 measurements had performance medians 96–100. The additional 15 November mobile audit stalled and produced no score; see QA-REPORT.md.                                                     |
| CI                                                  | Passed                                        | [GitHub Actions run 43722133496](https://github.com/sami1507/sami-portfolio/actions/runs/43722133496) succeeded for application source `31f7cbc`.                                                     |
| Packaging and screenshots                           | Complete                                      | Version 2 source/output archive verified against `31f7cbc`; 27 HTML files and 24 sitemap routes. Current desktop/mobile captures include the new cases. Original delivery archives remain historical. |
| Hosted operation                                    | Published publicly; anonymous access verified | Sites version 2 succeeded on 15 November 2026. All 24 routes, both new images and the exact sitemap passed anonymous verification; missing routes returned 404. Host limitations remain below.        |

## Publication record and history

- **11–12 November 2026:** the source, static packages, local audits and Linux CI were completed. At that handoff the website had not yet been published; hosting and publication were outstanding.
- **15 November 2026:** after explicit owner authorization, Sites published version 1 successfully with a public audience (access revision 2). Version 2 then added Mizan and Basira without changing the portfolio audience or access to the separate Basira application.

| Field         | Recorded value                                                                               |
| ------------- | -------------------------------------------------------------------------------------------- |
| Live URL      | https://sami-abu-raaed-studio.samiaburaed42.chatgpt.site                                     |
| Sites project | `appgprj_6aef3c1bf2a4819193de81d06e79da6f`                                                   |
| Version 2     | `appgprj_6aef3c1bf2a4819193de81d06e79da6f~appgver_764addac9c988191ab1c6f4a1479d051`          |
| Deployment    | `appgdep_6af9bce42c308191bc9f1d8a3fbe810c` — succeeded at `2026-11-15T14:08:51.088637+00:00` |
| Source commit | `31f7cbc27c73f21e97b721cf51def74610a0107b`                                                   |
| Audience      | Public, revision 2                                                                           |

## Current handoff checkpoint

The current application tests and build pass. Public version 2 is verified anonymously and in the browser. The latest standalone mobile Lighthouse attempt stalled; no new performance score is claimed. Original November 11 audit measurements and Chrome rechecks remain historical evidence. No owner-provided application code remains for the current portfolio scope.

Current evidence: QA-REPORT.md, verification/project-expansion-live.json and the successful CI run above. Original delivery evidence remains under verification/; local full browser/Lighthouse reports and screenshots are under artifacts/.

## Workstation and operation

Authoritative source: `C:/Users/User/OneDrive/Desktop/pathy/PATHY/PATHY/portfolio`. A clean, runnable validation copy is `D:/sami-portfolio-delivery-20261111`. Existing dependency, build-cache and artifact junctions still target `D:/sami-portfolio-20261107`. For publication, the old `out` junction was preserved under `.sites-runtime/out-before-publication`, and the clean verified output was copied into a real local `out` directory. A normal fresh checkout needs neither this D drive nor the Android repository. Synchronize source before building a workstation copy.

Run/edit/deploy: README.md and README.ar.md. Public settings and host configuration: API_SETUP.md. Identity/provenance: BRAND.md, ASSET-LICENSES.md and CONTENT-SOURCES.md. Keep a prior static release for rollback; there is no application data store to migrate or restore.

## Owner inputs

1. Optional genuine résumé PDF or public HTTPS URL, entered as NEXT_PUBLIC_RESUME_URL; verify the actual file opens.
2. Optional feature-by-feature PATHY contribution detail only if more individual attribution is desired. The current shared-team wording is accurate without it.

The current host and public origin are established. Rebuild if that origin changes. Latest anonymous verification is saved in `verification/project-expansion-live.json` (also locally in `deliverables/project-expansion-live-verification.json`): all four homes and twenty case studies returned 200 with correct language and direction; all new project links/images and the exact 24-route sitemap passed; missing routes returned 404. The public browser confirmed Mizan and Basira navigation. The initial version 1 verification remains in `deliverables/public-deployment-verification.json`. No message was sent and no résumé exists to verify.

**Hosting limitations:** the current Sites static host does not apply the supplied `_headers` configuration. Custom CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy headers are absent. Hashed JS/CSS use revalidation instead of immutable caching, and WOFF2 uses `application/octet-stream`. The fonts load and public navigation works. Local header/security tests do not prove those headers are active on this host; no live Lighthouse score is claimed.
