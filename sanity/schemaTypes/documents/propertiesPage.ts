import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";

import { seedField } from "../../lib/fields";

/**
 * Copy for the /properties index. The homes themselves are Property documents;
 * this document only holds the words around them.
 */
export const propertiesPage = defineType({
  name: "propertiesPage",
  title: "Homes page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "copyApprovedByAgent",
      title: "Copy approved by the agent",
      type: "boolean",
      group: "content",
      initialValue: false,
      description: "The starter copy still needs the agent's sign-off before launch. Tick this once approved.",
      validation: (rule) => rule.custom((v) => (v ? true : "Starter copy still needs the agent's approval.")).warning(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two sentences under the heading.",
    }),
    defineField({
      name: "emptyMessage",
      title: "Message when there is nothing to show",
      type: "text",
      rows: 2,
      group: "content",
      description: "Shown if no home is published (or none matches the chosen filters).",
    }),
    defineField({ name: "seo", title: "Search & sharing", type: "seo", group: "seo" }),
    seedField(),
  ],
  preview: { prepare: () => ({ title: "Homes page" }) },
});
