import { CircleButton } from "@/components/ui/CircleButton";
import { Flower } from "@/components/ui/Flower";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { AgentDTO, HomeDTO, ImageDTO } from "@/types/content";

const pad = (n: number) => String(n).padStart(2, "0");

/** “How Mudassir works” → lines ["How", "Mudassir"] + accent "works". */
function splitHeading(text: string): { lines: string[]; accent?: string } {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return { lines: words };
  return { lines: words.slice(0, -1), accent: words[words.length - 1] };
}

/**
 * HOW HE WORKS — the reference's “The space to Live in”.
 *
 *  • a cream DOME (semicircular top) that rises over the dark sold stage;
 *  • the title: one condensed capital word per line at display size, centred, with ONE
 *    flowing italic accent word the same size tucked under the last line so it overlaps
 *    it — the characters flip in as it enters the viewport (CSS reveal, plays once);
 *  • two tall photographs that drift in opposite directions as you scroll (they cross and
 *    separate — nothing is pinned): the left framed in burgundy with a flower over its
 *    top-right corner, the right carrying a short description and a round button;
 *  • then the services and the languages.
 *
 * The photographs are the two highest-resolution published homes (chosen on the page);
 * with fewer than two, the columns are simply omitted and the section reads as before.
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

        {left || right ? (
          <div className="how__imgs">
            {left ? (
              <div className="how__img how__img--l" data-drift="fwd">
                <Flower clip={6} placement="living" />
                <div className="how__frame">
                  <ImageSlot image={{ ...left, alt: left.alt }} sizes="(min-width: 992px) 40vw, 92vw" className="how__photo" />
                </div>
              </div>
            ) : null}
            {right ? (
              <div className="how__img how__img--r" data-drift="rev">
                <ImageSlot image={right} sizes="(min-width: 992px) 46vw, 92vw" className="how__photo" />
                <div className="how__note">
                  {home.howIntro ? (
                    <p className="t-body" data-reveal="ctn">
                      {home.howIntro}
                    </p>
                  ) : null}
                  <CircleButton href={cta.href} tone="light">
                    {cta.label}
                  </CircleButton>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="how__cols">
          {home.services.length ? (
            <div className="how__services">
              {home.howIntro && !right ? (
                <p className="t-display t-h5" data-reveal="ctn">
                  {home.howIntro}
                </p>
              ) : null}
              <ol role="list" className="service-list">
                {home.services.map((s, i) => (
                  <li key={s.title} data-reveal="ctn" style={{ "--rd": `calc(var(--delay-reveal) + ${i * 0.08}s)` } as React.CSSProperties}>
                    <span className="t-label t-muted">{pad(i + 1)}</span>
                    <h3 className="t-display t-h6">{s.title}</h3>
                    {s.body ? <p className="t-body">{s.body}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <aside className="how__aside">
            {agent.languages.length ? (
              <div className="how__languages" data-reveal="ctn">
                <p className="t-label t-muted">Languages</p>
                <p className="t-display t-h3 tabular">{agent.languages.length}</p>
                <ul role="list" className="t-body">
                  {agent.languages.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <CircleButton href="/contact" tone="light" openContact>
              Book a call
            </CircleButton>
          </aside>
        </div>
      </div>
    </section>
  );
}
