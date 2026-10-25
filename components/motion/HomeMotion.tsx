"use client";

import { useEffect } from "react";

import { usePrefersReducedMotion } from "@/lib/utils/hooks";

import { noop } from "./engine/config";
import { PageMotion } from "./PageMotion";

/**
 * Home-page motion: the generic per-page enhancements (<PageMotion />) plus the
 * scroll-linked choreography. GSAP + ScrollTrigger are
 * imported dynamically here, so no other route pays for them, and the (CSS-driven)
 * reveals work even while the chunk is still downloading.
 *
 * If the chunk cannot load, the enhancement classes are removed so the page falls
 * back to its calm, un-pinned layout instead of leaving empty scroll areas.
 */
export function HomeMotion() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const abort = new AbortController();
    let dispose = noop;

    import("./engine/home")
      .then((mod) => mod.initHomeChoreography(abort.signal))
      .then((cleanup) => {
        if (abort.signal.aborted) cleanup();
        else dispose = cleanup;
      })
      .catch((error: unknown) => {
        console.error("Home choreography failed to load; falling back to the static layout.", error);
        document.documentElement.classList.remove("motion-ok", "intro-on");
      });

    return () => {
      abort.abort();
      dispose();
    };
  }, [reduced]);

  return <PageMotion />;
}
