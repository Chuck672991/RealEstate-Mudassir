"use client";

import { useEffect } from "react";

import { usePrefersReducedMotion } from "@/lib/utils/hooks";

import { initBadge } from "./engine/badge";
import { runIntro } from "./engine/intro";
import { createSmoothScroll, initAnchors, initSnapAssist, lockScroll, unlockScroll } from "./engine/scroll";
import { initFrameMonitor } from "./engine/tier";
import { initTone } from "./engine/tone";

/**
 * Site-wide motion layer. Renders nothing; mounted once in the (site) layout so
 * it survives client navigations.
 *
 *  • Always: header tone switching, scroll-lock for dialogs, `motion-ready`.
 *  • Motion allowed: Lenis smooth scroll (desktop mouse), anchor + snap assists,
 *    the rotating badge, the first-visit intro.
 *  • Per-page enhancements (reveals, fit-text, magnetic) live in <PageMotion />,
 *    rendered inside each page — see the note there.
 *
 * The pre-paint script (prepaint.ts) already set `.motion-ok` / `.intro-on` from the
 * same media queries; this component confirms by adding `.motion-ready`, and keeps
 * the classes in step if the visitor changes their motion preference while browsing.
 * Nothing here runs on the server, and nothing changes the server-rendered markup.
 */
export function MotionProvider() {
  const reduced = usePrefersReducedMotion();

  // ── Site-wide (re-created only when the motion preference changes) ───────────
  useEffect(() => {
    const html = document.documentElement;
    const cleanups: Array<() => void> = [];

    if (reduced) {
      html.classList.remove("motion-ok", "intro-on");
    } else {
      html.classList.add("motion-ok");
      cleanups.push(createSmoothScroll(), initAnchors(), initSnapAssist(), initBadge(), runIntro(), initFrameMonitor());
    }
    html.classList.add("motion-ready"); // cancels the pre-paint watchdog

    cleanups.push(initTone());

    const lock = () => lockScroll();
    const unlock = () => unlockScroll();
    window.addEventListener("ms:scroll-lock", lock);
    window.addEventListener("ms:scroll-unlock", unlock);

    return () => {
      window.removeEventListener("ms:scroll-lock", lock);
      window.removeEventListener("ms:scroll-unlock", unlock);
      cleanups.reverse().forEach((fn) => fn());
    };
  }, [reduced]);

  return null;
}
