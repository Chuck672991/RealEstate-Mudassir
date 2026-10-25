import type { MetadataRoute } from "next";

import { absoluteUrl, isPlaceholderSiteUrl } from "@/lib/site";

/**
 * Crawlers may index the site; the Studio and the API routes (preview, webhook)
 * are never listed. While NEXT_PUBLIC_SITE_URL is still the localhost placeholder
 * the whole site is disallowed, so a staging deploy cannot be indexed by accident.
 */
export default function robots(): MetadataRoute.Robots {
  if (isPlaceholderSiteUrl()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
