import type { Metadata } from "next";

import type { SeoDTO } from "@/types/content";

interface BuildMetadataInput {
  /** Site path of this page, e.g. "/properties". Resolved against metadataBase. */
  path: string;
  /** Page-level overrides from the CMS. */
  seo?: SeoDTO | null;
  /** Site-wide defaults from Site settings. */
  defaults?: SeoDTO | null;
  /** Page-specific text, used when the page's own SEO field is empty (before the site default). */
  fallbackDescription?: string;
  /** Title when neither provides one. */
  fallbackTitle?: string;
  /** Use the title verbatim (skip the "%s | Site" template). */
  absoluteTitle?: boolean;
  /** Always keep this page out of search results. */
  noIndex?: boolean;
  openGraphType?: "website" | "article";
}

const clip = (text: string | undefined, max: number) => {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
};

/** The generated sharing card (app/og/route.tsx). Resolved against metadataBase. */
const GENERATED_OG = { url: "/og", width: 1200, height: 630 } as const;

/**
 * Metadata from CMS content, with page → site → fallback precedence.
 * Canonical defaults to the page's own path; the Open Graph image comes from the
 * CMS when set, otherwise from the generated card at /og (app/og/route.tsx), which is
 * attached explicitly so its absolute URL always comes from metadataBase.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { seo, defaults } = input;
  const title = seo?.title ?? input.fallbackTitle ?? defaults?.title;
  const description = clip(seo?.description ?? input.fallbackDescription ?? defaults?.description, 200);
  const canonical = seo?.canonicalUrl ?? input.path;
  const image = seo?.ogImage ?? defaults?.ogImage ?? null;
  const index = !(input.noIndex || seo?.noIndex || defaults?.noIndex);
  const shareTitle = typeof title === "string" ? title : "Mudassir Siddiqui";
  const shareImage = image
    ? { url: image.src, width: image.width, height: image.height, alt: image.alt }
    : { ...GENERATED_OG, alt: shareTitle };

  // Next merges metadata key by key and treats a key that is present-but-undefined as
  // "set to empty" — `title: undefined` would ERASE the layout's default title and leave
  // the page with none. So a field is only included when there is a value for it.
  const metadata: Metadata = {
    alternates: { canonical },
    openGraph: {
      type: input.openGraphType ?? "website",
      url: canonical,
      locale: "en_US",
      images: [shareImage],
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
    twitter: {
      card: "summary_large_image",
      images: [shareImage.url],
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  };
  if (title) metadata.title = input.absoluteTitle ? { absolute: title } : title;
  if (description) metadata.description = description;
  if (!index) metadata.robots = { index: false, follow: false };
  return metadata;
}
