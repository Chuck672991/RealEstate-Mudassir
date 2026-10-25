import { FooterContent, LegalStrip } from "@/components/layout/SiteFooter";
import { CircleButton } from "@/components/ui/CircleButton";
import { Flower } from "@/components/ui/Flower";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { AgentDTO, HomeDTO, ImageDTO } from "@/types/content";

/**
 * CLOSING SCENE → FOOTER (one pinned stage).
 *
 *  1. “Diptych”: two windows onto ONE photograph (it is one image seen through two
 *     openings, not two images) start offset on the cream page, slide into alignment,
 *     merge into a band, then the stage zooms to fill the screen. A pair of flower
 *     sprays in the bottom corners swells and flies outward during the zoom
 *     (the reference's architecture sequence; engine/home.ts → closingScene).
 *  2. The big closing word and the contact actions are revealed.
 *  3. “Iris”: the scene shrinks to an inset window while the plum footer — a
 *     single large phone number — fades and scales in behind it.
 *
 * Without motion (reduced-motion, mobile, no JS) this is simply the scene,
 * followed by the footer, in normal flow.
 *
 * The footer is a SIBLING of the CTA <section>, not a child, so it remains the
 * page's contentinfo landmark.
 */
export function CtaFooter({ home, agent, image }: { home: HomeDTO; agent: AgentDTO; image?: ImageDTO | null }) {
  const word = home.ctaGiantWord ?? "Let’s talk";
  const primary = home.ctaPrimary ?? { label: "Send a message", href: "/contact" };

  return (
    <>
      <div className="cta-wrap" data-pin-area="cta">
        <div className="cta-wrap__sticky">
          <section id="contact" className="cta" data-section="cta" data-scene={image ? "photo" : "art"} aria-labelledby="cta-h" data-footer-clip="">
            <div className="cta__plate" aria-hidden="true">
              <div className="cta__window" data-cta-window="" data-bg="dark" data-scrim="">
                <CtaScene image={image} />
              </div>
              <Flower clip={5} placement="windows-left" />
              <Flower clip={7} placement="windows-right" />
            </div>

            <div className="cta__content" data-cta-content="" data-manual-reveal="">
              {home.ctaHeading ? (
                <p className="cta__eyebrow t-label scrim" data-reveal="ctn">
                  {home.ctaHeading}
                </p>
              ) : null}
              <RevealText
                as="h2"
                mode="h"
                id="cta-h"
                text={word}
                className="cta__giant t-display"
                dataAttrs={{ "data-fit-text": "" }}
              />
              <div className="cta__row" data-reveal="ctn">
                {home.ctaBody ? <p className="t-body">{home.ctaBody}</p> : null}
                <div className="cta__actions">
                  <CircleButton href={primary.href} tone="dark" openContact>
                    {primary.label}
                  </CircleButton>
                  {agent.phone ? (
                    <a href={agent.phone.href} className="cta__phone t-label hit-slop">
                      <span className="sr-only">Call {agent.displayName}: </span>
                      {agent.phone.display}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <div className="cta-wrap__footer" data-footer-layer="">
            <FooterContent />
          </div>
        </div>
      </div>
      <LegalStrip />
    </>
  );
}

/**
 * The continuous scene both windows look onto: a photograph when one is available (decorative —
 * the closing words say what the section is), otherwise a leather wall with a glowing arched doorway.
 */
function CtaScene({ image }: { image?: ImageDTO | null }) {
  if (image) {
    return (
      <div className="cta-scene cta-scene--photo">
        <ImageSlot image={{ ...image, alt: "" }} sizes="100vw" className="cta-scene__photo" />
      </div>
    );
  }
  return (
    <div className="cta-scene">
      <div className="cta-scene__wall material" data-material="leather" />
      <div className="cta-scene__door" />
    </div>
  );
}
