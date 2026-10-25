import "server-only";

import { cacheLife } from "next/cache";
import { draftMode } from "next/headers";

import { getLive } from "./live";
import { evaluateLocal } from "./groq-local";
import { resolveContentSource } from "./source";

/** Webhook revalidation target (see app/api/revalidate/route.ts). */
export const CONTENT_TAG = "sanity-content";

/**
 * CMS read. Cached with a safety-net lifetime; real freshness comes from tag
 * invalidation (Sanity Live and the webhook). In Draft Mode Next.js re-runs every
 * cached scope per request, and this one switches to the `drafts` perspective.
 */
async function fromSanity(query: string, params: Record<string, unknown>) {
  "use cache";
  const { isEnabled } = await draftMode();
  const { data } = await getLive().sanityFetch({
    query,
    params,
    perspective: isEnabled ? "drafts" : "published",
    stega: false,
    tags: [CONTENT_TAG],
  });
  // next-sanity sets a one-year lifetime; clamp it (call last so it wins).
  cacheLife({ stale: 600, revalidate: 3600, expire: 60 * 60 * 24 * 30 });
  return data;
}

/** Offline read from content_seed.json (see lib/sanity/groq-local.ts). */
async function fromLocal(query: string, params: Record<string, unknown>) {
  "use cache";
  cacheLife("max");
  return evaluateLocal(query, params);
}

/**
 * The ONE entry point for reading content. Feature modules (features/*) call
 * this with a query from lib/sanity/queries.ts and shape the result into a
 * minimal, policy-checked DTO. Nothing else may import the clients.
 */
export async function fetchContent<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const data = resolveContentSource() === "sanity" ? await fromSanity(query, params) : await fromLocal(query, params);
  return data as T;
}
