# Configuration and hosting setup

This portfolio requires **no API keys, database, authentication service, or application backend**. Next.js builds static pages and assets into `out/`. The Node server used by `npm start` is a local static preview server, not a contact API or data service.

The projects described in the portfolio may use Firebase, Supabase, AI providers, or other services. Those integrations belong to their own applications; none of their credentials is needed to run this portfolio.

## What the contact and project controls do

- **Email:** a `mailto:` link opens the visitor's configured email application. It does not send a message from the website or report a successful delivery.
- **Copy email:** uses the browser clipboard locally. A deployed site needs HTTPS for the clipboard's secure context; loopback development addresses are generally treated as secure contexts too. Browser permissions can still deny copying, in which case the interface provides a fallback message and the email link remains available.
- **GitHub, LinkedIn, and live projects:** ordinary outbound links. There is no GitHub API integration, LinkedIn SDK, OAuth callback, or runtime project-data fetch to configure.
- **Résumé:** an optional link to a real file. It stays hidden when no file URL is configured.

There is no contact form service, webhook receiver, account creation, or payment integration in this package.

## Public build settings

Copy `.env.example` to `.env.local` and fill in only the values you have. Use Node.js 24 for the documented workflow; `package.json` declares a minimum of Node.js 22.13.0.

```sh
npm ci
npm run dev
```

The development script serves <http://127.0.0.1:3000>. A missing public origin is supported for local work.

| Variable                 | Default            | Purpose and constraints                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Empty              | Final HTTPS origin, for example `https://portfolio.example`. Required by `npm run build:release`. No credentials, subpath, query, or fragment. A trailing `/` is normalized to the origin. This supplies canonical metadata and sitemap URLs.                                                                                                                     |
| `NEXT_PUBLIC_RESUME_URL` | Empty; link hidden | Optional real résumé: either a local `/filename.pdf` under `public/`, or a public HTTPS URL without credentials. Local filenames support letters, digits, `_`, `-`, and subdirectories, with lowercase `.pdf`; avoid spaces. The build validates that a local file stays inside `public/`, starts with a PDF signature, and is at most 10 MiB (10,485,760 bytes). |

For a local résumé, place the genuine file at `public/sami-abu-raaed-cv.pdf` and set:

```dotenv
NEXT_PUBLIC_RESUME_URL=/sami-abu-raaed-cv.pdf
```

An external HTTPS résumé URL receives syntax validation only. Open the actual link yourself before publishing to confirm that it serves the intended document without a sign-in requirement. A GitHub HTML file-view page is not a direct PDF download; choose the actual public file URL if that is the intended experience. No résumé file is fabricated by the setup process.

`NEXT_PUBLIC_*` values are public and are compiled into the generated website. They are not secrets. Changing them requires rebuilding and deploying the new `out/`; changing a host's environment after a static build does not alter existing files. Never place a service secret in a public variable or in `public/`.

Next.js loads its supported environment files during development/build. The configuration checker also reads `.env.<mode>.local`, `.env.local`, `.env.<mode>`, and `.env`, in that order, while preserving values already present in the process environment. Its mode is `NODE_ENV`, defaulting to `production` when unset. Keep `.env.local` out of version control.

## Preview and release checks

```sh
npm run check:config
npm run build
npm start
```

With an empty `NEXT_PUBLIC_SITE_URL`, the build is a **preview**: search metadata is `noindex`, robots disallows crawling, and the sitemap has no entries. This is intentional and can affect an SEO audit. It is not an access-control mechanism: anyone with access to a hosted preview can still read it.

When the final origin is known, set it before creating the release:

```sh
npm run build:release
```

The release command fails if the origin is missing or invalid, or if a configured local résumé fails validation. A successful configuration check validates those settings; it does not register a domain, verify DNS or TLS, upload files, publish the site, or prove an external résumé is reachable.

## Local server and QA environment

The following settings belong to tooling. Set them in the shell or CI environment that launches the command. Unlike Next and `check-config.mjs`, the standalone preview/audit scripts and Playwright configuration do **not** automatically read `.env.local`.

