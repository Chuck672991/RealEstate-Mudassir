#!/usr/bin/env node
/**
 * Turns the supplied bougainvillea clips into web-ready, alpha-keeping files.
 *
 *   npm run flowers:build                  every  assets/flowers/bougainvillea-flowers_NN.mov | .webm  (or in public/flowers/)
 *   npm run flowers:build -- --only 02     just one
 *
 * The supplied clips are Apple HEVC-with-alpha .mov files (≈ 9 MB each) or VP9-with-alpha .webm
 * files. Safari plays the first; Chrome and Firefox need the second. ffmpeg cannot read the alpha
 * layer of a .mov (it decodes it onto white), so a .mov is decoded with AVFoundation
 * (scripts/assets/alpha-video.swift); a .webm is decoded by libvpx, which does read VP9 alpha.
 * Either way the result is a folder of transparent PNG frames, from which BOTH outputs are encoded
 * — the .webm with ffmpeg, the Safari .mov with AVFoundation (the only HEVC-alpha encoder here).
 * macOS with Xcode command-line tools and ffmpeg is therefore required to RUN this; the files it
 * writes are committed, so building or deploying the site needs neither.
 *
 * Writes, per clip NN (HHHHHHHHHH = the first 10 hex digits of the file's SHA-256):
 *   public/flowers/clips/NN.HHHHHHHHHH.webm   VP9 + alpha   (Chrome, Firefox, Edge)
 *   public/flowers/clips/NN.HHHHHHHHHH.mov    HEVC + alpha  (Safari) — the same footage at a fraction of the size
 *   public/flowers/clips/NN.HHHHHHHHHH.webp   the first frame with alpha — the poster, and the picture reduced motion shows
 * and content/flower-clips.json, which lib/flower.ts reads. Each clip is CROPPED to where the flowers are (the rest of the
 * square is transparent and would only cost decoding); the manifest records the crop so the page can put it back in place.
 *
 * The footage is played at 16 fps (the sway is slow; the supplied 24 fps costs half again as many
 * bytes for no visible gain) and compressed hard: the clips are decorative and load only when
 * their section is near the viewport.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// sharp ships with Next.js (it powers next/image); it writes the WebP poster, which this ffmpeg build cannot
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FPS = 16;
const WEBM_CRF = 54;
const HEVC_QUALITY = 0.4;
/** Alpha above this counts as "there is something here" when finding the crop (0–255). */
const ALPHA_MIN = 8;
/** Extra pixels kept around the flowers, for the sway between the frames that are sampled. */
const CROP_MARGIN = 6;

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const sourceDirs = [path.join(root, "assets/flowers"), path.join(root, "public/flowers")];
const outDir = path.join(root, "public/flowers/clips");

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], ...opts }).toString();
for (const tool of ["swiftc", "ffmpeg", "ffprobe"]) {
  try {
    run("which", [tool]);
  } catch {
    console.error(`flowers:build needs \`${tool}\` (macOS, Xcode command-line tools, \`brew install ffmpeg\`).`);
    process.exit(1);
  }
}

/** bougainvillea-flowers_NN.mov or .webm (a .mov wins over a .webm of the same number; first directory wins). */
const sources = new Map();
for (const dir of sourceDirs) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const m = /^bougainvillea-flowers_(\d{2})\.(mov|webm)$/.exec(file);
    if (!m) continue;
    const have = sources.get(m[1]);
    if (!have || (have.kind === "webm" && m[2] === "mov")) sources.set(m[1], { file: path.join(dir, file), kind: m[2] });
  }
}
const wanted = [...sources.keys()].filter((n) => !only || n === only.padStart(2, "0")).sort();
if (!wanted.length) {
  console.error("No bougainvillea-flowers_NN.mov or .webm found in assets/flowers/ or public/flowers/.");
  process.exit(1);
}

