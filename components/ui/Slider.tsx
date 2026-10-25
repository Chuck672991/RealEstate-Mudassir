"use client";

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { preloadLazyImages, useHydrated, usePrefersReducedMotion } from "@/lib/utils/hooks";

/**
 * Accessible carousel (WAI-ARIA "carousel" pattern).
 *
 *  • Slides are server-rendered children; this island only decides which is active.
 *  • Without JS every slide is simply listed; once hydrated (`data-ready`) one shows at a time.
 *  • Auto-advance (WCAG 2.2.2): off for reduced motion; pauses on hover, focus, when the
 *    slider is < 20% visible, and when the tab is hidden; has an explicit Pause/Play button.
 *  • The live region is "polite" only while paused, so screen readers are not interrupted
 *    by the timer.
 *  • Reveal states reuse the CSS vocabulary: the active slide's `[data-reveal]` nodes get
 *    `data-revealed`; the previous slide's are cleared so they animate out.
 */
export function Slider({
  label,
  children,
  autoplayMs,
  className,
  countLabel = "of",
}: {
  label: string;
  children: ReactNode;
  /** Milliseconds between slides; omit/0 to disable autoplay. */
  autoplayMs?: number;
  className?: string;
  countLabel?: string;
}) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const ready = useHydrated();
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  // Entrance animations wait until the slider has actually been on screen once.
  const [seen, setSeen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);

  const canAutoplay = !!autoplayMs && autoplayMs > 0 && count > 1 && !reduced;
  const playing = canAutoplay && !userPaused && !hoverPaused && visible;

  const go = useCallback(
    (next: number) => {
      if (busy.current || count < 2) return;
      const target = (next + count) % count;
      if (target === index) return;
      busy.current = true;
      setPrev(index);
      setIndex(target);
      window.setTimeout(() => {
        setPrev(null);
        busy.current = false;
      }, 1250);
    },
    [count, index],
  );

  // visibility (IntersectionObserver) + tab visibility
  useEffect(() => {
    const el = root.current;
    let io: IntersectionObserver | undefined;
    if (el) {
      io = new IntersectionObserver(
        ([entry]) => {
          const on = !!entry && entry.intersectionRatio >= 0.2;
          setVisible(on);
          if (on) setSeen(true);
        },
        { threshold: [0, 0.2, 0.5] },
      );
      io.observe(el);
    }
    const onVisibility = () => setHoverPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // auto-advance
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => go(index + 1), autoplayMs);
    return () => window.clearTimeout(timer.current);
  }, [playing, index, autoplayMs, go]);

  // drive the CSS reveal states for the active / leaving slide
  useEffect(() => {
    const el = root.current;
    if (!el || !seen) return;
    el.querySelectorAll<HTMLElement>(".slide").forEach((slide, i) => {
      const active = i === index;
      slide.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        if (active) node.setAttribute("data-revealed", "");
        else node.removeAttribute("data-revealed");
      });
    });
  }, [index, ready, seen]);

  useEffect(() => {
    if (seen) preloadLazyImages(root.current);
  }, [seen]);

  if (count === 0) return null;

  return (
    <div
      ref={root}
      className={cn("slider", className)}
      data-slider=""
      data-ready={ready ? "" : undefined}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={() => setHoverPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="slider__viewport" id={`${id}-viewport`} aria-live={playing ? "off" : "polite"} aria-atomic="false">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} ${countLabel} ${count}`}
            data-state={!ready ? "all" : i === index ? "active" : i === prev ? "leaving" : "idle"}
            aria-hidden={ready && i !== index ? true : undefined}
            inert={ready && i !== index ? true : undefined}
          >
            {slide}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="slider__controls t-label">
          <button type="button" className="slider__btn" aria-controls={`${id}-viewport`} onClick={() => go(index - 1)}>
            <span className="sr-only">Previous slide</span>
            <span aria-hidden="true">‹</span>
          </button>
          <span className="slider__count tabular" aria-hidden="true">
            {index + 1}
          </span>
          <span className="slider__progress" aria-hidden="true">
            <span
              key={`${index}-${playing}`}
              className="slider__bar"
              data-running={playing ? "" : undefined}
              style={{ animationDuration: `${autoplayMs ?? 0}ms` }}
            />
          </span>
          <span className="slider__count tabular" aria-hidden="true">
            {count}
          </span>
          <button type="button" className="slider__btn" aria-controls={`${id}-viewport`} onClick={() => go(index + 1)}>
            <span className="sr-only">Next slide</span>
            <span aria-hidden="true">›</span>
          </button>
          {canAutoplay ? (
            <button
              type="button"
              className="slider__btn slider__pause"
              aria-pressed={userPaused}
              onClick={() => setUserPaused((v) => !v)}
            >
              <span className="sr-only">{userPaused ? "Resume automatic slide changes" : "Pause automatic slide changes"}</span>
              <span aria-hidden="true">{userPaused ? "Play" : "Pause"}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
