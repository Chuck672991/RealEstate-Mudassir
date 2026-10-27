import { noop } from "./config";

/**
 * PERFORMANCE TIER — the same site, in one of two states:
 *
 *   full   everything: the flower videos, every parallax and drift.
 *   lite   the stories are all still told (the pinned scenes, the sideways chapter, the closing zoom, the
 *          reveals, the smooth scrolling) but the decoration that costs the most is switched off: the flower
 *          videos show their still frame instead of playing, the purely decorative parallax is skipped, the
 *          clouds hold still, and the header recolours less often. (Smooth scrolling stays: measured on a
 *          slowed CPU, native wheel scrolling gave a worse frame cadence than the on-demand smooth scroller.)
 *
 * WHAT DECIDES IT — measurements, not guesses about the machine. Screen width and user-agent say nothing about
 * how fast a computer is, so neither is used. Instead, once and in one direction only:
 *
 *   1. an explicit request       `?perf=lite` in the URL (testing, or a link for a known-slow kiosk);
 *   2. the visitor's connection  Save-Data on, or a 3G-or-slower effective connection (`navigator.connection`,
 *                                Chromium only): the flower videos alone are ≈ 12 MB;
 *   3. the machine, measured     (a) a flower video that is dropping frames (a software decode that cannot keep
 *                                up: live.ts) or (b) scrolling that is janky for a sustained stretch
 *                                (`createFrameJudge`, below).
 *
 * WHAT IT NEVER DOES — go back up. Once `lite` is set it stays for the browser session (sessionStorage, so
 * later pages agree), so quality never flaps during normal use. A fast machine that measures well stops being
 * measured after a few seconds of scrolling. `?perf=full` pins the full tier and turns the automatic downgrade
 * off (for benchmarks and comparison). `prefers-reduced-motion` is separate and stronger: that visitor never
 * gets the motion layer at all.
 *
 * The attribute `data-perf="lite"` on <html> is the single switch: CSS and the other engine modules read it.
 */
export type Tier = "full" | "lite";

const STORE = "ms-perf";
export const LITE_EVENT = "ms:perf-lite";

const html = (): HTMLElement => document.documentElement;
export const isLite = (): boolean => html().getAttribute("data-perf") === "lite";
/** `?perf=full`: the tier is pinned and no automatic downgrade happens. */
export const isPinnedFull = (): boolean => html().getAttribute("data-perf") === "full";

/** Switch to the lite tier, for the rest of the session. Safe to call more than once. */
export function setLite(reason: string): void {
  if (isLite() || isPinnedFull()) return;
  html().setAttribute("data-perf", "lite");
  try {
    sessionStorage.setItem(STORE, "lite");
  } catch {
    /* private mode: it holds for this page, which is the best that can be done */
  }
  window.dispatchEvent(new CustomEvent(LITE_EVENT, { detail: { reason } }));
}

/** Run `fn` now if the tier is already lite, otherwise the moment it becomes lite. */
export function whenLite(fn: () => void): () => void {
  if (isLite()) {
    fn();
    return noop;
  }
  const handler = () => fn();
  window.addEventListener(LITE_EVENT, handler, { once: true });
  return () => window.removeEventListener(LITE_EVENT, handler);
}

/* ── the frame-rate judge ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * A frame this long (ms) counts as dropped. At 60 Hz a missed refresh makes the interval 33 ms (two refreshes), so
 * 25 ms (one and a half) separates "a frame was dropped" from ordinary jitter around 16.7 ms — and means a machine
 * that can only manage a steady 30 fps, which is every other frame dropped, is judged slow.
 */
export const SLOW_FRAME_MS = 25;
/** A gap longer than this is the tab having been hidden or the page idle, not a slow frame. */
export const GAP_MS = 250;
/** Frames in the window the verdict looks at (≈ 1 s at 60 fps). */
export const WINDOW = 60;
/** The share of the window that must be slow for the verdict "slow". */
export const SLOW_SHARE = 0.25;
/** Frames ignored at the start of every scroll streak (the first frame of a scroll pays for waking up). */
export const WARMUP_FRAMES = 12;
/** After this many consecutive frames with a healthy window the machine is trusted and measuring stops. */
export const TRUST_AFTER = 360;

export type Verdict = "slow" | "ok" | "trusted";

/**
 * Decides from a stream of frame intervals whether scrolling is janky. Pure: no DOM, no timers, so it can be
 * tested with synthetic frames. Feed it the interval (ms) between consecutive animation frames while the page
 * is scrolling; call `reset()` between scroll streaks.
 *
 *   "slow"     ≥ SLOW_SHARE of the last WINDOW frames took longer than SLOW_FRAME_MS (a sustained stutter)
 *   "trusted"  TRUST_AFTER healthy frames in a row: stop measuring, the machine is fine
 *   "ok"       neither yet
 */
export function createFrameJudge() {
  const recent: boolean[] = [];
  let slow = 0;
  let seen = 0;
  let healthy = 0;

  return {
    push(interval: number): Verdict {
      if (interval > GAP_MS || interval <= 0) return "ok"; // idle gap or a bad sample: not evidence
      seen += 1;
      if (seen <= WARMUP_FRAMES) return "ok";
      const isSlow = interval > SLOW_FRAME_MS;
      recent.push(isSlow);
      if (isSlow) slow += 1;
      if (recent.length > WINDOW) {
        if (recent.shift()) slow -= 1;
      }
      if (recent.length >= WINDOW && slow / recent.length >= SLOW_SHARE) return "slow";
      healthy = recent.length >= WINDOW && slow / recent.length < SLOW_SHARE / 2 ? healthy + 1 : 0;
      return healthy >= TRUST_AFTER ? "trusted" : "ok";
    },
    /** A new scroll streak starts: the warm-up applies again, the window is kept. */
    reset(): void {
      seen = 0;
    },
  };
}

/**
 * Watch the frame rate WHILE THE PAGE IS BEING SCROLLED and downgrade to lite if it stays janky. The sampler
 * is a requestAnimationFrame loop that exists only from the first scroll event until 200 ms after the last
 * one, and is dropped altogether once the machine has proven itself.
 */
export function initFrameMonitor(): () => void {
  if (isLite() || isPinnedFull()) return noop;
  const judge = createFrameJudge();
  let raf = 0;
  let last = 0;
  let quietUntil = 0;
  let stopped = false;

  const frame = (now: number) => {
    raf = 0;
    if (stopped) return;
    if (last) {
      const verdict = judge.push(now - last);
      if (verdict === "slow") return void setLite("sustained slow frames while scrolling");
      if (verdict === "trusted") return void stop();
    }
    last = now;
    if (now < quietUntil) raf = requestAnimationFrame(frame);
    else {
      last = 0; // streak over
      judge.reset();
    }
  };
  const onScroll = () => {
    quietUntil = performance.now() + 200;
    if (!raf && !stopped) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    stopped = true;
    window.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  const off = whenLite(stop);
  return () => {
    stop();
    off();
  };
}
