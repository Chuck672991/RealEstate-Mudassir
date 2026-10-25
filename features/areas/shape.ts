import { opt, text } from "@/features/content/policy";
import { toImage, type RawImage } from "@/lib/sanity/image";
import type { ServiceAreaDTO } from "@/types/content";

export interface RawArea {
  _id: string;
  name?: string | null;
  slug?: string | null;
  role?: string | null;
  summary?: string | null;
  closedSales5y?: number | null;
  shareOf100?: number | null;
  image?: RawImage | null;
}

export const shapeAreas = (raw: RawArea[] | null | undefined): ServiceAreaDTO[] =>
  (raw ?? [])
    .filter((a) => !!a.name)
    .map((a) => ({
      id: a._id,
      name: a.name!,
      slug: a.slug ?? a._id,
      role: text(a.role),
      summary: text(a.summary),
      closedSales5y: opt(a.closedSales5y),
      sharePercent: a.shareOf100 != null ? Math.round(a.shareOf100 * 100) : undefined,
      image: toImage(a.image, `${a.name}, Illinois`),
      isOffice: /office/i.test(a.role ?? ""),
    }));
