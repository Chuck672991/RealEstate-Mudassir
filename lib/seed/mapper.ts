import { isPublishable, type RightsStatus } from "@/sanity/lib/enums";
import { formatLongDate, slugify } from "@/lib/utils/format";

import { AGENT_COPY, CONTACT_PAGE_COPY, HOME_COPY, PROPERTIES_PAGE_COPY, SITE_COPY, SPECIALTY_COPY } from "./editorial";
import { ids } from "./ids";
import {
  NEIGHBORHOOD_AREAS,
  SUPPRESSED_BY_RECORD,
  categoryOf,
  clean,
  compact,
  lotText,
  statusOf,
  titleFor,
} from "./normalize";
import type { Claim, SeedDocument, SeedEntry, SeedFile, SeedProperty, SeedTestimonial } from "./types";

/**
 * content_seed.json → Sanity documents.
 *
 * Pure and deterministic: the same input always yields the same documents (same
 * IDs, same keys, same field values). That is what makes the seed idempotent and
 * lets the site render the identical content offline ("local content" mode).
 *
 * Ownership rule: every field derived from the dataset is listed in `owned`.
 * Everything else — editorial copy, uploaded images, show/hide switches — is
 * written once at creation and then belongs to the editor. See scripts/seed/plan.ts.
 */

export interface MapResult {
  entries: SeedEntry[];
  /** Notes about data that was normalised or deliberately withheld. */
  warnings: string[];
}

const ref = (id: string, key?: string) => ({ _type: "reference" as const, _ref: id, ...(key ? { _key: key } : {}) });

const sourceRefs = (sourceIds?: string[]) =>
  [...new Set(sourceIds ?? [])].sort().map((s) => ref(ids.source(s), `src-${s.toLowerCase()}`));

/** Claim → `verifiedText` object. */
function vt<T extends string | number>(claim: Claim<T> | undefined, type: "verifiedText" | "verifiedNumber" = "verifiedText") {
  if (!claim) return undefined;
  return {
    _type: type,
    value: claim.value ?? undefined,
    status: claim.status,
    note: claim.note,
  };
}

function unionSources(...claims: Array<Claim<unknown> | undefined>): string[] {
  return claims.flatMap((c) => c?.source_ids ?? []);
}

function imageMeta(opts: {
  sourceUrl?: string | null;
  intendedUse: string;
  manifestId: string;
  rights: RightsStatus;
  notes?: string;
}) {
  return {
    _type: "imageWithMeta" as const,
    rightsStatus: opts.rights,
    rightsNotes: opts.notes,
    sourceUrl: clean(opts.sourceUrl ?? undefined),
    intendedUse: opts.intendedUse,
    manifestId: opts.manifestId,
  };
}

