import { text } from "@/features/content/policy";
import { isPublishable } from "@/sanity/lib/enums";
import type { MarketStatsDTO } from "@/types/content";

interface RawWindow {
  window?: string | null;
  side?: string | null;
  deals?: number | null;
  range?: string | null;
  status?: string | null;
}

export interface RawStats {
  headline?: {
    closedSales?: number | null;
    totalValue?: number | null;
    average?: number | null;
    windowLabel?: string | null;
    source?: string | null;
    asOf?: string | null;
    status?: string | null;
  } | null;
  windows?: RawWindow[] | null;
  priceBands?: Array<{ label?: string | null; count?: number | null }> | null;
  priceBandsBasis?: string | null;
  showPriceBands?: boolean | null;
  showPriceRanges?: boolean | null;
}

/**
 * Track-record numbers. Returns `null` when there is nothing publishable.
 * See the handling rules documented on the marketStatistics schema type.
 */
export function shapeMarketStats(raw: RawStats | null | undefined): MarketStatsDTO | null {
  if (!raw) return null;

  const h = raw.headline;
  const headlineOk = !!h && isPublishable(h.status) && !!h.closedSales;

  const windows = (raw.windows ?? []).filter((w) => isPublishable(w.status));
  const deals = (window: string, side: string) =>
    windows.find((w) => w.window === window && w.side === side)?.deals ?? 0;
  const range = (window: string, side: string) => text(windows.find((w) => w.window === window && w.side === side)?.range);

  const oneYearSeller = deals("1y", "seller");
  const oneYearBuyer = deals("1y", "buyer");

  const bands = (raw.priceBands ?? [])
    .filter((b): b is { label: string; count: number } => !!b.label && b.count != null)
    .map((b) => ({ label: b.label, count: b.count }));

  const stats: MarketStatsDTO = {
    closedSales: headlineOk ? (h!.closedSales ?? undefined) : undefined,
    totalValue: headlineOk ? (h!.totalValue ?? undefined) : undefined,
    average: headlineOk ? (h!.average ?? undefined) : undefined,
    windowLabel: text(h?.windowLabel) ?? "the last five years",
    source: text(h?.source) ?? "Homes.com agent profile",
    asOf: text(h?.asOf),
    lastYear:
      oneYearSeller + oneYearBuyer > 0
        ? { deals: oneYearSeller + oneYearBuyer, sellerSide: oneYearSeller, buyerSide: oneYearBuyer }
        : undefined,
    fiveYear:
      deals("5y", "seller") + deals("5y", "buyer") > 0
        ? { sellerSide: deals("5y", "seller"), buyerSide: deals("5y", "buyer") }
        : undefined,
    bands,
    bandsBasis: text(raw.priceBandsBasis),
    showBands: raw.showPriceBands !== false && bands.length > 0,
    // Component ranges are published only once the agent has confirmed them.
    ranges: raw.showPriceRanges
      ? { seller: range("5y", "seller"), buyer: range("5y", "buyer") }
      : undefined,
  };

  const hasContent = stats.closedSales || stats.lastYear || stats.showBands;
  return hasContent ? stats : null;
}
