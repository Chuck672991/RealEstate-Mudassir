import { CircleButton } from "@/components/ui/CircleButton";
import { Flower } from "@/components/ui/Flower";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { AgentDTO, HomeDTO, ImageDTO } from "@/types/content";

/** “How Mudassir works” → lines ["How", "Mudassir"] + accent "works". */
function splitHeading(text: string): { lines: string[]; accent?: string } {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return { lines: words };
  return { lines: words.slice(0, -1), accent: words[words.length - 1] };
}

/**
 * HOW HE WORKS — the reference's “the space to live in”, laid out to its measured proportions (every
 * size below is a share of the viewport width, so the composition scales as a whole):
 *
 *  • a cream DOME that rises over the sold stage, 17 vw of air above the title;
 *  • the title: one condensed capital word per line at 12 vw, centred, with ONE flowing italic
 *    accent word the same size tucked under the last line and tilted so its baseline rises — the
 *    characters flip in as it enters the viewport (CSS reveal, plays once);
 *  • LEFT, flush with the page edge: a burgundy block (40 vw wide, 3:4) holding a framed 3:4 photograph
 *    (23 vw) with a bougainvillea clip over the block's top-right corner, and — beneath it — a small
 *    bold list of the languages spoken;
 *  • RIGHT, flush with the other edge and ≈ 15 vw higher: a 4:3 photograph (40 vw), then a short
 *    uppercase statement whose first line is indented to the photo's left edge, a small paragraph
 *    (the services) and one round button;
 *  • the two photographs drift in opposite directions as you scroll (they cross and separate —
 *    nothing is pinned).
 *
 * The photographs are the two highest-resolution published homes (chosen on the page); with fewer
 * than two the missing block is simply omitted and the copy keeps its place.
 */
export function HowIWork({ home, agent, photos = [] }: { home: HomeDTO; agent: AgentDTO; photos?: ImageDTO[] }) {
  if (!home.services.length && !agent.languages.length) return null;
  const { lines, accent } = splitHeading(home.howHeading ?? "How Mudassir works");
  const [left, right] = photos;
  const cta = home.heroPrimaryCta ?? { label: "View current homes", href: "/properties" };

  return (
    <section id="how" className="how" data-section="how" aria-labelledby="how-h">
      <div className="arch-panel how__panel" data-bg="color">
        <h2 id="how-h" className="how__title">
          <span className="sr-only">{home.howHeading ?? "How Mudassir works"}</span>
          <span aria-hidden="true" className="how__title-visual">
            {lines.map((l, i) => (
              <RevealText key={l} as="span" mode="h" text={l} className="how__line t-display t-h1" srText={false} delay={i * 0.25} />
            ))}
            {accent ? (
              <RevealText as="span" mode="top" text={accent} className="how__accent t-accent" srText={false} delay={Math.max(0, lines.length * 0.25 - 0.3)} />
            ) : null}
          </span>
        </h2>

        <div className="how__stage" data-photos={[left, right].filter(Boolean).length}>
          {/* the whole left column drifts, so the block and the list under it stay together */}
          <div className="how__col how__col--l" data-drift={left ? "fwd" : undefined}>
            {left ? (
              <div className="how__img how__img--l" data-bg="dark">
                <Flower clip={6} placement="living" />
                <div className="how__frame">
                  <ImageSlot image={left} sizes="(min-width: 992px) 24vw, 80vw" className="how__photo how__photo--l" />
                </div>
              </div>
            ) : null}
            {agent.languages.length ? (
              <div className="how__langs" data-reveal="ctn">
                <p>Languages spoken:</p>
                <ul role="list">
                  {agent.languages.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="how__col how__col--r">
            {right ? (
              <div className="how__img how__img--r" data-drift="rev" data-bg="dark" data-scrim="">
                <ImageSlot image={right} sizes="(min-width: 992px) 40vw, 100vw" className="how__photo how__photo--r" />
              </div>
            ) : null}
            <div className="how__copy">
              {home.howIntro ? (
                <p className="how__statement t-display" data-reveal="ctn">
                  {home.howIntro}
                </p>
              ) : null}
              {home.services.length ? (
                <ul role="list" className="how__services">
                  {home.services.map((s, i) => (
                    <li key={s.title} data-reveal="ctn" style={{ "--rd": `calc(var(--delay-reveal) + ${i * 0.08}s)` } as React.CSSProperties}>
                      <strong>{s.title}.</strong>
                      {s.body ? <> {s.body}</> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="how__cta">
                <CircleButton href={cta.href} tone="light">
                  {cta.label}
                </CircleButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
