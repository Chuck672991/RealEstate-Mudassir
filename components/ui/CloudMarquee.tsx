import Image from "next/image";

/**
 * One layer of drifting clouds: a row of transparent cloud strips that slides LEFT, forever.
 *
 * Pure CSS and time-based (not scroll-linked) — it keeps drifting while you stand still.
 * Construction (see styles/structure/sections/horizon.css): a track holds two identical
 * lists of four strips; the track slides by exactly one list (−50 %), so the loop has no
 * seam. Every second strip is flipped vertically so the repetition is hard to spot. The
 * three layers share one period, but their strips are different widths, so their speeds
 * differ in proportion — three depths with no extra code.
 *
 * Decorative: aria-hidden, no alt text, never intercepts the pointer.
 */
export const CLOUD_STRIPS = {
  a: { src: "/clouds/cloud-a.webp", width: 1400, height: 778 },
  b: { src: "/clouds/cloud-b.webp", width: 1400, height: 747 },
  c: { src: "/clouds/cloud-c.webp", width: 1400, height: 869 },
} as const;

export function CloudMarquee({ layer }: { layer: keyof typeof CLOUD_STRIPS }) {
  const strip = CLOUD_STRIPS[layer];
  const list = (copy: number) => (
    <div className="clouds__list" key={copy} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <Image
          key={i}
          src={strip.src}
          width={strip.width}
          height={strip.height}
          alt=""
          unoptimized
          loading="lazy"
          decoding="async"
          className="clouds__strip"
        />
      ))}
    </div>
  );
  return (
    <div className={`clouds clouds--${layer}`} aria-hidden="true" data-live-watch="">
      <div className="clouds__track">
        {list(0)}
        {list(1)}
      </div>
    </div>
  );
}
