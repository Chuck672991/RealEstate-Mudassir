"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { preloadLazyImages, useHydrated } from "@/lib/utils/hooks";

export interface SoldTab {
  id: string;
  /** Short label in the list, e.g. "Lyons — Condo". */
  label: string;
  /** Server-rendered stage content for this sale. */
  stage: ReactNode;
}

/**
 * “Recently sold” stage: a tab list (ARIA tabs pattern) over a full-bleed stage.
 * Selecting a tab wipes the next stage in with a diagonal curtain and slides the
 * highlight bar to the chosen item — the reference's amenities interaction, here
 * driven by real sale records.
 *
 * Keyboard: ←/→/↑/↓ move between tabs (roving tabindex), Home/End jump.
 * Without JS all stages are listed in order.
 */
export function SoldShowcase({ tabs, heading }: { tabs: SoldTab[]; heading: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const ready = useHydrated();
  const listRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ y: 0, h: 0 });
  // Entrance animations wait until the stage has actually been on screen once.
  const [seen, setSeen] = useState(false);
  const uid = useId();

  const select = useCallback(
    (next: number, focus = false) => {
      if (next === index) return;
      setPrev(index);
      setIndex(next);
      window.setTimeout(() => setPrev(null), 1250);
      if (focus) listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    },
    [index],
  );

  // slide the highlight bar to the active tab
  useEffect(() => {
    const el = listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    if (el) setBar({ y: el.offsetTop, h: el.offsetHeight });
  }, [index, ready, tabs.length]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => entry?.isIntersecting && setSeen(true), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // keep reveal states in sync (same vocabulary as the slider)
  useEffect(() => {
    if (!seen) return;
    stageRef.current?.querySelectorAll<HTMLElement>("[data-sold-panel]").forEach((panel) => {
      const active = Number(panel.dataset.index) === index;
      panel.querySelectorAll<HTMLElement>("[data-reveal]").forEach((n) => {
        if (active) n.setAttribute("data-revealed", "");
        else n.removeAttribute("data-revealed");
      });
    });
  }, [index, ready, seen]);

  useEffect(() => {
    if (seen) preloadLazyImages(stageRef.current);
  }, [seen]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = tabs.length;
    const map: Record<string, number> = {
      ArrowRight: (index + 1) % n,
      ArrowDown: (index + 1) % n,
      ArrowLeft: (index - 1 + n) % n,
      ArrowUp: (index - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key]!, true);
    }
  };

  return (
    <div className="sold-show" data-ready={ready ? "" : undefined}>
      <div className="sold-show__stage" data-sold-stage="" ref={stageRef}>
        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            id={`${uid}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${i}`}
            data-sold-panel=""
            data-index={i}
            className="sold-panel"
            data-state={!ready ? "all" : i === index ? "active" : i === prev ? "leaving" : "idle"}
            hidden={ready && i !== index && i !== prev ? true : undefined}
            tabIndex={0}
          >
            {tab.stage}
          </div>
        ))}
      </div>

      <div className="sold-show__ui">
        <div className="sold-show__heading scrim">{heading}</div>
        <div className="sold-show__nav scrim">
          <div className="sold-show__list" role="tablist" aria-label="Recently sold homes" aria-orientation="vertical" ref={listRef} onKeyDown={onKey}>
            <span className="sold-show__bar" aria-hidden="true" style={{ transform: `translateY(${bar.y}px)`, height: bar.h }} />
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                id={`${uid}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === index}
                aria-controls={`${uid}-panel-${i}`}
                tabIndex={i === index ? 0 : -1}
                className={cn("sold-show__tab t-display t-h6", i === index && "is-active")}
                onClick={() => select(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
