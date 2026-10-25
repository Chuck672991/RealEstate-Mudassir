#!/usr/bin/env node
/**
 * Captures the first-visit intro at several moments and confirms it ends, releases
 * scroll and leaves the hero visible.
 *   node scripts/verify/intro.mjs http://localhost:3000 <outDir> [--w 1440] [--h 900]
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const [url, outDir] = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
const page = await (await browser.newContext({ viewport: { width: Number(opt("w", 1440)), height: Number(opt("h", 900)) } })).newPage();
page.on("console", (m) => m.type() === "error" && console.log("[console.error]", m.text().slice(0, 200)));
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 200)));

const t0 = Date.now();
await page.goto(url, { waitUntil: "commit" });
const marks = [300, 900, 1500, 2000, 2300, 2600, 2900, 3300, 3800, 4600];
const state = async () =>
  page.evaluate(() => ({
    cls: document.documentElement.className.replace(/\S*variable/g, "").trim(),
    overflow: document.documentElement.style.overflow,
    introDisplay: getComputedStyle(document.querySelector(".intro") ?? document.body).display,
    seen: (() => {
      try {
        return sessionStorage.getItem("ms-intro");
      } catch {
        return "n/a";
      }
    })(),
  }));
for (const ms of marks) {
  const wait = ms - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  const file = `${outDir}/intro-${String(ms).padStart(4, "0")}.png`;
  await page.screenshot({ path: file });
  console.log(`${ms}ms`, JSON.stringify(await state()), file);
}
// scrolling must work afterwards
await page.mouse.wheel(0, 600);
await page.waitForTimeout(900);
console.log("scrollY after wheel:", await page.evaluate(() => Math.round(scrollY)));
// a second visit in the same tab must not replay it
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(300);
console.log("after reload:", JSON.stringify(await state()));
await browser.close();
