"use client";

import { useEffect, useRef } from "react";

import { getLenis, scrollToTarget } from "@/components/motion/engine/scroll";

/**
 * Fixed scroll-progress rail (left edge, desktop) and the “Scroll” cue (reference
 * §G8, §C.1). Purely an enhancement over the native scrollbar: hidden from assistive
 * technology, hidden below 992px, never replaces keyboard or wheel scrolling.
 * Dragging the thumb scrubs the page. Updates write straight to the DOM (no React
 * state per frame).
 *
 * Per-frame cost, kept near zero: the page height and track height are cached (a
 * ResizeObserver refreshes them — reading `scrollHeight` every frame forces a layout
 * flush whenever anything else dirtied the page); the thumb moves with a transform, not
 * `top` (which re-laid-out the rail every frame); and the label and the cue are only
 * written when their value changes (assigning `textContent` replaces the text node even
 * when the string is identical).
 */
export function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rail.current;
    if (!root) return;
    const label = root.querySelector<HTMLElement>("[data-rail-label]");
    const track = root.querySelector<HTMLElement>(".scroll-rail__track");
    const thumb = root.querySelector<HTMLElement>(".scroll-rail__thumb");
    let raf = 0;

    // measured once, then only when the page or the track changes size
    let maxScrollPx = 1;
    let trackPx = 0;
    const measure = () => {
      maxScrollPx = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      trackPx = track?.clientHeight ?? 0;
    };
    const maxScroll = () => maxScrollPx;
    measure();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());
    resizeObserver?.observe(document.documentElement);
    resizeObserver?.observe(document.body);
    if (track) resizeObserver?.observe(track);

    let lastLabel = "";
    let lastCue = "";
    const update = () => {
      raf = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScrollPx));
      if (thumb) thumb.style.transform = `translate3d(0, ${(progress * trackPx).toFixed(1)}px, 0)`;
      const text = String(Math.round(progress * 100)).padStart(2, "0");
      if (label && text !== lastLabel) {
        label.textContent = text;
        lastLabel = text;
      }
      // fade the cue out as the end of the page approaches
      const cueOpacity = String(Math.max(0, Math.min(1, (0.94 - progress) / 0.06)));
      if (cueOpacity !== lastCue) {
        cue.current?.style.setProperty("--cue-opacity", cueOpacity);
        lastCue = cueOpacity;
      }
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

    const onResize = () => {
      measure();
      schedule();
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    getLenis()?.on("scroll", schedule);
    track?.addEventListener("pointerdown", down);
    track?.addEventListener("pointermove", move);
    track?.addEventListener("pointerup", up);
    track?.addEventListener("pointercancel", up);
    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
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
