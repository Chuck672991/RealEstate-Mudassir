import "server-only";

import { toSeo } from "@/features/site";
import { fetchContent } from "@/lib/sanity/fetch";
import { PROPERTY_BY_SLUG_QUERY, PROPERTY_SLUGS_QUERY, PUBLIC_PROPERTIES_QUERY } from "@/lib/sanity/queries";
import type { PropertyDTO, PropertyDetailDTO } from "@/types/content";

import { comparePropertyOrder, toPropertyDTO, toPropertyDetailDTO, type RawProperty } from "./dto";

/** Every property the site may show, in display order. */
export async function getProperties(): Promise<PropertyDTO[]> {
  const raw = await fetchContent<Array<RawProperty & { verification?: string }>>(PUBLIC_PROPERTIES_QUERY);
  return (raw ?? [])
    .map(toPropertyDTO)
    .filter((p): p is PropertyDTO => !!p)
    .sort(comparePropertyOrder);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetailDTO | null> {
  const raw = await fetchContent<(RawProperty & { seo?: Parameters<typeof toSeo>[0] }) | null>(PROPERTY_BY_SLUG_QUERY, { slug });
  if (!raw) return null;
  return toPropertyDetailDTO(raw, toSeo(raw.seo));
}

export async function getPropertySlugs(): Promise<Array<{ slug: string; updatedAt: string }>> {
  const raw = await fetchContent<Array<{ slug?: string; _updatedAt: string }>>(PROPERTY_SLUGS_QUERY);
  return (raw ?? []).filter((r) => !!r.slug).map((r) => ({ slug: r.slug!, updatedAt: r._updatedAt }));
}

/** Homes for the home-page slider: featured ones if any are ticked, else all current listings. */
export async function getFeaturedHomes(limit = 6): Promise<PropertyDTO[]> {
  const active = (await getProperties()).filter((p) => p.status === "active");
  const featured = active.filter((p) => p.featured);
  return (featured.length ? featured : active).slice(0, limit);
}

/** Sales for the home-page stage: featured ones if any are ticked, else the most recent. */
export async function getRecentlySold(limit = 6): Promise<PropertyDTO[]> {
  const sold = (await getProperties()).filter((p) => p.status === "sold");
  const featured = sold.filter((p) => p.featured);
  return (featured.length ? featured : sold).slice(0, limit);
}
