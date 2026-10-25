import type { Metadata } from "next";
import { NextStudioLayout, metadata as studioMetadata } from "next-sanity/studio";

import { getSiteUrl } from "@/lib/site";

export { viewport } from "next-sanity/studio";

// The Studio is its own root layout: no site CSS, fonts, motion or analytics are
// loaded here, and the site bundle never contains Studio code. next-sanity's
// metadata keeps it out of search results (robots: noindex).
export const metadata: Metadata = { ...studioMetadata, metadataBase: new URL(getSiteUrl()) };

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  );
}
