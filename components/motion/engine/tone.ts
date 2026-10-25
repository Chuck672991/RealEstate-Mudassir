/**
 * HEADER TONE — the fixed UI (badge, nav, menu button, scroll rail) recolours
 * itself according to what is behind its centre point (reference §G6, which uses
 * one ScrollTrigger per element/section pair; one hit-test per frame is equivalent
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
 */
const IGNORE = ".site-header, .scroll-rail, .scroll-cue";

export function initTone(): () => void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-ui]"));
  if (!targets.length) return () => {};
  let raf = 0;

  const surfaceAt = (x: number, y: number): { tone: "light" | "dark"; scrim: boolean } => {
    for (const hit of document.elementsFromPoint(x, y)) {
      if (hit.closest(IGNORE)) continue;
      const surface = hit.closest("[data-bg]");
      if (surface) return { tone: surface.getAttribute("data-bg") === "dark" ? "dark" : "light", scrim: surface.hasAttribute("data-scrim") };
    }
    return { tone: "light", scrim: false };
  };

  const update = () => {
    raf = 0;
    for (const el of targets) {
      const box = el.getBoundingClientRect();
      if (!box.width && !box.height) continue; // hidden at this breakpoint
      const { tone, scrim } = surfaceAt(box.left + box.width / 2, box.top + box.height / 2);
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
      if (el.hasAttribute("data-scrim") !== scrim) el.toggleAttribute("data-scrim", scrim);
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}
