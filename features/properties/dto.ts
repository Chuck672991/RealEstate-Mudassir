import { text } from "@/features/content/policy";
import { toImage, type RawImage } from "@/lib/sanity/image";
import { formatBaths, formatInt, formatMonthYear, formatUsd } from "@/lib/utils/format";
import {
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  type PropertyCategory,
  type PropertyStatus,
  type SuppressibleField,
} from "@/sanity/lib/enums";
import type { FactDTO, PropertyDTO, PropertyDetailDTO, SeoDTO } from "@/types/content";

/** Fields projected by PROPERTY_FIELDS in lib/sanity/queries.ts. */
export interface RawProperty {
  _id: string;
  _updatedAt: string;
  slug?: string | null;
  title?: string | null;
  status?: PropertyStatus | null;
  propertyCategory?: PropertyCategory | null;
  propertyType?: string | null;
  street?: string | null;
  addressPublic?: boolean | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  neighborhoodLabel?: string | null;
  listPrice?: number | null;
  soldPrice?: number | null;
  monthlyRent?: number | null;
  priceChange?: string | null;
  listDate?: string | null;
  soldDate?: string | null;
  asOf?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lot?: string | null;
  yearBuilt?: number | null;
  daysOnMarket?: number | null;
  priceVsList?: string | null;
  hoaMonthly?: number | null;
  estTaxesAnnual?: number | null;
  pricePerSqft?: number | null;
  suppressedFields?: string[] | null;
  featured?: boolean | null;
  summary?: string | null;
  listingUrl?: string | null;
  showListingLink?: boolean | null;
  representation?: string | null;
  heroImage?: RawImage | null;
  gallery?: RawImage[] | null;
  seo?: unknown | null;
}

const STATUS_LABEL = Object.fromEntries(PROPERTY_STATUS_OPTIONS.map((o) => [o.value, o.value === "pending" ? "Under contract" : o.title])) as Record<
  PropertyStatus,
  string
>;
const CATEGORY_LABEL = Object.fromEntries(PROPERTY_CATEGORY_OPTIONS.map((o) => [o.value, o.title])) as Record<PropertyCategory, string>;

const ROLE_LABEL: Record<string, string> = {
  listing_agent: "Mudassir represented the seller",
  buyers_agent: "Mudassir represented the buyer",
  both_sides: "Mudassir represented both sides",
};

const STATUS_RANK: Record<PropertyStatus, number> = { active: 0, pending: 1, for_rent: 2, sold: 3 };

/** Order for lists: for sale → under contract → rentals → sold; newest first inside each. */
export function comparePropertyOrder(a: PropertyDTO, b: PropertyDTO): number {
  return STATUS_RANK[a.status] - STATUS_RANK[b.status] || b.sortDate.localeCompare(a.sortDate) || a.id.localeCompare(b.id);
}

