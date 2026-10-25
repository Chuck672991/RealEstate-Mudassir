import { noop } from "./config";

/**
 * Rotating badge (reference §G7): the ring turns at a constant 30°/s (a CSS
 * animation, so it costs nothing while idle), speeds up with scroll velocity and
 * reverses with scroll direction, then settles back ~1.2s after you stop.
 * Drives the animation's playbackRate; does nothing when the animation is off
 * (prefers-reduced-motion removes it in CSS).
 */
export function initBadge(): () => void {
  const ring = document.querySelector<SVGElement>(".badge-ring");
  const animation = ring?.getAnimations?.().find((a) => (a as CSSAnimation).animationName === "badge-spin");
  if (!animation) return noop;

  let direction = 1;
  let rate = 1;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let lastMoved = 0;
  let raf = 0;

  const frame = (now: number) => {
    const dt = Math.max(1, Math.min(now - lastT, 100));
    const y = window.scrollY;
    const velocity = (y - lastY) / dt; // px per ms
    lastY = y;
    lastT = now;

    if (Math.abs(velocity) > 0.02) {
      direction = velocity > 0 ? 1 : -1;
      lastMoved = now;
    }
    const idle = now - lastMoved > 120;
    const target = direction * (idle ? 1 : 1 + Math.min(Math.abs(velocity) * 1.6, 4));
    rate += (target - rate) * (idle ? 0.045 : 0.2); // settle slowly, react quickly
    animation.playbackRate = rate;

    if (!idle || Math.abs(target - rate) > 0.01) raf = requestAnimationFrame(frame);
    else raf = 0;
  };

  const wake = () => {
    if (!raf) {
      lastT = performance.now();
      lastY = window.scrollY;
      raf = requestAnimationFrame(frame);
    }
  };

  window.addEventListener("scroll", wake, { passive: true });
  return () => {
    window.removeEventListener("scroll", wake);
    if (raf) cancelAnimationFrame(raf);
    animation.playbackRate = 1;
  };
}
