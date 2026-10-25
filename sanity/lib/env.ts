/**
 * Public Sanity identifiers. These are NOT secrets (they ship in the Studio and
 * browser bundles), which is why they may use the NEXT_PUBLIC_ prefix and be
 * read from Studio code. Tokens are never read here.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-02-19";

/** True when a real Sanity project has been configured. */
export const hasSanityProject = projectId.length > 0;
