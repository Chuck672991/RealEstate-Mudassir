#!/usr/bin/env node
/**
 * The home page's scroll scenes across a page's LIFE: they must still work after the page has been resized across a
 * breakpoint, after prefers-reduced-motion has been switched on and off, and after the visitor has left the page and come
 * back — in particular after the page has sat idle first, which is when GSAP's ticker has gone to sleep.
 *
 *   node scripts/verify/lifecycle.mjs http://localhost:3000
 *
 * It checks the sideways chapter (its rail must really travel: a pinned scene whose animation has stopped still looks right
 * at scroll position 0), the hero scene, that nothing is left switched on when motion is reduced, and that three client
 * navigations away and back leave no console errors and do not grow the DOM. The event-listener count is printed but not
 * judged: it rises by ≈ 9 per navigation in the original code as well (see docs/PERFORMANCE.md → open items).
 *
 * Why these sequences: a bug found while writing the performance round only appeared after a resize or a reduced-motion
 * toggle followed closely by leaving the page and coming back — the frame-loop workaround in engine/home.ts then swallowed
 * GSAP's own wake-up request, its ticker stopped, and every scrubbed animation stood still until a reload. A pinned scene
 * whose animation has stopped looks right at scroll position 0, so the rail's position at mid-chapter is what is checked.
 */
import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const IDLE_MS = 5000;
let failures = 0;
const check = (ok, what, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
};
const identity = (t) => t === "none" || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t);

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });

async function open() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1"); // skip the arrival: it is not what is being tested
    } catch {}
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(`${base}/`, { waitUntil: "load" });
  await sleep(1500);
  // the scenes are set up after the page's scripts have loaded; allow a slow start, but not forever
  await page.waitForFunction(() => document.querySelector("[data-hscroll-area]")?.style.height, null, { timeout: 15000 }).catch(() => {});
  const rail = async () =>
    page.evaluate(async () => {
      const area = document.querySelector("[data-hscroll-area]");
      scrollTo(0, area.getBoundingClientRect().top + scrollY + 0.5 * (area.offsetHeight - innerHeight));
      await new Promise((r) => setTimeout(r, 2000));
      return {
        transform: getComputedStyle(document.querySelector("[data-hscroll-track]")).transform,
        height: area.style.height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
  const hero = () =>
    page.evaluate(() => {
      const bg = document.querySelector("[data-hero-bg]");
      return { transform: getComputedStyle(bg).transform, willChange: bg.style.willChange };
    });
  const away = async () => {
    await page.evaluate(() => scrollTo(0, 0));
    await sleep(300);
    await page.evaluate(() => document.querySelector('a[href="/properties"]').click());
    await page.waitForURL("**/properties", { timeout: 15000 });
    await sleep(1000);
    await page.goBack();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15000 });
    await sleep(1500);
  };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  const counts = async () => {
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    const m = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((x) => [x.name, x.value]));
    return { nodes: m.Nodes, listeners: m.JSEventListeners };
  };
  return { context, page, errors, rail, hero, away, counts };
}
const travels = (r) => r.height !== "" && !identity(r.transform);

// ── 1. resized across the 992 px breakpoint and back ─────────────────────────────────────────────────────────────
{
  const s = await open();
  check(travels(await s.rail()), "desktop: the sideways chapter is pinned and its rail travels");
  await s.page.setViewportSize({ width: 800, height: 900 });
  await sleep(2000);
  const narrow = await s.rail();
  check(narrow.height === "" && identity(narrow.transform), "below 992 px: its script state is reverted (no inline height, rail transform cleared)");
  check(narrow.overflow <= 0, "…and the page has no horizontal overflow", `${narrow.overflow}px`);
  await s.page.setViewportSize({ width: 1440, height: 900 });
  await sleep(2000);
  check(travels(await s.rail()), "back at desktop width: the chapter is recreated and the rail travels again");
  check(s.errors.length === 0, "no console errors or warnings", s.errors.join(" | "));
  await s.context.close();
}

// ── 2. prefers-reduced-motion switched on and off while the page is open ─────────────────────────────────────────
{
  const s = await open();
  await s.page.evaluate(() => scrollTo(0, 500));
  await sleep(1500);
  let h = await s.hero();
  check(!identity(h.transform), "motion allowed: the hero scene is live", h.transform);
  await s.page.emulateMedia({ reducedMotion: "reduce" });
  await sleep(1500);
  h = await s.hero();
  check(identity(h.transform) && h.willChange === "", "reduced motion switched on: the scene is reverted and nothing is left promoted", `${h.transform} / will-change "${h.willChange}"`);
  await s.page.emulateMedia({ reducedMotion: "no-preference" });
  await sleep(1500);
  await s.page.evaluate(() => scrollTo(0, 520));
  await sleep(1500);
  h = await s.hero();
  check(!identity(h.transform), "switched off again: the scene is live again", h.transform);
  check(s.errors.length === 0, "no console errors or warnings", s.errors.join(" | "));
  await s.context.close();
}

// ── 3. away and back, three times, with the page idle first ───────────────────────────────────────────────────
{
  const s = await open();
  check(travels(await s.rail()), "first visit: the rail travels");
  await s.page.evaluate(() => scrollTo(0, 0));
  await sleep(IDLE_MS);
  const before = await s.counts();
  for (let i = 1; i <= 3; i++) {
    await s.away();
    const r = await s.rail();
    check(travels(r), `after leaving and coming back (${i}/3, page idle for ${IDLE_MS / 1000} s first): the rail travels`, r.transform);
    await s.page.evaluate(() => scrollTo(0, 0));
    await sleep(IDLE_MS);
  }
  const after = await s.counts();
  console.log(`INFO  after three round trips: DOM nodes ${before.nodes} → ${after.nodes}, event listeners ${before.listeners} → ${after.listeners}`);
  // the first return renders parts of the page that had not been yet; what must not happen is growth on every trip
  await s.away();
  await sleep(IDLE_MS);
  const fourth = await s.counts();
  check(fourth.nodes <= after.nodes * 1.02, "a fourth round trip adds no DOM nodes", `${after.nodes} → ${fourth.nodes}`);
  check(s.errors.length === 0, "no console errors or warnings", s.errors.join(" | "));
  await s.context.close();
}

// ── 4. a breakpoint resize or a reduced-motion toggle, THEN away and back (at once, and after an idle wait) ───────
for (const [name, act, idle] of [
  ...[0, IDLE_MS].flatMap((idle) => [
    ["resize", async (p) => { await p.setViewportSize({ width: 800, height: 900 }); await sleep(1500); await p.setViewportSize({ width: 1440, height: 900 }); await sleep(1500); }, idle],
    ["reduced-motion toggle", async (p) => { await p.emulateMedia({ reducedMotion: "reduce" }); await sleep(1200); await p.emulateMedia({ reducedMotion: "no-preference" }); await sleep(1500); }, idle],
  ]),
]) {
  const s = await open();
  await act(s.page);
  if (idle) await sleep(idle);
  await s.away();
  const r = await s.rail();
  const when = idle ? `idle ${idle / 1000} s` : "straight away";
  check(travels(r), `${name}, then away and back (${when}): the rail travels`, r.transform);
  check(s.errors.length === 0, `${name} (${when}): no console errors or warnings`, s.errors.join(" | "));
  await s.context.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll page-lifecycle checks passed");
process.exit(failures ? 1 : 0);
