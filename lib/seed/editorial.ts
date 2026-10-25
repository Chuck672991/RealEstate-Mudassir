/**
 * STARTER COPY
 * ─────────────────────────────────────────────────────────────────────────────
 * The research dataset contains facts, not marketing copy. These strings are
 * drafted from — and only from — facts in the content brief:
 *
 *   §10.1 homepage introduction   §10.2 about   §10.3 experience & specialties
 *   §10.6 service areas           §10.8 market expertise   §3.3 service offerings
 *
 * Every draft is marked "Needs agent approval" in the brief, so the seed writes
 * it ONCE (at creation) and the Home page document carries a
 * `copyApprovedByAgent` flag that starts false. Editors own this copy from then
 * on; a re-seed never overwrites it.
 *
 * Deliberately NOT included (no support in the dataset): luxury positioning,
 * years in finance/banking, prior employers, Midwest expansion, designations,
 * awards, outcome promises, "northwest and western suburbs" (an inferred phrase
 * — we say "Chicagoland", which the profile states).
 */

export const AGENT_COPY = {
  /** Brief §2.1: bio says "broker", FAQ says "agent / REALTOR®". Flagged for confirmation. */
  professionalTitle: {
    value: "Real estate broker",
    note: "Provisional. The source bio says “broker”; the FAQ says “agent” and “REALTOR®”. Confirm the exact licence class with the agent.",
  },
  tagline: "A strategic, hands-on approach to buying, selling and investing across Chicagoland.",
  introduction:
    "Buying, selling or investing in the Chicago suburbs? Mudassir pairs a finance and banking background with 18 years of real estate experience to guide buyers, sellers and investors from first conversation to closing. He works in English, Arabic, Hindi, Punjabi, Turkish and Urdu. Licensed in Illinois with HomeSmart Connect LLC.",
  bio: [
    "Mudassir Siddiqui is a Chicagoland real estate broker known for a strategic approach, careful negotiation and hands-on service. His background in finance and banking shapes how he looks at pricing, market conditions and buyer behavior, so clients can make decisions with clear numbers behind them.",
    "Whether the goal is a first home, a sale, or an investment property, he builds a plan around the client’s goals and stays involved from start to finish. He is based at HomeSmart Connect LLC in Arlington Heights and serves buyers and sellers across Chicagoland.",
  ],
};

/** Keyed by the specialty `name` in content_seed.json. */
export const SPECIALTY_COPY: Record<string, { summary: string; order: number }> = {
  "First-time homebuyers": {
    summary: "Step-by-step guidance from pre-approval coordination to closing.",
    order: 10,
  },
  "Negotiation and pricing strategy": {
    summary: "Pricing strategy, preparation and negotiation, informed by a finance and banking background.",
    order: 20,
  },
  "Investors / investment properties": {
    summary:
      "Single-family, condo, townhome and multifamily acquisitions, including tenant-occupied properties.",
    order: 30,
  },
  "Rentals and leasing": {
    summary: "Support with renting and leasing, alongside buying and selling.",
    order: 40,
  },
  "Multilingual service": {
    summary: "Service in English, Arabic, Hindi, Punjabi, Turkish and Urdu.",
    order: 50,
  },
  "Local neighborhood knowledge": {
    summary: "Closed sales across Hanover Park, Streamwood, Schaumburg, Bartlett and nearby communities.",
    order: 60,
  },
  "Residential buying and selling": {
    summary: "Representation for buyers and sellers, from the first conversation through closing.",
    order: 70,
  },
  "Condos, townhomes, detached homes, multifamily": {
    summary: "Hands-on experience across condos, townhomes, detached houses and multifamily properties.",
    order: 80,
  },
};

