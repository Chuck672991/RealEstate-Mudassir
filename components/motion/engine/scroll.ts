import Lenis from "lenis";

import { MQ, matches, noop } from "./config";

/**
 * Smooth scrolling (Lenis, as in the reference: duration 1.2s, exponential-out
 * easing, touch left native) plus the small assists that depend on it.
 *
 * Only created for visitors who allow motion AND use a mouse-like pointer on a wide
 * screen: touch devices keep their native momentum scrolling, and reduced-motion
 * visitors get plain native scrolling with no easing and no snapping.
 *
 * The instance is a module singleton so the pinned-scene code (engine/home.ts) and
 * the scroll rail can drive and read the same scroller.
 *
 * FRAME LOOP ON DEMAND. Lenis can run its own requestAnimationFrame loop forever (`autoRaf`).
 * It is driven here only while something is happening: a wheel/touch/key/scroll event wakes it,
 * and it stops 200 ms after the last bit of movement. Why it matters: in Chrome a page with ANY
 * rAF loop running pays a main-thread style recalculation per frame for every transform animation
 * on it (the header badge spins forever). Measured on this site, idle: 60 recalcs/s and 35 ms of
 * main-thread time per second, against 0 and 0.4 ms/s without a loop (docs/PERFORMANCE.md).
 */
let instance: Lenis | null = null;
let locks = 0;
let wake: () => void = noop;

/** Restart the frame loop after a programmatic `lenis.scrollTo`, which no input event announces. */
export const wakeSmoothScroll = (): void => wake();

/** Keep driving Lenis this long after the last wheel/touch/key/scroll event, and while it reports it is scrolling. */
const QUIET_MS = 200;

export const getLenis = (): Lenis | null => instance;

export function createSmoothScroll(): () => void {
  // Deliberately NOT switched off in the lite tier. Measured at 12× CPU slowdown over the sideways chapter, native
  // wheel scrolling was worse than this loop (frames over 33 ms: 48 % vs 27 % scrolling down, 38 % vs 7 % scrolling up),
  // even though it does less work: with Lenis the page position, the scrubbed animations and the frame are produced
  // together every frame, and it only runs while the page is moving (docs/PERFORMANCE.md).
  if (instance || !matches(MQ.noReduced) || !matches(MQ.finePointer) || !matches(MQ.desktop)) return noop;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
    autoRaf: false, // driven below, only while there is movement
  });
  instance = lenis;
  document.documentElement.classList.add("lenis-on");
  if (locks > 0) lenis.stop();

  let raf = 0;
  let quietUntil = 0;
  const frame = (now: number) => {
    raf = 0;
    lenis.raf(now);
    if (lenis.isScrolling || now < quietUntil) raf = requestAnimationFrame(frame);
  };
  const wakeLoop = () => {
    quietUntil = performance.now() + QUIET_MS;
    if (raf) return;
    // Lenis advances its ease by (now − its last frame). After an idle gap that would be seconds:
    // the first wheel notch would jump to its end instead of easing. 0 means "no previous frame".
    lenis.time = 0;
    raf = requestAnimationFrame(frame);
  };
  wake = wakeLoop;
  const WAKE_EVENTS = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown", "scroll"] as const;
  for (const name of WAKE_EVENTS) window.addEventListener(name, wakeLoop, { passive: true, capture: name !== "scroll" });

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    for (const name of WAKE_EVENTS) window.removeEventListener(name, wakeLoop, { capture: name !== "scroll" });
    if (raf) cancelAnimationFrame(raf);
    wake = noop;
    lenis.destroy();
    document.documentElement.classList.remove("lenis-on");
    if (instance === lenis) instance = null;
  };
  return destroy;
}

/** Pause page scrolling (modal dialogs, the intro). Calls nest. */
export function lockScroll(): void {
  locks += 1;
  instance?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll(): void {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  instance?.start();
  document.documentElement.style.overflow = "";
}

/** Scroll to a position/element, smoothly when Lenis is active, instantly otherwise. */
export function scrollToTarget(target: number | HTMLElement, options?: { duration?: number; immediate?: boolean }): void {
  if (instance) {
    instance.scrollTo(target, { duration: options?.duration ?? 1.2, immediate: options?.immediate ?? false });
    wake();
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: "auto" });
}

/**
 * Same-page hash links (`#about`, `/#areas` while on `/`): scroll there smoothly,
 * update the URL, and move focus to the target so keyboard and screen-reader users
 * land where the page did. Without Lenis the browser/Next default is left alone.
 */
export function initAnchors(): () => void {
  const onClick = (event: MouseEvent) => {
    if (!instance || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    event.stopPropagation(); // keep the router from also handling a same-page hash
    history.pushState(null, "", url.hash);
    instance.scrollTo(target, { duration: 1.4 });
    wake();
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

/**
 * Gentle snap for `[data-snap]` sections (desktop only).
 *
 * The reference snaps whenever a section is >50% visible after scrolling stops.
 * That also drags people BACK to the section when they scroll a little way out of
 * it — with arrow keys or single wheel notches they could never leave. This
 * version only assists an APPROACH: if you stop within ~12% of the viewport of a
 * section's top edge while moving toward it, it eases the last bit. Scrolling away
 * from a section is never contradicted. (Documented difference: docs/REFERENCE-MAPPING.md.)
 */
export function initSnapAssist(): () => void {
  if (!instance) return noop;
  const lenis = instance;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap]"));
  if (!sections.length) return noop;

  let timer = 0;
  let direction = 0;
  let last = window.scrollY;

  const settle = () => {
    const vh = window.innerHeight;
    for (const section of sections) {
      const top = section.getBoundingClientRect().top;
      const approaching = (top > 0 && direction > 0) || (top < 0 && direction < 0);
      if (approaching && Math.abs(top) > 2 && Math.abs(top) < vh * 0.12) {
        lenis.scrollTo(section, { duration: 0.8 });
        wake();
        return;
      }
    }
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (y !== last) direction = Math.sign(y - last);
    last = y;
    window.clearTimeout(timer);
    timer = window.setTimeout(settle, 140);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
  };
}
