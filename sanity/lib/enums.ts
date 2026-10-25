/**
 * Shared vocabularies. Pure TypeScript (no `sanity` import) so the Studio, the
 * Next.js app, and the seed script all read the SAME definitions.
 */

/** Status labels used by the research dataset (content brief, "Status labels"). */
export const VERIFICATION_OPTIONS = [
  { title: "Verified", value: "verified" },
  { title: "Calculated", value: "calculated" },
  { title: "Inferred", value: "inferred" },
  { title: "Unavailable", value: "unavailable" },
  { title: "Needs verification", value: "needs_verification" },
] as const;
export type VerificationStatus = (typeof VERIFICATION_OPTIONS)[number]["value"];

/**
 * PUBLICATION POLICY — the one place that decides whether a claim may be shown.
 * "Only display information publicly when its status and source support the
 * claim": verified facts and clearly-labelled calculations pass; inferred,
 * unavailable and needs-verification values never render.
 */
export const PUBLISHABLE_STATUSES: readonly VerificationStatus[] = ["verified", "calculated"];

export function isPublishable(status?: string | null): boolean {
  return !!status && (PUBLISHABLE_STATUSES as readonly string[]).includes(status);
}

export const PROPERTY_STATUS_OPTIONS = [
  { title: "For sale", value: "active" },
  { title: "Under contract (pending)", value: "pending" },
  { title: "Sold", value: "sold" },
  { title: "For rent", value: "for_rent" },
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number]["value"];

export const RECORD_TIER_OPTIONS = [
  { title: "Full detail (listing page checked)", value: "full_detail" },
  { title: "Price & address only", value: "price_address_only" },
  { title: "Map sample", value: "map_sample" },
] as const;
export type RecordTier = (typeof RECORD_TIER_OPTIONS)[number]["value"];

export const REPRESENTATION_OPTIONS = [
  { title: "Listing agent (seller side)", value: "listing_agent" },
  { title: "Buyer's agent (buyer side)", value: "buyers_agent" },
  { title: "Both sides", value: "both_sides" },
  { title: "Unknown", value: "unknown" },
] as const;

export const PROPERTY_CATEGORY_OPTIONS = [
  { title: "Condo", value: "condo" },
  { title: "Townhouse", value: "townhouse" },
  { title: "House", value: "house" },
  { title: "Multifamily", value: "multifamily" },
  { title: "Other", value: "other" },
] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORY_OPTIONS)[number]["value"];

/** Spec fields an editor may suppress when sources disagree about them. */
export const SUPPRESSIBLE_FIELDS = [
  { title: "Bedrooms", value: "beds" },
  { title: "Bathrooms", value: "baths" },
  { title: "Square feet", value: "sqft" },
  { title: "Year built", value: "yearBuilt" },
  { title: "Lot", value: "lot" },
  { title: "Days on market", value: "daysOnMarket" },
  { title: "Price vs list", value: "priceVsList" },
  { title: "HOA", value: "hoaMonthly" },
  { title: "Estimated taxes", value: "estTaxesAnnual" },
  { title: "Price per sq ft", value: "pricePerSqft" },
] as const;
export type SuppressibleField = (typeof SUPPRESSIBLE_FIELDS)[number]["value"];

export const RIGHTS_OPTIONS = [
  { title: "I own this image", value: "owned" },
  { title: "Licensed for this use", value: "licensed" },
  { title: "Written permission obtained", value: "permission" },
  { title: "Used at the site owner's direction — permission NOT confirmed", value: "owner_directed" },
  { title: "Pending — confirming rights", value: "pending" },
  { title: "NOT cleared — do not publish", value: "not_cleared" },
] as const;
export type RightsStatus = (typeof RIGHTS_OPTIONS)[number]["value"];
/** Image rights that allow an uploaded image to be shown publicly. */
/**
 * "owner_directed" is shown on the site but is NOT a clearance: the owner chose to use a picture
 * (e.g. saved from the agent's public profile) and no licence has been confirmed. It exists so
 * that state is explicit and searchable instead of being mislabelled "permission".
 */
export const IMAGE_PUBLISHABLE_RIGHTS: readonly RightsStatus[] = ["owned", "licensed", "permission", "owner_directed"];

export const CREDENTIAL_KIND_OPTIONS = [
  { title: "Designation", value: "designation" },
  { title: "Award", value: "award" },
  { title: "Association", value: "association" },
  { title: "License", value: "license" },
] as const;

export const REVIEW_PLATFORM_OPTIONS = [
  { title: "Google Review", value: "Google Review" },
  { title: "Homes.com Review", value: "Homes.com Review" },
  { title: "Other", value: "Other" },
] as const;

export const WINDOW_OPTIONS = [
  { title: "Last 12 months", value: "1y" },
  { title: "Last 2 years", value: "2y" },
  { title: "Last 5 years", value: "5y" },
] as const;

export const SIDE_OPTIONS = [
  { title: "Seller side", value: "seller" },
  { title: "Buyer side", value: "buyer" },
] as const;

export const INQUIRY_TOPICS_DEFAULT = [
  "Buying a home",
  "Selling a home",
  "Investment property",
  "Renting or leasing",
  "Something else",
] as const;

/**
 * The menu used until the Site settings document provides one: only routes that always
 * exist (no #anchors, which depend on which home sections are shown).
 */
export const NAV_DEFAULT: ReadonlyArray<{ label: string; href: string; opensContactForm?: boolean }> = [
  { label: "Select an apartment", href: "/properties" },
  { label: "Book a call", href: "/contact", opensContactForm: true },
  { label: "Contact", href: "/contact" },
];

/** Document types that exist exactly once. */
export const SINGLETON_TYPES = [
  "agentProfile",
  "brokerage",
  "homePage",
  "propertiesPage",
  "contactPage",
  "siteSettings",
  "marketStatistics",
] as const;
