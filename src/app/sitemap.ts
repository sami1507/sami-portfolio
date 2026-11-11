import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { profile, homePath, projectPath, locales } from "@/data/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    [homePath(locale), ...projects.map((p) => projectPath(locale, p.slug))].map(
      (path) => ({ url: `${profile.siteUrl}${path}` }),
    ),
  );
}
