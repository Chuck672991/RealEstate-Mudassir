import { defineField, defineType } from "sanity";
import { SIDE_OPTIONS, VERIFICATION_OPTIONS, WINDOW_OPTIONS } from "../../lib/enums";

const statusField = defineField({
  name: "status",
  title: "Verification",
  type: "string",
  options: { list: [...VERIFICATION_OPTIONS], layout: "dropdown" },
  initialValue: "verified",
});

/** One row of the published “transaction history” table (window × side). */
export const productionWindow = defineType({
  name: "productionWindow",
  title: "Production window",
  type: "object",
  fields: [
    defineField({ name: "window", type: "string", options: { list: [...WINDOW_OPTIONS] } }),
    defineField({ name: "side", type: "string", options: { list: [...SIDE_OPTIONS] } }),
    defineField({ name: "deals", type: "number", validation: (rule) => rule.integer().min(0) }),
    defineField({ name: "value", title: "Total value (USD)", type: "number" }),
    defineField({ name: "average", title: "Average (USD)", type: "number" }),
    defineField({ name: "range", title: "Range as published", type: "string" }),
    statusField,
  ],
  preview: {
    select: { window: "window", side: "side", deals: "deals" },
    prepare: ({ window, side, deals }) => ({ title: `${window ?? ""} · ${side ?? ""}`, subtitle: `${deals ?? 0} deals` }),
  },
});

export const priceBand = defineType({
  name: "priceBand",
  title: "Price band",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "count", type: "number", validation: (rule) => rule.integer().min(0) }),
  ],
  preview: { select: { title: "label", subtitle: "count" } },
});

/** A descriptive statistic computed over a subset of the collected records. */
export const statSet = defineType({
  name: "statSet",
  title: "Collected statistic set",
  type: "object",
  fields: [
    defineField({ name: "key", type: "string" }),
    defineField({ name: "n", type: "number" }),
    defineField({ name: "total", type: "number" }),
    defineField({ name: "min", type: "number" }),
    defineField({ name: "max", type: "number" }),
    defineField({ name: "mean", type: "number" }),
    defineField({ name: "median", type: "number" }),
    statusField,
  ],
  preview: { select: { title: "key", subtitle: "n" }, prepare: ({ title, subtitle }) => ({ title, subtitle: `n = ${subtitle}` }) },
});

export const consistencyCheck = defineType({
  name: "consistencyCheck",
  title: "Consistency check",
  type: "object",
  fields: [
    defineField({ name: "check", type: "string" }),
    defineField({ name: "result", type: "string", options: { list: ["Pass", "FAIL"] } }),
    defineField({ name: "detail", type: "text", rows: 2 }),
  ],
  preview: { select: { title: "check", subtitle: "result" } },
});
