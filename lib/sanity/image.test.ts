import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

import { matchRemotePattern } from "next/dist/shared/lib/match-remote-pattern";

import type { RawImage } from "./image";

/**
 * The image path has two halves that must agree, and neither can be seen working until a
 * real Sanity project exists:
 *   1. toImage()      — turns a CMS image into a Sanity CDN URL, and refuses uncleared ones;
 *   2. next.config.ts — the explicit allow-list that lets next/image fetch that URL.
 * If they drift, every photo 400s in production. If the list is loosened, third-party hosts
 * (whose photos are NOT cleared for reuse) become fetchable. These tests pin both.
 */
const PROJECT = "testproj";
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = PROJECT;
process.env.NEXT_PUBLIC_SANITY_DATASET = "production";

const ASSET = {
  _id: "image-abc123def456-1600x1067-jpg",
  metadata: { lqip: "data:image/jpeg;base64,AAAA", dimensions: { width: 1600, height: 1067 } },
};
const cleared = (over: Partial<RawImage> = {}): RawImage => ({ alt: "Front of the house", rightsStatus: "owned", asset: ASSET, ...over });

describe("toImage", async () => {
  // env is read when the module loads, so import after setting it
  const { toImage } = await import("./image");

  it("shows nothing without an uploaded file", () => {
    assert.equal(toImage(null), null);
    assert.equal(toImage(undefined), null);
    assert.equal(toImage({ alt: "x", rightsStatus: "owned" }), null);
    assert.equal(toImage({ alt: "x", rightsStatus: "owned", asset: null }), null);
  });

  it("shows nothing unless the usage rights are confirmed", () => {
    for (const rightsStatus of ["pending", "not_cleared", "", undefined, null, "unknown"]) {
      assert.equal(toImage(cleared({ rightsStatus })), null, `rights: ${String(rightsStatus)}`);
    }
    for (const rightsStatus of ["owned", "licensed", "permission"]) {
      assert.ok(toImage(cleared({ rightsStatus })), `rights: ${rightsStatus}`);
    }
  });

  it("needs real dimensions, so the layout can always reserve the space", () => {
    assert.equal(toImage(cleared({ asset: { _id: ASSET._id, metadata: { dimensions: { width: null, height: null } } } })), null);
    assert.equal(toImage(cleared({ asset: { _id: ASSET._id, metadata: null } })), null);
  });

  it("builds a project-scoped Sanity CDN URL that negotiates the format", () => {
    const image = toImage(cleared());
    assert.ok(image);
    const url = new URL(image.src);
    assert.equal(url.origin, "https://cdn.sanity.io");
    assert.equal(url.pathname, `/images/${PROJECT}/production/abc123def456-1600x1067.jpg`);
    assert.equal(url.searchParams.get("auto"), "format");
    assert.equal(url.searchParams.get("fit"), "max");
    assert.equal(url.searchParams.get("w"), "1600");
    assert.deepEqual([image.width, image.height], [1600, 1067]);
    assert.equal(image.blurDataURL, "data:image/jpeg;base64,AAAA");
  });

  it("never asks for more than 2400px, and keeps the aspect ratio", () => {
    const big = toImage(cleared({ asset: { _id: "image-bigbig-4000x3000-jpg", metadata: { dimensions: { width: 4000, height: 3000 } } } }));
    assert.deepEqual([big?.width, big?.height], [2400, 1800]);
    assert.equal(new URL(big!.src).searchParams.get("w"), "2400");
  });

  it("applies the editor's crop to the intrinsic size and the hotspot to object-position", () => {
    const image = toImage(cleared({ crop: { top: 0, bottom: 0.25, left: 0, right: 0 }, hotspot: { x: 0.25, y: 0.5, width: 0.5, height: 0.5 } }));
    assert.deepEqual([image?.width, image?.height], [1600, 800]);
    assert.equal(image?.objectPosition, "25.0% 50.0%");
  });

  it("alt text: the editor's, else the supplied fallback; decorative images are silent", () => {
    assert.equal(toImage(cleared())?.alt, "Front of the house");
    assert.equal(toImage(cleared({ alt: "  " }), "Fallback description")?.alt, "Fallback description");
    assert.equal(toImage(cleared({ decorative: true }), "Fallback description")?.alt, "");
  });

  it("serves an owner-supplied local file from this site, and labels it as not cleared", () => {
    const local = toImage({
      alt: "Portrait",
      rightsStatus: "owner_directed",
      hotspot: { x: 0.6, y: 0.4 },
      asset: { _id: "local:/photos/portrait.jpg", metadata: { dimensions: { width: 630, height: 630 } } },
    });
    assert.equal(local?.src, "/photos/portrait.jpg");
    assert.deepEqual([local?.width, local?.height], [630, 630]);
    assert.equal(local?.objectPosition, "60.0% 40.0%");
    // …but a local file with unconfirmed rights stays hidden, exactly like a Sanity upload
    assert.equal(toImage({ alt: "x", rightsStatus: "pending", asset: { _id: "local:/photos/x.jpg", metadata: { dimensions: { width: 10, height: 10 } } } }), null);
  });

  it("carries caption and credit through for display", () => {
    const image = toImage(cleared({ caption: "Dining room", credit: "Photo: Test Studio" }));
    assert.equal(image?.caption, "Dining room");
    assert.equal(image?.credit, "Photo: Test Studio");
  });
});

