"use client";

/**
 * Sanity Studio configuration, mounted at /studio by app/(studio)/studio/[[...tool]]/page.tsx.
 *
 * The "use client" directive is required: it lets the (server) Studio route pass
 * this config object to the (client) Studio component.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { SINGLETON_TYPES } from "./sanity/lib/enums";
import { apiVersion, dataset, projectId } from "./sanity/lib/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const singletons: readonly string[] = SINGLETON_TYPES;

export default defineConfig({
  name: "default",
  title: "Mudassir Siddiqui — Content",
  basePath: "/studio",
  // A well-formed placeholder keeps the module importable before a project exists;
  // the /studio page shows setup instructions instead of mounting the Studio then.
  projectId: projectId || "unconfigured",
  dataset,
  schema: {
    types: schemaTypes,
    // Hide “create new” entries for documents that must only exist once.
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.includes(schemaType)),
  },
  plugins: [
    structureTool({ structure }),
    presentationTool({
      // Embedded Studio → the site is on the same origin.
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Singletons can be published/edited but not duplicated or deleted.
    actions: (prev, { schemaType }) =>
      singletons.includes(schemaType)
        ? prev.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : prev,
  },
});
