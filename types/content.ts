import type { PortableTextProps } from "next-sanity";

import type { PropertyCategory, PropertyStatus } from "@/sanity/lib/enums";

/**
 * Data Transfer Objects — the only content shapes components may see.
 * Everything here has already passed the publication policy (verified status,
 * approvals, rights, suppression); unverified or private fields do not exist on
 * these types, so a component cannot render them by accident.
 */

export type PortableTextValue = PortableTextProps["value"];

export interface ImageDTO {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Tiny blurred preview (LQIP) for placeholder="blur". */
  blurDataURL?: string;
  caption?: string;
  credit?: string;
  /** CSS object-position derived from the editor's hotspot. */
  objectPosition?: string;
}

export interface SeoDTO {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: ImageDTO | null;
}

export interface LinkDTO {
  label: string;
  href: string;
  /** Menu links only: open the contact form in a dialog instead of navigating (JS-enhanced). */
  opensContactForm?: boolean;
}

export interface SiteSettingsDTO {
  siteName: string;
  siteTagline?: string;
  showRatingSummary: boolean;
  showOfficeAddress: boolean;
  inquiryTopics: string[];
  nav: LinkDTO[];
  footerNote?: string;
  legalLinks: LinkDTO[];
  complianceNotice?: string;
  listingDisclaimer?: string;
  /** Where the listing details and figures came from and how fresh they are (footer, every page). */
  dataNotice?: string;
  defaultSeo: SeoDTO | null;
  /** Date the research data was observed (drives "as of" notes). */
  observedOn?: string;
}

export interface PhoneDTO {
  /** "(224) 231-4552" */
  display: string;
  /** "tel:+12242314552" */
  href: string;
  /** "+12242314552" */
  e164: string;
}

export interface AddressDTO {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  oneLine: string;
}

export interface BrokerageDTO {
  name?: string;
  address?: AddressDTO;
  logo: ImageDTO | null;
  disclosure?: string;
  officialPage?: string;
  team?: string;
}

export interface RatingDTO {
  average: number;
  count: number;
  source: string;
  firstReviewDate?: string;
  lastReviewDate?: string;
}

export interface CredentialDTO {
  name: string;
  kind?: string;
  issuer?: string;
  year?: number;
}

export interface AgentDTO {
  fullName: string;
  displayName: string;
  title?: string;
  tagline?: string;
  introduction?: string;
  bio: PortableTextValue;
  headshot: ImageDTO | null;
  languages: string[];
  propertyTypes: string[];
  phone?: PhoneDTO;
  email?: string;
  links: LinkDTO[];
  license?: { number: string; state: string };
  yearsExperience?: number;
  rating?: RatingDTO;
  credentials: CredentialDTO[];
  brokerage?: BrokerageDTO;
}

export interface CtaDTO {
  label: string;
  href: string;
}

export interface HomeDTO {
  heroEyebrow?: string;
  heroLine1: string;
  heroLine2: string;
  heroAccent?: string;
  heroSubheading?: string;
  heroPrimaryCta?: CtaDTO;
  archWords: string[];
  archCaption?: string;
  show: Record<
    "expertise" | "about" | "areas" | "featuredHomes" | "market" | "recentlySold" | "howIWork" | "credibility",
    boolean
  >;
  expertiseHeading?: string;
  aboutStatement?: string;
  areasHeading?: string;
  areasIntro?: string;
  featuredHeading?: string;
  marketHeading?: string;
  soldHeading?: string;
  howHeading?: string;
  howIntro?: string;
  services: Array<{ title: string; body?: string }>;
  credibilityHeading?: string;
  ctaGiantWord?: string;
  ctaHeading?: string;
  ctaBody?: string;
  ctaPrimary?: CtaDTO;
  /** The photograph behind the closing windows (editor-chosen; the page falls back to an area photograph). */
  ctaImage?: ImageDTO;
  seo: SeoDTO | null;
}

export interface PropertiesPageDTO {
  heading: string;
  intro?: string;
  emptyMessage: string;
  seo: SeoDTO | null;
}

export interface ContactPageDTO {
  heading: string;
  intro?: string;
  formHeading: string;
  privacyNote?: string;
  seo: SeoDTO | null;
}

export interface SpecialtyDTO {
  id: string;
  name: string;
  slug: string;
  summary?: string;
}

export interface ServiceAreaDTO {
  id: string;
  name: string;
  slug: string;
  role?: string;
  summary?: string;
  closedSales5y?: number;
  /** 0–100 */
  sharePercent?: number;
  image: ImageDTO | null;
  isOffice: boolean;
}

export interface FactDTO {
  label: string;
  value: string;
}

export interface PropertyDTO {
  id: string;
  slug: string;
  href: string;
  title: string;
  status: PropertyStatus;
  statusLabel: string;
  /** For sale / for rent. Under-contract and sold homes are never "available". */
  available: boolean;
  category: PropertyCategory;
  typeLabel: string;
  /** "Lyons, IL" — or the full street address when the editor chose to publish it. */
  location: string;
  street?: string;
  priceLabel: string;
  priceCaption: string;
  priceChange?: string;
  dateLabel?: string;
  /** "Sold September 2026" etc, as ISO for <time>. */
  dateISO?: string;
  facts: FactDTO[];
  /** Secondary facts for the detail view (taxes, HOA, price per sq ft …). */
  moreFacts: FactDTO[];
  roleLabel?: string;
  featured: boolean;
  image: ImageDTO | null;
  summary?: string;
  listingUrl?: string;
  asOf?: string;
  updatedAt: string;
  /** Sort keys. */
  sortDate: string;
  sortPrice: number;
}

export interface PropertyDetailDTO extends PropertyDTO {
  gallery: ImageDTO[];
  seo: SeoDTO | null;
  city?: string;
  state?: string;
  /** Only present when addressPublic is on. */
  zip?: string;
}

export interface TestimonialDTO {
  id: string;
  quote: string;
  name: string;
  date?: string;
  platform?: string;
  rating?: number;
}

export interface MarketStatsDTO {
  closedSales?: number;
  totalValue?: number;
  average?: number;
  windowLabel: string;
  source: string;
  asOf?: string;
  lastYear?: { deals: number; sellerSide: number; buyerSide: number };
  fiveYear?: { sellerSide: number; buyerSide: number };
  bands: Array<{ label: string; count: number }>;
  bandsBasis?: string;
  showBands: boolean;
  /** Present only when the agent has confirmed publication of ranges. */
  ranges?: { seller?: string; buyer?: string };
}
