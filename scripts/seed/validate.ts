import { assertValidId } from "@/lib/seed/ids";
import type { SeedEntry } from "@/lib/seed/types";

/** Structural checks on mapper output. Returns a list of problems (empty = valid). */
export function validateEntries(entries: SeedEntry[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const idSet = new Set(entries.map((e) => e.id));

  for (const e of entries) {
    try {
      assertValidId(e.id);
    } catch (err) {
      problems.push((err as Error).message);
    }
    if (seen.has(e.id)) problems.push(`duplicate id ${e.id}`);
    seen.add(e.id);
    if (e.doc._id !== e.id) problems.push(`${e.id}: doc._id mismatch (${e.doc._id})`);
    if (e.doc._type !== e.type) problems.push(`${e.id}: doc._type mismatch (${e.doc._type})`);
    const walk = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (item && typeof item === "object" && !Array.isArray(item) && !(item as Record<string, unknown>)._key) {
            problems.push(`${e.id}: ${path}[${i}] is missing a _key`);
          }
          walk(item, `${path}[${i}]`);
        });
      } else if (value && typeof value === "object") {
        const o = value as Record<string, unknown>;
        if (o._type === "reference") {
          if (typeof o._ref !== "string" || !idSet.has(o._ref)) problems.push(`${e.id}: ${path} references missing document ${String(o._ref)}`);
        }
        for (const [k, v] of Object.entries(o)) {
          if (v === null) problems.push(`${e.id}: ${path}.${k} is null (should be omitted)`);
          walk(v, `${path}.${k}`);
        }
      }
    };
    walk(e.doc, "");
  }
  return problems;
}
