import { Monogram } from "@/components/ui/Monogram";
import { RevealText } from "@/components/ui/RevealText";

/**
 * First-visit arrival, shown once per tab session on the home page only (≈ 4 s).
 *
 * The hero is ALREADY fully rendered underneath. This overlay is a burgundy sheet with an
 * arch-shaped HOLE in it (a CSS mask, see styles/structure/chrome.css): the arch parks below
 * the fold, dips, rises into the middle, then widens past the viewport until the sheet is gone.
 * The hero never enters, zooms or moves as part of the reveal.
 *
 * Hidden unless <html class="intro-on"> (set before first paint by the pre-paint script), so
 * without JS — or for reduced-motion visitors — it never exists. Decorative: aria-hidden,
 * inert, skippable (any key, click or scroll). Sequencing: components/motion/engine/intro.ts.
 */
export function Intro({ name, line }: { name: string; line: string }) {
  return (
    <div className="intro" data-intro="" aria-hidden="true">
      <div className="intro__veil" data-intro-veil="">
        <Monogram className="intro__watermark" />
      </div>
      {/* two thin outlines that frame the opening, just outside it */}
      <div className="intro__arch intro__arch--outer" />
      <div className="intro__arch intro__arch--inner" />
      <div className="intro__lockup" data-intro-lockup="">
        <Monogram className="intro__mark" />
        <RevealText as="p" mode="h" text={name} className="t-display t-h3 intro__name" srText={false} />
        <p className="t-label intro__line" data-reveal="ctn">
          {line}
        </p>
      </div>
      <div className="intro__progress" data-intro-progress="" />
    </div>
  );
}
