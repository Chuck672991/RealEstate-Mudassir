import type { Metadata } from "next";
import Link from "next/link";

import { InquiryForm } from "@/components/forms/InquiryForm";
import { getAgent } from "@/features/agent";
import { getContactPage } from "@/features/pages";
import { getSiteSettings } from "@/features/site";
import { JsonLd } from "@/lib/seo/JsonLd";
import { contactGraph } from "@/lib/seo/graph";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getContactPage(), getSiteSettings()]);
  return buildMetadata({
    path: "/contact",
    seo: page.seo,
    defaults: settings.defaultSeo,
    fallbackTitle: "Contact",
    fallbackDescription: page.intro,
  });
}

/**
 * /contact — the same inquiry form as the “Book a call” dialog, with the verified
 * phone, office and licence beside it. Nothing here is invented: contact details
 * render only when the Agent profile / Brokerage documents hold a verified value.
 */
export default async function ContactPage() {
  const [page, agent, settings] = await Promise.all([getContactPage(), getAgent(), getSiteSettings()]);
  const address = settings.showOfficeAddress ? agent.brokerage?.address : undefined;
  const hasOffice = !!(agent.brokerage?.name || address);
  // an empty “Contact details” landmark is worse than none: render it only with content
  const hasDetails = !!(agent.phone || agent.email || hasOffice || agent.license || agent.brokerage?.disclosure);

  return (
    <main id="main" data-page="contact" className="page">
      <JsonLd data={contactGraph({ agent, settings })} />
      <div className="page__inner">
        <nav aria-label="Breadcrumb" className="breadcrumbs t-label">
          <ol>
            <li>
              <Link href="/" className="hit-slop">Home</Link>
            </li>
            <li aria-current="page">Contact</li>
          </ol>
        </nav>

        <header className="page__head">
          <h1 className="page__title t-display">{page.heading}</h1>
          {page.intro ? <p className="page__lede t-body">{page.intro}</p> : null}
        </header>

        <div className={hasDetails ? "contact-layout" : "contact-layout contact-layout--solo"}>
          <section aria-labelledby="form-h" className="contact-layout__form">
            <h2 id="form-h" className="t-display t-h5">
              {page.formHeading}
            </h2>
            <InquiryForm topics={settings.inquiryTopics} phone={agent.phone} headingLevel="h3" />
            {page.privacyNote ? <p className="t-small t-muted">{page.privacyNote}</p> : null}
          </section>

          {hasDetails ? (
            <aside className="contact-layout__details" aria-label="Contact details">
              {agent.phone ? (
                <div>
                  <p className="t-label t-muted">Phone</p>
                  <a href={agent.phone.href} className="contact-layout__phone t-display">
                    <span className="sr-only">Call {agent.displayName}: </span>
                    {agent.phone.display}
                  </a>
                </div>
              ) : null}
              {agent.email ? (
                <div>
                  <p className="t-label t-muted">Email</p>
                  <a href={`mailto:${agent.email}`} className="t-body">
                    {agent.email}
                  </a>
                </div>
              ) : null}
              {hasOffice ? (
                <div>
                  <p className="t-label t-muted">Office</p>
                  <address className="contact-layout__address t-body">
                    {agent.brokerage?.name ? <strong>{agent.brokerage.name}</strong> : null}
                    {address ? <span>{address.oneLine}</span> : null}
                  </address>
                </div>
              ) : null}
              {agent.license ? (
                <p className="t-small t-muted">
                  Illinois licence #{agent.license.number}
                  {agent.brokerage?.name ? ` · ${agent.brokerage.name}` : ""}
                </p>
              ) : null}
              {agent.brokerage?.disclosure ? <p className="t-small t-muted">{agent.brokerage.disclosure}</p> : null}
            </aside>
          ) : null}
        </div>
      </div>
    </main>
  );
}
