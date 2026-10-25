import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { SmartLink } from "./SmartLink";

/**
 * The signature call-to-action: a hairline ring with two short arcs that grow to
 * half the circumference on hover/focus. Pure CSS (styles/structure/chrome.css);
 * the motion layer adds a magnetic pull on fine-pointer devices via data-magnetic.
 */
export function CircleButton({
  href,
  children,
  className,
  tone,
  openContact,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Force light/dark ink when the surface can't be inferred. */
  tone?: "light" | "dark";
  /** Progressive enhancement: JS upgrades this link to open the contact dialog. */
  openContact?: boolean;
}) {
  return (
    <SmartLink
      href={href}
      className={cn("circle-btn", className)}
      data-magnetic=""
      data-tone={tone}
      data-open-contact={openContact ? "" : undefined}
    >
      <svg className="circle-btn__ring" viewBox="0 0 207 207" aria-hidden="true" focusable="false">
        <circle className="circle-btn__base" cx="103.5" cy="103.5" r="102.5" />
        <circle className="circle-btn__arc" cx="103.5" cy="103.5" r="102.5" pathLength="100" />
        <circle className="circle-btn__arc circle-btn__arc--b" cx="103.5" cy="103.5" r="102.5" pathLength="100" />
      </svg>
      <span className="circle-btn__label t-label" data-magnetic-inner="">
        {children}
      </span>
    </SmartLink>
  );
}

/** Outlined pill button (secondary actions, form submit). */
export function PillButton({
  href,
  children,
  className,
  openContact,
  contactTopic,
  contactSubject,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  openContact?: boolean;
  /** Preselects a topic in the contact dialog (must match one of the site's topics). */
  contactTopic?: string;
  /** Context sent with the message, e.g. the home being asked about. */
  contactSubject?: string;
}) {
  return (
    <SmartLink
      href={href}
      className={cn("pill-btn t-label", className)}
      data-open-contact={openContact ? "" : undefined}
      data-topic={contactTopic}
      data-subject={contactSubject}
    >
      {children}
    </SmartLink>
  );
}
