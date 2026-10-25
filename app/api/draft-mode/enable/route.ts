import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { getClient } from "@/lib/sanity/client";
import { resolveContentSource } from "@/lib/sanity/source";

/**
 * Enables Draft Mode for the Studio's Presentation tool (see sanity.config.ts →
 * presentationTool.previewUrl.previewMode.enable). Requires a Viewer-role token in
 * SANITY_API_READ_TOKEN; without one (or without a Sanity project) it answers 501
 * rather than pretending to work.
 */
export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (resolveContentSource() !== "sanity" || !token) {
    return new Response("Draft Mode is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_READ_TOKEN.", {
      status: 501,
    });
  }
  const { GET: enable } = defineEnableDraftMode({ client: getClient().withConfig({ token }) });
  return enable(request);
}
