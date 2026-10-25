import { CommentIcon } from "@sanity/icons/Comment";
import { defineField, defineType } from "sanity";
import { REVIEW_PLATFORM_OPTIONS } from "../../lib/enums";
import { internalNotesField, seedField, sourcesField, verificationField } from "../../lib/fields";

type Doc = { approvedForPublication?: boolean; body?: string; reviewerPermission?: boolean } | undefined;

/**
 * Client reviews. The research captured 88 reviews but, by design, NOT their
 * wording (third-party text; Google's terms restrict copying reviews). So each
 * document starts without a `body` and `approvedForPublication` = false.
 *
 * A testimonial is shown on the site only when ALL of these are true:
 *   approvedForPublication  – the agent has approved it
 *   reviewerPermission      – the reviewer/platform permission is sorted
 *   body                    – the exact text, copied from the source and checked
 *                             against the fingerprint
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: CommentIcon,
  groups: [
    { name: "content", title: "Review", default: true },
    { name: "publishing", title: "Approval" },
    { name: "provenance", title: "Source & integrity" },
  ],
  fields: [
    defineField({
      name: "body",
      title: "Review text",
      type: "text",
      rows: 6,
      group: "content",
      description:
        "Paste the exact wording from the original review, then confirm it matches the fingerprint on the Source & integrity tab. Do not edit or combine reviews.",
    }),
    defineField({
      name: "reviewerDisplayName",
      title: "Reviewer name (as displayed by the platform)",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publicName",
      title: "Name to show on the website",
      type: "string",
      group: "content",
      description: "Consider first name and last initial only. If empty, the first name and last initial are used.",
    }),
    defineField({ name: "date", title: "Review date", type: "date", group: "content" }),
    defineField({
      name: "platform",
      type: "string",
      group: "content",
      options: { list: [...REVIEW_PLATFORM_OPTIONS] },
    }),
    defineField({
      name: "rating",
      type: "number",
      group: "content",
      validation: (rule) => rule.min(1).max(5),
      description: "Empty when the platform showed no stars.",
    }),
    defineField({
      name: "approvedForPublication",
      title: "Approved by the agent",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as Doc;
          if (value && !doc?.body?.trim()) return "Add the review text before approving it.";
          if (value && !doc?.reviewerPermission) return "Confirm reviewer/platform permission first.";
          return true;
        }),
    }),
    defineField({
      name: "reviewerPermission",
      title: "Reviewer / platform permission confirmed",
      type: "boolean",
      group: "publishing",
      initialValue: false,
      description: "Google's terms restrict copying reviews off its platform. Obtain permission before publishing.",
    }),
    defineField({
      name: "featured",
      title: "Feature on the home page",
      type: "boolean",
      group: "publishing",
      initialValue: false,
    }),
    defineField({ name: "number", title: "Position on source page", type: "number", group: "provenance" }),
    defineField({ name: "dateDisplayed", title: "Date as displayed", type: "string", group: "provenance" }),
    defineField({ name: "hasText", type: "boolean", group: "provenance" }),
    defineField({ name: "wordCount", type: "number", group: "provenance" }),
    defineField({ name: "themes", title: "Themes (analyst tags)", type: "string", group: "provenance" }),
    defineField({
      name: "flags",
      title: "Integrity flags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "provenance",
      description:
        "Raised by the research: same-day clusters, identical text, reviewer shares the agent's surname, business-style names. Resolve these before approving.",
    }),
    defineField({
      name: "fingerprint",
      title: "Text fingerprint",
      type: "string",
      group: "provenance",
      description: "First 10 hex characters of SHA-256 of “date|reviewer|text”. Use it to confirm you copied the right text.",
    }),
    defineField({ name: "sourceUrl", type: "url", group: "provenance" }),
    defineField({
      name: "agent",
      title: "Agent",
      type: "reference",
      to: [{ type: "agentProfile" }],
      group: "provenance",
    }),
    verificationField(),
    sourcesField(),
    internalNotesField(),
    seedField(),
  ],
  orderings: [
    { title: "Review date, newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
    { title: "Position on source page", name: "number", by: [{ field: "number", direction: "asc" }] },
  ],
  preview: {
    select: { title: "reviewerDisplayName", date: "date", approved: "approvedForPublication", words: "wordCount", hasText: "hasText" },
    prepare: ({ title, date, approved, words, hasText }) => ({
      title,
      subtitle: [
        date,
        hasText === false ? "rating only" : words ? `${words} words` : null,
        approved ? "Approved" : "Not approved",
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
