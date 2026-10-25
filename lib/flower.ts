import manifest from "@/content/flower-clips.json";

/**
 * BOUGAINVILLEA CLIPS — the flower sprays are short looped videos with a transparent background,
 * exactly as the reference does it (brief §2): `bougainvillea-flowers_NN.mov` (Apple HEVC with
 * alpha), numbered 01–07, supplied by the site owner in public/flowers/.
 *
 * They are not shipped as supplied (≈ 9 MB each). `npm run flowers:build`
 * (scripts/assets/flower-clips.mjs) turns each into three small files under public/flowers/clips/ —
 *   NN.webm  VP9 + alpha    Chrome, Firefox, Edge
 *   NN.mov   HEVC + alpha   Safari
 *   NN.webp  the first frame, transparent — the poster, and the only thing reduced motion shows —
 * and records them in content/flower-clips.json, which this file reads. Adding a clip is: drop
 * `bougainvillea-flowers_NN.mov` into public/flowers/ (or assets/flowers/), run the script.
 *
 * A placement whose clip has not been supplied renders NOTHING (never a stand-in picture).
 */
export interface FlowerClip {
  n: number;
  width: number;
  height: number;
  webm: string;
  mov: string;
  poster: string;
}

const clips = new Map<number, FlowerClip>((manifest.clips as FlowerClip[]).map((c) => [c.n, c]));

/** The built clip with this number (1–7), or null if it has not been supplied. */
export const flowerClip = (n: number): FlowerClip | null => clips.get(n) ?? null;

export const FLOWER_CLIP_NUMBERS: readonly number[] = [...clips.keys()].sort((a, b) => a - b);
