import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";
import { seedField } from "../../lib/fields";

const toggle = (name: string, title: string, group: string) =>
  defineField({ name, title, type: "boolean", group, initialValue: true });

/**
 * The home page is a fixed, choreographed narrative (pinned stages, overlapping
 * arch panels, a horizontal chapter). Section ORDER is therefore fixed in code,
 * but every section's copy can be edited here and any section can be switched
 * off — a section with no content never renders anyway.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Opening", default: true },
    { name: "story", title: "Story" },
    { name: "homes", title: "Homes" },
    { name: "proof", title: "Proof & contact" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "copyApprovedByAgent",
      title: "Copy approved by the agent",
      type: "boolean",
      group: "hero",
      initialValue: false,
      description:
        "The starter copy was drafted from the research notes and needs the agent's sign-off before launch. Tick this once approved.",
      validation: (rule) => rule.custom((v) => (v ? true : "Starter copy still needs the agent's approval.")).warning(),
    }),

    // ── Opening ──────────────────────────────────────────────────────────────
    defineField({ name: "heroEyebrow", title: "Eyebrow", type: "string", group: "hero" }),
    defineField({ name: "heroLine1", title: "Headline — line 1", type: "string", group: "hero" }),
    defineField({ name: "heroLine2", title: "Headline — line 2", type: "string", group: "hero" }),
    defineField({
      name: "heroAccent",
      title: "Accent word",
      type: "string",
      group: "hero",
      description: "One or two words set in italic over the headline.",
      validation: (rule) => rule.max(24),
    }),
    defineField({ name: "heroSubheading", title: "Sub-heading", type: "text", rows: 2, group: "hero" }),
    defineField({
      name: "heroPrimaryCta",
      title: "Button",
      type: "cta",
      group: "hero",
      description: "The phone number shown beside it always comes from the verified Agent profile.",
    }),

    // ── Story ────────────────────────────────────────────────────────────────
    defineField({
      name: "archWords",
      title: "Arch words (three)",
      type: "array",
      group: "story",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(4),
      description: "Short words set along the arch, e.g. First homes · Selling · Investing.",
    }),
    defineField({ name: "archCaption", title: "Arch caption", type: "string", group: "story" }),
    toggle("showExpertise", "Show the expertise slider", "story"),
    defineField({ name: "expertiseHeading", title: "Expertise heading", type: "string", group: "story" }),
    toggle("showAbout", "Show the about statement", "story"),
    defineField({
      name: "aboutStatement",
      title: "About statement",
      type: "text",
      rows: 4,
      group: "story",
      description: "A short statement shown large. The biography beneath it comes from the Agent profile.",
    }),
    toggle("showAreas", "Show the service areas chapter", "story"),
    defineField({ name: "areasHeading", title: "Areas heading", type: "string", group: "story" }),
    defineField({ name: "areasIntro", title: "Areas introduction", type: "text", rows: 3, group: "story" }),

    // ── Homes ────────────────────────────────────────────────────────────────
    toggle("showFeaturedHomes", "Show featured homes", "homes"),
    defineField({ name: "featuredHeading", title: "Featured homes heading", type: "string", group: "homes" }),
    toggle("showMarket", "Show the market experience statement", "homes"),
    defineField({ name: "marketHeading", title: "Market heading", type: "string", group: "homes" }),
    toggle("showRecentlySold", "Show recently sold", "homes"),
    defineField({ name: "soldHeading", title: "Recently sold heading", type: "string", group: "homes" }),

    // ── Proof & contact ──────────────────────────────────────────────────────
    toggle("showHowIWork", "Show “How I work”", "proof"),
    defineField({ name: "howHeading", title: "“How I work” heading", type: "string", group: "proof" }),
    defineField({ name: "howIntro", title: "“How I work” introduction", type: "text", rows: 3, group: "proof" }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      group: "proof",
      of: [{ type: "serviceItem" }],
    }),
    toggle("showCredibility", "Show reviews & credentials", "proof"),
    defineField({ name: "credibilityHeading", title: "Reviews heading", type: "string", group: "proof" }),
    defineField({ name: "ctaGiantWord", title: "Closing word", type: "string", group: "proof", validation: (r) => r.max(18) }),
    defineField({ name: "ctaHeading", title: "Closing heading", type: "string", group: "proof" }),
    defineField({ name: "ctaBody", title: "Closing text", type: "text", rows: 3, group: "proof" }),
    defineField({ name: "ctaPrimary", title: "Closing — button", type: "cta", group: "proof" }),
    defineField({
      name: "ctaImage",
      title: "Closing scene — photograph",
      type: "imageWithMeta",
      group: "proof",
      description:
        "The photograph the two closing windows look onto, then the full-screen closing words. A landscape photograph, at least 1600 px wide, works best — a house or a street rather than a map-like aerial. Leave empty to use one of the area photographs.",
    }),

    defineField({ name: "seo", title: "Search & sharing", type: "seo", group: "seo" }),
    seedField(),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
