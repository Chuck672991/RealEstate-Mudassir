/**
 * Writes docs/asset-manifest.json — the list of every picture slot in the dataset and
 * what is needed before it can show a real photograph (see lib/seed/assets.ts).
 *
 *   npm run assets:manifest            write docs/asset-manifest.json
 *   npm run assets:manifest -- --check fail (exit 1) if the committed file is out of date
 *
 * Offline and read-only apart from that one file: no image is downloaded.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildAssetManifest } from "@/lib/seed/assets";
import { buildSeedEntries } from "@/lib/seed/mapper";
import type { SeedFile } from "@/lib/seed/types";

const seed = JSON.parse(readFileSync(path.join(process.cwd(), "content_seed.json"), "utf8")) as SeedFile;
const manifest = buildAssetManifest(buildSeedEntries(seed).entries, seed.meta.observed_on);
const json = `${JSON.stringify(manifest, null, 2)}\n`;
const target = path.join(process.cwd(), "docs/asset-manifest.json");

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    /* missing */
  }
  if (current !== json) {
    console.error("docs/asset-manifest.json is out of date. Run `npm run assets:manifest` and commit the result.");
    process.exit(1);
  }
  console.log(`docs/asset-manifest.json is up to date (${manifest.summary.total} slots).`);
} else {
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, json);
  const { total, byKind, byRights } = manifest.summary;
  console.log(`Wrote docs/asset-manifest.json — ${total} slots, 0 downloaded.`);
  console.log("  by kind:  ", JSON.stringify(byKind));
  console.log("  by rights:", JSON.stringify(byRights));
}
