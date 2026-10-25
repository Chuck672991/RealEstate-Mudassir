/**
 * Seed Sanity from content_seed.json.
 *
 *   npm run seed:sanity            write to the configured dataset
 *   npm run seed:sanity:dry        show what would happen (offline, writes nothing)
 *
 * Options
 *   --dry-run        plan only; never writes
 *   --remote         with --dry-run: compare against the real dataset (read-only)
 *   --only a,b       restrict to document types (e.g. --only property,testimonial)
 *   --file <path>    use another dataset file
 *   --json           print the report as JSON
 *
 * Safe to run repeatedly: stable IDs, no duplicates, no deletions, and editors'
 * own edits in Studio are never overwritten (see scripts/seed/plan.ts).
 *
 * Environment (.env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, NEXT_PUBLIC_SANITY_API_VERSION
 *   SANITY_API_WRITE_TOKEN   an Editor-role token — needed only to write
 *
 * Images are NOT downloaded or uploaded by this script (see docs/ASSETS.md);
 * photo source URLs are recorded as metadata only. To add your own originals use
 * `npm run images:import`.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { loadEnvConfig } from "@next/env";

import { buildSeedEntries } from "@/lib/seed/mapper";
import type { SeedFile } from "@/lib/seed/types";

import { formatReport } from "./seed/report";
import { runSeed } from "./seed/run";
import { MemoryStore, createSanityStore, type SeedStore } from "./seed/store";
import { validateEntries } from "./seed/validate";

loadEnvConfig(process.cwd());

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    remote: { type: "boolean", default: false },
    only: { type: "string" },
    file: { type: "string" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (values.help) {
  console.log(readFileSync(process.argv[1]!, "utf8").split("*/")[0]!.replace(/^\/\*\*?\n?/, ""));
  process.exit(0);
}

async function main(): Promise<number> {
  const file = path.resolve(process.cwd(), values.file ?? "content_seed.json");
  const seed = JSON.parse(readFileSync(file, "utf8")) as SeedFile;

  const { entries, warnings } = buildSeedEntries(seed);
  const problems = validateEntries(entries);
  if (problems.length) {
    console.error("The dataset did not produce valid documents:\n" + problems.map((p) => `  ✖ ${p}`).join("\n"));
    return 1;
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2025-02-19";
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const dryRun = values["dry-run"] ?? false;
  const only = values.only?.split(",").map((s) => s.trim()).filter(Boolean);

  let store: SeedStore;
  if (dryRun && !values.remote) {
    store = new MemoryStore(); // offline: assume an empty dataset
  } else {
    if (!projectId) {
      console.error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to .env.local (see .env.example).");
      return 2;
    }
    if (!dryRun && !token) {
      console.error(
        "SANITY_API_WRITE_TOKEN is not set. Create an Editor token at https://www.sanity.io/manage → API → Tokens and add it to .env.local.",
      );
      return 2;
    }
    store = await createSanityStore({ projectId, dataset, apiVersion, token });
    if (!dryRun) console.log(`Writing to Sanity project "${projectId}", dataset "${dataset}"…`);
  }

  const report = await runSeed({
    store,
    entries,
    apply: !dryRun,
    now: new Date().toISOString(),
    only,
  });

  if (values.json) {
    console.log(JSON.stringify({ ...report, warnings }, null, 2));
  } else {
    console.log(formatReport(report, { dryRun, warnings }));
  }
  return report.failures.length ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
