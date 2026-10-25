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
 */
let instance: Lenis | null = null;
let locks = 0;

export const getLenis = (): Lenis | null => instance;

export function createSmoothScroll(): () => void {
  if (instance || !matches(MQ.noReduced) || !matches(MQ.finePointer) || !matches(MQ.desktop)) return noop;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 2,
    autoRaf: true,
  });
  instance = lenis;
  document.documentElement.classList.add("lenis-on");
  if (locks > 0) lenis.stop();

  return () => {
    lenis.destroy();
    document.documentElement.classList.remove("lenis-on");
    if (instance === lenis) instance = null;
  };
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