| Variable                  | Default                                                                                                                                               | Where it applies                                                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HOST`                    | `127.0.0.1`                                                                                                                                           | Bind address for `npm start`. Use a different address only when you intend to expose the preview there. It does not change the hardcoded host in `npm run dev`.                                                             |
| `PORT`                    | `3000`                                                                                                                                                | Port for `npm start`, an integer from 1 to 65535. Also supplies the default port used by Playwright and the visual-review script. It does not change the hardcoded port in `npm run dev`.                                   |
| `CHROME_PATH`             | On Windows, the standard Chrome installation at `C:/Program Files/Google/Chrome/Application/chrome.exe` when available; otherwise Playwright Chromium | Optional executable path for browser tests, source captures, visual review, and Lighthouse. Install Playwright Chromium on a clean machine if needed; a compatible browser must exist locally.                              |
| `PLAYWRIGHT_BASE_URL`     | `http://127.0.0.1:<PORT>`, with port 3000 if unset                                                                                                    | Base URL for end-to-end tests and visual review. Playwright's configured web-server command is still `npm start`; keep the address consistent with that server or an intended existing preview.                             |
| `AUDIT_URL`               | `http://127.0.0.1:3000`                                                                                                                               | Origin audited by Lighthouse. Unlike the Playwright default, it does not follow `PORT`; set it explicitly if the preview uses another port. Start a production preview before the audit.                                    |
| `AUDIT_RUNS`              | `3`                                                                                                                                                   | Repetitions per audited route and device. Must be an integer from 1 to 10; invalid values fail immediately. The current audit script covers the four home locales plus the English PATHY case study, on mobile and desktop. |
| `NODE_ENV`                | Managed by Next.js for its commands; configuration checker defaults to `production`                                                                   | Controls environment-file mode. Normally leave this to Next.js/your build environment.                                                                                                                                      |
| `CI`                      | Unset locally                                                                                                                                         | Playwright rejects focused tests when truthy and avoids reusing an existing server. Do not set the string `false` to disable it: any nonempty string is truthy in this configuration.                                       |
| `NEXT_TELEMETRY_DISABLED` | Unset                                                                                                                                                 | Optional Next.js tooling setting. Set `1` to disable Next.js telemetry; this is not a website feature or an API credential.                                                                                                 |

For example, in PowerShell, to preview and test on a different port:

```powershell
$env:PORT = '3100'
$env:AUDIT_URL = 'http://127.0.0.1:3100'
npm start
```

Run QA commands from another terminal with the relevant environment values set there too. `npm run test:e2e` can start its configured preview server when needed, but the production build must already exist. `npm run audit` requires an already running server. See `QA-REPORT.md` for actual measurements and their conditions; setup instructions do not establish a score.

## Static hosting

1. Choose the intended hosting project/account, final HTTPS origin, and audience. Set `NEXT_PUBLIC_SITE_URL` in the build environment and configure the optional real résumé.
2. Use the `portfolio` directory as the project root when deploying from the parent repository. Install dependencies with `npm ci` and build with `npm run build:release`.
3. Publish **only `out/`** as the static site. Do not expose the source checkout, environment files, dependency folders, or QA artifacts as the web root.
4. Configure directory index handling so `/ar/`, `/he/`, `/de/`, and project paths serve their respective `index.html`. Serve the exported `404.html` with an actual HTTP 404 status for missing pages. Avoid a blanket rewrite of every missing URL to the home page.
5. Enable HTTPS. Carry over the generated hosting-header configuration where the provider supports it; adapt headers for other providers using `scripts/security-headers.mjs`. The local server's response headers do not automatically configure an unrelated static host. Do not assume a provider applies unsupported header files.
6. Verify the deployed home and case-study routes in all four languages, missing-page behavior, images, fonts, email/clipboard controls, résumé if configured, canonical metadata, `robots.txt`, and `sitemap.xml`.

No OAuth app, redirect URI registration, database migration, webhook URL, or API provider account is required. Host credentials, if needed for an authorized deployment, belong to the hosting platform's secure deployment mechanism; they do not belong in this site's public settings.

These steps describe a deployment process, not a claim that any publication has already occurred. The inputs still needed for a new deployment are the exact target project/account and public origin, the intended audience and authorization to publish there, and optionally the genuine résumé file or public URL. Existing explicit authorization remains valid for its agreed scope.

## خطوات سريعة بالعربية

1. لا تحتاج إلى مفاتيح API أو قاعدة بيانات أو خدمة تسجيل دخول. شغّل `npm ci` ثم `npm run dev` للمعاينة المحلية.
2. انسخ `.env.example` إلى `.env.local`. اترك `NEXT_PUBLIC_SITE_URL` فارغًا للمعاينة؛ سيبقى الموقع خارج الفهرسة وتكون خريطة الموقع فارغة.
3. عند معرفة عنوان النشر، ضع أصل HTTPS الكامل في `NEXT_PUBLIC_SITE_URL`، دون مسار فرعي. شغّل `npm run check:config` ثم `npm run build:release`.
4. السيرة اختيارية: أضف ملف PDF الحقيقي إلى `public/` وحدّد مساره في `NEXT_PUBLIC_RESUME_URL`، أو استخدم رابط HTTPS عامًا للملف. يبقى الزر مخفيًا دون هذه القيمة.
5. انشر مجلد `out/` بعد تحديد حساب الاستضافة والعنوان والجمهور المطلوب والتفويض بالنشر. فعّل HTTPS، واختبر الصفحات والروابط والفهرسة بعد النشر.
6. رابط البريد يفتح تطبيق البريد لدى الزائر؛ لا يرسل الموقع رسالة تلقائيًا. زر النسخ يعمل داخل المتصفح، وروابط GitHub وLinkedIn والمشاريع روابط خارجية عادية.

تغيير القيم العامة يتطلب إعادة البناء والنشر. القيم الخاصة بأدوات الاختبار والخادم المحلي تُضبط في بيئة الطرفية؛ وضعها في `.env.local` وحده لا يفعّلها لهذه الأدوات.
