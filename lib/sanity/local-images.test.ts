import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import localImages from "@/content/local-images.json";

import { getLocalDocuments } from "./groq-local";

/**
 * content/local-images.json maps pictures the site owner placed in public/photos to image slots.
 * These tests stop a typo (a wrong document id, a missing file, wrong dimensions) from
 * silently leaving a slot empty, and keep the rights wording honest.
 */
const entries = localImages.images;
const docs = new Map(getLocalDocuments().map((d) => [d._id, d as unknown as Record<string, unknown>]));

/** width × height from a JPEG's SOF marker or a PNG header — enough to check the recorded size. */
function dimensions(file: string): [number, number] {
  const buf = readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error("bad jpeg");
    const marker = buf[i + 1]!;
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  throw new Error("no SOF");
}

describe("content/local-images.json", () => {
  it("points every entry at a real file with the recorded size", () => {
    for (const e of entries) {
      const file = path.join(process.cwd(), "public", e.file);
      assert.ok(existsSync(file), `${e.file} is missing`);
      assert.deepEqual(dimensions(file), [e.width, e.height], `${e.file}: recorded size is wrong`);
    }
  });

  it("targets documents and fields that exist, once each", () => {
    const seen = new Set<string>();
    for (const e of entries) {
      const doc = docs.get(e.doc);
      assert.ok(doc, `unknown document ${e.doc}`);
      assert.equal(doc[e.field] !== undefined, true, `${e.doc}.${e.field} was not filled`);
      const key = `${e.doc}.${e.field}`;
      assert.ok(!seen.has(key), `${key} is mapped twice`);
      seen.add(key);
    }
  });

  it("describes every picture, and never claims the rights are cleared", () => {
    for (const e of entries) {
      assert.ok(e.alt.trim().length >= 15, `${e.file}: write real alt text`);
      assert.equal(e.rights, "owner_directed", `${e.file}: rights must stay owner_directed until written permission exists`);
      assert.match(e.source, /^https:\/\/images(cdn)?\.homes\.com\//, `${e.file}: keep the original source for provenance`);
    }
  });

  it("is attached as a reference to an asset document, like a Sanity upload", () => {
    const portrait = docs.get("agentProfile")!.headshot as { asset: { _ref: string }; rightsStatus: string };
    assert.equal(portrait.asset._ref, "local:/photos/portrait.png");
    assert.equal(portrait.rightsStatus, "owner_directed");
    assert.equal((docs.get("local:/photos/portrait.png") as { _type: string })._type, "sanity.imageAsset");
  });
});
