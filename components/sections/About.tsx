import { ImageSlot } from "@/components/ui/ImageSlot";
import { Prose } from "@/components/ui/Prose";
import { RevealText } from "@/components/ui/RevealText";
import { PropertyGlyph } from "@/components/ui/PropertyGlyph";
import type { AgentDTO } from "@/types/content";

/**
 * ABOUT — the reference's pull-quote-over-photograph moment, as a dark timber
 * plate with a parallax material layer and one large statement. The biography
 * beneath comes from the agent profile (the single source of truth for that copy).
 */
export function About({ statement, agent }: { statement?: string; agent: AgentDTO }) {
  const hasBio = Array.isArray(agent.bio) && agent.bio.length > 0;
  if (!statement && !hasBio) return null;
  const office = agent.brokerage?.address;

  return (
    <section id="about" className="about" data-section="about" data-bg="dark" aria-labelledby="about-h">
      <div className="about__plate" aria-hidden="true">
        <ImageSlot material="walnut" sizes="100vw" className="about__material" dataAttrs={{ "data-parallax": "plate" }} />
        <PropertyGlyph name="arch" className="material__glyph about__glyph" />
      </div>

      <div className="about__inner">
        {agent.headshot ? (
          <figure className="about__portrait" data-reveal="slide">
            <div className="rv-slide-inner">
              <ImageSlot image={agent.headshot} sizes="(min-width: 992px) 45vw, 90vw" className="about__portrait-media" />
            </div>
          </figure>
        ) : null}

        <div className="about__copy">
          <h2 id="about-h" className="t-label about__label" data-reveal="ctn">
            About {agent.displayName}
          </h2>
          {statement ? <RevealText as="p" mode="w" text={statement} className="about__statement t-display t-h4" /> : null}

          <div className="about__cols">
            {hasBio ? <Prose value={agent.bio} className="about__bio t-body" /> : null}
            <dl className="about__facts" data-reveal="ctn">
              {agent.yearsExperience ? (
                <div>
                  <dt className="t-label">Experience</dt>
                  <dd>
                    {agent.yearsExperience} years <span className="t-small t-muted">(as stated by Mudassir)</span>
                  </dd>
                </div>
              ) : null}
              {agent.languages.length ? (
                <div>
                  <dt className="t-label">Languages</dt>
                  <dd>{agent.languages.join(", ")}</dd>
                </div>
              ) : null}
              {agent.propertyTypes.length ? (
                <div>
                  <dt className="t-label">Property types</dt>
                  <dd>{agent.propertyTypes.join(", ")}</dd>
                </div>
              ) : null}
              {agent.brokerage?.name ? (
                <div>
                  <dt className="t-label">Brokerage</dt>
                  <dd>
                    {agent.brokerage.name}
                    {office?.city ? `, ${office.city}, ${office.state}` : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
