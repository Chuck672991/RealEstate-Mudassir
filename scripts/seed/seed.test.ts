import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { buildSeedEntries } from "@/lib/seed/mapper";
import { hashValue } from "@/lib/seed/hash";
import type { SeedFile } from "@/lib/seed/types";
import { schemaTypes } from "@/sanity/schemaTypes";

import { runSeed } from "./run";
import { MemoryStore } from "./store";
import { validateEntries } from "./validate";

const load = (): SeedFile =>
  JSON.parse(readFileSync(path.resolve(process.cwd(), "content_seed.json"), "utf8")) as SeedFile;

const NOW = "2026-10-24T12:00:00.000Z";

describe("seed mapper", () => {
  const { entries, warnings } = buildSeedEntries(load());

  it("is deterministic (same input → identical documents)", () => {
    const again = buildSeedEntries(load());
    assert.equal(hashValue(again.entries.map((e) => e.doc)), hashValue(entries.map((e) => e.doc)));
  });

  it("covers every record in the dataset", () => {
    const seed = load();
    const count = (t: string) => entries.filter((e) => e.type === t).length;
    assert.equal(count("source"), seed.source_references.length);
    assert.equal(count("specialty"), seed.agent_specialties.length);
    assert.equal(count("serviceArea"), seed.service_areas.length);
    assert.equal(count("property"), seed.sold_properties.length + seed.active_listings.length);
    assert.equal(count("testimonial"), seed.testimonials.length);
    for (const t of ["agentProfile", "brokerage", "marketStatistics", "siteSettings", "homePage", "propertiesPage", "contactPage"]) {
      assert.equal(count(t), 1, t);
    }
  });

  it("produces structurally valid documents (ids, keys, references, no nulls)", () => {
    assert.deepEqual(validateEntries(entries), []);
  });

  it("never emits a document id containing a dot (those are private in Sanity)", () => {
    assert.ok(entries.every((e) => !e.id.includes(".")));
  });

  it("only seeds fields that exist in the Sanity schema (drift guard)", () => {
    const byName = new Map(schemaTypes.map((t) => [t.name, t as unknown as { fields?: Array<{ name: string }> }]));
    const problems: string[] = [];
    for (const e of entries) {
      const def = byName.get(e.type);
      if (!def) {
        problems.push(`${e.id}: no schema type "${e.type}"`);
        continue;
      }
      const declared = new Set((def.fields ?? []).map((f) => f.name));
      for (const key of Object.keys(e.doc)) {
        if (key.startsWith("_")) continue;
        if (!declared.has(key)) problems.push(`${e.id}: field "${key}" is not declared on type ${e.type}`);
      }
      for (const f of e.owned) if (!declared.has(f)) problems.push(`${e.type}: owned field "${f}" is not declared`);
    }
    assert.deepEqual(problems, []);
  });

  it("drops placeholder strings instead of importing them as data", () => {
    const sold038 = entries.find((e) => e.id === "property-sold-038")!;
    assert.equal(sold038.doc.street, undefined);
    assert.equal(sold038.doc.city, undefined);
    assert.ok(warnings.some((w) => w.includes("SOLD-038")));
    // No data field may hold a "(…)" placeholder. (Free-text research notes are exempt.)
    const leaks: string[] = [];
    const walk = (v: unknown, id: string, key: string) => {
      if (key === "internalNotes" || key === "note" || key === "rightsNotes") return;
      if (typeof v === "string" && /^\(.*\)$/.test(v.trim())) leaks.push(`${id}.${key} = ${v}`);
      else if (Array.isArray(v)) v.forEach((x) => walk(x, id, key));
      else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, id, k));
    };
    entries.forEach((e) => walk(e.doc, e.id, ""));
    assert.deepEqual(leaks, []);
  });

  it("only flags verified records for public display", () => {
    for (const e of entries.filter((x) => x.type === "property")) {
      const verified = e.doc.verification === "verified";
      assert.equal(e.doc.publicDisplay, verified, `${e.doc.recordId} publicDisplay vs verification`);
    }
    const shown = entries.filter((e) => e.type === "property" && e.doc.publicDisplay).length;
    assert.equal(shown, 17, "9 verified sales + 4 active + 4 pending");
  });

  it("never approves a testimonial or invents review text", () => {
    for (const e of entries.filter((x) => x.type === "testimonial")) {
      assert.equal(e.doc.approvedForPublication, false);
      assert.equal(e.doc.reviewerPermission, false);
      assert.equal(e.doc.body, undefined);
    }
  });

  it("keeps unverified contact data and credentials flagged as such", () => {
    const profile = entries.find((e) => e.type === "agentProfile")!.doc as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.equal(profile.phonePrimary.status, "verified");
    assert.equal(profile.phoneSecondary.status, "needs_verification");
    assert.equal(profile.email.value, undefined);
    assert.equal(profile.email.status, "unavailable");
    assert.ok(profile.credentials.length > 0);
    assert.ok(profile.credentials.every((c: { status: string }) => c.status === "needs_verification"));
  });

  it("hides the unsupported specialties and withholds the failing headline range", () => {
    const hidden = entries.filter((e) => e.type === "specialty" && e.doc.safeToFeature === false).map((e) => e.doc.name);
    for (const name of ["Luxury homes", "Commercial real estate", "Mortgage / refinance guidance", "Relocation services"]) {
      assert.ok(hidden.includes(name), `${name} should be hidden`);
    }
    const stats = entries.find((e) => e.type === "marketStatistics")!.doc;
    assert.equal(stats.showPriceRanges, false);
    assert.equal(stats.headlineRangeShown, "$193K - $990K"); // stored for audit only
  });

  it("suppresses the specs the research found inconsistent", () => {
    const get = (rid: string) => entries.find((e) => e.doc.recordId === rid)!.doc.suppressedFields;
    assert.deepEqual(get("SOLD-003"), ["beds", "baths"]);
    assert.deepEqual(get("SOLD-006"), ["beds", "sqft", "priceVsList"]);
    assert.deepEqual(get("LIST-006"), ["beds"]);
  });

  it("does not leak street addresses into titles, slugs or by default", () => {
    for (const e of entries.filter((x) => x.type === "property")) {
      const street = e.doc.street as string | undefined;
      assert.equal(e.doc.addressPublic, false);
      if (!street) continue;
      // Use the distinctive street word (e.g. "dorchester"), not a house number that could match "-034".
      const word = street
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length >= 4)
        .sort((a, b) => b.length - a.length)[0];
      if (!word) continue;
      assert.ok(!String(e.doc.title).toLowerCase().includes(word), `${e.id} title contains street`);
      assert.ok(!(e.doc.slug as { current: string }).current.includes(word), `${e.id} slug contains street`);
    }
  });

  it("keeps SEO defaults within recommended lengths", () => {
    const settings = entries.find((e) => e.type === "siteSettings")!.doc as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.ok(settings.defaultSeo.title.length <= 70, `title ${settings.defaultSeo.title.length}`);
    assert.ok(settings.defaultSeo.description.length <= 160, `description ${settings.defaultSeo.description.length}`);
  });
});

