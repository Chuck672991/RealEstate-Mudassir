#!/usr/bin/env node
/**
 * Captures one viewport screenshot per home-page section (plus a mid-point for tall
 * pinned areas) and prints each section's geometry.
 *
 *   node scripts/verify/sections.mjs <url> <outDir> [--w 1600] [--h 900] [--reduced] [--touch]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const url = args[0];
const outDir = args[1];
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
const width = Number(opt("w", 1600));
const height = Number(opt("h", 900));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
const context = await browser.newContext({
  viewport: { width, height },
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  hasTouch: flag("touch"),
  isMobile: flag("touch"),
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
if (flag("hold")) {
  // keep the pre-paint watchdog from removing .motion-ok (debugging aid for CSS-only states)
  await page.evaluate(() => document.documentElement.classList.add("motion-ready"));
}
if (flag("reveal-all")) {
  await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((n) => n.setAttribute("data-revealed", "")));
}
await page.waitForTimeout(1500);

const sections = await page.evaluate(() =>
  [...document.querySelectorAll("[data-section], footer, .legal-strip")].map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      i,
      name: el.getAttribute("data-section") || el.className.split(" ")[0] || el.tagName.toLowerCase(),
      top: Math.round(r.top + window.scrollY),
      height: Math.round(r.height),
    };
  }),
);
console.log(JSON.stringify({ docHeight: await page.evaluate(() => document.documentElement.scrollHeight), sections }, null, 1));

const only = opt("only");
for (const s of sections) {
  if (only && !only.split(",").includes(s.name)) continue;
  // tall areas: top, middle, near the end; short sections: top only
  const stops = s.height > height * 1.6 ? [0, 0.5, 0.95] : [0];
  for (const f of stops) {
    const y = Math.max(0, Math.round(s.top + (s.height - height) * f));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1400);
    const file = `${outDir}/${String(s.i).padStart(2, "0")}-${s.name}-${Math.round(f * 100)}.png`;
    await page.screenshot({ path: file });
    console.log("saved", file, "y=", y);
  }
}
await browser.close();
