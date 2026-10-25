import { defineQuery } from "next-sanity";

/**
 * ALL GROQ lives here. Every query is evaluated by two engines — Content Lake
 * (CMS mode) and groq-js over the seed documents (local mode) — so keep to the
 * common subset: projections, filters, order(), coalesce(), defined(), `->`.
 *
 * Public-visibility rules (verified status, publicDisplay, approvals) are applied
 * HERE and re-checked in features/* so a mistake in one place cannot leak data.
 */

const VERIFIED = `["verified","calculated"]`;

const IMAGE = /* groq */ `{
  alt, decorative, caption, credit, rightsStatus, hotspot, crop,
  "asset": asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
}`;

const SEO = /* groq */ `{ title, description, canonicalUrl, noIndex, "ogImage": ogImage${IMAGE} }`;

const PUBLIC_PROPERTY = /* groq */ `_type == "property"
  && publicDisplay == true
  && verification in ${VERIFIED}
  && status in ["active","pending","sold","for_rent"]
  && defined(slug.current)`;

const PROPERTY_FIELDS = /* groq */ `
  _id, _updatedAt, "slug": slug.current,
  title, status, propertyCategory, propertyType,
  street, addressPublic, city, state, zip, neighborhoodLabel,
  listPrice, soldPrice, monthlyRent, priceChange,
  listDate, soldDate, asOf,
  beds, baths, sqft, lot, yearBuilt, daysOnMarket, priceVsList,
  hoaMonthly, estTaxesAnnual, pricePerSqft, suppressedFields,
  featured, summary, listingUrl, showListingLink, representation,
  "heroImage": heroImage${IMAGE}`;

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteName, siteTagline, showRatingSummary, showOfficeAddress, inquiryTopics,
  nav[]{ _key, label, href },
  footerNote,
  legalLinks[]{ _key, label, href },
  complianceNotice, listingDisclaimer, dataNotice,
  "defaultSeo": defaultSeo${SEO},
  "observedOn": dataProvenance.observedOn
}`);

export const AGENT_QUERY = defineQuery(/* groq */ `*[_type == "agentProfile" && _id == "agentProfile"][0]{
  fullName, displayName, professionalTitle, tagline, introduction, bio,
  "headshot": headshot${IMAGE},
  languages, propertyTypes,
  phonePrimary, email, website, facebook,
  links[]{ _key, label, url, status },
  licenseNumber, licenseState, yearsExperience, rating,
  credentials[]{ _key, name, kind, issuer, year, proofUrl, status },
  "brokerage": brokerage->{
    name, officeAddress, officialPage, team, disclosure,
    "logo": logo${IMAGE}
  }
}`);

export const HOME_QUERY = defineQuery(/* groq */ `*[_type == "homePage" && _id == "homePage"][0]{
  heroEyebrow, heroLine1, heroLine2, heroAccent, heroSubheading, heroPrimaryCta,
  archWords, archCaption,
  showExpertise, expertiseHeading,
  showAbout, aboutStatement,
  showAreas, areasHeading, areasIntro,
  showFeaturedHomes, featuredHeading,
  showMarket, marketHeading,
  showRecentlySold, soldHeading,
  showHowIWork, howHeading, howIntro, services[]{ _key, title, body },
  showCredibility, credibilityHeading,
  ctaGiantWord, ctaHeading, ctaBody, ctaPrimary,
  "ctaImage": ctaImage${IMAGE},
  "seo": seo${SEO}
}`);

export const PROPERTIES_PAGE_QUERY = defineQuery(/* groq */ `*[_type == "propertiesPage" && _id == "propertiesPage"][0]{
  heading, intro, emptyMessage,
  "seo": seo${SEO}
}`);

export const CONTACT_PAGE_QUERY = defineQuery(/* groq */ `*[_type == "contactPage" && _id == "contactPage"][0]{
  heading, intro, formHeading, privacyNote,
  "seo": seo${SEO}
}`);

export const SPECIALTIES_QUERY = defineQuery(/* groq */ `*[_type == "specialty"
  && safeToFeature == true && verification in ${VERIFIED}]
  | order(order asc){ _id, name, "slug": slug.current, summary }`);

export const SERVICE_AREAS_QUERY = defineQuery(/* groq */ `*[_type == "serviceArea"
  && showOnSite == true && verification in ${VERIFIED}]
  | order(order asc){
    _id, name, "slug": slug.current, role, summary, closedSales5y, shareOf100,
    "image": image${IMAGE}
  }`);

export const PUBLIC_PROPERTIES_QUERY = defineQuery(/* groq */ `*[${PUBLIC_PROPERTY}]{ ${PROPERTY_FIELDS} }`);

export const PROPERTY_BY_SLUG_QUERY = defineQuery(/* groq */ `*[${PUBLIC_PROPERTY} && slug.current == $slug][0]{
  ${PROPERTY_FIELDS},
  "gallery": gallery[]${IMAGE},
  "seo": seo${SEO}
}`);

export const PROPERTY_SLUGS_QUERY = defineQuery(/* groq */ `*[${PUBLIC_PROPERTY}]{ "slug": slug.current, _updatedAt }`);

export const TESTIMONIALS_QUERY = defineQuery(/* groq */ `*[_type == "testimonial"
  && approvedForPublication == true && reviewerPermission == true
  && defined(body) && verification in ${VERIFIED}]
  | order(featured desc, date desc){
    _id, body, reviewerDisplayName, publicName, date, platform, rating, featured
  }`);

export const MARKET_STATS_QUERY = defineQuery(/* groq */ `*[_type == "marketStatistics" && _id == "marketStatistics"][0]{
  headline, windows[]{ _key, window, side, deals, value, average, range, status },
  priceBands[]{ _key, label, count },
  priceBandsBasis, showPriceBands, showPriceRanges
}`);
// NOTE: `headlineRangeShown` ($193K–$990K) is deliberately never selected: it
// fails the research consistency check and must not reach the site.
