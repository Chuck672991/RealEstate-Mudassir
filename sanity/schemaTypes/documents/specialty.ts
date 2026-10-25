import { StarIcon } from "@sanity/icons/Star";
import { defineField, defineType } from "sanity";
import { internalNotesField, orderField, seedField, sourcesField, verificationField } from "../../lib/fields";

/**
 * A service or specialty. “Show on website” is the editorial gate: the research
 * flagged several listed specialties (luxury, military, senior, short sale,
 * relocation, mortgage, commercial …) as unsupported by evidence, so they exist
 * here for completeness but are hidden by default.
 */
export const specialty = defineType({
  name: "specialty",
  title: "Specialty",
  type: "document",
  icon: StarIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "display", title: "Display" },
    { name: "provenance", title: "Evidence" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "What clients get",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two plain sentences. Describe the service; do not promise outcomes.",
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "safeToFeature",
      title: "Show on website",
      type: "boolean",
      group: "display",
      initialValue: false,
      description:
        "Turn on only when the evidence below supports the claim. Specialties with no supporting transactions or proof should stay off.",
    }),
    orderField(),
    defineField({
      name: "evidence",
      title: "Evidence summary",
      type: "text",
      rows: 2,
      group: "provenance",
    }),
    defineField({
      name: "basis",
      title: "Basis",
      type: "string",
      group: "provenance",
      description: "Explicit (stated by the profile) or inferred (suggested by evidence).",
    }),
    defineField({
      name: "evidenceReviews",
      title: "Supporting review numbers",
      type: "array",
      of: [{ type: "number" }],
      group: "provenance",
    }),
    verificationField(),
    sourcesField(),
    internalNotesField(),
    seedField(),
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", show: "safeToFeature", status: "verification" },
    prepare: ({ title, show, status }) => ({
      title,
      subtitle: `${show ? "Shown" : "Hidden"} · ${String(status ?? "").replace("_", " ")}`,
    }),
  },
});
