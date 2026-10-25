import "server-only";

import { hasSanityProject } from "@/sanity/lib/env";

export type ContentSource = "sanity" | "local";

/**
 * Where content comes from.
 *
 *   CONTENT_SOURCE=sanity  require the CMS (fail loudly if it is not configured)
 *   CONTENT_SOURCE=local   always use the bundled content_seed.json
 *   CONTENT_SOURCE=auto    (default) CMS when a project id is set, otherwise local
 *
 * "Local content" is a deliberate fallback, not an accident: it lets the whole
 * site build and render with no CMS connection (fresh clone, CI, offline demo)
 * using exactly the documents the seed script would create.
 */
export function resolveContentSource(): ContentSource {
  const preference = (process.env.CONTENT_SOURCE ?? "auto").trim().toLowerCase();
  if (preference === "local") return "local";
  if (preference === "sanity") {
    if (!hasSanityProject) {
      throw new Error(
        "CONTENT_SOURCE=sanity but NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to your environment or use CONTENT_SOURCE=auto.",
      );
    }
    return "sanity";
  }
  return hasSanityProject ? "sanity" : "local";
}
