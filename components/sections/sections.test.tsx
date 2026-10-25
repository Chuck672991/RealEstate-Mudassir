import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type {
  AgentDTO,
  HomeDTO,
  ImageDTO,
  MarketStatsDTO,
  PropertyDTO,
  ServiceAreaDTO,
  SpecialtyDTO,
} from "@/types/content";

import { About } from "./About";
import { ArchIntro } from "./ArchIntro";
import { Areas } from "./Areas";
import { Credibility } from "./Credibility";
import { Expertise } from "./Expertise";
import { FeaturedHomes } from "./FeaturedHomes";
import { Hero } from "./Hero";
import { Horizon } from "./Horizon";
import { HowIWork } from "./HowIWork";
import { Market } from "./Market";
import { RecentlySold } from "./RecentlySold";

/**
 * EMPTY-CMS BEHAVIOUR. The brief: no empty sections, no placeholder text, no fake
 * content. A section with nothing to show must render NOTHING — not a heading over a
 * void, not "Lorem ipsum", not a zero. These tests render every home section with no
 * data, then again with the smallest amount of data that justifies it (a positive
 * control, so "renders nothing" can never pass merely because a section is broken).
 *
 * Fixtures are generic on purpose: nothing here is, or looks like, real client data.
 */
const html = (node: ReactElement) => renderToStaticMarkup(node);

const agent = (over: Partial<AgentDTO> = {}): AgentDTO => ({
  fullName: "Test Agent",
  displayName: "Test Agent",
  bio: [],
  headshot: null,
  languages: [],
  propertyTypes: [],
  links: [],
  credentials: [],
  ...over,
});

const home = (over: Partial<HomeDTO> = {}): HomeDTO => ({
  heroLine1: "Alpha",
  heroLine2: "Beta",
  archWords: [],
  show: {
    expertise: true,
    about: true,
    areas: true,
    featuredHomes: true,
    market: true,
    recentlySold: true,
    howIWork: true,
    credibility: true,
  },
  services: [],
  seo: null,
  ...over,
});

const stats = (over: Partial<MarketStatsDTO> = {}): MarketStatsDTO => ({
  windowLabel: "the last five years",
  source: "Test source",
  bands: [],
  showBands: false,
  ...over,
});

const area = (over: Partial<ServiceAreaDTO> = {}): ServiceAreaDTO => ({
  id: "a1",
  name: "Testville",
  slug: "testville",
  image: null,
  isOffice: false,
  ...over,
});

const specialty = (over: Partial<SpecialtyDTO> = {}): SpecialtyDTO => ({
  id: "s1",
  name: "First-time buyers",
  slug: "first-time-buyers",
  ...over,
});

const property = (over: Partial<PropertyDTO> = {}): PropertyDTO => ({
  id: "p1",
  slug: "p1",
  href: "/properties/p1",
  title: "Condo in Testville, IL",
  status: "sold",
  statusLabel: "Sold",
  available: false,
  category: "condo",
  typeLabel: "Condo",
  location: "Testville, IL",
  priceLabel: "$251,000",
  priceCaption: "Sold price",
  facts: [],
  moreFacts: [],
  featured: false,
  image: null,
  updatedAt: "2026-01-01",
  sortDate: "2026-01-01",
  sortPrice: 251000,
  ...over,
});

const photo = (over: Partial<ImageDTO> = {}): ImageDTO => ({ src: "/photos/test.jpg", width: 800, height: 1200, alt: "A test building", ...over });

