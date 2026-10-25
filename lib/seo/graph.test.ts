import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import type { AgentDTO, HomeDTO, PropertyDetailDTO, SiteSettingsDTO } from "@/types/content";

import { contactGraph, homeGraph, listingIndexGraph, propertyGraph } from "./graph";

/**
 * Structured data may only describe what the page shows and what is verified. These tests
 * pin the rules that are easy to break by accident: no review/rating markup, no address
 * the site itself hides, an Offer only for homes that can actually be bought.
 */
const ORIGIN = "https://example.test";
let previous: string | undefined;
beforeEach(() => {
  previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = ORIGIN;
});
afterEach(() => {
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previous;
});

const settings = (over: Partial<SiteSettingsDTO> = {}): SiteSettingsDTO => ({
  siteName: "Test Agent",
  showRatingSummary: true,
  showOfficeAddress: true,
  inquiryTopics: [],
  nav: [],
  legalLinks: [],
  defaultSeo: null,
  ...over,
});

const agent: AgentDTO = {
  fullName: "Test Agent",
  displayName: "Test Agent",
  bio: [],
  headshot: null,
  languages: ["English"],
  propertyTypes: [],
  phone: { display: "(555) 010-0100", href: "tel:+15550100100", e164: "+15550100100" },
  links: [{ label: "Profile", href: "https://example.org/profile" }],
  credentials: [],
  // a rating exists in the data — it must still never become review markup
  rating: { average: 5, count: 88, source: "Test" },
  brokerage: {
    name: "Test Brokerage",
    logo: null,
    address: { street: "1 Office Way", city: "Springfield", state: "IL", zip: "62701", oneLine: "1 Office Way, Springfield, IL 62701" },
  },
};

const home: HomeDTO = {
  heroLine1: "Test",
  heroLine2: "Agent",
  archWords: [],
  show: {
    expertise: true, about: true, areas: true, featuredHomes: true, market: true, recentlySold: true, howIWork: true, credibility: true,
  },
  services: [],
  seo: null,
};

const property = (over: Partial<PropertyDetailDTO> = {}): PropertyDetailDTO => ({
  id: "p1",
  slug: "p1",
  href: "/properties/p1",
  title: "Condo in Testville",
  status: "active",
  statusLabel: "For sale",
  available: true,
  category: "condo",
  typeLabel: "Condo",
  location: "Testville, IL",
  priceLabel: "$135,000",
  priceCaption: "List price",
  dateISO: "2026-10-09",
  facts: [{ label: "Beds", value: "2" }, { label: "Baths", value: "1" }],
  moreFacts: [],
  featured: false,
  image: null,
  updatedAt: "2026-10-09",
  sortDate: "2026-10-09",
  sortPrice: 135000,
  gallery: [],
  seo: null,
  city: "Testville",
  state: "IL",
  ...over,
});

const nodes = (graph: { "@graph": Array<Record<string, unknown>> }, type: string) => graph["@graph"].filter((n) => n["@type"] === type);
const text = (x: unknown) => JSON.stringify(x);

