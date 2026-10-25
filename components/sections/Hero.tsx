import { CircleButton } from "@/components/ui/CircleButton";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { AgentDTO, HomeDTO } from "@/types/content";

/**
 * HERO — a pinned “dolly”.
 *
 * Concept: a warm leather wall with a lit arched doorway. As you scroll, the
 * type drifts up faster than the wall (parallax), then the camera pushes into the
 * doorway until its light fills the screen — and the cream arch panel of the next
 * section rises over it with no seam. (Reference: hero dolly, §S1.2 + arch rise.)
 *
 * The doorway shows the agent's portrait once a cleared photo exists; until then
 * it is a plain lit interior. Layout is identical either way.
 */
export function Hero({ home, agent }: { home: HomeDTO; agent: AgentDTO }) {
  const accessibleName = [home.heroLine1, home.heroLine2].filter(Boolean).join(" ");

  return (
    <section id="top" className="hero" data-section="hero" data-bg="dark" aria-labelledby="hero-title">
      <div className="hero__area" data-pin-area="hero">
        <div className="hero__sticky">
          <div className="hero__bg" data-hero-bg="">
            <div className="hero__wall material" data-material="leather" />
            <div className="hero__doorway" data-hero-doorway="">
              <ImageSlot
                image={agent.headshot}
                material="plaster"
                sizes="(min-width: 992px) 60vw, 100vw" /* the doorway is 30vw and zooms ×2 */
                priority
                className="hero__doorway-media"
              />
              <span className="hero__doorway-veil" aria-hidden="true" />
              <span className="hero__doorway-light" aria-hidden="true" />
            </div>
          </div>

          <div className="hero__stage" data-hero-stage="">
            {home.heroEyebrow ? (
              <p className="hero__eyebrow t-label" data-reveal="ctn">
                {home.heroEyebrow}
              </p>
            ) : null}

            <h1 id="hero-title" className="hero__title">
              <span className="sr-only">
                {accessibleName}
                {home.heroAccent ? ` — ${home.heroAccent}` : ""}
              </span>
              <span className="hero__title-visual" aria-hidden="true">
                <RevealText as="span" mode="h" text={home.heroLine1} className="hero__line t-display t-h1" srText={false} />
                <RevealText
                  as="span"
                  mode="h"
                  text={home.heroLine2}
                  className="hero__line t-display t-h1"
                  srText={false}
                  delay={0.1}
                />
                {home.heroAccent ? (
                  <RevealText
                    as="span"
                    mode="a"
                    text={home.heroAccent}
                    className="hero__accent t-accent t-accent-lg"
                    srText={false}
                    delay={0.5}
                  />
                ) : null}
              </span>
            </h1>

            <div className="hero__foot">
              <div className="hero__foot-copy">
                {home.heroSubheading ? (
                  <p
                    className="hero__sub t-body"
                    data-reveal="ctn"
                    style={{ "--rd": "calc(var(--delay-reveal) + 0.4s)" } as React.CSSProperties}
                  >
                    {home.heroSubheading}
                  </p>
                ) : null}

                {agent.languages.length ? (
                  <p
                    className="hero__meta t-label"
                    data-reveal="ctn"
                    style={{ "--rd": "calc(var(--delay-reveal) + 0.55s)" } as React.CSSProperties}
                  >
                    <span className="sr-only">Languages: </span>
                    {agent.languages.join(" · ")}
                  </p>
                ) : null}
              </div>

              {home.heroPrimaryCta ? (
                <div
                  className="hero__cta"
                  data-reveal="ctn"
                  style={{ "--rd": "calc(var(--delay-reveal) + 0.7s)" } as React.CSSProperties}
                >
                  <CircleButton href={home.heroPrimaryCta.href} tone="dark">
                    {home.heroPrimaryCta.label}
                  </CircleButton>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
