import { claimValue, publishedOnly, text, type RawClaim } from "@/features/content/policy";
import { toImage, type RawImage } from "@/lib/sanity/image";
import { toTelHref } from "@/lib/utils/format";
import { isPublishable } from "@/sanity/lib/enums";
import type { AddressDTO, AgentDTO, BrokerageDTO, PortableTextValue } from "@/types/content";

export interface RawAgent {
  fullName?: string | null;
  displayName?: string | null;
  professionalTitle?: RawClaim<string> | null;
  tagline?: string | null;
  introduction?: string | null;
  bio?: PortableTextValue | null;
  headshot?: RawImage | null;
  languages?: string[] | null;
  propertyTypes?: string[] | null;
  phonePrimary?: RawClaim<string> | null;
  email?: RawClaim<string> | null;
  website?: RawClaim<string> | null;
  facebook?: RawClaim<string> | null;
  links?: Array<{ label?: string | null; url?: string | null; status?: string | null }> | null;
  licenseNumber?: RawClaim<string> | null;
  licenseState?: string | null;
  yearsExperience?: RawClaim<number> | null;
  rating?: {
    average?: number | null;
    count?: number | null;
    source?: string | null;
    firstReviewDate?: string | null;
    lastReviewDate?: string | null;
    status?: string | null;
  } | null;
  credentials?: Array<{ name?: string | null; kind?: string | null; issuer?: string | null; year?: number | null; status?: string | null }> | null;
  brokerage?: {
    name?: RawClaim<string> | null;
    officeAddress?: { street?: string | null; city?: string | null; state?: string | null; zip?: string | null; status?: string | null } | null;
    officialPage?: RawClaim<string> | null;
    team?: RawClaim<string> | null;
    disclosure?: string | null;
    logo?: RawImage | null;
  } | null;
}

function toAddress(raw?: NonNullable<RawAgent["brokerage"]>["officeAddress"]): AddressDTO | undefined {
  if (!raw || !isPublishable(raw.status)) return undefined;
  const street = text(raw.street);
  const city = text(raw.city);
  const state = text(raw.state);
  const zip = text(raw.zip);
  if (!street && !city) return undefined;
  const cityLine = [city, [state, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return { street, city, state, zip, oneLine: [street, cityLine].filter(Boolean).join(", ") };
}

function toBrokerage(raw?: RawAgent["brokerage"]): BrokerageDTO | undefined {
  if (!raw) return undefined;
  return {
    name: claimValue(raw.name),
    address: toAddress(raw.officeAddress),
    logo: toImage(raw.logo, claimValue(raw.name) ? `${claimValue(raw.name)} logo` : "Brokerage logo"),
    disclosure: text(raw.disclosure),
    officialPage: claimValue(raw.officialPage),
    team: claimValue(raw.team),
  };
}

/**
 * The agent, reduced to what the site is allowed to say. Every claim passes
 * through `claimValue`, so an unverified phone, email, title, designation or link
 * simply does not exist on the returned object.
 */
export function shapeAgent(raw: RawAgent | null | undefined): AgentDTO {
  const fullName = text(raw?.fullName) ?? "Mudassir Siddiqui";
  const phoneDisplay = claimValue(raw?.phonePrimary);
  const phoneHref = toTelHref(phoneDisplay);
  const rating = raw?.rating;

  return {
    fullName,
    displayName: text(raw?.displayName) ?? fullName,
    title: claimValue(raw?.professionalTitle),
    tagline: text(raw?.tagline),
    introduction: text(raw?.introduction),
    bio: raw?.bio ?? [],
    headshot: toImage(raw?.headshot, `Portrait of ${fullName}`),
    languages: raw?.languages ?? [],
    propertyTypes: raw?.propertyTypes ?? [],
    phone:
      phoneDisplay && phoneHref
        ? { display: phoneDisplay, href: phoneHref, e164: phoneHref.slice(4) }
        : undefined,
    email: claimValue(raw?.email),
    links: publishedOnly(raw?.links)
      .filter((l): l is { label: string; url: string; status?: string | null } => !!l.label && !!l.url)
      .map((l) => ({ label: l.label, href: l.url })),
    license: (() => {
      const number = claimValue(raw?.licenseNumber);
      return number ? { number, state: text(raw?.licenseState) ?? "IL" } : undefined;
    })(),
    yearsExperience: claimValue(raw?.yearsExperience),
    rating:
      rating && isPublishable(rating.status) && rating.average != null && rating.count
        ? {
            average: rating.average,
            count: rating.count,
            source: text(rating.source) ?? "online reviews",
            firstReviewDate: text(rating.firstReviewDate),
            lastReviewDate: text(rating.lastReviewDate),
          }
        : undefined,
    credentials: publishedOnly(raw?.credentials)
      .filter((c): c is { name: string; kind?: string; issuer?: string; year?: number; status?: string } => !!c.name)
      .map((c) => ({ name: c.name, kind: c.kind, issuer: c.issuer, year: c.year })),
    brokerage: toBrokerage(raw?.brokerage),
  };
}
