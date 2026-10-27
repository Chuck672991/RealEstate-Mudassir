import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { renderToStaticMarkup } from "react-dom/server";

import manifest from "@/content/flower-clips.json";
import { FLOWER_CLIP_NUMBERS, flowerClip } from "@/lib/flower";

import { CLOUD_STRIPS, CloudMarquee } from "./CloudMarquee";
import { Flower } from "./Flower";

/**
 * The decorative artwork (flower clips, clouds). Three things must not drift apart silently: the
 * files the manifest promises (a missing clip is a broken placement), the recorded intrinsic size of
 * each picture (next/image reserves layout space from it, so a wrong size is layout shift), and the
 * accessibility contract (decorative: hidden from assistive technology, no alt text, nothing focusable,
 * no controls, never autoplaying).
 */
const html = renderToStaticMarkup;
const publicFile = (src: string) => path.join(process.cwd(), "public", src);

/** Canvas size of a WebP file (lossy, lossless or extended). */
function webpSize(file: string): [number, number] {
  const b = readFileSync(file);
  assert.equal(b.toString("ascii", 0, 4), "RIFF", `${file} is not a RIFF file`);
  assert.equal(b.toString("ascii", 8, 12), "WEBP", `${file} is not a WebP file`);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === "VP8L") {
    const bits = b.readUInt32LE(21);
    return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
  }
  throw new Error(`unknown WebP chunk ${kind}`);
}

describe("flower clips", () => {
  it("at least the clips the site's placements use are present", () => {
    assert.ok(FLOWER_CLIP_NUMBERS.length >= 1);
    assert.deepEqual([...FLOWER_CLIP_NUMBERS], [...FLOWER_CLIP_NUMBERS].sort((a, b) => a - b));
  });

  for (const n of FLOWER_CLIP_NUMBERS) {
    const clip = flowerClip(n)!;
    it(`clip ${n}: every file the manifest names exists and is the right kind`, () => {
      for (const file of [clip.webm, clip.mov, clip.poster]) assert.ok(existsSync(publicFile(file)), `${file} is missing — run npm run flowers:build`);
      // WebM starts with the EBML magic number; a QuickTime file with an `ftyp`/`wide`/`mdat`/`moov` box
      assert.deepEqual([...readFileSync(publicFile(clip.webm)).subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3], `${clip.webm} is not a WebM`);
      assert.match(readFileSync(publicFile(clip.mov)).subarray(4, 8).toString("ascii"), /^(ftyp|wide|mdat|moov|free)$/, `${clip.mov} is not a QuickTime/MP4 file`);
    });
    it(`clip ${n}: the poster is the clip's size, so the box does not jump when the video loads`, () => {
      assert.deepEqual([clip.width, clip.height], webpSize(publicFile(clip.poster)));
    });
    it(`clip ${n}: its file names carry a hash of their content (so a year-long immutable cache can never go stale)`, () => {
      for (const file of [clip.webm, clip.mov, clip.poster]) {
        const [, hash] = /\.([0-9a-f]{10})\.(webm|mov|webp)$/.exec(file) ?? [];
        assert.ok(hash, `${file} has no content hash in its name`);
        const actual = createHash("sha256").update(readFileSync(publicFile(file))).digest("hex").slice(0, 10);
        assert.equal(actual, hash, `${file}: the name's hash is not the file's hash (was the file replaced without re-running flowers:build?)`);
      }
    });
    it(`clip ${n}: the crop box lies inside its square frame and is what the file's size says`, () => {
      assert.ok(clip.frame > 0 && clip.box.w > 0 && clip.box.h > 0);
      assert.ok(clip.box.x >= 0 && clip.box.y >= 0 && clip.box.x + clip.box.w <= clip.frame && clip.box.y + clip.box.h <= clip.frame, "inside the frame");
      assert.deepEqual([clip.width, clip.height], [clip.box.w, clip.box.h]);
      assert.ok(clip.box.w % 8 === 0 && clip.box.h % 8 === 0, "encoders want tidy sizes");
    });
    it(`clip ${n}: weighs what a decorative loop should (each file under 4 MB)`, () => {
      const entry = manifest.clips.find((c) => c.n === n)!;
      for (const [kind, bytes] of Object.entries(entry.bytes)) assert.ok(bytes < 4 * 1024 * 1024, `${kind} is ${(bytes / 1048576).toFixed(1)} MB`);
    });
  }
});

