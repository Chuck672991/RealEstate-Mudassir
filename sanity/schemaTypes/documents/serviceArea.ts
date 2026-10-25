import { PinIcon } from "@sanity/icons/Pin";
import { defineField, defineType } from "sanity";
import { orderField, seedField, sourcesField, verificationField } from "../../lib/fields";

export const serviceArea = defineType({
  name: "serviceArea",
  title: "Service area",
  type: "document",
  icon: PinIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "display", title: "Display" },
    { name: "provenance", title: "Source & verification" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Area name",
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
      name: "role",
      title: "Role / note",
      type: "string",
      group: "content",
      description: "E.g. “Office city”. Optional.",
    }),
    defineField({
      name: "summary",
      title: "Neighborhood notes",
      type: "text",
      rows: 3,
      group: "content",
      description: "Optional notes supplied by the agent. None are invented.",
    }),
    defineField({
      name: "closedSales5y",
      title: "Closed sales, last 5 years",
      type: "number",
      group: "content",
      validation: (rule) => rule.integer().min(0),
      description: "As published by the source profile (the sale counts overlap between neighborhood labels).",
    }),
    defineField({
      name: "shareOf100",
      title: "Share of all closed sales",
      type: "number",
      group: "content",
      validation: (rule) => rule.min(0).max(1),
      description: "A fraction between 0 and 1 (0.18 = 18%).",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithMeta",
      group: "content",
      description: "Optional. Use an original or licensed photograph.",
    }),
    defineField({
      name: "showOnSite",
      title: "Show on website",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    orderField(),
    verificationField(),
    sourcesField(),
    seedField(),
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", sales: "closedSales5y", show: "showOnSite" },
    prepare: ({ title, sales, show }) => ({
      title,
      subtitle: [sales != null ? `${sales} sales` : null, show === false ? "Hidden" : null].filter(Boolean).join(" · "),
    }),
  },
});
