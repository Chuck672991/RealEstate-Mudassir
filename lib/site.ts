/**
 * Canonical origin helpers. `NEXT_PUBLIC_SITE_URL` is the single source of truth
 * for metadata, sitemap and structured data. Falls back to localhost so a fresh
 * checkout builds; set it in production.
 */
const FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK;
  return raw.replace(/\/+$/, "");
}

/** Absolute URL for a site path ("/properties" → "https://example.com/properties"). */
export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True when the configured origin is the localhost fallback (i.e. not production-ready). */
export function isPlaceholderSiteUrl(): boolean {
  return getSiteUrl() === FALLBACK;
}
