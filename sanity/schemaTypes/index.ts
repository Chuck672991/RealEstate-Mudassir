import type { SchemaTypeDefinition } from "sanity";

import { agentProfile } from "./documents/agentProfile";
import { brokerage } from "./documents/brokerage";
import { contactPage } from "./documents/contactPage";
import { homePage } from "./documents/homePage";
import { marketStatistics } from "./documents/marketStatistics";
import { property } from "./documents/property";
import { serviceArea } from "./documents/serviceArea";
import { propertiesPage } from "./documents/propertiesPage";
import { siteSettings } from "./documents/siteSettings";
import { source } from "./documents/source";
import { specialty } from "./documents/specialty";
import { testimonial } from "./documents/testimonial";

import { cta, navLink, postalAddress, profileLink, ratingSummary, serviceItem } from "./objects/common";
import { credential } from "./objects/credential";
import { imageWithMeta } from "./objects/imageWithMeta";
import { seo } from "./objects/seo";
import { consistencyCheck, priceBand, productionWindow, statSet } from "./objects/statistics";
import { verifiedNumber, verifiedText } from "./objects/verified";

/**
 * Mapping from the twelve collections in content_seed.json:
 *
 *  agent_profile        → agentProfile (singleton) + credential[] + profileLink[]
 *  brokerage_details    → brokerage (singleton, referenced by agentProfile)
 *  agent_experience     → agentProfile.yearsExperience + marketStatistics.windows
 *  agent_specialties    → specialty (one document each)
 *  service_areas        → serviceArea (one document each)
 *  sold_properties ┐
 *  active_listings ┴──→ property (one type; `status` + `recordTier` keep sold /
 *                       active / pending / rental / partial records distinct)
 *  price_statistics     → marketStatistics (singleton)
 *  testimonials         → testimonial (one document each; unpublished by default)
 *  professional_links   → agentProfile.links[] (profileLink)
 *  media_assets         → imageWithMeta metadata on the slot each image is meant
 *                         for (+ docs/asset-manifest.json); no files imported
 *  source_references    → source (one document each, referenced everywhere)
 *  meta                 → siteSettings.dataProvenance
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  seo,
  imageWithMeta,
  verifiedText,
  verifiedNumber,
  credential,
  productionWindow,
  priceBand,
  statSet,
  consistencyCheck,
  profileLink,
  postalAddress,
  ratingSummary,
  navLink,
  cta,
  serviceItem,
  // documents
  homePage,
  propertiesPage,
  contactPage,
  siteSettings,
  agentProfile,
  brokerage,
  specialty,
  serviceArea,
  property,
  testimonial,
  marketStatistics,
  source,
];
