#!/usr/bin/env node
/**
 * Turns the supplied bougainvillea clips into web-ready, alpha-keeping files.
 *
 *   npm run flowers:build                  every  public/flowers/bougainvillea-flowers_NN.mov | .webm  (or in assets/flowers/)
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
 * Writes, per clip NN:
 *   public/flowers/clips/NN.webm   VP9 + alpha   (Chrome, Firefox, Edge)
 *   public/flowers/clips/NN.mov    HEVC + alpha  (Safari) — the same footage at a fraction of the size
 *   public/flowers/clips/NN.webp   the first frame with alpha — the poster, and the picture reduced motion shows
 * and content/flower-clips.json, which lib/flower.ts reads.
 *
 * The footage is played at 16 fps (the sway is slow; the supplied 24 fps costs half again as many
 * bytes for no visible gain) and compressed hard: the clips are decorative and load only when
 * their section is near the viewport.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// sharp ships with Next.js (it powers next/image); it writes the WebP poster, which this ffmpeg build cannot
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FPS = 16;
const WEBM_CRF = 54;
const HEVC_QUALITY = 0.4;

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
    const { width, height } = { width: side, height: Math.round((probe.streams[0].height * side) / probe.streams[0].width) };

    // WebM (VP9 + alpha): from the AVFoundation frames, so the alpha is real
    run("ffmpeg", [
      "-v", "error", "-y", "-framerate", String(sourceFps), "-i", path.join(frames, "f%04d.png"),
      "-vf", `fps=${FPS},scale=${width}:${height}:flags=lanczos`, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", String(WEBM_CRF),
      "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-an", path.join(outDir, `${nn}.webm`),
    ]);
    // Safari: HEVC with alpha, from the same frames
    run(helper, ["encode", frames, path.join(outDir, `${nn}.mov`), String(sourceFps), String(FPS), String(HEVC_QUALITY)]);
    // poster: frame 0, transparent
    await sharp(path.join(frames, "f0000.png")).resize(width, height).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(path.join(outDir, `${nn}.webp`));

    const size = (ext) => statSync(path.join(outDir, `${nn}.${ext}`)).size;
    const entry = {
      n: Number(nn),
      width,
      height,
      webm: `/flowers/clips/${nn}.webm`,
      mov: `/flowers/clips/${nn}.mov`,
      poster: `/flowers/clips/${nn}.webp`,
      bytes: { webm: size("webm"), mov: size("mov"), poster: size("webp") },
    };
    clips.set(entry.n, entry);
    console.log(`  ${width}×${height}  webm ${(entry.bytes.webm / 1024).toFixed(0)} KB · mov ${(entry.bytes.mov / 1024).toFixed(0)} KB · poster ${(entry.bytes.poster / 1024).toFixed(0)} KB`);
  }

  const manifest = {
    note: "Written by scripts/assets/flower-clips.mjs — do not edit by hand.",
    fps: FPS,
    clips: [...clips.values()].sort((a, b) => a.n - b.n),
  };
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote ${path.relative(root, manifestPath)} (${manifest.clips.length} clip${manifest.clips.length === 1 ? "" : "s"}).`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
