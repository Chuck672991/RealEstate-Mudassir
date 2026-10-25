import Link from "next/link";

import { RollLink } from "@/components/ui/RollLink";
import { Monogram } from "@/components/ui/Monogram";
import { getAgent } from "@/features/agent";
import { getSiteSettings } from "@/features/site";

import { MobileMenu } from "./MobileMenu";

/**
 * Fixed header. Every piece carries `data-ui` (the badge, each nav item, the phone,
 * the menu button): the motion layer recolours each one (light ↔ dark ink) as the
 * surface behind ITS centre point changes, so a nav that straddles a section edge
 * stays legible line by line. Before JS runs, CSS picks a default from the page's
 * first section.
 */
export async function SiteHeader() {
  const [settings, agent] = await Promise.all([getSiteSettings(), getAgent()]);
  const nav = settings.nav;

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
            {nav.map((item) => (
              <li key={item.href + item.label} data-ui="">
                <RollLink href={item.href} label={item.label} className="t-display t-h6" />
              </li>
            ))}
          </ul>
          {agent.phone ? (
            <a href={agent.phone.href} className="site-phone t-label hit-slop" data-ui="">
              <span className="sr-only">Call {agent.displayName}: </span>
              {agent.phone.display}
            </a>
          ) : null}
        </nav>
        <MobileMenu links={nav} phone={agent.phone} name={agent.displayName} />
      </div>
    </header>
  );
}
