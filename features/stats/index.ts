import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { MARKET_STATS_QUERY } from "@/lib/sanity/queries";
import type { MarketStatsDTO } from "@/types/content";

import { shapeMarketStats, type RawStats } from "./shape";

export async function getMarketStats(): Promise<MarketStatsDTO | null> {
  return shapeMarketStats(await fetchContent<RawStats | null>(MARKET_STATS_QUERY));
}
