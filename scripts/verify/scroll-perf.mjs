#!/usr/bin/env node
/**
 * SCROLL-PERFORMANCE BENCHMARK of a RUNNING site (use a production build: `npm run build && npm start`).
 *
 *   node scripts/verify/scroll-perf.mjs http://localhost:3000 --label before --cpu 4 --out /tmp/before-4x.json
 *
 * Drives Chrome through the Chrome DevTools Protocol with REAL wheel input (so Lenis's smoothing runs
 * exactly as for a visitor), scrolls the whole home page down at a steady speed, fast back up, and
 * round-trips it three times for memory. For each run it reports:
 *
 *   • frames: main-thread frame interval (requestAnimationFrame) p50 / p95 / p99 / worst, the share of
 *     frames over 20 / 33 / 50 ms, per page section — "jank" is a frame that arrives late
 *   • long tasks (> 50 ms) and Total-Blocking-Time-style blocking, load-time LCP / CLS / FCP, INP (events
 *     measured while scrolling), layout and style-recalculation counts and time, script time, JS heap and
 *     DOM growth across the round trips, network transfer by type
 *   • with --profile: the hottest functions by self time (V8 sampling profiler) during the scroll
 *   • with --trace: main-thread time by DevTools timeline event (Layout, Paint, EvaluateScript …) and the
 *     raster / compositor / GPU threads' busy time
 *
 * --cpu N slows the renderer's CPU N× (CDP Emulation.setCPUThrottlingRate). That is a SIMULATION of a
 * slower machine: it scales JavaScript, style, layout and paint on the main thread, but NOT the GPU,
 * memory bandwidth or video decoding, so a real low-end laptop can still be worse. Headless Chrome is
 * used; frame timing here is main-thread frame production, not what reaches the screen.
 *
 *   --w 1440 --h 900 --dpr 1     viewport (default 1440×900 at 1×)      --mobile   phone profile (390×844, touch)
 *   --speed 1500                 scroll speed in px/s (default 1500)    --reduced  prefers-reduced-motion
 *   --intro                      FIRST VISIT: play the arrival animation, and report its frame times and LCP/FCP
 *                                (default: the arrival is skipped, as for a returning visitor in the same tab)
 *   --idle                       also report the cost of doing nothing: 6 s on the page without scrolling
 *   --perf lite|full             force the tier (the site's `?perf=` switch). Default `full`: the benchmark must measure ONE
 *                                tier, and the automatic downgrade would otherwise change it half-way through a run.
 *                                `--perf auto` leaves the site to decide for itself.
 *   --css "<css>"                ABLATION: inject this CSS (e.g. ".clouds{display:none}") to measure what a feature costs
 *   --init "<js>"                ABLATION: run this script before the page's own (e.g. to stub an API)
 *   --range 0.2-0.5              scroll only this part of the page (fractions of its length): to study one section
 *   --nomem                      skip the three memory round trips at the end (much faster; no heap/DOM growth numbers)
 *   --noscroll                   only load (+ intro, + idle): skip the scrolling phases (about 30 s instead of 5 min)
 *   --label NAME --out FILE      label and JSON output path
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const base = (argv.find((a) => /^https?:/.test(a)) ?? "http://localhost:3000").replace(/\/$/, "");
const cpu = Number(opt("cpu", 1));
const mobile = flag("mobile");
const viewport = mobile ? { width: 390, height: 844 } : { width: Number(opt("w", 1440)), height: Number(opt("h", 900)) };
const dpr = Number(opt("dpr", mobile ? 3 : 1));
const speed = Number(opt("speed", 1500));
const label = opt("label", "run");
const outFile = opt("out", null);
const wantProfile = flag("profile");
const wantTrace = flag("trace");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] : 0);
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: dpr,
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
  hasTouch: mobile,
  isMobile: mobile,
});
if (!flag("intro")) {
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("ms-intro", "1");
    } catch {}
  });
}
// ablations: measure what a feature costs by taking it away
if (opt("css", null)) {
  const css = opt("css", "");
  await context.addInitScript((c) => {
    const add = () => {
      const s = document.createElement("style");
      s.textContent = c;
      document.head.appendChild(s);
    };
    if (document.head) add();
    else document.addEventListener("DOMContentLoaded", add);
  }, css);
}
if (opt("init", null)) await context.addInitScript(opt("init", ""));
// observers and the frame recorder, installed before any page script runs
await context.addInitScript(() => {
  const describe = (n) => (n && n.nodeType === 1 ? n.tagName.toLowerCase() + (n.id ? "#" + n.id : "") + (n.className && n.className.toString ? "." + n.className.toString().trim().split(/\s+/).slice(0, 2).join(".") : "") : "(text)");
  const p = (window.__perf = { shifts: [], longtasks: [], cls: 0, lcp: 0, fcp: 0, inp: [], frames: new Float64Array(60000), ys: new Float32Array(60000), n: 0, on: false, raf: 0 });
  // how many animation frames the PAGE asks for (so a parked page that keeps a frame loop alive shows up)
  const nativeRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => {
    p.raf++;
    return nativeRaf(cb);
  };
  const watch = (type, fn, extra = {}) => {
    try {
      new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type, buffered: true, ...extra });
    } catch {}
  };
  watch("longtask", (e) => p.longtasks.push([e.startTime, e.duration]));
  watch("layout-shift", (e) => {
    if (e.hadRecentInput) return;
    p.cls += e.value;
    const r = (x) => (x ? [Math.round(x.x), Math.round(x.y), Math.round(x.width), Math.round(x.height)] : null);
    p.shifts.push({ value: +e.value.toFixed(3), at: Math.round(e.startTime), sources: (e.sources || []).slice(0, 3).map((s) => ({ node: describe(s.node), from: r(s.previousRect), to: r(s.currentRect) })) });
  });
  watch("largest-contentful-paint", (e) => (p.lcp = e.startTime));
  watch("paint", (e) => e.name === "first-contentful-paint" && (p.fcp = e.startTime));
  watch("event", (e) => e.interactionId && p.inp.push(e.duration), { durationThreshold: 16 });
  let gen = 0;
  const loop = (id) => (t) => {
    if (!p.on || id !== gen) return; // a newer start() owns the recording
    if (p.n < p.frames.length) {
      p.frames[p.n] = t;
      p.ys[p.n] = window.scrollY;
      p.n++;
    }
    requestAnimationFrame(loop(id));
  };
  p.start = () => {
    p.n = 0;
    p.on = true;
    requestAnimationFrame(loop(++gen));
  };
  if (/[?&]__intro=1/.test(location.search)) p.start(); // first visit: record from navigation start
  p.stop = () => {
    p.on = false;
    return { n: p.n, frames: Array.from(p.frames.subarray(0, p.n)), ys: Array.from(p.ys.subarray(0, p.n)) };
  };
});

const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
await cdp.send("Network.enable");
if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

const net = { requests: 0, bytes: 0, byType: {} };
const reqType = new Map();
cdp.on("Network.responseReceived", (e) => reqType.set(e.requestId, e.type));
cdp.on("Network.loadingFinished", (e) => {
  const type = reqType.get(e.requestId) ?? "Other";
  net.requests++;
  net.bytes += e.encodedDataLength;
  net.byType[type] ??= { n: 0, bytes: 0 };
  net.byType[type].n++;
  net.byType[type].bytes += e.encodedDataLength;
});
const consoleProblems = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && consoleProblems.push(`${m.type()}: ${m.text().slice(0, 160)}`));
page.on("pageerror", (e) => consoleProblems.push(`exception: ${e.message.slice(0, 160)}`));

const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));

// ── load ──────────────────────────────────────────────────────────────────────────────────────────
const t0 = Date.now();
const perf = opt("perf", "full");
const query = [flag("intro") ? "__intro=1" : "", perf === "auto" ? "" : `perf=${perf}`].filter(Boolean).join("&");
await page.goto(`${base}/${query ? "?" + query : ""}`, { waitUntil: "load" });
const loadMs = Date.now() - t0;
await sleep(flag("intro") ? 5500 : 3000); // let late LCP candidates, fonts, the arrival and the first reveals settle
let introRec = null;
if (flag("intro")) introRec = await page.evaluate(() => { const r = __perf.stop(); return r; });
const afterLoad = await page.evaluate(() => ({ lcp: __perf.lcp, fcp: __perf.fcp, cls: __perf.cls, longtasks: __perf.longtasks.slice() }));
const sections = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("main > *, .cta-wrap, footer, .site-footer")];
  const seen = new Set();
  return nodes
    .map((n) => {
      const r = n.getBoundingClientRect();
      return { name: n.id || (n.className?.toString().split(" ")[0] ?? n.tagName.toLowerCase()), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) };
    })
    .filter((s) => s.bottom - s.top > 50 && !seen.has(s.name) && seen.add(s.name))
    .sort((a, b) => a.top - b.top);
});
const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const [r0, r1] = opt("range", "0-1").split("-").map(Number);
const fromY = Math.round(r0 * maxY);
const toY = Math.round(r1 * maxY);
console.log(`sections (fraction of the page):  ${sections.map((s) => `${s.name} ${(s.top / maxY).toFixed(2)}–${Math.min(1, s.bottom / maxY).toFixed(2)}`).join(" · ")}`);
const domStart = await page.evaluate(() => document.getElementsByTagName("*").length);

// ── doing nothing (what a parked tab costs) ─────────────────────────────────────────────────────────
let idle = null;
if (flag("idle")) {
  // NOT recorded with the frame recorder: its requestAnimationFrame loop would itself keep the page producing frames
  // (and, in Chrome, make every running transform animation cost a style recalculation per frame), so the number
  // would measure the harness. Only the browser's own counters are read, across a window in which nothing but the page runs.
  await sleep(1500); // let hydration, fonts and the first lazy work settle
  const m0 = await metrics();
  const raf0 = await page.evaluate(() => __perf.raf);
  await sleep(6000);
  const m1 = await metrics();
  const raf1 = await page.evaluate(() => __perf.raf);
  idle = { seconds: 6, pageFrameRequests: raf1 - raf0, taskMs: round((m1.TaskDuration - m0.TaskDuration) * 1000), scriptMs: round((m1.ScriptDuration - m0.ScriptDuration) * 1000), layouts: m1.LayoutCount - m0.LayoutCount, styleRecalcs: m1.RecalcStyleCount - m0.RecalcStyleCount };
}

// ── scrolling with real wheel input ───────────────────────────────────────────────────────────────
await page.mouse.move(viewport.width / 2, viewport.height / 2);
async function wheel(direction, pxPerSec, until) {
  const step = 25;
  const dy = (pxPerSec * step) / 1000;
  const start = Date.now();
  while (Date.now() - start < 120000) {
    const y = await page.evaluate(() => scrollY);
    if (direction > 0 ? y >= until : y <= until) break;
    await page.mouse.wheel(0, direction * dy);
    await sleep(step);
  }
}
async function phase(name, fn) {
  const m0 = await metrics();
  await page.evaluate((n) => { console.timeStamp("ms-phase-start:" + n); __perf.start(); }, name);
  await fn();
  await sleep(1400); // smoothed scrolling and scrubs keep moving after the last wheel event
  const rec = await page.evaluate((n) => { console.timeStamp("ms-phase-end:" + n); return __perf.stop(); }, name);
  const m1 = await metrics();
  return { name, rec, m0, m1 };
}

let profile = null;
if (wantProfile) {
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 400 });
  await cdp.send("Profiler.start");
}
const traceEvents = [];
if (wantTrace) {
  cdp.on("Tracing.dataCollected", (e) => traceEvents.push(...e.value));
  await cdp.send("Tracing.start", { categories: "devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,v8.execute", transferMode: "ReportEvents" });
}

const noScroll = flag("noscroll");
const none = { LayoutCount: 0, RecalcStyleCount: 0, LayoutDuration: 0, RecalcStyleDuration: 0, ScriptDuration: 0, TaskDuration: 0 };
const skipped = (name) => ({ name, rec: { n: 0, frames: [], ys: [] }, m0: none, m1: none });
if (fromY > 0) {
  await page.evaluate((y) => scrollTo(0, y), fromY);
  await sleep(1500);
}
const down = noScroll ? skipped("down") : await phase("down", () => wheel(1, speed, toY - 4));
const up = noScroll ? skipped("up (fast)") : await phase("up (fast)", () => wheel(-1, 3500, fromY + 4));

if (wantProfile) {
  profile = (await cdp.send("Profiler.stop")).profile;
}
if (wantTrace) {
  const done = new Promise((r) => cdp.once("Tracing.tracingComplete", r));
  await cdp.send("Tracing.end");
  await done;
}

// memory: three round trips at speed, measured after a forced GC
await cdp.send("HeapProfiler.enable");
await cdp.send("HeapProfiler.collectGarbage");
const heap0 = (await metrics()).JSHeapUsedSize;
const nodes0 = (await metrics()).Nodes;
const listeners0 = (await metrics()).JSEventListeners;
for (let i = 0; i < (noScroll || flag("nomem") ? 0 : 3); i++) {
  await wheel(1, 4000, toY - 4);
  await wheel(-1, 4000, fromY + 4);
}
await sleep(1500);
await cdp.send("HeapProfiler.collectGarbage");
const mEnd = await metrics();
const domEnd = await page.evaluate(() => document.getElementsByTagName("*").length);

// ── reduce ────────────────────────────────────────────────────────────────────────────────────────
function frameStats(ts, ys) {
  const dts = [];
  const where = [];
  for (let i = 1; i < ts.length; i++) {
    dts.push(ts[i] - ts[i - 1]);
    where.push(ys[i]);
  }
  const sorted = [...dts].sort((a, b) => a - b);
  const over = (ms) => (dts.length ? round((dts.filter((d) => d > ms).length / dts.length) * 100) : 0);
  return {
    frames: dts.length,
    p50: round(pct(sorted, 50)),
    p95: round(pct(sorted, 95)),
    p99: round(pct(sorted, 99)),
    worst: round(sorted[sorted.length - 1] ?? 0),
    over20: over(20),
    over33: over(33),
    over50: over(50),
    _dts: dts,
    _where: where,
  };
}
/** The per-frame sample arrays are for bySection(); the report keeps only the summary numbers. */
function withoutSamples({ _dts, _where, ...summary }) {
  void _dts;
  void _where;
  return summary;
}
function bySection(rec) {
  const all = frameStats(rec.frames, rec.ys);
  const rows = sections.map((s) => {
    const ts = [];
    for (let i = 0; i < all._dts.length; i++) {
      if (all._where[i] >= s.top && all._where[i] < s.bottom) {
        ts.push(all._dts[i]);
      }
    }
    const sorted = [...ts].sort((a, b) => a - b);
    return {
      section: s.name,
      frames: ts.length,
      p95: round(pct(sorted, 95)),
      worst: round(sorted[sorted.length - 1] ?? 0),
      over33: ts.length ? round((ts.filter((d) => d > 33).length / ts.length) * 100) : 0,
    };
  });
  const summary = withoutSamples(all);
  return { summary, sections: rows };
}
const delta = (a, b, key) => b[key] - a[key];
const reduceMetrics = (ph) => ({
  layouts: delta(ph.m0, ph.m1, "LayoutCount"),
  styleRecalcs: delta(ph.m0, ph.m1, "RecalcStyleCount"),
  layoutMs: round(delta(ph.m0, ph.m1, "LayoutDuration") * 1000),
  styleMs: round(delta(ph.m0, ph.m1, "RecalcStyleDuration") * 1000),
  scriptMs: round(delta(ph.m0, ph.m1, "ScriptDuration") * 1000),
  taskMs: round(delta(ph.m0, ph.m1, "TaskDuration") * 1000),
});
const final = await page.evaluate(() => ({ longtasks: __perf.longtasks.slice(), inp: __perf.inp.slice(), cls: __perf.cls, shifts: __perf.shifts.slice() }));
const scrollLongTasks = final.longtasks.filter(([start]) => start > afterLoad.lcp + 2500);
const tbtLoad = afterLoad.longtasks.reduce((s, [, d]) => s + Math.max(0, d - 50), 0);

