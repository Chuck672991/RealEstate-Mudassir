#!/usr/bin/env node
/**
 * The flower videos: they play only where they should, and nothing plays when motion is reduced.
 *
 *   node scripts/verify/flowers.mjs http://localhost:3000
 *
 * With motion allowed: a clip starts only once its section is near the viewport (so it is not
 * fetched earlier), the browser chooses the WebM (Chrome and Firefox) and never requests the
 * Safari .mov, the clip's time advances while it is in view, and it is paused again once you
 * scroll away. With `prefers-reduced-motion`: no video file is requested at all — only the
 * transparent posters — and no clip is playing. Chrome only; Safari's HEVC-alpha path is not
 * exercised (docs/VERIFICATION.md).
 */
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
let failures = 0;
const check = (ok, what, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function session({ reduced, lite = false }) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1"); // skip the arrival: it is not what is being tested
    } catch {}
  });
  if (lite) await context.addInitScript(() => sessionStorage.setItem("ms-perf", "lite")); // the tier a Save-Data / slow-connection visitor starts in
  const page = await context.newPage();
  const requested = [];
  const errors = [];
  page.on("request", (r) => /\/flowers\/clips\//.test(r.url()) && requested.push(new URL(r.url()).pathname));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.keyboard.press("Shift");

  const clips = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".flower video")].map((v) => ({
        placement: [...v.closest(".flower").classList].find((c) => c.startsWith("flower--"))?.slice(8), // the video sits in a .flower__frame inside .flower
        paused: v.paused,
        t: v.currentTime,
        src: v.currentSrc.split("/").pop() || "",
      })),
    );
  const scrollTo = async (selector, offset = 0) => {
    const y = await page.evaluate(([s, o]) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY - o * innerHeight), [selector, offset]);
    const from = await page.evaluate(() => scrollY);
    for (let i = 1; i <= 6; i++) {
      await page.evaluate((v) => scrollTo(0, v), Math.round(from + ((y - from) * i) / 6));
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1600);
  };
  return { page, context, requested, errors, clips, scrollTo };
}

// ── motion allowed ────────────────────────────────────────────────────────────
{
  const s = await session({ reduced: false });
  const at = (list, placement) => list.find((c) => c.placement === placement);

  const top = await s.clips();
  check(top.length > 0, "the page has flower clips", `${top.length}`);
  check(top.every((c) => c.paused && c.t === 0), "at the top of the page nothing has started");
  check(!s.requested.some((u) => /\.(webm|mov)$/.test(u)), "…and no video file has been requested yet");

  await s.scrollTo("[data-hscroll-area]");
  const a1 = await s.clips();
  const intro = at(a1, "areas-intro");
  check(!!intro && !intro.paused, "Areas chapter: the first flower is playing", intro?.src);
  check(/\.webm$/.test(intro?.src ?? ""), "…from the WebM (Chrome takes the WebM, not the Safari .mov)");
  await s.page.waitForTimeout(1100);
  const intro2 = at(await s.clips(), "areas-intro");
  check(!!intro && !!intro2 && intro2.t > intro.t, "…and its time advances", `${intro?.t.toFixed(2)} → ${intro2?.t.toFixed(2)} s`);

  await s.scrollTo("[data-pin-area=cta]");
  const c1 = await s.clips();
  for (const p of ["windows-left", "windows-right"]) {
    const clip = at(c1, p);
    check(!!clip && !clip.paused, `closing scene: ${p} is playing`, clip?.src);
  }
  check(at(c1, "areas-intro")?.paused === true, "…and the Areas flower, far above, has paused");
  check(!s.requested.some((u) => /\.mov$/.test(u)), "the Safari .mov was never requested by Chrome");
  check(s.errors.length === 0, "no console errors", s.errors.join(" | "));
  await s.context.close();
}

// ── lite tier (engine/tier.ts): a session that STARTS lite fetches and plays no clip ─────────────────────────
{
  const s = await session({ reduced: false, lite: true });
  check(await s.page.evaluate(() => document.documentElement.dataset.perf === "lite"), "lite tier: the page starts in the lite tier");
  await s.scrollTo("[data-hscroll-area]");
  await s.scrollTo("[data-pin-area=cta]");
  const list = await s.clips();
  check(list.length > 0 && list.every((c) => c.paused && c.t === 0), "lite tier: no clip plays, even in the Areas chapter and the closing scene", `${list.length} clips`);
  check(!s.requested.some((u) => /\.(webm|mov)$/.test(u)), "lite tier: no video file is downloaded", s.requested.filter((u) => /\.(webm|mov)$/.test(u)).join(", "));
  check(s.requested.some((u) => u.endsWith(".webp")), "lite tier: the transparent posters are shown instead");
  check(s.errors.length === 0, "lite tier: no console errors", s.errors.join(" | "));
  await s.context.close();
}

// ── reduced motion ─────────────────────────────────────────────────────────────
{
  const s = await session({ reduced: true });
  await s.scrollTo("[data-hscroll-area]");
  await s.scrollTo("#experience");
  await s.scrollTo("#contact");
  const list = await s.clips();
  check(list.every((c) => c.paused && c.t === 0), "reduced motion: no clip is playing", `${list.length} clips`);
  check(!s.requested.some((u) => /\.(webm|mov)$/.test(u)), "reduced motion: no video file is downloaded");
  check(s.requested.some((u) => u.endsWith(".webp")), "reduced motion: the transparent posters are shown instead");
  check(s.errors.length === 0, "reduced motion: no console errors", s.errors.join(" | "));
  await s.context.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll flower-video checks passed");
process.exit(failures ? 1 : 0);
