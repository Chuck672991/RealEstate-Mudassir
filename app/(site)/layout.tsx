import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";

import { ContactDialogHost } from "@/components/forms/ContactDialogHost";
import { SanityTools } from "@/components/layout/SanityTools";
import { ScrollRail } from "@/components/layout/ScrollRail";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PREPAINT_SCRIPT } from "@/components/motion/prepaint";
import { getSiteUrl } from "@/lib/site";
import { activeTheme } from "@/lib/theme/active";
import { fontClassName } from "@/lib/theme/active-fonts";

export const viewport: Viewport = {
  themeColor: activeTheme.palette.surface,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

// Static fallbacks only. Real titles/descriptions come from Sanity via each
// page's generateMetadata (see lib/seo/metadata.ts).
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Mudassir Siddiqui — Real Estate", template: "%s | Mudassir Siddiqui" },
  applicationName: "Mudassir Siddiqui",
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme={activeTheme.id} className={fontClassName} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <SiteHeader />
        <ScrollRail />
        {children}

        <ContactDialogHost />
        <MotionProvider />
        <SanityTools />
      </body>
    </html>
  );
}
