# ERA Residence — Animation Implementation Brief

**Reference:** https://www.era-residence.com/  (inspected live, 25 Oct 2026)
**Purpose:** hand-off for Claude Code to rebuild five specific experiences in Next.js (App Router) with GSAP + ScrollTrigger + Lenis.

## How this brief was produced, and how to read it

- Inspected in desktop Chrome at **1662 × 1080 CSS px, DPR 1**. All pixel numbers below are at that size unless stated.
- Evidence sources: rAF-sampled computed styles during the preloader, the live GSAP/ScrollTrigger registry (`ScrollTrigger.getAll()`), computed CSS and stylesheet rules, DOM trees, asset URLs, and screenshots at fixed scroll positions.
- Tags used throughout:
  - **[V] Verified** — read directly from the live page (computed style, ScrollTrigger vars, stylesheet rule, network/asset URL).
  - **[M] Measured** — sampled from the live page, but timing is run-dependent (±0.3–0.5 s); treat as a target, not a constant.
  - **[I] Inferred** — most likely explanation from observed behaviour.
  - **[E] Estimate** — my number; tune against the reference.
  - **[U] Unknown** — could not be determined.
- **Mobile caveat:** Chrome refused to shrink the window below ~1084 px wide, so I could not render a real phone viewport. Mobile notes come from the site's `@media` rules and class names ([V] for rules, [U] for resulting visuals). A real-device pass is listed in Section 12.

---

## 0. Ten findings that change how you should build this

1. **The hero is already fully rendered underneath the preloader.** It never enters from off-screen, never zooms in, and never moves as part of the reveal. The preloader is a fixed overlay with an **arch-shaped CSS mask hole** that grows until the hero is fully exposed. [V]
2. **The arch is driven by three CSS custom properties** — `--arch-w`, `--arch-h`, `--arch-y` — tweened by GSAP on the preloader element. `--arch-h` is always `--arch-w ÷ (560/2592)`. End state: `--arch-w: 125vw`, `--arch-y: -100vh`. [V]
3. **The flowers are not images, SVGs or CSS.** They are **transparent-alpha videos** (`.webm` for Chrome/Firefox, `.mov` HEVC-alpha for Safari), 1080×1080, `muted playsinline loop`, with an AVIF poster. There are 7 distinct clips used in 8 placements. [V]
4. **Flowers are placed per section, as children of each section's own container** (absolute, negative offsets, rotated/flipped), each with its own small scrubbed Y/X parallax. There is no shared global flower layer. [V]
5. **Clouds are three CSS-keyframe marquee layers**, time-based (not scroll-linked), moving **left** at 69.7 / 59.8 / 50.2 px/s, layered over an aerial photo that is the only thing parallaxed with scroll. [V]
6. **"The space to Live in"** is plain document-flow text in a cream dome (`border-radius: 50rem 50rem 0 0`), revealed on viewport entry by a char-flip (not scroll-scrubbed, not pinned). "Live in" is a different font (script) from THE / SPACE / TO. [V]
7. **The "two misaligned images" are one image seen through two clip-path windows.** Two cream overlay layers have polygon holes; the holes start 35 % of the frame apart vertically and slide into alignment, then merge, then the whole sticky stage scales 1.84×. [V]
8. **That whole sequence is one scrubbed timeline** on a `position: sticky` stage (not a GSAP pin), `start: "top bottom"`, `end: "200% top"` — a span of exactly 3 × viewport height. [V]
9. **Everything uses a viewport-relative `rem` system:** `html { font-size: 1vw }`, and design sizes are written as `Nrem / 16` on desktop (`/ 4.16` at ≤ 991 px). [V]
10. **Stack:** Webflow export + GSAP 3.15 (ScrollTrigger, SplitText, CustomEase) + Lenis 1.3.21 + Barba (page transitions) + lottie-web + Typekit fonts. [V]

---

## 1. Preloader and hero entrance sequence

### 1.1 What the user sees

1. A flat **burgundy screen** (`#340c24`) with a very faint oversized script monogram watermark that fades in during the first second.
2. A tall **arch** (rounded-top window) sits just below the fold, dips a little, then **rises into the centre**. Through the arch you see the sunny pool hero. Two thin concentric arch outlines frame it.
3. The arch **widens until it is wider than the viewport**, so the burgundy is pushed off all four sides and the hero fills the screen. At the same moment the hero title ("ERA RESIDENCE") flips in letter by letter.
4. The overlay is removed; Lenis scrolling is unlocked.

Total: about **4.2–4.8 s** on my connection.

### 1.2 Preloader DOM [V]

```
div.preloader.theme_on-dark            // position:fixed; z-index:11000; inset:0 0 -100vh 0 (extends 100vh below); display:none → block while loading
  div.preloader_ctn                    // z1; flex column; "Costa / Estepona / del Sol" + logo symbol + progress bar
    div.preloader_t > div.s_logo > div.logo_symbol (inline svg)
    div.preloader_c > div.grid > .preloader_title-l "Costa" | .preloader_logo (.preloader_a "Estepona", script) | .preloader_title-r "del Sol"
    div.preloader_b > .preloader_progress > .preloader_progress_fill
  div.preloader_bg_arch                // z2; absolute inset:0; flex column, align center
    div.preloader_bg_arch_is-1         // z1; bg #340c24; 1px outline; width arch-w×1.02; height arch-h×1.01; radius-top = arch-w
    div.preloader_bg_arch_is-2         // z0; bg #340c24; 1px outline; width arch-w×1.10; height arch-h×1.03
  div.preloader_bg                     // z0; bg #340c24 (absolute inset 0)
    div.preloader_bg_a > img           // monogram watermark SVG, opacity .05 (1440×864)
    div.preloader_bg_decor             // opacity 0→1 over ~1.3 s (the watermark fade-in)
```

The text block (`preloader_ctn`) is only on screen for the first moment: it was already `display:none` ~0.4 s after my sampler attached. [M] It is **not** the long-lived part of the preloader — the arch is.

### 1.3 The mask mechanism [V]

`.preloader` carries a **four-layer CSS mask** (white = overlay stays visible; transparent = see-through to the hero):

| Layer | Image | Position | Size |
|---|---|---|---|
| 1 left block | `linear-gradient(#fff,#fff)` | `0% 0%` | `calc(50% - arch-w/2) 100%` |
| 2 top block | `linear-gradient(#fff,#fff)` | `50% 0%` | `arch-w × max(arch-y,0)` (collapses to 0 height once the arch is above the top edge) |
| 3 right block | `linear-gradient(#fff,#fff)` | `100% 0%` | `calc(50% - arch-w/2) 100%` |
| 4 arch frame | `url(preloader_arch-l.svg)` | `50% arch-y` | `arch-w × arch-h` |

All layers `no-repeat`. Inline style on the preloader holds only the end state while idle: `--arch-y: -100vh; --arch-w: 125vw`.

Computed end-state values I read back: sizes `calc(50% - 1036.75px) 100%`, `2081.5px 0px`, `calc(50% - 1036.75px) 100%`, `2077.5px 9615.86px`; positions `0% 0%, 50% 0%, 100% 0%, 50% -1080px`. With `arch-w = 2077.5px` that means the side blocks are `50% − (arch-w/2 − 2px)` and the top block is `arch-w + 4px` — i.e. a **~2 px overlap** on each edge so no hairline shows between the blocks and the SVG. Keep that overlap. [V]

The SVG is a **560 × 2592** white frame with an arch-shaped hole, inset 16 units on each side:

```svg
<svg width="560" height="2592" viewBox="0 0 560 2592" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M560 2592H544V280C544 134.197 425.803 16 280 16C134.197 16 16 134.197 16 280V2592H0V0H560V2592Z" fill="white"/>
</svg>
```

Asset URL: `https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/6a23fd3e3546e70bdf8420a0_preloader_arch-l.svg`

The arch is 2592/560 = 4.63× taller than wide, so even a 36vw-wide arch extends far below the fold; only its rounded top is ever visible until it grows past the viewport.

### 1.4 Measured arch keyframes [M]

Sampled each frame with `requestAnimationFrame`. Time is seconds from when my sampler attached (~0.65 s after navigation). `arch-w` = measured outline width ÷ 1.02; `arch-y` back-computed from the element's top.

| t (s) | arch-w (px) | arch-w (vw) | arch-y (px) | Phase |
|---|---|---|---|---|
| 0.0 | ≈ 598 | 36.0 | 1080 (= 100vh) | Parked below the fold |
| 0.5 | ≈ 400 | 24.1 | ≈ 1118 | **Shrinks and dips** slightly further down (anticipation) |
| 1.0 | ≈ 448 | 27 | ≈ 887 | Starts rising |
| 1.5 | ≈ 588 | 35.4 | ≈ 213 | Rising fast |
| 2.05 | ≈ 632 | 38 | ≈ 138 | Arrives near the top-centre; **hold ends** |
| 2.22 | ≈ 699 | 42 | — | Expansion begins (slow) |
| 2.37 | ≈ 831 | 50 | — | Accelerating |
| 2.52 | ≈ 1192 | 72 | — | |
| 2.67 | ≈ 1579 | 95 | — | Wider than the viewport |
| 2.82 | ≈ 1759 | 106 | — | |
| 3.12 | ≈ 1935 | 116 | — | Ease-out tail |
| 3.72 | ≈ 2061 | 124 | → −1080 | Essentially at `125vw` / `-100vh` |
| ≈ 4.15 | — | — | — | `.preloader` set to `display:none` |

In a second run the same sequence started ~0.5 s later and ended at 4.73 s. [M] That difference suggests the sequence waits on real load (see 1.7).

### 1.5 Hero text entrance [M]

- Hero `<h1 data-scroll-reveal>` ("Era Residence") is split into words + chars (SplitText, 14 nodes). It is `visibility:hidden` until ~**1.84 s**, then each char animates **`rotateY(90deg)` → 0 and `opacity 0 → 1`**. First char took ≈ 1.45 s from first to last style change; chars are staggered. [M]
- Because no `perspective` is set on any ancestor, `rotateY(90deg)` renders as a **horizontal squash to zero width** — visually identical to `scaleX: 0 → 1`. [V: `perspective: none` on h1, word, char; `transform-style: flat`]
- Each char's `transform-origin` is its own centre (50 % 50 %). [V]
- The row "A PLACE · BY DAY — BY NIGHT · TO RETURN TO" (`.hero-s_tabs`) starts at `translateY(55.4px)`, `opacity 0` and eases to 0 / 1 on the same trigger. [M]
- "Estepona" (`.hero-s_logo_a`, script font) is permanently rotated **−12°** (`matrix(0.978, -0.208, 0.208, 0.978, …)`). [V]
- The hero reveal starts **just before the arch's fast expansion (~0.2 s earlier)** and finishes while the overlay is still on screen. [M]
- **The hero entrance is complete before scrolling is possible:** the text reveal ends at ≈ 3.3–3.9 s; Lenis is unlocked and the overlay removed at ≈ 4.2–4.7 s. The scroll-scrubbed hero timeline (§1.8) only begins afterwards, so the two never overlap. [M/V]

