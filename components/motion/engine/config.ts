/**
 * Motion configuration shared by every motion module.
 *
 * Breakpoints and pointer rules mirror the CSS (styles/structure/sections/*.css) —
 * CSS decides the pinned GEOMETRY, JS decides the choreography, and the two must use
 * the same conditions or a stage would be pinned with nothing driving it.
 *
 * Timings and easings are NOT defined here: they are read from the active theme's
 * CSS custom properties (`--dur-*`, `--ease-*`), so switching theme re-tunes motion
 * without touching code.
 */

export const MQ = {
  /** Pinned/scrubbed desktop choreography (the reference's 992px switch). */
  desktop: "(min-width: 992px)",
  mobile: "(max-width: 991px)",
  /** A pinned stage needs the screen to be at least as tall as the stage itself (36rem). */
  pinnable: "(min-height: 36rem)",
  /** The sideways chapter and the closing scene need room for their content. */
  tall: "(min-height: 40rem)",
  short: "(max-height: 39.99rem)",
  finePointer: "(hover: hover) and (pointer: fine)",
  reduced: "(prefers-reduced-motion: reduce)",
  noReduced: "(prefers-reduced-motion: no-preference)",
} as const;

export const matches = (query: string): boolean => typeof window !== "undefined" && window.matchMedia(query).matches;

export const noop = (): void => {};

/** A computed value of a theme token. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** `cubic-bezier(.25,1,.5,1)` → "0.25,1,0.5,1" (the form GSAP's CustomEase takes). */
export function readBezier(name: string, fallback: string): string {
  const match = /cubic-bezier\(([^)]+)\)/.exec(cssVar(name));
  return (match?.[1] ?? fallback).replace(/\s+/g, "");
}

/** `1.2s` / `300ms` → seconds. */
export function readSeconds(name: string, fallback: number): number {
  const raw = cssVar(name);
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return fallback;
  return raw.endsWith("ms") ? n / 1000 : n;
}

export const q = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);

export const qa = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

/** Elements whose reveal is driven by a bespoke timeline instead of the generic observer. */
export const MANUAL_REVEAL = "[data-manual-reveal]";
