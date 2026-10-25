/**
 * THE TWO WINDOWS of the closing scene: one photograph seen through two portrait openings
 * (engine/home.ts → closingScene). Pure numbers, kept out of the GSAP module so a test can hold
 * them to the reference's measured geometry (brief §5.5–5.6).
 *
 * The reference cuts the windows out of two cream HALF-width panels, so its published percentages
 * are of a half panel; they are converted here to percentages of the WHOLE stage (that
 * conversion — applying the half-panel numbers to the full width — is the bug this file exists
 * to prevent: it made each window twice as wide and merged them into a stepped block).
 *
 *   window A (left):   x 22.222 → 49.444 %   (half-panel 44.444 → 98.889 %)
 *   window B (right):  x 50.556 → 77.778 %   (half-panel  1.111 → 55.556 %)
 *   aligned:           both y 18.519 → 81.481 %
 *   start:             A y 36.111 → 99.074 %, B y 0.926 → 63.889 %  (A low, B high)
 *   merged:            A's right edge and B's left edge both move to the centre line, 50 %
 */
export interface Window {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
export interface WindowPair {
  a: Window;
  b: Window;
}

export const WINDOWS_START: WindowPair = {
  a: { x0: 22.222, x1: 49.444, y0: 36.111, y1: 99.074 },
  b: { x0: 50.556, x1: 77.778, y0: 0.926, y1: 63.889 },
};
export const WINDOWS_ALIGNED: WindowPair = {
  a: { x0: 22.222, x1: 49.444, y0: 18.519, y1: 81.481 },
  b: { x0: 50.556, x1: 77.778, y0: 18.519, y1: 81.481 },
};
export const WINDOWS_MERGED: WindowPair = {
  a: { x0: 22.222, x1: 50, y0: 18.519, y1: 81.481 },
  b: { x0: 50, x1: 77.778, y0: 18.519, y1: 81.481 },
};

/**
 * One clip-path polygon drawing A, then B, joined by a zero-width out-and-back line (it runs the
 * same two points both ways, so it has no area). Being ONE path, the merged pair has no seam.
 */
export const windowsPolygon = ({ a, b }: WindowPair): string =>
  `polygon(${a.x0}% ${a.y0}%, ${a.x1}% ${a.y0}%, ${a.x1}% ${a.y1}%, ${a.x0}% ${a.y1}%, ${a.x0}% ${a.y0}%, ` +
  `${b.x0}% ${b.y0}%, ${b.x1}% ${b.y0}%, ${b.x1}% ${b.y1}%, ${b.x0}% ${b.y1}%, ${b.x0}% ${b.y0}%, ${a.x0}% ${a.y0}%)`;
