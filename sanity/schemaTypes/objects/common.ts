import { defineField, defineType } from "sanity";
import { VERIFICATION_OPTIONS } from "../../lib/enums";

/** A professional link (profile, website, social). Unverified links are not shown. */
export const profileLink = defineType({
  name: "profileLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "url",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "status",
      title: "Verification",
      type: "string",
      options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
      initialValue: "needs_verification",
    }),
    defineField({ name: "note", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});

export const postalAddress = defineType({
  name: "postalAddress",
  title: "Address",
  type: "object",
  fields: [
    defineField({ name: "street", title: "Street & suite", type: "string" }),
    defineField({ name: "city", type: "string" }),
    defineField({ name: "state", type: "string", validation: (rule) => rule.max(2) }),
    defineField({ name: "zip", title: "ZIP", type: "string" }),
    defineField({
      name: "status",
      title: "Verification",
      type: "string",
      options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
      initialValue: "verified",
    }),
  ],
  preview: {
    select: { street: "street", city: "city", state: "state" },
    prepare: ({ street, city, state }) => ({ title: street || "—", subtitle: [city, state].filter(Boolean).join(", ") }),
  },
});

/** Platform-generated rating (e.g. “5.0 across 88 reviews”). Always shown with source + dates. */
export const ratingSummary = defineType({
  name: "ratingSummary",
  title: "Rating summary",
  type: "object",
  fields: [
    defineField({
      name: "average",
      type: "number",
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({ name: "count", title: "Number of reviews", type: "number", validation: (rule) => rule.integer().min(0) }),
    defineField({
      name: "source",
      title: "Where the rating comes from",
      type: "string",
      description: "Shown next to the rating so visitors know its origin.",
    }),
    defineField({ name: "firstReviewDate", type: "date" }),
    defineField({ name: "lastReviewDate", type: "date" }),
    defineField({
      name: "status",
      title: "Verification",
      type: "string",
      options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
      initialValue: "verified",
    }),
    defineField({ name: "note", type: "text", rows: 2 }),
  ],
});

export const navLink = defineType({
  name: "navLink",
  title: "Menu link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "A page on this site (e.g. /properties) or an anchor on the home page (e.g. /#areas).",
      validation: (rule) =>
        rule.required().custom((value) =>
          typeof value === "string" && /^(\/|https?:\/\/)/.test(value) ? true : "Start with / for a page on this site, or https:// for an external link.",
        ),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const cta = defineType({
  name: "cta",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string" }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "/contact, /properties, a #anchor, or tel:… for a phone number.",
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const serviceItem = defineType({
  name: "serviceItem",
  title: "Service",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "body", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});
