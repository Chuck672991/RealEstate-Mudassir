import { plumLuxury } from "./themes/plum-luxury/palette";
import { slateLinen } from "./themes/slate-linen/palette";
import type { ThemeMeta } from "./types";

/**
 * Every theme the build knows about (palette half — pure data, safe anywhere).
 * Choose one at build time with NEXT_PUBLIC_THEME=<id>; unknown or empty values fall
 * back to DEFAULT_THEME. The CSS half is styles/themes/<id>.css (imported by
 * styles/themes/index.css and scoped by [data-theme="<id>"]).
 */
export const themes: Readonly<Record<string, ThemeMeta>> = {
  [plumLuxury.id]: plumLuxury,
  [slateLinen.id]: slateLinen,
};

export const DEFAULT_THEME = plumLuxury.id;

export function resolveTheme(id: string | undefined): ThemeMeta {
  return (id && themes[id]) || themes[DEFAULT_THEME]!;
}
