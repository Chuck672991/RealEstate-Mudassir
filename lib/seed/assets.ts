import type { SeedEntry } from "./types";

/**
 * ASSET MANIFEST — every picture slot the research dataset refers to, what the
 * original is, who probably owns it, and what is needed before it can appear on
 * the site. Generated from the same mapping that seeds the CMS, so the manifest and
 * the CMS metadata can never disagree.
 *
 * Nothing in this project downloads, copies or hotlinks third-party photographs:
 * Homes.com / MLS images are not cleared for reuse (content brief §9), so the
 * manifest records them as REQUESTS for originals, not as files.
 */

export type AssetKind = "portrait" | "brokerage_logo" | "neighborhood_photo" | "listing_photo";

export interface AssetRecord {
  /** Dataset id, e.g. MEDIA-001, or the listing record id for property photos. */
  id: string;
  kind: AssetKind;
  /** Plain-language subject — never a street address. */
  subject: string;
  cmsDocument: string;
  cmsField: string;
  intendedUse: string;
  sourceUrl?: string;
  sourceHost?: string;
  rightsStatus: string;
  /** What this project did with the file. */
  decision: "not_downloaded";
  reason: string;
  /** What has to happen before the slot can show a real picture. */
  toClear: string;
}

export interface AssetManifest {
  generatedFrom: string;
  observedOn: string;
  policy: string;
  summary: { total: number; downloaded: number; byKind: Record<string, number>; byRights: Record<string, number> };
  assets: AssetRecord[];
}

const KIND_BY_TYPE: Record<string, { kind: AssetKind; field: string }> = {
  agentProfile: { kind: "portrait", field: "headshot" },
  brokerage: { kind: "brokerage_logo", field: "logo" },
  serviceArea: { kind: "neighborhood_photo", field: "image" },
  property: { kind: "listing_photo", field: "heroImage" },
};

const REASON: Record<AssetKind, string> = {
  portrait:
    "Hosted by Homes.com. It is probably the agent's own or commissioned photograph, but this copy is not a licence: the original file and the photographer's terms are needed.",
  brokerage_logo: "A trademark of the brokerage. Use requires the brokerage's brand rules and written approval.",
  neighborhood_photo: "Licence unknown. Area photography on Homes.com is third-party content; replace it with original or licensed photography.",
  listing_photo:
    "A listing/MLS photograph. These are normally licensed to the listing broker, photographer or MLS (Midwest Real Estate Data via MLS Grid) and are not cleared for reuse.",
};

const TO_CLEAR: Record<AssetKind, string> = {
  portrait: "Agent supplies the original portrait and confirms the licence → upload with rights = owned/licensed.",
  brokerage_logo: "Broker supplies the approved logo files and written permission → upload with rights = permission.",
  neighborhood_photo: "Agent supplies original or licensed area photography → upload with rights = owned/licensed.",
  listing_photo: "Agent/brokerage supplies the photo (or an MLS-compliant IDX feed is connected) with written approval → upload with rights = licensed/permission.",
};

const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).host : undefined;
  } catch {
    return undefined;
  }
};

/** Walks the seed documents and lists every `imageWithMeta` slot they define. */
export function buildAssetManifest(entries: SeedEntry[], observedOn: string): AssetManifest {
  const assets: AssetRecord[] = [];

  for (const entry of entries) {
    const slot = KIND_BY_TYPE[entry.type];
    if (!slot) continue;
    const image = entry.doc[slot.field] as Record<string, unknown> | undefined;
    if (!image || image._type !== "imageWithMeta") continue;

    const sourceUrl = typeof image.sourceUrl === "string" ? image.sourceUrl : undefined;
    const subject =
      slot.kind === "listing_photo"
        ? String((entry.doc as Record<string, unknown>).title ?? entry.id)
        : slot.kind === "neighborhood_photo"
          ? String((entry.doc as Record<string, unknown>).name ?? entry.id)
          : slot.kind === "portrait"
            ? "The agent"
            : "The brokerage";

    assets.push({
      id: String(image.manifestId ?? entry.id),
      kind: slot.kind,
      subject,
      cmsDocument: entry.id,
      cmsField: slot.field,
      intendedUse: String(image.intendedUse ?? ""),
      sourceUrl,
      sourceHost: hostOf(sourceUrl),
      rightsStatus: String(image.rightsStatus ?? "pending"),
      decision: "not_downloaded",
      reason: REASON[slot.kind],
      toClear: TO_CLEAR[slot.kind],
    });
  }

  assets.sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id));

  const count = <K extends string>(pick: (a: AssetRecord) => K) =>
    assets.reduce<Record<string, number>>((acc, a) => ({ ...acc, [pick(a)]: (acc[pick(a)] ?? 0) + 1 }), {});

  return {
    generatedFrom: "content_seed.json via lib/seed/mapper.ts (npm run assets:manifest)",
    observedOn,
    policy:
      "Public availability is not permission to reuse. This project fetches no third-party image and hotlinks none. Each slot is a request for an original file with a recorded licence; pictures the owner supplied by hand are listed in content/local-images.json with rights owner_directed (permission not confirmed).",
    summary: { total: assets.length, downloaded: 0, byKind: count((a) => a.kind), byRights: count((a) => a.rightsStatus) },
    assets,
  };
}

