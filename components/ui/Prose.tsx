import { PortableText, type PortableTextComponents } from "next-sanity";

import type { PortableTextValue } from "@/types/content";

/** Only these link schemes may come out of the CMS. Anything else renders as plain text. */
export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const trimmed = href.trim();
  return /^(https?:|mailto:|tel:)/i.test(trimmed) ? trimmed : null;
}

const components: PortableTextComponents = {
  // Deliberately tiny: paragraphs, bold/italic, safe links. No raw HTML is ever rendered.
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = safeHref((value as { href?: unknown } | undefined)?.href);
      if (!href) return <>{children}</>;
      const external = /^https?:/i.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

export function Prose({ value, className }: { value: PortableTextValue; className?: string }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
