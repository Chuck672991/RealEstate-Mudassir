import { MANUAL_REVEAL } from "./config";

/**
 * Scroll-triggered reveals (the CSS half lives in styles/structure/motion.css).
 *
 * Elements carry `data-reveal="<mode>"`; this module only flips `data-revealed`
 * the first time an element's box enters the viewport (the reference's
 * `start: "top bottom"`, `once: true`). All timing, easing and stagger live in CSS.
 *
 * TWO DETECTORS, chosen by measurement (docs/PERFORMANCE.md):
 *
 *   IntersectionObserver — for almost every node. It costs nothing per frame. Before, every
 *     pending node's box was read with getBoundingClientRect on EVERY animation frame for 900 ms
 *     after each scroll event (≈ 58 reads per frame, ≈ 11 % of main-thread time on a slow CPU).
 *     Probed on the real page at 1440×900: for the 50 nodes in the `ctn`, `h`, `w`, `top` and
 *     `line` modes it reports visibility at exactly the same scroll position as the rect check.
 *
 *   Rect check — only for `slide` and `line-x`. Their HIDDEN state is a clip-path (a curtain wipe,
 *     a hairline that draws), and an observer measures the CLIPPED box: the same probe showed it
 *     reporting those nodes up to 560 px of scroll late, i.e. well after they were on screen.
 *     Reading the layout box ignores clip-path. A handful of rect reads per frame, batched (all
 *     reads, then all writes), only while scrolling and only until each one has fired.
 *
 * Both detectors cover elements that slide in HORIZONTALLY inside the pinned "areas" chapter (the
 * reference needs `containerAnimation` for that): they look at where the box really is.
 *
 * Not handled here (they have their own driver):
 *   .hero, .intro        reveal with CSS animations at first paint
 *   .slide               revealed per slide by <Slider>
 *   [data-sold-panel]    revealed per record by <SoldShowcase>
 *   [data-manual-reveal] revealed by a bespoke timeline (see engine/home.ts)
 */
const SELF_DRIVEN = ".hero, .intro, .slide, [data-sold-panel]";

export const isSelfDriven = (node: Element): boolean => !!node.closest(`${SELF_DRIVEN}, ${MANUAL_REVEAL}`);

/** How long to keep checking after the last scroll event (smoothed scrubs keep moving). */
const SETTLE_MS = 900;
/** An element counts as visible when its top is above this fraction of the viewport. */
const TRIGGER_AT = 0.94;
/** Nodes whose hidden state is a clip-path: an IntersectionObserver would see them too late. */
const CLIPPED = '[data-reveal="slide"], [data-reveal="line-x"]';

const reveal = (node: Element): void => node.setAttribute("data-revealed", "");

// ── detector 1: IntersectionObserver ─────────────────────────────────────────────────────────────
let observer: IntersectionObserver | null = null;
const observed = new Set<Element>();

function observe(node: Element): void {
  if (typeof IntersectionObserver === "undefined") return reveal(node); // no observer: show everything
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const box = entry.boundingClientRect;
        if (!entry.isIntersecting || (!box.width && !box.height)) continue; // display:none counts as not visible
        reveal(entry.target);
        observed.delete(entry.target);
        observer?.unobserve(entry.target);
      }
      if (!observed.size) {
        observer?.disconnect();
        observer = null;
      }
    },
    { rootMargin: `0px 0px -${Math.round((1 - TRIGGER_AT) * 100)}% 0px`, threshold: 0 },
  );
  observed.add(node);
  observer.observe(node);
}

// ── detector 2: rect check, for the clip-path nodes only ─────────────────────────────────────────
const polled = new Set<Element>();
let raf = 0;
let listening = false;
let lastActivity = 0;

function visible(node: Element): boolean {
  const r = node.getBoundingClientRect();
  if (!r.width && !r.height) return false; // display:none (e.g. an inactive tab)
  return r.top < window.innerHeight * TRIGGER_AT && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
}

function check(): void {
  raf = 0;
  // all reads first, then all writes: one style invalidation, not one per node
  const ready: Element[] = [];
  for (const node of polled) if (visible(node)) ready.push(node);
  for (const node of ready) {
    reveal(node);
    polled.delete(node);
  }
  if (!polled.size) return stop();
  if (performance.now() - lastActivity < SETTLE_MS) raf = requestAnimationFrame(check);
}

function wake(): void {
  lastActivity = performance.now();
  if (!raf) raf = requestAnimationFrame(check);
}

function start(): void {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake);
}

function stop(): void {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", wake);
  window.removeEventListener("resize", wake);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/** Reveal `nodes` as they scroll into view. Safe to call repeatedly. */
export function revealWhenVisible(nodes: Iterable<Element>): void {
  let anyPolled = false;
  for (const node of nodes) {
    if (node.hasAttribute("data-revealed")) continue;
    if (node.matches(CLIPPED)) {
      polled.add(node);
      anyPolled = true;
    } else {
      observe(node);
    }
  }
  if (anyPolled) {
    start();
    wake();
  }
}

/** Watch every generic reveal under `root`. Returns a cleanup that stops watching them. */
export function initReveals(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll("[data-reveal]")).filter((n) => !isSelfDriven(n));
  revealWhenVisible(nodes);
  return () => {
    // Stop watching but keep what was revealed: leaving and re-entering a page
    // (Activity keeps it mounted) must not replay every entrance.
    for (const node of nodes) {
      polled.delete(node);
      if (observed.delete(node)) observer?.unobserve(node);
    }
    if (!observed.size) {
      observer?.disconnect();
      observer = null;
    }
    if (!polled.size) stop();
  };
}
