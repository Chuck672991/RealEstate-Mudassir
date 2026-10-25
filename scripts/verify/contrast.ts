/**
 * WCAG contrast audit for every registered theme.
 *
 *   npm run verify:contrast                    audit all themes, exit 1 on any failure
 *   THEME=slate-linen npm run verify:contrast  audit one theme
 *   npm run verify:contrast -- --json          machine-readable
 *
 * Reads the colour tokens straight from styles/themes/<id>.css (so the audit can
 * never drift from what ships), resolves `var()` references, and checks every
 * foreground/background pairing the site actually uses against WCAG 2.2 AA:
 *   4.5:1 normal text · 3:1 large text (≥ 24px, or ≥ 18.66px bold) and UI/graphics.
 *
 * Text over a photograph is covered by the scrim guarantee (--scrim-strength over a
 * pure-white picture). Pairings that involve gradients (hero type over the lit doorway)
 * cannot be computed from tokens; they are listed as MANUAL at the end so they are not
 * silently skipped.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { themes } from "@/lib/theme/registry";

const themeIds = process.env.THEME ? [process.env.THEME] : Object.keys(themes);

/** `--name: #hex;` and `--name: var(--other);` from a theme stylesheet. */
function loadTokens(themeId: string): Map<string, string> {
  const css = readFileSync(path.join(process.cwd(), "styles/themes", `${themeId}.css`), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens = new Map<string, string>();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens.set(m[1]!, m[2]!.trim());
  return tokens;
}

/** A strength from the token contract ("90%" → 0.9). */
const scrimStrength = (name: "--scrim-strength" | "--scrim-display-strength") => {
  const css = readFileSync(path.join(process.cwd(), "styles/tokens.css"), "utf8");
  const m = new RegExp(`${name}:\\s*([\\d.]+)%`).exec(css);
  if (!m) throw new Error(`${name} is not defined in styles/tokens.css`);
  return Number(m[1]) / 100;
};

function makeResolver(themeId: string) {
  const tokens = loadTokens(themeId);
  const resolve = (name: string, depth = 0): string => {
    // Derived, not declared: the scrim (surface-deep at --scrim-strength) laid over a pure-white photograph.
    if (name === "--scrim-on-white") return blendOverWhite(resolve("--surface-deep"), scrimStrength("--scrim-strength"));
    if (name === "--scrim-display-on-white") return blendOverWhite(resolve("--surface-deep"), scrimStrength("--scrim-display-strength"));
    const raw = tokens.get(name);
    if (!raw) throw new Error(`Token ${name} is not defined in ${themeId}.css`);
    const ref = /^var\((--[\w-]+)\)$/.exec(raw);
    if (ref) return depth > 8 ? raw : resolve(ref[1]!, depth + 1);
    return raw;
  };
  return resolve;
}

const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
const blendOverWhite = (hex: string, alpha: number) => toHex(hexToRgb(hex).map((c) => alpha * c + (1 - alpha) * 255));

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
};
const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (fg: string, bg: string) => {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a! + 0.05) / (b! + 0.05);
};

interface Pair {
  use: string;
  fg: string;
  bg: string;
  min: 3 | 4.5;
}

const TEXT = 4.5;
const LARGE_OR_UI = 3;

