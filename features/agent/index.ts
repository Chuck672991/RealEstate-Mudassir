import "server-only";

import { fetchContent } from "@/lib/sanity/fetch";
import { AGENT_QUERY } from "@/lib/sanity/queries";
import type { AgentDTO } from "@/types/content";

import { shapeAgent, type RawAgent } from "./shape";

export async function getAgent(): Promise<AgentDTO> {
  return shapeAgent(await fetchContent<RawAgent | null>(AGENT_QUERY));
}
