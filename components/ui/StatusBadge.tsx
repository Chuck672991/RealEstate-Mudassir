import { cn } from "@/lib/utils/cn";
import type { PropertyStatus } from "@/sanity/lib/enums";

/**
 * Status chip. The status always comes from the CMS, and the meaning is carried
 * by the TEXT (“For sale”, “Under contract”, “Sold”) — colour is only reinforcement.
 */
export function StatusBadge({ status, label, className }: { status: PropertyStatus; label: string; className?: string }) {
  return (
    <span className={cn("status t-label", `status--${status}`, className)} data-status={status}>
      {label}
    </span>
  );
}
