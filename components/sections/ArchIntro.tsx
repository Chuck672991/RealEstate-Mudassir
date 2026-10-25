import type { CSSProperties } from "react";

import { Reveal } from "@/components/ui/RevealText";

/**
 * ARCH INTRO — the cream, semicircle-topped panel that rises over the hero.
 * Three short words sit along the arch like spokes of a wheel; as you scroll the
 * motion layer fans them apart (the reference spreads word-spacing along an arc).
 * Real DOM text, so it stays selectable and readable by assistive tech.
 */
export function ArchIntro({ words, caption }: { words: string[]; caption?: string }) {
  if (!words.length) return null;
  return (
    <div className="arch-intro" data-section="arch-intro">
      <div className="arch-panel" data-bg="color">
        <div className="arc-words" data-arc-words="" style={{ "--n": words.length } as CSSProperties}>
          {words.map((word, i) => (
            <span key={word} className="arc-spoke" style={{ "--i": i } as CSSProperties}>
              <span className="arc-word t-display t-h4">{word}</span>
            </span>
          ))}
        </div>

        <div className="arch-intro__foot">
          <Reveal mode="line" className="hairline hairline--v" />
          {caption ? (
            <p className="t-label" data-reveal="ctn">
              {caption}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
