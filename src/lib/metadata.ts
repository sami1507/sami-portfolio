import type { Metadata } from "next";
import {
  profile,
  homePath,
  projectPath,
  locales,
  localeInfo,
  type Locale,
} from "@/data/site";
import { interfaceCopy } from "@/data/interface";
import type { Project } from "@/data/projects";
export function pageMetadata(locale: Locale, project?: Project): Metadata {
  const text = interfaceCopy[locale];
  const title = project
    ? `${project.name} — ${text.studyTitle} | ${localeInfo[locale].name}`
    : text.metaTitle;
  const description = project ? project.summary[locale] : text.metaDescription;
  const path = project ? projectPath(locale, project.slug) : homePath(locale);
  return {
    metadataBase: new URL(profile.siteUrl),
    title,
    description,
    applicationName: "Sami Abu Raaed",
    authors: [{ name: profile.name, url: profile.github }],
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(
          locales.map((language) => [
            language,
            project ? projectPath(language, project.slug) : homePath(language),
          ]),
        ),
        "x-default": project ? projectPath("en", project.slug) : "/",
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      siteName: profile.name,
      locale: localeInfo[locale].ogLocale,
      alternateLocale: locales
        .filter((language) => language !== locale)
        .map((language) => localeInfo[language].ogLocale),
      images: [
        {
          url: "/images/og-cover.png",
          width: 1200,
          height: 630,
          alt: text.metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-cover.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}
