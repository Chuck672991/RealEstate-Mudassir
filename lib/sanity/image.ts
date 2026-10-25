import { createImageUrlBuilder } from "@sanity/image-url";

import { dataset, projectId } from "@/sanity/lib/env";
import { IMAGE_PUBLISHABLE_RIGHTS, type RightsStatus } from "@/sanity/lib/enums";
import type { ImageDTO } from "@/types/content";

/** Raw image field exactly as projected by IMAGE in lib/sanity/queries.ts. */
export interface RawImage {
  alt?: string | null;
  decorative?: boolean | null;
  caption?: string | null;
  credit?: string | null;
  rightsStatus?: string | null;
  hotspot?: { x?: number; y?: number; width?: number; height?: number } | null;
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
  asset?: {
    _id: string;
    url?: string | null;
    metadata?: {
      lqip?: string | null;
      dimensions?: { width: number | null; height: number | null } | null;
    } | null;
  } | null;
}

let builder: ReturnType<typeof createImageUrlBuilder> | null = null;
const getBuilder = () => (builder ??= createImageUrlBuilder({ projectId, dataset }));

const MAX_WIDTH = 2400;

/** Asset ids of the form `local:/photos/x.jpg` point at a file under public/. */
export const LOCAL_ASSET_PREFIX = "local:";

/**
 * Raw CMS image → renderable DTO, or null.
 *
 * Returns null when there is no uploaded file, or when its recorded usage rights
 * do not allow publication ("pending" / "not cleared"). A site visitor therefore
 * never sees an image whose rights were not affirmatively confirmed, even if an
 * editor published the document.
 */
export function toImage(raw: RawImage | null | undefined, fallbackAlt = ""): ImageDTO | null {
  if (!raw?.asset?._id) return null;
  if (!IMAGE_PUBLISHABLE_RIGHTS.includes((raw.rightsStatus ?? "") as RightsStatus)) return null;

  const dims = raw.asset.metadata?.dimensions;
  if (!dims?.width || !dims.height) return null;

  // A file in public/photos (local-content mode, content/local-images.json): served by
  // next/image from this site, not the Sanity CDN, so there is no URL to build.
  if (raw.asset._id.startsWith(LOCAL_ASSET_PREFIX)) {
    const hs = raw.hotspot;
    return {
      src: raw.asset._id.slice(LOCAL_ASSET_PREFIX.length),
      width: dims.width,
      height: dims.height,
      alt: raw.decorative ? "" : (raw.alt?.trim() || fallbackAlt),
      caption: raw.caption ?? undefined,
      credit: raw.credit ?? undefined,
      objectPosition: hs && hs.x != null && hs.y != null ? `${(hs.x * 100).toFixed(1)}% ${(hs.y * 100).toFixed(1)}%` : undefined,
    };
  }
  const crop = raw.crop;
  const width = Math.round(dims.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0)));
  const height = Math.round(dims.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)));
  const hotspot =
    raw.hotspot && raw.hotspot.x != null && raw.hotspot.y != null
      ? { x: raw.hotspot.x, y: raw.hotspot.y, width: raw.hotspot.width ?? 1, height: raw.hotspot.height ?? 1 }
      : null;

  const src = getBuilder()
    .image({
      _type: "image",
      asset: { _type: "reference", _ref: raw.asset._id },
      ...(crop ? { crop: { top: crop.top ?? 0, bottom: crop.bottom ?? 0, left: crop.left ?? 0, right: crop.right ?? 0 } } : {}),
      ...(hotspot ? { hotspot } : {}),
    })
    .width(Math.min(MAX_WIDTH, width))
    .fit("max")
    .auto("format")
    .url();

  return {
    src,
    width: Math.min(MAX_WIDTH, width),
    height: Math.round((height / width) * Math.min(MAX_WIDTH, width)),
    alt: raw.decorative ? "" : (raw.alt?.trim() || fallbackAlt),
    blurDataURL: raw.asset.metadata?.lqip ?? undefined,
    caption: raw.caption ?? undefined,
    credit: raw.credit ?? undefined,
    objectPosition: hotspot ? `${(hotspot.x * 100).toFixed(1)}% ${(hotspot.y * 100).toFixed(1)}%` : undefined,
  };
}
