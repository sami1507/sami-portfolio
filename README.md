# Sami Abu Raaed — portfolio

A complete four-language portfolio built with Next.js, TypeScript and CSS. English is always the default (`/`), including for browsers set to another language. Arabic (`/ar/`) and Hebrew (`/he/`) have server-rendered RTL documents; German (`/de/`) uses LTR. Each featured project has a separate case study in all four languages. The language selector preserves the current case study.

Public source: [sami1507/sami-portfolio](https://github.com/sami1507/sami-portfolio). This repository contains the site source; a public GitHub repository is not a deployed website.

Start with this README, then see [API_SETUP.md](API_SETUP.md) for configuration and hosting, [BRAND.md](BRAND.md) for the logo/design system, [ASSET-LICENSES.md](ASSET-LICENSES.md) for asset provenance, [PROJECT_STATE.md](PROJECT_STATE.md) for the requirement register, and [QA-REPORT.md](QA-REPORT.md) for measured delivery evidence. Arabic instructions: [README.ar.md](README.ar.md).

## Run locally

Use Node.js 22.13+ (Node 24 LTS recommended) and npm. From this folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The website works without any API keys, account system, database or environment file. With no site origin configured it is a **noindex local preview**, with no canonical links and an empty sitemap. To reproduce the production build and preview:

```sh
npm run build
npm start
```

The site is a static export in `out/`. `npm start` serves the real export with correct MIME types, negotiated gzip, true 404 responses and per-page CSP hashes for Next's inline bootstrap scripts. It rejects traversal, hidden files and symlinks outside the export. `out/health.json` identifies a complete static build; it does not claim to check external services. Webpack and one generation worker keep this project's build predictable.

### This workstation

The original Windows workspace has dependencies and output linked to another drive after earlier disk pressure. Next.js cannot reliably compile across drive-linked dependencies. The current clean-install validation uses `D:/sami-portfolio-delivery-20261111`; the workspace source remains authoritative. The older `D:/sami-portfolio-20261107` holds the existing junction targets. Keep source changes synchronized before using either build copy. This is specific to this workstation: a fresh checkout uses the standard commands above in one directory and needs no junctions or Android repository.

## Edit content

- `src/data/site.ts`: profile, verified contact links, education and home-page translations. Site origin and optional résumé are environment settings.
- `src/data/projects.ts`: project descriptions, roles, status, technical decisions, learning notes and evidence links in all four languages.
- `src/data/interface.ts`: navigation labels, image descriptions, gallery text, error messages and page metadata in all four languages.
- `src/app/globals.css`: design tokens, responsive layouts, typography and motion.
- `src/components/`: shared semantic page components. Only navigation and clipboard feedback require client JavaScript.
- `public/images/`: optimized actual project images and social preview.
- `public/brand/`: full logo and icon exports in SVG/transparent PNG, dark/light/monochrome variants and a contact sheet. Regenerate using `npm run brand` without external services.
- `CONTENT-SOURCES.md`: evidence and distinctions between project implementation, contribution and unverified outcomes.

To add a project, add an object to `projects.ts` with a unique slug, translations for `en`, `ar`, `he` and `de`, a truthful status, role note and supporting links. Static case-study routes and the sitemap are generated from the same data. Add an actual optimized screenshot and extend `ProjectVisual.tsx` for the new visual composition. Do not reuse another project's image as evidence.

To add the real résumé, place it at `public/sami-abu-raaed-cv.pdf` and set `NEXT_PUBLIC_RESUME_URL=/sami-abu-raaed-cv.pdf` in `.env.local` or the host's build environment. Alternatively use a public HTTPS file URL. No source-code change is needed. `npm run check:config` validates local PDFs (signature, location and 10 MB size limit); external URLs need a manual file-open check. Leave the setting empty to keep the link hidden. Clipboard operations have pending, success and failure states; denied/unavailable clipboard access leaves the visible email and `mailto:` link usable. No mail is sent by this website.

## Verification

```sh
npm run format:check
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

`npm run verify` runs those checks in order. On a clean machine install the test browser first with `npx playwright install chromium` (Linux CI uses `--with-deps`). The GitHub Actions workflow checks every push/PR with Node 24 and uploads browser evidence; it does not deploy. Unit tests cover public configuration and actual HTTP server security/semantics. No secrets are needed by CI.

Browser tests automatically read `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_RESUME_URL` from the production environment files in order: `.env.production.local`, `.env.local`, `.env.production`, then `.env`. Existing environment values, including an explicitly empty value, take precedence. Other environment-file keys are not loaded into the test process; server and browser-tool overrides remain command-line environment settings. Rebuild after changing these public settings so the exported pages and tests agree.

Browser tools use `CHROME_PATH` when set, installed Chrome on Windows when available, or Playwright Chromium. Tests start the static preview unless one is already running; ensure an existing server serves the current build. Coverage includes 360, 390, 768 and 1440 px in all four languages, case studies, every language-switch pair, English default, keyboard/menu focus, images, clipboard denial/unavailability/repeated clicks, no-JavaScript navigation/contact, local assets/fonts, metadata, true 404s and axe checks. Actual captures are written to `artifacts/screenshots/`.

For Lighthouse, leave `npm start` running in one terminal and use another:

```sh
npm run audit
```

The audit records Lighthouse JSON and HTML under `artifacts/lighthouse/`, including environment and throttling settings. It runs all four localized home pages and the English PATHY case study three times each on mobile and desktop (30 measurements) and reports median category scores. Each measurement uses a fresh browser and temporary profile; cleanup warnings are retained per run. It exits unsuccessfully when a measurement fails or any measured group is below 90. To recheck only one route/device, run `npm run audit -- /projects/pathy/ desktop`; its three measurements are saved separately in `artifacts/lighthouse/recheck-projects-pathy-desktop/`, preserving the original full audit. See `QA-REPORT.md` for actual results and limitations from this delivery. Automated accessibility checks complement the visual and keyboard review; they do not establish complete WCAG conformance.

## Deploy

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin, without a path, query or credentials. These are public build settings, not secrets. Run `npm run check:config -- --release`, then `npm run build:release`. Release preflight fails clearly if the origin is missing or invalid. Rebuild whenever public settings change; a static export cannot read new environment values at runtime.

Deploy the contents of `out/` to a static host with HTTPS, directory indexes and a true `404.html` response. The post-build script generates `_headers` with shared security headers and exact inline-script CSP hashes for hosts that support this file (including Cloudflare Pages). Hosts that ignore `_headers` need equivalent response-header configuration; verify the live headers after deployment. Do not rewrite every missing route to the home page. Root-level hosting is supported; GitHub Pages under `/sami-portfolio/` would require a base-path adaptation and is not the prepared deployment target. The existing `.openai/hosting.json` retains the assigned Sites identity, but no website deployment is implied by that file. Follow [API_SETUP.md](API_SETUP.md) for the supported setup without writing application code.

Back up the Git repository plus any owner-supplied résumé. There is no application database or visitor state to export. Keep a previous static build/release on the host; roll back by redeploying that complete build. Verify `/`, `/ar/`, `/he/`, `/de/`, a project page, `/health.json`, and a nonexistent path after deployment or rollback.

Existing captures are included, so running the website does not require the Android repository. `npm run assets` is an optional maintenance script that refreshes PATHY images from `../docs/screenshots` and regenerates the social image/favicon. Preserve that source folder or update the script if regenerating outside this workspace. All fonts are self-hosted through Fontsource packages and use their included open font licences.

## Content still requiring owner input

- The real résumé PDF.
- Exact feature-by-feature ownership within PATHY's two-person academic team, only if more detailed individual attribution is desired. Sami confirmed that TravelScan AI is a solo academic project and the other projects are solo personal work.
- A hosting destination, final origin and website publication authorization. The source repository is already public; no new audience or hosting permissions are changed automatically.

No employment history, experience duration, user counts, client claims, testimonials or unmeasured success percentages have been added.
