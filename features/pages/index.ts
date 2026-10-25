import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { CONTACT_PAGE_QUERY, PROPERTIES_PAGE_QUERY } from "@/lib/sanity/queries";
import type { ContactPageDTO, PropertiesPageDTO } from "@/types/content";

import { shapeContactPage, shapePropertiesPage, type RawContactPage, type RawPropertiesPage } from "./shape";

export async function getPropertiesPage(): Promise<PropertiesPageDTO> {
  return shapePropertiesPage(await fetchContent<RawPropertiesPage | null>(PROPERTIES_PAGE_QUERY));
}

export async function getContactPage(): Promise<ContactPageDTO> {
  return shapeContactPage(await fetchContent<RawContactPage | null>(CONTACT_PAGE_QUERY));
}
