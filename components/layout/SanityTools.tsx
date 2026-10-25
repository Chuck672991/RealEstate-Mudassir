import { draftMode } from "next/headers";
import { Suspense } from "react";
import { VisualEditing } from "next-sanity/visual-editing";

import { getLive } from "@/lib/sanity/live";
import { resolveContentSource } from "@/lib/sanity/source";

/**
 * Editor tooling, mounted once in the site layout.
 *
 * Visitors get nothing from this component: published edits reach them through the
 * webhook (app/api/revalidate) and the cache lifetime in lib/sanity/fetch.ts.
 * Only an editor who has entered Draft Mode (through the Studio's Presentation tool)
 * gets:
 *   • <SanityLive includeDrafts /> – live updates of drafts while editing,
 *   • <VisualEditing />            – click-to-edit overlays,
 *   • a small “Draft mode” pill with an Exit link.
 *
 * Reading Draft Mode is request-time work, so it lives behind <Suspense>. That
 * boundary is only created when a CMS is connected — in local-content mode this
 * component renders nothing and adds no streaming boundary (which keeps unknown
 * URLs answering with a real 404 status).
 */
export function SanityTools() {
  if (resolveContentSource() !== "sanity") return null;
  return (
    <Suspense fallback={null}>
      <EditorTools />
    </Suspense>
  );
}

async function EditorTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const { SanityLive } = getLive();

  return (
    <>
      <SanityLive includeDrafts />
      <VisualEditing />
      <aside className="draft-pill t-label" aria-label="Draft mode">
        <span>Draft mode</span>
        {/* A plain anchor (never prefetched) to the route handler: works without JS. */}
        <a href="/api/draft-mode/disable">Exit</a>
      </aside>
    </>
  );
}