const result = {
  label,
  config: { base, cpu, viewport, dpr, speed, mobile, reduced: flag("reduced"), pageHeight: maxY + viewport.height },
  load: { loadEventMs: loadMs, fcpMs: round(afterLoad.fcp), lcpMs: round(afterLoad.lcp), cls: round(afterLoad.cls, 3), tbtMs: round(tbtLoad), longTasksDuringLoad: afterLoad.longtasks.length },
  scroll: {
    down: { ...bySection(down.rec), work: reduceMetrics(down) },
    up: { ...bySection(up.rec), work: reduceMetrics(up) },
    longTasks: { count: scrollLongTasks.length, totalMs: round(scrollLongTasks.reduce((s, [, d]) => s + d, 0)), worstMs: round(Math.max(0, ...scrollLongTasks.map(([, d]) => d))) },
    inpMs: final.inp.length ? round([...final.inp].sort((a, b) => a - b)[Math.max(0, Math.ceil(final.inp.length * 0.98) - 1)]) : null,
    clsTotal: round(final.cls, 3),
  },
  layoutShifts: final.shifts.filter((s) => s.value >= 0.005).sort((a, b) => b.value - a.value).slice(0, 8),
  ...(introRec ? { intro: withoutSamples(frameStats(introRec.frames, introRec.ys)) } : {}),
  ...(idle ? { idle } : {}),
  memory: { heapStartMB: round(heap0 / 1048576), heapEndMB: round(mEnd.JSHeapUsedSize / 1048576), domStart, domEnd, nodesStart: nodes0, nodesEnd: mEnd.Nodes, listenersStart: listeners0, listenersEnd: mEnd.JSEventListeners },
  network: { requests: net.requests, totalKB: round(net.bytes / 1024, 0), byType: Object.fromEntries(Object.entries(net.byType).map(([k, v]) => [k, { n: v.n, KB: round(v.bytes / 1024, 0) }])) },
  console: consoleProblems.slice(0, 5),
};

