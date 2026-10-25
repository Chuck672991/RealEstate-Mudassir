import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { buildAssetManifest, validateImportMap } from "./assets";
import { buildSeedEntries } from "./mapper";
import type { SeedFile } from "./types";

const seed = JSON.parse(readFileSync(path.join(process.cwd(), "content_seed.json"), "utf8")) as SeedFile;
const manifest = buildAssetManifest(buildSeedEntries(seed).entries, seed.meta.observed_on);

describe("asset manifest", () => {
  it("lists a slot for every picture the dataset refers to", () => {
    const withPhoto = [...seed.sold_properties, ...seed.active_listings].filter((p) => p.photo_url).length;
    assert.equal(manifest.summary.byKind.listing_photo, withPhoto);
    assert.equal(manifest.summary.byKind.portrait, 1);
    assert.equal(manifest.summary.byKind.brokerage_logo, 1);
    assert.equal(manifest.summary.byKind.neighborhood_photo, seed.media_assets.filter((m) => m.type === "neighborhood").length);
    assert.equal(manifest.summary.total, manifest.assets.length);
  });

  it("records that nothing was downloaded and nothing is cleared", () => {
    assert.equal(manifest.summary.downloaded, 0);
    assert.ok(manifest.assets.every((a) => a.decision === "not_downloaded"));
    assert.ok(manifest.assets.every((a) => !["owned", "licensed", "permission"].includes(a.rightsStatus)));
  });

  it("never puts a street address in a human-readable subject", () => {
    const streets = [...seed.sold_properties, ...seed.active_listings]
      .map((p) => p.address)
      .filter((a): a is string => !!a)
      .map((a) => a.replace(/\s+(Unit|#).*$/i, ""));
    for (const asset of manifest.assets) {
      for (const street of streets) assert.ok(!asset.subject.includes(street), `${asset.id}: "${asset.subject}" leaks "${street}"`);
    }
  });

  it("says what is needed to clear each slot, and is deterministic", () => {
    assert.ok(manifest.assets.every((a) => a.toClear.length > 20 && a.reason.length > 20));
    const again = buildAssetManifest(buildSeedEntries(seed).entries, seed.meta.observed_on);
    assert.deepEqual(again, manifest);
  });
});

describe("image import map validation", () => {
  const good = { doc: "agentProfile", field: "headshot", file: "portrait.jpg", rights: "owned", alt: "The agent outdoors" };

  it("accepts a complete entry", () => {
    const r = validateImportMap([good]);
    assert.deepEqual(r.errors, []);
    assert.equal(r.items.length, 1);
  });

  it("requires rights to be stated and to allow publication", () => {
    assert.match(validateImportMap([{ ...good, rights: undefined }]).errors[0]!, /rights/);
    assert.match(validateImportMap([{ ...good, rights: "pending" }]).errors[0]!, /rights/);
    assert.match(validateImportMap([{ ...good, rights: "not_cleared" }]).errors[0]!, /rights/);
  });

  it("requires alt text unless the image is decorative", () => {
    assert.match(validateImportMap([{ ...good, alt: "" }]).errors[0]!, /alt/);
    assert.deepEqual(validateImportMap([{ ...good, alt: "", decorative: true }]).errors, []);
  });

  it("only attaches a field to the document type it belongs to", () => {
    assert.match(validateImportMap([{ ...good, doc: "property-sold-001" }]).errors[0]!, /belongs to document/);
    assert.deepEqual(validateImportMap([{ ...good, doc: "property-sold-001", field: "heroImage" }]).errors, []);
    assert.deepEqual(validateImportMap([{ ...good, doc: "serviceArea-hanover-park", field: "image" }]).errors, []);
  });

  it("only accepts raster image files", () => {
    assert.match(validateImportMap([{ ...good, file: "notes.pdf" }]).errors[0]!, /file type/);
    assert.match(validateImportMap([{ ...good, file: "https://example.com/x.jpg.html" }]).errors[0]!, /file type/);
  });

  it("rejects anything that is not an array of objects", () => {
    assert.equal(validateImportMap({}).errors.length, 1);
    assert.equal(validateImportMap([1]).errors.length, 1);
  });
});
