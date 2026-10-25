import { BarChartIcon } from "@sanity/icons/BarChart";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { CogIcon } from "@sanity/icons/Cog";
import { CommentIcon } from "@sanity/icons/Comment";
import { EyeClosedIcon } from "@sanity/icons/EyeClosed";
import { HomeIcon } from "@sanity/icons/Home";
import { LinkIcon } from "@sanity/icons/Link";
import { PinIcon } from "@sanity/icons/Pin";
import { StarIcon } from "@sanity/icons/Star";
import { UserIcon } from "@sanity/icons/User";
import { WarningOutlineIcon } from "@sanity/icons/WarningOutline";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

/** A document that exists exactly once, opened directly (no list). */
const singleton = (S: StructureBuilder, id: string, title: string, icon: typeof CogIcon) =>
  S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title));

const propertyList = (S: StructureBuilder, title: string, filter: string, icon: typeof HomeIcon = HomeIcon) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.documentList()
        .title(title)
        .schemaType("property")
        .filter(`_type == "property" && ${filter}`)
        .defaultOrdering([{ field: "soldDate", direction: "desc" }]),
    );

/**
 * Desk layout for a non-technical editor: the things they edit most are first,
 * and the “needs verification” pile is separated so it is obvious what is — and
 * is not — on the public site.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      singleton(S, "homePage", "Home page", HomeIcon),
      singleton(S, "propertiesPage", "Homes page", HomeIcon),
      singleton(S, "contactPage", "Contact page", CommentIcon),
      singleton(S, "siteSettings", "Site settings", CogIcon),
      S.divider(),
      singleton(S, "agentProfile", "Agent profile", UserIcon),
      singleton(S, "brokerage", "Brokerage", HomeIcon),
      S.divider(),
      S.listItem()
        .title("Properties")
        .icon(HomeIcon)
        .child(
          S.list()
            .title("Properties")
            .items([
              propertyList(S, "For sale", 'status == "active"'),
              propertyList(S, "Under contract", 'status == "pending"'),
              propertyList(S, "Sold — shown on site", 'status == "sold" && publicDisplay == true', CheckmarkCircleIcon),
              propertyList(S, "Sold — hidden", 'status == "sold" && publicDisplay != true', EyeClosedIcon),
              propertyList(S, "Rentals", 'status == "for_rent"'),
              propertyList(
                S,
                "Needs verification",
                '!(verification in ["verified","calculated"])',
                WarningOutlineIcon,
              ),
              S.divider(),
              S.documentTypeListItem("property").title("All properties"),
            ]),
        ),
      S.listItem()
        .title("Testimonials")
        .icon(CommentIcon)
        .child(
          S.list()
            .title("Testimonials")
            .items([
              S.listItem()
                .title("Approved & showing")
                .child(
                  S.documentList()
                    .title("Approved & showing")
                    .schemaType("testimonial")
                    .filter(
                      '_type == "testimonial" && approvedForPublication == true && reviewerPermission == true && defined(body)',
                    ),
                ),
              S.listItem()
                .title("Awaiting approval")
                .child(
                  S.documentList()
                    .title("Awaiting approval")
                    .schemaType("testimonial")
                    .filter('_type == "testimonial" && approvedForPublication != true'),
                ),
              S.divider(),
              S.documentTypeListItem("testimonial").title("All testimonials"),
            ]),
        ),
      S.documentTypeListItem("specialty").title("Specialties").icon(StarIcon),
      S.documentTypeListItem("serviceArea").title("Service areas").icon(PinIcon),
      singleton(S, "marketStatistics", "Market statistics", BarChartIcon),
      S.divider(),
      S.documentTypeListItem("source").title("Sources (advanced)").icon(LinkIcon),
    ]);
