"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { usePrefersReducedMotion } from "@/lib/utils/hooks";

import { noop } from "./engine/config";
import { initFitText } from "./engine/fit-text";
import { initLive } from "./engine/live";
import { initMagnetic } from "./engine/magnetic";
import { initReveals } from "./engine/reveal";

/**
 * Per-page enhancement: scroll reveals, fit-text, magnetic buttons and the pause/play of
 * off-screen decorative loops (flowers, clouds).
 *
 * It is rendered INSIDE each page (not in the layout) on purpose. These enhancements
 * write attributes and styles onto the page's server-rendered DOM, and React hydrates
 * the page's Suspense boundary independently of — and possibly after — the layout.
 * An effect in the layout could therefore run before the page's DOM was hydrated and
 * cause hydration mismatches; an effect inside the page runs only after it has.
 */
export function PageMotion() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const cleanups = [initReveals(), initFitText(), reduced ? noop : initMagnetic(), reduced ? noop : initLive()];
    return () => cleanups.forEach((fn) => fn());
  }, [pathname, reduced]);

  return null;
}
