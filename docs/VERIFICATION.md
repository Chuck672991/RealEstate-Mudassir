# Verification

What was checked, how, with what result — and, as importantly, **what was not**. Nothing below is claimed beyond the evidence.

## Environment

| | |
| --- | --- |
| Machine | macOS 26.3 (arm64), Node **25.2.1**, npm 11.7 |
| Stack | Next **16.4.3** (Turbopack, Cache Components, Partial Prefetching) · React **19.3.0** · Sanity **6.20** + next-sanity **13.4** · GSAP **3.15** · Lenis **1.3** · Tailwind **4** |
| Browser | **Chrome 155 only**, driven by `playwright-core` (`PW_CHANNEL` overrides the channel). axe-core **4.14**. |
| Network | Available, but **no Sanity project, email provider or hosting account** — see [Not verified](#not-verified) |
| Date | 2026-10-24/25. The seed data's observation date is 2026-10-24. |

Build used for the browser checks: `NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build && npm start` (a test origin so canonical URLs and the sitemap can be compared; the site runs in **local-content mode**, i.e. the bundled `content_seed.json` through the real GROQ queries and publication rules).

---

## Results (final code)

### Static

| Command | Result |
| --- | --- |
| `npm run lint` | clean, 0 warnings |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | clean |
| `npm test` | **163 / 163** — publication policy, seed (idempotency, edit preservation), themes (no literal colours outside `styles/themes/`), inquiry validation, empty-CMS rendering of every home section, `buildMetadata`, structured data, image rights + the `next.config.ts` allow-list |
| `npm run schema:validate` | 0 errors, 0 warnings |
| `npm run seed:sanity:dry` | 196 documents would be created (22 sources · 1 brokerage · 1 agent · 16 specialties · 8 areas · 55 properties · 88 testimonials · 1 statistics · 1 settings · 3 page documents); 0 failed |
| `npm run assets:check` | manifest up to date (62 slots) |
| `npm run build` | succeeds; 32 static pages including all 17 published homes |

### Browser and SEO (production build)

| Command | Scope | Result |
| --- | --- | --- |
| `verify:states` | 21 pages × 3 contexts: console/network clean, no placeholder text, no overflow, nothing empty, one `<h1>`, nav present | **316 / 316** |
| `verify:interactions` | dialogs, form validation, honest "not connected" result, carousel, sold tabs, filters, skip link, reduced motion, no-JS, client navigation, 320 px and 200 % text | **43 / 43** |
| `verify:a11y` | axe-core, WCAG 2.0–2.2 A/AA + best practice, 21 pages × 3 contexts | **0 violations** (63 runs) |
| `verify:seo` | metadata, canonical, Open Graph/Twitter, JSON-LD types, sitemap (20 URLs), robots, 19 internal links, true 404 | **29 / 29** |
| `verify:perf` | LCP / CLS / long tasks / payload, desktop and 4×-throttled phone | **8 / 8** — CLS 0.000 everywhere, LCP ≤ 0.13 s (localhost lab figures — optimistic), 222 KB JS on the home page, one ≈ 60 ms long task on the throttled phone profile |
| `verify:contrast` | token audit, both themes | **48 / 48** |
| `overlay-contrast.mjs` | text over gradients/textures, 10 scenes | **83 / 83** |
| `overlay-contrast.mjs --stress white` / `--stress black` | every photo slot replaced by flat white / black | **64 / 64** each |
| `verify:intro` | the arch preloader runs, ends, releases scroll, doesn't replay in the session | pass (re-run after the ERA work) — scroll locked until the overlay is gone, hero released at ≈ 2.6 s, overlay gone between 3.8 s and 4.6 s on desktop; the phone profile was last run before the ERA work |

### Development server (hydration)

`next dev` is where React reports hydration mismatches, so the same audits were run there: `verify:console` **15 / 15** (5 pages × 3 contexts, no console error or warning) and `verify:states` **316 / 316**. The dev log contains only Node's `--localstorage-file` notice (below).

---

## Missing content

The brief requires graceful behaviour when the CMS is empty or partly filled. Nothing in the shipped dataset is empty, so this was tested by building the **real code** against reduced datasets. The only change is a one-line patch in a *scratch copy*; the project itself has no test hook.

```bash
# 1. a scratch copy (macOS: `cp -c` clones node_modules instantly; elsewhere use plain `cp -R`)
rsync -a --exclude node_modules --exclude .next --exclude .git ./ /tmp/fixture/
cp -cR node_modules /tmp/fixture/node_modules

# 2. in the COPY only, vary the dataset (lib/sanity/groq-local.ts, before `return documents;`)
#      if (process.env.FIXTURE === "empty") documents = [];
#      if (process.env.FIXTURE === "no-properties") documents = documents.filter((d) => d._type !== "property");

# 3. build, serve, audit
cd /tmp/fixture
CONTENT_SOURCE=local FIXTURE=empty NEXT_PUBLIC_SITE_URL=http://localhost:3320 npx next build
CONTENT_SOURCE=local FIXTURE=empty NEXT_PUBLIC_SITE_URL=http://localhost:3320 npx next start -p 3320 &
node scripts/verify/states.mjs http://localhost:3320 --empty
```

| Dataset | Build | Audit | What the visitor gets |
| --- | --- | --- | --- |
| **Empty** (no documents at all — a Sanity project that was never seeded) | succeeds | `states.mjs --empty` **93 / 93** | The hero (name from the code-level default) and the closing "Get in touch"; menu *Select an apartment · Book a call · Contact*; `/properties` says there are no homes and offers the form; `/contact` shows the form on its own; sitemap = 3 real URLs; the prerendered sentinel `/properties/__no-homes__` is a real 404; no empty landmark, no footer heading without content, no invented "data collected from…" claim, the home keeps the layout's default `<title>`. |
| **No properties** (everything else present) | succeeds | `states.mjs` **78 / 78** | Home without *Current listings* and *Recently sold*; `/properties` empty state; sitemap = 3 URLs. |

Also run: a build with `CONTENT_SOURCE=sanity` and **no project id** fails immediately with *"CONTENT_SOURCE=sanity but NEXT_PUBLIC_SANITY_PROJECT_ID is not set…"*, and a build pointed at a **non-existent Sanity project** contacted the real API and failed in 15 s with Sanity's own *"Dataset "production" not found for project ID …"* — a misconfigured deploy fails loudly instead of shipping an empty site.

## Photographs and approved quotes

No cleared photograph exists, so the image path had never rendered a real picture. Two things were done:

1. **A scratch copy running `next dev`, with generated bright, dark and busy test photographs in every slot, plus three approved quotes** (synthetic, never shipped). Checked in Chrome: every visible image loads through the optimizer as AVIF (WebP when AVIF is not accepted), `srcset` + `sizes` + intrinsic `width`/`height` on all, only the hero image is `eager` + `fetchpriority=high`, **CLS 0.000**, no console errors, axe **0 violations** (63 runs), state audit **316 / 316**, the quotes render. The optimizer rejects a quality outside the allow-list and a third-party host with 400.
2. **Unit tests** for the part that cannot be exercised without a Sanity project: `toImage()` refuses any image whose rights are not *owned / licensed / permission*, builds a project-scoped `cdn.sanity.io` URL, never exceeds 2400 px, applies crop and hotspot; and `next.config.ts` — evaluated for real in a child process — **allows exactly that URL** and nothing else (not another project, not `homes.com`, not plain `http`). Both halves were mutation-tested (a too-narrow path and a wildcard host each make a test fail).

**Then the owner supplied 28 real pictures** (portrait, 6 areas, 21 listings; rights `owner_directed`). With them in place, on a production build: `verify:states` 316/316, `verify:interactions` 43/43, `verify:a11y` 0 violations (63 runs), `verify:seo` 29/29, `verify:perf` 8/8 (CLS 0.000; home page now carries ≈ 270 KB of images on desktop, ≈ 130 KB on the phone profile; the hero portrait is the LCP element), `overlay-contrast` 83/83 and `--stress white` 64/64, and the dev-server console audit is clean. Bugs found on the way: the hero's "lit doorway" glow was nearly opaque and hid the portrait; the area-photo wrapper was not a positioned parent (photos over-zoomed); carousel photos in hidden slides only loaded on first click (they now fetch once the section has been seen). Tests also pin the mapping (`lib/sanity/local-images.test.ts`). Not checked: that each picture is matched to the right record beyond address (see ASSETS.md caveats), and anything about their licences.

This is how the white-photo contrast defect was found (see below). The repeatable form is `overlay-contrast.mjs --stress white`.

---

## ERA residence animation work (the five experiences)

Implemented from `ERA_RESIDENCE_ANIMATION_IMPLEMENTATION_BRIEF.md` (mapping and deviations: [`REFERENCE-MAPPING.md`](REFERENCE-MAPPING.md)). Everything below was run against a **production build in a scratch clone** (the dev server was left alone) unless noted.

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck`, `npm run schema:validate` | clean / clean / 0 errors |
| `npm test` | **163 / 163**, including new tests for the flower clips (files exist, are the right kind, poster = clip size, each under 4 MB, markup contract, source order, "no clip → renders nothing"), the cloud strips, the closing-scene window geometry, the Horizon and How sections, and the closing photograph's rights gate. The new tests were each **mutation-checked** (reintroduced the original bug, confirmed the test fails, restored). |
| `npm run build` | succeeds, 32 static pages |
| `verify:states` / `interactions` / `a11y` / `perf` | **316 / 316**, **43 / 43**, **0 violations**, 8 / 8 with **CLS 0.000** |
| `overlay-contrast.mjs` (and `--stress white`, `--stress black`) | **83 / 83**, **64 / 64**, **64 / 64** |
| `verify:console` on `next dev` | no console error, warning or failed request (the `<video muted>` elements hydrate cleanly) |
| `verify:flowers` (new; mutation-checked — removing `pause()` or `play()` makes it fail), Chrome 155 | **16 / 16** — each clip loads only when its section is near the viewport; the WebM is chosen and the `.mov` is never requested; `currentTime` advances while in view; the clip pauses after scrolling away; under `prefers-reduced-motion` only the transparent posters are requested and nothing plays |
| Closing scene (screenshots) | at **1440×900**, across the sequence (progress 0, .18, .36, .40, .46, .52, .55, .58, .60, .64, .68, .69): two portrait windows, staggered → aligned → merged → full-bleed; flowers swell and leave; words arrive over the veil. At **1896×880** (a very wide window) and **1280×720**: the start, aligned and later points (0, .36, .46, .64, .72). At **390×844**: the flat (unpinned) layout. The final arch and footer were not re-captured after the last changes. |
| Phone and reduced-motion layouts | on phones **only the first Areas flower is shown** (every other placement is hidden below 992 px); that corner and the closing scene were looked at after the final changes. Reduced motion (desktop, stacked layout): the Areas and Market posters were looked at. No flower covers copy in the views listed. |

**Defects found while doing this, and fixed:**

11. **The closing windows were twice as wide as the reference's and merged into a stepped block.** The brief's hole coordinates are percentages of a *half-width* panel; they had been applied to the whole stage. Now converted, held in `closing-geometry.ts`, with a test pinned to the brief's measured numbers (mutation-checked against the old coordinates).
12. **Text on the phone layout of the closing scene failed WCAG AA once it sat on a photograph** — headline 2.09 : 1, body line 1.35 : 1. The phone rules switch the readability veil off (written for the illustrated scene); a photograph needs it. Fixed (`data-scene="photo"`), and the buttons and phone number follow the desktop (light-on-dark) treatment there. After: 6.9–12.7 : 1; the stress runs pass.
13. **A literal colour in `chrome.css`** (the arch preloader's mask layers) failed the "no literal colours" test — replaced with `currentcolor` (a mask uses only alpha); the preloader was re-checked.
14. **New component tests were silently not run** (the `npm test` glob did not include `components/`, nor `.test.ts` there) — glob extended.
15. **The first flower artwork was illustrated SVG, then painted stills; neither matched the reference.** Replaced by the owner-supplied alpha-video clips.
16. **Flowers sized in viewport width swallowed the picture on a wide, short window** (≈ 2.15 : 1) — now sized by the smaller of width and height.
17. **The reference places flower #8 under this site's navigation** — moved (see REFERENCE-MAPPING).

**Not verified for this work (and what that means):**

* **Safari.** The HEVC-with-alpha `.mov` that Safari is meant to take was verified only as a *file* (AVFoundation reads transparency in every frame; it plays 10 s, 16 fps). **No Safari, and no iOS device, was used**, so Safari's source selection and its alpha rendering are untested. If Safari showed an opaque box, the fix is in `components/ui/Flower.tsx`'s `<source>` list.
* **Firefox and Edge** — the WebM they use is the one tested in Chrome.
* **Clip 03** has not been supplied: the placement it belongs to (the end of the Areas chapter) renders nothing, and its CSS has never been looked at.
* **Real devices and low-power hardware** — the clips decode a 720 px VP9 stream; CPU/GPU cost on a phone was not measured. Phones show a single flower.
* **A person's eyes on every scroll position.** Stills at the points listed above were looked at, plus one scripted pass through the whole zoom; a frame-by-frame review of the motion was not done.
* **The flower clips' and the reference's imagery rights** — see [`ASSETS.md`](ASSETS.md).

## Round 3: carousel autoplay, header menu, How section, high-resolution photographs

Run against a fresh production build in a scratch clone (the dev server was left alone), **one script at a time on an idle machine** — see the note on load at the end of this section.

| Check | Result |
| --- | --- |
| `lint` · `typecheck` · `schema:validate` · `assets:check` | clean · clean · 0 errors · up to date (62 slots) |
| `npm test` | **166 / 166** (new: nav defaults and the "opens the contact form" flag, the How section's structure, the closing photograph's rights gate) |
| `npm run build` | succeeds, 32 static pages |
| `verify:states` | **316 / 316** |
| `verify:interactions` | **56 / 56** — includes, new: no pause/play button; the carousel keeps auto-playing after a mouse click on an arrow with the pointer still over it; it advances by itself; keyboard focus pauses it and leaving resumes it; a real **click** on the header's "Book a call", on a button inside a property page, and on the phone menu's "Book a call" each opens the contact form without navigating |
| `verify:a11y` | **62 / 63 pages × contexts clean; 1 violation, NOT reproduced** (below) |
| `verify:perf` | 8 / 8, **CLS 0.000**; image payload on the home page rose from ≈ 1.7 MB to ≈ 2.5 MB (desktop) because larger, higher-quality variants are now served |
| `overlay-contrast.mjs` (normal · `--stress white` · `--stress black`) | **91 / 91 · 64 / 64 · 64 / 64** — new scenes: the menu over the How photograph, and the How copy |
| `verify:console` on `next dev` | **15 / 15**, no console error, warning or hydration message |
| `verify:flowers` | **16 / 16** (when run alone) |
| `verify:seo` | **29 / 29** (on a build made with `NEXT_PUBLIC_SITE_URL`, as the script requires; my first attempt used a build without it and the script crashed — a setup error, not a site defect) |

**Defects found while doing this, and fixed**

18. **Every "open the contact form" button silently navigated to `/contact`.** `ContactDialog` listened on `document` in the bubbling phase; next/link calls `preventDefault()` first, so the listener saw a cancelled click and gave up. The existing tests opened the dialog with a custom event, which hid it. Now a capture-phase listener on `window` (with `stopPropagation`, and it closes the phone menu first). Mutation-checked: restoring the old listener makes the new click tests fail.
19. **The carousel stopped whenever the mouse pointer was resting where it appeared** (hover paused it, and a mouse click on an arrow left focus inside it, which paused it too). Reproduced first (a pointer resting mid-page: 0 slides advanced in 18 s), then fixed: only keyboard focus pauses it. Mutation-checked.
20. **A literal `#fff` in the preloader mask** failed the "no literal colours" test (round 2) — and `how.css` was rewritten without any.

**Photographs.** `npm run photos:hires` — see [`ASSETS.md`](ASSETS.md#high-resolution-versions-npm-run-photoshires). Measured at 2× pixel density, the worst stretch fell from ≈ 10.5× to ≈ 1.4× and tone is preserved (mean colour and luminance percentiles within 1–4 / 255 on the four photos measured). **These are ML reconstructions, not the camera's detail.** The ML model, the cropped before/after comparisons (portrait, closing photo) and the numbers were looked at; the other 25 photographs were converted by the same code but not each inspected.

**What did not pass cleanly, and what is NOT known**

* **a11y: `color-contrast` on the decorative "Scroll" cue (`.scroll-cue`, `aria-hidden`) on `/properties/townhouse-in-hanover-park-sold-009`, desktop with motion.** Each of the two full-suite runs reported exactly 1 violation; I identified the element and page only for the second (the first run's output was filtered away by my own command). It did **not** reproduce in 11 isolated replays of the audit's own procedure (page walk, back to the top, 1.2 s wait) on an idle machine. My hypothesis — axe measured the cue's colour mid-fade while the page was loaded by other work — is **unproven**. If it recurs, look at the cue's `color` transition and the tone hit-test (`engine/tone.ts`).
* **`states` and `flowers` each failed once in a combined run** that I was loading with other work; both passed when rerun alone (316 / 316; 16 / 16). `interactions` also failed twice with a page-load timeout or a stale selector (the selector was my own: it pointed at a button I had removed from the How section — fixed). **Run these scripts one at a time.**
* **Cold-cache latency.** The first request for each size of a photograph takes ≈ 0.3–2 s while the optimizer decodes the PNG; a visitor who is first to a page pays it (later ones get the cache). Not measured on a real host.
* **Not changed:** the flower videos are 720 px, the cloud strips 1400 px. At 2× density on a wide window the windows' flowers are ≈ 1.6× stretched at rest (more during the zoom). A 1080 px rebuild is possible (`scripts/assets/flower-clips.mjs`) at roughly twice the file size; not done.

## Round 4: performance and animation optimisation

The full account — method, numbers, what changed and what is still open — is [`PERFORMANCE.md`](PERFORMANCE.md). What was verified, and against which code:

**Against the FINAL code** (production build, `NEXT_PUBLIC_SITE_URL=https://www.example.com`, scratch copy on its own port, one script at a time):

| Check | Result |
| --- | --- |
| `lint` · `typecheck` · `schema:validate` · `seed:sanity:dry` · `assets:check` · `verify:contrast` | all exit 0 (lint with no warnings) |
| `npm test` | **196 / 196** (new: the frame-rate judge, 13 tests; the cache headers, 4) |
| `verify:states` | **316 / 316** |
| `verify:interactions` | **56 / 56** |
| `verify:a11y` | **0 violations**, 63 runs |
| `verify:seo` | **29 / 29** (against a build made with the test origin) |
| `verify:perf` | **8 / 8** — CLS 0.000 on every page and viewport; LCP 0.04–0.23 s (localhost lab figures; this run was under a 30 fps frame cap, see below); 226 KB JS on the home page (222 KB in the previous round) |
| `verify:flowers` | **20 / 20** — now includes a session that *starts* in the lite tier (no clip downloaded, none played, posters shown) |
| `verify:lifecycle` (new) | **23 / 23**, twice — resize across the breakpoint, reduced motion switched on and off, and leaving the page and coming back, each straight away and after 5 s idle |
| `overlay-contrast` | **91 / 91**; `--stress white` **64 / 64**; `--stress black` **64 / 64** |
| Intro (`scripts/verify/intro.mjs`) | passes: visible and scroll-locked from 0.3 s, opens at ≈ 2.6 s, finished with scroll released and the overlay hidden by 4.6 s, scrolls normally, and is not replayed after a reload in the same tab |
| Automatic downgrade, in a real browser | with no override, continuous wheel scrolling flipped the page `full → lite` within ≈ 1.6 s, stored `ms-perf=lite` for the session and the next load started lite; `?perf=full` stayed full. **Caveat:** this ran under Chrome's 30 fps battery cap (every frame slow), i.e. a simulated slow display, not a slow computer |
| Parked-tab cost (`scroll-perf --idle`), twice | 24 page frame requests · 26–27 style recalcs · 26–28 ms per 6 s (the original: 744 · 360 · 301 ms) |

**Against the build one step earlier** (before the last three code changes: removing the closing scene's `will-change`, the `registerPlugins` fix, the lite-tier clip-download fix — each described in PERFORMANCE.md): the whole-page scroll benchmarks (12×, 6×, phone, first visit, load, lite), the intro frame comparison against the original (rings pixel-identical, max difference 1/255), the settled-section screenshots against the original, and the dev-server console audit. **They were not repeated on the final code**: by then the laptop was at 18 % battery and Chrome caps frames at 30 fps, which makes every frame timing invalid (an idle page's median frame was exactly 33.3 ms). The three changes are small and are not in the steady-state scroll path, but that is an argument, not a measurement.

**`verify:console`** (needs `next dev`): 13 of 15 pass; the two failures are one dev-only Next warning (the hero photograph reported as LCP without `loading="eager"`, because the same picture is also used lazily in the About section) and are **identical on the original code**, run the same way.

**Checks that fail without the fix** (each was run first against the unfixed build): `verify:flowers`' lite-tier block (the lite tier downloaded every clip at the top of the page), `verify:lifecycle` (a frozen animation ticker after a resize or reduced-motion toggle followed by a quick navigation back). The `verify:flowers` selector was also updated (`closest(".flower")`: the video now sits one wrapper deeper); a copy that forces the lite tier fails it, so it still has teeth.

## Defects found by this verification, and fixed

Real problems, not hypotheticals — each was reproduced first, then fixed with a test or a measurable check:

1. **A page without its own SEO title lost its `<title>` entirely.** Next merges metadata key by key and treats a present-but-`undefined` key as "empty", which erased the layout default. `buildMetadata` now omits empty keys (tested).
2. **No menu at all when the CMS had none** — now defaults to *Select an apartment · Book a call · Contact* (routes that always exist; never `#anchors`).
3. **Empty footer columns** (an "Office" heading over an empty `<address>`, an "Explore" `<nav>` with an empty list) and an **empty "Contact details" `<aside>`** on `/contact` — each renders only with content; the form takes the full layout otherwise.
4. **Heading-only sections** — *Market* with no figures, *Areas* with only the office — now render nothing (component tests; mutation-checked).
5. **A data-provenance sentence hard-coded in a component**, shown on every page even with no data — moved to an editable CMS field (*Site settings → Data source notice*), seeded once.
6. **Duplicated name in the contact title** ("Contact Mudassir Siddiqui | Mudassir Siddiqui").
7. **Structured data published the office address even when the site hides it**, and its breadcrumb said "Properties" while the page said "Homes" (tests added; no review/rating markup is emitted — also pinned).
8. **Light text vanished over a bright photograph** — the Recently-sold stage (heading, tabs, price, caption), the **fixed header**, and the hero's italic accent over a bright portrait, 1.0–3.3 : 1. Fixed with a token-based scrim (see [`ACCESSIBILITY.md`](ACCESSIBILITY.md#text-over-photographs--the-scrim)). The contrast script was also improved: it now accounts for opacity (it had flattered the dimmed inactive tabs) and reads colours before hiding text (header colours transition, which had produced phantom α values).
9. **WCAG 2.5.8 target size**: the desktop nav links had a 20 px clickable height with ~12 px gaps; several small text links and the consent checkbox were under 24 px — fixed (`.hit-slop`, nav slop, 24 px checkbox).
10. **Redundant fallback alt text** ("Condo in Streamwood, Streamwood, IL").
11. **The lite performance tier downloaded every flower clip at the top of the page** (a session that starts lite called `video.load()` on each clip: 8 requests, in exactly the sessions the tier exists to protect). Reproduced, fixed, and pinned by four new `verify:flowers` checks.
12. **A frame-loop workaround froze every scrubbed animation after a client-side navigation back to the home page** (it dropped GSAP's own ticker wake-up request; the ticker's frame counter stood still, the Areas rail never moved until a reload). 3 / 3 reproductions on the unfixed build, none on the original code; fixed, and pinned by `verify:lifecycle`.
13. **`npm run flowers:build` ran out of disk** (it kept every clip's decoded frames until the end) and left the manifest pointing at deleted files; it now cleans up per clip and rewrites the manifest after each.

## Not verified

Stated plainly, so nobody assumes otherwise:

* **Any live Sanity project.** Not exercised: Sanity Live (`SanityLive` / `defineLive` in a real session), the revalidation webhook, **Draft Mode and the Presentation tool**, Studio sign-in and permissions, real documents, uploads (`images:import --write`), the seed against a real dataset (it is tested against an in-memory store and as a dry run), the private-dataset read-token path, and the TypeGen output against a real dataset. What *was* exercised against the real Sanity API is only the failure mode above.
* **Inquiry delivery.** No email provider or webhook was configured, so a real message has never been sent. The form's validation, honeypot, rate limit and its honest "not connected" state are verified; the transports are not.
* **A deployed host** — no CDN, no HTTP/2, no edge caching, no real Core Web Vitals; Lighthouse was not run.
* **Safari, Firefox, iOS, Android** — Chrome only (and see the Safari note under the ERA work above: the flower video's Safari path is untested).
* **Any human assistive-technology or keyboard walkthrough** — see [`ACCESSIBILITY.md`](ACCESSIBILITY.md).
* **Slow networks** (carousel photo loads, intro on 3G), **very long text**, **forced colours**, **print**.
* **Third-party content** — nothing was downloaded from Homes.com or any MLS; there is no image from them to test.
* **The GSAP choreography on low-end hardware.** Nothing was run on a real low-power device. Lab CPU throttling (up to 12×) is a simulation that does not slow the GPU or the video decoders; see [`PERFORMANCE.md`](PERFORMANCE.md#not-verified-and-limits) for this round's full list (Safari/Firefox, INP, Lighthouse, the automatic downgrade on a genuinely slow machine, the final-code benchmarks).

## Known limitations

See [`OPEN-ITEMS.md`](OPEN-ITEMS.md#known-limitations-of-the-build): unknown home URLs answer 200 with `noindex`; local-content mode uses `groq-js`; the header follows the section, not the photograph, outside the protected stages; theme choice is build-time; Node 25 prints a `--localstorage-file was provided without a valid path` warning from the build workers and the dev server. It is environmental: this project's code never references `localStorage` (checked by search), Node 25 exposes it as a global by default, and something in the toolchain touches it. I did not trace which dependency touches it, and no LTS runtime was tried, so I cannot say whether it also appears there. It has had no visible effect on builds or tests; prefer Node 22/24 LTS in production.

## Reproducing

```bash
npm install
npm run lint && npm run typecheck && npm test
npm run schema:validate && npm run seed:sanity:dry && npm run assets:check
npm run verify:contrast

NEXT_PUBLIC_SITE_URL=https://www.example.com npm run build && npm start      # terminal 1
U=http://localhost:3000
npm run verify:states        -- $U
npm run verify:interactions  -- $U
npm run verify:a11y          -- $U
npm run verify:seo           -- $U https://www.example.com
npm run verify:perf          -- $U
npm run verify:flowers       -- $U
node scripts/verify/overlay-contrast.mjs $U                    # + --stress white  /  --stress black
npm run dev                                                    # then, for hydration:
npm run verify:console -- http://localhost:3000
npm run verify:states  -- http://localhost:3000
```
