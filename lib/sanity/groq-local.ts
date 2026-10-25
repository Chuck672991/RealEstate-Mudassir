import { evaluate, parse } from "groq-js";

import seedJson from "@/content_seed.json";
import localImages from "@/content/local-images.json";
import { buildSeedEntries } from "@/lib/seed/mapper";
import type { SeedDocument, SeedFile } from "@/lib/seed/types";

/**
 * LOCAL CONTENT ENGINE (pure — no server-only, so tests can import it).
 *
 * Evaluates the SAME GROQ queries the CMS path uses, against the documents the
 * seed script would create from content_seed.json. No network, deterministic,
 * and guaranteed to match what a freshly-seeded dataset returns.
 */
let documents: SeedDocument[] | null = null;

export function getLocalDocuments(): SeedDocument[] {
  if (documents) return documents;
  const seed = seedJson as unknown as SeedFile;
  const stamp = `${seed.meta.observed_on}T00:00:00.000Z`;
  documents = buildSeedEntries(seed).entries.map(
    (e) => ({ _createdAt: stamp, _updatedAt: stamp, _rev: "local", ...e.doc }) as SeedDocument,
  );
  attachLocalImages(documents);
  return documents;
}

export async function evaluateLocal(query: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const tree = parse(query, { params });
  const value = await evaluate(tree, { dataset: getLocalDocuments(), params });
  return value.get();
}

/**
 * Pictures the site owner placed in public/photos (content/local-images.json) become the same
 * image field a Sanity upload would fill, so the real `toImage` rights check and every component
 * run unchanged. The seed script does NOT use this: Sanity gets its images by upload.
 */
function attachLocalImages(docs: SeedDocument[]): void {
  const byId = new Map(docs.map((d) => [d._id, d as unknown as Record<string, unknown>]));
  for (const entry of localImages.images as LocalImage[]) {
    const doc = byId.get(entry.doc);
    if (!doc) continue;
    doc[entry.field] = {
      ...((doc[entry.field] as Record<string, unknown> | undefined) ?? { _type: "imageWithMeta" }),
      alt: entry.alt,
      credit: entry.credit,
      rightsStatus: entry.rights,
      hotspot: entry.hotspot,
      asset: { _type: "reference", _ref: `local:${entry.file}` },
    };
    // the document the reference points at, exactly as Sanity stores an uploaded image
    docs.push({
      _id: `local:${entry.file}`,
      _type: "sanity.imageAsset",
      url: entry.file,
      metadata: { lqip: null, dimensions: { width: entry.width, height: entry.height } },
    } as unknown as SeedDocument);
  }
}

interface LocalImage {
  doc: string;
  field: string;
  file: string;
  width: number;
  height: number;
  alt: string;
  rights: string;
  credit?: string;
  hotspot?: { x: number; y: number };
}