if (profile) {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  for (let i = 0; i < profile.samples.length; i++) self.set(profile.samples[i], (self.get(profile.samples[i]) ?? 0) + (profile.timeDeltas[i + 1] ?? profile.timeDeltas[i] ?? 0));
  const byFn = new Map();
  const byUrl = new Map();
  let total = 0;
  for (const [id, us] of self) {
    const cf = byId.get(id).callFrame;
    const url = (cf.url || "(native)").replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "");
    const key = `${cf.functionName || "(anonymous)"}  ${url.split("/").pop()}:${cf.lineNumber}`;
    byFn.set(key, (byFn.get(key) ?? 0) + us);
    byUrl.set(url, (byUrl.get(url) ?? 0) + us);
    total += us;
  }
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, us]) => ({ item: k, ms: round(us / 1000), pct: round((us / total) * 100) }));
  const idle = byFn.get("(idle)  :-1") ?? 0;
  result.profile = { activeMs: round((total - idle) / 1000), idleMs: round(idle / 1000), topFunctions: top(byFn, 22).filter((r) => !r.item.startsWith("(idle)")).slice(0, 18), topFiles: top(byUrl, 8) };
}

if (wantTrace) {
  const threads = new Map();
  for (const e of traceEvents) if (e.ph === "M" && e.name === "thread_name") threads.set(`${e.pid}:${e.tid}`, e.args.name);
  const busy = new Map();
  const mainEvents = new Map();
  for (const e of traceEvents) {
    if (e.ph !== "X" || !e.dur) continue;
    const thread = threads.get(`${e.pid}:${e.tid}`) ?? "?";
    if (/^(CrRendererMain)$/.test(thread)) mainEvents.set(e.name, (mainEvents.get(e.name) ?? 0) + e.dur);
    if (thread !== "CrRendererMain" && ["RunTask", "ThreadControllerImpl::RunTask"].includes(e.name)) busy.set(thread, (busy.get(thread) ?? 0) + e.dur);
  }
  const interesting = ["FunctionCall", "EvaluateScript", "v8.run", "Layout", "UpdateLayoutTree", "HitTest", "PrePaint", "Paint", "Layerize", "Commit", "UpdateLayer", "ParseHTML", "TimerFire", "FireAnimationFrame", "RunMicrotasks", "MinorGC", "MajorGC", "ImageDecodeTask", "Decode Image", "Animation::Update"];
  // PRESENTED frames: the compositor's DrawFrame events inside each scroll phase. The rAF cadence above is when the MAIN thread
  // produced a frame; with native scrolling the compositor can keep drawing smooth frames while the main thread is busy, so the
  // two answer different questions (what the page's scripts got to do vs how often the picture really changed).
  const marks = new Map();
  for (const e of traceEvents) {
    const m = e.name === "TimeStamp" && /^ms-phase-(start|end):(.+)$/.exec(e.args?.data?.message ?? "");
    if (m) marks.set(`${m[1]}:${m[2]}`, e.ts);
  }
  const draws = [...new Set(traceEvents.filter((e) => e.name === "DrawFrame").map((e) => e.ts))].sort((a, b) => a - b);
  const presented = {};
  for (const name of ["down", "up (fast)"]) {
    const a = marks.get(`start:${name}`), b = marks.get(`end:${name}`);
    if (a == null || b == null) continue;
    const ts = draws.filter((t) => t >= a && t <= b);
    const gaps = ts.slice(1).map((t, i) => (t - ts[i]) / 1000).sort((x, y) => x - y);
    presented[name] = {
      seconds: round((b - a) / 1e6),
      drawn: ts.length,
      perSecond: round(ts.length / ((b - a) / 1e6)),
      gapP50: round(pct(gaps, 50)),
      gapP95: round(pct(gaps, 95)),
      gapWorst: round(gaps[gaps.length - 1] ?? 0),
      over33Pct: gaps.length ? round((gaps.filter((g) => g > 33).length / gaps.length) * 100) : 0,
    };
  }
  result.trace = {
    presentedFrames: presented,
    mainThreadMs: Object.fromEntries(interesting.filter((n) => mainEvents.has(n)).map((n) => [n, round(mainEvents.get(n) / 1000)])),
    otherThreadsBusyMs: Object.fromEntries([...busy].map(([k, v]) => [k, round(v / 1000)]).sort((a, b) => b[1] - a[1]).slice(0, 10)),
    note: "durations of 'X' events summed per name; nested events overlap (FunctionCall sits inside FireAnimationFrame), so do not add them up",
  };
}

