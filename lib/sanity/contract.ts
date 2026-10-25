/**
 * COMPILE-TIME CONTRACT between the CMS and the app.
 *
 * `sanity/sanity.types.ts` is GENERATED (npm run typegen) from the Studio schemas and
 * the GROQ queries in lib/sanity/queries.ts, so it states exactly what each query
 * returns. The `Raw*` shapes in features/* are what the data-access layer expects.
 * The checks below fail `tsc` if a schema or query change would hand the shaping code
 * something it does not handle — e.g. a field renamed in the Studio, or a number that
 * became a string — long before it can reach a page.
 *
 * Types only: this file produces no JavaScript.
 */
import type { RawAgent } from "@/features/agent/shape";
import type { RawArea } from "@/features/areas/shape";
import type { RawHome } from "@/features/home/shape";
import type { RawContactPage, RawPropertiesPage } from "@/features/pages/shape";
import type { RawProperty } from "@/features/properties/dto";
import type { RawSiteSettings } from "@/features/site/shape";
import type { RawSpecialty } from "@/features/specialties/shape";
import type { RawStats } from "@/features/stats/shape";
import type { RawTestimonial } from "@/features/testimonials/shape";
import type {
  AGENT_QUERY_RESULT,
  CONTACT_PAGE_QUERY_RESULT,
  HOME_QUERY_RESULT,
  MARKET_STATS_QUERY_RESULT,
  PROPERTIES_PAGE_QUERY_RESULT,
  PROPERTY_BY_SLUG_QUERY_RESULT,
  PUBLIC_PROPERTIES_QUERY_RESULT,
  SERVICE_AREAS_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  SPECIALTIES_QUERY_RESULT,
  TESTIMONIALS_QUERY_RESULT,
} from "@/sanity/sanity.types";

type Extends<Actual, Expected> = [Actual] extends [Expected] ? true : false;
type Expect<T extends true> = T;

export type CmsContract = [
  Expect<Extends<SITE_SETTINGS_QUERY_RESULT, RawSiteSettings | null>>,
  Expect<Extends<AGENT_QUERY_RESULT, RawAgent | null>>,
  Expect<Extends<HOME_QUERY_RESULT, RawHome | null>>,
  Expect<Extends<PROPERTIES_PAGE_QUERY_RESULT, RawPropertiesPage | null>>,
  Expect<Extends<CONTACT_PAGE_QUERY_RESULT, RawContactPage | null>>,
  Expect<Extends<SPECIALTIES_QUERY_RESULT, RawSpecialty[]>>,
  Expect<Extends<SERVICE_AREAS_QUERY_RESULT, RawArea[]>>,
  Expect<Extends<PUBLIC_PROPERTIES_QUERY_RESULT, RawProperty[]>>,
  Expect<Extends<NonNullable<PROPERTY_BY_SLUG_QUERY_RESULT>, RawProperty>>,
  Expect<Extends<TESTIMONIALS_QUERY_RESULT, RawTestimonial[]>>,
  Expect<Extends<MARKET_STATS_QUERY_RESULT, RawStats | null>>,
];