export const HOME_COPY = {
  heroEyebrow: "Real estate broker · Chicagoland",
  heroLine1: "Mudassir",
  heroLine2: "Siddiqui",
  heroAccent: "Chicagoland",
  heroSubheading:
    "Buying, selling or investing in the Chicago suburbs — with a finance and banking background, 18 years of experience and service in six languages.",
  heroPrimaryCta: { label: "View current homes", href: "/#homes" },
  archWords: ["First homes", "Selling", "Investing"],
  archCaption: "Buyers, sellers and investors across Chicagoland",
  expertiseHeading: "What Mudassir helps with",
  aboutStatement:
    "A strategic approach, careful negotiation and hands-on service — with clear numbers behind every decision.",
  areasHeading: "Where Mudassir works",
  areasIntro:
    "Closed sales across six Chicagoland communities and the wider area. Sale counts cover the last five years and come from the Homes.com agent profile.",
  featuredHeading: "Current listings",
  marketHeading: "Experience across price points",
  soldHeading: "Recently sold",
  howHeading: "How Mudassir works",
  howIntro: "Hands-on from the first conversation to closing, with a plan built around your goals.",
  services: [
    { title: "Buyers", body: "Search, offer strategy and negotiation." },
    { title: "Sellers", body: "Pricing strategy, preparation and negotiation." },
    {
      title: "Investors",
      body: "Single-family, condo, townhome and multifamily acquisitions, including tenant-occupied properties.",
    },
    { title: "Rentals and leasing", body: "Support with renting and leasing." },
    { title: "In your language", body: "Service in English, Arabic, Hindi, Punjabi, Turkish and Urdu." },
  ],
  credibilityHeading: "Reviews & credentials",
  ctaGiantWord: "Let’s talk",
  ctaHeading: "Buying, selling or investing?",
  ctaBody: "Call, or send a short note about what you’re planning.",
  ctaPrimary: { label: "Send a message", href: "/contact" },
};

export const PROPERTIES_PAGE_COPY = {
  heading: "Homes",
  intro:
    "Current listings, homes under contract and verified recent sales from Mudassir’s Homes.com profile — each with its date, so you can see how current it is.",
  emptyMessage: "There are no homes to show here right now. Call or send a message to hear what is coming up.",
  seoTitle: "Homes for sale and recent sales in Chicagoland",
  seoDescription:
    "Current listings, homes under contract and verified recent sales from Chicagoland real estate broker Mudassir Siddiqui.",
};

export const CONTACT_PAGE_COPY = {
  heading: "Let’s talk",
  intro:
    "Buying, selling or investing in Chicagoland? Call, or send a few details about what you’re planning.",
  formHeading: "Send a message",
  privacyNote: "Your details are used only to reply to this message.",
  seoTitle: "Contact",
  seoDescription:
    "Call or message Chicagoland real estate broker Mudassir Siddiqui about buying, selling or investing.",
};

export const SITE_COPY = {
  siteName: "Mudassir Siddiqui",
  siteTagline: "Real estate across Chicagoland",
  // The header shows the FIRST link large (two lines) and the rest small; "Book a call" opens the contact form.
  nav: [
    { label: "Select an apartment", href: "/properties" },
    { label: "Book a call", href: "/contact", opensContactForm: true },
    { label: "Contact", href: "/contact" },
  ],
  /**
   * Where the research data came from. Written once at seed time (dated), then owned by the
   * editor: when a broker-approved feed replaces the research data, they rewrite it.
   */
  dataNotice: (observedOn: string | null) =>
    `Listing details and sales figures were collected from Mudassir Siddiqui’s public Homes.com profile${
      observedOn ? ` on ${observedOn}` : ""
    } and may have changed since — please confirm availability and details before relying on them. This website is independent of Homes.com.`,
  seoTitle: "Mudassir Siddiqui — Chicagoland Real Estate Broker",
  seoDescription:
    "Chicagoland real estate broker Mudassir Siddiqui helps buyers, sellers and investors across the Chicago suburbs. HomeSmart Connect LLC, Arlington Heights, IL.",
};
