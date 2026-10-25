/**
 * Upload photographs the AGENT HAS SUPPLIED (local files) and attach them to the right
 * picture slots, recording who may use them.
 *
 *   npm run images:import -- --map photos/images.json            dry run (default)
 *   npm run images:import -- --map photos/images.json --write    upload and attach
 *
 * The map is a JSON array. Example (paths are relative to the map file):
 *
 *   [
 *     { "doc": "agentProfile", "field": "headshot", "file": "portrait.jpg",
 *       "rights": "owned", "alt": "Mudassir Siddiqui in a dark suit outside a house",
 *       "credit": "Photo: …" },
 *     { "doc": "property-sold-001", "field": "heroImage", "file": "lyons-2f.jpg",
 *       "rights": "licensed", "alt": "Living room of a second-floor condo", "credit": "…" }
 *   ]
 *
 * Rules this script enforces — they exist so a picture can never reach the site without
 * a recorded right to use it:
 *   • files come from DISK only; it never fetches a URL (no scraping, no hotlinking);
 *   • "rights" must be stated for every image and be owned | licensed | permission;
 *   • alt text is required unless the image is marked decorative;
 *   • JPG/PNG/WebP/AVIF up to 25 MB; the document must already exist (run the seed first);
 *   • existing metadata on the slot (source URL, intended use, manifest id) is kept.
 *
 * Environment (.env.local): NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * NEXT_PUBLIC_SANITY_API_VERSION, and — only for --write — SANITY_API_WRITE_TOKEN.
 */
import { createReadStream, existsSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { loadEnvConfig } from "@next/env";

import { IMPORT_MAX_BYTES, validateImportMap } from "@/lib/seed/assets";

loadEnvConfig(process.cwd());

const { values } = parseArgs({
  options: { map: { type: "string" }, write: { type: "boolean", default: false }, help: { type: "boolean", default: false } },
});

async function main(): Promise<number> {
  if (values.help || !values.map) {
    console.log(readFileSync(process.argv[1]!, "utf8").split("*/")[0]!.replace(/^\/\*\*?\n?/, ""));
    return values.help ? 0 : 2;
  }

  const mapPath = path.resolve(process.cwd(), values.map);
  const baseDir = path.dirname(mapPath);
  const { items, errors } = validateImportMap(JSON.parse(readFileSync(mapPath, "utf8")));

  for (const item of items) {
    const file = path.resolve(baseDir, item.file);
    if (!existsSync(file)) errors.push(`${item.doc}.${item.field}: file not found — ${file}`);
    else if (statSync(file).size > IMPORT_MAX_BYTES) errors.push(`${item.doc}.${item.field}: file is larger than 25 MB`);
  }
  if (errors.length) {
    console.error("The import map has problems:\n" + errors.map((e) => `  ✖ ${e}`).join("\n"));
    return 1;
  }

  console.log(`${items.length} image(s) ready.${values.write ? "" : "  (dry run — pass --write to upload)"}`);
  for (const i of items) console.log(`  • ${i.doc}.${i.field} ← ${i.file}  [${i.rights}]`);
  if (!values.write) return 0;

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!projectId || !token) {
    console.error("NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required with --write.");
    return 2;
  }
  const { createClient } = await import("@sanity/client");
  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-02-19",
    token,
    useCdn: false,
  });

  let failed = 0;
  for (const item of items) {
    try {
      const existing = await client.getDocument<Record<string, unknown>>(item.doc);
      if (!existing) throw new Error(`document "${item.doc}" does not exist — run npm run seed:sanity first`);
      const file = path.resolve(baseDir, item.file);
      const asset = await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) });
      const previous = (existing[item.field] as Record<string, unknown> | undefined) ?? {};
      await client
        .patch(item.doc)
        .set({
          [item.field]: {
            ...previous,
            _type: "imageWithMeta",
            asset: { _type: "reference", _ref: asset._id },
            rightsStatus: item.rights,
            alt: item.alt,
            decorative: !!item.decorative,
            credit: item.credit,
            caption: item.caption,
            rightsNotes: item.rightsNotes,
          },
        })
        .commit();
      console.log(`  ✔ ${item.doc}.${item.field}`);
    } catch (error) {
      failed += 1;
      console.error(`  ✖ ${item.doc}.${item.field}: ${error instanceof Error ? error.message : error}`);
    }
  }
  return failed ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
