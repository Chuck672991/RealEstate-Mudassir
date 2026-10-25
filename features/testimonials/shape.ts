import { opt, text } from "@/features/content/policy";
import type { TestimonialDTO } from "@/types/content";

export interface RawTestimonial {
  _id: string;
  body?: string | null;
  reviewerDisplayName?: string | null;
  publicName?: string | null;
  date?: string | null;
  platform?: string | null;
  rating?: number | null;
  featured?: boolean | null;
}

/** "Wasiullah Khan" → "Wasiullah K." (privacy-friendly default). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
}

/**
 * Reviews approved by the agent, with reviewer permission, and with the exact
 * text present. In the research dataset there are none yet — by design — so this
 * yields an empty list and the site shows only the rating summary.
 */
export const shapeTestimonials = (raw: RawTestimonial[] | null | undefined, limit = 6): TestimonialDTO[] =>
  (raw ?? [])
    .filter((t) => !!text(t.body) && !!text(t.reviewerDisplayName))
    .slice(0, limit)
    .map((t) => ({
      id: t._id,
      quote: t.body!.trim(),
      name: text(t.publicName) ?? shortName(t.reviewerDisplayName!),
      date: text(t.date),
      platform: text(t.platform),
      rating: opt(t.rating),
    }));
