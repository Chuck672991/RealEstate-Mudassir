import "server-only";

import { defineLive } from "next-sanity/live";

import { getClient } from "./client";

/**
 * Sanity Live for Cache Components (see next-sanity docs).
 *
 *  • `sanityFetch` tags each cached read with the content tags returned by
 *    Content Lake, so published edits invalidate exactly the pages they affect.
 *  • `<SanityLive />` (mounted in the site layout) subscribes to the Live
 *    Content API and revalidates those tags.
 *
 * `serverToken` is a Viewer-role token read from the server environment only. It
 * is what lets Draft Mode read unpublished drafts; published reads authenticate
 * through the client itself (lib/sanity/client.ts) when a token is set, which is
 * what a private dataset needs. `browserToken: false` — no token is ever sent to the
 * browser.
 */
let live: ReturnType<typeof create> | null = null;

function create() {
  return defineLive({
    client: getClient(),
    serverToken: process.env.SANITY_API_READ_TOKEN?.trim() || false,
    browserToken: false,
    strict: true,
  });
}

export function getLive() {
  return (live ??= create());
}
