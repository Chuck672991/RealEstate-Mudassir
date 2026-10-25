import type { Metadata } from "next";
import Link from "next/link";

import { PropertyBrowser, type FacetOption } from "@/components/properties/PropertyBrowser";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PillButton } from "@/components/ui/CircleButton";
import { getAgent } from "@/features/agent";
import { getPropertiesPage } from "@/features/pages";
import { getProperties } from "@/features/properties";
import { getSiteSettings } from "@/features/site";
import { JsonLd } from "@/lib/seo/JsonLd";
import { listingIndexGraph } from "@/lib/seo/graph";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatLongDate } from "@/lib/utils/format";
import { PROPERTY_CATEGORY_OPTIONS, PROPERTY_STATUS_OPTIONS } from "@/sanity/lib/enums";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings, agent] = await Promise.all([getPropertiesPage(), getSiteSettings(), getAgent()]);
  return buildMetadata({
    path: "/properties",
    seo: page.seo,
    defaults: settings.defaultSeo,
    fallbackTitle: page.heading,
    fallbackDescription: page.intro ?? agent.introduction,
  });
}

const statusLabel = (value: string) =>
  value === "pending" ? "Under contract" : (PROPERTY_STATUS_OPTIONS.find((o) => o.value === value)?.title ?? value);

/**
 * /properties — every home the CMS publishes, in one server-rendered list (so it
 * is complete without scripting and fully crawlable), with a small client island
 * that filters it in place. Status always comes from the record, never from layout.
 */
export default async function PropertiesPage() {
  const [page, properties, settings, agent] = await Promise.all([
    getPropertiesPage(),
    getProperties(),
    getSiteSettings(),
    getAgent(),
  ]);

  const presentStatuses = [...new Set(properties.map((p) => p.status))];
  const presentCategories = [...new Set(properties.map((p) => p.category))];
  const statuses: FacetOption[] = presentStatuses.map((value) => ({ value, label: statusLabel(value) }));
  const categories: FacetOption[] = presentCategories.map((value) => ({
    value,
    label: PROPERTY_CATEGORY_OPTIONS.find((o) => o.value === value)?.title ?? value,
  }));
  const observed = formatLongDate(settings.observedOn);

  return (
    <main id="main" data-page="properties" className="page">
      <JsonLd
        data={listingIndexGraph({ settings, properties, title: page.heading, description: page.intro })}
      />
      <div className="page__inner">
        <nav aria-label="Breadcrumb" className="breadcrumbs t-label">
          <ol>
            <li>
              <Link href="/" className="hit-slop">Home</Link>
            </li>
            <li aria-current="page">{page.heading}</li>
          </ol>
        </nav>

        <header className="page__head">
          <h1 className="page__title t-display">{page.heading}</h1>
          {page.intro ? <p className="page__lede t-body">{page.intro}</p> : null}
          {observed ? (
            <p className="t-small t-muted">
              Listing details and sales figures were collected on {observed} and may have changed since — please
              confirm availability before relying on them.
            </p>
          ) : null}
        </header>

        {properties.length ? (
          <PropertyBrowser
            items={properties.map((p) => ({ status: p.status, category: p.category }))}
            statuses={statuses}
            categories={categories}
            emptyMessage="No homes match those filters."
          >
            <ul role="list" className="property-grid">
              {properties.map((p, i) => (
                <li key={p.id} data-status={p.status} data-category={p.category}>
                  <PropertyCard property={p} priority={i < 3} headingLevel={2} />
                </li>
              ))}
            </ul>
          </PropertyBrowser>
        ) : (
          <div className="empty-state">
            <p className="t-body">{page.emptyMessage}</p>
            <PillButton href="/contact" openContact>
              {agent.phone ? "Get in touch" : "Send a message"}
            </PillButton>
          </div>
        )}

        {settings.listingDisclaimer ? <p className="t-small t-muted page__fine">{settings.listingDisclaimer}</p> : null}
      </div>
    </main>
  );
}
