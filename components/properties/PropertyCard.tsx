import Link from "next/link";

import { ImageSlot, materialForCategory } from "@/components/ui/ImageSlot";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PropertyDTO } from "@/types/content";

import { PropertyFacts } from "./PropertyFacts";

/**
 * THE property card — reused by the index, the “more homes” strip and anywhere
 * else a home is listed. Status, price and facts all come from the CMS record.
 *
 * Accessible “stretched link” pattern: the only link is the title (its name is
 * exactly the visible title, which is what Label-in-Name asks for), and CSS
 * stretches that link over the whole card so the card is one big click target.
 * Everything else on the card stays ordinary, readable text.
 */
export function PropertyCard({
  property,
  priority = false,
  headingLevel = 3,
}: {
  property: PropertyDTO;
  priority?: boolean;
  /** Heading level of the title, so a list sits correctly under its page's headings. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="property-card chamfer" data-status={property.status} data-category={property.category}>
      <div className="property-card__face">
        <ImageSlot
          image={property.image}
          material={materialForCategory(property.category)}
          glyph={property.category}
          sizes="(min-width: 1200px) 30vw, (min-width: 700px) 45vw, 92vw"
          priority={priority}
          className="property-card__media"
        />
        <div className="property-card__body">
          <div className="property-card__top">
            <StatusBadge status={property.status} label={property.statusLabel} />
            {property.dateLabel ? (
              <time className="t-label t-muted" dateTime={property.dateISO}>
                {property.dateLabel}
              </time>
            ) : null}
          </div>
          <Heading className="property-card__title t-display t-h5">
            <Link href={property.href} className="property-card__link">
              {property.title}
            </Link>
          </Heading>
          <p className="property-card__where t-small t-muted">
            {property.location} · {property.typeLabel}
          </p>
          <p className="property-card__price t-display">
            {property.priceLabel}
            {property.priceChange ? <small className="property-card__change t-label"> {property.priceChange}</small> : null}
          </p>
          <PropertyFacts facts={property.facts} />
        </div>
      </div>
    </article>
  );
}
