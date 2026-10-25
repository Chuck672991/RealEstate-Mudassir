import { ImageSlot, type MaterialName } from "@/components/ui/ImageSlot";
import type { GlyphName } from "@/components/ui/PropertyGlyph";
import { RevealText } from "@/components/ui/RevealText";
import { Slider } from "@/components/ui/Slider";
import type { SpecialtyDTO } from "@/types/content";

const MATERIALS: MaterialName[] = ["plaster", "travertine", "stone", "walnut", "leather"];

/** Picks a drawing that suits the specialty. Purely illustrative — never a photo of a client. */
function glyphFor(slug: string): GlyphName {
  if (slug.includes("first")) return "key";
  if (slug.includes("negotiation")) return "circles";
  if (slug.includes("investor")) return "building";
  if (slug.includes("rental")) return "townhouse";
  if (slug.includes("multilingual")) return "speech";
  if (slug.includes("local")) return "pin";
  if (slug.includes("residential")) return "house";
  return "condo";
}

/** The reference's “three reasons” slider, here driven by evidence-checked specialties. */
export function Expertise({ specialties, heading }: { specialties: SpecialtyDTO[]; heading?: string }) {
  if (!specialties.length) return null;
  const items = specialties.slice(0, 5);

  return (
    <section id="expertise" className="expertise" data-section="expertise" data-bg="color" data-snap="" aria-labelledby="expertise-h">
      <h2 id="expertise-h" className="expertise__heading t-label" data-reveal="ctn">
        {heading ?? "What Mudassir helps with"}
      </h2>
      <Slider label="Areas of expertise" autoplayMs={7000} className="expertise__slider">
        {items.map((s, i) => (
          <article key={s.id} className="expertise-slide">
            <RevealText as="h3" mode="h" text={s.name} className="expertise-slide__title t-display t-h2" />
            <div className="expertise-slide__media" data-reveal="slide">
              <div className="rv-slide-inner">
                <ImageSlot
                  material={MATERIALS[i % MATERIALS.length]}
                  glyph={glyphFor(s.slug)}
                  sizes="(min-width: 992px) 30vw, 70vw"
                  className="expertise-slide__plate"
                />
              </div>
            </div>
            {s.summary ? (
              <p className="expertise-slide__text t-body" data-reveal="ctn">
                {s.summary}
              </p>
            ) : null}
          </article>
        ))}
      </Slider>
    </section>
  );
}
