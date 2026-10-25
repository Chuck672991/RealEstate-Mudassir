import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";
import { seedField, sourcesField, verificationField } from "../../lib/fields";

export const brokerage = defineType({
  name: "brokerage",
  title: "Brokerage",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Brokerage", default: true },
    { name: "provenance", title: "Source & verification" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Brokerage name",
      type: "verifiedText",
      group: "content",
    }),
    defineField({
      name: "officeAddress",
      title: "Office address",
      type: "postalAddress",
      group: "content",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "imageWithMeta",
      group: "content",
      description:
        "The brokerage logo is a trademark. Use it only with the brokerage's written approval and follow its brand rules.",
    }),
    defineField({
      name: "officialPage",
      title: "Official brokerage profile page",
      type: "verifiedText",
      group: "content",
    }),
    defineField({ name: "team", title: "Team name", type: "verifiedText", group: "content" }),
    defineField({
      name: "disclosure",
      title: "Required disclosure",
      type: "text",
      rows: 4,
      group: "content",
      description:
        "Any wording the brokerage requires on agent websites (equal-housing statement, MLS/IDX attribution, licence wording). Supplied by the broker — shown in the footer.",
    }),
    sourcesField(),
    verificationField(),
    seedField(),
  ],
  preview: {
    select: { title: "name.value", subtitle: "officeAddress.city" },
    prepare: ({ title, subtitle }) => ({ title: title || "Brokerage", subtitle }),
  },
});
