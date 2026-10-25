import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  RECORD_TIER_OPTIONS,
  REPRESENTATION_OPTIONS,
  SUPPRESSIBLE_FIELDS,
  isPublishable,
} from "../../lib/enums";
import { internalNotesField, seedField, sourcesField, verificationField } from "../../lib/fields";

type Doc = {
  status?: string;
  publicDisplay?: boolean;
  verification?: string;
  listPrice?: number;
  soldPrice?: number;
  monthlyRent?: number;
} | undefined;

/**
 * One document type for every property record — sold, for sale, under contract,
 * for rent — distinguished by `status`. That keeps a single reusable card and
 * lets an editor move a listing from “For sale” to “Sold” without re-creating it.
 * The research distinctions (record tier, which side of the deal, verification)
 * are kept as separate fields so nothing is conflated.
 */
export const property = defineType({
  name: "property",
  title: "Property",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Listing", default: true },
    { name: "facts", title: "Facts" },
    { name: "media", title: "Photos" },
    { name: "display", title: "Website" },
    { name: "seo", title: "SEO" },
    { name: "provenance", title: "Source & verification" },
  ],
  fields: [
    // ── Listing ──────────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        "Shown on cards, e.g. “Condo in Lyons”. Do not put the street address here — the address is controlled separately.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: (doc) => `${(doc as { title?: string }).title ?? ""} ${(doc as { recordId?: string }).recordId ?? ""}`, maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "content",
      options: { list: [...PROPERTY_STATUS_OPTIONS], layout: "radio" },
      initialValue: "active",
      validation: (rule) => rule.required(),
      description:
        "“Under contract” homes are shown as unavailable. Change this as the deal progresses; the card label updates automatically.",
    }),
    defineField({
      name: "recordId",
      title: "Reference",
      type: "string",
      group: "content",
      description: "Internal reference from the research notes (e.g. SOLD-001).",
    }),
    defineField({ name: "street", title: "Street address", type: "string", group: "content" }),
    defineField({
      name: "addressPublic",
      title: "Show the street address publicly",
      type: "boolean",
      group: "display",
      initialValue: false,
      description:
        "Off by default: cards show the city and property type only. For sold homes, confirm with the broker (and MLS rules) before showing an address.",
    }),
    defineField({ name: "city", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({ name: "state", type: "string", group: "content", initialValue: "IL", validation: (rule) => rule.max(2) }),
    defineField({ name: "zip", title: "ZIP", type: "string", group: "content" }),
    defineField({ name: "neighborhoodLabel", title: "Neighborhood label", type: "string", group: "content" }),
    defineField({
      name: "serviceArea",
      title: "Service area",
      type: "reference",
      to: [{ type: "serviceArea" }],
      group: "content",
      description: "Optional link to one of your service areas.",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      group: "content",
      description: "Optional, in your own words. Listing descriptions from other sites are not copied here.",
    }),

    // ── Facts ────────────────────────────────────────────────────────────────
    defineField({
      name: "propertyType",
      title: "Property type (as listed)",
      type: "string",
      group: "facts",
      description: "Free text exactly as the source lists it, e.g. “Townhome (half duplex)”.",
    }),
    defineField({
      name: "propertyCategory",
      title: "Property category",
      type: "string",
      group: "facts",
      options: { list: [...PROPERTY_CATEGORY_OPTIONS], layout: "radio" },
      description: "Used for filtering and for the illustration on cards without a photo.",
    }),
    defineField({
      name: "listPrice",
      title: "List price (USD)",
      type: "number",
      group: "facts",
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as Doc;
          if (doc?.publicDisplay && ["active", "pending"].includes(doc.status ?? "") && value == null) {
            return "Add the list price before showing this home on the site.";
          }
          return value == null || (Number.isInteger(value) && value >= 0) ? true : "Use a whole number of dollars.";
        }),
    }),
    defineField({
      name: "soldPrice",
      title: "Sold price (USD)",
      type: "number",
      group: "facts",
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as Doc;
          if (doc?.publicDisplay && doc.status === "sold" && value == null) {
            return "Add the sold price before showing this sale on the site.";
          }
          return value == null || (Number.isInteger(value) && value >= 0) ? true : "Use a whole number of dollars.";
        }),
    }),
    defineField({
      name: "monthlyRent",
      title: "Monthly rent (USD)",
      type: "number",
      group: "facts",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "priceChange",
      title: "Price change (as displayed by source)",
      type: "string",
      group: "facts",
    }),
    defineField({ name: "listDate", title: "List date", type: "date", group: "facts" }),
    defineField({ name: "soldDate", title: "Sold date", type: "date", group: "facts" }),
    defineField({
      name: "asOf",
      title: "Data as of",
      type: "date",
      group: "facts",
      description: "When the status and price were last checked. Shown on active and pending homes.",
    }),
    defineField({ name: "beds", title: "Bedrooms", type: "number", group: "facts", validation: (rule) => rule.min(0).max(30) }),
    defineField({ name: "baths", title: "Bathrooms", type: "number", group: "facts", validation: (rule) => rule.min(0).max(30) }),
    defineField({ name: "sqft", title: "Square feet", type: "number", group: "facts", validation: (rule) => rule.min(0) }),
    defineField({ name: "lot", title: "Lot", type: "string", group: "facts", description: "E.g. “9,583 sq ft” or “0.59 acre”." }),
    defineField({ name: "yearBuilt", type: "number", group: "facts", validation: (rule) => rule.integer().min(1700).max(2100) }),
    defineField({ name: "daysOnMarket", type: "number", group: "facts", validation: (rule) => rule.integer().min(0) }),
    defineField({ name: "priceVsList", title: "Price vs list (as displayed)", type: "string", group: "facts" }),
    defineField({ name: "hoaMonthly", title: "HOA / month (USD)", type: "number", group: "facts" }),
    defineField({ name: "estTaxesAnnual", title: "Estimated taxes / year (USD)", type: "number", group: "facts" }),
    defineField({ name: "pricePerSqft", title: "Price per sq ft (USD)", type: "number", group: "facts" }),
    defineField({
      name: "suppressedFields",
      title: "Hide these facts on the website",
      type: "array",
      group: "facts",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...SUPPRESSIBLE_FIELDS], layout: "grid" },
      description:
        "Use when sources disagree about a fact (for example the header says 6 bedrooms but the description says 4). Hidden facts stay in the CMS for review.",
    }),

    // ── Photos ───────────────────────────────────────────────────────────────
    defineField({
      name: "heroImage",
      title: "Main photo",
      type: "imageWithMeta",
      group: "media",
      description:
        "Listing and MLS photos are usually owned by the photographer, broker or MLS. Upload only files you may publish. Without a photo the card shows an illustrated placeholder.",
    }),
    defineField({
      name: "gallery",
      title: "More photos",
      type: "array",
      group: "media",
      of: [defineArrayMember({ type: "imageWithMeta" })],
    }),

    // ── Website ──────────────────────────────────────────────────────────────
    defineField({
      name: "publicDisplay",
      title: "Show on website",
      type: "boolean",
      group: "display",
      initialValue: false,
      description:
        "Only records whose facts have been verified should be switched on. Records marked “Needs verification” are blocked from publishing.",
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const doc = ctx.document as Doc;
          if (value && !isPublishable(doc?.verification)) {
            return "This record is not verified yet. Verify it (Source & verification tab) or leave it off the website.";
          }
          return true;
        }),
    }),
    defineField({
      name: "featured",
      title: "Feature on the home page",
      type: "boolean",
      group: "display",
      initialValue: false,
      description:
        "Homes for sale appear in the home page slider; sold homes appear in “Recently sold”. If nothing is ticked, the most relevant records are chosen automatically.",
    }),
    defineField({
      name: "listingUrl",
      title: "Original listing link",
      type: "url",
      group: "display",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "showListingLink",
      title: "Show a link to the original listing",
      type: "boolean",
      group: "display",
      initialValue: false,
      description: "Useful for homes that are for sale (visitors can see all photos there).",
    }),
    defineField({ name: "seo", title: "Search & sharing", type: "seo", group: "seo" }),

    // ── Provenance ───────────────────────────────────────────────────────────
    defineField({
      name: "recordTier",
      title: "Record detail level",
      type: "string",
      group: "provenance",
      options: { list: [...RECORD_TIER_OPTIONS] },
    }),
    defineField({
      name: "representation",
      title: "Mudassir's role in the deal",
      type: "string",
      group: "provenance",
      options: { list: [...REPRESENTATION_OPTIONS] },
    }),
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
    {
      title: "Status, then price",
      name: "statusPrice",
      by: [
        { field: "status", direction: "asc" },
        { field: "listPrice", direction: "desc" },
      ],
    },
    { title: "Sold date, newest first", name: "soldDateDesc", by: [{ field: "soldDate", direction: "desc" }] },
    { title: "Reference", name: "recordId", by: [{ field: "recordId", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      list: "listPrice",
      sold: "soldPrice",
      rent: "monthlyRent",
      show: "publicDisplay",
      ref: "recordId",
      media: "heroImage",
    },
    prepare: ({ title, status, list, sold, rent, show, ref, media }) => {
      const label = PROPERTY_STATUS_OPTIONS.find((o) => o.value === status)?.title ?? status;
      const price = sold ?? list ?? rent;
      const priceText = price != null ? `$${Number(price).toLocaleString("en-US")}${rent ? "/mo" : ""}` : "no price";
      return {
        title: title || "Untitled property",
        subtitle: [ref, label, priceText, show ? "On site" : "Hidden"].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
