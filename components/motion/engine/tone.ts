/**
 * HEADER TONE — the fixed UI (badge, nav, menu button, scroll rail) recolours
 * itself according to what is behind its centre point (reference §G6, which uses
 * one ScrollTrigger per element/section pair; one hit-test pass is equivalent
 * and far cheaper).
 *
 * Sections declare their surface with `data-bg="light|color|dark"`. Only "dark"
 * gives the light ink. The arch panels carry data-bg on the PANEL (not the
 * section) because hit-testing follows the rounded corners, so the dark hero
 * correctly shows through them.
 *
 * Hit-testing follows clip-path and border-radius, so a clipped window or a rounded
 * arch correctly reports only the pixels that are really there. Wrappers that merely
 * cover an area (transparent boxes) carry no data-bg and are skipped.
 *
 * A surface that is a PHOTOGRAPH STAGE also carries `data-scrim`. Light ink over a picture
 * that could be white is unreadable, so each fixed piece over such a surface gets
 * `data-scrim` too, and the CSS gives that piece its own dark plate (chrome.css). Doing it
 * per piece means it adapts to however many links the menu has.
 *
 * COST. Hit-testing (`elementsFromPoint`) is the most expensive thing the page does while
 * scrolling: measured on a production build it was ≈ 21 % of all main-thread time on a slow
 * CPU (docs/PERFORMANCE.md), because it ran for every piece on EVERY frame and, since each
 * piece's attribute was written straight after its read, it also forced a style recalculation
 * per change. Now:
 *   • passes are throttled to one per MIN_INTERVAL_MS. The colour change they drive is itself
 *     a 0.8 s transition (chrome.css), so an answer that is ≤ 100 ms old is indistinguishable;
 *   • a trailing pass always follows the last scroll event, so the state at rest is exact;
 *   • all reads happen first and all writes after, so the style system is invalidated once.
 */
import { isLite } from "./tier";

const IGNORE = ".site-header, .scroll-rail, .scroll-cue";
const MIN_INTERVAL_MS = 100;
/** The lite tier asks the browser for a quarter of the hit-tests per second (engine/tier.ts). */
const LITE_INTERVAL_MS = 250;

type Tone = "light" | "dark";
interface Reading {
  el: HTMLElement;
  tone: Tone;
  scrim: boolean;
}

export function initTone(): () => void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-ui]"));
  if (!targets.length) return () => {};
  let raf = 0;
  let timer = 0;
  let last = -Infinity;

  const surfaceAt = (x: number, y: number): { tone: Tone; scrim: boolean } => {
    for (const hit of document.elementsFromPoint(x, y)) {
      if (hit.closest(IGNORE)) continue;
      const surface = hit.closest("[data-bg]");
      if (surface) return { tone: surface.getAttribute("data-bg") === "dark" ? "dark" : "light", scrim: surface.hasAttribute("data-scrim") };
    }
    return { tone: "light", scrim: false };
  };

  const update = () => {
    raf = 0;
    last = performance.now();

    // READ: every position and hit-test, with no DOM write in between
    const readings: Reading[] = [];
    for (const el of targets) {
      const box = el.getBoundingClientRect();
      if (!box.width && !box.height) continue; // hidden at this breakpoint
      readings.push({ el, ...surfaceAt(box.left + box.width / 2, box.top + box.height / 2) });
    }

    // WRITE: only what changed
    for (const { el, tone, scrim } of readings) {
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
      if (el.hasAttribute("data-scrim") !== scrim) el.toggleAttribute("data-scrim", scrim);
    }
  };

  const schedule = () => {
    if (raf || timer) return;
    const wait = last + (isLite() ? LITE_INTERVAL_MS : MIN_INTERVAL_MS) - performance.now();
    if (wait <= 0) {
      raf = requestAnimationFrame(update);
    } else {
      // too soon: one pass later (this is also the trailing pass after the final scroll event)
      timer = window.setTimeout(() => {
        timer = 0;
        raf = requestAnimationFrame(update);
      }, wait);
    }
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    if (raf) cancelAnimationFrame(raf);
    if (timer) window.clearTimeout(timer);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}
