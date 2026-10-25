import { hashValue, sameValue } from "@/lib/seed/hash";
import type { SeedDocument, SeedEntry } from "@/lib/seed/types";

/**
 * SEED PLANNER — pure functions, no network.
 *
 * Re-seeding policy (this is what "safe to run again" means here):
 *
 *   • Documents are addressed by stable IDs → never duplicated.
 *   • A document that does not exist is CREATED (full document).
 *   • A document that exists is only touched if the DATASET changed since the
 *     last import (its recorded hash differs), and then only the seed-OWNED
 *     fields, and only those the editor has not edited in Studio since.
 *       – field unchanged since import  → updated from the dataset
 *       – field edited by an editor     → left alone, reported as a conflict
 *   • Editorial copy, uploaded images and show/hide switches are not owned by the
 *     seed at all: written once at creation, never again.
 *   • Nothing is ever deleted.
 *   • A document that exists without seed bookkeeping (created by hand) is skipped.
 */

export const SEED_SOURCE = "content_seed.json";

export interface SeedMeta {
  source: string;
  hash: string;
  fieldHashes: string;
  importedAt: string;
}

export interface ExistingDoc {
  _id: string;
  _type: string;
  seed?: Partial<SeedMeta> | null;
  [field: string]: unknown;
}

export type Action =
  | { kind: "create"; id: string; type: string; doc: SeedDocument }
  | {
      kind: "update";
      id: string;
      type: string;
      set: Record<string, unknown>;
      unset: string[];
      conflicts: string[];
      changed: string[];
    }
  | { kind: "unchanged"; id: string; type: string; conflicts: string[] }
  | { kind: "skip"; id: string; type: string; reason: string };

export interface Plan {
  actions: Action[];
}

/** Dependency tiers: strong references require their target to exist already. */
const TIER: Record<string, number> = {
  source: 0,
  brokerage: 1,
  agentProfile: 2,
  serviceArea: 3,
  specialty: 3,
  property: 4,
  testimonial: 4,
  marketStatistics: 4,
  siteSettings: 4,
  homePage: 4,
  propertiesPage: 4,
  contactPage: 4,
};

export const sortByDependency = <T extends { type: string; id: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => (TIER[a.type] ?? 9) - (TIER[b.type] ?? 9) || a.id.localeCompare(b.id));

function fieldHashesFor(entry: SeedEntry): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of entry.owned) {
    if (entry.doc[f] !== undefined) out[f] = hashValue(entry.doc[f]);
  }
  return out;
}

const docHashFor = (entry: SeedEntry): string =>
  hashValue(Object.fromEntries(entry.owned.map((f) => [f, entry.doc[f]]).filter(([, v]) => v !== undefined)));

export function buildSeedMeta(entry: SeedEntry, now: string, fieldHashes = fieldHashesFor(entry)): SeedMeta {
  return { source: SEED_SOURCE, hash: docHashFor(entry), fieldHashes: JSON.stringify(fieldHashes), importedAt: now };
}

export function planSeed(entries: SeedEntry[], existing: Map<string, ExistingDoc>, now: string): Plan {
  const actions: Action[] = [];

  for (const entry of sortByDependency(entries)) {
    const current = existing.get(entry.id);

    // ── create ────────────────────────────────────────────────────────────────
    if (!current) {
      actions.push({
        kind: "create",
        id: entry.id,
        type: entry.type,
        doc: { ...entry.doc, seed: buildSeedMeta(entry, now) } as SeedDocument,
      });
      continue;
    }

    // ── never touch what we did not create ───────────────────────────────────────
    if (!current.seed?.fieldHashes || !current.seed.hash) {
      actions.push({
        kind: "skip",
        id: entry.id,
        type: entry.type,
        reason: "exists without seed bookkeeping (created by hand) — left untouched",
      });
      continue;
    }

    // ── dataset unchanged since last import ──────────────────────────────────────
    const newDocHash = docHashFor(entry);
    if (current.seed.hash === newDocHash) {
      actions.push({ kind: "unchanged", id: entry.id, type: entry.type, conflicts: [] });
      continue;
    }

    // ── dataset changed: three-way merge per owned field ───────────────────────
    let previous: Record<string, string> = {};
    try {
      previous = JSON.parse(current.seed.fieldHashes) as Record<string, string>;
    } catch {
      actions.push({
        kind: "skip",
        id: entry.id,
        type: entry.type,
        reason: "seed bookkeeping is unreadable — left untouched",
      });
      continue;
    }

    const set: Record<string, unknown> = {};
    const unset: string[] = [];
    const conflicts: string[] = [];
    const changed: string[] = [];
    const nextHashes = { ...previous };

    for (const field of entry.owned) {
      const wanted = entry.doc[field];
      const have = current[field];
      if (sameValue(have, wanted)) {
        if (wanted !== undefined) nextHashes[field] = hashValue(wanted);
        else delete nextHashes[field];
        continue;
      }
      const recorded = previous[field];
      const untouchedByEditor =
        recorded === undefined ? have === undefined : recorded === hashValue(have);
      if (!untouchedByEditor) {
        conflicts.push(field);
        continue;
      }
      changed.push(field);
      if (wanted === undefined) {
        unset.push(field);
        delete nextHashes[field];
      } else {
        set[field] = wanted;
        nextHashes[field] = hashValue(wanted);
      }
    }

    if (changed.length === 0) {
      // Nothing safe to write. Keep the old hash while conflicts remain so they stay visible.
      actions.push({ kind: "unchanged", id: entry.id, type: entry.type, conflicts });
      continue;
    }

    set.seed = {
      ...buildSeedMeta(entry, now, nextHashes),
      // While conflicts remain, keep the previous document hash so the next run re-examines them.
      hash: conflicts.length ? current.seed.hash : newDocHash,
    };
    actions.push({ kind: "update", id: entry.id, type: entry.type, set, unset, conflicts, changed });
  }

  return { actions };
}

export interface Summary {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  conflicts: number;
}

export function summarise(actions: Action[]): { total: Summary; byType: Record<string, Summary> } {
  const blank = (): Summary => ({ created: 0, updated: 0, unchanged: 0, skipped: 0, conflicts: 0 });
  const total = blank();
  const byType: Record<string, Summary> = {};
  for (const a of actions) {
    const bucket = (byType[a.type] ??= blank());
    for (const s of [bucket, total]) {
      if (a.kind === "create") s.created++;
      else if (a.kind === "update") s.updated++;
      else if (a.kind === "unchanged") s.unchanged++;
      else s.skipped++;
      if ((a.kind === "update" || a.kind === "unchanged") && a.conflicts.length) s.conflicts++;
    }
  }
  return { total, byType };
}