/** Portable Text paragraphs with deterministic keys. */
function blocks(paragraphs: string[], prefix: string) {
  return paragraphs.map((text, i) => ({
    _type: "block" as const,
    _key: `${prefix}-p${i}`,
    style: "normal" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${prefix}-p${i}-s0`, text, marks: [] }],
  }));
}

const rightsFromFlag = (flag: string): RightsStatus => (/replace|unknown/i.test(flag) ? "not_cleared" : "pending");

export function buildSeedEntries(seed: SeedFile): MapResult {
  const entries: SeedEntry[] = [];
  const warnings: string[] = [];
  const add = (type: string, id: string, doc: Record<string, unknown>, owned: string[], notes: string[] = []) => {
    entries.push({
      id,
      type,
      doc: compact({ _id: id, _type: type, ...doc }) as SeedDocument,
      owned,
      warnings: notes,
    });
  };

  const observedOn = seed.meta.observed_on;
  const profile = seed.agent_profile;
  const broker = seed.brokerage_details;

  // ── Sources ────────────────────────────────────────────────────────────────
  for (const s of seed.source_references) {
    add(
      "source",
      ids.source(s.id),
      { sourceId: s.id, url: s.url, supports: s.supports, accessResult: s.access_result, accessed: s.accessed },
      ["sourceId", "url", "supports", "accessResult", "accessed"],
    );
  }

  // ── Media assets → metadata on the slot each image is meant for ──────────────
  const media = new Map(seed.media_assets.map((m) => [m.id, m]));
  const portrait = media.get("MEDIA-001");
  const logo = media.get("MEDIA-002");
  const areaImages = new Map(
    seed.media_assets
      .filter((m) => m.type === "neighborhood")
      .map((m) => [m.description.replace(/\s+area photo$/i, "").trim(), m] as const),
  );

  // ── Brokerage ──────────────────────────────────────────────────────────────
  const addr = parseAddress(broker.office_address.value);
  if (!addr) warnings.push(`Brokerage office address could not be parsed: "${broker.office_address.value}"`);
  add(
    "brokerage",
    ids.brokerage,
    {
      name: vt(broker.name),
      officeAddress: addr ? { _type: "postalAddress", ...addr, status: broker.office_address.status } : undefined,
      logo: logo
        ? imageMeta({
            sourceUrl: logo.url,
            intendedUse: logo.intended_use,
            manifestId: logo.id,
            rights: rightsFromFlag(logo.reuse_flag),
            notes: logo.reuse_flag,
          })
        : undefined,
      officialPage: vt(broker.official_page),
      team: vt(broker.team),
      sources: sourceRefs(unionSources(broker.name, broker.office_address, broker.official_page, broker.team)),
      verification: "verified",
    },
    ["name", "officeAddress", "officialPage", "team", "sources", "verification"],
  );

  // ── Agent profile ──────────────────────────────────────────────────────────
  const rating = profile.rating.value;
  const reviewDates = seed.testimonials.map((t) => t.date_iso).filter((d): d is string => !!d).sort();
  add(
    "agentProfile",
    ids.agentProfile,
    {
      fullName: profile.full_name.value ?? undefined,
      displayName: profile.display_name.value ?? undefined,
      professionalTitle: {
        _type: "verifiedText",
        // The dataset leaves the title null/needs_verification; the provisional wording comes
        // from the brief (§10.1) and stays flagged until the agent confirms it.
        value: profile.title.value ?? AGENT_COPY.professionalTitle.value,
        status: profile.title.status,
        note: [profile.title.note, AGENT_COPY.professionalTitle.note].filter(Boolean).join(" — "),
      },
      tagline: AGENT_COPY.tagline,
      introduction: AGENT_COPY.introduction,
      bio: blocks(AGENT_COPY.bio, "bio"),
      headshot: portrait
        ? imageMeta({
            sourceUrl: portrait.url,
            intendedUse: portrait.intended_use,
            manifestId: portrait.id,
            rights: rightsFromFlag(portrait.reuse_flag),
            notes: portrait.reuse_flag,
          })
        : undefined,
      languages: profile.languages.value ?? [],
      propertyTypes: profile.property_types.value ?? [],
      listedExperience: profile.other_experience_listed.value ?? [],
      phonePrimary: vt(profile.phone_primary),
      phoneSecondary: vt(profile.phone_secondary),
      email: vt(profile.email),
      website: vt(profile.website),
      facebook: vt(profile.facebook),
      links: seed.professional_links.map((l, i) => ({
        _type: "profileLink",
        _key: `link-${i}`,
        label: l.label,
        url: l.url,
        status: l.status,
        note: l.note,
      })),
      brokerage: ref(ids.brokerage),
      licenseNumber: vt(profile.illinois_license),
      licenseState: "IL",
      yearsExperience: vt(profile.years_experience, "verifiedNumber"),
      rating: rating
        ? {
            _type: "ratingSummary",
            average: rating.average,
            count: rating.count,
            source: "Google and Homes.com reviews, as shown on the Homes.com agent profile",
            firstReviewDate: reviewDates[0],
            lastReviewDate: reviewDates[reviewDates.length - 1],
            status: profile.rating.status,
            note: "Platform-generated average. Every review is dated July 2021 – July 2022; several integrity flags are open (see Testimonials).",
          }
        : undefined,
      credentials: [
        ...(profile.designations.value ?? []).map((name, i) => ({
          _type: "credential",
          _key: `des-${i}`,
          name,
          kind: name === "NAR" ? "association" : "designation",
          status: profile.designations.status,
          note: "Listed on the source profile with no issuer or year. Needs proof before it can be shown.",
        })),
        ...(profile.awards.value ?? []).map((name, i) => ({
          _type: "credential",
          _key: `awd-${i}`,
          name,
          kind: "award",
          status: profile.awards.status,
          note: "Listed on the source profile with no issuer or year. Needs proof before it can be shown.",
        })),
      ],
      education: vt(profile.education),
      careerHistory: vt(profile.career_history),
      sources: sourceRefs(
        unionSources(
          profile.full_name,
          profile.phone_primary,
          profile.languages,
          profile.years_experience,
          profile.rating,
          profile.awards,
          profile.designations,
        ),
      ),
      verification: "verified",
    },
    [
      "fullName",
      "displayName",
      "professionalTitle",
      "languages",
      "propertyTypes",
      "listedExperience",
      "phonePrimary",
      "phoneSecondary",
      "email",
      "website",
      "facebook",
      "links",
      "brokerage",
      "licenseNumber",
      "licenseState",
      "yearsExperience",
      "rating",
      "credentials",
      "education",
      "careerHistory",
      "sources",
      "verification",
    ],
  );

  // ── Specialties ────────────────────────────────────────────────────────────
  seed.agent_specialties.forEach((s, index) => {
    const copy = SPECIALTY_COPY[s.name];
    add(
      "specialty",
      ids.specialty(s.name),
      {
        name: s.name,
        slug: { _type: "slug", current: slugify(s.name) },
        summary: copy?.summary,
        safeToFeature: s.safe_to_feature,
        order: copy?.order ?? 100 + index,
        evidence: s.evidence,
        basis: s.basis,
        evidenceReviews: s.evidence_reviews,
        verification: s.status,
        sources: sourceRefs(s.source_ids),
      },
      ["name", "evidence", "basis", "evidenceReviews", "verification", "sources"],
    );
    if (s.safe_to_feature && !copy) warnings.push(`Specialty "${s.name}" is safe to feature but has no starter summary.`);
  });

  // ── Service areas ──────────────────────────────────────────────────────────
  seed.service_areas.forEach((a, index) => {
    const image = areaImages.get(a.name);
    add(
      "serviceArea",
      ids.serviceArea(a.name),
      {
        name: a.name,
        slug: { _type: "slug", current: slugify(a.name) },
        role: a.role,
        closedSales5y: a.closed_sales_5yr,
        shareOf100: a.share_of_100,
        image: image
          ? imageMeta({
              sourceUrl: image.url,
              intendedUse: image.intended_use,
              manifestId: image.id,
              rights: rightsFromFlag(image.reuse_flag),
              notes: image.reuse_flag,
            })
          : undefined,
        // "Chicagoland" is broad stated coverage with an unverified expansion claim: not an area tile.
        showOnSite: isPublishable(a.status),
        order: (index + 1) * 10,
        verification: a.status,
        sources: sourceRefs(a.source_ids),
      },
      ["name", "role", "closedSales5y", "shareOf100", "verification", "sources"],
    );
  });
  const areaIdByName = new Map(seed.service_areas.map((a) => [a.name.toLowerCase(), ids.serviceArea(a.name)]));

  // ── Properties ─────────────────────────────────────────────────────────────
  const propertyOwned = [
    "title",
    "status",
    "recordId",
    "street",
    "city",
    "state",
    "zip",
    "neighborhoodLabel",
    "serviceArea",
    "propertyType",
    "propertyCategory",
    "listPrice",
    "soldPrice",
    "monthlyRent",
    "priceChange",
    "listDate",
    "soldDate",
    "asOf",
    "beds",
    "baths",
    "sqft",
    "lot",
    "yearBuilt",
    "daysOnMarket",
    "priceVsList",
    "hoaMonthly",
    "estTaxesAnnual",
    "pricePerSqft",
    "listingUrl",
    "recordTier",
    "representation",
    "agent",
    "verification",
    "sources",
    "internalNotes",
  ];

  const FEATURED_SOLD = new Set(["SOLD-001", "SOLD-002", "SOLD-003", "SOLD-004", "SOLD-005", "SOLD-006"]); // brief §10.4
  const mapProperty = (p: SeedProperty, kind: "sold" | "listing") => {
    const status = statusOf(p, kind);
    const city = clean(p.city);
    const street = clean(p.address);
    const placeholders = (["address", "city"] as const).filter((k) => p[k] && !clean(p[k]));
    const notes: string[] = [];
    if (placeholders.length) {
      notes.push(`${p.id}: placeholder text in ${placeholders.join(" + ")} ("${p.address}", "${p.city}") was dropped — no value invented.`);
    }
    const pageVsList = clean(p.price_vs_list_page ?? undefined);
    const profileVsList = clean(p.price_vs_list_profile ?? undefined);
    const internal = [
      p.notes,
      pageVsList && profileVsList && pageVsList !== profileVsList
        ? `Price vs list differs between sources: profile card "${profileVsList}", listing page "${pageVsList}".`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const neighborhood = clean(p.neighborhood_label);
    const areaId =
      (neighborhood && NEIGHBORHOOD_AREAS.includes(neighborhood) ? areaIdByName.get(neighborhood.toLowerCase()) : undefined) ??
      (city ? areaIdByName.get(city.toLowerCase()) : undefined);

    const title = titleFor(p);
    const isListing = kind === "listing";
    const activeOrPending = status === "active" || status === "pending";

    add(
      "property",
      ids.property(p.id),
      {
        title,
        slug: { _type: "slug", current: `${slugify(title)}-${p.id.toLowerCase()}` },
        recordId: p.id,
        status,
        street,
        addressPublic: false,
        city,
        state: clean(p.state),
        zip: clean(p.zip),
        neighborhoodLabel: neighborhood,
        serviceArea: areaId ? ref(areaId) : undefined,
        propertyType: clean(p.type),
        propertyCategory: categoryOf(p.type),
        listPrice: activeOrPending ? (p.price ?? undefined) : undefined,
        soldPrice: kind === "sold" ? (p.sold_price ?? undefined) : undefined,
        monthlyRent: p.monthly_rent ?? undefined,
        priceChange: clean(p.price_change_shown),
        listDate: p.list_date ?? undefined,
        soldDate: p.sold_date ?? undefined,
        asOf: isListing ? observedOn : undefined,
        beds: p.beds ?? undefined,
        baths: p.baths ?? undefined,
        sqft: p.sqft ?? undefined,
        lot: lotText(p.lot),
        yearBuilt: p.year_built ?? undefined,
        daysOnMarket: p.days_on_market ?? undefined,
        priceVsList: profileVsList,
        hoaMonthly: p.hoa_monthly ?? undefined,
        estTaxesAnnual: p.est_taxes_annual ?? undefined,
        pricePerSqft: p.price_per_sqft ?? undefined,
        suppressedFields: SUPPRESSED_BY_RECORD[p.id],
        heroImage: p.photo_url
          ? imageMeta({
              sourceUrl: p.photo_url,
              intendedUse: `Main photo — ${p.id}`,
              manifestId: `PHOTO-${p.id}`,
              rights: "not_cleared",
              notes: "Listing/MLS photo. Not cleared for reuse; supply an original or licensed file.",
            })
          : undefined,
        publicDisplay: isPublishable(p.status),
        featured: kind === "sold" ? FEATURED_SOLD.has(p.id) : status === "active",
        listingUrl: p.listing_url ?? undefined,
        showListingLink: activeOrPending,
        recordTier: p.tier,
        // Only the 8 for-sale/pending listing pages name Mudassir as listing agent (brief §6.3).
        representation: p.side ?? (activeOrPending ? "listing_agent" : "unknown"),
        agent: ref(ids.agentProfile),
        verification: p.status,
        sources: sourceRefs(p.source_ids),
        internalNotes: internal || undefined,
      },
      propertyOwned,
      notes,
    );
    warnings.push(...notes);
  };
  seed.sold_properties.forEach((p) => mapProperty(p, "sold"));
  seed.active_listings.forEach((p) => mapProperty(p, "listing"));

  // ── Testimonials ───────────────────────────────────────────────────────────
  seed.testimonials.forEach((t: SeedTestimonial) => {
    add(
      "testimonial",
      ids.testimonial(t.number),
      {
        reviewerDisplayName: t.reviewer_display_name,
        date: t.date_iso ?? undefined,
        dateDisplayed: t.date_displayed,
        platform: t.platform,
        rating: t.rating ?? undefined,
        hasText: t.has_text,
        wordCount: t.word_count,
        themes: t.themes,
        flags: t.flags,
        fingerprint: t.text_fingerprint_sha256_10,
        sourceUrl: t.source_url,
        number: t.number,
        // The dataset deliberately carries NO review wording and nothing is approved.
        body: t.text ?? undefined,
        approvedForPublication: false,
        reviewerPermission: false,
        featured: false,
        agent: ref(ids.agentProfile),
        verification: t.status,
        sources: sourceRefs(["S01"]),
      },
      [
        "reviewerDisplayName",
        "date",
        "dateDisplayed",
        "platform",
        "rating",
        "hasText",
        "wordCount",
        "themes",
        "flags",
        "fingerprint",
        "sourceUrl",
        "number",
        "agent",
        "verification",
        "sources",
      ],
    );
  });

  // ── Market statistics ──────────────────────────────────────────────────────
  const exp = seed.agent_experience;
  const stats = seed.price_statistics;
  const pricedSales = seed.sold_properties.filter((p) => p.sold_price != null && p.tier !== "map_sample").length;
  const bandTotal = stats.bands.reduce((sum, b) => sum + b.count, 0);
  if (bandTotal !== pricedSales) {
    warnings.push(`Price bands sum to ${bandTotal} but ${pricedSales} sold records carry a price — check the bands.`);
  }
  add(
    "marketStatistics",
    ids.marketStatistics,
    {
      headline: {
        closedSales: exp.headline_5y.closed_sales,
        totalValue: exp.headline_5y.total_value,
        average: exp.headline_5y.average,
        windowLabel: "the last five years",
        source: "Homes.com agent profile",
        asOf: observedOn,
        // Count, total and average reconcile (consistency checks all "Pass").
        status: "verified",
      },
      windows: exp.production_by_window.map((w) => ({
        _type: "productionWindow",
        _key: `win-${w.window}-${w.side}`,
        window: w.window,
        side: w.side,
        deals: w.deals,
        value: w.value,
        average: w.average,
        range: w.range,
        status: w.status,
      })),
      priceBands: stats.bands.map((b, i) => ({ _type: "priceBand", _key: `band-${i}`, label: b.band, count: b.count })),
      priceBandsBasis: `Calculated from the ${pricedSales} closed sales in this dataset that carry a published price — a subset of the ${exp.headline_5y.closed_sales}.`,
      showPriceBands: true,
      showPriceRanges: false,
      headlineRangeShown: exp.headline_5y.range_shown,
      collectedSets: stats.collected_sets.map((c) => ({
        _type: "statSet",
        _key: `set-${c.set}`,
        key: c.set,
        n: c.n,
        total: c.total,
        min: c.min,
        max: c.max,
        mean: c.mean,
        median: c.median,
        status: c.status,
      })),
      consistencyChecks: stats.consistency_checks.map((c, i) => ({
        _type: "consistencyCheck",
        _key: `chk-${i}`,
        check: c.check,
        result: c.result,
        detail: c.detail,
      })),
      limitations: stats.limitations,
      sources: sourceRefs(["S01"]),
    },
    ["headline", "windows", "priceBands", "priceBandsBasis", "headlineRangeShown", "collectedSets", "consistencyChecks", "limitations", "sources"],
  );

  // ── Site settings ──────────────────────────────────────────────────────────
  add(
    "siteSettings",
    ids.siteSettings,
    {
      siteName: SITE_COPY.siteName,
      siteTagline: SITE_COPY.siteTagline,
      showRatingSummary: true,
      showOfficeAddress: true,
      inquiryTopics: ["Buying a home", "Selling a home", "Investment property", "Renting or leasing", "Something else"],
      nav: SITE_COPY.nav.map((n, i) => ({ _type: "navLink", _key: `nav-${i}`, ...n })),
      dataNotice: SITE_COPY.dataNotice(formatLongDate(observedOn)),
      defaultSeo: { _type: "seo", title: SITE_COPY.seoTitle, description: SITE_COPY.seoDescription },
      dataProvenance: {
        observedOn,
        primarySourceUrl: seed.meta.primary_source,
        policy: seed.meta.policy,
      },
    },
    ["dataProvenance"],
  );

  // ── Home page (editorial copy) ─────────────────────────────────────────────
  add(
    "homePage",
    ids.homePage,
    {
      copyApprovedByAgent: false,
      heroEyebrow: HOME_COPY.heroEyebrow,
      heroLine1: HOME_COPY.heroLine1,
      heroLine2: HOME_COPY.heroLine2,
      heroAccent: HOME_COPY.heroAccent,
      heroSubheading: HOME_COPY.heroSubheading,
      heroPrimaryCta: { _type: "cta", ...HOME_COPY.heroPrimaryCta },
      archWords: HOME_COPY.archWords,
      archCaption: HOME_COPY.archCaption,
      showExpertise: true,
      expertiseHeading: HOME_COPY.expertiseHeading,
      showAbout: true,
      aboutStatement: HOME_COPY.aboutStatement,
      showAreas: true,
      areasHeading: HOME_COPY.areasHeading,
      areasIntro: HOME_COPY.areasIntro,
      showFeaturedHomes: true,
      featuredHeading: HOME_COPY.featuredHeading,
      showMarket: true,
      marketHeading: HOME_COPY.marketHeading,
      showRecentlySold: true,
      soldHeading: HOME_COPY.soldHeading,
      showHowIWork: true,
      howHeading: HOME_COPY.howHeading,
      howIntro: HOME_COPY.howIntro,
      services: HOME_COPY.services.map((s, i) => ({ _type: "serviceItem", _key: `svc-${i}`, ...s })),
      showCredibility: true,
      credibilityHeading: HOME_COPY.credibilityHeading,
      ctaGiantWord: HOME_COPY.ctaGiantWord,
      ctaHeading: HOME_COPY.ctaHeading,
      ctaBody: HOME_COPY.ctaBody,
      ctaPrimary: { _type: "cta", ...HOME_COPY.ctaPrimary },
      seo: { _type: "seo", title: SITE_COPY.seoTitle, description: SITE_COPY.seoDescription },
    },
    [], // all editorial: written once, then owned by the editor
  );

  // ── Inner pages (editorial copy) ───────────────────────────────────────────
  add(
    "propertiesPage",
    ids.propertiesPage,
    {
      copyApprovedByAgent: false,
      heading: PROPERTIES_PAGE_COPY.heading,
      intro: PROPERTIES_PAGE_COPY.intro,
      emptyMessage: PROPERTIES_PAGE_COPY.emptyMessage,
      seo: { _type: "seo", title: PROPERTIES_PAGE_COPY.seoTitle, description: PROPERTIES_PAGE_COPY.seoDescription },
    },
    [],
  );
  add(
    "contactPage",
    ids.contactPage,
    {
      copyApprovedByAgent: false,
      heading: CONTACT_PAGE_COPY.heading,
      intro: CONTACT_PAGE_COPY.intro,
      formHeading: CONTACT_PAGE_COPY.formHeading,
      privacyNote: CONTACT_PAGE_COPY.privacyNote,
      seo: { _type: "seo", title: CONTACT_PAGE_COPY.seoTitle, description: CONTACT_PAGE_COPY.seoDescription },
    },
    [],
  );

  return { entries, warnings };
}

/** "3030 Salt Creek Lane #145, Arlington Heights, IL 60005" → parts. */
export function parseAddress(raw: string | null | undefined) {
  if (!raw) return undefined;
  const parts = raw.split(",").map((s) => s.trim());
  if (parts.length < 3) return undefined;
  const m = /^([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/.exec(parts[parts.length - 1]!);
  if (!m) return undefined;
  return { street: parts.slice(0, parts.length - 2).join(", "), city: parts[parts.length - 2]!, state: m[1]!, zip: m[2]! };
}
