import { slugify } from "@/lib/utils/format";

/**
 * Stable document IDs. Re-running the seed always addresses the same documents,
 * so it can never create duplicates.
 *
 * IMPORTANT: Sanity treats any ID containing a "." as a PRIVATE document (it is
 * invisible to public API reads). IDs here therefore only use letters, digits,
 * "-" and "_".
 */
export const ids = {
  agentProfile: "agentProfile",
  brokerage: "brokerage",
  homePage: "homePage",
  propertiesPage: "propertiesPage",
  contactPage: "contactPage",
  siteSettings: "siteSettings",
  marketStatistics: "marketStatistics",
  property: (recordId: string) => `property-${recordId.toLowerCase()}`,
  testimonial: (n: number) => `testimonial-${String(n).padStart(3, "0")}`,
  specialty: (name: string) => `specialty-${slugify(name)}`,
  serviceArea: (name: string) => `serviceArea-${slugify(name)}`,
  source: (sourceId: string) => `source-${sourceId.toLowerCase()}`,
} as const;

const VALID_ID = /^[A-Za-z0-9_-]+$/;
export function assertValidId(id: string): string {
  if (!VALID_ID.test(id)) throw new Error(`Invalid Sanity document id: "${id}"`);
  return id;
}
