import { text } from "@/features/content/policy";
import { toSeo, type RawSeo } from "@/features/site/shape";
import type { ContactPageDTO, PropertiesPageDTO } from "@/types/content";

export interface RawPropertiesPage {
  heading?: string | null;
  intro?: string | null;
  emptyMessage?: string | null;
  seo?: RawSeo | null;
}

export interface RawContactPage {
  heading?: string | null;
  intro?: string | null;
  formHeading?: string | null;
  privacyNote?: string | null;
  seo?: RawSeo | null;
}

/** Safe defaults let the pages render before their documents exist. */
export function shapePropertiesPage(raw: RawPropertiesPage | null | undefined): PropertiesPageDTO {
  return {
    heading: text(raw?.heading) ?? "Homes",
    intro: text(raw?.intro),
    emptyMessage: text(raw?.emptyMessage) ?? "There are no homes to show right now.",
    seo: toSeo(raw?.seo),
  };
}

export function shapeContactPage(raw: RawContactPage | null | undefined): ContactPageDTO {
  return {
    heading: text(raw?.heading) ?? "Contact",
    intro: text(raw?.intro),
    formHeading: text(raw?.formHeading) ?? "Send a message",
    privacyNote: text(raw?.privacyNote),
    seo: toSeo(raw?.seo),
  };
}
