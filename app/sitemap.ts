import type { MetadataRoute } from "next";

import { getPropertySlugs } from "@/features/properties";
import { absoluteUrl } from "@/lib/site";

/**
 * Real routes only: the home page, the index pages, and one entry per PUBLISHED
 * home (never the Studio, never a draft). `lastModified` is the document's own
 * `_updatedAt`, so it only changes when the content does.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homes = await getPropertySlugs();
  const newest = homes.map((h) => h.updatedAt).sort().at(-1);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1, ...(newest ? { lastModified: newest } : {}) },
    { url: absoluteUrl("/properties"), changeFrequency: "weekly", priority: 0.9, ...(newest ? { lastModified: newest } : {}) },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    ...homes.map((h) => ({
      url: absoluteUrl(`/properties/${h.slug}`),
      lastModified: h.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
