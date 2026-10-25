import type { ThemeMeta } from "../../types";

/**
 * Pure data — safe to import from route handlers (OG image, icon, manifest).
 * Values mirror the `--c-*` raw palette in styles/themes/slate-linen.css and are
 * checked against it by lib/theme/theme.test.ts.
 */
export const slateLinen: ThemeMeta = {
  id: "slate-linen",
  label: "Slate & Linen",
  palette: {
    surface: "#F4F3EF", // linen paper
    surfaceRaised: "#E2E1DB", // grey plaster
    surfaceInverse: "#1F2B36", // slate
    surfaceDeep: "#151D25", // night
    ink: "#1B2127",
    inkInverse: "#F4F3EF",
    accent: "#8C9AA5", // blue-grey stone
  },
};
