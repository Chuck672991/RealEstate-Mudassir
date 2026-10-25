import Link from "next/link";

/** The 404 body, shared by the in-site not-found page and the global one. */
export function NotFoundContent({ phone }: { phone?: { display: string; href: string } }) {
  return (
    <main id="main" data-page="not-found" className="page notfound" data-top-bg="light">
      <div className="page__inner notfound__inner">
        <p className="t-label t-muted">Error 404</p>
        <h1 className="notfound__title t-display">
          This page <span className="t-accent">isn’t</span> here
        </h1>
        <p className="t-body">
          The link may be old, or the home you were looking for may no longer be listed. Try one of these instead.
        </p>
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
          {phone ? (
            <a href={phone.href} className="pill-btn">
              Call {phone.display}
            </a>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
