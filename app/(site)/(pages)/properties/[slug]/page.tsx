import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFacts } from "@/components/properties/PropertyFacts";
import { PillButton } from "@/components/ui/CircleButton";
import { ImageSlot, materialForCategory } from "@/components/ui/ImageSlot";
import { SmartLink } from "@/components/ui/SmartLink";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAgent } from "@/features/agent";
import { getPropertiesPage } from "@/features/pages";
import { getProperties, getPropertyBySlug, getPropertySlugs } from "@/features/properties";
import { describeProperty } from "@/features/properties/describe";
import { getSiteSettings } from "@/features/site";
import { JsonLd } from "@/lib/seo/JsonLd";
import { propertyGraph } from "@/lib/seo/graph";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatLongDate } from "@/lib/utils/format";

/**
 * Cache Components needs at least one prerendered param. When the CMS has no
 * published home yet a sentinel keeps the route valid; it resolves to a 404.
 */
const NO_HOMES = "__no-homes__";

export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: NO_HOMES }];
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [property, settings, agent] = await Promise.all([getPropertyBySlug(slug), getSiteSettings(), getAgent()]);
  if (!property) return { title: "Home not found", robots: { index: false, follow: false } };

  const description = property.seo?.description ?? property.summary ?? describeProperty(property, agent);

  return buildMetadata({
    path: property.href,
    seo: property.seo,
    defaults: settings.defaultSeo,
    fallbackTitle: `${property.title} — ${property.statusLabel}`,
    fallbackDescription: description,
  });
}

/**
 * `params` is URL data: it differs per link, so it cannot be part of the shared App
 * Shell that Partial Prefetching builds for this route. Reading it behind <Suspense>
 * lets the shell (header, frame, this skeleton) show instantly on navigation while the
 * home itself streams in. Homes known at build time are still prerendered in full.
 */
export default function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  return (
    <Suspense fallback={<PropertySkeleton />}>
      <PropertyContent params={params} />
    </Suspense>
  );
}

function PropertySkeleton() {
  return (
    <main id="main" data-page="property" className="page" aria-busy="true">
      <div className="page__inner">
        <p className="sr-only" role="status">
          Loading home…
        </p>
        <div className="property-detail" aria-hidden="true">
          <div className="property-detail__media skeleton" />
          <div className="property-detail__panel">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--block" />
          </div>
        </div>
      </div>
    </main>
  );
}

async function PropertyContent({ params }: Pick<PageProps<"/properties/[slug]">, "params">) {
  const { slug } = await params;
  const [property, all, agent, settings, listPage] = await Promise.all([
    getPropertyBySlug(slug),
    getProperties(),
    getAgent(),
    getSiteSettings(),
    getPropertiesPage(),
  ]);
  if (!property) notFound();

  const more = all.filter((p) => p.id !== property.id).slice(0, 3);
  const asOf = formatLongDate(property.asOf);
  const photos = [property.image, ...property.gallery].filter((i): i is NonNullable<typeof i> => !!i);
  const askTopic = property.status === "sold" ? undefined : "Buying a home";
  const subject = `${property.title} (${property.statusLabel}) — ${property.href}`;

  return (
    <main id="main" data-page="property" className="page">
      <JsonLd data={propertyGraph({ property, agent, settings, listLabel: listPage.heading })} />
      <div className="page__inner">
        <nav aria-label="Breadcrumb" className="breadcrumbs t-label">
          <ol>
            <li>
              <Link href="/" className="hit-slop">Home</Link>
            </li>
            <li>
              <Link href="/properties" className="hit-slop">{listPage.heading}</Link>
            </li>
            <li aria-current="page">{property.title}</li>
          </ol>
        </nav>

        <article className="property-detail" data-status={property.status}>
          <div className="property-detail__main">
            <div className="property-detail__media">
              <ImageSlot
                image={photos[0] ?? null}
                material={materialForCategory(property.category)}
                glyph={property.category}
                sizes="(min-width: 992px) 56vw, 92vw"
                priority
              />
            </div>
            {photos.length > 1 ? (
              <ul role="list" className="property-detail__gallery">
                {photos.slice(1).map((photo) => (
                  <li key={photo.src}>
                    <ImageSlot image={photo} sizes="(min-width: 992px) 14vw, 40vw" />
                  </li>
                ))}
              </ul>
            ) : null}

            {property.summary ? <p className="t-body property-detail__summary">{property.summary}</p> : null}

            <div className="property-detail__notes t-small t-muted">
              {asOf ? <p>Details as of {asOf}. Please confirm availability and details before relying on them.</p> : null}
              {property.roleLabel ? <p>{property.roleLabel}.</p> : null}
              {settings.listingDisclaimer ? <p>{settings.listingDisclaimer}</p> : null}
            </div>
          </div>

          <aside className="property-detail__panel" aria-label="Home details">
            <div>
              <StatusBadge status={property.status} label={property.statusLabel} />
            </div>
            <div>
              <h1 className="t-display t-h3">{property.title}</h1>
              <p className="t-body t-muted">
                {property.location} · {property.typeLabel}
              </p>
            </div>
            <div>
              <p className="t-label t-muted">{property.priceCaption}</p>
              <p className="property-detail__price t-display tabular">{property.priceLabel}</p>
              {property.priceChange ? <p className="t-small t-muted">{property.priceChange}</p> : null}
              {property.dateLabel ? (
                <p className="t-small t-muted">
                  <time dateTime={property.dateISO}>{property.dateLabel}</time>
                </p>
              ) : null}
            </div>

            <PropertyFacts facts={property.facts} className="property-detail__facts" />

            {property.moreFacts.length ? (
              <dl className="more-facts t-small">
                {property.moreFacts.map((f) => (
                  <div key={f.label}>
                    <dt className="t-muted">{f.label}</dt>
                    <dd className="tabular">{f.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="property-detail__actions">
              <PillButton href="/contact" openContact contactTopic={askTopic} contactSubject={subject}>
                {property.status === "sold" ? "Ask about selling" : "Ask about this home"}
              </PillButton>
              {agent.phone ? (
                <a href={agent.phone.href} className="t-label property-detail__call hit-slop">
                  <span className="sr-only">Call {agent.displayName}: </span>
                  {agent.phone.display}
                </a>
              ) : null}
              {property.listingUrl ? (
                <SmartLink href={property.listingUrl} className="t-small property-detail__source">
                  View the original listing on Homes.com
                  <span className="sr-only"> (opens in a new tab)</span>
                </SmartLink>
              ) : null}
            </div>
          </aside>
        </article>

        {more.length ? (
          <section className="property-more" aria-labelledby="more-h">
            <h2 id="more-h" className="t-display t-h5">
              More homes
            </h2>
            <ul role="list" className="property-grid">
              {more.map((p) => (
                <li key={p.id} data-status={p.status} data-category={p.category}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