### 1.6 Chronological timeline

| Stage | Element | Initial state | Trigger | Animation | Final state |
|---|---|---|---|---|---|
| 0 | `html` | `wf-loading` | Document parse | Typekit loads Ambroise Francois Std + Sloop Script Three | `wf-active` (≈ 0.4 s) [M] |
| 1 | Page scroll | free | Fonts ready / `readyState: complete` | `html.lenis.lenis-stopped`, `overflow:hidden` (≈ 1.0 s) | Locked for entire preloader [V] |
| 2 | Preloader text/progress | visible | Page load | Shown briefly, then `display:none` | Gone by ≈ 1.0 s [M] |
| 3 | Watermark `preloader_bg_decor` | opacity 0 | Page load | opacity 0 → 1 over ≈ 1.3 s, ease-out | 1.0 (underlying `bg_a` stays 0.05) [M] |
| 4 | Arch (`--arch-w/h/y`) | 36vw wide, parked at 100vh | Fonts + load complete [I] | Shrink to ≈ 24vw with slight downward dip (~0.5–1 s) | 24vw @ y≈103vh |
| 5 | Arch | 24vw @ y≈103vh | Continues | Rise to y≈13vh while widening to ≈ 38vw (~1.5 s, ease in-out) | Arch top near upper third; hero visible inside [M] |
| 6 | Hero `<h1>` chars + tabs | hidden, rotateY 90°, opacity 0 | ≈ same time as the expansion starts [M] | Char flip (~1.2–1.45 s, stagger ≈ 50 ms) | Visible, identity transform |
| 7 | Arch (expansion) | 38vw @ y≈13vh | Continues | `--arch-w` → 125vw and `--arch-y` → −100vh (~1.7 s, strong in-out then out) | Whole viewport is hole; burgundy gone |
| 8 | Preloader | fixed overlay | Timeline complete | `display:none`, Lenis `start()` | Page scrollable (≈ 4.2–4.7 s) [V] |
| 9 | Hero container (`.hero-w_bg`) | scale 1, no translate | — | **No entrance animation at all** | Static until scroll [V] |

### 1.7 Is it a timed sequence or tied to loading?

- **Gated on real events [V]:** the fonts-active class (`wf-active`), `readyState: complete`, and Lenis initialisation all precede the arch moving.
- **Timed GSAP timeline after that [I]:** inside a single run every phase has a smooth, deterministic curve.
- **Evidence it waits on load:** the "parked" phase lasted ~0.5 s in one run and ~1.0 s in another with identical subsequent motion. [M]
- **No visible progress-bar-driven animation**: the progress fill was already at its end by the time I could sample it. [U] whether it tracks bytes loaded.

### 1.8 Scroll behaviour of the hero (post-preloader) [V]

Pinned by CSS: `.hero-scroll-area` (6231 px tall, `position:relative`) contains `.hero-w` (`position:sticky`, 1080 tall). One ScrollTrigger scrubs a timeline of duration 1:

- `trigger: .hero-scroll-area`, `start: "top top"`, `end: "bottom bottom"` (0 → 5151 px), `scrub: true`.

| Position in timeline | Target | Tween |
|---|---|---|
| 0.00 → 0.60 | `.hero-s` (text block) | `y: 0 → -790` @1080-high viewport (−899 @971), ease `"Ease"` |
| 0.00 → 0.60 | `.hero-w_bg` (image stack, 1662×1496) | `y: 0 → -416` @1080 (−525 @971), ease `"Ease"` |
| 0.40 → 1.00 | `.hero-w_bg` | `scale: 1 → 2`, `transformOrigin: "50% 75%"`, `translateZ: 10`, ease `"In"` |

**The two `y` end values are viewport-dependent, not constants.** I read them at two viewport heights (1080 and 971, both at 1662 wide) and they fit exactly:

- `.hero-w_bg` end `y = −(bgHeight − vh)` where `bgHeight = 1496` (the image is `100vw × 1495/1661`). I.e. the bg travels up by exactly its overflow, so its bottom edge lands on the viewport bottom: 1496 − 1080 = 416 ✓, 1496 − 971 = 525 ✓. [V, two data points]
- `.hero-s` end `y = bgY − 374 px` (−790 = −416 − 374; −899 = −525 − 374). 374 px = **22.5 vw** at 1662 wide (≈ `360rem/16`); the exact origin of the 374 is [E]. It pushes the text fully off the top.

Sampled mid-scroll (scrub is exact, viewport 971 high): at progress 0.1165 `.hero-s y = −253`, `.hero-w_bg y = −148`; at 0.25 → −634 / −370; at 0.5 → −884 / −516; from 0.6 on → −899 / −525; bg `scale` = 1.000 @ 0.5, 1.016 @ 0.6, 1.196 @ 0.8, 2.000 @ 1.0 (`power4.in` from 0.4). So the title travels up about 1.7× faster than the image, then the image punches in to 2× toward its lower-centre (the pool). Next, `.section.arch` (the light-blue dome with the curved text "Three reasons to choose ERA") rises over the hero between ≈ 3240 and 5151 px; its curved text animates `word-spacing: 0 → 10rem` over that range. [V]

Hero image assets (both 1661 × 1495 WebP):
- `…/6a25da81dce540a251389928_era-residence_gated-community_day.webp`
- `…/6a25da802c253b9e5e3d44f5_era-residence_gated-community_night.webp`
(prefix `https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/`)

### 1.9 How to rebuild it in Next.js

**Approach: one `<Preloader/>` client component, one GSAP timeline, one mask, CSS variables.** Do not animate `clip-path` on the hero.

1. **Never hide the hero.** Render `<Hero/>` normally in the server HTML. The preloader sits above it (`position:fixed; z-index:11000`). If JS fails the user still gets the hero after the fallback timeout.
2. **Initial state via CSS, applied before hydration** (avoids flashes and layout shift):
   - In `app/layout.tsx` add an inline `<script>` in `<head>` that sets `document.documentElement.classList.add('is-preloading')` (guard with `prefers-reduced-motion`).
   - CSS: `.is-preloading body{overflow:hidden}` and `.is-preloading [data-reveal]{visibility:hidden}`; `.preloader{display:none}` `.is-preloading .preloader{display:block}`.
   - `--arch-w:36vw; --arch-y:100vh` set as the preloader's initial inline style.
3. **Gating (what to await):** `document.fonts.ready`, `decode()` of the hero day image, and `window.load`; enforce a **minimum ~1.0 s** and a **hard timeout ~6 s** so it can never show indefinitely.
4. **Timeline (GSAP, inside `gsap.context` in `useLayoutEffect`):**

```ts
const tl = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete: finish });
const el = preloaderRef.current!;
tl.to('.preloader_bg_decor', { opacity: 1, duration: 1.3, ease: 'power2.out' }, 0)
  // shrink + dip
  .to(el, { '--arch-w': '24vw', '--arch-y': '103vh', duration: 0.6, ease: 'power3.inOut' }, 0.5)
  // rise
  .to(el, { '--arch-y': '13vh', '--arch-w': '38vw', duration: 1.5, ease: 'power3.inOut' }, 1.1)
  // hero text flips in as the hole starts to open
  .add(() => revealHero(), 2.0)
  // expand to cover the screen
  .to(el, { '--arch-w': '125vw', '--arch-y': '-100vh', duration: 1.7, ease: 'power4.inOut' }, 2.1);
// --arch-h derives from --arch-w in CSS: calc(var(--arch-w) / (560 / 2592))
```

   Treat every number as **[E]**; tune the timeline against the table in 1.4.
5. **Mask CSS** (use `-webkit-mask` prefixes too):

```css
.preloader{
  --arch-w:36vw; --arch-y:100vh;
  --arch-h:calc(var(--arch-w) / (560 / 2592));
  mask-image: linear-gradient(#fff,#fff), linear-gradient(#fff,#fff), linear-gradient(#fff,#fff), url(/preloader/arch.svg);
  mask-repeat: no-repeat;
  mask-position: 0 0, 50% 0, 100% 0, 50% var(--arch-y);
  mask-size:
    calc(50% - var(--arch-w) / 2 + 2px) 100%,
    calc(var(--arch-w) + 4px) max(var(--arch-y), 0px),
    calc(50% - var(--arch-w) / 2 + 2px) 100%,
    var(--arch-w) var(--arch-h);
}
```

   GSAP can tween custom properties on an element directly (`gsap.to(el, { '--arch-w': '125vw' })`). Register them with `CSS.registerProperty` (syntax `<length>`) if you see jumps in Safari.
6. **Hero reveal:** `SplitText` the h1 with `type: 'chars,words'`, set `{ opacity:0, scaleX:0 }` (equivalent to the verified `rotateY(90deg)` without perspective) → `{ opacity:1, scaleX:1, duration:1.2, stagger:0.05, ease:'power3.out' }`. Same for the tabs row: `y: 55 → 0`.
7. **Scroll lock:** create Lenis at mount and call `lenis.stop()` immediately; `lenis.start()` in `finish`. Also remove `is-preloading` there and call `ScrollTrigger.refresh()` once.
8. **Cleanup:** `ctx.revert()` on unmount; kill the fallback `setTimeout`; set the overlay to `display:none` (not just opacity) so it can't intercept pointer events.
9. **Reduced motion:** skip the whole sequence — no overlay, no char flip, hero immediately visible, Lenis enabled.
10. **Layout shift guard:** give the hero a fixed height (`100svh`/`100vh`), size the image with `fill` + `priority`, and don't let the preloader affect document flow (it is fixed).

---

## 2. Flower assets, placement and section mapping

### 2.1 What the user sees

Magenta bougainvillea sprays poking in from the corners of a few "storytelling" sections. They are **moving footage** (gentle sway, looped), cropped by the section edges, drifting slowly up/down or sideways as you scroll, and sitting **on top of** the cream backgrounds and partly over text/images.

### 2.2 What they are [V]

| Question | Answer | Evidence |
|---|---|---|
| Image, SVG, CSS, canvas, WebGL? | **`<video>` with alpha channel** | `<div class="flower …"><video class="video" muted playsinline loop …>` |
| Formats | `video/webm` first, then `video/mp4` pointing at a `.mov` (HEVC-with-alpha for Safari) | two `<source>` per video; `.mov` served as `video/quicktime` |
| Dimensions | **1080 × 1080** (square) | `video.videoWidth/Height` |
| Weight | `.mov` files are **7.8–10.3 MB each**; `.webm` sizes unknown | HEAD `content-length`; `.webm` HEAD blocked by CORS [U] |
| Poster | AVIF still of frame 1 (`poster` attr) | see 7.3 |
| Attributes | `muted playsinline webkit-playsinline loop disablepictureinpicture poster`, `preload="metadata"`, **no `autoplay`** | `getAttributeNames()`, `video.preload` |
| Playback control | Only videos near the viewport were playing (`paused:false`); all others `paused:true` | sampled at scroll 23400: the two arch-intro clips playing, six paused. Likely IntersectionObserver play/pause [I]; the code itself [U] |
| Reuse | **7 clips, 8 placements.** Clip `07` is used twice (arch-intro right and "other") | see table |

