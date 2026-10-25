import type { SeedDocument } from "@/lib/seed/types";
import type { Action, ExistingDoc } from "./plan";

/**
 * Where seed documents are read from and written to. The planner never touches
 * the network, so tests run against `MemoryStore` and the CLI against
 * `SanityStore`; both obey the same contract.
 */
export interface SeedStore {
  fetchExisting(ids: string[]): Promise<Map<string, ExistingDoc>>;
  /** Apply a batch atomically (all or nothing). */
  commit(actions: Array<Extract<Action, { kind: "create" | "update" }>>): Promise<void>;
}

type Writable = Extract<Action, { kind: "create" | "update" }>;

/** In-memory Content Lake stand-in used by the test-suite and by dry runs. */
export class MemoryStore implements SeedStore {
  readonly docs = new Map<string, Record<string, unknown>>();
  commits = 0;

  async fetchExisting(ids: string[]): Promise<Map<string, ExistingDoc>> {
    const out = new Map<string, ExistingDoc>();
    for (const id of ids) {
      const d = this.docs.get(id);
      if (d) out.set(id, structuredClone(d) as ExistingDoc);
    }
    return out;
  }

  async commit(actions: Writable[]): Promise<void> {
    this.commits++;
    // Validate first so the batch is atomic.
    for (const a of actions) {
      if (a.kind === "update" && !this.docs.has(a.id)) throw new Error(`patch target missing: ${a.id}`);
    }
    for (const a of actions) {
      if (a.kind === "create") {
        // createIfNotExists semantics
        if (!this.docs.has(a.id)) this.docs.set(a.id, structuredClone(a.doc) as Record<string, unknown>);
      } else {
        const d = this.docs.get(a.id)!;
        Object.assign(d, structuredClone(a.set));
        for (const f of a.unset) delete d[f];
      }
    }
  }

  /** Simulate an editor changing a field in Studio. */
  editorSet(id: string, field: string, value: unknown) {
    const d = this.docs.get(id);
    if (!d) throw new Error(`no such doc ${id}`);
    d[field] = value;
  }
}

/** Real Content Lake via @sanity/client. Requires a write token. */
export async function createSanityStore(config: {
  projectId: string;
  dataset: string;
  apiVersion: string;
  token?: string;
}): Promise<SeedStore> {
  const { createClient } = await import("@sanity/client");
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    useCdn: false,
    perspective: "raw",
  });

  return {
    async fetchExisting(ids) {
      const out = new Map<string, ExistingDoc>();
      for (let i = 0; i < ids.length; i += 100) {
        const chunk = ids.slice(i, i + 100);
        const docs = await client.fetch<ExistingDoc[]>("*[_id in $ids]", { ids: chunk });
        for (const d of docs) out.set(d._id, d);
      }
      return out;
    },
    async commit(actions) {
      const tx = client.transaction();
      for (const a of actions) {
        if (a.kind === "create") {
          tx.createIfNotExists(a.doc as SeedDocument & { _id: string; _type: string });
        } else {
          const patch = client.patch(a.id).set(a.set);
          tx.patch(a.unset.length ? patch.unset(a.unset) : patch);
        }
      }
      await tx.commit({ visibility: "async" });
    },
  };
}
