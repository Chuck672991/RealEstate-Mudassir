import type { ThemeMeta } from "../../types";

/**
 * Pure data — safe to import from route handlers (OG image, icon, manifest).
 * Values mirror the `--c-*` raw palette in styles/themes/plum-luxury.css and are
 * checked against it by lib/theme/theme.test.ts.
 */
export const plumLuxury: ThemeMeta = {
  id: "plum-luxury",
  label: "Plum Luxury",
  palette: {
    surface: "#F7F3EB", // warm ivory
    surfaceRaised: "#E8DDC9", // cream plaster
    surfaceInverse: "#351916", // plum / burgundy leather
    surfaceDeep: "#30221C", // dark walnut
    ink: "#292522", // muted charcoal
    inkInverse: "#F7F3EB",
    accent: "#9A8C7A", // taupe / stone
  },
};
