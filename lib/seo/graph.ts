import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { toE164 } from "@/lib/utils/format";
import type { AgentDTO, HomeDTO, PropertyDetailDTO, PropertyDTO, SiteSettingsDTO } from "@/types/content";

/**
 * Structured data builders.
 *
 * Rules (content brief §8, §2.3, §4 and the task brief):
 *  • describe ONLY what is visible on the page and verified — every value here comes
 *    from the policy-checked DTOs, never from raw CMS fields;
 *  • no AggregateRating / Review markup: the 5.0 average is a self-published summary
 *    of 2021–22 reviews with open integrity flags, and Google does not allow
 *    self-serving review markup on the entity's own site;
 *  • no invented properties (no hasCredential, no priceRange, no opening hours).
 */

type Json = Record<string, unknown>;

/** Structured data needs absolute image URLs; a picture served from this site is a /path. */
const absImage = (src?: string) => (src?.startsWith("/") ? absoluteUrl(src) : src);

const prune = <T extends Json>(obj: T): T => {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) delete obj[k];
  }
  return obj;
};

const ids = () => {
  const base = getSiteUrl();
  return { website: `${base}/#website`, agent: `${base}/#agent`, person: `${base}/#person` };
};

export function agentNodes(agent: AgentDTO, settings: SiteSettingsDTO): Json[] {
  const id = ids();
  // the office address is published only when the site itself shows it
  const office = settings.showOfficeAddress ? agent.brokerage?.address : undefined;
  const sameAs = agent.links.map((l) => l.href);

  const person = prune({
    "@type": "Person",
    "@id": id.person,
    name: agent.fullName,
    url: absoluteUrl("/"),
    image: absImage(agent.headshot?.src),
    jobTitle: agent.title,
    knowsLanguage: agent.languages,
    telephone: toE164(agent.phone?.display),
    email: agent.email,
    worksFor: agent.brokerage?.name ? { "@type": "Organization", name: agent.brokerage.name } : undefined,
    sameAs,
  });

  const business = prune({
    "@type": "RealEstateAgent",
    "@id": id.agent,
    name: agent.fullName,
    url: absoluteUrl("/"),
    description: agent.introduction,
    image: absImage(agent.headshot?.src),
    telephone: toE164(agent.phone?.display),
    email: agent.email,
    address: office
      ? prune({
          "@type": "PostalAddress",
          streetAddress: office.street,
          addressLocality: office.city,
          addressRegion: office.state,
          postalCode: office.zip,
          addressCountry: "US",
        })
      : undefined,
    knowsLanguage: agent.languages,
    employee: { "@id": id.person },
    sameAs,
  });

  return [person, business];
}

const webSite = (settings: SiteSettingsDTO): Json => ({
  "@type": "WebSite",
  "@id": ids().website,
  url: absoluteUrl("/"),
  name: settings.siteName,
  inLanguage: "en-US",
  publisher: { "@id": ids().agent },
});

export function homeGraph({ agent, settings, home }: { agent: AgentDTO; settings: SiteSettingsDTO; home: HomeDTO }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webSite(settings),
      ...agentNodes(agent, settings),
      prune({
        "@type": "WebPage",
        "@id": `${absoluteUrl("/")}#webpage`,
        url: absoluteUrl("/"),
        name: home.seo?.title ?? settings.defaultSeo?.title,
        description: home.seo?.description ?? settings.defaultSeo?.description,
        isPartOf: { "@id": ids().website },
        about: { "@id": ids().agent },
        inLanguage: "en-US",
      }),
    ],
  };
}

export function breadcrumbs(items: Array<{ name: string; path: string }>): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function listingIndexGraph({
  settings,
  properties,
  title,
  description,
}: {
  settings: SiteSettingsDTO;
  properties: PropertyDTO[];
  title: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webSite(settings),
      prune({
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/properties")}#webpage`,
        url: absoluteUrl("/properties"),
        name: title,
        description,
        isPartOf: { "@id": ids().website },
        about: { "@id": ids().agent },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: properties.length,
          itemListElement: properties.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(p.href),
            name: p.title,
          })),
        },
      }),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: title, path: "/properties" },
      ]),
    ],
  };
}

const RESIDENCE_TYPE: Record<string, string> = {
  condo: "Apartment",
  townhouse: "House",
  house: "SingleFamilyResidence",
  multifamily: "Residence",
  other: "Accommodation",
};

const factNumber = (p: PropertyDTO, label: string): number | undefined => {
  const raw = p.facts.find((f) => f.label === label)?.value;
  const n = raw ? Number(raw.replace(/,/g, "")) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

/**
 * A property page. Only genuinely available listings get a RealEstateListing +
 * Offer; under-contract and sold homes are described as plain pages, so the
 * markup can never advertise something that cannot be bought.
 * Facts are read from the same DTO the page renders, so suppressed (disputed)
 * specs are suppressed here too, and the street address appears only if public.
 */
export function propertyGraph({
  property,
  agent,
  settings,
  listLabel,
}: {
  property: PropertyDetailDTO;
  agent: AgentDTO;
  settings: SiteSettingsDTO;
  /** What the visible breadcrumb calls the list page (the Homes page heading). */
  listLabel: string;
}) {
  const url = absoluteUrl(property.href);
  const beds = factNumber(property, "Beds");
  const baths = factNumber(property, "Baths");
  const sqft = factNumber(property, "Sq ft");

  const about = prune({
    "@type": RESIDENCE_TYPE[property.category] ?? "Accommodation",
    name: property.title,
    address: prune({
      "@type": "PostalAddress",
      streetAddress: property.street,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.zip,
      addressCountry: "US",
    }),
    numberOfBedrooms: beds,
    numberOfBathroomsTotal: baths,
    floorSize: sqft ? { "@type": "QuantitativeValue", value: sqft, unitCode: "FTK" } : undefined,
    image: absImage(property.image?.src),
  });

  const forSale = property.status === "active";
  const page = prune({
    "@type": forSale ? "RealEstateListing" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: property.title,
    description: property.summary ?? property.seo?.description,
    isPartOf: { "@id": ids().website },
    inLanguage: "en-US",
    datePosted: forSale ? property.dateISO : undefined,
    about,
    offers:
      forSale && /^\$[\d,]+$/.test(property.priceLabel)
        ? {
            "@type": "Offer",
            price: Number(property.priceLabel.replace(/[$,]/g, "")),
            priceCurrency: "USD",
            businessFunction: "http://purl.org/goodrelations/v1#Sell",
            availability: "https://schema.org/InStock",
            offeredBy: { "@id": ids().agent },
          }
        : undefined,
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      webSite(settings),
      ...agentNodes(agent, settings),
      page,
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: listLabel, path: "/properties" },
        { name: property.title, path: property.href },
      ]),
    ],
  };
}

export function contactGraph({ agent, settings }: { agent: AgentDTO; settings: SiteSettingsDTO }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webSite(settings),
      ...agentNodes(agent, settings),
      {
        "@type": "ContactPage",
        "@id": `${absoluteUrl("/contact")}#webpage`,
        url: absoluteUrl("/contact"),
        name: `Contact ${agent.displayName}`,
        isPartOf: { "@id": ids().website },
        about: { "@id": ids().agent },
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ],
  };
}
