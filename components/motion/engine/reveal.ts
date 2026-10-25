import { MANUAL_REVEAL } from "./config";

/**
 * Scroll-triggered reveals (the CSS half lives in styles/structure/motion.css).
 *
 * Elements carry `data-reveal="<mode>"`; this module only flips `data-revealed`
 * the first time an element's box enters the viewport (the reference's
 * `start: "top bottom"`, `once: true`). All timing, easing and stagger live in CSS.
 *
 * Why not IntersectionObserver: several hidden states are clip-paths (hairlines that
 * draw, curtain wipes), and a browser treats a fully clipped target as not
 * intersecting — it would never fire. Reading the layout box ignores clip-path, and
 * the same check also covers elements that slide in HORIZONTALLY inside the pinned
 * "areas" chapter (the reference needs `containerAnimation` for that). The work is a
 * few rect reads per animation frame while scrolling, and stops once nothing is left.
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

const pending = new Set<Element>();
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
  for (const node of pending) {
    if (!visible(node)) continue;
    node.setAttribute("data-revealed", "");
    pending.delete(node);
  }
  if (!pending.size) return stop();
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
  for (const node of nodes) {
    if (!node.hasAttribute("data-revealed")) pending.add(node);
  }
  if (!pending.size) return;
  start();
  wake();
}

/** Watch every generic reveal under `root`. Returns a cleanup that stops watching them. */
export function initReveals(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll("[data-reveal]")).filter((n) => !isSelfDriven(n));
  revealWhenVisible(nodes);
  return () => {
    // Stop watching but keep what was revealed: leaving and re-entering a page
    // (Activity keeps it mounted) must not replay every entrance.
    for (const node of nodes) pending.delete(node);
    if (!pending.size) stop();
  };
}
