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
import { isLite, isPinnedFull, setLite, whenLite } from "./tier";

const TARGETS = ".flower, [data-live-watch]";

/**
 * The lite tier (engine/tier.ts) never plays the flower videos: they are decoded in software, and measured on
 * an M4 two of them cost 27–45 % of a core, so on a slow machine they are the first thing to go. Their still
 * frame (the poster) is what shows. That also means nothing is downloaded: the videos are `preload="none"`.
 */
function setLive(node: Element, live: boolean): void {
  if (live) node.setAttribute("data-live", "");
  else node.removeAttribute("data-live");
  const video = node.querySelector("video");
  if (!video) return;
  if (live && !isLite()) {
    // a refused play() just leaves the poster up
    void video.play().then(() => watchDecoding(video), () => {});
  } else video.pause();
}

/** Below this share of frames dropped a video is fine; at or above it the machine cannot keep up with the decode. */
const DROPPED_SHARE = 0.25;
/** …judged only once this many frames have gone by, so the first moments of buffering cannot decide it. */
const MIN_FRAMES = 24;
const watched = new WeakSet<HTMLVideoElement>();

/**
 * For the first few seconds of a video's playback, count the frames the browser had to drop. If a quarter or
 * more were dropped, software decoding is not keeping up on this machine: switch the site to its lite tier
 * (for the rest of the session). If it is dropping nothing for 4 s, that clip is trusted and not checked again
 * until it next starts.
 */
function watchDecoding(video: HTMLVideoElement): void {
  if (watched.has(video) || isLite() || isPinnedFull() || typeof video.getVideoPlaybackQuality !== "function") return;
  watched.add(video);
  let checks = 0;
  const timer = window.setInterval(() => {
    const done = () => {
      window.clearInterval(timer);
      watched.delete(video);
    };
    if (video.paused || isLite()) return done();
    const { totalVideoFrames, droppedVideoFrames } = video.getVideoPlaybackQuality();
    if (totalVideoFrames >= MIN_FRAMES && droppedVideoFrames / totalVideoFrames >= DROPPED_SHARE) {
      done();
      return setLite("a flower video is dropping frames");
    }
    if (++checks >= 4) done();
  }, 1000);
}

export function initLive(): () => void {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
  if (!nodes.length) return () => {};

  if (typeof IntersectionObserver === "undefined") {
    nodes.forEach((n) => setLive(n, true));
    return () => nodes.forEach((n) => setLive(n, false));
  }

  // the tier flips to lite: stop every video that has started and let go of its decoder (the poster comes back).
  // Only a clip that has really started is touched: load() on one that never did would itself begin a download,
  // and a session that is lite from the start (Save-Data, a slow connection, ?perf=lite) must fetch nothing.
  const offLite = whenLite(() => {
    for (const video of document.querySelectorAll<HTMLVideoElement>(".flower video")) {
      const started = !video.paused || video.readyState > 0 || video.networkState === HTMLMediaElement.NETWORK_LOADING;
      if (!started) continue;
      video.pause();
      video.load();
    }
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) setLive(entry.target, entry.isIntersecting);
    },
    { rootMargin: "25% 0px 25% 0px" },
  );
  nodes.forEach((n) => io.observe(n));
  return () => {
    offLite();
    io.disconnect();
    nodes.forEach((n) => setLive(n, false));
  };
}