Base URL: `https://assets.era-residence.com/flowers/bougainvillea-flowers_0N.webm` and `.mov` for N = 01…07.

### 2.3 Placement spec

`.flower` base rule [V]: `position:absolute; z-index:1; pointer-events:none; width:calc(80px×10); height:same; inset:auto` where `80px` here means `80rem/16` → **50rem = 50vw = 831 px at 1662 wide**.

Offsets are written in `Nrem/16` (= N/16 vw) and nearly all include `− offset` (`offset-l = offset-r = 48rem/16 = 3vw = 50 px`, the page gutter). Positions are relative to the flower's **offset parent** (the wrapper named in the table), not the viewport.

| # | Class | Clip | Parent wrapper (section) | CSS offsets (desktop) | Transform | Scroll motion | Measured box @1662 [V] |
|---|---|---|---|---|---|---|---|
| 1 | `.flower.loc-info` | 01 | `.loc-info-w` — panel 1 of the horizontal track (§4 "The concept") | `top:-6rem; left:calc(-4rem - 3rem)` | none | `yPercent -10 → +10` | 831², left −66, top 7295 |
| 2 | `.flower.loc-intro` | 02 | `.loc-intro-w` — panel 2 (the "New Golden Mile" panel) | `bottom:-9rem; left:-14rem` | `rotate(90deg)` | `xPercent 0 → -25` over the horizontal scroll | 831², left 1379 at rest |
| 3 | `.flower.loc-path` | 03 | `.loc-path-w_flower` — inside the route-map panel (**static**, in flex flow) | `margin-top:-9rem; margin-right:-4rem; position:static` | `scaleX(-1)` | `yPercent 0 → +25` over the horizontal scroll | 831², track x ≈ 4496 |
| 4 | `.flower.apart-info` | 04 | `.apart-info-w` in section 7 ("A place to live — to return year after year / Residences range from 104…") | `bottom:-2rem; left:calc(-4rem - 3rem)` | `scaleY(-1)` | `yPercent -10 → +10` | 831², left −66, top 15328 |
| 5 | `.flower.interior` | 06 | `.interior-s_l_img-w` — wrapper of the left image in "The space to Live in" | `aspect-ratio:1; width:100%; right:0; top:-4rem` | none | `yPercent +10 → -10` (opposite to the others) | 665×668, left 0, top 18914 |
| 6 | `.flower.arch-intro-l` | 05 | `.arch-intro-s > .w_bg` (the sticky stage, §5) | `left:calc(-6rem - 3rem); bottom:-6rem` | `rotate(-150deg)` | **scale 1 → 1.84, xPercent 0 → −50** on the stage timeline (0.6 → 1.0) | box 1135² (rotated bounds), left −302 |
| 7 | `.flower.arch-intro-r` | 07 | same `.w_bg` | `right:calc(-3rem - 3rem); bottom:-6rem` | `rotate(65deg)` | **scale 1 → 1.84, xPercent 0 → +50** (0.6 → 1.0) | box 1104², left 794 |
| 8 | `.flower.other` | 07 | `.other-w` in section 11 (closing "A place to live" + developer block) | `top:0; right:calc(-10rem - 3rem)` | `rotate(45deg)` | `yPercent -10 → +10` | box 1175², left 825 |

Parallax tween spec (applies to rows 1, 4, 5, 8) [V]: `gsap.fromTo(el, {yPercent:-10}, {yPercent:10, ease:'none', scrollTrigger:{trigger: el, start:'top 125%', end:'bottom -25%', scrub:0.5}})` — row 5 uses the reverse (`+10 → -10`). Rows 2 and 3 are driven by the horizontal-scroll trigger on `.loc-scroll-area` (`start:'top top'`, `end:'bottom bottom'`, `scrub:0.25`; see §9.2).

Stacking: every flower is `z-index:1` inside its wrapper. Text blocks beside them are static (`position:static`/`relative`, z auto), so **flowers paint over text** wherever they overlap — keep text away from corners or let the flower overlap deliberately, as the reference does.

Responsive (≤ 991 px) [V rules]:
- `.flower { width/height: calc(40px×10) }` → `40rem/4.16×10 ≈ 96vw` — near full-width on mobile.
- `loc-info`: `left:calc(-32rem/4.16 - offset-r); top:calc(-48rem/4.16)`.
- `loc-intro`: `left:calc(-96rem/4.16); bottom:0; rotate(180deg)`.
- `apart-info`: `left:calc(-32rem/4.16 - offset-r)`.
- The horizontal track becomes a vertical column (`.loc-scroll-area_track{flex-flow:column}`, screen `position:static`), so flowers 2 and 3 no longer travel sideways. How they look on a phone is [U].

### 2.4 Which sections get flowers (page-wide map)

| Section (index · name · y@1662) | Flowers | Notes |
|---|---|---|
| 0 · Hero | — | photo-first; no botanicals |
| 1 · "Three reasons" blue dome | — | |
| 2 · Real-life location (slider) | — | |
| 3 · Walking paths | — | |
| **4 · The concept (horizontal scroll)** | **#1, #2, #3** | three different clips; one per panel; ties the text, the "boutique" statement and the route map together |
| 5 · New Golden Mile (clouds + aerial) | — | clouds take the "decorative" role here |
| 6 · Bedrooms / unit spec | — | |
| **7 · "A place to live — to return"** | **#4** | bottom-left, flipped vertically |
| 8 · Gated community / amenities | — | |
| **9 · The space to Live in** | **#5** | tucked at top-right of the left image |
| **10 · Architecture (two-image alignment)** | **#6, #7** | bottom-left + bottom-right pair; scaled out of frame |
| **11 · Closing + developer** | **#8** | top-right, rotated 45° |
| 12 · Contact CTA, 13 · Footer | — | dark/functional; none |

Rules the reference follows [I from the pattern]: flowers appear at **emotional/narrative beats on cream or burgundy backgrounds**, never on full-bleed photographic scenes; each placement uses a **different clip** except the intentional reuse of clip 07 (arch-intro right and "other"); each is **rotated or mirrored** so the same clip doesn't read as repeated.

**Shared layer vs per-section — recommendation: per-section.** Reasons from the evidence: (a) each flower is a child of a specific wrapper that moves (a horizontal track, a sticky stage, an image wrapper); (b) the arch-intro pair scales and moves with the stage's own timeline; (c) their parallax triggers use the flower itself as trigger. A fixed global layer would break all three. Build `<Flower variant="loc-info" />` that renders into the nearest positioned ancestor.

### 2.5 Implementation notes

```tsx
// components/Flower.tsx  (client)
export function Flower({ clip, className, style }: { clip: 1|2|3|4|5|6|7; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  useInViewPlayPause(ref, { rootMargin: '25% 0px' });  // IntersectionObserver → play()/pause()
  const n = String(clip).padStart(2, '0');
  return (
    <div className={`flower ${className ?? ''}`} style={style} aria-hidden>
      <video ref={ref} muted loop playsInline preload="metadata" disablePictureInPicture
             poster={`/flowers/poster-${n}.avif`}>
        <source src={`/flowers/bougainvillea-flowers_${n}.webm`} type="video/webm" />
        <source src={`/flowers/bougainvillea-flowers_${n}.mov`}  type='video/mp4; codecs="hvc1"' />
      </video>
    </div>
  );
}
```

- Keep the **WebM first** so Chrome/Firefox take it; Safari skips it and takes the HEVC `.mov`. Re-encode if you want smaller than 8–10 MB (e.g. 720×720 VP9-alpha, 24 fps, ~600–900 kB); they never render above ~831 px except the 1.84× scaled pair.
- Lazy-attach `src` when within ~1 viewport (the reference preloads metadata only) and always show the AVIF poster first.
- `useReducedMotion` → show poster only, no play.

---

## 3. Moving clouds section ("New Golden Mile, Estepona")

### 3.1 What the user sees

You leave the horizontal "concept" scene (route map across the top) and enter a cream-to-sky transition: **soft white clouds drift slowly from right to left in three layers at slightly different speeds**, over an **aerial photograph of Estepona** (mountains, coast, resort). As you scroll, the photo slides vertically and eases from slightly zoomed to normal, so the clouds feel like they are in front of the landscape. Title block "NEW GOLDEN MILE, ESTEPONA — Costa del Sol, Spain" sits at the bottom.

### 3.2 Layers, back to front [V]

Section 5: `section.section.clip.theme_on-color`, y 12688, 1454 tall → `.container` → `.loc-w` (`position:relative; z-index:2`, 50 px side padding).

| # | Element | Position / size @1662 | z | What it is |
|---|---|---|---|---|
| 0 | Section background | cream `#f3f3ec` | — | page colour |
| 1 | `.loc-w_bg` > `.loc-w_bg_img` | `.loc-w_bg` 1662×1454 at y 12469; inner `_img` is **oversized: 1911×1672 at x −125, y 12251** | auto | **Aerial photo** `era-residence-master-plan.webp` (1661×1454) + hotspot CMS (`.pins-cms`, z5) |
| 2 | `.loc-s` | 1562×237, absolute near bottom (y≈13905) | 1 | Title text + thin line (`.loc-w_decor.theme_on-brand`) |
| 3 | `.loc-w_clouds` #1 (`img.clouds.is-33`) | absolute; `left/right:-3vw` (full bleed); `top:-6rem` (≈ −100 px, i.e. starts **above** the section); height `37.5rem` = **623 px** | 4 | Cloud strip A |
| 4 | `.loc-w_clouds` #2 (`is-47`) | same box rules; height `30rem` = **499 px** | 4 | Cloud strip B |
| 5 | `.loc-w_clouds` #3 (`is-02`) | same; height 499 px | 4 | Cloud strip C (top-most of the three — later in DOM) |
| 6 | `.loc-w_over-grad` ×2 | absolute; `top:-1px; left/right:-3vw`; height = 3 grid cells + 2 gaps (332 px) | 5 | `linear-gradient(180deg, #f3f3ec 100% → #f3f3ec 0%)`; hides the hard top edge of the photo and softens the cloud tops into the cream |

Visual stacking: **cream → photo (parallaxed) → text → clouds A/B/C → top fade**. Clouds sit **above** the text block in z-order but are `pointer-events:none`.

