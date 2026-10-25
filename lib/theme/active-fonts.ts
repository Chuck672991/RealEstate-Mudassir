import { fontClassName as plumLuxuryFonts } from "./themes/plum-luxury/fonts";
import { fontClassName as slateLinenFonts } from "./themes/slate-linen/fonts";
import { activeTheme } from "./active";

/**
 * ACTIVE THEME — fonts half. Only the site layout should import this, because it
 * pulls in next/font (which must stay out of route handlers such as OG images).
 * Add one entry per theme that has its own faces.
 */
const FONTS: Record<string, string> = {
  "plum-luxury": plumLuxuryFonts,
  "slate-linen": slateLinenFonts,
};

export const fontClassName = FONTS[activeTheme.id] ?? plumLuxuryFonts;
