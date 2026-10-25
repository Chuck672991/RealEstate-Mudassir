import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

import { SmartLink } from "./SmartLink";

/**
 * Link whose label "rolls" letter by letter on hover/focus (pointer devices).
 * The label is drawn twice — row A leaves upward while row B arrives from below,
 * staggered left→right. The accessible name is a single sr-only copy.
 */
export function RollLink({
  href,
  label,
  className,
  prefetch,
  current,
}: {
  href: string;
  label: string;
  className?: string;
  prefetch?: boolean;
  current?: boolean;
}) {
  const chars = [...label].map((c, i) => (
    <span key={i} className="rv-char" style={{ "--i": i } as CSSProperties}>
      {c}
    </span>
  ));
  return (
    <SmartLink
      href={href}
      prefetch={prefetch}
      className={cn("roll-host", className)}
      aria-current={current ? "page" : undefined}
    >
      <span className="sr-only">{label}</span>
      <span className="roll" aria-hidden="true">
        <span className="roll__row" data-row="a">
          {chars}
        </span>
        <span className="roll__row" data-row="b">
          {chars}
        </span>
      </span>
    </SmartLink>
  );
}
