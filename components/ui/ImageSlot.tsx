import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import type { ImageDTO } from "@/types/content";

import { PropertyGlyph, type GlyphName } from "./PropertyGlyph";

export type MaterialName = "plaster" | "travertine" | "walnut" | "leather" | "stone";

interface ImageSlotProps {
  /** A cleared, uploaded photograph — or null to show the material fallback. */
  image?: ImageDTO | null;
  material?: MaterialName;
  glyph?: GlyphName;
  sizes: string;
  /** Hero / above-the-fold image: preload + eager. */
  priority?: boolean;
  className?: string;
  /** Extra attributes for the motion layer (e.g. data-parallax). */
  dataAttrs?: Record<string, string | number | boolean | undefined>;
}

/**
 * Every picture slot on the site goes through this component.
 *
 * It renders a real photograph when one has been uploaded AND its rights are
 * cleared (that check happens in lib/sanity/image.ts). Otherwise it renders a
 * tactile material surface (plaster, travertine, walnut …) with an optional
 * line-art glyph. The box is identical either way, so adding a photo later never
 * changes the layout.
 */
export function ImageSlot({ image, material = "plaster", glyph, sizes, priority, className, dataAttrs }: ImageSlotProps) {
  if (image) {
    return (
      <div className={cn("media", className)} {...dataAttrs}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          preload={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          placeholder={image.blurDataURL ? "blur" : "empty"}
          blurDataURL={image.blurDataURL}
          quality={85} /* photographs: the highest quality next.config allows (60/75/85) */
          style={{ objectPosition: image.objectPosition }}
        />
      </div>
    );
  }
  return (
    <div className={cn("material", className)} data-material={material} {...dataAttrs}>
      {glyph ? <PropertyGlyph name={glyph} /> : null}
    </div>
  );
}

/** A deterministic material per property type so cards feel varied but stable. */
export function materialForCategory(category: string): MaterialName {
  switch (category) {
    case "condo":
      return "travertine";
    case "townhouse":
      return "plaster";
    case "house":
      return "stone";
    case "multifamily":
      return "leather";
    default:
      return "plaster";
  }
}
