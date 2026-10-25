import "server-only";

import { createClient, type SanityClient } from "next-sanity";

import { apiVersion, dataset, hasSanityProject, projectId } from "@/sanity/lib/env";

let instance: SanityClient | null = null;

/**
 * Read client for published content. This module is server-only, so a token set
 * here never reaches the browser.
 *
 *  • PUBLIC dataset (the Sanity default): no token needed; reads use the CDN.
 *  • PRIVATE dataset: set SANITY_API_READ_TOKEN (a Viewer-role token). With a token
 *    the client talks to the live API instead of the CDN (the CDN only serves
 *    public data), which is fine because pages are cached (see lib/sanity/fetch.ts).
 *
 * Why a private dataset can be worth it: everything stored in a public dataset is
 * readable by anyone through the API, including fields the website never shows
 * (street addresses, listing URLs). See README → “Public or private dataset”.
 */
export function getClient(): SanityClient {
  if (!hasSanityProject) throw new Error("Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID is empty).");
  const token = process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
  return (instance ??= createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: !token,
    perspective: "published",
    stega: { enabled: false, studioUrl: "/studio" },
  }));
}
