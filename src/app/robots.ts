import type { MetadataRoute } from "next";
import { profile } from "@/data/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: profile.siteUrl
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: profile.siteUrl ? `${profile.siteUrl}/sitemap.xml` : undefined,
  };
}
