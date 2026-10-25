import { defineField } from "sanity";
import { VERIFICATION_OPTIONS } from "./enums";

/** Standard "how well is this supported?" field (see lib/content-policy). */
export const verificationField = (
  opts: { name?: string; title?: string; initialValue?: string; group?: string } = {},
) =>
  defineField({
    name: opts.name ?? "verification",
    title: opts.title ?? "Verification status",
    type: "string",
    group: opts.group ?? "provenance",
    options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
    initialValue: opts.initialValue ?? "verified",
    description:
      "How well the source supports this information. Only “Verified” and “Calculated” items are shown on the website.",
  });

export const sourcesField = (group = "provenance") =>
  defineField({
    name: "sources",
    title: "Sources",
    type: "array",
    group,
    of: [{ type: "reference", to: [{ type: "source" }] }],
    description: "Where this information came from (kept for audit; never shown on the site).",
  });

export const orderField = (group = "display") =>
  defineField({
    name: "order",
    title: "Display order",
    type: "number",
    group,
    initialValue: 100,
    description: "Lower numbers appear first.",
  });

/**
 * Hidden bookkeeping written by `npm run seed:sanity`. It lets a re-run tell
 * "dataset unchanged → leave the document alone" from "dataset changed → patch
 * the seed-owned fields", so editors' own changes are never overwritten.
 */
export const seedField = () =>
  defineField({
    name: "seed",
    title: "Seed bookkeeping",
    type: "object",
    hidden: true,
    readOnly: true,
    fields: [
      defineField({ name: "source", type: "string" }),
      defineField({ name: "hash", type: "string" }),
      defineField({ name: "fieldHashes", type: "text" }),
      defineField({ name: "importedAt", type: "datetime" }),
    ],
  });

export const internalNotesField = (group = "provenance") =>
  defineField({
    name: "internalNotes",
    title: "Internal notes",
    type: "text",
    rows: 3,
    group,
    description: "For the team only. Never shown on the website.",
  });