const work = mkdtempSync(path.join(tmpdir(), "flower-clips-"));
try {
  const helper = path.join(work, "alpha-video");
  run("swiftc", ["-O", "-o", helper, path.join(root, "scripts/assets/alpha-video.swift")]);
  mkdirSync(outDir, { recursive: true });

  // keep entries for clips this run does not touch
  const manifestPath = path.join(root, "content/flower-clips.json");
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")).clips : [];
  const clips = new Map(previous.map((c) => [c.n, c]));
  // Written after EVERY clip, so a run that stops half-way (full disk, Ctrl-C) leaves a manifest that matches the files on disk.
  const writeManifest = () => {
    const manifest = {
      note: "Written by scripts/assets/flower-clips.mjs — do not edit by hand.",
      fps: FPS,
      clips: [...clips.values()].sort((a, b) => a.n - b.n),
    };
    mkdirSync(path.dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    return manifest;
  };

  for (const nn of wanted) {
    const { file: src, kind } = sources.get(nn);
    const frames = path.join(work, `frames-${nn}`);
    console.log(`\n▸ clip ${nn}  ${path.relative(root, src)}  (${(statSync(src).size / 1048576).toFixed(1)} MB, ${kind})`);

    const probe = JSON.parse(run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "json", src]));
    const { r_frame_rate: rate } = probe.streams[0];
    const [num, den] = rate.split("/").map(Number);
    const sourceFps = num / (den || 1);
    // transparent PNG frames: AVFoundation for the Apple .mov, libvpx for the .webm
    if (kind === "mov") run(helper, ["frames", src, frames]);
    else {
      mkdirSync(frames, { recursive: true });
      run("ffmpeg", ["-v", "error", "-y", "-c:v", "libvpx-vp9", "-i", src, "-pix_fmt", "rgba", "-start_number", "0", path.join(frames, "f%04d.png")]);
    }
    // never ship more pixels than the largest placement uses (≈ 830 px at 1662 wide, ×1.84 only in the zoom)
    const side = Math.min(720, probe.streams[0].width);

    // The clips are square but the flowers fill only part of the square (a spray hangs from a corner or an edge;
    // 40–60 % of each frame is transparent). Transparent pixels cost nothing to look at but are decoded all the
    // same — VP9-with-alpha is decoded in software on every desktop browser — so each clip is cropped to the
    // union of everything that is not transparent over its whole length, and the page positions the crop
    // inside the original square (components/ui/Flower.tsx), so nothing moves on screen.
    const names = readdirSync(frames).filter((f) => f.endsWith(".png")).sort();
    const scaled = (file) => sharp(path.join(frames, file)).resize(side, side, { kernel: "lanczos3" });
    let [x0, y0, x1, y1] = [side, side, 0, 0];
    for (let i = 0; i < names.length; i += 3) {
      const { data } = await scaled(names[i]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          if (data[(y * side + x) * 4 + 3] > ALPHA_MIN) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
    }
    if (x1 < x0) [x0, y0, x1, y1] = [0, 0, side - 1, side - 1]; // a fully transparent clip: keep the frame
    // a margin for the sway between the sampled frames, then outward to multiples of 8 (encoders want even, tidy sizes)
    x0 = Math.max(0, Math.floor((x0 - CROP_MARGIN) / 8) * 8);
    y0 = Math.max(0, Math.floor((y0 - CROP_MARGIN) / 8) * 8);
    x1 = Math.min(side, Math.ceil((x1 + 1 + CROP_MARGIN) / 8) * 8);
    y1 = Math.min(side, Math.ceil((y1 + 1 + CROP_MARGIN) / 8) * 8);
    const box = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const prepared = path.join(work, `prepared-${nn}`);
    mkdirSync(prepared, { recursive: true });
    for (const name of names) await scaled(name).extract({ left: box.x, top: box.y, width: box.w, height: box.h }).png().toFile(path.join(prepared, name));
    console.log(`  frame ${side}×${side}, flowers occupy ${box.w}×${box.h} at (${box.x}, ${box.y}) — ${Math.round(100 - (box.w * box.h * 100) / (side * side))} % of the pixels cropped away`);

    // WebM (VP9 + alpha), Safari's HEVC + alpha and the poster: all from the same prepared frames
    const tmp = (ext) => path.join(work, `${nn}.${ext}`);
    run("ffmpeg", [
      "-v", "error", "-y", "-framerate", String(sourceFps), "-i", path.join(prepared, "f%04d.png"),
      "-vf", `fps=${FPS}`, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", String(WEBM_CRF),
      "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-an", tmp("webm"),
    ]);
    run(helper, ["encode", prepared, tmp("mov"), String(sourceFps), String(FPS), String(HEVC_QUALITY)]);
    await sharp(path.join(prepared, "f0000.png")).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(tmp("webp"));

    // Content-hashed names: a changed clip is a new URL, so the files can be cached for a year (next.config.ts).
    for (const stale of readdirSync(outDir).filter((f) => f.startsWith(`${nn}.`))) rmSync(path.join(outDir, stale));
    const place = (ext) => {
      const hash = createHash("sha256").update(readFileSync(tmp(ext))).digest("hex").slice(0, 10);
      const name = `${nn}.${hash}.${ext}`;
      copyFileSync(tmp(ext), path.join(outDir, name));
      return { url: `/flowers/clips/${name}`, bytes: statSync(tmp(ext)).size };
    };
    const [webm, mov, poster] = [place("webm"), place("mov"), place("webp")];
    const entry = {
      n: Number(nn),
      frame: side, // the original square, in px; the placements in the CSS were tuned against it
      box, // where the flowers are inside that square
      width: box.w,
      height: box.h,
      webm: webm.url,
      mov: mov.url,
      poster: poster.url,
      bytes: { webm: webm.bytes, mov: mov.bytes, poster: poster.bytes },
    };
    clips.set(entry.n, entry);
    writeManifest();
    console.log(`  ${box.w}×${box.h}  webm ${(entry.bytes.webm / 1024).toFixed(0)} KB · mov ${(entry.bytes.mov / 1024).toFixed(0)} KB · poster ${(entry.bytes.poster / 1024).toFixed(0)} KB`);

    // the decoded and cropped frames are hundreds of MB per clip: free them now, not at the end of the run
    for (const dir of [frames, prepared]) rmSync(dir, { recursive: true, force: true });
    for (const ext of ["webm", "mov", "webp"]) rmSync(tmp(ext), { force: true });
  }

  const manifest = writeManifest();
  console.log(`\nWrote ${path.relative(root, manifestPath)} (${manifest.clips.length} clip${manifest.clips.length === 1 ? "" : "s"}).`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
