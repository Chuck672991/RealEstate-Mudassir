#!/usr/bin/env node
/**
 * Automated accessibility audit with axe-core (WCAG 2.0/2.1/2.2 A + AA + best practice)
 * in a real browser, across pages, viewports and motion preferences.
 *
 *   node scripts/verify/a11y.mjs http://localhost:3000
 *
 * Automated rules catch roughly a third of real problems; this complements, and does
 * not replace, the keyboard / screen-reader pass listed in docs/ACCESSIBILITY.md.
 * Exits non-zero if any violation is found.
 */
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

// Every property page linked from the list is audited, not just the richest one: records with
// thin data (suppressed specs, no facts) render different markup.
const listHtml = await (await fetch(`${base}/properties`)).text();
const propertyPages = [...new Set([...listHtml.matchAll(/href="(\/properties\/[a-z0-9-]+)"/g)].map((m) => m[1]))];
const pages = ["/", "/properties", ...propertyPages, "/contact", "/nope"];
const runs = [
  { label: "desktop · reduced motion", viewport: { width: 1440, height: 900 }, reduced: true },
  { label: "desktop · motion", viewport: { width: 1440, height: 900 }, reduced: false },
  { label: "mobile  · reduced motion", viewport: { width: 390, height: 844 }, reduced: true, touch: true },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let total = 0;
for (const run of runs) {
  const context = await browser.newContext({
    viewport: run.viewport,
    reducedMotion: run.reduced ? "reduce" : "no-preference",
    hasTouch: !!run.touch,
    isMobile: !!run.touch,
  });
  for (const path of pages) {
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("ms-intro", "1");
      } catch {}
    });
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    if (!run.reduced) {
      // walk the page once so scroll-triggered content is in its final state
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 700) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1200);
    }
    await page.addScriptTag({ path: axePath });
    const result = await page.evaluate(async () => {
      const r = await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
        resultTypes: ["violations", "incomplete"],
      });
      const slim = (v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, target: v.nodes[0]?.target?.join(" ") ?? "", html: (v.nodes[0]?.html ?? "").slice(0, 140) });
      return { violations: r.violations.map(slim), incomplete: r.incomplete.map(slim) };
    });
    const v = result.violations;
    total += v.length;
    console.log(`${v.length ? "FAIL" : "PASS"}  ${run.label.padEnd(26)} ${path.padEnd(52)} ${v.length} violation(s), ${result.incomplete.length} need review`);
    for (const x of v) console.log(`        ✖ [${x.impact}] ${x.id} ×${x.nodes} — ${x.help}\n          ${x.target}\n          ${x.html}`);
    if (process.env.SHOW_INCOMPLETE) for (const x of result.incomplete) console.log(`        ? ${x.id} ×${x.nodes} — ${x.help} (${x.target})`);
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(total ? `\n${total} violation(s) found` : "\nNo automated violations found");
process.exit(total ? 1 : 0);
