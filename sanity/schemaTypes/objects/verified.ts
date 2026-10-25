import { defineField, defineType } from "sanity";
import { VERIFICATION_OPTIONS } from "../../lib/enums";

const statusField = defineField({
  name: "status",
  title: "Verification",
  type: "string",
  options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
  initialValue: "needs_verification",
  description: "Only “Verified” or “Calculated” values are shown on the website.",
});

/** A text value plus how well it is supported. Used for facts that need sign-off. */
export const verifiedText = defineType({
  name: "verifiedText",
  title: "Value with verification",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Value", type: "string" }),
    statusField,
    defineField({ name: "note", title: "Note", type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "value", subtitle: "status" },
    prepare: ({ title, subtitle }) => ({ title: title || "—", subtitle: String(subtitle ?? "").replace("_", " ") }),
  },
});

export const verifiedNumber = defineType({
  name: "verifiedNumber",
  title: "Number with verification",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Value", type: "number" }),
    statusField,
    defineField({ name: "note", title: "Note", type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "value", subtitle: "status" },
    prepare: ({ title, subtitle }) => ({
      title: title != null ? String(title) : "—",
      subtitle: String(subtitle ?? "").replace("_", " "),
    }),
  },
});
