import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { TESTIMONIALS_QUERY } from "@/lib/sanity/queries";
import type { TestimonialDTO } from "@/types/content";

import { shapeTestimonials, type RawTestimonial } from "./shape";

export async function getTestimonials(limit = 6): Promise<TestimonialDTO[]> {
  return shapeTestimonials(await fetchContent<RawTestimonial[]>(TESTIMONIALS_QUERY), limit);
}
