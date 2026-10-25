#!/usr/bin/env node
/**
 * Screenshots a pinned scroll area at given progress points (0 = pin starts, 1 = pin ends).
 *
 *   node scripts/verify/progress.mjs <url> "<area selector>" <outPrefix> <p1,p2,...> [--w 1600] [--h 900] [--touch]
 *
 * Example: node scripts/verify/progress.mjs http://localhost:3000/ "[data-pin-area='cta']" shots/cta 0,0.3,0.6,1
 */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const [url, selector, prefix, points] = args;
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const width = Number(opt("w", 1600));
const height = Number(opt("h", 900));
mkdirSync(dirname(prefix), { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
const context = await browser.newContext({
  viewport: { width, height },
  hasTouch: args.includes("--touch"),
  isMobile: args.includes("--touch"),
});
const page = await context.newPage();
page.on("console", (m) => ["error", "warning"].includes(m.type()) && console.log(`[console.${m.type()}]`, m.text().slice(0, 300)));
page.on("response", (r) => r.status() >= 400 && console.log(`[http ${r.status()}]`, r.url()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 300)));
await page.addInitScript(() => {
  try {
    sessionStorage.setItem("ms-intro", "1");
  } catch {}
});
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(1800);

for (const p of points.split(",").map(Number)) {
  const y = await page.evaluate(
    ({ selector, p }) => {
      const el = document.querySelector(selector);
      if (!el) return -1;
      const top = el.getBoundingClientRect().top + window.scrollY;
      return Math.round(top + p * (el.offsetHeight - window.innerHeight));
    },
    { selector, p },
  );
  if (y < 0) {
    console.log("selector not found:", selector);
    break;
  }
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(1600);
  const file = `${prefix}-${String(Math.round(p * 100)).padStart(3, "0")}.png`;
  await page.screenshot({ path: file });
  console.log("saved", file, "y=", y);
}
await browser.close();
