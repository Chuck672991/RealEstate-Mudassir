import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";
import { seedField, sourcesField, verificationField } from "../../lib/fields";

export const agentProfile = defineType({
  name: "agentProfile",
  title: "Agent profile",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "content", title: "About", default: true },
    { name: "contact", title: "Contact" },
    { name: "credentials", title: "Experience & credentials" },
    { name: "provenance", title: "Source & verification" },
  ],
  fields: [
    // ── About ────────────────────────────────────────────────────────────────
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "displayName", title: "Name shown on the site", type: "string", group: "content" }),
    defineField({
      name: "professionalTitle",
      title: "Professional title",
      type: "verifiedText",
      group: "content",
      description:
        "The source profile calls him a “broker” in the bio but an “agent / REALTOR®” in the FAQ. Confirm the exact licence class before launch.",
    }),
    defineField({
      name: "tagline",
      title: "One-line positioning",
      type: "string",
      group: "content",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "introduction",
      title: "Short introduction",
      type: "text",
      rows: 4,
      group: "content",
      description: "Used on the home page and in search results. Keep it factual and specific.",
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Paragraph", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "url",
                    validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: "headshot",
      title: "Portrait",
      type: "imageWithMeta",
      group: "content",
      description:
        "Use an original file you have the right to publish. The Homes.com copy is not cleared for reuse — ask the photographer for the original.",
    }),
    defineField({
      name: "languages",
      title: "Languages",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "propertyTypes",
      title: "Property types",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "listedExperience",
      title: "Other experience listed on the source profile",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "For reference only. Specialties shown on the site come from the Specialties list, where each one is checked against evidence.",
    }),

    // ── Contact ──────────────────────────────────────────────────────────────
    defineField({
      name: "phonePrimary",
      title: "Phone (primary)",
      type: "verifiedText",
      group: "contact",
    }),
    defineField({
      name: "phoneSecondary",
      title: "Phone (second number)",
      type: "verifiedText",
      group: "contact",
      description: "Appears only in the source bio text. Not shown until verified.",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "verifiedText",
      group: "contact",
      description: "None is published on the source profile. Ask the agent for a business address.",
    }),
    defineField({ name: "website", title: "Website", type: "verifiedText", group: "contact" }),
    defineField({ name: "facebook", title: "Facebook", type: "verifiedText", group: "contact" }),
    defineField({
      name: "links",
      title: "Professional links",
      type: "array",
      group: "contact",
      of: [{ type: "profileLink" }],
      description: "Only links marked “Verified” are shown.",
    }),
    defineField({
      name: "brokerage",
      title: "Brokerage",
      type: "reference",
      to: [{ type: "brokerage" }],
      group: "contact",
    }),

    // ── Experience & credentials ─────────────────────────────────────────────
    defineField({
      name: "licenseNumber",
      title: "Licence number",
      type: "verifiedText",
      group: "credentials",
      description: "Shown in the footer when verified. Confirm display rules with the broker.",
    }),
    defineField({
      name: "licenseState",
      title: "Licence state",
      type: "string",
      group: "credentials",
      initialValue: "IL",
    }),
    defineField({
      name: "yearsExperience",
      title: "Years of experience",
      type: "verifiedNumber",
      group: "credentials",
    }),
    defineField({
      name: "rating",
      title: "Rating summary",
      type: "ratingSummary",
      group: "credentials",
    }),
    defineField({
      name: "credentials",
      title: "Designations, awards & associations",
      type: "array",
      group: "credentials",
      of: [{ type: "credential" }],
      description: "Only credentials marked “Verified” are shown on the site.",
    }),
    defineField({ name: "education", title: "Education", type: "verifiedText", group: "credentials" }),
    defineField({ name: "careerHistory", title: "Career history", type: "verifiedText", group: "credentials" }),

    sourcesField(),
    verificationField(),
    seedField(),
  ],
  preview: {
    select: { title: "fullName", subtitle: "professionalTitle.value", media: "headshot" },
  },
});
