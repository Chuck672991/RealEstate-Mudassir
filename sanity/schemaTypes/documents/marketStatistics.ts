import { BarChartIcon } from "@sanity/icons/BarChart";
import { defineField, defineType } from "sanity";
import { VERIFICATION_OPTIONS } from "../../lib/enums";
import { seedField, sourcesField } from "../../lib/fields";

/**
 * Track-record numbers. Kept apart from the profile because they come with
 * strict handling rules from the research:
 *
 *  • The five-year headline (100 closed sales, $32.4M, $323.8K average) is
 *    published by Homes.com and reconciles arithmetically → shown, with source.
 *  • The headline PRICE RANGE ($193K–$990K) contradicts the profile's own
 *    component ranges ($105K / $125K lows) → stored for audit, never shown.
 *  • Component ranges are shown only after the agent confirms them
 *    (`showPriceRanges`).
 *  • Price bands are calculated from the 39 collected sales that carry a price —
 *    a non-random subset — and are shown with that footnote.
 */
export const marketStatistics = defineType({
  name: "marketStatistics",
  title: "Market statistics",
  type: "document",
  icon: BarChartIcon,
  groups: [
    { name: "content", title: "Headline", default: true },
    { name: "display", title: "Website" },
    { name: "detail", title: "Detail" },
    { name: "provenance", title: "Source & verification" },
  ],
  fields: [
    defineField({
      name: "headline",
      title: "Five-year headline",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "closedSales", title: "Closed sales", type: "number", validation: (r) => r.integer().min(0) }),
        defineField({ name: "totalValue", title: "Total value (USD)", type: "number" }),
        defineField({ name: "average", title: "Average price (USD)", type: "number" }),
        defineField({ name: "windowLabel", title: "Period", type: "string", initialValue: "the last five years" }),
        defineField({ name: "source", title: "Source shown with the figure", type: "string" }),
        defineField({ name: "asOf", title: "As of", type: "date" }),
        defineField({
          name: "status",
          title: "Verification",
          type: "string",
          options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
          initialValue: "verified",
        }),
      ],
    }),
    defineField({
      name: "windows",
      title: "Published transaction history",
      type: "array",
      group: "detail",
      of: [{ type: "productionWindow" }],
    }),
    defineField({
      name: "priceBands",
      title: "Price bands (calculated)",
      type: "array",
      group: "detail",
      of: [{ type: "priceBand" }],
    }),
    defineField({
      name: "priceBandsBasis",
      title: "What the bands are based on",
      type: "string",
      group: "detail",
      description: "Shown as a footnote under the bands.",
    }),
    defineField({
      name: "showPriceBands",
      title: "Show price bands",
      type: "boolean",
      group: "display",
      initialValue: true,
    }),
    defineField({
      name: "showPriceRanges",
      title: "Show published price ranges",
      type: "boolean",
      group: "display",
      initialValue: false,
      description:
        "Off until the agent confirms the component ranges ($105K–$990K buyer side, $125K–$640K seller side over five years).",
    }),
    defineField({
      name: "headlineRangeShown",
      title: "Headline range on source profile (do not publish)",
      type: "string",
      group: "provenance",
      readOnly: true,
      description: "This range fails the research consistency check and is never displayed.",
    }),
    defineField({
      name: "collectedSets",
      title: "Collected statistic sets",
      type: "array",
      group: "provenance",
      of: [{ type: "statSet" }],
    }),
    defineField({
      name: "consistencyChecks",
      title: "Consistency checks",
      type: "array",
      group: "provenance",
      of: [{ type: "consistencyCheck" }],
    }),
    defineField({ name: "limitations", type: "text", rows: 3, group: "provenance" }),
    sourcesField(),
    seedField(),
  ],
  preview: { prepare: () => ({ title: "Market statistics" }) },
});
