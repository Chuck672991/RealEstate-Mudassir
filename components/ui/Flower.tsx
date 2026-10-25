import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";
import { flowerClip } from "@/lib/flower";

/**
 * A spray of bougainvillea: a looped, muted video with a transparent background (lib/flower.ts).
 *
 * Purely decorative: aria-hidden, not focusable, never intercepts the pointer, no controls. It is
 * a CHILD of the section it decorates (absolutely positioned by that section's own CSS,
 * `.flower--<placement>` in styles/structure/flowers.css), so it moves and scales with whatever
 * that section does — a sticky stage, a sideways track, an image column.
 *
 * Playback: nothing plays until the motion layer says so (engine/live.ts plays the clip while it
 * is within a quarter of a screen of the viewport and pauses it otherwise). `preload="none"`, so no
 * clip is fetched until then; the poster (the first frame, with its transparency) stands in meanwhile.
 * Without JavaScript, or with reduced motion, the poster is all that is ever shown.
 *
 * Sources: the HEVC-alpha `.mov` is listed FIRST under a QuickTime type that only Safari claims to
 * play, so Chrome and Firefox skip it and take the WebM; Safari takes the `.mov`.
 *
 * If the clip has not been supplied (lib/flower.ts) nothing is rendered.
 */
export function Flower({
  clip,
  placement,
  parallax,
  travel,
  className,
  style,
}: {
  /** 1–7: which of the supplied clips. */
  clip: number;
  /** Names the CSS placement rule, e.g. "areas-intro" → `.flower--areas-intro`. */
  placement: string;
  /** Scrubbed vertical drift across its pass through the viewport: "fwd" −10% → +10%, "rev" the reverse. */
  parallax?: "fwd" | "rev";
  /** Driven by the sideways chapter's scroll instead (engine/home.ts → areasChapter). */
  travel?: "intro" | "mid" | "end";
  className?: string;
  style?: CSSProperties;
}) {
  const media = flowerClip(clip);
  if (!media) return null;

  return (
    <div
      className={cn("flower", `flower--${placement}`, className)}
      data-flower={clip}
      data-parallax={parallax}
      data-travel={travel}
      style={style}
      aria-hidden="true"
    >
      <video
        className="flower__video"
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        width={media.width}
        height={media.height}
        poster={media.poster}
      >
        <source src={media.mov} type='video/quicktime; codecs="hvc1"' />
        <source src={media.webm} type="video/webm" />
      </video>
    </div>
  );
}