Because the clouds start 100 px above the section and the cream gradient is 332 px, the clouds appear to emerge **out of the previous section's cream**, i.e. they straddle the boundary, creating one continuous scene. [V geometry]

### 3.3 Cloud assets and motion [V]

| Layer | File | Natural size | Rendered tile | Track width | Speed |
|---|---|---|---|---|---|
| `is-33` | `…/6a0fa3c60405a99c8530535e_img_clouds_33.avif` | 1662×929 | 1115×623 | 4458 | **−69.7 px/s** |
| `is-47` | `…/6a0fa3c6685d7bb04792137a_img_clouds_47.avif` | 1842×960 | 957×499 | 3827 | **−59.8 px/s** |
| `is-02` | `…/6a0fa3c6c9c3c584d9d78d85_img_clouds_02.avif` | 1546×960 | 803×499 | 3212 | **−50.2 px/s** |

(prefix `https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/`; all AVIF with alpha.)

Construction:

```html
<div class="loc-w_clouds">           <!-- absolute, full-bleed, z4 -->
  <div class="marquee">              <!-- position:relative; overflow:clip; display:flex -->
    <div class="marquee_track">      <!-- 2 lists × 2 items; animation: marquee 32s linear infinite reverse -->
      <div class="marquee_list"><img class="clouds is-33"><img class="clouds is-33"></div>
      <div class="marquee_list"><img class="clouds is-33"><img class="clouds is-33"></div>
    </div>
  </div>
</div>
```

```css
@keyframes marquee { 0% { transform: translateX(-50%) } 100% { transform: translateX(0%) } }
.marquee_track { animation: marquee 32s linear infinite reverse; display:flex; flex:0 0 auto }  /* reverse → 0 → -50%: moves LEFT */
.loc-w_clouds .marquee_list_item:nth-child(2n) { transform: scaleY(-1) }  /* every second tile is flipped vertically to hide repetition */
.clouds.is-33 { height: calc(60px * 10) }                 /* 60rem/16 ×10 = 37.5vw  */
.clouds.is-02, .clouds.is-47 { height: calc(48px * 10) }  /* 48rem/16 ×10 = 30vw    */
/* ≤991px [V rule]: calc(60px*5) / calc(48px*5) with px = rem/4.16 → ≈ 72vw / 57.7vw tall (relative to viewport width) */
```

- **Direction:** left (right-to-left). Measured by sampling `translateX` one second apart: −1355→−1425, −1163→−1223, −976→−1026 px.
- **Time-based, not scroll-linked.** `animationPlayState: running`, `iterationCount: infinite`, and **no GSAP tween targets the clouds**. They keep moving even when you stop scrolling and even when off-screen. [V]
- **All three layers share a 32 s period** but have different track widths, so speed is proportional to track width → three apparent depths for free. [V]
- One loop = half the track = 2 tiles = 2230 / 1913 / 1606 px; no seam because tile 1 and 3 are identical.

### 3.4 Scroll-linked parts [V]

| Target | Trigger range | Tween |
|---|---|---|
| `.loc-w_bg` (the photo wrapper) | `.loc-w`, `top bottom → bottom top`, `scrub 0.5` | `yPercent: -15 → +15`, `ease:none`, `translateZ:10` |
| `.loc-w_bg_img` | `.loc-w`, `top bottom → bottom bottom`, `scrub 0.25` | `scale: 1.15 → 1`, `transformOrigin: "center bottom"` (it is `runBackwards`, ease `"Ease"` ≈ CSS ease) |
| Clouds | — | **none** (they scroll 1:1 with the section while the photo moves at a different rate → parallax separation) |

So the depth cue = *clouds at 1× scroll + their own drift* vs *photo moving at a different rate (±15 % of its own height across the pass) plus a settling zoom from 1.15 to 1*.

### 3.5 Next.js implementation

- Build the three marquees with **pure CSS** (no GSAP). Use `next/image` (or plain `<img>` with explicit `width/height`) with `priority={false}`; decode AVIF. Duplicate the list once for a seamless loop exactly as above.
- Wrap the section in `position:relative; z-index:2`. Place clouds in an absolute full-bleed layer with `top:-6vw` so they straddle the previous section; set the parent `overflow: clip` on the **section** (not on `.loc-w`) so clouds can spill upward but not sideways.
- Photo: `will-change: transform`; inside the oversized `1911×1672` wrapper (`left:-125px` → `-7.5vw`; ≈ 115 % scale) so the parallax never reveals an edge.
- GSAP:

```ts
gsap.fromTo('.loc-w_bg', { yPercent: -15 }, { yPercent: 15, ease: 'none',
  scrollTrigger: { trigger: '.loc-w', start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
gsap.fromTo('.loc-w_bg_img', { scale: 1.15, transformOrigin: 'center bottom' }, { scale: 1, ease: 'power1.out',
  scrollTrigger: { trigger: '.loc-w', start: 'top bottom', end: 'bottom bottom', scrub: 0.25 } });
```

