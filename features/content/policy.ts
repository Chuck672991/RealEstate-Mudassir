import { isPublishable } from "@/sanity/lib/enums";

/** A value plus how well the research supports it (`verifiedText` / `verifiedNumber`). */
export interface RawClaim<T> {
  value?: T | null;
  status?: string | null;
  note?: string | null;
}

/**
 * The publication gate for individual facts. Returns the value ONLY when its
 * status is verified/calculated and it is non-empty; otherwise `undefined`, so a
 * caller cannot render an unverified phone number, email, title or link.
 */
export function claimValue<T>(claim: RawClaim<T> | null | undefined): T | undefined {
  if (!claim || !isPublishable(claim.status)) return undefined;
  const value = claim.value;
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

/** Keep only items whose own `status` is publishable. */
export function publishedOnly<T extends { status?: string | null }>(items: T[] | null | undefined): T[] {
  return (items ?? []).filter((item) => isPublishable(item.status));
}

/** A CMS read returns `null` for an unset field; the app's own types use `undefined`. */
export const opt = <T>(value: T | null | undefined): T | undefined => value ?? undefined;

/** Trim; empty → undefined. */
export const text = (value: string | null | undefined): string | undefined => {
  const v = value?.trim();
  return v ? v : undefined;
};