describe("flower component", () => {
  const n = FLOWER_CLIP_NUMBERS[0]!;

  it("a flower is decorative: hidden from assistive technology, no controls, not focusable, never autoplaying", () => {
    const markup = html(<Flower clip={n} placement="areas-intro" />);
    assert.match(markup, /^<div class="flower flower--areas-intro"/);
    assert.match(markup, /aria-hidden="true"/);
    assert.match(markup, /<video\b/);
    for (const attr of ["muted", "loop", "playsinline", 'preload="none"', "disablepictureinpicture", 'tabindex="-1"']) assert.ok(markup.toLowerCase().includes(attr), `missing ${attr}`);
    assert.doesNotMatch(markup, /controls|autoplay|<a |<button/i);
  });

  it("the cropped video sits inside a full-size square frame, so every placement in the CSS is unchanged", () => {
    const clip = flowerClip(n)!;
    const markup = html(<Flower clip={n} placement="x" />);
    assert.match(markup, /<div class="flower__frame">/);
    const pct = (px: number) => `${((px / clip.frame) * 100).toFixed(3)}%`;
    assert.ok(markup.includes(`left:${pct(clip.box.x)}`) && markup.includes(`top:${pct(clip.box.y)}`));
    assert.ok(markup.includes(`width:${pct(clip.box.w)}`) && markup.includes(`height:${pct(clip.box.h)}`));
  });

  it("the poster is the picture shown before, and instead of, playback", () => {
    const clip = flowerClip(n)!;
    assert.ok(html(<Flower clip={n} placement="x" />).includes(`poster="${clip.poster}"`));
  });

  it("lists the Safari file first under a type only Safari plays, then the WebM", () => {
    const clip = flowerClip(n)!;
    const markup = html(<Flower clip={n} placement="x" />);
    const mov = markup.indexOf(clip.mov);
    const webm = markup.indexOf(clip.webm);
    assert.ok(mov !== -1 && webm !== -1 && mov < webm, "the .mov source comes before the .webm one");
    assert.match(markup, /type="video\/quicktime; codecs=&quot;hvc1&quot;"/);
    assert.match(markup, /type="video\/webm"/);
  });

  it("a clip that was never supplied renders nothing — never a stand-in picture", () => {
    assert.equal(html(<Flower clip={99} placement="areas-end" />), "");
    assert.equal(flowerClip(99), null);
  });

  it("scroll-motion hooks are only present when asked for", () => {
    assert.doesNotMatch(html(<Flower clip={n} placement="areas-end" />), /data-parallax|data-travel/);
    assert.match(html(<Flower clip={n} placement="market" parallax="fwd" />), /data-parallax="fwd"/);
    assert.match(html(<Flower clip={n} placement="areas-mid" travel="mid" />), /data-travel="mid"/);
  });
});

describe("cloud artwork", () => {
  for (const [layer, strip] of Object.entries(CLOUD_STRIPS)) {
    it(`layer ${layer}: the file exists and its recorded size is its real size`, () => {
      assert.ok(existsSync(publicFile(strip.src)), `${strip.src} is missing`);
      assert.deepEqual([strip.width, strip.height], webpSize(publicFile(strip.src)));
    });
  }

  it("a cloud layer is two identical lists (a seamless loop) and is decorative", () => {
    const markup = html(<CloudMarquee layer="a" />);
    assert.equal((markup.match(/clouds__list/g) ?? []).length, 2);
    assert.equal((markup.match(/<img/g) ?? []).length, 8);
    assert.match(markup, /aria-hidden="true"/);
    assert.doesNotMatch(markup, /alt="[^"]+"/);
  });
});
