/** Shape of content_seed.json (the research dataset). */

export type SeedStatus = "verified" | "calculated" | "inferred" | "unavailable" | "needs_verification";

export interface Claim<T> {
  value: T | null;
  status: SeedStatus;
  source_ids?: string[];
  note?: string;
}

export interface SeedProperty {
  id: string;
  tier?: "full_detail" | "price_address_only" | "map_sample";
  listing_status?: "active" | "pending" | "for_rent" | "rent_unverified";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  neighborhood_label?: string | null;
  type?: string | null;
  sold_price?: number | null;
  sold_date?: string | null;
  price?: number | null;
  monthly_rent?: number | null;
  price_change_shown?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lot?: number | string | null;
  year_built?: number | null;
  days_on_market?: number | null;
  list_date?: string | null;
  price_vs_list_profile?: string | null;
  price_vs_list_page?: string | null;
  price_per_sqft?: number | null;
  hoa_monthly?: number | null;
  est_taxes_annual?: number | null;
  side?: "listing_agent" | "buyers_agent" | "both_sides" | null;
  listing_url?: string | null;
  photo_url?: string | null;
  status: SeedStatus;
  source_ids?: string[];
  notes?: string | null;
}

export interface SeedTestimonial {
  number: number;
  reviewer_display_name: string;
  date_displayed?: string;
  date_iso?: string | null;
  platform: string;
  rating: number | null;
  has_text: boolean;
  word_count: number;
  themes?: string;
  flags: string[];
  text_fingerprint_sha256_10: string;
  text: string | null;
  text_note?: string;
  source_url?: string;
  status: SeedStatus;
  approved_for_publication: boolean;
}

export interface SeedFile {
  meta: {
    subject: string;
    primary_source: string;
    observed_on: string;
    currency: string;
    status_values: string[];
    policy: string;
  };
  agent_profile: {
    full_name: Claim<string>;
    display_name: Claim<string>;
    title: Claim<string>;
    illinois_license: Claim<string>;
    phone_primary: Claim<string>;
    phone_secondary: Claim<string>;
    email: Claim<string>;
    website: Claim<string>;
    facebook: Claim<string>;
    languages: Claim<string[]>;
    years_experience: Claim<number>;
    property_types: Claim<string[]>;
    rating: Claim<{ average: number; count: number }>;
    education: Claim<string>;
    career_history: Claim<string>;
    awards: Claim<string[]>;
    designations: Claim<string[]>;
    other_experience_listed: Claim<string[]>;
  };
  brokerage_details: {
    name: Claim<string>;
    office_address: Claim<string>;
    logo_url: Claim<string>;
    official_page: Claim<string>;
    team: Claim<string>;
  };
  agent_experience: {
    years_experience: number;
    production_by_window: Array<{
      window: string;
      side: string;
      deals: number;
      value: number;
      average: number;
      range: string;
      status: SeedStatus;
    }>;
    headline_5y: {
      closed_sales: number;
      total_value: number;
      average: number;
      range_shown: string;
      range_status: SeedStatus;
    };
    bio_summary: string;
  };
  agent_specialties: Array<{
    name: string;
    evidence: string;
    basis: string;
    status: SeedStatus;
    safe_to_feature: boolean;
    evidence_reviews: number[];
    source_ids: string[];
  }>;
  service_areas: Array<{
    name: string;
    closed_sales_5yr?: number;
    share_of_100?: number;
    role?: string;
    status: SeedStatus;
    source_ids: string[];
  }>;
  sold_properties: SeedProperty[];
  active_listings: SeedProperty[];
  price_statistics: {
    published: Record<string, Record<string, number | string>>;
    headline: { closed_sales: number; total_value: string; average: string; range: string; range_status: string };
    consistency_checks: Array<{ check: string; result: string; detail: string }>;
    collected_sets: Array<{
      set: string;
      n: number;
      total: number;
      min: number;
      max: number;
      mean: number;
      median: number;
      status: SeedStatus;
    }>;
    bands: Array<{ band: string; count: number }>;
    limitations: string;
  };
  testimonials: SeedTestimonial[];
  professional_links: Array<{ label: string; url: string; status: SeedStatus; note?: string }>;
  media_assets: Array<{
    id: string;
    type: string;
    url: string;
    description: string;
    intended_use: string;
    reuse_flag: string;
  }>;
  source_references: Array<{
    id: string;
    url: string;
    supports: string;
    access_result: string;
    accessed: string;
  }>;
}

/** A Sanity document as produced by the mapper (bookkeeping is added by the planner). */
export interface SeedDocument {
  _id: string;
  _type: string;
  [field: string]: unknown;
}

export interface SeedEntry {
  id: string;
  type: string;
  doc: SeedDocument;
  /**
   * Fields derived from the dataset. These may be updated on a re-seed when the
   * dataset changes AND the editor has not touched them. Every other field
   * (editorial copy, uploaded images, toggles chosen in Studio) is written once,
   * at creation, and never again.
   */
  owned: string[];
  warnings: string[];
}
