import Link from "next/link";

import { ImageSlot, materialForCategory, type MaterialName } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { PropertyDTO } from "@/types/content";

import { SoldShowcase, type SoldTab } from "./SoldShowcase";

const STAGE_MATERIALS: MaterialName[] = ["walnut", "leather", "walnut", "stone", "leather", "walnut"];

/** City only — a sold home's street address is never part of the label. */
const cityOf = (location: string) => location.split(",")[0] ?? location;

/**
 * RECENTLY SOLD — the reference's amenities stage: a full-bleed dark plate that
 * scales and fades as the cream panel of the next section rises over it, with a
 * tab list that wipes between records. Content is limited to the verified,
 * fully-detailed sales; each card shows city, type, month and price only until the
 * broker confirms that addresses and photographs may be published.
 */
export function RecentlySold({ sales, heading }: { sales: PropertyDTO[]; heading?: string }) {
  if (!sales.length) return null;
  const allSellerSide = sales.every((p) => p.roleLabel === "Mudassir represented the seller");

  const tabs: SoldTab[] = sales.map((p, i) => ({
    id: p.id,
    label: `${cityOf(p.location)} — ${p.typeLabel}`,
    stage: (
      <div className="sold-stage">
        <div className="sold-stage__plate" data-reveal="slide">
          <div className="rv-slide-inner">
            <ImageSlot
              image={p.image}
              material={p.image ? undefined : (STAGE_MATERIALS[i % STAGE_MATERIALS.length] ?? materialForCategory(p.category))}
              glyph={p.category}
              sizes="100vw"
              className="sold-stage__media"
            />
          </div>
        </div>
        <div className="sold-stage__caption scrim">
          <p className="t-label" data-reveal="ctn">
            {p.dateLabel}
            {p.facts.length ? ` · ${p.facts.map((f) => `${f.value} ${f.label.toLowerCase()}`).join(" · ")}` : ""}
          </p>
          <RevealText as="p" mode="h" text={p.priceLabel} className="sold-stage__price t-display t-h1 tabular" />
          <p className="sold-stage__where t-h6 t-display" data-reveal="ctn">
            {p.title}
          </p>
          {p.roleLabel ? (
            <p className="t-small" data-reveal="ctn">
              {p.roleLabel}.
            </p>
          ) : null}
          <p data-reveal="ctn">
            <Link href={p.href} className="sold-stage__link t-label hit-slop">
              View details
            </Link>
          </p>
        </div>
      </div>
    ),
  }));

  return (
    <section id="sold" className="sold" data-section="sold" data-bg="dark" data-scrim="" aria-labelledby="sold-h">
      <div className="sold__area" data-pin-area="sold">
        <div className="sold__sticky">
          <SoldShowcase
            tabs={tabs}
            heading={
              <>
                <h2 id="sold-h" className="t-label" data-reveal="ctn">
                  {heading ?? "Recently sold"}
                </h2>
                <p className="t-small t-muted-inverse" data-reveal="ctn">
                  {allSellerSide ? "Verified sales where Mudassir represented the seller." : "Verified sales."}
                </p>
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}
