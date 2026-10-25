"use client";

import { useEffect, useRef } from "react";

import { getLenis, scrollToTarget } from "@/components/motion/engine/scroll";

/**
 * Fixed scroll-progress rail (left edge, desktop) and the “Scroll” cue (reference
 * §G8, §C.1). Purely an enhancement over the native scrollbar: hidden from assistive
 * technology, hidden below 992px, never replaces keyboard or wheel scrolling.
 * Dragging the thumb scrubs the page. Updates write straight to the DOM (no React
 * state per frame).
 */
export function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rail.current;
    if (!root) return;
    const label = root.querySelector<HTMLElement>("[data-rail-label]");
    const track = root.querySelector<HTMLElement>(".scroll-rail__track");
    let raf = 0;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const update = () => {
      raf = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
      root.style.setProperty("--progress", `${(progress * 100).toFixed(2)}%`);
      if (label) label.textContent = String(Math.round(progress * 100)).padStart(2, "0");
      // fade the cue out as the end of the page approaches
      cue.current?.style.setProperty("--cue-opacity", String(Math.max(0, Math.min(1, (0.94 - progress) / 0.06))));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // dragging
    let dragging = false;
    const scrubTo = (clientY: number) => {
      if (!track) return;
      const box = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientY - box.top) / box.height));
      scrollToTarget(ratio * maxScroll(), { immediate: true });
    };
    const down = (event: PointerEvent) => {
      dragging = true;
      track?.setPointerCapture(event.pointerId);
      document.body.style.cursor = "grabbing";
      scrubTo(event.clientY);
    };
    const move = (event: PointerEvent) => {
      if (dragging) scrubTo(event.clientY);
    };
    const up = (event: PointerEvent) => {
      dragging = false;
      track?.releasePointerCapture?.(event.pointerId);
      document.body.style.cursor = "";
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    getLenis()?.on("scroll", schedule);
    track?.addEventListener("pointerdown", down);
    track?.addEventListener("pointermove", move);
    track?.addEventListener("pointerup", up);
    track?.addEventListener("pointercancel", up);
    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      getLenis()?.off("scroll", schedule);
      track?.removeEventListener("pointerdown", down);
      track?.removeEventListener("pointermove", move);
      track?.removeEventListener("pointerup", up);
      track?.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <>
      <div ref={rail} className="scroll-rail" data-ui="" aria-hidden="true">
        <span className="scroll-rail__label tabular t-label" data-rail-label="">
          00
        </span>
        <span className="scroll-rail__track">
          <span className="scroll-rail__thumb" />
        </span>
      </div>
      <div ref={cue} className="scroll-cue t-label" data-ui="" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </>
  );
}
