/**
 * The site mark: an arch (the portfolio's signature shape) containing the
 * initials. Original artwork; colours come from CSS (`currentColor`).
 * Reused by the header badge, footer, menu and the generated icons.
 *
 * The letters are OUTLINES, not live text: they are the glyphs of Bodoni Moda
 * (SIL OFL, see assets/fonts/README.md) converted to a path, so the mark renders
 * identically before fonts load, never counts as page text for assistive
 * technology, and does not depend on a CSS font variable.
 */
const INITIALS_PATH =
  "M42.03 68.25 35.08 49.25H37.48L43.27 64.89L48.68 49.25H49.21L42.64 68.25ZM35.33 49.25V67.51H37.18V68H33.04V67.51H34.82V49.74H32.92V49.25ZM53.19 49.25V49.74H51.44V67.51H53.19V68H47.06V67.51H49.07V49.25Z M61.21 68.36Q59.59 68.36 58.42 67.86Q57.24 67.36 56.46 66.49L55.29 68.25H54.87V63.11H55.36Q55.56 64.14 55.99 65Q56.43 65.86 57.12 66.5Q57.82 67.14 58.77 67.49Q59.73 67.85 60.98 67.85Q62.31 67.85 63.28 67.4Q64.24 66.95 64.77 66.09Q65.29 65.24 65.29 64Q65.29 62.9 64.76 62.14Q64.22 61.39 63.33 60.83Q62.43 60.27 61.37 59.81Q60.31 59.34 59.24 58.83Q58.18 58.31 57.29 57.63Q56.39 56.95 55.86 55.98Q55.32 55.01 55.32 53.62Q55.32 52.24 56.02 51.2Q56.72 50.16 57.9 49.58Q59.08 49 60.51 49Q61.74 49 62.78 49.39Q63.82 49.79 64.58 50.59L65.74 49H66.16V54.14H65.68Q65.43 52.58 64.74 51.56Q64.06 50.54 63.03 50.04Q62.01 49.55 60.74 49.55Q58.96 49.55 58.04 50.39Q57.12 51.24 57.12 52.62Q57.12 53.61 57.65 54.3Q58.18 54.99 59.06 55.51Q59.93 56.02 60.98 56.49Q62.03 56.95 63.08 57.48Q64.13 58.01 65.01 58.74Q65.88 59.46 66.41 60.49Q66.94 61.52 66.94 63Q66.94 64.62 66.24 65.83Q65.54 67.04 64.26 67.7Q62.97 68.36 61.21 68.36Z";

export function Monogram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path
        d="M22 88 V46 A28 28 0 0 1 78 46 V88"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M12 88 H88" fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path d={INITIALS_PATH} fill="currentColor" stroke="none" />
    </svg>
  );
}