describe("structured data", () => {
  it("never emits rating or review markup, even when the agent has a rating", () => {
    const graphs = [
      homeGraph({ agent, settings: settings(), home }),
      contactGraph({ agent, settings: settings() }),
      listingIndexGraph({ settings: settings(), properties: [], title: "Homes" }),
      propertyGraph({ property: property(), agent, settings: settings(), listLabel: "Homes" }),
    ];
    for (const g of graphs) assert.doesNotMatch(text(g), /aggregateRating|"Review"|ratingValue|reviewCount|"review"/);
  });

  it("publishes the office address only when the site itself shows it", () => {
    const shown = nodes(homeGraph({ agent, settings: settings({ showOfficeAddress: true }), home }), "RealEstateAgent")[0];
    assert.ok(shown?.address, "address present when the site shows it");
    const hidden = homeGraph({ agent, settings: settings({ showOfficeAddress: false }), home });
    assert.equal(nodes(hidden, "RealEstateAgent")[0]?.address, undefined);
    assert.doesNotMatch(text(hidden), /1 Office Way|62701/);
    // the other graphs that embed the agent follow the same rule
    assert.doesNotMatch(text(contactGraph({ agent, settings: settings({ showOfficeAddress: false }) })), /1 Office Way/);
    assert.doesNotMatch(text(propertyGraph({ property: property(), agent, settings: settings({ showOfficeAddress: false }), listLabel: "Homes" })), /1 Office Way/);
  });

  it("describes the person with only the verified facts it was given", () => {
    const person = nodes(homeGraph({ agent, settings: settings(), home }), "Person")[0];
    assert.equal(person?.telephone, "+15550100100");
    assert.deepEqual(person?.knowsLanguage, ["English"]);
    assert.deepEqual(person?.sameAs, ["https://example.org/profile"]);
    // nothing that was not supplied: no job title, e-mail, image, credentials, price range
    for (const key of ["jobTitle", "email", "image", "hasCredential", "priceRange"]) assert.equal(key in (person ?? {}), false, key);
  });

  it("offers a home only while it can be bought", () => {
    const forSale = nodes(propertyGraph({ property: property(), agent, settings: settings(), listLabel: "Homes" }), "RealEstateListing")[0];
    assert.equal((forSale?.offers as { price?: number } | undefined)?.price, 135000);
    for (const status of ["pending", "sold"] as const) {
      const g = propertyGraph({
        property: property({ status, statusLabel: status, available: false }),
        agent,
        settings: settings(),
        listLabel: "Homes",
      });
      assert.equal(nodes(g, "RealEstateListing").length, 0, `${status}: no listing`);
      assert.doesNotMatch(text(g), /"Offer"|InStock/, `${status}: no offer`);
    }
  });

  it("keeps the street address out unless the page shows it", () => {
    // a home with no public street address (the default) carries city and state only
    const hidden = propertyGraph({ property: property(), agent, settings: settings(), listLabel: "Homes" });
    assert.doesNotMatch(text(nodes(hidden, "RealEstateListing")[0]?.about), /streetAddress|postalCode/);
    assert.match(text(nodes(hidden, "RealEstateListing")[0]?.about), /addressLocality/);
    const shown = propertyGraph({
      property: property({ street: "9 Public St", zip: "60000" }),
      agent,
      settings: settings(),
      listLabel: "Homes",
    });
    assert.match(text(nodes(shown, "RealEstateListing")[0]?.about), /9 Public St/);
  });

  it("labels breadcrumbs exactly as the page does", () => {
    const crumbs = (g: { "@graph": Array<Record<string, unknown>> }) =>
      (nodes(g, "BreadcrumbList")[0]?.itemListElement as Array<{ name: string; item: string }>).map((i) => i.name);
    assert.deepEqual(crumbs(listingIndexGraph({ settings: settings(), properties: [], title: "Listings" })), ["Home", "Listings"]);
    assert.deepEqual(
      crumbs(propertyGraph({ property: property(), agent, settings: settings(), listLabel: "Listings" })),
      ["Home", "Listings", "Condo in Testville"],
    );
  });

  it("makes pictures served from this site absolute", () => {
    const withPhoto = { ...agent, headshot: { src: "/photos/portrait.jpg", width: 630, height: 630, alt: "Portrait" } };
    const nodes = homeGraph({ agent: withPhoto, settings: settings(), home })["@graph"] as Array<Record<string, unknown>>;
    assert.ok(nodes.filter((n) => n.image).every((n) => n.image === `${ORIGIN}/photos/portrait.jpg`));
    const listing = propertyGraph({
      property: property({ image: { src: "https://cdn.sanity.io/images/p/d/x-10x10.jpg", width: 10, height: 10, alt: "x" } }),
      agent,
      settings: settings(),
      listLabel: "Homes",
    });
    assert.match(text(listing), /https:\/\/cdn\.sanity\.io\/images\/p\/d\/x-10x10\.jpg/, "an already-absolute URL is left alone");
  });

  it("uses the configured origin for every id and url", () => {
    const g = homeGraph({ agent, settings: settings(), home });
    assert.match(text(g), new RegExp(`${ORIGIN}/#website`));
    assert.doesNotMatch(text(g), /localhost/);
  });
});
