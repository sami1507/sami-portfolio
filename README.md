# Sami Abu Raaed — portfolio

A complete four-language portfolio built with Next.js, TypeScript and CSS. English is always the default (`/`), including for browsers set to another language. Arabic (`/ar/`) and Hebrew (`/he/`) have server-rendered RTL documents; German (`/de/`) uses LTR. Each featured project has a separate case study in all four languages. The language selector preserves the current case study.

## Run locally

Use Node.js 22.13+ (Node 24 LTS recommended) and npm. From this folder:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. To reproduce the production build and preview:

```sh
npm run build
npm start
```

The site is a static export in `out/`; no database, backend, API keys or external font requests are required. `npm start` serves the real export with correct MIME types, static cache headers and 404 responses. Webpack is selected explicitly; static generation uses one worker to keep memory use modest.

### This workstation

Drive C ran out of disk space during setup. Dependencies and generated artifacts are stored in `D:/sami-portfolio-20261107`, with links from this workspace. Next.js cannot reliably compile across those drive-linked dependencies, so the verified production build was made from an identical source copy on D. `npm start` from this workspace serves that build. For development on this workstation, use `npm --prefix D:/sami-portfolio-20261107 run dev`; keep that copy synchronized with the workspace source before rebuilding. This is an environment constraint, not a requirement for a fresh checkout: on a machine with sufficient disk space, the standard `npm ci` commands above apply.

## Edit content

- `src/data/site.ts`: profile, verified contact links, education, all home-page translations, site URL and optional résumé.
- `src/data/projects.ts`: project descriptions, roles, status, technical decisions, learning notes and evidence links in all four languages.
- `src/data/interface.ts`: navigation labels, image descriptions, gallery text, error messages and page metadata in all four languages.
- `src/app/globals.css`: design tokens, responsive layouts, typography and motion.
- `src/components/`: shared semantic page components. Only navigation and clipboard feedback require client JavaScript.
- `public/images/`: optimized actual project images and social preview.
- `CONTENT-SOURCES.md`: evidence and distinctions between project implementation, contribution and unverified outcomes.

To add a project, add an object to `projects.ts` with a unique slug, translations for `en`, `ar`, `he` and `de`, a truthful status, role note and supporting links. Static case-study routes and the sitemap are generated from the same data. Add an actual optimized screenshot and extend `ProjectVisual.tsx` for the new visual composition. Do not reuse another project's image as evidence.

To add the real résumé, put the supplied PDF under `public/` and set `profile.resume` to its absolute site path (for example `/sami-abu-raaed-cv.pdf`). The link stays absent until configured. Email copying reports clipboard failure honestly; the visible email and `mailto:` link remain available.

## Verification

```sh
npm run typecheck
npm run build
npm run test:e2e
```

The Playwright configuration defaults to the installed Chrome executable on Windows and to Playwright's own Chromium elsewhere (`npx playwright install chromium` if it is missing). Set `CHROME_PATH` to use a specific Chrome/Chromium executable. The tests start the production preview if it is not already running. They cover 360, 390, 768 and 1440 px in all four languages, overflow, that screenshot windows never collide with their captions at six widths, project routes, every language-switch pair, English as the default under different browser language preferences, keyboard navigation, mobile menu, image loading, real clipboard interaction, reduced motion, 404s and automated axe checks. Actual captures are written to `artifacts/screenshots/`.

For Lighthouse, leave `npm start` running in one terminal and use another:

```sh
npm run audit
```

The audit records Lighthouse JSON and HTML under `artifacts/lighthouse/`, including environment and throttling settings. It runs all four localized home pages and the English PATHY case study three times each on mobile and desktop (30 measurements) and reports median category scores. It exits unsuccessfully when any measured group is below 90. A Windows temporary-profile cleanup warning is recorded separately without discarding completed measurements. See `QA-REPORT.md` for actual results and limitations from this delivery. Automated accessibility checks complement the visual and keyboard review; they do not establish complete WCAG conformance.

## Deploy

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin before building. The value controls canonical URLs, language alternates, Open Graph, robots and sitemap. The default is the assigned Sites origin. There are no secrets in this setting.

Deploy the contents of `out/` to any static host that serves directory indexes and `404.html`. For Vercel, choose the Next.js project and use `npm run build`; alternatively deploy `out/` as static content. The `.openai/hosting.json` file binds this checkout to the assigned Sites project. The Sites delivery uses private access; making the site publicly accessible is a separate audience choice.

Existing captures are included, so running the website does not require the Android repository. `npm run assets` is an optional maintenance script that refreshes PATHY images from `../docs/screenshots` and regenerates the social image/favicon. Preserve that source folder or update the script if regenerating outside this workspace. All fonts are self-hosted through Fontsource packages and use their included open font licences.

## Content still requiring owner input

- The real résumé PDF.
- Exact feature-by-feature ownership within PATHY's two-person academic team, only if more detailed individual attribution is desired. Sami confirmed that TravelScan AI is a solo academic project and the other projects are solo personal work.
- A public-release decision and any custom domain. No public audience change is made automatically.

No employment history, experience duration, user counts, client claims, testimonials or unmeasured success percentages have been added.
