import type { Metadata } from "next";

import { Intro } from "@/components/layout/Intro";
import { HomeMotion } from "@/components/motion/HomeMotion";
import { About } from "@/components/sections/About";
import { ArchIntro } from "@/components/sections/ArchIntro";
import { Areas } from "@/components/sections/Areas";
import { CtaFooter } from "@/components/sections/CtaFooter";
import { Credibility } from "@/components/sections/Credibility";
import { Expertise } from "@/components/sections/Expertise";
import { FeaturedHomes } from "@/components/sections/FeaturedHomes";
import { Hero } from "@/components/sections/Hero";
import { Horizon } from "@/components/sections/Horizon";
import { HowIWork } from "@/components/sections/HowIWork";
import { Market } from "@/components/sections/Market";
import { RecentlySold } from "@/components/sections/RecentlySold";
import { getAgent } from "@/features/agent";
import { getServiceAreas } from "@/features/areas";
import { getHome } from "@/features/home";
import { getFeaturedHomes, getRecentlySold } from "@/features/properties";
import { getSiteSettings } from "@/features/site";
import { getSpecialties } from "@/features/specialties";
import { getMarketStats } from "@/features/stats";
import { getTestimonials } from "@/features/testimonials";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/lib/seo/JsonLd";
import { homeGraph } from "@/lib/seo/graph";
import type { ImageDTO } from "@/types/content";

/** The `count` highest-resolution distinct pictures (a tall crop of a small photo would look soft). */
function sharpest(images: Array<ImageDTO | null | undefined>, count: number): ImageDTO[] {
  const seen = new Set<string>();
  return images
    .filter((i): i is ImageDTO => !!i)
    .sort((a, b) => b.width - a.width)
    .filter((i) => !seen.has(i.src) && !!seen.add(i.src))
    .slice(0, count);
}

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings, agent] = await Promise.all([getHome(), getSiteSettings(), getAgent()]);
  return buildMetadata({
    path: "/",
    seo: home.seo,
    defaults: settings.defaultSeo,
    fallbackDescription: agent.introduction,
  });
}

/**
 * Home page: one long, mostly linear narrative (see docs/REFERENCE-MAPPING.md for
 * how each section maps to the reference design). Section ORDER is fixed because
 * the pinned stages and overlapping arch panels depend on it; each section's copy
 * is editable in the CMS and any section can be switched off. A section with no
 * data renders nothing — never a placeholder.
 */
export default async function HomePage() {
  const [home, agent, settings, specialties, areas, featured, sold, stats, testimonials] = await Promise.all([
    getHome(),
    getAgent(),
    getSiteSettings(),
    getSpecialties(),
    getServiceAreas(),
    getFeaturedHomes(),
    getRecentlySold(),
    getMarketStats(),
    getTestimonials(),
  ]);

  // Pictures for the compositions that need one: the photographs are whatever the CMS holds,
  // chosen by rule (never named here) — an aerial for the horizon, the sharpest two homes for the
  // tall columns. The closing windows use the photograph the editor chose on the Home page
  // ("Closing scene — photograph"); without one, another area photograph. A section lacking its
  // photograph is omitted.
  const areaPhotos = areas.filter((a) => !a.isOffice && a.image).map((a) => a.image!);
  const horizonPhoto = areaPhotos[0];
  const closingPhoto = home.ctaImage ?? (areaPhotos.length > 1 ? areaPhotos[areaPhotos.length - 1] : undefined);
  const livingPhotos = sharpest([...featured, ...sold].map((p) => p.image), 2);

  return (
    <>
      <Intro name={agent.displayName} line={settings.siteTagline ?? "Real estate across Chicagoland"} />
      <JsonLd data={homeGraph({ agent, settings, home })} />

      <main id="main" data-page="home" data-top-bg="dark">
        <Hero home={home} agent={agent} />
        <ArchIntro words={home.archWords} caption={home.archCaption} />
        {home.show.expertise ? <Expertise specialties={specialties} heading={home.expertiseHeading} /> : null}
        {home.show.about ? <About statement={home.aboutStatement} agent={agent} /> : null}
        {home.show.areas ? (
          <Areas areas={areas} agent={agent} heading={home.areasHeading} intro={home.areasIntro} />
        ) : null}
        {home.show.areas ? <Horizon image={horizonPhoto} heading={home.heroAccent} line={settings.siteTagline} /> : null}
        {home.show.featuredHomes ? <FeaturedHomes homes={featured} heading={home.featuredHeading} asOf={settings.observedOn} /> : null}
        {home.show.market ? <Market stats={stats} heading={home.marketHeading} /> : null}
        {home.show.recentlySold ? <RecentlySold sales={sold} heading={home.soldHeading} /> : null}
        {home.show.howIWork ? <HowIWork home={home} agent={agent} photos={livingPhotos} /> : null}
        {home.show.credibility ? (
          <Credibility
            agent={agent}
            testimonials={testimonials}
            showRating={settings.showRatingSummary}
            heading={home.credibilityHeading}
          />
        ) : null}
      </main>

      <CtaFooter home={home} agent={agent} image={closingPhoto} />
      <HomeMotion />
    </>
  );
}
