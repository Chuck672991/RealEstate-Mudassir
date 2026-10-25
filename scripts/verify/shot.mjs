#!/usr/bin/env node
/**
 * Screenshot helper for visual checks (uses playwright-core + a locally installed Chrome).
 *
 *   node scripts/verify/shot.mjs <url> <out.png> [--w 1600] [--h 900] [--y 0]
 *        [--frac 0.4]        scroll to a fraction of the page's scrollable height
 *        [--sel "#about"]    scroll the selector's top to the viewport top
 *        [--reduced]         emulate prefers-reduced-motion: reduce
 *        [--intro]           play the first-visit intro (otherwise it is skipped)
 *        [--touch]           emulate a touch phone (hover: none, pointer: coarse)
 *        [--wait 1500]       ms to wait after scrolling
 *        [--full]            full-page screenshot
 *        [--hold]            add .motion-ready (cancels the 5s watchdog) — CSS-only debugging
 *        [--reveal-all]      mark every [data-reveal] as revealed — CSS-only debugging
 *
 * Prints console messages and page errors so hydration problems surface immediately.
 */
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);

const width = Number(opt("w", 1600));
const height = Number(opt("h", 900));
const wait = Number(opt("wait", 1500));

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: Number(opt("dpr", 1)),
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  hasTouch: flag("touch"),
  isMobile: flag("touch"),
});
const page = await context.newPage();
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) console.log(`[console.${m.type()}]`, m.text());
});
page.on("response", (r) => r.status() >= 400 && console.log(`[http ${r.status()}]`, r.url()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("requestfailed", (r) => console.log("[requestfailed]", r.url(), r.failure()?.errorText));

if (!flag("intro")) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1");
    } catch {}
  });
}

await page.goto(url, { waitUntil: "load" });
if (flag("hold")) {
  // keep the pre-paint watchdog from removing .motion-ok (debugging aid for CSS-only states)
  await page.evaluate(() => document.documentElement.classList.add("motion-ready"));
}
if (flag("reveal-all")) {
  await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((n) => n.setAttribute("data-revealed", "")));
}
await page.waitForTimeout(800);

if (opt("sel")) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }, opt("sel"));
} else if (opt("frac")) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(max * f));
  }, Number(opt("frac")));
} else if (opt("y")) {
  await page.evaluate((y) => window.scrollTo(0, y), Number(opt("y")));
}
await page.waitForTimeout(wait);

const info = await page.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  docHeight: document.documentElement.scrollHeight,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  classes: document.documentElement.className,
}));
console.log("[info]", JSON.stringify(info));

await page.screenshot({ path: out, fullPage: flag("full") });
await browser.close();
