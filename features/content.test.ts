import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateLocal } from "@/lib/sanity/groq-local";
import type { PropertyDTO } from "@/types/content";
import {
  AGENT_QUERY,
  HOME_QUERY,
  MARKET_STATS_QUERY,
  PROPERTY_BY_SLUG_QUERY,
  PROPERTY_SLUGS_QUERY,
  PUBLIC_PROPERTIES_QUERY,
  SERVICE_AREAS_QUERY,
  SITE_SETTINGS_QUERY,
  SPECIALTIES_QUERY,
  TESTIMONIALS_QUERY,
} from "@/lib/sanity/queries";

import { shapeAgent, type RawAgent } from "./agent/shape";
import { shapeAreas, type RawArea } from "./areas/shape";
import { shapeHome } from "./home/shape";
import { comparePropertyOrder, toPropertyDTO, toPropertyDetailDTO, type RawProperty } from "./properties/dto";
import { describeProperty } from "./properties/describe";
import { shapeSiteSettings } from "./site/shape";
import { shapeSpecialties, type RawSpecialty } from "./specialties/shape";
import { shapeMarketStats, type RawStats } from "./stats/shape";
import { shapeTestimonials, type RawTestimonial } from "./testimonials/shape";

const q = <T>(query: string, params: Record<string, unknown> = {}) => evaluateLocal(query, params) as Promise<T>;

describe("agent (publication policy)", async () => {
  const agent = shapeAgent(await q<RawAgent>(AGENT_QUERY));

  it("shows only the verified phone, licence, experience and rating", () => {
    assert.equal(agent.phone?.display, "(224) 231-4552");
    assert.equal(agent.phone?.href, "tel:+12242314552");
    assert.equal(agent.license?.number, "475192496");
    assert.equal(agent.license?.state, "IL");
    assert.equal(agent.yearsExperience, 18);
    assert.equal(agent.rating?.average, 5);
    assert.equal(agent.rating?.count, 88);
    assert.equal(agent.rating?.firstReviewDate, "2021-07-20");
    assert.equal(agent.rating?.lastReviewDate, "2022-07-28");
    assert.deepEqual(agent.languages, ["English", "Arabic", "Hindi", "Punjabi", "Turkish", "Urdu"]);
  });

  it("withholds everything the research could not verify", () => {
    assert.equal(agent.title, undefined, "unverified title must not be exposed as a claim");
    assert.equal(agent.email, undefined, "no email is published");
    assert.deepEqual(agent.credentials, [], "designations and awards are all unverified");
    assert.deepEqual(agent.links.map((l) => l.label), ["Homes.com profile"], "website + Facebook are unverified");
    const json = JSON.stringify(agent);
    for (const leaked of ["630-965-5492", "buywithms", "mskeytomyhome", "193K", "Platinum Club", "CNE"]) {
      assert.ok(!json.includes(leaked), `agent DTO leaked "${leaked}"`);
    }
  });

  it("builds the brokerage disclosure line from verified facts", () => {
    assert.equal(agent.brokerage?.name, "HomeSmart Connect LLC");
    assert.equal(agent.brokerage?.address?.oneLine, "3030 Salt Creek Lane #145, Arlington Heights, IL 60005");
    assert.equal(agent.brokerage?.logo, null, "logo rights are pending → not shown");
    assert.equal(agent.headshot?.src, "/photos/portrait.jpg", "the owner-supplied portrait is shown");
    assert.match(agent.headshot?.alt ?? "", /Mudassir Siddiqui/);
  });
});

