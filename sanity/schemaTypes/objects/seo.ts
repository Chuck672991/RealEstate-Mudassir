import { defineField, defineType } from "sanity";

/** Per-page search & social overrides. Empty fields fall back to Site settings. */
export const seo = defineType({
  name: "seo",
  title: "Search & social sharing",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Page title",
      type: "string",
      description: "Shown in search results and browser tabs. About 50–60 characters works best.",
      validation: (rule) => rule.max(70).warning("Longer titles are usually truncated by search engines."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "A one- or two-sentence summary for search results. Up to ~160 characters.",
      validation: (rule) => rule.max(180).warning("Longer descriptions are usually truncated by search engines."),
    }),
    defineField({
      name: "ogImage",
      title: "Sharing image",
      type: "imageWithMeta",
      description: "Shown when the page is shared. 1200×630 works best.",
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL (advanced)",
      type: "url",
      description: "Only set this if the same content lives at another address you want search engines to prefer.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
