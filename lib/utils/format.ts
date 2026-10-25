/**
 * Deterministic formatters. Every call pins locale + time zone so server and
 * client output can never differ (no hydration mismatches) and nothing depends
 * on the machine running the build.
 */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortMonthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export const formatUsd = (n: number): string => usd.format(n);
/** $32.4M style (keeps one decimal). */
export const formatCompactUsd = (n: number): string => compactUsd.format(n);
export const formatInt = (n: number): string => integer.format(n);

function parseIsoDate(iso: string): Date | null {
  // Accept `YYYY-MM-DD` or a full ISO timestamp. Always interpret as UTC.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatMonthYear(iso?: string | null, short = false): string | null {
  if (!iso) return null;
  const d = parseIsoDate(iso);
  if (!d) return null;
  return (short ? shortMonthYear : monthYear).format(d);
}

export function formatLongDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = parseIsoDate(iso);
  return d ? longDate.format(d) : null;
}

/** 2 → "2", 2.5 → "2.5" (never "2.0"). */
export function formatBaths(n?: number | null): string | null {
  if (n == null) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function pluralize(n: number, one: string, many = `${one}s`): string {
  return `${formatInt(n)} ${n === 1 ? one : many}`;
}

/** "(224) 231-4552" → "tel:+12242314552". Returns null if it is not a 10-digit US number. */
export function toTelHref(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return ten.length === 10 ? `tel:+1${ten}` : null;
}

/** "(224) 231-4552" → "+12242314552" for structured data. */
export function toE164(phone?: string | null): string | null {
  const href = toTelHref(phone);
  return href ? href.slice(4) : null;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
