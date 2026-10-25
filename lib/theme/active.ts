import { resolveTheme } from "./registry";

/**
 * ACTIVE THEME — palette half. Selected at BUILD time:
 *
 *   NEXT_PUBLIC_THEME=slate-linen npm run build
 *
 * Unset (or unknown) → the default theme. Switching themes touches no content,
 * schema or data-fetching code. Safe to import anywhere (no next/font).
 * Adding a theme: docs/THEMING.md.
 */
export const activeTheme = resolveTheme(process.env.NEXT_PUBLIC_THEME);