// ── report ────────────────────────────────────────────────────────────────────────────────────────
const sectionTable = (rows) => rows.filter((r) => r.frames > 0).map((r) => `    ${r.section.padEnd(18)} frames ${String(r.frames).padStart(5)}  p95 ${String(r.p95).padStart(5)} ms  worst ${String(r.worst).padStart(6)} ms  >33ms ${String(r.over33).padStart(5)} %`);
console.log(`\n=== ${label}  ·  ${viewport.width}×${viewport.height} @${dpr}×  ·  CPU ${cpu}×  ·  ${speed} px/s  ·  page ${result.config.pageHeight} px`);
console.log(`load   LCP ${result.load.lcpMs} ms · FCP ${result.load.fcpMs} ms · CLS ${result.load.cls} · TBT ${result.load.tbtMs} ms · load event ${loadMs} ms`);
for (const [name, ph] of [["down", result.scroll.down], ["up (fast)", result.scroll.up]]) {
  const s = ph.summary;
  console.log(`${name.padEnd(10)} frames ${s.frames} · p50 ${s.p50} · p95 ${s.p95} · p99 ${s.p99} · worst ${s.worst} ms · >20ms ${s.over20}% · >33ms ${s.over33}% · >50ms ${s.over50}%`);
  console.log(`           layouts ${ph.work.layouts} (${ph.work.layoutMs} ms) · style recalcs ${ph.work.styleRecalcs} (${ph.work.styleMs} ms) · script ${ph.work.scriptMs} ms · main-thread task ${ph.work.taskMs} ms`);
  if (name === "down") console.log(sectionTable(ph.sections).join("\n"));
}
console.log(`long tasks while scrolling: ${result.scroll.longTasks.count} (total ${result.scroll.longTasks.totalMs} ms, worst ${result.scroll.longTasks.worstMs} ms) · INP ${result.scroll.inpMs ?? "n/a"} ms · CLS ${result.scroll.clsTotal}`);
if (result.intro) console.log(`intro   frames ${result.intro.frames} · p50 ${result.intro.p50} · p95 ${result.intro.p95} · p99 ${result.intro.p99} · worst ${result.intro.worst} ms · >33ms ${result.intro.over33}% · >50ms ${result.intro.over50}%`);
if (result.layoutShifts.length) {
  console.log("layout shifts (largest first):");
  for (const s of result.layoutShifts) console.log(`    ${String(s.value).padStart(6)}  at ${String(s.at).padStart(5)} ms  ${s.sources.map((x) => `${x.node} ${JSON.stringify(x.from)}→${JSON.stringify(x.to)}`).join("  |  ")}`);
}
if (result.idle) console.log(`idle    ${idle.seconds} s parked: ${idle.pageFrameRequests} animation-frame requests by the page · main-thread task ${idle.taskMs} ms · script ${idle.scriptMs} ms · layouts ${idle.layouts} · style recalcs ${idle.styleRecalcs}`);
console.log(`memory  JS heap ${result.memory.heapStartMB} → ${result.memory.heapEndMB} MB · DOM ${domStart} → ${domEnd} elements · listeners ${listeners0} → ${mEnd.JSEventListeners} (3 round trips)`);
console.log(`network ${result.network.requests} requests · ${result.network.totalKB} KB  ${JSON.stringify(result.network.byType)}`);
if (result.console.length) console.log("console:", result.console);
if (result.profile) {
  console.log(`\nCPU profile during the scroll (active ${result.profile.activeMs} ms of ${round(result.profile.activeMs + result.profile.idleMs)} ms):`);
  for (const r of result.profile.topFunctions) console.log(`    ${String(r.ms).padStart(7)} ms ${String(r.pct).padStart(5)} %  ${r.item}`);
  console.log("  by file:");
  for (const r of result.profile.topFiles) console.log(`    ${String(r.ms).padStart(7)} ms ${String(r.pct).padStart(5)} %  ${r.item}`);
}
if (result.trace) {
  for (const [name, f] of Object.entries(result.trace.presentedFrames ?? {})) {
    console.log(`\npresented frames (compositor draws), ${name}: ${f.drawn} in ${f.seconds} s = ${f.perSecond}/s · gap p50 ${f.gapP50} · p95 ${f.gapP95} · worst ${f.gapWorst} ms · gaps over 33 ms ${f.over33Pct}%`);
  }
  console.log("\nTimeline (main thread, ms):", JSON.stringify(result.trace.mainThreadMs));
  console.log("Other threads busy (ms):", JSON.stringify(result.trace.otherThreadsBusyMs));
}

if (outFile) {
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(`\nwrote ${outFile}`);
}
await browser.close();
