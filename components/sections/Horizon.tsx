import { CloudMarquee } from "@/components/ui/CloudMarquee";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { RevealText } from "@/components/ui/RevealText";
import type { ImageDTO } from "@/types/content";

/**
 * HORIZON — the reference's “clouds over an aerial photograph” beat.
 *
 * You leave the sideways chapter and drift into open sky: three layers of cloud pass
 * right-to-left over an aerial photograph of one of the communities. The photo is the only
 * thing that moves with the scroll (slides ±15 % and settles from 1.15× to 1×, engine/home.ts);
 * the clouds drift on their own. The clouds start a little ABOVE the section, so they seem to
 * come out of the page before it — one continuous scene.
 *
 * Renders only when there is a photograph and a heading (both come from the CMS: an area's
 * image, the home page's accent word and the site tagline). Decorative: the photo carries no
 * alt text here because the heading says what the section is about.
 */
export function Horizon({ image, heading, line }: { image: ImageDTO | null | undefined; heading?: string; line?: string }) {
  if (!image || !heading) return null;

  return (
    <section id="horizon" className="horizon" data-section="horizon" data-bg="dark" data-scrim="" aria-labelledby="horizon-h">
      <div className="horizon__stage">
        <div className="horizon__window">
          <div className="horizon__bg" data-horizon-bg="">
            <div className="horizon__photo" data-horizon-photo="">
              <ImageSlot image={{ ...image, alt: "" }} sizes="110vw" className="horizon__media" />
            </div>
          </div>
        </div>

        <div className="horizon__text">
          <RevealText as="h2" mode="h" id="horizon-h" text={heading} className="horizon__title t-display" />
          {line ? (
            <p className="horizon__line t-label scrim" data-reveal="ctn">
              {line}
            </p>
          ) : null}
        </div>

        <div className="horizon__clouds" aria-hidden="true">
          <CloudMarquee layer="a" />
          <CloudMarquee layer="b" />
          <CloudMarquee layer="c" />
        </div>
        {/* cream fades: hide the photo's hard top edge and melt the cloud tops into the page */}
        <div className="horizon__fade horizon__fade--a" aria-hidden="true" />
        <div className="horizon__fade horizon__fade--b" aria-hidden="true" />
      </div>
    </section>
  );
}
