import type { Metadata } from "next";
import { interfaceCopy } from "@/data/interface";
import { locales, localeInfo, homePath } from "@/data/site";
import "./globals.css";
export const metadata: Metadata = {
  title: "Page not found | Sami Abu Raaed",
  robots: { index: false, follow: false },
};
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body>
        <main className="container error-page">
          <p className="eyebrow">404</p>
          {locales.map((locale) => {
            const text = interfaceCopy[locale];
            return (
              <div key={locale} lang={locale} dir={localeInfo[locale].dir}>
                {locale === "en" ? (
                  <h1>{text.notFound}</h1>
                ) : (
                  <h2>{text.notFound}</h2>
                )}
                <p>{text.notFoundBody}</p>
                <a
                  className={`button ${locale === "en" ? "button-primary" : "button-outline"}`}
                  href={homePath(locale)}
                >
                  {text.returnHome} <span aria-hidden="true">↗</span>
                </a>
              </div>
            );
          })}
        </main>
      </body>
    </html>
  );
}