describe("seed run (idempotency + safety)", () => {
  const entries = buildSeedEntries(load()).entries;

  it("creates everything on an empty dataset", async () => {
    const store = new MemoryStore();
    const r = await runSeed({ store, entries, apply: true, now: NOW });
    assert.equal(r.total.created, entries.length);
    assert.equal(r.total.updated + r.total.skipped + r.total.unchanged, 0);
    assert.equal(r.failures.length, 0);
    assert.equal(store.docs.size, entries.length);
  });

  it("a dry run writes nothing", async () => {
    const store = new MemoryStore();
    const r = await runSeed({ store, entries, apply: false, now: NOW });
    assert.equal(r.total.created, entries.length);
    assert.equal(store.docs.size, 0);
    assert.equal(store.commits, 0);
  });

  it("is idempotent: a second run changes nothing", async () => {
    const store = new MemoryStore();
    await runSeed({ store, entries, apply: true, now: NOW });
    const before = JSON.stringify([...store.docs.entries()]);
    const again = await runSeed({ store, entries, apply: true, now: "2027-01-01T00:00:00.000Z" });
    assert.equal(again.total.created, 0);
    assert.equal(again.total.updated, 0);
    assert.equal(again.total.skipped, 0);
    assert.equal(again.total.unchanged, entries.length);
    assert.equal(JSON.stringify([...store.docs.entries()]), before, "documents were modified by a no-op run");
  });

  it("preserves an editor's edits and only updates untouched fields when the dataset changes", async () => {
    const store = new MemoryStore();
    await runSeed({ store, entries, apply: true, now: NOW });

    // Editor edits SOLD-001 in Studio: a seed-owned field and an editorial one.
    store.editorSet("property-sold-001", "soldPrice", 255000);
    store.editorSet("property-sold-001", "summary", "Written by the agent");
    store.editorSet("property-sold-001", "publicDisplay", false);

    // The dataset then changes two owned fields of the same record.
    const changed = load();
    const rec = changed.sold_properties.find((p) => p.id === "SOLD-001")!;
    rec.sold_price = 260000; // editor already changed this one → must be kept
    rec.sqft = 1150; // editor did not touch this → must be updated
    const next = buildSeedEntries(changed).entries;

    const r = await runSeed({ store, entries: next, apply: true, now: "2027-01-01T00:00:00.000Z" });
    const doc = store.docs.get("property-sold-001")!;
    assert.equal(doc.soldPrice, 255000, "editor's price edit was overwritten");
    assert.equal(doc.sqft, 1150, "untouched field was not updated from the dataset");
    assert.equal(doc.summary, "Written by the agent");
    assert.equal(doc.publicDisplay, false);
    const action = r.actions.find((a) => a.id === "property-sold-001")!;
    assert.equal(action.kind, "update");
    assert.ok(action.kind === "update" && action.conflicts.includes("soldPrice"));
    assert.equal(r.total.updated, 1);

    // The conflict stays visible on the next run until reconciled…
    const third = await runSeed({ store, entries: next, apply: true, now: "2027-02-01T00:00:00.000Z" });
    const a3 = third.actions.find((a) => a.id === "property-sold-001")!;
    assert.ok((a3.kind === "unchanged" || a3.kind === "update") && a3.conflicts.includes("soldPrice"));
    assert.equal(store.docs.get("property-sold-001")!.soldPrice, 255000);
  });

  it("never rewrites editorial copy that an editor has changed", async () => {
    const store = new MemoryStore();
    await runSeed({ store, entries, apply: true, now: NOW });
    store.editorSet("homePage", "heroSubheading", "Edited by the agent");
    store.editorSet("agentProfile", "tagline", "Edited tagline");
    const r = await runSeed({ store, entries, apply: true, now: NOW });
    assert.equal(r.total.updated, 0);
    assert.equal(store.docs.get("homePage")!.heroSubheading, "Edited by the agent");
    assert.equal(store.docs.get("agentProfile")!.tagline, "Edited tagline");
  });

  it("skips documents created by hand (no seed bookkeeping) and never deletes anything", async () => {
    const store = new MemoryStore();
    store.docs.set("specialty-first-time-homebuyers", { _id: "specialty-first-time-homebuyers", _type: "specialty", name: "Mine" });
    store.docs.set("someone-elses-doc", { _id: "someone-elses-doc", _type: "specialty", name: "Keep me" });
    const r = await runSeed({ store, entries, apply: true, now: NOW });
    assert.equal(store.docs.get("specialty-first-time-homebuyers")!.name, "Mine");
    assert.ok(store.docs.has("someone-elses-doc"));
    assert.equal(r.total.skipped, 1);
  });

  it("isolates a failing document without losing the rest", async () => {
    class FlakyStore extends MemoryStore {
      override async commit(actions: Parameters<MemoryStore["commit"]>[0]) {
        if (actions.some((a) => a.id === "property-sold-003")) throw new Error("boom");
        return super.commit(actions);
      }
    }
    const store = new FlakyStore();
    const r = await runSeed({ store, entries, apply: true, now: NOW });
    assert.deepEqual(r.failures.map((f) => f.id), ["property-sold-003"]);
    assert.equal(store.docs.size, entries.length - 1);
  });

  it("can be restricted to certain document types", async () => {
    const store = new MemoryStore();
    const r = await runSeed({ store, entries, apply: true, now: NOW, only: ["specialty"] });
    assert.equal(r.total.created, 16);
    assert.equal(store.docs.size, 16);
  });
});
