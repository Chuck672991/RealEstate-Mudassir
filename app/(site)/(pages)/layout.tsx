import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageMotion } from "@/components/motion/PageMotion";

/**
 * Frame for every inner page (properties, contact, …): the page itself, then the
 * standard footer. The home page does not use this layout — its closing scene
 * contains the footer (see components/sections/CtaFooter.tsx).
 */
export default function InnerPagesLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <SiteFooter />
      <PageMotion />
    </>
  );
}
