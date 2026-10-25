import { defineField, defineType } from "sanity";
import { CREDENTIAL_KIND_OPTIONS, VERIFICATION_OPTIONS } from "../../lib/enums";

/**
 * Designations, awards, associations and licences. The source dataset lists nine
 * designations and six awards with NO issuer or year, so every one is seeded as
 * “Needs verification” and stays off the website until proof is supplied.
 */
export const credential = defineType({
  name: "credential",
  title: "Credential",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: { list: [...CREDENTIAL_KIND_OPTIONS], layout: "dropdown" },
    }),
    defineField({ name: "issuer", title: "Issued by", type: "string" }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.integer().min(1950).max(2100),
    }),
    defineField({
      name: "proofUrl",
      title: "Link to proof",
      type: "url",
      description: "Certificate, member directory or issuer page that confirms it.",
    }),
    defineField({
      name: "status",
      title: "Verification",
      type: "string",
      options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
      initialValue: "needs_verification",
      description: "Set to “Verified” once you have proof. Only verified credentials are shown.",
    }),
    defineField({ name: "note", title: "Note", type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "name", kind: "kind", status: "status" },
    prepare: ({ title, kind, status }) => ({
      title,
      subtitle: [kind, String(status ?? "").replace("_", " ")].filter(Boolean).join(" · "),
    }),
  },
});
