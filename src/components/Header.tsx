"use client";
import { useEffect, useRef, useState } from "react";

import {
  copy,
  homePath,
  projectPath,
  locales,
  localeInfo,
  type Locale,
} from "@/data/site";
import { interfaceCopy } from "@/data/interface";
import { Arrow, Mark } from "./Icons";
export function Header({ locale, slug }: { locale: Locale; slug?: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const languages = useRef<HTMLDetailsElement>(null);
  const t = copy[locale];
  const home = homePath(locale);
  useEffect(() => {
    if (open)
      document.querySelector<HTMLAnchorElement>("#main-navigation a")?.focus();
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && languages.current?.open) {
        languages.current.open = false;
        languages.current.querySelector("summary")?.focus();
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (
        languages.current?.open &&
        !languages.current.contains(e.target as Node)
      )
        languages.current.open = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="site-header" id="top">
        <div className="container nav-shell">
          <a className="brand" href={home} aria-label={t.homeLabel}>
            <Mark />
            <span dir="ltr">
              SAMI<span className="brand-dot">.</span>
            </span>
          </a>
          <nav
            className={`navigation ${open ? "is-open" : ""}`}
            aria-label={interfaceCopy[locale].navigation}
            id="main-navigation"
          >
            <a onClick={() => setOpen(false)} href={`${home}#work`}>
              {t.work}
            </a>
            <a onClick={() => setOpen(false)} href={`${home}#about`}>
              {t.about}
            </a>
            <a onClick={() => setOpen(false)} href={`${home}#skills`}>
              {t.skills}
            </a>
            <a
              onClick={() => setOpen(false)}
              className="nav-contact"
              href={`${home}#contact`}
            >
              {t.contact}
              <Arrow diagonal />
            </a>
          </nav>
          <div className="nav-actions">
            <details ref={languages} className="language-menu">
              <summary
                className="language-switch"
                data-testid="language-toggle"
                aria-label={`${t.language}: ${localeInfo[locale].label}`}
              >
                {localeInfo[locale].label}
                <span aria-hidden="true">⌄</span>
              </summary>
              <nav className="language-options" aria-label={t.language}>
                {locales.map((language) => (
                  <a
                    key={language}
                    href={
                      slug ? projectPath(language, slug) : homePath(language)
                    }
                    hrefLang={language}
                    lang={language}
                    dir={localeInfo[language].dir}
                    aria-current={language === locale ? "page" : undefined}
                  >
                    {localeInfo[language].label}
                    {language === locale && <span aria-hidden="true">✓</span>}
                  </a>
                ))}
              </nav>
            </details>
            <button
              ref={button}
              data-testid="menu-toggle"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="main-navigation"
              aria-label={open ? t.close : t.menu}
              onClick={() => setOpen(!open)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
