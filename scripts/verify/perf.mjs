#!/usr/bin/env node
/**
 * Lab measurements of Core Web Vitals-style metrics in a real browser (production build):
 * LCP, CLS (including while scrolling the whole page), FCP, long tasks, and what was
 * downloaded, per page and viewport.
 *
 *   node scripts/verify/perf.mjs http://localhost:3000
 *
 * Lab numbers on localhost are optimistic (no network latency); they are most useful for
 * layout shift, blocking work and payload size, which do not depend on the network.
 * Budgets: CLS ≤ 0.1, LCP ≤ 2.5s, total long-task time modest, first-load JS ≲ 350 KB gz.
 */
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const pages = ["/", "/properties", "/properties/condo-in-lyons-sold-001", "/contact"];
const viewports = [
  { label: "desktop 1440×900", viewport: { width: 1440, height: 900 } },
  { label: "mobile 390×844 (4× CPU)", viewport: { width: 390, height: 844 }, touch: true, cpu: 4 },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let bad = 0;

for (const vp of viewports) {
  console.log(`\n── ${vp.label} ──`);
  for (const path of pages) {
    const context = await browser.newContext({ viewport: vp.viewport, hasTouch: !!vp.touch, isMobile: !!vp.touch });
    const page = await context.newPage();
    if (vp.cpu) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: vp.cpu });
    }
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("ms-intro", "1"); // measure the page, not the one-time intro
      } catch {}
      window.__m = { cls: 0, lcp: 0, fcp: 0, longTasks: 0, longTaskMs: 0 };
      new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__m.cls += e.value))).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__m.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => e.name === "first-contentful-paint" && (window.__m.fcp = e.startTime))).observe({ type: "paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__m.longTasks += 1; window.__m.longTaskMs += e.duration; })).observe({ type: "longtask", buffered: true });
    });
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    // LCP is final at the first user input, so read it BEFORE the scripted scroll below
    // (a programmatic scroll is not user input and would let later, larger elements win).
    const lcp = await page.evaluate(() => window.__m.lcp);
    // scroll the whole page at a reading pace so layout shifts during scroll are counted
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => {
      const res = performance.getEntriesByType("resource");
      const sum = (f) => res.filter(f).reduce((a, r) => a + (r.encodedBodySize || 0), 0);
      return {
        ...window.__m,
        js: sum((r) => /\.js(\?|$)/.test(r.name)),
        css: sum((r) => /\.css(\?|$)/.test(r.name)),
        font: sum((r) => /\.(woff2?|ttf|otf)(\?|$)/.test(r.name)),
        img: sum((r) => r.initiatorType === "img" || /\.(png|jpe?g|webp|avif|svg)(\?|$)/.test(r.name)),
        requests: res.length,
        html: performance.getEntriesByType("navigation")[0]?.encodedBodySize ?? 0,
      };
    });
    m.lcp = lcp;
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    const flags = [];
    if (m.cls > 0.1) flags.push("CLS>0.1");
    if (m.lcp > 2500) flags.push("LCP>2.5s");
    if (flags.length) bad += 1;
    console.log(
      `${flags.length ? "FAIL" : "PASS"}  ${path.padEnd(38)} LCP ${(m.lcp / 1000).toFixed(2)}s  FCP ${(m.fcp / 1000).toFixed(2)}s  CLS ${m.cls.toFixed(3)}  long tasks ${m.longTasks} (${m.longTaskMs.toFixed(0)}ms)  | html ${kb(m.html)} js ${kb(m.js)} css ${kb(m.css)} font ${kb(m.font)} img ${kb(m.img)} · ${m.requests} req ${flags.join(" ")}`,
    );
    await context.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
