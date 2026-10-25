import { defineField, defineType } from "sanity";
import { RIGHTS_OPTIONS } from "../../lib/enums";

type ImageParent = { asset?: unknown; decorative?: boolean } | undefined;

/**
 * Every image on the site goes through this type so alternative text, credit and
 * — crucially — usage rights travel with the file. Third-party listing photos are
 * not cleared for reuse, so the Studio refuses to publish an image whose rights
 * are marked “not cleared”.
 *
 * The metadata fields may exist WITHOUT an uploaded asset: the seed script uses
 * that to record the intended use and original source of a photo that the agent
 * still needs to supply (see docs/ASSETS.md).
 */
export const imageWithMeta = defineType({
  name: "imageWithMeta",
  title: "Image",
  type: "image",
  options: { hotspot: true },
  fieldsets: [
    {
      name: "rights",
      title: "Rights, credit & source",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description:
        "Describe what the image shows, for people using screen readers. Tick “Decorative” instead if it adds no information.",
      validation: (rule) =>
        rule.custom((alt, ctx) => {
          const parent = ctx.parent as ImageParent;
          if (parent?.asset && !parent.decorative && !alt) {
            return "Add alternative text, or tick “Decorative image”.";
          }
          return true;
        }),
    }),
    defineField({
      name: "decorative",
      title: "Decorative image",
      type: "boolean",
      initialValue: false,
      description: "Purely ornamental; screen readers will skip it.",
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "credit",
      title: "Photographer / credit",
      type: "string",
      fieldset: "rights",
    }),
    defineField({
      name: "rightsStatus",
      title: "Usage rights",
      type: "string",
      fieldset: "rights",
      options: { list: [...RIGHTS_OPTIONS], layout: "dropdown" },
      description:
        "Public availability is not permission to reuse. Listing and MLS photos usually belong to the photographer, broker or MLS.",
      validation: (rule) => [
        rule.custom((value, ctx) => {
          const parent = ctx.parent as ImageParent;
          if (!parent?.asset) return true;
          if (!value) return "Choose the usage rights for this image.";
          if (value === "not_cleared") {
            return "Rights are marked NOT cleared. Replace the image or get permission first.";
          }
          return true;
        }),
        // Allowed, but the editor must know the site will not show it yet.
        rule
          .custom((value, ctx) => {
            const parent = ctx.parent as ImageParent;
            if (parent?.asset && value === "pending") {
              return "Saved, but this image will NOT appear on the website until the rights are confirmed (owned, licensed or permission).";
            }
            return parent?.asset && value === "owner_directed"
              ? "Shown on the website, but permission is NOT confirmed. Get the photographer's / MLS's written permission before launch, then change this to “Written permission obtained”."
              : true;
          })
          .warning(),
      ],
    }),
    defineField({ name: "rightsNotes", title: "Rights notes", type: "text", rows: 2, fieldset: "rights" }),
    defineField({
      name: "sourceUrl",
      title: "Original source URL",
      type: "url",
      fieldset: "rights",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "intendedUse",
      title: "Intended use",
      type: "string",
      fieldset: "rights",
      description: "Where this image is meant to appear (asset manifest).",
    }),
    defineField({
      name: "manifestId",
      title: "Asset manifest ID",
      type: "string",
      fieldset: "rights",
      readOnly: true,
    }),
  ],
});
