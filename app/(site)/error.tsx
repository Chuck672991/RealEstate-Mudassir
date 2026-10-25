"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Last-resort boundary for errors while rendering a page (for example the CMS being
 * unreachable with nothing cached yet). It never shows technical detail to
 * visitors; the digest lets whoever runs the site find the server log entry.
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="page notfound" data-page="error" data-top-bg="light">
      <div className="page__inner notfound__inner">
        <p className="t-label t-muted">Something went wrong</p>
        <h1 className="notfound__title t-display">
          We couldn’t load <span className="t-accent">this</span> page
        </h1>
        <p className="t-body">Please try again. If the problem continues, the site’s content may be temporarily unavailable.</p>
        <div className="notfound__links t-label">
          <button type="button" className="pill-btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="pill-btn">
            Home
          </Link>
        </div>
        {error.digest ? <p className="t-small t-muted">Reference: {error.digest}</p> : null}
      </div>
    </main>
  );
}
