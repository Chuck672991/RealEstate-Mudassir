import type { Metadata } from "next";
import Link from "next/link";

import "@/styles/globals.css";

import { PREPAINT_SCRIPT } from "@/components/motion/prepaint";
import { getSiteUrl } from "@/lib/site";
import { activeTheme } from "@/lib/theme/active";
import { fontClassName } from "@/lib/theme/active-fonts";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * 404 for URLs that match no route at all (see `globalNotFound` in next.config.ts).
 * It bypasses the site layout, so it brings its own document, theme and styles; it
 * deliberately avoids CMS reads so it can never fail for the same reason a page did.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme={activeTheme.id} className={fontClassName} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
        <main id="main" data-page="not-found" className="page notfound" data-top-bg="light">
          <div className="page__inner notfound__inner">
            <p className="t-label t-muted">Error 404</p>
            <h1 className="notfound__title t-display">
              This page <span className="t-accent">isn’t</span> here
            </h1>
            <p className="t-body">The link may be old or mistyped. Try one of these instead.</p>
            <nav aria-label="Helpful links" className="notfound__links t-label">
              <Link href="/" className="pill-btn">
                Home
              </Link>
              <Link href="/properties" className="pill-btn">
                Homes
              </Link>
              <Link href="/contact" className="pill-btn">
                Contact
              </Link>
            </nav>
          </div>
        </main>
      </body>
    </html>
  );
}
