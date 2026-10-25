import { text } from "@/features/content/policy";
import type { SpecialtyDTO } from "@/types/content";

export interface RawSpecialty {
  _id: string;
  name?: string | null;
  slug?: string | null;
  summary?: string | null;
}

export const shapeSpecialties = (raw: RawSpecialty[] | null | undefined): SpecialtyDTO[] =>
  (raw ?? [])
    .filter((s) => !!s.name)
    .map((s) => ({ id: s._id, name: s.name!, slug: s.slug ?? s._id, summary: text(s.summary) }));
