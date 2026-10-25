import type { SeedEntry } from "@/lib/seed/types";
import { planSeed, summarise, type Action, type Summary } from "./plan";
import type { SeedStore } from "./store";

export interface RunOptions {
  store: SeedStore;
  entries: SeedEntry[];
  /** false = plan only (nothing is written). */
  apply: boolean;
  /** ISO timestamp recorded in the seed bookkeeping. */
  now: string;
  /** Restrict to these document types. */
  only?: string[];
  chunkSize?: number;
}

export interface RunReport {
  applied: boolean;
  actions: Action[];
  total: Summary;
  byType: Record<string, Summary>;
  failures: Array<{ id: string; type: string; error: string }>;
}

type Writable = Extract<Action, { kind: "create" | "update" }>;

/**
 * Plan (and optionally apply) a seed run. Failures are isolated: if a batch is
 * rejected it is retried one document at a time so only the genuinely failing
 * documents are reported, and everything else still lands.
 */
export async function runSeed(opts: RunOptions): Promise<RunReport> {
  const entries = opts.only?.length ? opts.entries.filter((e) => opts.only!.includes(e.type)) : opts.entries;
  const existing = await opts.store.fetchExisting(entries.map((e) => e.id));
  const { actions } = planSeed(entries, existing, opts.now);

  const failures: RunReport["failures"] = [];
  if (opts.apply) {
    const writable = actions.filter((a): a is Writable => a.kind === "create" || a.kind === "update");
    const size = opts.chunkSize ?? 50;
    for (let i = 0; i < writable.length; i += size) {
      const chunk = writable.slice(i, i + size);
      try {
        await opts.store.commit(chunk);
      } catch {
        for (const action of chunk) {
          try {
            await opts.store.commit([action]);
          } catch (error) {
            failures.push({ id: action.id, type: action.type, error: error instanceof Error ? error.message : String(error) });
          }
        }
      }
    }
  }

  const { total, byType } = summarise(actions);
  return { applied: opts.apply, actions, total, byType, failures };
}
