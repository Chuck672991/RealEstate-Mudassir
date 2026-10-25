/**
 * A theme has two halves:
 *
 *   CSS  – styles/themes/<id>.css   → every decorative value, scoped by [data-theme]
 *   TS   – lib/theme/themes/<id>/   → `palette.ts` (pure data) and `fonts.ts` (next/font)
 *
 * The TS half exists because some consumers cannot read CSS custom properties:
 * generated OG images, the favicon, `<meta name="theme-color">`, the web manifest.
 * A unit test (lib/theme/theme.test.ts) fails if the palette below drifts from
 * the CSS file, so the two can never silently disagree.
 */
export interface ThemePalette {
  /** Page background. */
  surface: string;
  /** Raised plate / panel background (e.g. plaster). */
  surfaceRaised: string;
  /** Dark section background (e.g. leather / plum). */
  surfaceInverse: string;
  /** Deepest dark (e.g. walnut). */
  surfaceDeep: string;
  /** Primary text on light surfaces. */
  ink: string;
  /** Primary text on dark surfaces. */
  inkInverse: string;
  /** Hairlines, ornaments. Not for body text on light surfaces. */
  accent: string;
}

export interface ThemeMeta {
  /** Must equal the `[data-theme="…"]` selector used in the theme CSS. */
  id: string;
  label: string;
  palette: ThemePalette;
}
