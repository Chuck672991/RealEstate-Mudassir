import type { CSSProperties, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * SERVER-SPLIT TEXT for CSS-driven reveals (see styles/structure/motion.css).
 *
 * The characters/words are split here, at render time, so:
 *   • the reveal needs no JS split step, no layout measurement and no flash;
 *   • the plain text is still the first thing a screen reader / crawler sees
 *     (an `sr-only` copy), while the animated pieces are `aria-hidden`.
 *
 * mode:
 *   "h"  heading characters flip in (rotateY)
 *   "a"  accent characters flip up from the right (rotateX)
 *   "top" accent characters unfold downward from their top edge (rotateX −90°)
 *   "w"  statement words rise through a mask
 *   "ctn" the whole element fades up (no splitting)
 */
export type RevealMode = "h" | "a" | "top" | "w" | "ctn" | "line" | "line-x";

interface RevealTextProps {
  text: string;
  mode?: "h" | "a" | "top" | "w";
  as?: ElementType;
  className?: string;
  /** Extra delay before this element starts, in seconds (added to the theme's base delay). */
  delay?: number;
  /** Render an sr-only copy. Turn off when a parent already provides the accessible name. */
  srText?: boolean;
  id?: string;
  /** Extra attributes for the motion layer (e.g. data-fit-text). */
  dataAttrs?: Record<string, string | number | boolean | undefined>;
}

export function RevealText({
  text,
  mode = "h",
  as: Tag = "span",
  className,
  delay,
  srText = true,
  id,
  dataAttrs,
}: RevealTextProps) {
  const style = delay != null ? ({ "--rd": `calc(var(--delay-reveal) + ${delay}s)` } as CSSProperties) : undefined;
  const words = text.split(/\s+/).filter(Boolean);

  let index = 0;
  const pieces: ReactNode =
    mode === "w"
      ? words.map((word, wi) => (
          <span key={`${word}-${wi}`}>
            <span className="rv-word">
              <span className="rv-mask">
                <span className="rv-word-inner" style={{ "--i": wi } as CSSProperties}>
                  {word}
                </span>
              </span>
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))
      : words.map((word, wi) => (
          <span key={`${word}-${wi}`}>
            <span className="rv-word">
              {[...word].map((char) => (
                <span key={index} className="rv-char" style={{ "--i": index++ } as CSSProperties}>
                  {char}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ));

  return (
    <Tag id={id} className={cn(className)} data-reveal={mode} style={style} {...dataAttrs}>
      {srText ? <span className="sr-only">{text}</span> : null}
      <span aria-hidden="true">{pieces}</span>
    </Tag>
  );
}

/** Wraps arbitrary content in a fade-up / hairline / slide reveal. */
export function Reveal({
  as: Tag = "div",
  mode = "ctn",
  delay,
  className,
  children,
}: {
  as?: ElementType;
  mode?: "ctn" | "line" | "line-x" | "slide";
  delay?: number;
  className?: string;
  children?: ReactNode;
}) {
  const style = delay != null ? ({ "--rd": `calc(var(--delay-reveal) + ${delay}s)` } as CSSProperties) : undefined;
  return (
    <Tag className={className} data-reveal={mode} style={style}>
      {children}
    </Tag>
  );
}
