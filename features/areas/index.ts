import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { SERVICE_AREAS_QUERY } from "@/lib/sanity/queries";
import type { ServiceAreaDTO } from "@/types/content";

import { shapeAreas, type RawArea } from "./shape";

export async function getServiceAreas(): Promise<ServiceAreaDTO[]> {
  return shapeAreas(await fetchContent<RawArea[]>(SERVICE_AREAS_QUERY));
}
