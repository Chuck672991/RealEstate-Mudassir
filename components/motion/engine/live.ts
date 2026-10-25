/**
 * LIVE ONLY WHILE NEAR THE VIEWPORT — the flower clips and the cloud layers loop forever. They
 * run only while the element is within a quarter of a screen of the viewport: the motion layer
 * sets `data-live` on entry and removes it on exit, the CSS (`.clouds[data-live]`) starts and
 * pauses the cloud animation, and a flower's <video> is played / paused here (it is not even
 * fetched before its first entry: `preload="none"`). Off-screen decoration therefore costs
 * nothing — the reference leaves its clouds running off-screen and plays its clips with the same
 * kind of observer.
 *
 * Without IntersectionObserver everything is simply marked live (it still works, it just
 * does not save the battery). This is not started under `prefers-reduced-motion`
 * (PageMotion.tsx), so those visitors see each flower's poster and nothing moves.
 */
const TARGETS = ".flower, [data-live-watch]";

function setLive(node: Element, live: boolean): void {
  if (live) node.setAttribute("data-live", "");
  else node.removeAttribute("data-live");
  const video = node.querySelector("video");
  if (!video) return;
  if (live) void video.play().catch(() => {}); // a refused play() just leaves the poster up
  else video.pause();
}

export function initLive(): () => void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
  if (!nodes.length) return () => {};

  if (typeof IntersectionObserver === "undefined") {
    nodes.forEach((n) => setLive(n, true));
    return () => nodes.forEach((n) => setLive(n, false));
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) setLive(entry.target, entry.isIntersecting);
    },
    { rootMargin: "25% 0px 25% 0px" },
  );
  nodes.forEach((n) => io.observe(n));
  return () => {
    io.disconnect();
    nodes.forEach((n) => setLive(n, false));
  };
}