- Pause marquees when off-screen for battery: `animation-play-state: paused` via IntersectionObserver (the reference doesn't; this is an optional improvement).
- Reduced motion: `animation: none` and leave the clouds static.
- **Avoid:** WebGL/canvas/video here. Static alpha images + CSS translate reproduce it exactly.

---

## 4. "The space to Live in" layout and animation

### 4.1 What the user sees

A big **cream dome** (a half-circle top edge) slides up over the previous section. Centred in it, stacked in huge condensed serif capitals: **THE / SPACE / TO**, and below-right, overlapping the bottom of "TO", a flowing **script "Live in"** on a rising baseline. As the title enters the viewport each letter flips in. Two tall photos then drift past in opposite directions: the **left one** (framed by burgundy, with a bougainvillea clip over its top-right corner) and the **right one** (terrace), accompanied by a short description and a "View available apartments" round button.

### 4.2 Section frame [V]

Section 9 (`section.section.arch.clip`, index 9): y 17829 (at the 1080-tall measuring state), height 3438, background cream.

- `.section.arch` rule: `z-index:1; border-top-left-radius:50rem; border-top-right-radius:50rem` → **50vw radius = a perfect semicircular top**; the previous section shows through the corners.
- `.container` → `.interior-w` (50 px side padding, so content box 1562 wide) → `.interior-s`.
- Order inside `.interior-s`: `u-272` spacer (283 px = 17rem) → `.grid` containing `.interior-s_title` → `.interior-s_imgs` → spacer → gallery (`.interior-s_gallery-cms`) → spacer.

### 4.3 Title block geometry [V] (@1662 × 1080; page y at scroll 0)

`.interior-s_title`: x 524, y 18111, **615 × 645** — a centred grid cell (centre x = 831.5 = page centre).

| Line | Element | Font | Size / line-height / tracking | Box (x, y, w × h) | Align | Colour |
|---|---|---|---|---|---|---|
| "The" | `h2.h1 > .split-word` | **ambroise-francois-std** (Typekit), weight 400, `text-transform:uppercase` | **199.44 px (12rem = 12vw)**, lh **173.5 px (87.5 %)**, ls **−4.79 px (−0.024em)** | 728, 18111, 207 × 174 | centre | `#17233b` |
| "space" | same `h2` | same | same | 678, 18285, 307 × 174 | centre | |
| "to" | same `h2` | same | same | 761, 18458, 140 × 174 | centre | |
| "Live in" | **`h3.a1.a-center`** (inside `.interior-s_title_a`) | **sloop-script-three** (Typekit script), weight 400, **no** uppercase, no tracking | **199.44 px**, lh 199.44 px (100 %) | **617, 18555, 402 × 272**, `margin-top: 34.9px` | centre (optically shifted ≈ 13 px left of page centre) | `#17233b` |

- The three capital lines are **one `h2` with `<br>`s** — each word is its own inline-block (`.split-word`) so lines break exactly as THE / SPACE / TO.
- `h2` height 521 (3 × 173.5), spanning y 18111 → 18632. The script box starts at **y 18555**, i.e. **77 px above the bottom of the "TO" line box**, so the script's top/ascender zone overlaps the lower part of "TO" (visible in the screenshot: the "L" of "Live" tucks under the "O"). [V]
- Relative size: capitals and script are the **same font-size (199.44 px)**; the script *looks* bigger/lighter because it's a different face with a taller x-height and a 272 px-tall box. The three capital words differ only by their natural width.
- On ≤ 991 px [V rules]: `.interior-s_title{grid-area:1/1/2/5}` (title spans the full 4-col mobile grid) and `.interior-s_title_a{margin-top:calc(-40rem/4.16); margin-left:calc(-16rem/4.16)}` — the script line is pulled **up and left** so it hugs "TO". Mobile font sizes come from the `/4.16` token set; the resulting px values were not measurable here [U].

### 4.4 Entrance animation (time-based, once per entry) [V + M]

Both headings carry `data-scroll-reveal` and are split with SplitText (`.split-word` > `.split-char`, `aria-hidden` chars, `aria-label` on the parent for accessibility). The tween is **not scrubbed and not pinned**: it plays when the heading enters the viewport and finishes by itself. In my test it had not fired with the title just below the fold (title top at 1111 px of a 1080 px viewport) and fired as soon as I jumped to where the title top sat at ≈ 38 % from the viewport top; the exact `start` is therefore somewhere in between [U] — `top 85%` is my [E].

| Element | From | To | Duration | Stagger |
|---|---|---|---|---|
| `h2` chars (T,H,E,S,P,A,C,E,T,O) | `rotateY(90deg)`, `opacity:0`, origin = char centre | identity, `opacity:1` | **≈ 1.2 s** (6953 → 8138 ms measured) | **≈ 50 ms** per char (char 5 started +250 ms after char 0; char 9 +434 ms) |
| `h3` char(s) ("Live in") | `rotateX(-90deg)`, `opacity:0`, **origin = top centre** (`213px 0`) | identity, `opacity:1` | ≈ 1.2 s; started ≈ 0.3 s **before** the capitals (6657 ms vs 6953 ms) | n/a (my sample tracked the first child) |

Because there is no `perspective`, the rotateY looks like a squash-flip (`scaleX 0 → 1`) and the rotateX like `scaleY 0 → 1` from the top edge. Once done, the element keeps `transform: translate(0,0)`; no later scroll animation touches the text. [V: `gsap.getTweensOf` returns none; final inline `style="translate:none; rotate:none; scale:none; transform:translate(0px,0px); opacity:1"`]

It does **not replay** when scrolling back up and down again (the elements were already in their final state after scrolling away and back). [V]

### 4.5 Scroll-linked motion around the title [V]

| Target | Range | Tween |
|---|---|---|
| `.interior-s_l` (left image column, 773×1252 at x 50) | `top 125% → bottom -25%`, `scrub 0.5` | `yPercent -10 → +10` (±125 px) |
| `.interior-s_r` (right image column, 773×1252 at x 839) | same | `yPercent +10 → -10` — opposite direction |
| `.flower.interior` | same | `yPercent +10 → -10` |

At rest the two columns are offset (L top 18631, R top 18882 → R is 251 px lower than L); as they pass through the viewport they move **toward each other, cross, and separate**, which is why they look "misaligned then aligned". Nothing is pinned; the heading scrolls away normally.

### 4.6 Suggested DOM and CSS

```tsx
<section className="section arch" data-theme="on-brand" style={{ borderRadius: '50vw 50vw 0 0', background: 'var(--cream)' }}>
  <div className="container">
    <div className="interior-w">
      <div style={{ height: '17rem' }} />                          {/* u-272 */}
      <div className="grid">
        <div className="interior-s_title">                         {/* grid-column: 6 / 9 on desktop; centre */}
          <h2 className="h1 a-center" data-reveal="chars" aria-label="The space to">
            The<br />space<br />to
          </h2>
          <div className="interior-s_title_a">
            <h3 className="a1 a-center" data-reveal="chars-x" aria-label="Live in">Live in</h3>
          </div>
        </div>
      </div>
      <div className="interior-s_imgs"> … left/right columns with parallax … </div>
    </div>
  </div>
</section>
```

```css
.h1 { font: 400 12vw/0.875 'ambroise-francois-std', sans-serif; letter-spacing:-0.024em; text-transform:uppercase; text-align:center }
.a1 { font: 400 12vw/1 'sloop-script-three', cursive; margin-top: 2.1vw; /* 34.9px @1662 */ }
.interior-s_title_a { margin-top: 0 }    /* desktop; mobile: -40/4.16 rem top, -16/4.16 rem left */
```

```ts
// reveal
const split = SplitText.create(h2, { type: 'words,chars', charsClass: 'split-char', wordsClass: 'split-word' });
gsap.set(split.chars, { opacity: 0, scaleX: 0 });                    // visual equal to rotateY(90deg) w/o perspective
ScrollTrigger.create({ trigger: h2, start: 'top 85%', once: true,
  onEnter: () => gsap.to(split.chars, { opacity: 1, scaleX: 1, duration: 1.2, stagger: 0.05, ease: 'power3.out' }) });
const s3 = SplitText.create(h3, { type: 'chars' });
gsap.set(s3.chars, { opacity: 0, scaleY: 0, transformOrigin: '50% 0%' });
// …same trigger, start ≈ 0.3 s earlier
```

(The exact ScrollTrigger `start` and ease are [U]; `top 85%` / `power3.out` reproduce the measured opacity curve — 0.86 at 38 % of the duration — to within a few percent [E].)

Use `document.fonts.ready` before `SplitText` so the line breaks (`<br>`) and char widths are final, then call `ScrollTrigger.refresh()`.

---

## 5. Two-image alignment and zoom transition (the "Architecture" intro)

### 5.1 What the user sees

On a cream page, **two portrait photo windows** hang side by side, the left one noticeably lower than the right (a staggered, "misaligned" diptych). Magenta bougainvillea fills the bottom-left and bottom-right corners. As you scroll, the windows **slide toward each other vertically until they sit at the same height**, then the narrow gap between them **closes so they become one wide picture**, and finally the whole frame **zooms in (≈ 1.84×)** until the photo bleeds off every edge while the flowers swell and are thrown out past the left/right edges. You land on a full-bleed architecture photo with the giant word **ARCHITECTURE** across the top.

### 5.2 What it actually is [V]

> **One photo. Two cream overlays with rectangular holes. The holes move.**

The "two images" are not two images. They are two **windows cut by `clip-path` into two cream (`#f3f3ec`) overlay panels**, both showing the *same* photo (`img_cam_02.webp`) that lies underneath. Because it is one continuous photo seen through two holes that sit side by side, the picture reads as one scene broken into a staggered pair; when the holes align and merge it becomes a single clean rectangle.

### 5.3 Stacking order (back → front) [V]

```
section.section.clip                              (index 10, y≈21267 @1080 vh)
 └ .container
    └ .arch-scroll-area           position:relative; 3983 px tall (≈ 3.7 vh); the scroll runway
       ├ .arch-intro-s.b-desk     position:sticky; top:0; z-index:1; height:100vh; margin-bottom:-100vh   ← the "stage"
       │   └ .w_bg                absolute; inset to full-bleed (1662 × 100vh); z0
       │       ├ .arch-intro-s_bg_l     absolute; left:0;  width 50 %; height 100vh + ~11px; top −11px; bg #f3f3ec; clip-path polygon (hole A)
       │       ├ .arch-intro-s_bg_r     absolute; left:50%;width 50 %; same height/top;       bg #f3f3ec; clip-path polygon (hole B)
       │       ├ .flower.arch-intro-l   (video 05) z1, absolute, bottom-left, rotate(-150deg)
       │       └ .flower.arch-intro-r   (video 07) z1, absolute, bottom-right, rotate(65deg)
       ├ .arch-w.theme_on-color   position:sticky; top:0; 1562 × 1823 @1662; initial scale .75, origin "center top"   ← the photo + title
       │   ├ .arch-s (z1)         .arch-s_t  "ARCHITECTURE" (giant) + .arch-s_b  (copy, architects, CTA)
       │   └ .w_bg > .img-w       overflow:clip; <img img_cam_02.webp> with its own yPercent parallax
       ├ ._100vh.b-desk ×2        two 100vh spacers (scroll length)
       └ .arch_themes             header colour-theme triggers
```

Two non-obvious facts: (1) the stage has `margin-bottom:-100vh`, so the **photo layer starts at the same y as the stage and sits under it**; (2) the stage is **CSS `position:sticky`**, not a GSAP pin — the ScrollTrigger list shows `pin: none`. [V]

### 5.4 Scroll range [V]

One ScrollTrigger on the stage: `trigger: .arch-intro-s`, `start: "top bottom"`, `end: "200% top"`, `scrub: true`; timeline duration 1.

With viewport height `vh`: `start = stageTop − vh`, `end = start + 3·vh` (at 1662×1080: **20187 → 23427 px**). So `p = (scrollY − start) / (3·vh)`. CSS-sticky engages once the stage top reaches the viewport top, at **p = ⅓** (21267), and it stays stuck until the runway ends (24170 → p ≈ 1.23). Everything below happens while the stage is stuck except the first third, which plays as the stage scrolls up into view.

### 5.5 Timeline [V] (copy these literally)

All tweens `ease: "none"`.

| Position | Duration | Target | From → To |
|---|---|---|---|
| 0.00 | 0.50 | `.arch-intro-s_bg_l` clip-path | `polygon(0% 0%, 0% 100%, 44.444% 100%, 44.444% 36.111%, 98.889% 36.111%, 98.889% 99.074%, 44.444% 99.074%, 1.111% 100%, 100% 100%, 100% 0%)` → `…44.444% 18.519%, 98.889% 18.519%, 98.889% 81.481%, 44.444% 81.481%, 1.111% 100%…` |
| 0.00 | 0.50 | `.arch-intro-s_bg_r` clip-path | `polygon(0% 0%, 0% 100%, 1.111% 100%, 1.111% 0.926%, 55.556% 0.926%, 55.556% 63.889%, 1.111% 63.889%, 1.111% 100%, 100% 100%, 100% 0%)` → `…1.111% 18.519%, 55.556% 18.519%, 55.556% 81.481%, 1.111% 81.481%, 1.111% 100%…` |
| 0.50 | 0.10 | `bg_l` clip-path | window's **right edge** `98.889% → 100%` (two points) |
| 0.50 | 0.10 | `bg_r` clip-path | window's **left edge** `1.111% → 0%` (all four `1.111%` points) → `polygon(0% 0%, 0% 100%, 0% 100%, 0% 18.519%, 55.556% 18.519%, 55.556% 81.481%, 0% 81.481%, 0% 100%, 100% 100%, 100% 0%)` |
| 0.60 | 0.40 | `.arch-intro-s` (stage) | `scale 1 → 1.84` |
| 0.60 | 0.40 | `.flower.arch-intro-l` | `scale 1 → 1.84`, `xPercent 0 → −50` |
| 0.60 | 0.40 | `.flower.arch-intro-r` | `scale 1 → 1.84`, `xPercent 0 → +50` |
| 0.60 | 0.40 | `.arch-w` (photo) | `scale 0.75 → 1`, `transformOrigin: "center top"` (starts at 0.75 via `startAt`) |

I verified the interpolated values by scrubbing the live page (read back from computed `clip-path` and `gsap.getProperty`):

| p | hole A (x1 y1 x2 y2, % of left panel) | hole B (x1 y1 x2 y2, % of right panel) | stage scale | photo scale | flower-L scale / xPercent |
|---|---|---|---|---|---|
| 0.00 | 44.4 · 36.1 · 98.9 · 99.1 | 1.1 · 0.9 · 55.6 · 63.9 | 1.00 | 0.75 | 1.00 / 0 |
| 0.25 | 44.4 · 27.3 · 98.9 · 90.3 | 1.1 · 9.7 · 55.6 · 72.7 | 1.00 | 0.75 | 1.00 / 0 |
| 0.50 | 44.4 · 18.5 · 98.9 · 81.5 | 1.1 · 18.5 · 55.6 · 81.5 | 1.00 | 0.75 | 1.00 / 0 |
| 0.55 | 44.4 · 18.5 · **99.4** · 81.5 | **0.6** · 18.5 · 55.6 · 81.5 | 1.00 | 0.75 | 1.00 / 0 |
| 0.60 | 44.4 · 18.5 · **100** · 81.5 | **0** · 18.5 · 55.6 · 81.5 | 1.00 | 0.75 | 1.00 / 0 |
| 0.80 | same as 0.60 | same | **1.42** | **0.87** | 1.42 / −24.9 |
| 1.00 | same | same | **1.84** | **1.00** | 1.84 / −50 |

### 5.6 Frame-by-frame at 1662 × 1080 [V math + screenshots]

Stage `.w_bg` is 1662 × 1080; each overlay is 831–832 px wide and ≈ 1091 px tall (11 px of bleed at the top).

Hole coordinates in px (left panel x from 0, right panel x from 831; y measured from the overlay's own top, which sits 11 px above the screen top — subtract 11 for screen y):

- **Hole A (left), p=0:** x 370 → 823, y ≈ 394 → 1081 (453 × 687).
- **Hole B (right), p=0:** x 840 → 1293, y ≈ 10 → 697 (453 × 687).
- **Aligned (p ≥ 0.5):** both y ≈ 202 → 889. Both holes move by ±17.6 % of the panel height (**≈ ±192 px**); total vertical offset at the start is **≈ 384 px** (A lower than B).
- **Merged (p ≥ 0.6):** one window x 370 → 1293 × y 202 → 889 = **923 × 687**, centred on the viewport, with no seam.

| Progress | Image A (left window) | Image B (right window) | Flowers | Section state |
|---|---|---|---|---|
| **0** (scrollY ≈ 20187 — stage just entering from the bottom edge) | x 370–823 · y 394–1081 (low) | x 840–1293 · y 10–697 (high) | Rest: L bottom-left (rot −150°), R bottom-right (rot 65°), 831-ish px each, scale 1 | Staggered diptych on cream; stage still scrolling up with the page |
| **⅓** (21267 — stage touches top; sticky engages) | y 266–953 | y 138–825 | unchanged | Offset has closed by ⅔ of the 0.5-unit tween: ≈ 128 px between windows |
| **0.5** (21807) | y 202–889 | y 202–889 | unchanged | **Aligned**: two equal windows at the same height, 17 px-wide gap in the middle (gap = 9 px each side of centre) |
| **0.55** (21969) | right edge creeping 98.9 → 99.4 % | left edge creeping 1.1 → 0.6 % | unchanged | **Gap closing** |
| **0.6** (22131) | right edge 100 % | left edge 0 % | unchanged | **One 923 × 687 picture**, no seam; photo layer beneath is still at 0.75 scale |
| **0.8** (22779) | window now ×1.42 → ≈ 1310 × 976 | merged | scale 1.42² ≈ 2.0 (stage × own tween), xPercent −25 / +25, flying outward | Zoom mid-way; cream margins shrinking; photo at 0.87 |
| **1.0** (23427) | window ×1.84 ≈ 1697 × 1264 > viewport | merged | combined scale **1.84² ≈ 3.39× (3843 px wide for a 1135 px box)**, xPercent ∓50 → both pushed far off-screen | **Cream is gone**; full-bleed photo at scale 1 with ARCHITECTURE; ScrollTrigger complete |
| After 1.0 | — | — | Off-screen, then the stage releases at ≈ p 1.23 | Photo block (`.arch-w`) keeps scrolling: giant "ARCHITECTURE" at top → copy ("The architecture of ERA Residences balances clean contemporary lines with Mediterranean warmth and texture", "By Schermann Weyers architects", round "Book a call now") → cream "A place to live — to return year after year" → "Developer" with flower #8 |

Flower note (verified, important): the flowers are **children of the stage** (`.arch-intro-s > .w_bg`) *and* have their own `scale 1.84` tween. The stage scales 1.84 and the flower scales another 1.84, so the **combined scale is 3.39×** (measured 1135 px → 3843 px). Before p = 0.6 they are **stationary relative to the stage** (they scroll with the page until the stage sticks, then stay put in the viewport). They **do not move with the image windows**: windows move vertically; flowers don't until 0.6, then explode outward. They never overlap the final aligned composition because they leave the frame by p≈1.

### 5.7 Reverse scroll [V]

`scrub: true` → state is a pure function of `scrollY`. Scrolling up exactly rewinds every tween (holes un-merge, offset re-opens, stage shrinks). No time-based component.

### 5.8 Recommended implementation

**Keep this as is — a single scrubbed timeline on a CSS-sticky stage.** A GSAP `pin` is unnecessary and risks pin-spacer jumps; the reference uses sticky + a tall runway.

```tsx
// ArchitectureIntro.tsx  (client)
export function ArchitectureIntro() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root);
      const stage = q('.arch-intro-s')[0], L = q('.bg_l')[0], R = q('.bg_r')[0];
      const fl = q('.flower-l')[0], fr = q('.flower-r')[0], photo = q('.arch-w')[0];

      const poly = (x1: number, y1: number, x2: number, y2: number, xx = 1.111) =>
        `polygon(0% 0%, 0% 100%, ${x1}% 100%, ${x1}% ${y1}%, ${x2}% ${y1}%, ${x2}% ${y2}%, ${x1}% ${y2}%, ${xx}% 100%, 100% 100%, 100% 0%)`;

      gsap.set(L, { clipPath: poly(44.444, 36.111, 98.889, 99.074) });
      gsap.set(R, { clipPath: poly(1.111, 0.926, 55.556, 63.889) });
      gsap.set(photo, { scale: 0.75, transformOrigin: 'center top' });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: stage, start: 'top bottom', end: '200% top', scrub: true, invalidateOnRefresh: true },
      });
      // 1) slide windows into alignment
      tl.to(L, { clipPath: poly(44.444, 18.519, 98.889, 81.481), duration: 0.5 }, 0)
        .to(R, { clipPath: poly(1.111, 18.519, 55.556, 81.481), duration: 0.5 }, 0)
        // 2) close the seam
        .to(L, { clipPath: poly(44.444, 18.519, 100, 81.481), duration: 0.1 }, 0.5)
        .to(R, { clipPath: poly(0, 18.519, 55.556, 81.481, 0), duration: 0.1 }, 0.5)
        // 3) zoom
        .to(stage, { scale: 1.84, duration: 0.4 }, 0.6)
        .to(photo, { scale: 1, duration: 0.4 }, 0.6)
        .to(fl, { scale: 1.84, xPercent: -50, duration: 0.4 }, 0.6)
        .to(fr, { scale: 1.84, xPercent: 50, duration: 0.4 }, 0.6);
    });
    return () => mm.revert();
  }, []);
  /* markup: see §8 */
}
```

CSS essentials:

```css
.arch-scroll-area { position: relative; }                       /* height ≈ 3.7 × 100vh: stage + photo + two 100vh spacers */
.arch-intro-s { position: sticky; top: 0; height: 100vh; margin-bottom: -100vh; z-index: 1; }
.arch-intro-s .w_bg { position: absolute; inset: 0; }           /* full-bleed (ignore the 50px container padding) */
.bg_l, .bg_r { position: absolute; top: -11px; height: calc(100% + 11px); width: 50%; background: #f3f3ec; }
.bg_l { left: 0 } .bg_r { left: 50% }
.arch-w { position: sticky; top: 0; will-change: transform; }   /* photo: width = content box (1562 @1662), image 1661×1246 with its own yPercent parallax */
.arch-w .img-w { overflow: clip }
```

Pitfalls and how to avoid them:

- **Distortion:** only `scale` is applied to the photo and stage (uniform), never width/height. The photo is an `object-fit: cover` image inside `overflow:clip`. Keep `aspect-ratio` on the wrapper.
- **Seam flicker / hairline between the two panels:** panels are exactly 50 % each; after the merge both holes extend to the shared edge (`100 %` / `0 %`). Make the panels overlap 1px (`width: calc(50% + 1px)`) if you see a hairline during 0.5–0.6.
- **Layout shift:** all sizes are `vh/vw/%`-based; the stage uses `100vh` (use `100svh` for mobile browsers); do **not** read pixel sizes at build time.
- **Resize jumps:** `invalidateOnRefresh: true` + `ScrollTrigger.refresh()` after `document.fonts.ready` and after the photo `decode()`s; debounce `resize`. Because the polygons are percentages nothing needs recomputing.
- **Scroll jumps at the stage hand-off:** CSS sticky handles it; don't add `pinSpacing`.
- **Perf:** `will-change: transform, clip-path` on stage and overlays only while in range (set via `onToggle`), `transform: translateZ(0)` is fine; videos pause outside the viewport.
- **Don't** replace the clip-path trick with two `<img>` elements: you would have to animate crop positions and the final merge would show a seam.

### 5.9 Responsive and reduced motion

- **≤ 991 px:** `.arch-intro-s.b-desk` is `display:none` [V], so **the whole window-alignment + flower pair does not exist on tablet/phone**. `.arch-w` becomes `position:relative`, `.arch-s{aspect-ratio:2/6}`, and copy/CTA are placed in a 4-col grid. [V rules] Resulting visuals [U]. Recreate by **not rendering** the intro at that breakpoint.
- **Reduced motion:** render only `.arch-w` (no overlays, no flowers, no scale).

---

## 6. Shared visual tokens, positioning rules and animation conventions

### 6.1 Unit system [V]

- `html { font-size: 1vw }` (16.62 px at 1662 wide; 10.84 px at 1084 wide).
- Design size `N` is written `calc(Nrem / var(--scale-ratio))`. Desktop `--scale-ratio: 16` (design canvas 1600 px). **≤ 991 px: `--scale-ratio: 4.16`** (design canvas ≈ 416 px), `offset-l/r` = 24 design-px, and `100vh` → `100svh`.
- Helpers: `--80px = 80rem/16`, `--60px`, `--48px`, `--40px`… ⇒ `--Npx = N/16 vw` on desktop.
- Page gutter `offset-l = offset-r = 48rem/16 = 3vw` (50 px @1662). Spacer tokens `u-32/48/96/160/272` = N/16 vw.

Convenience in Tailwind/CSS: `--u: calc(100vw / 1600)` on desktop and `calc(100vw / 416)` ≤ 991 px; write sizes as `calc(N * var(--u))`.

### 6.2 Colours [V]

| Token | Value |
|---|---|
| Cream / page bg (`base-0--100`) | `#f3f3ec` |
| Navy text (`base-1000--100`) | `#17233b` |
| Brand light-blue (`theme_on-brand` bg) | `#b5cedb` (rgb 181, 206, 219) |
| Preloader burgundy | `#340c24` (rgb 52, 12, 36) |
| Landscape-cover (orientation warning) | `#17233b` |

### 6.3 Fonts [V]

- Display: **`ambroise-francois-std`** (Adobe Fonts / Typekit kit `pig8glj`) — all caps, condensed high-contrast serif.
- Script accents ("Estepona", "Live in"): **`sloop-script-three`** (Typekit).
- Body/UI: **"Maison Neue Extended"**, Arial, sans-serif.

| Style | Size (desktop) | Line-height | Tracking | Used for |
|---|---|---|---|---|
| h1 | 192 rem/16 = **12vw** (199.4 px) | 87.5 % | −0.024em | Hero title, THE SPACE TO, NEW GOLDEN MILE |
| h2 | 136 rem/16 = 8.5vw | 88.235 % | −0.024em | |
| h3 | 96 rem/16 = 6vw | 91.667 % | −0.024em | |
| h4 | 63 rem/16 = 3.94vw (65.4 px) | 88.889 % | −0.016em | "Era Residences is a boutique gated community…" (uppercase, centred, 931 px wide) |
| h5 | 40 rem/16 = 2.5vw | 100 % | −0.008em | Hero "A PLACE · … · TO RETURN TO" |
| h6 | 28 rem/16 = 1.75vw | 100 % | 0 | |
| p1 | ≈ 13.5 px, lh 18.6 px, ls −0.32 px | | | Paragraph copy |
| a1 (script) | = h1 size, lh 100 % | | normal | "Live in", "Estepona" |

### 6.4 Easing vocabulary [V — sampled]

The site registers named CustomEases `Ease`, `In`, `Out`, `InOut`, `horScroll`. Sampled values at x = 0.1 / 0.25 / 0.5 / 0.75 / 0.9, and the best match I found:

| Name | Samples | Best equivalent |
|---|---|---|
| `Ease` | .095 / .408 / .802 / .960 / .994 | **`cubic-bezier(.25,.1,.25,1)`** (CSS `ease`) — fit error ≈ 1e-6 |
| `In` | .000 / .006 / .066 / .312 / .653 | **`power4.in`** |
| `Out` | .347 / .688 / .934 / .994 / 1 | **`power4.out`** |
| `InOut` | .007 / .054 / .500 / .946 / .993 | **`cubic-bezier(.75,0,.25,1)`** (≈ power3.inOut) — fit error ≈ 2e-7 |
| `horScroll` | .040 / .183 / .500 / .817 / .960 | **`cubic-bezier(.25,0,.75,1)`** — fit error ≈ 9e-7 |

```ts
CustomEase.create('era-ease',  '.25,.1,.25,1');
CustomEase.create('era-inout', '.75,0,.25,1');
CustomEase.create('era-hor',   '.25,0,.75,1');
```

### 6.5 Conventions repeated across the site [V]

- **Parallax idiom:** target = the element (or its image); `fromTo {yPercent: -10…-15} → {+10…+15}`; `ease:'none'`; `scrub: 0.5`; `start:'top 125%'`, `end:'bottom -25%'`; `translateZ:10` to force a compositing layer. Opposite directions on paired columns.
- **Scrub smoothing:** `scrub: true` for sticky/pinned storytelling timelines; `0.25–0.5` for decorative parallax.
- **Char reveal:** elements with `data-scroll-reveal` are SplitText'd on init; chars `rotateY(90deg)` or `rotateX(-90deg)` + opacity 0 → identity, ≈ 1.2 s, ≈ 50 ms stagger. Hero reveals before the preloader finishes; other headings reveal on viewport entry.
- **`data-prevent-flicker`** on the hero h1 (a hide-until-split guard). [I]
- **Sticky, not pin:** hero (`.hero-w`), architecture stage (`.arch-intro-s`), horizontal track (`.loc-scroll-area_screen`) are all `position:sticky` inside a tall wrapper. `pin` is not used by any trigger in the five areas. [V]
- **Header theming:** dozens of ScrollTriggers (the registry has ≈ 40 with this pattern) with `start: "top top+=<header-mid>"` flip the fixed header between on-color / on-brand / on-dark themes as sections pass. [V]
- **Section shapes:** `.section.arch` = `border-top-radius:50rem` dome that overlaps the previous section; `.clip` = `overflow:clip`.
- **Hit-testing:** decorative layers all `pointer-events:none`.

---

## 7. Verified asset URLs and source evidence

### 7.1 Libraries (script tags) [V]

| Library | Source |
|---|---|
| GSAP 3.15 | `cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js` (`gsap.version === "3.15.0"`) |
| ScrollTrigger | `…/gsap@3.15/dist/ScrollTrigger.min.js` |
| SplitText | `…/gsap@3.15/dist/SplitText.min.js` |
| CustomEase | `…/gsap@3.15/dist/CustomEase.min.js` |
| Lenis | `unpkg.com/lenis@1.3.21/dist/lenis.min.js` (global `lenis` instance; `html.lenis`, `.lenis-stopped`) |
| Barba | `unpkg.com/@barba/core` (`.transition-wrapper` / `main.transition-container`) |
| lottie-web | `…/lottie-web@5.12.2/build/player/lottie.min.js` |
| Webflow runtime + jQuery 3.5.1 | site is a Webflow export |
| Typekit | `use.typekit.net/pig8glj.js` |
| Slater | `assets.slater.app/slater/20164.js` (hosts the custom animation script — the actual source was not retrievable [U]) |

No Three.js, canvas or WebGL is used for any of the five areas. [V: `window.THREE` undefined; no `<canvas>` in these sections]

### 7.2 Image assets (prefix `https://cdn.prod.website-files.com/6a068da7ad91b057365bf967/`) [V]

| Role | File | Natural size |
|---|---|---|
| Hero (day) | `6a25da81dce540a251389928_era-residence_gated-community_day.webp` | 1661×1495 |
| Hero (night) | `6a25da802c253b9e5e3d44f5_era-residence_gated-community_night.webp` | 1661×1495 |
| Preloader arch mask | `6a23fd3e3546e70bdf8420a0_preloader_arch-l.svg` | 560×2592 |
| Preloader watermark | `6a2311bd477167bbc41c9c03_e22485744735d6f17214f25b6157e9b5_preloader_bg.svg` | 1440×864 |
| Cloud A | `6a0fa3c60405a99c8530535e_img_clouds_33.avif` | 1662×929 |
| Cloud B | `6a0fa3c6685d7bb04792137a_img_clouds_47.avif` | 1842×960 |
| Cloud C | `6a0fa3c6c9c3c584d9d78d85_img_clouds_02.avif` | 1546×960 |
| Aerial / master plan | `6a15185e6803ae588479d12b_era-residence-master-plan.webp` | 1661×1454 |
| Interior left | `6a1571e51d50c8bcf5f4bb3d_era-residence-garden-2.webp` | 1661×2216 |
| Interior right | `6a15723f346e4b3a6c0af26a_era-residence-terrace.webp` | 1661×2080 |
| Architecture photo | `6a0f8994091fd12c24e79c8a_img_cam_02.webp` | 1661×1246 |

### 7.3 Flower assets [V]

Base: `https://assets.era-residence.com/flowers/`

- Video: `bougainvillea-flowers_01 … _07` with `.webm` and `.mov` extensions (1080 × 1080; `.mov` 9.3 / 10.3 / 9.4 / 8.9 / 7.8 / 9.0 / 10.3 MB).
- Posters (AVIF, Webflow CDN prefix above): `6a4afbe9f3a19844a4b0caed_bougainvillea-flowers_01.avif`, `6a4afbe941e5e917a8f84c4a_…_02.avif`, `6a4afbe988f8dc3c9bb1647a_…_03.avif`, `6a4afbe98eb07b9ca5b07e84_…_04.avif`, `6a4afbe9a4873ec6185f295d_…_05.avif`, `6a4afbe968be0cc0c1f5fef2_…_06.avif`, `6a4afbe9f3a19844a4b0caf0_…_07.avif`.

I did **not** download any assets. Fetch them yourself from the URLs above (check the site's terms before reusing the media in production; for a recreation, generate your own alpha clips/images).

### 7.4 ScrollTrigger inventory relevant to the five areas [V] (@1662 × 1080; 178 triggers total, 194 at 1084 px)

| Area | Trigger | Range (px) | Scrub | Animation |
|---|---|---|---|---|
| Hero | `.hero-scroll-area` | 0 → 5151 | true | `.hero-s y −790` · `.hero-w_bg y −416` · `.hero-w_bg scale 1→2 @50% 75%` |
| Hero→dome | `.benefits-intro-w` | 3240 → 5151 | true | curved text `word-spacing 0 → 10rem` |
| Concept (horizontal) | `.loc-scroll-area` (start `2.5% top`, end `97.5% bottom`) | 7608 → 11477 | 0.25 | `.loc-scroll-area_track x: 0 → −3598` ease `horScroll`; `.loc-intro-s_title_line` xPercent per line; `.flower.loc-intro xPercent 0→−25`; `.flower.loc-path yPercent 0→25` |
| Concept panel 1 | `.loc-info-w` | `top 30% → bottom bottom` | 0.5 | `.loc-info-s` opacity 0→1, scale .75→1 |
| Route map | `img.loc-path` | `left bottom` | — | `clipPath inset(0 100% 0 0) → inset(0)` over 2.4 s, ease `Out` (time-based once in view) |
| Clouds | `.loc-w` | 11608 → 14142 | 0.5 / 0.25 | `.loc-w_bg yPercent −15→15`; `.loc-w_bg_img scale 1.15→1 @ center bottom` |
| Flowers (single) | each `.flower` | `top 125% → bottom −25%` | 0.5 | `yPercent ±10` |
| Space to Live in | `.interior-s_l` / `.interior-s_r` | same | 0.5 | `yPercent ∓10 → ±10` |
| Two-image stage | `.arch-intro-s` | 20187 → 23427 | true | see §5.5 |
| Architecture photo | `.arch-scroll-area` (start `55% top`, end `bottom top`) | 23458 → … | true | `img yPercent → +25` (start value not captured, presumably 0) [I] |
| Architecture title | `.arch-scroll-area` (start `30% top`) | 22462 | — | toggle (`onEnter` / `onLeaveBack`, `toggleActions: "play"`) — likely the ARCHITECTURE reveal [I] |

### 7.5 Key live measurements (re-runnable) [V]

```js
ScrollTrigger.getAll().length                              // 178
gsap.version                                              // "3.15.0"
document.querySelectorAll('video').length                 // 8 (7 distinct)
getComputedStyle(document.querySelector('.preloader')).maskImage   // 3 gradients + preloader_arch-l.svg
getComputedStyle(document.querySelector('.loc-w_clouds .marquee_track')).animation  // marquee 32s linear infinite reverse
getComputedStyle(document.querySelector('.arch-intro-s')).position // "sticky"
```

---

## 8. Recommended DOM / component hierarchy (Next.js, App Router)

```
app/
  layout.tsx                    // fonts (Typekit or self-host), inline <script> adding html.is-preloading, <Providers/>
  page.tsx
  providers.tsx                 // client: Lenis + GSAP plugin registration + ScrollTrigger sync
components/
  Preloader.tsx                 // §1.9  (fixed overlay + mask)
  Hero/
    Hero.tsx                    // .hero-scroll-area > .hero-w(sticky) > .hero-s + .hero-w_bg
    HeroTimeline.tsx            // scrubbed timeline (§1.8)
  Sections/
    Dome.tsx                    // "Three reasons" dome (section.arch)
    ConceptHorizontal.tsx       // .loc-scroll-area > sticky screen > track > Panel1 | Panel2 | RoutePanel (flowers 1–3)
    GoldenMileClouds.tsx        // §3
    ApartmentInfo.tsx           // flower #4
    SpaceToLiveIn.tsx           // §4 (flower #5)
    ArchitectureIntro.tsx       // §5 (flowers #6, #7) + ArchitecturePhoto
    Closing.tsx                 // flower #8
  ui/
    Flower.tsx                  // §2.5 (video w/ poster; IO play-pause)
    CloudMarquee.tsx            // 1 layer = CSS marquee
    SplitReveal.tsx             // SplitText + ScrollTrigger once
hooks/
  useIsomorphicLayoutEffect.ts
  useReducedMotion.ts
  useInViewPlayPause.ts
lib/gsap.ts                     // register ScrollTrigger, SplitText, CustomEase; named eases
styles/tokens.css               // --u, colours, fonts, type scale
```

Rules: each section is its own client component with its own `gsap.context`/`matchMedia`; each owns its flowers (as children of the right wrapper); one global Lenis provider (no GSAP ScrollSmoother); no global flower layer.

---

## 9. Recommended animation implementation per section

### 9.1 Global plumbing

```ts
// lib/gsap.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('era-ease', '.25,.1,.25,1');
CustomEase.create('era-inout', '.75,0,.25,1');
CustomEase.create('era-hor', '.25,0,.75,1');
export { gsap, ScrollTrigger, SplitText };

// providers.tsx
useEffect(() => {
  const lenis = new Lenis();                         // defaults; the reference's options were not readable [U]
  lenis.stop();                                      // locked until the preloader finishes
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
  return () => { gsap.ticker.remove(...); lenis.destroy(); };
}, []);
```

### 9.2 Hero (scrubbed) + Concept horizontal scroll

```ts
// Hero  (desktop)
const bg = document.querySelector('.hero-w_bg') as HTMLElement;
gsap.timeline({ defaults: { ease: 'none' },
  scrollTrigger: { trigger: '.hero-scroll-area', start: 'top top', end: 'bottom bottom', scrub: true } })
  .fromTo('.hero-w_bg', { y: 0 }, { y: () => -(bg.offsetHeight - window.innerHeight), duration: 0.6, ease: 'era-ease' }, 0)     // verified fit @1080 & 971
  .fromTo('.hero-s',    { y: 0 }, { y: () => -(bg.offsetHeight - window.innerHeight) - 0.225 * window.innerWidth,
                                    duration: 0.6, ease: 'era-ease' }, 0)                                                         // 22.5vw = 374px @1662 [E]
  .fromTo('.hero-w_bg', { scale: 1, transformOrigin: '50% 75%' }, { scale: 2, duration: 0.6, ease: 'power4.in' }, 0.4);
// add scrollTrigger.invalidateOnRefresh: true so the function values re-evaluate on resize

// Horizontal concept track
const track = el.querySelector('.loc-scroll-area_track');
const screen = el.querySelector('.loc-scroll-area_screen');
gsap.to(track, { x: () => -(track.scrollWidth - screen.clientWidth), ease: 'era-hor',
  scrollTrigger: { trigger: el, start: '2.5% top', end: '97.5% bottom', scrub: 0.25, invalidateOnRefresh: true } });
// the wrapper height ≈ (screen height + horizontal distance·1.075 + 5%): 5210 px in the reference
gsap.fromTo('.flower.loc-intro', { xPercent: 0 }, { xPercent: -25, ease: 'none',
  scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.25 } });
gsap.fromTo('.flower.loc-path',  { yPercent: 0 }, { yPercent: 25, ease: 'none',
  scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.25 } });
// route map reveal (time-based, 2.4s, once visible)
gsap.fromTo('img.loc-path', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.4, ease: 'power4.out',
  scrollTrigger: { trigger: 'img.loc-path', containerAnimation: horizontalTween, start: 'left bottom' } });
```

(The hero `y` end values are viewport-derived — see §1.8 for the two-point fit: bg `y = −(bgHeight − vh)`, text `y = bg y − 22.5vw`. At 1662×1080 that gives the −416 / −790 read from the live tween.)

### 9.3 Clouds — see §3.5 (CSS marquees + two parallax tweens).
### 9.4 Space to Live in — see §4.6 (SplitText char flip + paired column parallax).
### 9.5 Two-image stage — see §5.8 (single scrubbed timeline on a sticky stage).
### 9.6 Flowers — see §2.5, plus the single-flower parallax:

```ts
gsap.utils.toArray<HTMLElement>('.flower[data-parallax]').forEach((el) => {
  const dir = el.dataset.parallax === 'reverse' ? -1 : 1;
  gsap.fromTo(el, { yPercent: -10 * dir }, { yPercent: 10 * dir, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top 125%', end: 'bottom -25%', scrub: 0.5 } });
});
```

---

## 10. Responsive behaviour and reduced-motion fallbacks

| Area | ≤ 991 px (tablet/phone) [V rules] | Reduced motion (recommended) |
|---|---|---|
| Preloader/hero | Same overlay; `100vh → 100svh`; `.hero-w_bg_master{max-height:100vh}`; hero logo/desc re-gridded to 4-col; `.b-desk` items hidden | Skip preloader entirely; hero visible; no char flip; keep the scrub timeline but drop the 2× scale (or disable) |
| Flowers | Size `40rem/4.16 ×10 ≈ 96vw`; `loc-info`/`loc-intro`/`apart-info` get new offsets; `loc-intro` rotates 180° | Poster image only, no `play()` |
| Concept (horizontal) | **Track becomes a vertical column; screen `position:static`**; the sideways scroll and the two flower tweens driven by it have nothing to drive | No pin/scrub; stack panels |
| Clouds | Heights `×5` instead of `×10` (≈ 72vw / 57.7vw tall); same marquee | `animation: none` |
| Space to Live in | `interior-s_title` grid-area 1/1/2/5; script line `margin-top:-40/4.16 rem, margin-left:-16/4.16 rem`; images become a 4-col grid | Show text immediately (no char flip); no column parallax |
| Two-image stage | **`.arch-intro-s.b-desk` is `display:none`** → no windows, no scale, no flower pair; `.arch-w{position:relative}`; `.arch-s{aspect-ratio:2/6}` | Same as mobile: render only the photo block |

Rules of thumb: use `gsap.matchMedia()` with `(min-width: 992px)` for all scrubbed/pinned work; keep `(prefers-reduced-motion: reduce)` as a separate branch that sets final states with `gsap.set` and does not create any ScrollTrigger; Lenis disabled for reduced motion.

---

## 11. Testing checklist (compare against the live reference at 1662 × 1080, then at 1280 × 720 and 1920 × 1080)

**Preloader/hero**
- [ ] First paint: solid `#340c24` + faint watermark; no hero flash; no scrollbar jump.
- [ ] Page cannot scroll until the overlay is removed (wheel, keys, touch).
- [ ] Arch parks below fold → shrinks/dips → rises to ≈ 13vh → widens past viewport; burgundy never shows hairlines at the mask seams.
- [ ] Hero title chars flip in **while** the arch is opening, not after.
- [ ] Overlay is `display:none` at ≈ 4.2–4.8 s; no pointer interception afterwards.
- [ ] Fallback: block fonts + load for 6 s → overlay still exits.
- [ ] `prefers-reduced-motion`: instant hero.
- [ ] Scrub @1662×1080 (range 0 → 5151): at scrollY 600 → `.hero-s y ≈ −222`, `.hero-w_bg y ≈ −117` [E, scaled from the 971-high readings]; from ≈ 3090 (p 0.6) on, `y` = −790 / −416 and bg scale starts at 1.0; at 5151 the bg is exactly 2.0× around its 50 % 75 % point.

**Flowers**
- [ ] 8 placements, 7 clips; same positions/rotations as §2.3; magenta above cream, never on photos.
- [ ] Only in-view videos play; posters visible before play; Safari uses the HEVC `.mov`.
- [ ] Parallax ±10 %/25 % directions match (interior flower moves opposite).

**Clouds**
- [ ] Three layers drift **left** at ≈ 70 / 60 / 50 px/s @1662 (scale with vw); no seam at loop restart.
- [ ] They keep drifting while scrolling is stopped.
- [ ] Photo parallax ±15 %, zoom 1.15 → 1; cream fade hides the photo top edge; clouds straddle the section boundary.

**Space to Live in**
- [ ] THE/SPACE/TO at 12vw, uppercase, centred, lh 0.875, ls −0.024em; script "Live in" overlaps TO by ≈ 77 px.
- [ ] Char flip ≈ 1.2 s, 50 ms stagger; doesn't replay on scroll-back.
- [ ] Left/right images cross each other (±10 % yPercent opposite directions).

**Two-image stage**
- [ ] At p=0 the windows are ≈ 384 px apart vertically, left lower.
- [ ] Aligned at p=0.5, merged at 0.6, 1.84× scale at p=1; reversing scroll rewinds exactly.
- [ ] Flowers fly out and are fully off-screen by p=1.
- [ ] No hairline between the two panels; no image distortion; no layout shift on resize (test while mid-animation).
- [ ] ≤ 991 px: intro not rendered.

**General**
- [ ] No CLS in Lighthouse; no console errors; ScrollTrigger count sane; 60 fps in the Performance panel on the scrubbed sections.

---

## 12. Uncertainties requiring manual verification

1. **Exact preloader tween values/eases.** I measured the arch geometry per frame but could not read the (already-completed) GSAP tweens; durations/eases in §1.9 are [E]. Run-to-run variance in the hold phase was ≈ 0.5 s. Verify by recording the live page at 60 fps and matching the frame table in §1.4.
2. **What the preloader waits for.** Fonts + `readyState: complete` precede the motion, but I could not read the code; whether the progress bar tracks bytes is [U].
3. **Hero scroll end values (`−790`, `−416` @1080).** Two viewport heights fit `bg y = −(bgHeight − vh)` exactly; the `.hero-s` offset of 374 px (I model it as 22.5vw) fits only two points and its source is [E]. Check at 1280×720, 1440×900 and 1920×1080.
4. **Lenis configuration** (lerp/duration/wheel multiplier) was not exposed; I assumed defaults. How Lenis is tied to `ScrollTrigger` (`lenis.on('scroll', ScrollTrigger.update)`) is [I].
5. **Where the char-reveal code lives** (`assets.slater.app/slater/20164.js`): not retrievable. Start thresholds (`top 85%`), exact ease, and stagger are tuned estimates from sampled opacity curves.
6. **Flower play/pause logic** (IntersectionObserver vs ScrollTrigger callbacks) and `.webm` byte sizes: [U].
7. **Mobile visuals.** Chrome would not resize below ~1084 px, so mobile positions/sizes were derived from stylesheet rules only. Test on a real phone/emulator, especially flowers at ≈ 96vw wide, the vertical concept column, and "THE SPACE TO / Live in" with the negative margins.
8. **Title "ARCHITECTURE" reveal.** A non-scrubbed trigger fires at `30% top` of `.arch-scroll-area` (toggle); I did not capture its tween — likely a char/line reveal [I].
9. **Which parts of the arch-intro polygon are visible as a wedge.** The left polygon keeps a slit point at `(1.111%, 100%)`, which creates a small wedge at the bottom of the panel; I reproduced the polygon string verbatim but did not isolate whether the wedge is ever visible (it falls over the page background / under the flower on desktop).
10. **Night/day toggle and hotspot pins** on the hero (`.hero-w_bg_master_img_night`, `.pins-cms`) were not investigated; they're outside the five requested areas.
11. **Licensing.** Photos/videos/fonts belong to the site owner/Adobe Fonts; the brief lists URLs for reference/measurement only. Use licensed or original assets in production.
