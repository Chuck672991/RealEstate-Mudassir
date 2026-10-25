import { text } from "@/features/content/policy";
import { toSeo } from "@/features/site/shape";
import { toImage } from "@/lib/sanity/image";
import type { CtaDTO, HomeDTO } from "@/types/content";

interface RawCta {
  label?: string | null;
  href?: string | null;
}
export type RawHome = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const toCta = (c?: RawCta | null): CtaDTO | undefined => (c?.label && c.href ? { label: c.label, href: c.href } : undefined);

/**
 * Editable home-page copy. Section toggles default to ON and every text field is
 * optional: a missing document, an empty field, or a section with no underlying
 * data simply renders less — never a placeholder or a crash.
 */
export function shapeHome(raw: RawHome | null | undefined): HomeDTO {
  const on = (v: unknown) => v !== false;

  return {
    heroEyebrow: text(raw?.heroEyebrow),
    heroLine1: text(raw?.heroLine1) ?? "Mudassir",
    heroLine2: text(raw?.heroLine2) ?? "Siddiqui",
    heroAccent: text(raw?.heroAccent),
    heroSubheading: text(raw?.heroSubheading),
    heroPrimaryCta: toCta(raw?.heroPrimaryCta),
    archWords: (raw?.archWords as string[] | undefined)?.filter(Boolean) ?? [],
    archCaption: text(raw?.archCaption),
    show: {
      expertise: on(raw?.showExpertise),
      about: on(raw?.showAbout),
      areas: on(raw?.showAreas),
      featuredHomes: on(raw?.showFeaturedHomes),
      market: on(raw?.showMarket),
      recentlySold: on(raw?.showRecentlySold),
      howIWork: on(raw?.showHowIWork),
      credibility: on(raw?.showCredibility),
    },
    expertiseHeading: text(raw?.expertiseHeading),
    aboutStatement: text(raw?.aboutStatement),
    areasHeading: text(raw?.areasHeading),
    areasIntro: text(raw?.areasIntro),
    featuredHeading: text(raw?.featuredHeading),
    marketHeading: text(raw?.marketHeading),
    soldHeading: text(raw?.soldHeading),
    howHeading: text(raw?.howHeading),
    howIntro: text(raw?.howIntro),
    services: ((raw?.services as Array<{ title?: string; body?: string }> | undefined) ?? [])
      .filter((s) => !!s.title)
      .map((s) => ({ title: s.title!, body: text(s.body) })),
    credibilityHeading: text(raw?.credibilityHeading),
    ctaGiantWord: text(raw?.ctaGiantWord),
    ctaHeading: text(raw?.ctaHeading),
    ctaBody: text(raw?.ctaBody),
    ctaPrimary: toCta(raw?.ctaPrimary),
    // decorative here (the closing scene is aria-hidden); the alt text the editor wrote is kept for the rest of the site
    ctaImage: toImage(raw?.ctaImage) ?? undefined,
    seo: toSeo(raw?.seo),
  };
}
