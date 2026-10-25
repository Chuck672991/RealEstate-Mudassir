import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/lib/sanity/queries";
import type { SiteSettingsDTO } from "@/types/content";

import { shapeSiteSettings, type RawSiteSettings } from "./shape";

export { toLinks, toSeo } from "./shape";

export async function getSiteSettings(): Promise<SiteSettingsDTO> {
  return shapeSiteSettings(await fetchContent<RawSiteSettings | null>(SITE_SETTINGS_QUERY));
}
