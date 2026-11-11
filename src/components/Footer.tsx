import { copy, localeInfo, homePath, type Locale } from "@/data/site";
import { Mark } from "./Icons";
export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <a className="footer-brand" href={homePath(locale)}>
          <Mark />
          <span>{localeInfo[locale].name}</span>
        </a>
        <p>{t.footer}</p>
        <a className="back-top" href="#top">
          {t.top}
          <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
