import type { PropertyCategory, PropertyStatus, SuppressibleField } from "@/sanity/lib/enums";
import type { SeedProperty } from "./types";

/**
 * The dataset marks missing values as `null`, but a few record-level strings are
 * placeholders written for human readers, e.g. "(address not displayed)" or
 * "(not shown; 'Last sale price' format)". They must never reach the CMS as if
 * they were data.
 */
const PLACEHOLDER = /^\(.*\)$/;

export function clean(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER.test(trimmed)) return undefined;
  return trimmed;
}

/** Remove null / undefined / empty-string / empty-array members, deeply. */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => compact(v)).filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const c = compact(v);
      if (c === undefined || c === null || c === "") continue;
      out[k] = c;
    }
    return out as T;
  }
  return value;
}

export function categoryOf(type?: string | null): PropertyCategory | undefined {
  const t = clean(type)?.toLowerCase();
  if (!t) return undefined;
  if (t.includes("condo")) return "condo";
  if (t.includes("townhouse") || t.includes("townhome")) return "townhouse";
  if (t.includes("multifamily") || t.includes("multi-family")) return "multifamily";
  if (t.includes("house") || t.includes("single family")) return "house";
  return "other";
}

const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  condo: "Condo",
  townhouse: "Townhouse",
  house: "House",
  multifamily: "Multifamily home",
  other: "Home",
};

/** “Condo in Lyons”. Never contains a street address. */
export function titleFor(p: SeedProperty): string {
  const label = CATEGORY_LABEL[categoryOf(p.type) ?? "other"];
  const city = clean(p.city);
  if (p.listing_status === "for_rent" || p.listing_status === "rent_unverified") {
    return city ? `Rental in ${city}` : "Rental";
  }
  return city ? `${label} in ${city}` : label;
}

export function statusOf(p: SeedProperty, kind: "sold" | "listing"): PropertyStatus {
  if (kind === "sold") return "sold";
  switch (p.listing_status) {
    case "active":
      return "active";
    case "pending":
      return "pending";
    default:
      return "for_rent"; // for_rent + rent_unverified
  }
}

/** 9583 → "9,583 sq ft"; strings (e.g. "0.59 acre") pass through. */
export function lotText(lot: number | string | null | undefined): string | undefined {
  if (lot == null) return undefined;
  if (typeof lot === "number") return `${new Intl.NumberFormat("en-US").format(lot)} sq ft`;
  return clean(lot);
}

/**
 * Facts the research flagged as internally inconsistent. They stay in the CMS (so
 * they can be reviewed) but are hidden on the site until an editor resolves them.
 * Each entry cites the "DISCREPANCY" note in content_seed.json it comes from.
 */
export const SUPPRESSED_BY_RECORD: Record<string, SuppressibleField[]> = {
  // header shows 6 bd / 5 ba, listing text describes a "4BR" home
  "SOLD-003": ["beds", "baths"],
  // 4 beds in 820 sq ft "may be a source-data error"; price vs list 15% (card) vs 4% (page)
  "SOLD-006": ["beds", "sqft", "priceVsList"],
  // header shows 3 beds, listing text describes 2 bedrooms plus an office
  "LIST-006": ["beds"],
};

/** Neighborhood labels that are also service areas (they take precedence over the city). */
export const NEIGHBORHOOD_AREAS = ["South Tri Village", "South Schaumburg"];
