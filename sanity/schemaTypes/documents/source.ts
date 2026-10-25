import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";
import { seedField } from "../../lib/fields";

/**
 * Provenance register (S01–S22 in the content brief). Properties, testimonials
 * and profile facts reference these so every claim can be traced to where it was
 * observed. Never rendered on the website.
 */
export const source = defineType({
  name: "source",
  title: "Source",
  type: "document",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "sourceId",
      title: "Source ID",
      type: "string",
      description: "Short code used in the research notes (e.g. S01).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL or description",
      type: "string",
      description: "Usually a web address; may describe a search when no single page applies.",
    }),
    defineField({ name: "supports", title: "What it supports", type: "text", rows: 2 }),
    defineField({ name: "accessResult", title: "Access result", type: "text", rows: 2 }),
    defineField({ name: "accessed", title: "Date accessed", type: "date" }),
    seedField(),
  ],
  orderings: [{ title: "Source ID", name: "sourceId", by: [{ field: "sourceId", direction: "asc" }] }],
  preview: {
    select: { title: "sourceId", subtitle: "supports" },
  },
});
