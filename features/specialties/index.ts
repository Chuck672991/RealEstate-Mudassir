import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { SPECIALTIES_QUERY } from "@/lib/sanity/queries";
import type { SpecialtyDTO } from "@/types/content";

import { shapeSpecialties, type RawSpecialty } from "./shape";

/** Only specialties the research found supported (`safeToFeature` + verified). */
export async function getSpecialties(): Promise<SpecialtyDTO[]> {
  return shapeSpecialties(await fetchContent<RawSpecialty[]>(SPECIALTIES_QUERY));
}
