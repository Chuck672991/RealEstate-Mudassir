import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean };

/**
 * One link component for every destination:
 *   "/path" or "/#anchor"  → next/link (client navigation + prefetch)
 *   "#anchor"              → plain anchor (same page)
 *   "tel:" / "mailto:"     → plain anchor
 *   "https://…"            → external, opens safely in a new tab
 */
export function SmartLink({ href, children, prefetch, ...rest }: Props) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={prefetch} {...rest}>
        {children}
      </Link>
    );
  }
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
