#!/usr/bin/env node
/**
 * Loads every page (desktop + phone, normal + reduced motion), scrolls it end to end and
 * reports any console error/warning, uncaught exception or failed request — including
 * React hydration mismatches, which only appear in `next dev`.
 *
 *   npm run dev                                   (terminal 1)
 *   node scripts/verify/console.mjs http://localhost:3000
 */
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const pages = ["/", "/properties", "/properties/condo-in-lyons-sold-001", "/contact", "/definitely-not-a-page"];
const contexts = [
  // 880 not 900: a viewport exactly as tall as a photo (900 px) trips next/image's dev-only "width or height modified" heuristic
  { label: "desktop", viewport: { width: 1440, height: 880 } },
  { label: "desktop, reduced motion", viewport: { width: 1440, height: 880 }, reduced: true },
  { label: "phone", viewport: { width: 390, height: 844 }, touch: true },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let problems = 0;
for (const c of contexts) {
  const context = await browser.newContext({
    viewport: c.viewport,
    reducedMotion: c.reduced ? "reduce" : "no-preference",
    hasTouch: !!c.touch,
    isMobile: !!c.touch,
  });
  for (const path of pages) {
    const page = await context.newPage();
    const found = [];
    page.on("console", (m) => {
      // the browser logs the 404 document itself as a failed resource; that is the expected result
      if (path.includes("not-a-page") && /status of 404/.test(m.text())) return;
      if (["error", "warning"].includes(m.type())) found.push(`console.${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 260)}`);
    });
    page.on("pageerror", (e) => found.push(`exception: ${e.message.slice(0, 260)}`));
    page.on("response", (r) => {
      if (r.status() >= 400 && !path.includes("not-a-page")) found.push(`http ${r.status()}: ${r.url()}`);
    });
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("ms-intro", "1");
      } catch {}
    });
    await page.goto(base + path, { waitUntil: "load" });
    // a real input finalises Largest Contentful Paint, as it does for a visitor; without it an instant
    // programmatic scroll makes a lazy photo "the LCP" and Next's dev advisory fires for nothing
    await page.waitForTimeout(600);
    await page.keyboard.press("Shift");
    await page.waitForTimeout(1800);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 650) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(600);
    // dev builds report hydration problems through the Next overlay as well
    const overlay = await page.evaluate(() => !!document.querySelector("nextjs-portal")?.shadowRoot?.querySelector("[data-nextjs-dialog]"));
    if (overlay) found.push("Next.js error overlay is open");
    problems += found.length;
    console.log(`${found.length ? "FAIL" : "PASS"}  ${c.label.padEnd(24)} ${path.padEnd(38)} ${found.length ? "\n        " + found.join("\n        ") : ""}`);
    await page.close();
  }
  await context.close();
}
await browser.close();
console.log(problems ? `\n${problems} problem(s)` : "\nNo console errors, warnings or failed requests");
process.exit(problems ? 1 : 0);
