#!/usr/bin/env node
/**
 * Turns the owner-supplied photographs into high-resolution lossless PNGs.
 *
 *   npm run photos:hires            convert every photograph that has not been converted yet
 *   npm run photos:hires -- --force convert them all again
 *   npm run photos:hires -- --force --max-edge 2880   …with a smaller cap (smaller files, less sharp at the extremes)
 *
 * Why: the photographs came from a listing site as 650–1600 px JPEGs, and several are shown far larger
 * than that (the closing scene and the aerial under the clouds paint a 1350 px picture across ≈ 5400
 * device pixels), so they looked soft and blocky. This runs each through Apple's on-device
 * super-resolution model (VideoToolbox VTSuperResolutionScaler: 4× the pixels, ML-reconstructed edges
 * and texture; scripts/assets/upscale.swift), caps the result at 3840 px on its long edge (the largest
 * size next/image will ever serve), and writes a lossless PNG next to where the JPEG was.
 *
 * What it can NOT do: recover detail the camera never recorded. The model invents plausible detail
 * (cleaner brick courses, roof edges, foliage); it is subtle and conservative, but it is a
 * reconstruction, not the original — keep that in mind for listing photographs (docs/ASSETS.md).
 *
 * Layout:
 *   assets/owner-supplied/photo-originals/<same path>.jpg   the untouched originals (moved here the first
 *                                                          time; not deployed). The source of truth.
 *   public/photos/<same path>.png                          what the site serves
 *   content/local-images.json                              repointed at the .png files, with their new sizes
 *
 * Requires macOS 26+ on Apple silicon with Xcode command-line tools (the first run downloads Apple's model).
 * The PNGs are committed, so building or deploying the site needs none of this.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp"; // ships with Next.js (it powers next/image)

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const photos = path.join(root, "public/photos");
const originals = path.join(root, "assets/owner-supplied/photo-originals");
const manifestPath = path.join(root, "content/local-images.json");
const force = process.argv.includes("--force");
// `--max-edge 2880` for smaller files (the default is the largest size next/image will ever serve)
const MAX_EDGE = process.argv.includes("--max-edge") ? Number(process.argv[process.argv.indexOf("--max-edge") + 1]) : 3840;

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    : [];
const isJpeg = (f) => /\.jpe?g$/i.test(f);

// 1. the first time, move the JPEGs out of public/ — they become the untouched masters
for (const file of walk(photos).filter(isJpeg)) {
  const rel = path.relative(photos, file);
  const dest = path.join(originals, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  if (existsSync(dest)) rmSync(file); // already preserved
  else renameSync(file, dest);
}
const masters = walk(originals).filter(isJpeg).sort();
if (!masters.length) {
  console.error("No photographs found in public/photos or assets/owner-supplied/photo-originals.");
  process.exit(1);
}

const work = mkdtempSync(path.join(tmpdir(), "photos-hires-"));
try {
  const tool = path.join(work, "upscale");
  execFileSync("swiftc", ["-O", "-o", tool, path.join(root, "scripts/assets/upscale.swift")], { stdio: ["ignore", "ignore", "ignore"] });

  const sizes = new Map(); // "/photos/x.png" → [w, h]
  let converted = 0;
  for (const master of masters) {
    const rel = path.relative(originals, master).replace(/\.jpe?g$/i, "");
    const out = path.join(photos, `${rel}.png`);
    const publicPath = `/photos/${rel.split(path.sep).join("/")}.png`;
    if (!force && existsSync(out) && statSync(out).mtimeMs >= statSync(master).mtimeMs) {
      const m = await sharp(out).metadata();
      sizes.set(publicPath, [m.width, m.height]);
      continue;
    }
    const big = path.join(work, "x4.png");
    const t0 = Date.now();
    const log = execFileSync(tool, [master, big], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
    const meta = await sharp(big).metadata();
    let pipeline = sharp(big);
    if (Math.max(meta.width, meta.height) > MAX_EDGE) pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", kernel: "lanczos3" });
    mkdirSync(path.dirname(out), { recursive: true });
    const info = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(out);
    rmSync(big, { force: true });
    sizes.set(publicPath, [info.width, info.height]);
    converted++;
    console.log(`${rel.padEnd(28)} ${log.padEnd(18)} → ${info.width}×${info.height} PNG  ${(info.size / 1048576).toFixed(1)} MB  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  }

  // 2. repoint the content map at the PNGs, with their real sizes
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  let repointed = 0;
  for (const entry of manifest.images) {
    const png = entry.file.replace(/\.jpe?g$/i, ".png");
    const size = sizes.get(png);
    if (!size) continue;
    if (entry.file !== png || entry.width !== size[0] || entry.height !== size[1]) repointed++;
    entry.file = png;
    [entry.width, entry.height] = size;
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n${converted} converted, ${masters.length - converted} already up to date; ${repointed} entries repointed in content/local-images.json.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