export function toPropertyDTO(raw: RawProperty): PropertyDTO | null {
  if (!raw.slug || !raw.status) return null;
  const status = raw.status;
  const category = raw.propertyCategory ?? "other";
  const hidden = new Set<string>(raw.suppressedFields ?? []);
  const showStreet = !!raw.addressPublic && !!text(raw.street);

  const cityState = [text(raw.city), text(raw.state)].filter(Boolean).join(", ");
  const location = showStreet
    ? [text(raw.street), [text(raw.city), [text(raw.state), text(raw.zip)].filter(Boolean).join(" ")].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(", ")
    : cityState || "Chicagoland";

  // ── price ────────────────────────────────────────────────────────────────
  let price: number | undefined;
  let priceLabel = "Price on request";
  let priceCaption = "";
  if (status === "sold" && raw.soldPrice != null) {
    price = raw.soldPrice;
    priceLabel = formatUsd(raw.soldPrice);
    priceCaption = "Sold price";
  } else if ((status === "active" || status === "pending") && raw.listPrice != null) {
    price = raw.listPrice;
    priceLabel = formatUsd(raw.listPrice);
    priceCaption = "List price";
  } else if (status === "for_rent" && raw.monthlyRent != null) {
    price = raw.monthlyRent;
    priceLabel = `${formatUsd(raw.monthlyRent)} / mo`;
    priceCaption = "Monthly rent";
  }

  // ── date ─────────────────────────────────────────────────────────────────
  let dateLabel: string | undefined;
  let dateISO: string | undefined;
  if (status === "sold" && raw.soldDate) {
    dateLabel = `Sold ${formatMonthYear(raw.soldDate, true)}`;
    dateISO = raw.soldDate;
  } else if ((status === "active" || status === "pending") && raw.listDate) {
    dateLabel = `Listed ${formatMonthYear(raw.listDate, true)}`;
    dateISO = raw.listDate;
  }

  // ── facts (respecting what an editor has suppressed) ─────────────────────
  const facts: FactDTO[] = [];
  const addFact = (field: SuppressibleField, label: string, value: string | null | undefined, into = facts) => {
    if (hidden.has(field) || !value) return;
    into.push({ label, value });
  };
  addFact("beds", "Beds", raw.beds != null ? formatInt(raw.beds) : null);
  addFact("baths", "Baths", formatBaths(raw.baths));
  addFact("sqft", "Sq ft", raw.sqft != null ? formatInt(raw.sqft) : null);

  const moreFacts: FactDTO[] = [];
  addFact("yearBuilt", "Year built", raw.yearBuilt != null ? String(raw.yearBuilt) : null, moreFacts);
  addFact("lot", "Lot", text(raw.lot), moreFacts);
  if (status === "sold") {
    addFact("daysOnMarket", "Days on market", raw.daysOnMarket != null ? formatInt(raw.daysOnMarket) : null, moreFacts);
    addFact("priceVsList", "Sold vs list price", text(raw.priceVsList), moreFacts);
  }
  addFact("hoaMonthly", "HOA / month", raw.hoaMonthly != null ? formatUsd(raw.hoaMonthly) : null, moreFacts);
  addFact("estTaxesAnnual", "Est. taxes / year", raw.estTaxesAnnual != null ? formatUsd(raw.estTaxesAnnual) : null, moreFacts);
  addFact("pricePerSqft", "Price per sq ft", raw.pricePerSqft != null ? formatUsd(raw.pricePerSqft) : null, moreFacts);

  const title = text(raw.title) ?? `${CATEGORY_LABEL[category]} in ${text(raw.city) ?? "Chicagoland"}`;

  return {
    id: raw._id,
    slug: raw.slug,
    href: `/properties/${raw.slug}`,
    title,
    status,
    statusLabel: STATUS_LABEL[status],
    available: status === "active" || status === "for_rent",
    category,
    typeLabel: text(raw.propertyType) ?? CATEGORY_LABEL[category],
    location,
    street: showStreet ? text(raw.street) : undefined,
    priceLabel,
    priceCaption,
    priceChange: status === "active" || status === "pending" ? text(raw.priceChange)?.replace(/\s*\(as displayed\)$/i, "") : undefined,
    dateLabel,
    dateISO,
    facts,
    moreFacts,
    roleLabel: status === "sold" && raw.representation ? ROLE_LABEL[raw.representation] : undefined,
    featured: !!raw.featured,
    // Editors write real alt text; this is the safety net. The city is already in the title.
    image: toImage(raw.heroImage, showStreet ? `${title}, ${text(raw.street)}` : title),
    summary: text(raw.summary),
    listingUrl: raw.showListingLink ? text(raw.listingUrl) : undefined,
    asOf: status === "active" || status === "pending" || status === "for_rent" ? text(raw.asOf) : undefined,
    updatedAt: raw._updatedAt,
    sortDate: (status === "sold" ? raw.soldDate : raw.listDate) ?? raw._updatedAt,
    sortPrice: price ?? 0,
  };
}

export function toPropertyDetailDTO(raw: RawProperty, seo: SeoDTO | null): PropertyDetailDTO | null {
  const base = toPropertyDTO(raw);
  if (!base) return null;
  return {
    ...base,
    gallery: (raw.gallery ?? [])
      .map((g, i) => toImage(g, `${base.title} — photo ${i + 2}`))
      .filter((g): g is NonNullable<typeof g> => !!g),
    seo,
    city: text(raw.city),
    state: text(raw.state),
    zip: raw.addressPublic ? text(raw.zip) : undefined,
  };
}
