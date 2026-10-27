import { noop } from "./config";

/**
 * `will-change: transform`, selectively and temporarily.
 *
 * The pinned scenes move big elements with scripted transforms every scrolled frame (a full-screen wall zooming,
 * a rail of photographs sliding sideways, a photograph scaling under the clouds). Chrome only keeps such an element
 * on its own compositor layer if it is told to; otherwise each change can mean repainting it and rebuilding the layer
 * tree. Measured at 12× CPU slowdown with the elements pre-promoted (docs/PERFORMANCE.md):
 *
 *   hero / top of page   main-thread time per frame 15.1 → 11.9 ms   frames over 33 ms 7.8 % → 4.0 %
 *   sideways chapter     18.5 → 15.8 ms                                21.7 % → 10.6 %
 *   clouds + aerial      14.6 → 11.7 ms                                6.5 % → 1.2 %
 *
 * It is not free, and not applied everywhere:
 *   • a promoted layer keeps the resolution it was first rasterised at, so an element that is scaled UP a long way
 *     looks a little softer (measured with a Laplacian sharpness score on settled screenshots: the hero wall at the end
 *     of its ×2 zoom −7 %, the closing scene −4…−7 %; the sold stage, which is also scaled ×2, 0 %). The closing scene
 *     is therefore NOT promoted: it gained only ≈ 6 % of main-thread time per frame and no fewer slow frames
 *     (9.4 → 8.8 ms, 2.2 % → 2.7 % of frames over 33 ms), not worth softening its full-bleed photograph and giant type;
 *   • every promoted layer is GPU memory (a full-screen one is ≈ 5 MB at 1× and ≈ 20 MB at 2×), and holding all of
 *     them for the whole visit would trade a smooth scroll for a bloated tab. So the hint is on only while the scene
 *     is within about one viewport of the screen — `margin` above and below — and cleared the moment it is not.
 *     An IntersectionObserver does the watching: no scroll listener, no per-frame work.
 *
 * `targets` are the elements the scene animates; `container` is the element whose position says whether the
 * scene is near (for a pinned scene, its tall scroll area).
 */
export function promoteWhileNear(container: Element | null | undefined, targets: Iterable<Element | null | undefined>, margin = "100%"): () => void {
  const list = [...targets].filter((t): t is HTMLElement => t instanceof HTMLElement);
  if (!container || !list.length || typeof IntersectionObserver === "undefined") return noop;

  const set = (near: boolean) => {
    for (const el of list) el.style.willChange = near ? "transform" : "";
  };
  const observer = new IntersectionObserver((entries) => set(entries[entries.length - 1]!.isIntersecting), {
    rootMargin: `${margin} 0px ${margin} 0px`,
  });
  observer.observe(container);
  return () => {
    observer.disconnect();
    set(false);
  };
}
