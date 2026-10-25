import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { DEFAULT_THEME, resolveTheme, themes } from "./registry";

const root = process.cwd();
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function walk(dir: string, accept: (file: string) => boolean, out: string[] = []): string[] {
  for (const name of readdirSync(path.join(root, dir))) {
    const rel = path.join(dir, name);
    const full = path.join(root, rel);
    if (statSync(full).isDirectory()) {
      if (!["node_modules", ".next", "sanity", "scripts", "assets"].includes(name)) walk(rel, accept, out);
    } else if (accept(rel)) out.push(rel);
  }
  return out;
}

describe("theme registry", () => {
  it("falls back to the default theme for an unknown or empty id", () => {
    assert.equal(resolveTheme(undefined).id, DEFAULT_THEME);
    assert.equal(resolveTheme("").id, DEFAULT_THEME);
    assert.equal(resolveTheme("does-not-exist").id, DEFAULT_THEME);
  });

  it("resolves every registered theme by id", () => {
    for (const id of Object.keys(themes)) assert.equal(resolveTheme(id).id, id);
  });

  it("imports every theme's stylesheet from styles/themes/index.css", () => {
    const index = read("styles/themes/index.css");
    for (const id of Object.keys(themes)) assert.ok(index.includes(`./${id}.css`), `${id}.css is not imported`);
  });
});

for (const [id, theme] of Object.entries(themes)) {
  describe(`theme "${id}": TS palette ⇄ CSS`, () => {
    const css = stripComments(read(`styles/themes/${id}.css`));
    const raw = (name: string) => new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1]?.toLowerCase();
    const p = theme.palette;

    it("scopes its CSS to its own id", () => {
      assert.ok(css.includes(`[data-theme="${id}"]`));
      assert.equal(theme.id, id);
    });

    it("keeps every palette value identical to the raw colours in the CSS", () => {
      assert.equal(p.surface.toLowerCase(), raw("--c-paper"));
      assert.equal(p.surfaceRaised.toLowerCase(), raw("--c-plaster"));
      assert.equal(p.surfaceInverse.toLowerCase(), raw("--c-deep"));
      assert.equal(p.surfaceDeep.toLowerCase(), raw("--c-night"));
      assert.equal(p.ink.toLowerCase(), raw("--c-text"));
      assert.equal(p.accent.toLowerCase(), raw("--c-stone"));
    });
  });
}

describe("theme: no literal colours outside the theme", () => {
  // matches #rgb, #rrggbb, #rrggbbaa and rgb()/rgba()/hsl() literals, but not `url(%23…)` fragments
  const LITERAL = /(?<![\w&%])#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/;

  it("structure and base stylesheets only use semantic tokens", () => {
    const files = [...walk("styles/structure", (f) => f.endsWith(".css")), "styles/base.css", "styles/globals.css"];
    assert.ok(files.length > 10);
    const offenders = files.filter((f) => LITERAL.test(stripComments(read(f))));
    assert.deepEqual(offenders, [], "These files contain literal colours; move them into the theme CSS and reference a token");
  });

  it("React components and routes use the palette or tokens, not hex strings", () => {
    const files = [...walk("components", (f) => f.endsWith(".tsx") || f.endsWith(".ts")), ...walk("app", (f) => /\.(tsx|ts)$/.test(f))];
    assert.ok(files.length > 30);
    const offenders = files.filter((f) => {
      const code = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      return /["'`]#[0-9a-fA-F]{3,8}["'`]/.test(code);
    });
    assert.deepEqual(offenders, []);
  });
});

describe("theme: required tokens", () => {
  const tokens = stripComments(read("styles/tokens.css"));
  const required = [
    "--surface", "--surface-raised", "--surface-inverse", "--ink", "--ink-muted", "--ink-inverse",
    "--line", "--focus", "--ff-display", "--ff-body", "--dur-l", "--ease-out", "--ease-in-out",
    "--doorway-light", "--material-plaster", "--material-leather",
  ];

  for (const id of Object.keys(themes)) {
    it(`"${id}" defines every token a theme must provide`, () => {
      const css = stripComments(read(`styles/themes/${id}.css`));
      for (const t of required) assert.ok(new RegExp(`${t}\\s*:`).test(css), `${t} missing from ${id}.css`);
    });
  }

  it("the token contract has a neutral fallback for each (so a half-finished theme still renders)", () => {
    for (const t of required) assert.ok(new RegExp(`${t}\\s*:`).test(tokens), `${t} has no fallback in tokens.css`);
  });
});