describe("next/image allow-list (next.config.ts)", async () => {
  const { toImage } = await import("./image");

  /** next.config.ts evaluated for real, in a clean process, with the given project id. */
  const imagesConfig = (projectId: string) => {
    const code = `const m = await import("./next.config.ts"); const c = m.default?.default ?? m.default; process.stdout.write(JSON.stringify(c.images));`;
    const out = execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", code], {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_PUBLIC_SANITY_PROJECT_ID: projectId },
      encoding: "utf8",
    });
    return JSON.parse(out) as { remotePatterns: Array<Record<string, string>>; qualities: number[]; formats: string[] };
  };
  const allowed = (patterns: Array<Record<string, string>>, url: string) =>
    patterns.some((p) => matchRemotePattern(p as Parameters<typeof matchRemotePattern>[0], new URL(url)));

  it("allows exactly the URLs toImage() produces for this project", () => {
    const { remotePatterns } = imagesConfig(PROJECT);
    const src = toImage(cleared())!.src;
    assert.ok(allowed(remotePatterns, src), `${src} must be fetchable by next/image`);
  });

  it("does not allow another project's images, other hosts, or plain http", () => {
    const { remotePatterns } = imagesConfig(PROJECT);
    assert.equal(allowed(remotePatterns, "https://cdn.sanity.io/images/otherproj/production/x-10x10.jpg"), false);
    assert.equal(allowed(remotePatterns, "http://cdn.sanity.io/images/testproj/production/x-10x10.jpg"), false);
    for (const host of ["www.homes.com", "ap.rdcpix.com", "images.homes.com", "example.com"]) {
      assert.equal(allowed(remotePatterns, `https://${host}/images/testproj/production/x-10x10.jpg`), false, host);
    }
    // the file API and other CDN paths are not images this site uses
    assert.equal(allowed(remotePatterns, "https://cdn.sanity.io/files/testproj/production/x.pdf"), false);
  });

  it("allows no remote images at all while no CMS project is configured", () => {
    assert.deepEqual(imagesConfig("").remotePatterns, []);
  });

  it("serves AVIF then WebP, and permits the quality ImageSlot requests", () => {
    const config = imagesConfig(PROJECT);
    assert.deepEqual(config.formats, ["image/avif", "image/webp"]);
    assert.ok(config.qualities.includes(75), "ImageSlot asks for quality 75; Next 16 rejects any quality not in this list");
  });
});