// ── image import map (agent-supplied originals) ────────────────────────────────

export const IMPORT_FIELDS = {
  headshot: "agentProfile",
  logo: "brokerage",
  image: "serviceArea-",
  heroImage: "property-",
} as const;
export type ImportField = keyof typeof IMPORT_FIELDS;

/** Only rights that allow publication may be imported. */
export const IMPORT_RIGHTS = ["owned", "licensed", "permission"] as const;
export type ImportRights = (typeof IMPORT_RIGHTS)[number];

export const IMPORT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"] as const;
export const IMPORT_MAX_BYTES = 25 * 1024 * 1024;

export interface ImportItem {
  /** Sanity document id, e.g. "agentProfile" or "property-sold-001". */
  doc: string;
  field: ImportField;
  /** Local file path (relative to the map file). */
  file: string;
  rights: ImportRights;
  alt?: string;
  decorative?: boolean;
  credit?: string;
  caption?: string;
  rightsNotes?: string;
}

/** Pure validation of an import map (file existence/size are checked by the CLI). */
export function validateImportMap(input: unknown): { items: ImportItem[]; errors: string[] } {
  const errors: string[] = [];
  if (!Array.isArray(input)) return { items: [], errors: ["The map must be a JSON array of objects."] };

  const items: ImportItem[] = [];
  input.forEach((raw, i) => {
    const at = `item ${i + 1}`;
    if (!raw || typeof raw !== "object") return errors.push(`${at}: must be an object`);
    const o = raw as Record<string, unknown>;
    const problems: string[] = [];

    if (typeof o.doc !== "string" || !o.doc) problems.push('"doc" (document id) is required');
    if (typeof o.file !== "string" || !o.file) problems.push('"file" is required');
    if (!(typeof o.field === "string" && o.field in IMPORT_FIELDS)) {
      problems.push(`"field" must be one of: ${Object.keys(IMPORT_FIELDS).join(", ")}`);
    } else if (typeof o.doc === "string") {
      const prefix = IMPORT_FIELDS[o.field as ImportField];
      const matches = prefix.endsWith("-") ? o.doc.startsWith(prefix) : o.doc === prefix;
      if (!matches) problems.push(`field "${o.field}" belongs to document "${prefix}${prefix.endsWith("-") ? "…" : ""}", not "${o.doc}"`);
    }
    if (!IMPORT_RIGHTS.includes(o.rights as ImportRights)) {
      problems.push(`"rights" must be stated explicitly and be one of: ${IMPORT_RIGHTS.join(", ")} (never assumed)`);
    }
    if (typeof o.file === "string" && !IMPORT_EXTENSIONS.some((ext) => (o.file as string).toLowerCase().endsWith(ext))) {
      problems.push(`file type must be one of ${IMPORT_EXTENSIONS.join(", ")}`);
    }
    if (!o.decorative && !(typeof o.alt === "string" && o.alt.trim())) {
      problems.push('"alt" text is required unless "decorative": true');
    }

    if (problems.length) errors.push(`${at}: ${problems.join("; ")}`);
    else items.push(o as unknown as ImportItem);
  });
  return { items, errors };
}
