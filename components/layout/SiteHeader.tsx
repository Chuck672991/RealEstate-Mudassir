import Link from "next/link";

import { Monogram } from "@/components/ui/Monogram";
import { SmartLink } from "@/components/ui/SmartLink";
import { getAgent } from "@/features/agent";
import { getSiteSettings } from "@/features/site";

import { MobileMenu } from "./MobileMenu";

/**
 * Fixed header. Every piece carries `data-ui` (the badge, each nav item,
 * the menu button): the motion layer recolours each one (light ↔ dark ink) as the
 * surface behind ITS centre point changes, so a nav that straddles a section edge
 * stays legible line by line. Before JS runs, CSS picks a default from the page's
 * first section.
 *
 * Menu: the FIRST link is the large two-line one (its first word on the first line, the rest
 * on the second); every other link is a small tracked label beneath it. A link flagged
 * "opens the contact form" opens the site's inquiry dialog (and still goes to its page without
 * JavaScript). The phone number is not in the header — it is in the mobile menu, the closing
 * scene and the footer.
 */
export async function SiteHeader() {
  const [settings, agent] = await Promise.all([getSiteSettings(), getAgent()]);
  const [primary, ...secondary] = settings.nav;
  const words = primary?.label.trim().split(/\s+/) ?? [];

  // The words around the badge come from the CMS (name + tagline). The link's accessible
  // name must contain them (WCAG 2.5.3 Label in Name — voice-control users say what
  // they see), so both are built from the same string.
  const ringLabel = [agent.displayName, settings.siteTagline].filter(Boolean).join(" · ");
  const ringText = `${ringLabel.toUpperCase()} · `;

  return (
    <header className="site-header">
      <Link href="/" className="badge" data-ui="" aria-label={`${ringLabel} — home`}>
        <svg className="badge-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            <path id="ring-path" d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
          </defs>
          <text className="badge-ring__text">
            <textPath href="#ring-path" textLength="258" lengthAdjust="spacing">
              {ringText}
            </textPath>
          </text>
        </svg>
        <Monogram className="badge-mark" />
      </Link>

      <div className="site-header__right">
        <nav className="site-nav" aria-label="Primary">
          <ul role="list">
            {primary ? (
              <li data-ui="" className="site-nav__primary">
                <SmartLink
                  href={primary.href}
                  className="nav-primary t-display"
                  data-open-contact={primary.opensContactForm ? "" : undefined}
                >
                  {/* one word on the first line, the rest on the second; read as one label */}
                  <span className="nav-primary__line">{words[0]}</span>
                  {words.length > 1 ? (
                    <>
                      {" "}
                      <span className="nav-primary__line">{words.slice(1).join(" ")}</span>
                    </>
                  ) : null}
                </SmartLink>
              </li>
            ) : null}
            {secondary.map((item) => (
              <li key={item.href + item.label} data-ui="" className="site-nav__small">
                <SmartLink href={item.href} className="nav-small t-label" data-open-contact={item.opensContactForm ? "" : undefined}>
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu links={settings.nav} phone={agent.phone} name={agent.displayName} />
      </div>
    </header>
  );
}
