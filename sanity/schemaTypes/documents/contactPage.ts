import { CommentIcon } from "@sanity/icons/Comment";
import { defineField, defineType } from "sanity";

import { seedField } from "../../lib/fields";

/**
 * Copy for the /contact page. The phone number, office and licence shown next to
 * the form always come from the Agent profile and Brokerage documents (so there is
 * only one place to correct them); the topics in the form come from Site settings.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  icon: CommentIcon,
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
    }),
    defineField({
      name: "formHeading",
      title: "Form heading",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "privacyNote",
      title: "Note under the form",
      type: "text",
      rows: 2,
      group: "content",
      description: "For example how the details will be used. Do not promise a reply time unless the agent has confirmed one.",
    }),
    defineField({ name: "seo", title: "Search & sharing", type: "seo", group: "seo" }),
    seedField(),
  ],
  preview: { prepare: () => ({ title: "Contact page" }) },
});
