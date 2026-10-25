import Link from "next/link";

import { Monogram } from "@/components/ui/Monogram";
import { RollLink } from "@/components/ui/RollLink";
import { SmartLink } from "@/components/ui/SmartLink";
import { getAgent } from "@/features/agent";
import { getServiceAreas } from "@/features/areas";
import { getSiteSettings } from "@/features/site";

import { CopyrightYear } from "./CopyrightYear";

/**
 * The footer proper (contentinfo landmark). On the home page it is the plum
 * layer revealed behind the closing scene; elsewhere it is a normal block.
 * A single giant phone number is the call to action — only when verified.
 */
export async function FooterContent() {
  const [agent, settings, areas] = await Promise.all([getAgent(), getSiteSettings(), getServiceAreas()]);
  const address = settings.showOfficeAddress ? agent.brokerage?.address : undefined;
  // a heading over an empty <address> is an empty section — only render the column with content
  const hasOffice = !!(agent.brokerage?.name || address || agent.license);

  return (
    <footer className="site-footer" data-bg="dark" data-footer-content="">
      <div className="site-footer__inner">
        <Monogram className="site-footer__mark" />

        {agent.phone ? (
          <a href={agent.phone.href} className="footer-phone t-display">
            <span className="sr-only">Call {agent.displayName}: </span>
            {agent.phone.display}
          </a>
        ) : (
          <Link href="/contact" className="footer-phone t-display">
            Get in touch
          </Link>
        )}

        <div className="footer-cols">
          {hasOffice ? (
            <div>
              <h2 id="footer-office" className="t-label t-muted">
                Office
              </h2>
              <address className="footer-address">
                {agent.brokerage?.name ? <strong>{agent.brokerage.name}</strong> : null}
                {address ? (
                  <>
                    {address.street ? <span>{address.street}</span> : null}
                    <span>
                      {[address.city, [address.state, address.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                    </span>
                  </>
                ) : null}
                {agent.license ? (
                  <span className="t-small t-muted">
                    Illinois licence {agent.license.state === "IL" ? "" : `(${agent.license.state}) `}#{agent.license.number}
                  </span>
                ) : null}
              </address>
            </div>
          ) : null}

          {settings.nav.length ? (
            <nav aria-labelledby="footer-explore">
              <h2 id="footer-explore" className="t-label t-muted">
                Explore
              </h2>
              <ul role="list" className="footer-list">
                {settings.nav.map((l) => (
                  <li key={l.href + l.label}>
                    <RollLink href={l.href} label={l.label} />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {areas.length ? (
            <div>
              <h2 id="footer-areas" className="t-label t-muted">
                Where Mudassir works
              </h2>
              <ul role="list" className="footer-list">
                {areas
                  .filter((a) => !a.isOffice)
                  .map((a) => (
                    <li key={a.id}>{a.name}</li>
                  ))}
              </ul>
            </div>
          ) : null}

          {agent.links.length ? (
            <div>
              <h2 id="footer-links" className="t-label t-muted">
                Elsewhere
              </h2>
              <ul role="list" className="footer-list">
                {agent.links.map((l) => (
                  <li key={l.href}>
                    <SmartLink href={l.href}>{l.label}</SmartLink>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <a href="#main" className="footer-top t-label hit-slop">
          Back to top
        </a>
      </div>
    </footer>
  );
}

/** Disclosures, kept outside the pinned layer so they can be any length. */
export async function LegalStrip() {
  const [agent, settings] = await Promise.all([getAgent(), getSiteSettings()]);

  return (
    <aside className="legal-strip" aria-label="Legal and disclosures" data-bg="dark">
      <div className="legal-strip__inner t-small">
        {settings.complianceNotice ? <p>{settings.complianceNotice}</p> : null}
        {agent.brokerage?.disclosure ? <p>{agent.brokerage.disclosure}</p> : null}
        {settings.listingDisclaimer ? <p>{settings.listingDisclaimer}</p> : null}
        {settings.dataNotice ? <p>{settings.dataNotice}</p> : null}
        {settings.footerNote ? <p>{settings.footerNote}</p> : null}
        <p className="legal-strip__row">
          <span>
            © <CopyrightYear /> {agent.fullName}
          </span>
          {settings.legalLinks.map((l) => (
            <SmartLink key={l.href} href={l.href}>
              {l.label}
            </SmartLink>
          ))}
        </p>
      </div>
    </aside>
  );
}

/** Standalone footer for every page except the home page's closing scene. */
export function SiteFooter() {
  return (
    <>
      <FooterContent />
      <LegalStrip />
    </>
  );
}
