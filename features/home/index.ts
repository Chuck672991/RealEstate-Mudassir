import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { HOME_QUERY } from "@/lib/sanity/queries";
import type { HomeDTO } from "@/types/content";

import { shapeHome, type RawHome } from "./shape";

export async function getHome(): Promise<HomeDTO> {
  return shapeHome(await fetchContent<RawHome | null>(HOME_QUERY));
}