const BROKEN = /undefined|\bnull\b|NaN|lorem ipsum|\[object/i;

describe("home sections with an empty CMS", () => {
  it("render nothing when there is nothing to show", () => {
    assert.equal(html(<ArchIntro words={[]} />), "");
    assert.equal(html(<Expertise specialties={[]} />), "");
    assert.equal(html(<Areas areas={[]} agent={agent()} />), "");
    assert.equal(html(<FeaturedHomes homes={[]} />), "");
    assert.equal(html(<RecentlySold sales={[]} />), "");
    assert.equal(html(<Market stats={null} />), "");
    assert.equal(html(<About agent={agent()} />), "");
    assert.equal(html(<HowIWork home={home()} agent={agent()} />), "");
    assert.equal(html(<Horizon image={null} heading="Chicagoland" />), "");
    assert.equal(html(<Horizon image={photo()} />), "");
    assert.equal(html(<Credibility agent={agent()} testimonials={[]} showRating={true} />), "");
  });

  it("a market record with no figures is not a section", () => {
    // source + window label only: no headline, no windows, no bands
    assert.equal(html(<Market stats={stats()} />), "");
    // bands switched on but empty must not draw a table with no rows
    assert.equal(html(<Market stats={stats({ showBands: true, bands: [] })} />), "");
    // bands switched off: the rows exist in the data but must stay hidden
    assert.equal(html(<Market stats={stats({ showBands: false, bands: [{ label: "$100K–$200K", count: 4 }] })} />), "");
  });

  it("the office alone is not a service area", () => {
    const office = area({ id: "o1", name: "Test Brokerage", isOffice: true });
    assert.equal(html(<Areas areas={[office]} agent={agent()} />), "");
    // …and an area with no verified count has no number to lead its panel
    assert.equal(html(<Areas areas={[area({ closedSales5y: undefined })]} agent={agent()} />), "");
  });

  it("a hidden rating with nothing else to say is not a section", () => {
    const rated = agent({ rating: { average: 5, count: 3, source: "Test" } });
    assert.equal(html(<Credibility agent={rated} testimonials={[]} showRating={false} />), "");
  });

  it("the hero renders from the two required name lines alone", () => {
    const markup = html(<Hero home={home()} agent={agent()} />);
    assert.match(markup, /<h1/);
    assert.match(markup, /Alpha Beta/);
    assert.doesNotMatch(markup, BROKEN);
    // optional copy is simply absent — no empty paragraphs, no dead buttons
    assert.doesNotMatch(markup, /hero__eyebrow|hero__sub|hero__meta|hero__cta|hero__accent/);
  });
});

describe("home sections with the smallest data that justifies them", () => {
  it("each section appears, and prints no broken values", () => {
    const rendered: Record<string, string> = {
      arch: html(<ArchIntro words={["One", "Two", "Three"]} />),
      expertise: html(<Expertise specialties={[specialty()]} />),
      areas: html(<Areas areas={[area({ closedSales5y: 12, sharePercent: 30 })]} agent={agent()} />),
      featured: html(
        <FeaturedHomes homes={[property({ status: "active", statusLabel: "For sale", available: true })]} />,
      ),
      sold: html(<RecentlySold sales={[property()]} />),
      market: html(<Market stats={stats({ closedSales: 100, average: 324000 })} />),
      about: html(<About agent={agent()} statement="A short statement." />),
      how: html(<HowIWork home={home({ services: [{ title: "Listing" }] })} agent={agent()} />),
      credibility: html(
        <Credibility
          agent={agent({ rating: { average: 5, count: 3, source: "Test" } })}
          testimonials={[]}
          showRating={true}
        />,
      ),
    };

    for (const [name, markup] of Object.entries(rendered)) {
      assert.match(markup, /^<(section|div)\b/, `${name} should render its section`);
      assert.doesNotMatch(markup, BROKEN, `${name} printed a placeholder or broken value`);
    }
  });

  it("market shows only the figures it was given", () => {
    const markup = html(<Market stats={stats({ closedSales: 100, average: 324000 })} />);
    assert.match(markup, /100 closed sales over the last five years, averaging about \$324,000/);
    assert.doesNotMatch(markup, /Last 12 months|Last five years<|market__bands|<dl/, "no figures were supplied for these");
    assert.match(markup, /Source: Test source/);
  });

  it("market never states a range that was not confirmed", () => {
    const markup = html(<Market stats={stats({ closedSales: 100, average: 324000 })} />);
    assert.doesNotMatch(markup, /Price range|193K|990K/);
  });

  it("a sale with no facts and no photograph still renders a complete stage", () => {
    const markup = html(<RecentlySold sales={[property()]} />);
    assert.match(markup, /\$251,000/);
    assert.match(markup, /Testville/);
    assert.match(markup, /href="\/properties\/p1"/);
    assert.doesNotMatch(markup, BROKEN);
  });

  it("an area panel shows the sales count it was given and no more", () => {
    const markup = html(<Areas areas={[area({ closedSales5y: 12 })]} agent={agent()} />);
    assert.match(markup, /Testville/);
    assert.match(markup, />12</);
    // no share supplied → no percentage bar and no invented percentage
    assert.doesNotMatch(markup, /area-panel__bar|% of closed sales/);
    // no office supplied → no office panel
    assert.doesNotMatch(markup, /area-panel--office/);
  });
});

describe("the horizon (clouds over an aerial photograph)", () => {
  it("is decorative: the photograph has no alt text, the clouds are hidden, the heading names the section", () => {
    const markup = html(<Horizon image={photo()} heading="Chicagoland" line="Real estate across Chicagoland" />);
    assert.match(markup, /<section id="horizon"/);
    assert.match(markup, /aria-labelledby="horizon-h"/);
    assert.match(markup, /Chicagoland/);
    assert.doesNotMatch(markup, /alt="A test building"/, "the editor's alt text is replaced by an empty one here");
    assert.equal((markup.match(/class="clouds clouds--/g) ?? []).length, 3, "three cloud layers");
    assert.equal((markup.match(/<section/g) ?? []).length, 1);
    assert.doesNotMatch(markup, BROKEN);
  });

  it("the tagline is optional — no empty paragraph without it", () => {
    assert.doesNotMatch(html(<Horizon image={photo()} heading="Chicagoland" />), /horizon__line/);
  });
});

describe("how he works: the two photographs", () => {
  const services = { services: [{ title: "Listing" }] };

  it("draws no photograph columns without photographs, and never invents one", () => {
    const markup = html(<HowIWork home={home(services)} agent={agent()} />);
    assert.doesNotMatch(markup, /how__imgs|how__img|flower/);
  });

  it("one photograph: the left (framed) column only, with its own alt text and a spray over it", () => {
    const markup = html(<HowIWork home={home(services)} agent={agent()} photos={[photo()]} />);
    assert.match(markup, /how__img--l/);
    assert.doesNotMatch(markup, /how__img--r/);
    assert.match(markup, /alt="A test building"/);
    assert.match(markup, /flower--living/);
  });

  it("two photographs: both columns drift against each other, the note goes under the right one", () => {
    const markup = html(
      <HowIWork
        home={home({ ...services, howIntro: "A short introduction." })}
        agent={agent()}
        photos={[photo({ alt: "Left" }), photo({ alt: "Right" })]}
      />,
    );
    assert.match(markup, /data-drift="fwd"/);
    assert.match(markup, /data-drift="rev"/);
    assert.match(markup, /how__note/);
    assert.equal((markup.match(/A short introduction\./g) ?? []).length, 1, "the introduction is printed once");
    assert.doesNotMatch(markup, BROKEN);
  });
});
