import { Archivo, Bodoni_Moda } from "next/font/google";

/**
 * Three faces, ~98 KB of woff2 in total (latin subset, measured against the
 * ≤120 KB font budget in the design brief):
 *
 *   display  Bodoni Moda, upright, variable (opsz + wght).  ~46 KB
 *            Used in capitals for headlines. `opsz` lets the browser pick the
 *            razor-thin "display" optical size at large sizes, which is what
 *            makes huge Didone capitals look expensive rather than heavy.
 *   accent   Bodoni Moda Italic, static 400.                ~16 KB
 *            The single accent voice: 1–2 mixed-case words that overlap a
 *            headline. (next/font cannot pin a weight AND an axis, so the
 *            italic is a separate static request.)
 *   body     Archivo, variable weight.                      ~35 KB
 *            Copy, navigation, metadata, controls. Labels get their identity
 *            from tiny size + wide tracking, not from the typeface.
 *
 * All are self-hosted by next/font at build time (no request to Google at
 * runtime). Swap them here and in styles/themes/<id>.css to restyle.
 */
const displayRoman = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-display-face",
  display: "swap",
});

const displayItalic = Bodoni_Moda({
  subsets: ["latin"],
  style: ["italic"],
  weight: "400",
  variable: "--font-accent-face",
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

/** Applied to <html>; defines --font-display-face, --font-accent-face, --font-body-face. */
export const fontClassName = [displayRoman.variable, displayItalic.variable, body.variable].join(" ");
