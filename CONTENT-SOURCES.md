# Content evidence

Reviewed 7 November 2026. This file records the evidence behind the portfolio, rather than making commercial performance claims. Repository descriptions establish implementation intent and code structure; they are not independent production or field-test certificates.

## Profile and contact

- Name, professional focus (Android, web, AI), Kotlin, Jetpack Compose, TypeScript, Next.js and Python: supplied directly by Sami in this task.
- GitHub: <https://github.com/sami1507>, supplied by Sami and confirmed by connected GitHub repository records.
- Email: `samiaburaed42@gmail.com`, published in both the contact section and source markup of [the existing portfolio](https://github.com/sami1507/web-portfilo2/blob/main/README.md) and [index.html](https://github.com/sami1507/web-portfilo2/blob/main/index.html). This verifies the published address, not mail delivery.
- LinkedIn: <https://linkedin.com/in/sami-abu-raaed-89277b307>, published in those same sources. Do not claim independent verification of the profile identity or availability without a successful visit.
- Education: the existing portfolio's `index.html` states “Practical Engineering Diploma in Software Engineering”, “College of Management, Haifa”, and “Oct 2022 - Oct 2025”; the About text says graduated October 2025. This is self-published biographical evidence, not a verified diploma document.
- No genuine resume file was found in the inspected content. Do not generate a fictitious CV or render a dead download control.
- No employment, client, usage, income, award, or quantified professional-experience claims are carried over from old portfolio templates.

## PATHY

- Repository: <https://github.com/sami1507/pathy>, public, confirmed via the GitHub connector. Local origin points to the same repository.
- Sources: local `../README.md`, `../docs/ARCHITECTURE.md`, `../docs/DEVELOPMENT.md`, `../docs/TRAIL_DATA.md`, and their public repository equivalents.
- Source state inspected: local latest commit `f133f19`, with previous implementation commits authored by `sami1507`, including trail map/offline flow, offline store, recording and UI work. README explicitly says actively developed by `@sami1507`.
- Supported description: Android hiking application with trail discovery from OpenStreetMap, GPS recording persisted through a foreground service and Room, deferred uploads through WorkManager, offline trail/map storage, route guidance, GPX import/export, and English/Arabic/Hebrew interfaces.
- Technical decision: Android-free Kotlin `:core` separates route/recording/domain logic from platform and provider SDKs. Accepted GPS points and session state persist locally; the service reconstructs state after process death.
- Role and classification: Sami explicitly confirmed in this conversation that PATHY is an academic project by a team of two, with programming responsibilities divided between them. The case study describes the shared project's decisions; it does not attribute the teammate's work to Sami. Exact per-feature ownership remains unspecified.
- Status: actively developed. No app-store listing or public install release was established, so there is no invented live app link.
- Evidence: `docs/screenshots/discover-en.png`, `recording-restored.png`, `recording-notification.png`, `map-trails.png`, `trail-details-offline.png`, `saved-trails-offline.png`, `guidance-offline.png` are described in README as actual Android emulator captures. Other listed screenshots are produced by the app's own screenshot tests, and must not be labelled as photographs of a physical device.
- Limits: README says offline behavior on physical phones, walkie-talkie behavior, and deployed Firebase rules still need testing. Emulator evidence is not represented as field validation. No test-count marketing is used because counts can become stale.

## TravelScan AI

- Repository: <https://github.com/sami1507/Travel-Scan-AI>, public, confirmed via the GitHub connector.
- Repository homepage: <https://travel-scan-ai.vercel.app>. Root browser verification returned HTTP 200 and the expected TravelScan landing page on 7 November 2026. Its actual screenshot is included. The capture is cropped before an unsupported marketing user-count claim; the illustrative destination score belongs to the product's landing-page example, not a measured portfolio outcome.
- Sources: [README](https://github.com/sami1507/Travel-Scan-AI/blob/main/README.md), [architecture](https://github.com/sami1507/Travel-Scan-AI/blob/main/docs/project-architecture.md), [graduation audit](https://github.com/sami1507/Travel-Scan-AI/blob/main/docs/graduation-project-audit.md), `package.json`, and [deterministic scoring engine](https://github.com/sami1507/Travel-Scan-AI/blob/main/src/lib/scoring/engine.ts).
- Supported description: Next.js/TypeScript travel-analysis application with conversational and guided input, structured destination comparisons, route analysis, saved trips, OpenAI integration, Zod validation, and Supabase-backed application data/authentication.
- Technical decision: generated text is surrounded by validated schemas, explicit scoring logic, optional provider data, and fallback route data. The scoring source computes separate factors such as budget, weather, transport, and accommodation value.
- Academic classification: repository contains explicit graduation-project audit, report outline, evaluation plan and presentation planning documents. This supports “Academic project”; no institution, graduation date, grade, or award is inferred for this project.
- Role: Sami explicitly confirmed in this conversation that TravelScan AI is an individual academic project developed by him alone. Attributed commits additionally document the analysis pipeline and multilingual interface. No commercial usage or measured outcome is inferred from authorship.
- Status: in development. The README calls the project production-ready, but the graduation audit identifies missing formal quantitative evaluation. The portfolio therefore does not repeat “production-ready”, model accuracy, reliability percentages, savings, user counts or client outcomes.
- Screenshot availability: recursive tree inspection found no PNG/JPG/WebP screenshots. `docs/screenshots-needed.md` is a capture plan, not evidence that those images exist. Use only newly captured real pages or a clearly labelled illustration.
- No authenticated analysis, payment, or account mutation was requested by this research pass. A reachable landing page does not prove the complete authenticated analysis flow works.

## TaskFlow

- Repository: <https://github.com/sami1507/taskflow-kanban>, public, confirmed via repository search and README fetch.
- Live demo: <https://sami1507.github.io/taskflow-kanban/>, linked by its README and profile. Root browser verification returned HTTP 200 and the expected Kanban board on 7 November 2026. An actual screenshot of its sample board is included.
- Source: [README](https://github.com/sami1507/taskflow-kanban/blob/main/README.md), including detailed implementation notes and file paths.
- Actual stack: **React 19, JavaScript, Vite, CSS**. Do not use this project as evidence for TypeScript or Next.js; TravelScan AI demonstrates those.
- Supported behavior: create/edit/delete cards, priorities/tags, drag-and-drop ordering, explicit move buttons, search, progress, themes, localStorage persistence, responsive design and reduced-motion support.
- Technical decision: single reducer, normalized `{ cards, order }` board, and pure logic in `src/board.js` tested by `src/board.test.js`; guarded storage in `src/storage.js` keeps the app running if browser storage is blocked.
- Scope: Sami explicitly confirmed that his remaining projects, including TaskFlow, are personal and individually developed. No backend, signup, cloud synchronization or cross-device persistence is claimed for TaskFlow.
- Real repository screenshot: <https://raw.githubusercontent.com/sami1507/taskflow-kanban/main/docs/screenshot.png>. New live captures can also be used.

## Remaining confirmations

The portfolio includes English, Arabic, Hebrew and German. Translations retain the same source-backed claims and owner-confirmed roles; they are not additional evidence. The German education entry preserves the original English diploma title rather than claiming equivalence to a German qualification. Project screenshots remain authentic captures in the projects' original interface languages, with translated captions and alternative text.

1. Obtain the genuine resume PDF before enabling a resume link.
2. Exact per-feature contribution boundaries within the two-person PATHY team, if stronger individual claims are desired.
3. A public audience decision and any custom domain. The assigned Sites origin is already used by canonical metadata and sitemap.
