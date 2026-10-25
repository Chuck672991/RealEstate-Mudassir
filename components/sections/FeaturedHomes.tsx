import { PropertyFacts } from "@/components/properties/PropertyFacts";
import { ImageSlot, materialForCategory } from "@/components/ui/ImageSlot";
import { PillButton } from "@/components/ui/CircleButton";
import { RevealText } from "@/components/ui/RevealText";
import { Slider } from "@/components/ui/Slider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatLongDate } from "@/lib/utils/format";
import type { PropertyDTO } from "@/types/content";

/**
 * FEATURED HOMES — the reference's typologies slider (snap section, diagonal
 * curtain wipes, characters flipping in), showing homes that are for sale now.
 * Pending homes never appear here: only genuinely available listings.
 */
export function FeaturedHomes({ homes, heading, asOf }: { homes: PropertyDTO[]; heading?: string; asOf?: string }) {
  if (!homes.length) return null;
  const asOfLabel = formatLongDate(asOf ?? homes[0]?.asOf);

  return (
    <section id="homes" className="featured" data-section="homes" data-bg="color" data-snap="" aria-labelledby="homes-h">
      <header className="featured__head">
        <h2 id="homes-h" className="t-label" data-reveal="ctn">
          {heading ?? "Current listings"}
        </h2>
        {asOfLabel ? (
          <p className="t-small t-muted" data-reveal="ctn">
            Details as of {asOfLabel}. Please confirm availability.
          </p>
        ) : null}
      </header>

      <Slider label="Homes for sale" autoplayMs={8000} className="featured__slider">
        {homes.map((p) => (
          <article key={p.id} className="home-slide">
            <div className="home-slide__stats" data-reveal="ctn">
              <p className="t-label t-muted">{p.priceCaption}</p>
              <p className="home-slide__price t-display t-h4">
                {p.priceLabel}
                {p.priceChange ? <small className="t-label"> {p.priceChange}</small> : null}
              </p>
              <PropertyFacts facts={p.facts} />
            </div>

            <div className="home-slide__media" data-reveal="slide">
              <div className="rv-slide-inner">
                <ImageSlot
                  image={p.image}
                  material={materialForCategory(p.category)}
                  glyph={p.category}
                  sizes="(min-width: 992px) 30vw, 80vw"
                  className="home-slide__plate"
                />
              </div>
            </div>

            <div className="home-slide__copy" data-reveal="ctn">
              <StatusBadge status={p.status} label={p.statusLabel} />
              <p className="t-body">
                {p.location}
                <br />
                <span className="t-muted">{p.typeLabel}</span>
              </p>
              <PillButton href={p.href}>View home</PillButton>
            </div>

            <RevealText as="h3" mode="h" text={p.title} className="home-slide__title t-display t-h2" />
          </article>
        ))}
      </Slider>

      <div className="featured__foot" data-reveal="ctn">
        <PillButton href="/properties">All properties</PillButton>
      </div>
    </section>
  );
}
