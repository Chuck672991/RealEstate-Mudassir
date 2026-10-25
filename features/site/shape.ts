import { text } from "@/features/content/policy";
import { toImage, type RawImage } from "@/lib/sanity/image";
import { INQUIRY_TOPICS_DEFAULT, NAV_DEFAULT } from "@/sanity/lib/enums";
import type { LinkDTO, SeoDTO, SiteSettingsDTO } from "@/types/content";

export interface RawSeo {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  ogImage?: RawImage | null;
}

export function toSeo(raw: RawSeo | null | undefined, fallbackAlt = ""): SeoDTO | null {
  if (!raw) return null;
  return {
    title: text(raw.title),
    description: text(raw.description),
    canonicalUrl: text(raw.canonicalUrl),
    noIndex: raw.noIndex ?? undefined,
    ogImage: toImage(raw.ogImage, fallbackAlt),
  };
}

export interface RawLink {
  label?: string | null;
  href?: string | null;
  opensContactForm?: boolean | null;
}

export const toLinks = (items?: RawLink[] | null): LinkDTO[] =>
  (items ?? [])
    .filter((l): l is RawLink & { label: string; href: string } => !!l.label && !!l.href)
    .map((l) => ({ label: l.label, href: l.href, ...(l.opensContactForm ? { opensContactForm: true } : {}) }));

export interface RawSiteSettings {
  siteName?: string | null;
  siteTagline?: string | null;
  showRatingSummary?: boolean | null;
  showOfficeAddress?: boolean | null;
  inquiryTopics?: string[] | null;
  nav?: RawLink[] | null;
  footerNote?: string | null;
  legalLinks?: RawLink[] | null;
  complianceNotice?: string | null;
  listingDisclaimer?: string | null;
  dataNotice?: string | null;
  defaultSeo?: RawSeo | null;
  observedOn?: string | null;
}

/** Safe defaults let the site render before any settings document exists. */
export function shapeSiteSettings(raw: RawSiteSettings | null | undefined): SiteSettingsDTO {
  const nav = toLinks(raw?.nav);
  return {
    siteName: text(raw?.siteName) ?? "Mudassir Siddiqui",
    siteTagline: text(raw?.siteTagline),
    showRatingSummary: raw?.showRatingSummary ?? true,
    showOfficeAddress: raw?.showOfficeAddress ?? true,
    inquiryTopics: raw?.inquiryTopics?.length ? raw.inquiryTopics : [...INQUIRY_TOPICS_DEFAULT],
    nav: nav.length ? nav : NAV_DEFAULT.map((l) => ({ ...l })),
    footerNote: text(raw?.footerNote),
    legalLinks: toLinks(raw?.legalLinks),
    complianceNotice: text(raw?.complianceNotice),
    listingDisclaimer: text(raw?.listingDisclaimer),
    dataNotice: text(raw?.dataNotice),
    defaultSeo: toSeo(raw?.defaultSeo),
    observedOn: text(raw?.observedOn),
  };
}
