"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` during server render and hydration, `true` afterwards. Lets a component
 * render the same markup on both sides, then enhance — with no setState-in-effect
 * and no hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Live `matchMedia` result (server snapshot = `fallback`). */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/**
 * Once a carousel has been seen, start fetching the photographs of its other slides.
 * They are `loading="lazy"` (a hidden slide is not fetched), so without this the first click
 * on "next" would show an empty plate until the picture arrived.
 */
export function preloadLazyImages(root: HTMLElement | null): void {
  root?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
    img.loading = "eager";
  });
}