const pairs: Pair[] = [
  // body copy on every light surface
  { use: "Body text on page", fg: "--ink", bg: "--surface", min: TEXT },
  { use: "Body text on raised plate", fg: "--ink", bg: "--surface-raised", min: TEXT },
  { use: "Body text on sunken plate", fg: "--ink", bg: "--surface-sunken", min: TEXT },
  { use: "Muted text on page", fg: "--ink-muted", bg: "--surface", min: TEXT },
  { use: "Muted text on raised plate", fg: "--ink-muted", bg: "--surface-raised", min: TEXT },
  { use: "Muted text on sunken plate", fg: "--ink-muted", bg: "--surface-sunken", min: TEXT },
  // dark surfaces
  { use: "Text on dark surface", fg: "--ink-inverse", bg: "--surface-inverse", min: TEXT },
  { use: "Text on deepest surface", fg: "--ink-inverse", bg: "--surface-deep", min: TEXT },
  { use: "Muted text on dark surface", fg: "--ink-inverse-muted", bg: "--surface-inverse", min: TEXT },
  { use: "Muted text on deepest surface", fg: "--ink-inverse-muted", bg: "--surface-deep", min: TEXT },
  // text that sits on a photograph (the .scrim utility): must hold even over a pure-white picture
  { use: "Text on the scrim, over a pure-white photo", fg: "--ink-inverse", bg: "--scrim-on-white", min: TEXT },
  { use: "Muted text on the scrim, over a pure-white photo", fg: "--ink-inverse-muted", bg: "--scrim-on-white", min: TEXT },
  { use: "Display type on the display scrim, over a pure-white photo", fg: "--ink-inverse", bg: "--scrim-display-on-white", min: LARGE_OR_UI },
  // focus indication (WCAG 1.4.11, 2.4.11/13)
  { use: "Focus ring on page", fg: "--focus", bg: "--surface", min: LARGE_OR_UI },
  { use: "Focus ring on raised plate", fg: "--focus", bg: "--surface-raised", min: LARGE_OR_UI },
  { use: "Focus ring on dark surface (inverse ring)", fg: "--focus-inverse", bg: "--surface-inverse", min: LARGE_OR_UI },
  { use: "Focus ring on deepest surface (inverse ring)", fg: "--focus-inverse", bg: "--surface-deep", min: LARGE_OR_UI },
  // status chips (text carries the meaning; colour is reinforcement)
  { use: "Status chip — for sale", fg: "--status-sale-fg", bg: "--status-sale-bg", min: TEXT },
  { use: "Status chip — under contract", fg: "--status-pending-fg", bg: "--status-pending-bg", min: TEXT },
  { use: "Status chip — sold (on page)", fg: "--status-sold-fg", bg: "--surface", min: TEXT },
  // form feedback
  { use: "Error text on page", fg: "--error", bg: "--surface", min: TEXT },
  { use: "Error text on raised plate (dialog)", fg: "--error", bg: "--surface-raised", min: TEXT },
  // large display type and ornament is held to the 3:1 rule
  { use: "Display type on dark surface", fg: "--ink-inverse", bg: "--surface-inverse", min: LARGE_OR_UI },
  { use: "Accent on dark surface — large/decorative only", fg: "--accent", bg: "--surface-inverse", min: LARGE_OR_UI },
];

/** Combinations that must NOT be used for text, recorded so the rule stays visible. */
const forbidden: Pair[] = [
  { use: "Accent on page", fg: "--accent", bg: "--surface", min: TEXT },
  { use: "Accent on raised plate", fg: "--accent", bg: "--surface-raised", min: TEXT },
];

const manual = [
  "Hero headline/accent over the lit doorway (gradient): check at 1600×900 and 390×844 — see docs/ACCESSIBILITY.md",
  "Closing scene copy over the wall material: ink-inverse over a mid-dark mottled surface — check visually",
  "Text placed over a photograph must carry the .scrim backing (sold stage + header band do); prove it on the page with: node scripts/verify/overlay-contrast.mjs <url> --stress white",
];

function audit(themeId: string) {
  const resolve = makeResolver(themeId);
  const rows = pairs.map((p) => {
    const fgHex = resolve(p.fg);
    const bgHex = resolve(p.bg);
    const ratio = contrast(fgHex, bgHex);
    return { ...p, fgHex, bgHex, ratio, ok: ratio >= p.min };
  });
  const forbiddenRows = forbidden.map((p) => {
    const ratio = contrast(resolve(p.fg), resolve(p.bg));
    return { ...p, ratio, fails: ratio < p.min };
  });
  return { themeId, rows, forbiddenRows };
}

const results = themeIds.map(audit);
const failed = results.flatMap((r) => r.rows.filter((row) => !row.ok).map((row) => ({ theme: r.themeId, ...row })));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ results, manual }, null, 2));
} else {
  for (const r of results) {
    console.log(`\nContrast audit — theme "${r.themeId}" (WCAG 2.2 AA)\n`);
    for (const row of r.rows) {
      console.log(
        `${row.ok ? "PASS" : "FAIL"}  ${row.ratio.toFixed(2).padStart(5)}:1  (need ${row.min})  ${row.use.padEnd(50)} ${row.fgHex} on ${row.bgHex}`,
      );
    }
    console.log("\nNOT-for-text combinations (expected to sit below 4.5:1):");
    for (const row of r.forbiddenRows) {
      console.log(
        `${row.fails ? "ok  " : "NOTE"}  ${row.ratio.toFixed(2).padStart(5)}:1  ${row.use}${row.fails ? " — decorative/large only" : " — passes after all; the restriction could be lifted"}`,
      );
    }
  }
  console.log("\nMANUAL checks (cannot be derived from tokens):");
  for (const m of manual) console.log(`  • ${m}`);
}

if (failed.length) {
  console.error(`\n${failed.length} pairing(s) below their WCAG threshold:`);
  for (const f of failed) console.error(`  ✖ [${f.theme}] ${f.use}: ${f.ratio.toFixed(2)}:1 < ${f.min}:1`);
  process.exit(1);
}
