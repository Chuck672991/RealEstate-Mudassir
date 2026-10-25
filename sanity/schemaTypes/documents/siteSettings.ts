import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { INQUIRY_TOPICS_DEFAULT } from "../../lib/enums";
import { seedField } from "../../lib/fields";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "navigation", title: "Navigation & footer" },
    { name: "compliance", title: "Disclosures" },
    { name: "seo", title: "SEO defaults" },
    { name: "provenance", title: "Data provenance" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "siteTagline", title: "Tagline", type: "string", group: "general" }),
    defineField({
      name: "showRatingSummary",
      title: "Show the review rating summary",
      type: "boolean",
      group: "general",
      initialValue: true,
      description:
        "The 5.0 average comes from reviews dated July 2021–July 2022. It is always shown with its source and dates.",
    }),
    defineField({
      name: "showOfficeAddress",
      title: "Show the office address",
      type: "boolean",
      group: "general",
      initialValue: true,
    }),
    defineField({
      name: "inquiryTopics",
      title: "Contact form topics",
      type: "array",
      group: "general",
      of: [defineArrayMember({ type: "string" })],
      initialValue: [...INQUIRY_TOPICS_DEFAULT],
    }),
    defineField({
      name: "nav",
      title: "Main menu",
      type: "array",
      group: "navigation",
      of: [{ type: "navLink" }],
      description:
        "The FIRST link is shown large at the top right; the others are small beneath it. Leave empty to use “Select an apartment”, “Book a call” and “Contact”. A link such as /#about only works while that home-page section is shown.",
    }),
    defineField({
      name: "footerNote",
      title: "Footer note",
      type: "text",
      rows: 2,
      group: "navigation",
    }),
    defineField({
      name: "legalLinks",
      title: "Legal links",
      type: "array",
      group: "navigation",
      of: [{ type: "navLink" }],
      description:
        "Privacy policy, terms, brokerage disclosures. Link to the brokerage's published pages — no legal text is invented here.",
    }),
    defineField({
      name: "complianceNotice",
      title: "Compliance notice",
      type: "text",
      rows: 4,
      group: "compliance",
      description:
        "Required advertising wording from the broker (e.g. equal-housing statement, licence wording). Shown in the footer.",
    }),
    defineField({
      name: "listingDisclaimer",
      title: "Listing data disclaimer",
      type: "text",
      rows: 4,
      group: "compliance",
      description:
        "MLS/IDX attribution and disclaimer supplied by the broker. Shown beneath listings. Homes.com's Midwest Real Estate Data (MLS Grid) wording is NOT copied here.",
    }),
    defineField({
      name: "dataNotice",
      title: "Data source notice",
      type: "text",
      rows: 4,
      group: "compliance",
      description:
        "Where the listing details and sales figures came from and how fresh they are. Shown in the footer on every page. Update it whenever the data source changes — for example when a broker-approved MLS/IDX feed replaces the research data. Leave empty to show nothing.",
    }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo", group: "seo" }),
    defineField({
      name: "dataProvenance",
      title: "Research provenance",
      type: "object",
      group: "provenance",
      fields: [
        defineField({ name: "observedOn", title: "Data observed on", type: "date" }),
        defineField({ name: "primarySourceUrl", type: "url" }),
        defineField({ name: "policy", type: "text", rows: 3 }),
      ],
      description:
        "Listing statuses and prices are only as fresh as this date. For live listings use a broker-approved MLS/IDX feed.",
    }),
    seedField(),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
