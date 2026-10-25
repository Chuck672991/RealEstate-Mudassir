"use client";

import { activeTheme } from "@/lib/theme/active";

/**
 * Catches errors in the root layout itself. It replaces the whole document, so it
 * cannot rely on the site's stylesheet or fonts: it carries a few plain inline
 * styles and nothing that can fail.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // pure palette data (no CSS, no fonts), so this still renders if everything else failed
  const { palette } = activeTheme;
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Georgia, serif", background: palette.surface, color: palette.ink }}>
        <main style={{ maxWidth: "36rem", margin: "0 auto", padding: "20vh 1.5rem" }}>
          <h1 style={{ fontWeight: 400, fontSize: "2rem" }}>Something went wrong</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
            The site couldn’t load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: "0.7rem 1.4rem", border: "1px solid currentColor", background: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