describe("properties", async () => {
  const raw = await q<RawProperty[]>(PUBLIC_PROPERTIES_QUERY);
  const dtos = raw.map(toPropertyDTO).filter((p): p is NonNullable<typeof p> => !!p).sort(comparePropertyOrder);

  it("publishes exactly the 17 verified records (9 sold, 4 for sale, 4 under contract)", () => {
    assert.equal(dtos.length, 17);
    const count = (s: string) => dtos.filter((p) => p.status === s).length;
    assert.deepEqual([count("sold"), count("active"), count("pending"), count("for_rent")], [9, 4, 4, 0]);
  });

  it("never publishes the partial, unverified or rental records", async () => {
    const slugs = (await q<Array<{ slug: string }>>(PROPERTY_SLUGS_QUERY)).map((s) => s.slug);
    assert.equal(slugs.length, 17);
    assert.ok(!slugs.some((s) => /sold-0(1[0-9]|[2-3][0-9]|40)$/.test(s)), "a price-and-address-only sale is public");
    assert.ok(!slugs.some((s) => /rent|list-009/.test(s)));
    // and direct URL access to a hidden record resolves to nothing
    assert.equal(await q(PROPERTY_BY_SLUG_QUERY, { slug: "home-in-hanover-park-sold-010" }), null);
    assert.equal(await q(PROPERTY_BY_SLUG_QUERY, { slug: "rental-in-hanover-park-rent-004" }), null);
  });

  it("lists homes for sale first, then under contract, then sold (newest first)", () => {
    const order = dtos.map((p) => p.status);
    assert.deepEqual(order, [...order].sort((a, b) => ["active", "pending", "for_rent", "sold"].indexOf(a) - ["active", "pending", "for_rent", "sold"].indexOf(b)));
    const sold = dtos.filter((p) => p.status === "sold");
    assert.deepEqual(sold.map((p) => p.sortDate), [...sold.map((p) => p.sortDate)].sort().reverse());
  });

  it("never presents a pending or sold home as available", () => {
    for (const p of dtos) assert.equal(p.available, p.status === "active", `${p.title} availability`);
    assert.ok(dtos.filter((p) => p.status === "pending").every((p) => p.statusLabel === "Under contract"));
  });

  it("hides street addresses and ZIP codes by default", () => {
    for (const p of dtos) {
      assert.equal(p.street, undefined);
      assert.match(p.location, /^[A-Za-z .'-]+, IL$/, `${p.title} → ${p.location}`);
    }
  });

  it("suppresses the specs the research found inconsistent", () => {
    const by = (rid: string) => dtos.find((p) => p.slug.endsWith(rid))!;
    const labels = (p: { facts: Array<{ label: string }> }) => p.facts.map((f) => f.label);
    assert.ok(!labels(by("sold-003")).includes("Beds") && !labels(by("sold-003")).includes("Baths"));
    assert.ok(!labels(by("sold-006")).includes("Beds") && !labels(by("sold-006")).includes("Sq ft"));
    assert.ok(!labels(by("list-006")).includes("Beds"));
    assert.ok(labels(by("sold-001")).includes("Beds"), "unflagged records keep their facts");
  });

  it("formats prices, dates and roles deterministically", () => {
    const sold1 = dtos.find((p) => p.slug.endsWith("sold-001"))!;
    assert.equal(sold1.priceLabel, "$251,000");
    assert.equal(sold1.priceCaption, "Sold price");
    assert.equal(sold1.dateLabel, "Sold Sep 2026");
    assert.equal(sold1.roleLabel, "Mudassir represented the seller");
    const drop = dtos.find((p) => p.slug.endsWith("list-002"))!;
    assert.equal(drop.priceChange, "$26K price drop");
    assert.equal(drop.asOf, "2026-10-24");
  });

  it("links to the original listing only for homes that are for sale or under contract", () => {
    for (const p of dtos) assert.equal(!!p.listingUrl, p.status === "active" || p.status === "pending", p.title);
  });

  it("shows an owner-supplied photo where one exists, and the illustrated fallback where not", () => {
    const withPhoto = dtos.filter((p) => p.image);
    assert.equal(withPhoto.length, dtos.length, "all 17 published homes have a supplied photo");
    for (const p of withPhoto) {
      assert.match(p.image!.src, /^\/photos\/homes\/(sold|list)-\d{3}\.jpg$/);
      assert.ok(p.image!.alt.length > 10, "descriptive alt text");
    }
    // a record with no supplied file still renders (null → material placeholder), e.g. a hidden one
    assert.equal(toPropertyDTO({ slug: "x", status: "sold", heroImage: null } as RawProperty)?.image, null);
  });

  it("resolves a detail page by slug", async () => {
    const detail = await q<RawProperty & { seo?: null }>(PROPERTY_BY_SLUG_QUERY, { slug: "condo-in-lyons-sold-001" });
    const dto = toPropertyDetailDTO(detail, null)!;
    assert.equal(dto.title, "Condo in Lyons");
    assert.equal(dto.zip, undefined, "ZIP is withheld while the address is private");
    assert.ok(dto.moreFacts.some((f) => f.label === "Days on market"));
  });
});

describe("reviews, statistics, specialties, areas", async () => {
  it("shows no testimonial text (none are approved, none have text)", async () => {
    assert.deepEqual(shapeTestimonials(await q<RawTestimonial[]>(TESTIMONIALS_QUERY)), []);
  });

  it("only publishes an approved review that has text AND reviewer permission", () => {
    const base = { _id: "t1", reviewerDisplayName: "Wasiullah Khan", body: "Great." } as RawTestimonial;
    assert.equal(shapeTestimonials([base]).length, 1);
    assert.equal(shapeTestimonials([base])[0]!.name, "Wasiullah K.");
    assert.equal(shapeTestimonials([{ ...base, body: "  " }]).length, 0);
    assert.equal(shapeTestimonials([{ ...base, body: undefined }]).length, 0);
  });

  it("exposes the verified five-year headline and recent activity, but never the failing range", async () => {
    const stats = shapeMarketStats(await q<RawStats>(MARKET_STATS_QUERY))!;
    assert.equal(stats.closedSales, 100);
    assert.equal(stats.totalValue, 32384588);
    assert.equal(stats.average, 323846);
    assert.deepEqual(stats.lastYear, { deals: 19, sellerSide: 6, buyerSide: 13 });
    assert.deepEqual(stats.fiveYear, { sellerSide: 34, buyerSide: 66 });
    assert.equal(stats.ranges, undefined, "component ranges stay hidden until the agent confirms");
    assert.equal(stats.bands.reduce((n, b) => n + b.count, 0), 39);
    assert.ok(!JSON.stringify(stats).includes("193K"));
  });

  it("only features specialties the evidence supports", async () => {
    const names = shapeSpecialties(await q<RawSpecialty[]>(SPECIALTIES_QUERY)).map((s) => s.name);
    assert.equal(names.length, 8);
    assert.equal(names[0], "First-time homebuyers");
    for (const bad of ["Luxury homes", "Commercial real estate", "Mortgage / refinance guidance", "Relocation services", "Short sales, foreclosures, distressed"]) {
      assert.ok(!names.includes(bad), `${bad} must stay hidden`);
    }
  });

  it("lists the six named areas plus the office city, not the unverified 'Chicagoland'", async () => {
    const areas = shapeAreas(await q<RawArea[]>(SERVICE_AREAS_QUERY));
    assert.deepEqual(areas.map((a) => a.name), ["Hanover Park", "South Tri Village", "Schaumburg", "Bartlett", "Streamwood", "South Schaumburg", "Arlington Heights"]);
    assert.equal(areas.find((a) => a.name === "Hanover Park")?.sharePercent, 18);
    assert.equal(areas.find((a) => a.name === "Arlington Heights")?.isOffice, true);
  });
});

describe("site + home copy", async () => {
  it("falls back to safe defaults when documents are missing", () => {
    const s = shapeSiteSettings(null);
    assert.equal(s.siteName, "Mudassir Siddiqui");
    assert.ok(s.inquiryTopics.length > 0);
    // no menu in the CMS → only routes that always exist (never a dead #anchor)
    assert.deepEqual(s.nav, [
      { label: "Homes", href: "/properties" },
      { label: "Contact", href: "/contact" },
    ]);
    // no data → no claim about where data came from
    assert.equal(s.dataNotice, undefined);
    assert.equal(s.listingDisclaimer, undefined);
    const h = shapeHome(null);
    assert.equal(h.heroLine1, "Mudassir");
    assert.ok(Object.values(h.show).every(Boolean));
    assert.deepEqual(h.services, []);
  });

  it("reads the seeded copy and SEO defaults", async () => {
    const s = shapeSiteSettings(await q(SITE_SETTINGS_QUERY));
    assert.equal(s.nav.length, 4, "an editor-provided menu replaces the default");
    assert.match(
      s.dataNotice ?? "",
      /^Listing details and sales figures were collected from .+ public Homes\.com profile on October 24, 2026 and may have changed/,
    );
    assert.ok(s.defaultSeo?.title && s.defaultSeo.title.length <= 70);
    assert.equal(s.observedOn, "2026-10-24");
    const h = shapeHome(await q(HOME_QUERY));
    assert.equal(h.heroAccent, "Chicagoland");
    assert.equal(h.archWords.length, 3);
    assert.equal(h.services.length, 5);
  });
});

describe("describeProperty (meta descriptions)", () => {
  const agent = { displayName: "Mudassir Siddiqui", brokerage: { name: "HomeSmart Connect LLC", logo: null } };
  const base = {
    id: "p1", slug: "x", href: "/properties/x", title: "Condo in Lyons", status: "sold", statusLabel: "Sold",
    available: false, category: "condo", typeLabel: "Condo", location: "Lyons, IL", priceLabel: "$251,000",
    priceCaption: "Sold price", dateLabel: "Sold Sep 2026", facts: [{ label: "Beds", value: "2" }, { label: "Baths", value: "2" }, { label: "Sq ft", value: "1,120" }],
    moreFacts: [], featured: false, image: null, updatedAt: "", sortDate: "", sortPrice: 0,
  } as unknown as PropertyDTO;

  it("describes a sold home from the facts the page shows", () => {
    assert.equal(
      describeProperty(base, agent),
      "Condo in Lyons, IL. Sold Sep 2026 for $251,000. 2 beds, 2 baths, 1,120 sq ft. Mudassir Siddiqui, HomeSmart Connect LLC.",
    );
  });

  it("never calls an under-contract home available", () => {
    const text = describeProperty({ ...base, status: "pending", dateLabel: "Listed Oct 2026" }, agent);
    assert.match(text, /Under contract/);
    assert.doesNotMatch(text, /For sale/);
  });

  it("omits facts that are suppressed or absent", () => {
    const text = describeProperty({ ...base, facts: [] }, agent);
    assert.doesNotMatch(text, /beds|baths|sq ft/i);
  });
});
