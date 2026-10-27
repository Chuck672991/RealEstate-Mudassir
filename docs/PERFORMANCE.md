# Performance and animation — what was measured, what changed, what is still open

This is the record of the performance round: an audit of the whole site for smoothness on low-spec machines **without removing the animations**. Every number below was measured by a script in this repository on a production build, and anything that was *not* measured is listed under [Not verified](#not-verified-and-limits). Nothing here is a claim about a real low-end laptop: none was available (see [Limits](#not-verified-and-limits)).

- [Summary](#summary)
- [How it was measured](#how-it-was-measured)
- [Bottlenecks found](#bottlenecks-found-ranked-by-evidence)
- [Results, before and after](#results-before-and-after)
- [What changed, by file](#what-changed-by-file)
- [The adaptive tier](#the-adaptive-tier-full--lite)
- [Images, video, fonts and caching — the asset report](#asset-report)
- [Loading, fonts and the intro](#loading-fonts-and-the-intro)
- [Reduced motion](#reduced-motion)
- [Section-by-section status](#section-by-section-status)
- [Mistakes found in this round's own work](#mistakes-found-in-this-rounds-own-work)
- [Open items and recommendations](#open-items-and-recommendations)
- [Not verified, and limits](#not-verified-and-limits)
- [How to reproduce](#how-to-reproduce)

## Summary

On a CPU slowed 12× (a simulation, see below) the original site dropped to 30 fps on **38.5 %** of frames while scrolling down the home page and **21.5 %** scrolling back up; it now drops on **9.2 %** and **1.9 %**. The same scroll did 39 % less main-thread work (53.9 s → 33.1 s), layout passes fell from 2,567 to 364, script time from 18.3 s to 5.6 s, and long tasks from 12 to 1. A **parked tab went from 744 animation-frame requests and 301 ms of main-thread time per 6 s to 24 and 31 ms**. The first-visit layout shift (**CLS 0.813**) is **0**. No animation was removed; the pinned scenes, the sideways chapter, the closing zoom and the reveals all run in the default tier.

On the machine used (Apple silicon, Chrome 155) the original site was already smooth at real speed, so at 1× the gain is headroom, not a visible change. The gain shows when the CPU is the limit.

## How it was measured

- **Builds.** Both the original (commit `18d9aa3`, "Complete site optimizations") and the new code were built with `next build` and served with `next start`, side by side, from scratch copies of the repository. Nothing was measured on `next dev`, except the hydration/console audit.
- **Harness.** [`scripts/verify/scroll-perf.mjs`](../scripts/verify/scroll-perf.mjs) drives Chrome (via Playwright) with **real wheel input**, so the smooth scroller behaves as for a visitor: down the whole page (22,013 px at 1440×900) at 1,500 px/s, then back up at 3,500 px/s, then three round trips for memory. It reports the main thread's `requestAnimationFrame` interval per page section, long tasks, layout and style-recalculation counts and time, script time, load-time LCP/FCP/CLS/TBT, memory, network, and (with `--profile` / `--trace`) a V8 CPU profile, the DevTools timeline and the compositor's presented frames.
- **A "slow frame"** is one more than 33 ms after the previous one, i.e. a dropped 60 Hz refresh.
- **Throttling is simulated.** `--cpu N` uses Chrome DevTools' CPU throttling. It slows the page's main thread N×; it does **not** slow the GPU, memory bandwidth or the video decoders. **12× ≈ a very slow machine; 6× ≈ a slow one.** A real low-end laptop can be worse than any number here, particularly for the flower videos, which are decoded in software.
- **Run-to-run spread is real.** Two runs of the same build differed by up to ~3 percentage points in slow-frame share (e.g. the new full tier scored 6.8 % and 9.2 % in two whole-page runs); in short, single-section runs the spread was larger. **Treat differences under about 5 points as noise.** Differences such as 38.5 % → 9.2 % are not noise.
- **Headless Chrome, one machine.** Frame timing is the main thread's frame production, not what reached a screen. Only Chrome 155 on Apple silicon was used. Safari and Firefox were not tested.

## Bottlenecks found, ranked by evidence

Each was found by profiling, not by reading code, and several were confirmed by *ablation* (switching a feature off and re-measuring).

| # | Bottleneck | Evidence (baseline, 12×) | After |
|---|---|---|---|
| 1 | **Header colour hit-tests** (`elementsFromPoint` for every fixed piece, every frame, each followed by a DOM write that forced a style recalculation) | `elementsFromPoint` 19.9 % of all CPU; timeline `HitTest` 15.7 s | 3.7 %; 3.5 s |
| 2 | **Scroll-reveal detection by polling rects every frame**, forcing layout | 2,567 layout passes (2.8 s) while scrolling down | 364 (0.6 s) |
| 3 | **Frame loops that never stop.** Lenis ran its own `requestAnimationFrame` loop forever, and GSAP's ScrollTrigger starts an empty one at registration. In Chrome *any* running rAF loop makes every running transform animation cost a main-thread style recalculation per frame, and the header badge spins forever | A parked tab: 744 frame requests, 360 style recalcs, 301 ms main-thread per 6 s | 24; 26; 31 ms |
| 4 | **Layout thrash in the intro** (the arch rings were animated by `width`/`height`/`top` on a fixed overlay) | **CLS 0.813** on a first visit; worst intro frame 483 ms | **0**; 133 ms |
| 5 | **No compositor layer for the scrubbed scenes**, so each scripted transform repainted | 6–21 % main-thread time per frame spent on it in the hero, sideways chapter and horizon (ablation, below) | recovered by temporary `will-change` where it paid |
| 6 | **Flower videos are decoded in software** (VP9 with alpha) | on the test machine two clips ≈ 27–45 % of one core; the media/codec threads were busy for ≈ 2 s of a 12× run | clips cropped to their flowers (−39 % pixels); stopped entirely in the lite tier |
| 7 | **Caching:** files in `public/` default to `Cache-Control: max-age=0`; optimised images to 4 h | every visit and every video range request revalidated | see [Caching](#caching) |
| 8 | **Per-frame layout reads in the scroll rail** | in the layout total above | cached with a `ResizeObserver` |

### The `will-change` ablation (why promotion is selective)

Measured at 12×, a blanket `will-change: transform` on the scrubbed layers (before the final design):

| Range | main-thread ms / frame | frames over 33 ms |
|---|---|---|
| top of page (hero) | 15.1 → 11.9 | 7.8 % → 4.0 % |
| sideways chapter | 18.5 → 15.8 | 21.7 % → 10.6 % |
| clouds + aerial photo | 14.6 → 11.7 | 6.5 % → 1.2 % |
| middle sections | 13.7 → 12.7 | 9.4 % → 8.2 % |
| **closing scene** | 9.4 → 8.8 | 2.2 % → 2.7 % (no gain) |

It is **not free**: a promoted layer keeps the resolution it was first rasterised at, so a layer scaled up a long way looks a little softer. Measured with a Laplacian-sharpness score on settled screenshots: the hero wall at the end of its ×2 zoom **−7 %**, the closing scene **−4…−7 %**, the sold stage (also ×2) **0 %**. So the closing scene, which gained almost nothing and shows a full-bleed photograph and giant type, is **not promoted**. The hero's softening was judged small (a 3× magnified crop of its text looked the same) against a gain that roughly halves its slow frames. The hint is applied only while a scene is within one viewport of the screen ([`engine/promote.ts`](../components/motion/engine/promote.ts)), so GPU memory is not held for the whole visit. If the softness at the end of the hero zoom is unwelcome, remove `promoteWhileNear` from `heroDolly` in `engine/home.ts`: one line.

## Results, before and after

All "after" figures are the production build of the final code unless stated.

### Whole page, desktop 1440×900, CPU 12× (simulated)

| | Baseline | After — full tier | After — lite tier |
|---|---|---|---|
| frames over 33 ms, scrolling down | **38.5 %** | **9.2 %** | 6.8 % |
| frames over 33 ms, scrolling up fast | **21.5 %** | **1.9 %** | 0.8 % |
| worst frame (down) | 83.4 ms | 66.6 ms | 50.0 ms |
| 99th-percentile frame (down) | 50 ms | 33.4 ms | 33.4 ms |
| long tasks while scrolling | 12 (689 ms) | 1 (63 ms) | 2 (123 ms) |
| layout passes down (time) | 2,567 (2,800 ms) | 364 (574 ms) | 355 (564 ms) |
| style recalculations down (time) | 9,539 (7,984 ms) | 9,202 (4,941 ms) | 8,048 (4,678 ms) |
| script time down | 18,252 ms | 5,561 ms | 4,065 ms |
| main-thread work down | 53.9 s | 33.1 s | 30.0 s |
| JS heap / DOM / listeners over 3 round trips | 5.7→5.7 MB / 1732→1733 / 706→706 | 5.7→5.8 MB / 1738→1739 / 715→715 | 5.5→5.6 MB / 1738→1739 / 708→708 |

No growth over repeated scrolling in any build (no leak from the scroll scenes). The lite tier is one run; see [the adaptive tier](#the-adaptive-tier-full--lite) for what it does and does not buy.

### Other conditions

| Condition | Baseline | After |
|---|---|---|
| Desktop, CPU 6×: frames over 33 ms (down) | 0.8 % | 0 % |
| …layout passes / script time / main-thread work | 2,411 / 8.6 s / 24.0 s | 360 / 1.9 s / 12.0 s |
| Desktop, real speed (1×): frames over 33 ms, cold | 1.1 % (worst 167 ms) | 0 % (worst 33 ms) |
| Desktop, real speed (1×), warm | 0 % | 0 % (no visible difference on this machine) |
| Phone profile 390×844 @3×, CPU 6×: frames over 33 ms | 3.0 % | 2.7 % |
| …phone: main-thread work / script time | 7.4 s / 1.4 s | 6.5 s / 0.8 s |
| **First visit** (intro plays), CPU 6×: CLS | **0.813** | **0** |
| …worst frame during the intro | 483 ms | 133 ms |
| …LCP (one run each) | 672 ms | 236 ms |
| **Parked tab, 6 s, 1×:** page animation-frame requests / style recalcs / main-thread time | **744 / 360 / 301 ms** | **24 / 26 / 31 ms** |
| Load phase at 12× (5 interleaved runs each; only runs that reported an LCP): LCP | 392–860 ms (median 396, n = 4) | 292–440 ms (median 404, n = 3) |
| …TBT | 236–533 ms (median 296) | 301–532 ms (median 332) |

Notes on these:

- **The load phase did not measurably change.** The spread inside each build is larger than any difference between them. Some runs reported no LCP at all (headless), so the LCP medians use only the runs that did. The first-visit LCP row is a single pair of runs and is *not* evidence of an improvement.
- The phone gain is small because the phone layout has few scripted scenes; the remaining slow frames there are in the homes, experience and reviews sections and are single dropped frames (see [Open items](#open-items-and-recommendations)).
- The baseline's parked-tab figures were taken at a 60 Hz display cadence. The "after" idle figures were taken twice, including once under a 30 Hz cap; they are counts of page work and did not change.

### Core Web Vitals (lab, localhost — optimistic), from `verify:perf`

| | Result | Target |
|---|---|---|
| LCP | 0.04–0.16 s on all 8 page × viewport combinations | ≤ 2.5 s |
| CLS | **0.000** on all 8 (also while scrolling the whole page, and on a first visit — see above) | ≤ 0.1 |
| Long tasks | 0–1 (≤ 70 ms) per page | — |
| INP | **not measured** — the harness has no discrete user interactions to time | ≤ 200 ms |
| Lighthouse | **not run** | — |

JavaScript on the home page is **225 KB** in `verify:perf` against 222 KB recorded in the previous round: the tier, promotion and frame-monitor code cost about 3 KB.

### Network

The full scroll fetches about 12 MB of flower video in both builds (the six WebM files total 12.9 MB; 12.5 MB before). The number of video bytes fetched *during a scroll test* is timing-dependent (8.4–12.9 MB across runs of either build), so it is not a reliable before/after figure and no reduction is claimed. Image transfer is unchanged: ≈ 2.5 MB of images on the desktop home page, ≈ 1.3 MB on the phone profile, unchanged by this round.

### Caching

Measured on the served responses:

| Resource | Before | After |
|---|---|---|
| Flower clips and posters (content-hashed names) | `max-age=0` | `public, max-age=31536000, immutable` |
| `/_next/static/*` chunks | immutable (framework default) | unchanged |
| Cloud strips (`/clouds/*`, not hashed) | `max-age=0` | `max-age=2592000, stale-while-revalidate=86400` (30 days) |
| Optimised photographs (`/_next/image`) | `max-age=14400` (4 h) | `max-age=2678400` (31 days); same bytes (checked: 22,886 B AVIF for the hero portrait) |

One trade-off: a *local* photograph that is replaced under the same file name can show the old one for up to 31 days. Pictures served from Sanity are addressed by content, so this does not apply to them. Headers are covered by `lib/config/headers.test.ts`.

## What changed, by file

**Scroll-time work**
- `components/motion/engine/tone.ts` — header recolouring: all reads first, then writes; at most one pass per 100 ms (250 ms in lite) with a trailing pass, so the state at rest is exact. The colour change is itself a 0.8 s transition, so a ≤ 100 ms-old answer is indistinguishable.
- `components/motion/engine/reveal.ts` — reveal detection by `IntersectionObserver`, except the two reveal types hidden by `clip-path`, where the observer fires up to 560 px late (measured); those are polled in one batched pass.
- `components/layout/ScrollRail.tsx`, `styles/structure/chrome.css` — cached sizes, thumb moved by `translate3d`.
- `components/motion/engine/scroll.ts` — Lenis no longer owns a frame loop: it runs only while the page is moving (and 200 ms after), woken by wheel/touch/key/scroll events; its clock is reset on wake so the first notch does not jump.
- `components/motion/engine/home.ts` — `registerPlugins` (drops ScrollTrigger's idle loop, Chromium only, once per page load — see [the bug](#mistakes-found-in-this-rounds-own-work)); temporary promotion; decorative scrubs in their own `matchMedia` so the lite tier can revert them.
- `components/motion/engine/promote.ts` (new) — `will-change: transform` only while a scene is near.
- `components/motion/engine/intro.ts`, `styles/structure/chrome.css`, `styles/structure/motion.css` — arch rings animate by `scale`/`translate` on a ring built at its final size (border divided by the scale), registered with `@property --arch-s`; the rings are pixel-identical to before (max difference 1/255 over 8 sampled frames).

**Adaptive tier**
- `components/motion/engine/tier.ts` (+ `tier.test.ts`, new), `components/motion/prepaint.ts`, `components/motion/MotionProvider.tsx`, `components/motion/engine/live.ts`, `styles/structure/sections/horizon.css`.

**Assets and caching**
- `components/ui/Flower.tsx`, `lib/flower.ts`, `styles/structure/flowers.css`, `scripts/assets/flower-clips.mjs`, `content/flower-clips.json`, `public/flowers/clips/*` — cropped, content-hashed clips.
- `assets/flowers/*` — the 48 MB of original masters moved out of `public/` (they were deployed, referenced by nothing).
- `next.config.ts`, `lib/config/headers.test.ts` (new) — caching.

**Tooling**
- `scripts/verify/scroll-perf.mjs` (new; `npm run verify:scroll`), `scripts/verify/lifecycle.mjs` (new; `npm run verify:lifecycle`), `scripts/verify/flowers.mjs` (a selector fix and four lite-tier checks).

## The adaptive tier (full / lite)

Quality adapts to **measurements, not to the screen width or the user-agent**, which say nothing about how fast a computer is. It is conservative, one-way and sticky.

**Signals** (any one switches to lite, once, for the rest of the browser session):
1. `?perf=lite` in the URL (testing, kiosks). `?perf=full` pins the full tier and turns the automatic downgrade off (benchmarks).
2. The connection: Save-Data on, or an effective connection of 3G or slower (`navigator.connection`, Chromium only).
3. The machine, measured while the visitor scrolls: ≥ 25 % of the last 60 frames longer than 25 ms (a sustained stutter), after a 12-frame warm-up per scroll streak, idle gaps over 250 ms ignored; or a flower video dropping ≥ 25 % of its frames over its first 24+ frames. After 360 healthy frames in a row the machine is trusted and measuring stops.

**It never goes back up**, so quality cannot flap. `prefers-reduced-motion` is separate and stronger: that visitor never gets the motion layer at all.

**What lite changes:** the flower videos show their still frame instead of playing (and are not downloaded), the purely decorative parallax and drifts are skipped, the clouds hold still, the header recolours every 250 ms instead of every 100 ms, and the arrival intro is skipped. **What it keeps:** every story animation (the hero dolly, the sold stage, the sideways chapter, the closing zoom, the reveals) *and the smooth scroller*.

**Tested:** the frame-rate judge by 13 unit tests on synthetic frame streams (steady 60 fps, a brief hiccup, a long idle gap, a 30 fps machine, exactly at the threshold, and so on); the URL override, the "starts lite" session and reduced motion by `verify:flowers` (a session that starts lite fetches **no** clip and plays none); a mid-session downgrade by hand (clips that were playing paused); and the automatic trigger in a real browser, with the caveat under [Not verified](#not-verified-and-limits).

**What the measurements say about lite:** at 12× it does about 9 % less main-thread work than the full tier and has slightly fewer slow frames (6.8 % vs 9.2 %, within run-to-run spread). Most of what it saves is *not* on the main thread: in the full tier the media and codec threads were busy for about 2 s of the 12× run (1.25 s + 0.73 s), and in lite they did not appear among the busy threads at all. That benefit is real on a machine that decodes video in software but is **not** captured by a main-thread throttle, and has not been measured on a low-end machine.

**A design decision the data reversed:** lite originally also turned the smooth scroller off, "to save work". Measured at 12× over the sideways chapter, native wheel scrolling was *worse* (frames over 33 ms: 48 % vs 27 % scrolling down, 38 % vs 7 % up) even though it does less work, and "full tier minus Lenis" reproduced it exactly. The scroller now stays in lite; it only runs while the page is moving, so it no longer costs anything at rest.

## Asset report

Totals in `public/` (deployed): photographs **239 MB**, flower clips 21 MB, clouds 0.4 MB. Outside `public/` (not deployed): flower masters 48 MB, owner-supplied originals 15 MB.

| Finding | Detail |
|---|---|
| **Photographs are PNG** (28 files, 4.4–15.0 MB each, 2,520–3,840 px, 1.0–1.6 MB per megapixel) | PNG is the wrong delivery format for photographs. They are *not* sent to visitors — `next/image` serves AVIF/WebP at the requested width (the hero portrait at 640 px is a 22.9 KB AVIF) — but they deploy, and each is decoded by the optimiser on the first request of each size (0.3–2 s cold per large PNG variant, measured). They are ML-upscaled reconstructions of 650–1,600 px originals (see `ASSETS.md`). |
| **Measured saving if the masters were lossy** (3 photos tried) | WebP q90: **9–12 %** of the PNG size, mean error 1.4–1.9 / 255; AVIF q70: 6–8 %, mean error 1.3–2.0; JPEG q90 4:4:4: 18–19 %, mean error 1.1–1.3. For all 28 that is roughly **239 MB → 25–30 MB** of deploy. **Not applied**: it would touch every photograph's path, the asset manifest, the mapping and the hi-res pipeline, and only 3 of 28 pictures were checked. It is the largest remaining deploy-size item. |
| **Flower clips (WebM + MOV)** | Cropped to where the flowers are: **−39 % decoded pixels** per frame set (3.11 → 1.88 Mpx over the six clips; −21 % to −53 % per clip). The crop is lossless in effect: across all 160 frames of every clip, **0 visible pixels** (alpha > 8) fall outside the crop, and the posters placed back in their boxes match the originals to 0.4–1.3 / 255 mean error. **Files did not shrink**: WebM 12.5 → 12.9 MB total (+3 %; clip 04 alone 0.9 → 1.6 MB, +67 %, while its MOV fell 53 %), MOV 9.2 → 8.1 MB (−12 %), posters unchanged. The gain is decode work, not bytes. |
| **Flower masters in `public/`** | 48 MB deployed for nothing → moved to `assets/flowers/` (the build script reads both). |
| **Exact duplicates** | 28 files in `assets/owner-supplied/homes-com-profile-save/` are byte-identical to files in `photo-originals/` (≈ 7 MB), plus one pair inside the first folder. Not deployed; left alone because they are the owner's own supplied files. |
| **Unused / wrong-format** | No unreferenced files in `public/` (`assets:check` passes: 62 slots). Clouds are WebP already; fonts are 3 files, 97 KB, `display: swap`. |
| **Hashed names** | Clips are content-hashed (`NN.<hash>.webm`), which is what allows the one-year `immutable` cache. |

## Loading, fonts and the intro

- **Fonts:** Bodoni Moda (roman + italic) and Archivo through `next/font/google`, self-hosted by Next at build time, 97 KB in three files, `display: swap`. No font-related layout shift was measured (CLS 0.000 everywhere). The build downloads the fonts from Google, so **a build can fail if the network is down** (it did once during this round, transiently; see open items).
- **The intro (preloader)** can never hang: it plays only on the first visit of a tab session on `/`, waits for readiness at most **3.5 s**, opens at 1.9 s, ends at 4 s; a 5-second watchdog in the pre-paint script removes every enhancement if the motion layer never starts. It is skipped on repeat visits, in reduced motion and in the lite tier. `scripts/verify/intro.mjs` confirms it ends, releases scroll and leaves the hero visible (re-run: visible and scroll-locked from 0.3 s, opens at ≈ 2.6 s, finished with scroll released by 4.6 s, not replayed after a reload in the same tab).
- **No flash:** the pre-paint script sets the `<html>` classes before first paint, as before.

## Reduced motion

Unchanged in behaviour and re-verified: with `prefers-reduced-motion`, no motion layer starts, no video file is requested (only the transparent posters), the scenes are static, and switching the preference on or off while the page is open reverts or rebuilds the scenes (`verify:lifecycle`: the hero scene returns to identity and `will-change` is released). The accessibility audit passes in reduced-motion contexts too.

## Section-by-section status

"Down/up" = continuous and fast backward scroll, from `scroll-perf` at 12× (slow frames, down / up where noted). Initial render and entrances come from `verify:states`, `verify:interactions`, `verify:flowers` and the intro check; repeated enter/leave from the three memory round trips (heap, DOM and listeners flat); resize and reduced-motion toggles from `verify:lifecycle`; mobile from the phone profile and the 390 px audits.

| Section | Slow frames at 12× (baseline → after, down) | Status |
|---|---|---|
| Hero / top | 64.3 % → 8.8 % | Fixed. Promoted layer; ≈ 7 % softer at the end of the ×2 zoom. |
| Arch intro | 100 % → 31.3 % | **Improved but still the worst section at 12×** (the rotating words are driven by a CSS variable, not a transform; not promoted). |
| Expertise | 79.3 % → 19.8 % | Improved; still above the others. |
| About | 63.2 % → 16.9 % | Improved. |
| Sideways chapter (Areas) | 70.6 % → 24.9 % | Improved by ~⅔; **still the heaviest scripted scene** — it moves a very wide rail, three flower videos and numerals together. |
| Horizon (clouds + aerial) | 42.5 % → 3.4 % | Fixed. |
| Homes / Experience | 11.9 % → 1.9 %, 26.8 % → 3.1 % | Fixed at 12×; on the **phone profile** both still show single dropped frames (homes 9.3 % → 10.3 %, experience 8.2 % → 5.6 %; i.e. not improved). |
| Sold stage | 20.3 % → 3.3 % | Fixed. |
| How I work | 20.7 % → 3.7 % | Fixed. |
| Reviews | 0.9 % → 0 % at 12×; **11.8 % on the phone profile** (baseline 6.3 %) | Fine on desktop; single dropped frames on phone, and not better than before there. |
| Closing scene | 8.2 % → 1.4 % | Fixed. Not promoted (quality). |
| Footer | 0 % → 0 % | — |

(Per-section shares are from the clean 12× runs; sections with few frames move by several points between identical runs.)

## Mistakes found in this round's own work

Recorded because they were real, and because the checks that caught them are now part of the suite.

1. **The lite tier downloaded every flower clip at the top of the page.** A session that *starts* lite (Save-Data, a slow connection, `?perf=lite`) called `video.load()` on all clips at start-up, which begins a download — 8 requests, in exactly the sessions the tier exists to protect. Fixed (only clips that actually started are released); `verify:flowers` now has four lite-tier checks and failed on the unfixed build before it passed on the fixed one.
2. **The idle-loop workaround could freeze every scrubbed animation.** `registerPlugins` drops the one animation-frame request that starts ScrollTrigger's empty loop. On a *second* initialisation (the visitor leaves the home page and comes back), GSAP's own ticker could be asleep, and its wake-up request is also an animation-frame call: it was dropped too, leaving the ticker "running" with no frame scheduled (frozen at the same frame number across 1.5 s, read from the page). The Areas chapter kept its height but its rail never moved until a reload. It reproduced 3 of 3 times after a breakpoint resize or a reduced-motion toggle followed by a quick navigation, and not in the original code. Fixed three ways (once per page load; ticker woken before the wrapper opens; a two-frame watchdog); `verify:lifecycle` reproduces it on the unfixed build and passes on the fixed one.
3. **Native scrolling in lite was worse than the smooth scroller** (above) — reversed on the evidence.
4. **Promoting the closing scene bought nothing and cost sharpness** (above) — removed.
5. **My first idle measurement was invalid**: the recorder's own animation-frame loop produced the 60-per-second recalculations in both builds. The idle phase now uses no recorder and counts the page's own frame requests.
6. **The flower build ran out of disk** (the script kept every clip's decoded frames until the end) and left the manifest pointing at deleted files. It now deletes frames per clip and rewrites the manifest after each clip.
7. **`verify:flowers` looked for the video's direct parent** and failed once a wrapper was added (the clips were playing; the audit could not find them). Updated to `closest(".flower")`.

## Open items and recommendations

In order of value:

1. **Convert the photograph masters from PNG to a lossy format** (≈ 239 MB → 25–30 MB deploy; numbers above). Do it in the `photos:hires` pipeline and re-check the pictures visually.
2. **The sideways chapter and the arch intro are still the heaviest scenes at 12×.** Ideas, none tried: pause the three flower clips in the chapter while the rail moves fast; drive the arch words with transforms instead of a CSS variable.
3. **Phone: single dropped frames in homes, experience and reviews** (present in the original too). Likely image decode/raster as large photographs enter, not scripts; not investigated.
4. **Event listeners grow by ≈ 9 per client navigation** (away and back), **in the original code as well**; DOM nodes do not grow after the first return, heap grows ≈ 0.1 MB per round trip. Small, not traced to a source.
5. **The build needs the network for Google Fonts.** Self-hosting the font files (`next/font/local`) would remove that, but fonts here are selected per theme (`lib/theme/themes/*/fonts.ts`), so it is a design decision.
6. **Clip 04's WebM is 0.6 MB heavier than before** (0.9 → 1.6 MB with identical encoder settings; the cause was not established). Re-encoding it a little harder would recover that.
7. **Dev-mode LCP warning** (`verify:console`): Next reports the hero portrait as LCP without `loading="eager"` when the page is scrolled programmatically, because the same photograph is used lazily in the About section. **Identical on the original code.** Probably an artefact of the audit scrolling programmatically (a real visitor's first scroll normally ends LCP measurement); not confirmed. Not changed.
8. Lighthouse, INP and a real low-end device pass have not been done.

## Not verified, and limits

- **No real low-end machine.** CPU throttling is a simulation; it does not slow the GPU, memory or video decoders. The lite tier's main benefit (no video decode) is therefore not captured by the numbers.
- **One browser, one machine.** Chrome 155 on Apple silicon, headless. **Safari and Firefox were not tested.** The idle-loop workaround is applied in Chromium only; elsewhere ScrollTrigger behaves as shipped.
- **The automatic downgrade was seen to fire, but not on a slow computer.** Under Chrome's 30 fps battery cap (every frame over 25 ms) continuous scrolling flipped the page to lite within ≈ 1.6 s, the choice was stored for the session and survived a reload, and `?perf=full` pinned it off. **Not demonstrated:** (a) it firing on a genuinely slow machine, (b) the opposite — staying on the full tier through a *long* scroll at a healthy 60 fps with no override (the verification audits scroll in short bursts and never flipped, but a full-page `--perf auto` run on mains power has not been done; it is the test to run to rule out false downgrades).
- **Run-to-run spread** of a few points (see above); most figures are single runs.
- **Battery:** the last measurements of the session were taken with the laptop at 18 % battery, where Chrome caps its frame rate at 30 fps and every timing is invalid. Those runs (the hero/closing `will-change` on/off comparison) were discarded; the decisions that rest on them use the earlier valid ablation and the sharpness measurements, which do not depend on frame rate. Functional audits do not depend on frame timing and were re-run.
- **Not measured:** INP, Lighthouse, TBT beyond the numbers shown, memory on a real device, battery use.
- **The hydration/console audit** is the only check run on `next dev`; it shows 2 dev-only warnings that are identical on the original code (item 7 above).
- **What ran against which code.** The functional audits (`states`, `interactions`, `a11y`, `seo`, `perf`, `flowers`, `lifecycle`, `overlay-contrast` in all three modes, the intro check), the unit tests, type-check, lint and the idle measurement all ran on the **final** code. The whole-page timing benchmarks (12×, 6×, phone, first visit, load, lite), the frame-by-frame comparison with the original, the settled-section screenshots and the dev-server console audit ran **one step earlier**, before three small changes (the closing scene's `will-change` removal, the `registerPlugins` fix and the lite-tier clip-download fix), and were **not repeated** because the laptop was by then at 18 % battery. Those changes are outside the steady-state scroll path of the default tier, but that is an argument, not a measurement; re-run `npm run verify:scroll` on mains power to confirm. `VERIFICATION.md` lists it row by row.

## How to reproduce

```bash
# builds (the same code the audits use)
NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build && npm start        # terminal 1

# the scroll benchmark: real wheel input, per-section frames, long tasks, layout/script time
npm run verify:scroll -- http://localhost:3000 --cpu 12 --label after --out after-12x.json
#   --cpu N  --mobile  --reduced  --intro (first visit)  --idle  --profile  --trace  --range 0.2-0.5  --perf lite|full|auto
#   --css "<css>" / --init "<js>" to ablate a feature; see the header of scripts/verify/scroll-perf.mjs

# the page's life: resize, reduced motion toggled live, away and back
npm run verify:lifecycle -- http://localhost:3000
npm run verify:flowers   -- http://localhost:3000    # playback, caching of clips, the lite tier, reduced motion
```

Compare two builds by running the original commit in a second copy of the repository on another port and giving the same flags to both. **Do not benchmark on a laptop that is on battery**: at about 20 % Chrome caps frames at 30 fps (`p50 33.3 ms` on an idle page is the tell).
