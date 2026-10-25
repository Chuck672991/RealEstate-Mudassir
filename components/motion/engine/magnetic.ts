import { MQ, matches, noop } from "./config";

/**
 * Magnetic buttons (reference §G12): the circle CTAs drift a few pixels toward the
 * pointer and spring back with an elastic ease on leave. Desktop + fine pointer only.
 *
 * JS only writes two custom properties (--mx/--my, --ix/--iy); the smoothing and the
 * elastic return are CSS transitions (--ease-follow / --ease-elastic from the theme),
 * so no animation loop runs and nothing happens when the pointer is idle.
 */
const OUTER = 14; // px of travel at the button's edge
const INNER = 22;

export function initMagnetic(): () => void {
  if (!matches(MQ.finePointer) || !matches(MQ.desktop) || !matches(MQ.noReduced)) return noop;
  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
  const cleanups: Array<() => void> = [];

  for (const el of items) {
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = el.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      el.removeAttribute("data-away");
      el.style.setProperty("--mx", `${(nx * OUTER * 2).toFixed(2)}px`);
      el.style.setProperty("--my", `${(ny * OUTER * 2).toFixed(2)}px`);
      inner?.style.setProperty("--ix", `${(nx * INNER * 2).toFixed(2)}px`);
      inner?.style.setProperty("--iy", `${(ny * INNER * 2).toFixed(2)}px`);
    };
    const leave = () => {
      el.setAttribute("data-away", "");
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
      inner?.style.setProperty("--ix", "0px");
      inner?.style.setProperty("--iy", "0px");
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      for (const prop of ["--mx", "--my"]) el.style.removeProperty(prop);
      for (const prop of ["--ix", "--iy"]) inner?.style.removeProperty(prop);
      el.removeAttribute("data-away");
    });
  }
  return () => cleanups.forEach((fn) => fn());
}
