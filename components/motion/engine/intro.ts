import { lockScroll, unlockScroll } from "./scroll";

/**
 * FIRST-VISIT ARRIVAL (≈ 4 s), home page only, once per tab session.
 *
 * What the visitor sees: a burgundy sheet with an arch-shaped hole (CSS mask, see
 * chrome.css). The arch parks below the fold, shrinks and dips, rises to the upper
 * third, holds for a beat, then widens past the viewport until the sheet is gone. The
 * hero underneath is fully rendered the whole time and never moves; its title flips in
 * just as the hole starts to open.
 *
 * How: two registered custom properties on `.intro` (--arch-w, --arch-y) are animated
 * with the Web Animations API. The keyframes below are the MEASURED arch positions from the
 * reference (docs/REFERENCE-MAPPING.md → “Arrival”); between samples the easing is
 * in-out where the samples are far apart and linear where they are dense. WAAPI instead
 * of GSAP because this runs before the (home-only) GSAP chunk and needs nothing else.
 *
 * Sequencing:
 *   gate      wait for fonts + window load (and at least ~0.65 s so the lockup can be read);
 *             never longer than GATE_MAX (the pre-paint watchdog removes the intro at 5 s)
 *   run       `.intro-run` clears the text lockup; the arch animation plays
 *   open      `.intro-open` (≈ 1.9 s in) releases the hero's CSS entrance animations
 *   finish    `.intro-on` removed, scroll unlocked, overlay gone
 * Skip (key / click / tap / wheel): jump to the moment the arch is up, open the hero text
 * and play the rest at 3× speed.
 */

/** [seconds, arch width (vw), arch top edge (vh)] — measured on the reference. */
const KEYFRAMES: ReadonlyArray<readonly [number, number, number]> = [
  [0.0, 36, 100], // parked below the fold
  [0.5, 24, 103], // shrinks and dips (anticipation)
  [1.0, 27, 82], // starts to rise
  [1.5, 35.4, 19.7], // rising fast
  [2.05, 38, 12.8], // arrives near the top; the hold ends
  [2.22, 42, 12], // expansion begins, slowly
  [2.37, 50, 9],
  [2.52, 72, -2],
  [2.67, 95, -28], // wider than the viewport
  [2.82, 106, -55],
  [3.12, 116, -85], // ease-out tail
  [3.72, 124, -100],
  [4.0, 125, -100], // end state: --arch-w 125vw, --arch-y -100vh
];
const DURATION_MS = 4000;
/** When the hero title may start (the reference: just before the fast expansion). */
const OPEN_AT_MS = 1900;
/** The arch has arrived: where a skip jumps to. */
const ARRIVED_MS = 2050;
const MIN_BEFORE_RUN_MS = 650;
const GATE_MAX_MS = 3500;

const EASE_IN_OUT = "cubic-bezier(0.45, 0, 0.55, 1)";

const keyframes = (): Keyframe[] =>
  KEYFRAMES.map(([t, w, y], i) => ({
    offset: t / (DURATION_MS / 1000),
    "--arch-w": `${w}vw`,
    "--arch-y": `${y}vh`,
    // the first samples are half a second apart (smooth them); from 2.05 s they are dense (linear)
    easing: i < 4 ? EASE_IN_OUT : "linear",
  }));

export function runIntro(): () => void {
  const html = document.documentElement;
  const overlay = document.querySelector<HTMLElement>("[data-intro]");
  if (!html.classList.contains("intro-on") || !overlay) return () => {};

  try {
    sessionStorage.setItem("ms-intro", "1");
  } catch {
    /* private mode: the intro may replay on reload, which is fine */
  }

  lockScroll();
  window.scrollTo(0, 0);

  let finished = false;
  let animation: Animation | null = null;
  const timers: number[] = [];
  const skipEvents = ["keydown", "pointerdown", "wheel", "touchstart"] as const;

  const open = () => html.classList.add("intro-open");

  /** Stop everything this run started, leaving the page exactly as it found it. */
  const teardown = () => {
    timers.forEach(window.clearTimeout);
    skipEvents.forEach((name) => window.removeEventListener(name, skip));
    animation?.cancel();
    html.classList.remove("intro-open", "intro-run");
    unlockScroll();
  };

  /** The arrival is over: remove the overlay for good. */
  const finish = () => {
    if (finished) return;
    finished = true;
    teardown();
    html.classList.remove("intro-on");
  };

  /**
   * Cleanup when the effect re-runs (React's dev double-mount, a motion-preference change):
   * cancel this run but KEEP `intro-on`, so the next run plays from the start. Only `finish`
   * ends the intro.
   */
  const dispose = () => {
    if (finished) return;
    finished = true;
    teardown();
  };

  const play = () => {
    if (finished || animation) return;
    html.classList.add("intro-run");
    // The Web Animations API drives registered custom properties; if it is missing (very old
    // engines) skip straight to the end rather than leave the sheet on screen.
    if (typeof overlay.animate !== "function") {
      open();
      timers.push(window.setTimeout(finish, 600));
      return;
    }
    animation = overlay.animate(keyframes(), { duration: DURATION_MS, fill: "both" });
    animation.onfinish = finish;
    timers.push(window.setTimeout(open, OPEN_AT_MS));
  };

  function skip() {
    if (finished) return;
    open();
    if (!animation) play();
    if (animation) {
      if (Number(animation.currentTime ?? 0) < ARRIVED_MS) animation.currentTime = ARRIVED_MS;
      animation.updatePlaybackRate(3);
    }
  }
  skipEvents.forEach((name) => window.addEventListener(name, skip, { passive: true, once: true }));

  // Gate: fonts and the window load event (so the title's glyphs and the hero art are
  // ready), at least MIN_BEFORE_RUN_MS after navigation start, at most GATE_MAX_MS from now.
  const ready = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    document.readyState === "complete" ? Promise.resolve() : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true })),
  ]);
  const minimum = new Promise<void>((r) => window.setTimeout(r, Math.max(0, MIN_BEFORE_RUN_MS - performance.now())));
  const limit = new Promise<void>((r) => timers.push(window.setTimeout(r, GATE_MAX_MS)));
  void Promise.race([Promise.all([ready, minimum]), limit]).then(play);

  return dispose;
}
