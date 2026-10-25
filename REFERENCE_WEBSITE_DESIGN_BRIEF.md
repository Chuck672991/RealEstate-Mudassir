# REFERENCE_WEBSITE_DESIGN_BRIEF.md

**Reference:** ERA Residence, Estepona — https://www.era-residence.com/
**Purpose:** Implementation-ready design and motion specification for Claude Code to build a *new* site inspired by the reference's visual language and interaction patterns. Do not copy its copy, brand, logo, photography or video.
**Inspected:** 24 Oct 2026, Chrome, live browser session.

---

## 0. How to read this document

### 0.1 Evidence legend

Every finding is tagged so you can tell what is measured from what is guessed.
2
| Tag | Meaning |
|---|---|
| **[V] Verified** | Read directly from the site's own source (its custom animation module, its CSS, computed styles, DOM) or directly seen in screenshots. |
| **[I] Strongly inferred** | Not directly readable, but the observed behaviour makes this the very likely implementation. |
| **[E] Estimate** | Visual measurement or approximation. Use as a starting point and tune by eye. |
| **[U] Unknown** | Could not be determined or was not inspected. Do not assume. |

### 0.2 What was and was not inspected

| Area | Status |
|---|---|
| Home page `/` — load sequence, every section top to bottom, hover/click interactions | Fully inspected |
| `/apartments` (filterable listing) and `/apartments/032` (lot detail) | Inspected (layout, hover, one navigation) — not every lot template |
| `/contact`, privacy/terms PDFs | **[U]** Not opened |
| Desktop viewport | 1084×851 @2x (main). Some later screenshots at 1084×686 after the browser window was resized (section *heights* scale with viewport height, see §C) |
| Mobile / tablet | 390×680 and 820×686 rendered in a same-origin iframe, so the site's own `innerWidth` logic ran at those widths. Real touch behaviour (sticky behaviour on touch, momentum, address-bar resize) is **[U]** |
| Source | The site's custom animation module (~59 KB, minified but with readable function names), the Webflow shared stylesheet (~128 KB), runtime computed styles. All behaviour tagged **[V]** below comes from this. |

The inspection declined non-essential cookies (privacy-preserving default). No forms were submitted.

### 0.3 Concise creative-direction summary (read this first)

These are the principles to preserve. Everything else in this document exists to serve them.

1. **Editorial luxury, not "real-estate template".** High-contrast *condensed Didone capitals* + a *flourish script* + tiny *wide-tracked grotesque labels*. Three voices, never mixed up.
2. **A four-colour world.** Cream `#f3f3ec`, navy ink `#17233b`, velvet plum `#340c24`, powder sky `#b5cedb`. Photography supplies all other colour (saturated Mediterranean blue sky, magenta bougainvillea).
3. **The arch is the signature shape.** Semicircle-topped panels (`border-radius: 50vw` on the top corners), an arch-shaped "portal" preloader, circular buttons and a circular rotating badge. Curves against an otherwise rectilinear, architectural layout.
4. **Cinematic scroll, calm easing.** A pinned hero that dollies into the photograph, clip-path wipes, a horizontal chapter driven by vertical scroll, panels that rise over the previous section like curtains. All motion uses long, soft out-curves (0.4 / 0.8 / 1.2 s).
5. **Scrubbed motion for *stage* changes, triggered motion for *text*.** Image zooms, panel rises and horizontal travel follow the scrollbar 1:1 (or with 0.25–0.5 s lag). Headlines and paragraphs are *triggered* once with masks / char flips and are not scrubbed.
6. **Living foreground ornaments.** Looping *transparent-background videos* of bougainvillea sway in corners and bleed across section edges. They are the "warmth" layer on top of architectural CGI.
7. **Restraint and negative space.** Hairlines, micro-labels, giant empty cream fields, one idea per screen. No heavy UI chrome. The header theme-switches to stay legible over every background.
8. **Everything is proportional.** 1 rem = 1 vw. The whole layout is a fluid scale of a 1600 px canvas. Below 992 px it switches to a simpler, stacked, vw-scaled mobile composition rather than shrinking the desktop one.
9. **Typographic motion is a feature.** Characters roll/flip in (rotateX / rotateY), paragraphs rise through line masks, links swap letters on hover with a horizontal stagger.
10. **Narrative arc:** arrive through a portal → the place (hero) → three reasons → location → concept → coast route → typologies → amenities → interiors → architecture → credibility → call to action → a single phone number on plum.

---

## A. Creative Direction

### A.1 Philosophy and mood

The site sells a boutique gated community of 25 homes on the Costa del Sol. It positions itself as *a place to return to* rather than a unit-listing portal. The design therefore behaves like a luxury-hospitality or architecture-monograph site: large silent photographs, very little copy per screen, and typography that feels printed rather than "web".

- **Mood:** warm, hushed, sunlit Mediterranean; the "golden hour" of architectural visualisation. Slow, deliberate, never bouncy.
- **Visual identity:** *Condensed Didone caps* (display), *Sloop-style script* (accent, always lowercase/mixed-case, always overlapping something), *extended grotesque* (labels, 7–9 px-at-1084 tracked caps), a *flower glyph* (eight-petal bloom) and a *circular badge* with ring text that rotates.
- **Storytelling approach:** one long, mostly linear page. Each section is a "room": you enter by a transition (arch panel rising, clip-wipe, hard colour cut), see one statement, and leave. Colour blocks (sky photo → powder-sky arch → cream → night photo → cream arch → daylight photo → plum) give rhythm.
- **Distinctive characteristics to protect:**
  - The *arch portal* preloader and arch-topped panels.
  - Script word overlapping the end of a condensed headline (`Estepona` over `RESIDENCE`; `yours` inside `THE COAST YOU WANTED / THIS YEAR`; `Live in` under `THE SPACE TO`).
  - Pinned hero that keeps moving: text drifts up faster than the image, then the image zooms ×2 toward its lower centre.
  - A horizontal-scroll chapter that contains a *hand-drawn route map*.
  - Bougainvillea alpha-videos bleeding off section edges.
  - A header whose colour theme changes live based on what is behind it.
  - Ultra-small, ultra-tracked labels beside gigantic headlines (scale contrast).

### A.2 Why it reads as premium (principles, not decoration)

| Principle | How the reference does it |
|---|---|
| **Scale contrast** | 12 vw headlines vs 0.6–0.8 vw labels. Nothing in between competes. |
| **One-typeface-per-job** | Display only for headings/quotes, script only for 1–2 words per composition, grotesque only for labels and body. |
| **Photography first** | Full-bleed or large crops, minimal overlays (white text sits straight on the sky; no dark gradient plates). |
| **Soft, long easing** | Quart-style out-curves, 0.8–1.2 s. Motion never "pops". |
| **Slow reveals tied to place** | Text reveals trigger when the *element* enters, not on a timer. |
| **Colour discipline** | Only four brand colours + photography. Alpha tiers (10/30/60 %) of navy/cream for lines and secondary text. |
| **Geometric echo** | Arch ↔ circle buttons ↔ circular badge ↔ circular route labels. |

---

## B. Design Tokens

All values below are from the site's CSS custom properties unless tagged otherwise.

### B.1 The unit system (important — this drives everything)

- **[V]** `body { font-size: 1vw }` and the root font size resolves to `1vw` (10.84 px at a 1084 px viewport; 3.9 px at 390 px).
- **[V]** Every token is written as `calc(<N>rem / 16)`, where *N* is **px on a 1600 px design canvas**. So `192` → `12 vw`; `48` → `3 vw`; `11` → `0.6875 vw`.
- **[V]** The page scales linearly with viewport width at all sizes. There is no max-width container.
- **Implication for the new build:** define `--u: 1vw` and express sizes as `calc(N / 16 * var(--u))` (or Tailwind arbitrary values / a tiny `px16()` helper). Add `min()`/`max()` clamps for readability (see §I).

```css
:root {
  --u: 1vw;                                  /* the whole site is fluid in vw */
  --px: calc(var(--u) / 16);                 /* 1 design-px on the 1600px canvas */
}
.h1 { font-size: calc(192 * var(--px)); }   /* = 12vw */
```

### B.2 Typography

| Role | Font family | Source / status | Weights |
|---|---|---|---|
| **Display** (headings, nav CTA, quotes, big numbers) | `ambroise-francois-std` — a high-contrast condensed Didone | **[V]** Adobe Fonts (Typekit kit loaded via `use.typekit.net/…js`). Name confirmed from `document.fonts`. | 400 only |
| **Accent script** | `sloop-script-three` | **[V]** Adobe Fonts / Typekit | 400 |
| **Body / labels** | `Maison Neue Extended` | **[V]** loaded in 400 and 700, Webflow-hosted font files | 400, 700 |

**Free/alternative stand-ins [E — not verified, choose by eye]:** Display → a condensed high-contrast Didone (e.g. *Bodoni Moda* at tight tracking, or a licensed *Ambroise* / *Didot Condensed*); Script → a formal copperplate-style script (e.g. *Pinyon Script*); Body → an expanded grotesque (e.g. *Archivo* with `font-stretch: 125%`, or *Syne*). If using stand-ins, keep the *ratios* (scale contrast, tracking, uppercase) — they matter more than the exact face.

**Type scale (design px @1600 → vw → measured at 1084 px viewport)**

| Token | px@1600 | vw | Measured @1084 | Line-height | Letter-spacing | Case | Font | Used for |
|---|---|---|---|---|---|---|---|---|
| `h1` | 192 | 12 | 130.08 px **[V]** | 87.5 % | −0.024 em | UPPER | Display | Section titles ("REAL-LIFE LOCATION"), hero "ERA / RESIDENCE" |
| `h2` | 136 | 8.5 | — | 88.2 % | −0.024 em | UPPER | Display | Secondary titles |
| `h3` | 96 | 6 | — | 91.7 % | −0.024 em | UPPER | Display | Tertiary titles; mobile `h1` base |
| `h4` | 63 | 3.94 | 42.68 px **[V]** | 88.9 % | −0.016 em | UPPER | Display | Statement paragraphs ("ERA RESIDENCES IS A BOUTIQUE…") |
| `h5` | 40 | 2.5 | 27.1 px **[V]** | 100 % | −0.008 em | UPPER | Display | Pull quotes, hero "A PLACE … TO RETURN TO" |
| `h6` | 28 | 1.75 | 18.97 px **[V]** | 100 % | 0 | UPPER | Display | Header "SELECT AN APARTMENT", list items |
| `a1` | 192 | 12 | 130.08 px **[V]** | 100 % | 0 | mixed | Script | Large script words |
| `a2` | 120 | 7.5 | 81.3 px **[V]** | 100 % | 0 | mixed | Script | "Estepona" |
| *(script small)* | — | 4 | 43.36 px **[V]** | 100 % | 0 | mixed | Script | "Live in", inline accents |
| `c1` | 25 | 1.5625 | 16.94 px **[V]** | 112 % | **+0.8 em** | UPPER | Display | Ultra-spaced caps: "SPAIN", "COSTA  DEL SOL" |
| `p1` | 13 | 0.8125 | ≈8.8 px **[E]** | 138.5 % | −0.024 em | sentence | Body | Body copy |
| `p2` | 11 | 0.6875 | 7.45 px **[V]** | 145.5 % | −0.024 em | sentence | Body | Small body |
| `l1` | 11 | 0.6875 | 7.45 px **[V]** | 145.5 % | +0.048 em | UPPER | Body | Labels ("THE CONCEPT", specs) |
| `l2` | 9 | 0.5625 | ≈6.1 px **[E]** | 133.3 % | **+0.32 em** | UPPER | Body | Micro-labels ("BOOK A CALL", "SCROLL") |
| *(fit text)* | — | — | 263 px **[V]** | — | −0.024 em | UPPER | Display | "ARCHITECTURE" — font size computed in JS so the word fills its container width |

**Mobile (≤991 px) — measured at a 390 px viewport [V]:** `h1` 90 px (23.1 vw, line-height ≈91 %), script `a2` 67.5 px (17.3 vw), `h4` 37.5 px (9.6 vw), `h5` 26.25 px (6.7 vw), `c1` 17.8 px (4.6 vw, +0.8 em), body/labels 10.3 px (2.64 vw), micro-label 8.4 px (2.16 vw). At 820 px the `h1` is 189 px (the same 23.07 vw), so mobile type is simply vw-proportional up to 991 px.

**Text behaviour rules [V/I]**
- Display text is always uppercase, with deliberate manual line breaks (e.g. `ERA / RESIDENCE`, `NEW / GOLDEN / MILE`, `THE SPACE / TO / Live in`).
- Script words are *not* uppercase and are positioned to overlap the neighbouring display line (negative margin / absolute offset) **[I]**.
- Labels use extreme tracking (0.32–0.8 em) and tiny size; they are always paired with a much bigger element.
- Body paragraphs are tiny, centred or left-aligned in narrow columns (≈ 20–25 vw wide) **[E]**.

### B.3 Colour

| Token | Value | Role |
|---|---|---|
| `brand-500 / velvet-plum` | `#340c24` | Preloader, footer, modal menu (mobile), "dark" theme background |
| `base-0 / 100` | `#f3f3ec` | Cream — main page background, text on dark |
| `brand-500 / powder-sky` | `#b5cedb` | Arch panels, apartment-type section, "Book a call" modal card |
| `brand-500 / blush-bloom` | `#f8bbcb` | Declared in tokens; **[U]** usage not observed |
| `base-1000 / 100` | `#17233b` | Navy ink — all primary text on light |
| `white / 100` | `#ffffff` | Text over photography |
| Navy alpha tiers | `…99` (60 %), `…4d` (30 %), `…1a` (10 %), `…0d` (5 %), `…00` | Secondary text, hairlines, card fills |
| Cream alpha tiers | `#f3f3ec99`, `…4d`, `…1a`, `…0d`, `…00` | Same on dark |
| White alpha tiers | `#fffc` (80 %), `#fff6` (40 %), `#fff3` (20 %), `#ffffff1a` (10 %) | Text/hairlines over photography |
| Additional (system) | success `#1ba64b`, alert `#ffa800`, error `#e23d3d` | Form states **[U]** not seen |

**Theme system [V]** — four theme classes re-map the same CSS variables, applied to *fixed UI elements* depending on the section behind them:

| Class | Text colour | Background variable | Seen on |
|---|---|---|---|
| `theme_on-light` | navy `#17233b` | cream `#f3f3ec` | Cream sections |
| `theme_on-brand` | navy | powder-sky `#b5cedb` | Arch / apartment-types sections |
| `theme_on-dark` | cream | velvet-plum | Footer, mobile menu |
| `theme_on-color` | white | plum | Over photography (hero, amenities, CTA) |

**Photography grading [E]:** high-key, saturated CGI — deep cobalt sky (≈ `#1f4fb0`→`#3c6fd1`), warm sand/limestone, magenta bougainvillea (≈ `#d6247f`), turquoise pool; a *night* variant in indigo/violet (≈ `#2b3a78`) with warm interior lights. Parking/amenity shots are warmer and softer (film-like). No colour overlays on images except a ~30–40 % dark veil behind the CTA text and modal backdrops (≈ navy at 70 %).

### B.4 Spacing, layout, grid

| Item | Value |
|---|---|
| Spacing unit scale (px@1600) | 0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 44, 48, 56, 60, 64, 80, 96, 104, 120, 144, 160, 168, 192, 240, 272 **[V]** |
| Page side offset | 48 (= **3 vw**) **[V]** — header, scroll bar and container padding all sit 3 vw from the edges |
| Grid gap | 16 (= 1 vw) **[V]** |
| Layout "cell" | 136 × 96 (= 8.5 vw × 6 vw) **[V]** — fixed UI blocks (logo 92 px at 1084) are one cell wide |
| Container | `max-width: none`, side padding 3 vw (32.52 px at 1084) **[V]**; most content is *not* in a conventional 12-col grid — it is placed on a loose 8.5 vw "cell" rhythm **[I]** |
| Section heights | 0.64 vh (arch intro) to ≈ 4 vh (pinned scroll areas) — see §C |
| Fixed UI z-index | 1200 **[V]** |
| Fixed UI positions | Logo `left 3vw / top 3vw` (92 px square = 8.5 vw), nav block `right 3vw / top 3vw`, scroll bar `left 3vw / top 14.5vw` with `height = 100vh − 29vw`, "SCROLL" cue block pinned bottom-left (86 px tall) **[V]** (measured: logo `l33 t33 w92 h92`; nav `l959 t33 w92 h74`; bar `l33 t157 w92 h537` at 851 vh) |

### B.5 Shape, borders, separators, decoration

| Element | Treatment |
|---|---|
| **Arch panels** | Section `border-top-left/right-radius: 50vw` (542 px at 1084 = a semicircle top), solid fill (powder-sky or cream), `position: relative; z-index: 1`, pulled up over the previous section with a negative top margin of ≈ `100vh + 50vw` **[V]** (the overlap measured 1393 px = 851 + 542) |
| **Circle CTA** | 1 px hairline ring (SVG circle r = 103.5 → 207 px at 1600), label centred, two short *arc segments* (`stroke-dasharray`) that grow to half the circumference on hover **[V]** |
| **Pill buttons** | 1 px outline, fully rounded, small caps label ("SUBMIT", "EXPLORE GROUND + BASEMENT", "SUBMIT A REQUEST"); a separate circular "PDF" button next to it **[V visual]** |
| **Hairlines** | 1 px, colour = 10–20 % alpha of text colour; long vertical dividers between composition blocks (e.g. above/below the centre flower) **[V visual]** |
| **Cards (apartments)** | Cream/transparent fill, 1 px hairline border, **chamfered/notched corners** (small diagonal cuts) **[V visual]; [U]** how it is built (likely border-image / background SVG / mask) |
| **Cookie card** | Cream card, double hairline frame with chamfered corners, giant script "Cookies" cropped on the right, ACCEPT / DECLINE as underlined text links **[V visual]** |
| **Bloom glyph** | Eight-petal flower mark used as logo core, section divider and footer ornament **[V visual]** |
| **Iconography** | Almost none: thin arrows, `+` in a circle, `×` in a circle, three-dot "menu" glyph on mobile |

### B.6 Image aspect ratios and cropping [E]

| Use | Aspect | Notes |
|---|---|---|
| Hero background | Full width, ≈ 1.15× viewport height (element measured 1084 × 976 px at an 851 px-tall viewport) **[V]** | Needs spare height because it drifts upward and then zooms ×2; art-direct so the *lower-centre* (pool + architecture) survives the zoom |
| Full-bleed section photos | 16:9 → cover | Parallax ±15–20 % `yPercent` |
| Portrait feature (terrace, apartment-type) | ≈ 3 : 4 to 9 : 16 | Lives in the horizontal track / slider |
| Interior slider | ≈ 16 : 9 landscape, flush right with left offset ≈ 11 vw | |
| Architecture twin panels | ≈ 3 : 4 each, offset vertically | Revealed by clip-path polygons (see §D) |
| Floor-plan cards | ≈ 3 : 4 portrait card, plan image centred | White/cream background |

### B.7 Motion tokens

**Durations [V]** (from the site's constants)

| Token | Value | Typical use |
|---|---|---|
| `durS` | 0.4 s | Hide/exit, small hovers |
| `durM` | 0.8 s | Hover transitions, tab crossfade, modal fade, page leave/enter |
| `durL` | 1.2 s | Text reveals, slide wipes, snap scroll, preloader steps |
| `stagger` | 0.1 s | Base stagger (chars use 0.1 or 0.05; hide uses 0.5× / 0.25×) |
| `delayReveal` | 0.3 s | Default delay before a reveal |

**Easings [V]** — defined with GSAP CustomEase as cubic-béziers

| Name | Bézier | Character | Used for |
|---|---|---|---|
| `Out` | `0.25, 1, 0.5, 1` | Strong ease-out (quart-ish; samples: 0.1→0.35, 0.3→0.76, 0.5→0.93) | All text reveals, hovers |
| `In` | `0.5, 0, 0.75, 0` | Strong ease-in | Exits, the accelerating hero zoom, amenities zoom |
| `InOut` | `0.75, 0, 0.25, 1` | Quart in-out | Wipes, tab/hilight movement, arch rise |
| `diveIn` | `0.6, 0, 0, 1` | Slow start then very fast, long soft tail | Preloader arch "dive" |
| `horScroll` | `0.25, 0, 0.75, 1` | Gentle S-curve | Horizontal chapter track |
| `loaderEase` | custom path; samples at x = 0,.1…1 → 0, .23, .40, .50, .54, .58, .68, .81, .89, .95, 1 | Fast start, plateau in the middle, finish | Preloader progress line |
| `Ease` | `0.25, 0.1, 0.25, 1` (identical to CSS `ease`; read directly from the `CustomEase.create` call, matches the earlier sampled curve 0, .095, .41, .80, .96, .99, 1) | Soft in, firm out | Hero translate, snap scroll, hover roll, aerial scale |
| `Write` | `0.333, 0, 0.667, 1` | Symmetric soft S-curve | Defined in the module but **not referenced by name** in the animation code (may be used by Webflow interactions) — treat as available, not required |

**Smooth scroll [V]:** Lenis 1.3.21 — `duration 1.2`, `smoothWheel true`, `touchMultiplier 2`, easing `t => Math.min(1, 1.001 − 2^(−10t))` (exponential out); synchronised to GSAP via `gsap.ticker`, `ticker.lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`. `history.scrollRestoration = 'manual'`. Resize triggers `ScrollTrigger.refresh(true)` after a 40 ms debounce.

### B.8 Breakpoints

| Breakpoint | Source | Effect |
|---|---|---|
| **992 px** | JS `breakPoint` **[V]** | ≥ 992: pinned/scrubbed desktop choreography, horizontal chapter, snap sections, custom scroll bar, magnetic buttons, hover tooltips, nav links in header. < 992: stacked mobile layout, `MENU` button + full-screen menu, tooltips become bottom sheets, no snap, no horizontal chapter |
| 991 / 767 / 479 px | CSS `@media` **[V]** | Tablet / mobile-landscape / mobile-portrait overrides (mobile typography is applied from 991 down) |

---

## C. Complete Page Structure (home page) — section-by-section inventory

**Scroll ranges are measured at a 1084×851 viewport [V for DOM geometry, E for visual layout].** Pinned scroll areas are *taller than the viewport* — a section's "height" is the amount of scroll it consumes. The whole document is 20 343 px (≈ 23.9 viewport heights). Where a viewport is shorter (686 px), pinned areas grow/shrink with `vh`.

### C.0 Master inventory (page order)

| # | Section | Scroll range (px) | Height | Background | Pinned / scrubbed? | Transition into next |
|---|---|---|---|---|---|---|
| — | **Fixed UI**: logo badge, nav, scroll bar, scroll cue, cookie card | fixed | — | follows `theme_on-*` | fixed, theme-switching | — |
| 0 | **Preloader** (overlay) | t = 0 → ≈ 10 s (first visit) / ≈ 3.7 s (return) | full screen | velvet plum | timeline, scroll locked | Arch portal dives, reveals hero |
| 1 | **Hero** "ERA RESIDENCE Estepona — A PLACE [by day / by night] TO RETURN TO" | 0 – 4 797 | 5.64 vh | Photo (day / night crossfade) | **Pinned stage, scrubbed**: text drifts, image drifts, image zooms ×2 | Arch panel rises over the zoomed image |
| 2 | **Arch intro** "THREE REASONS TO CHOOSE ERA" | 3 404 – 3 946 | 0.64 vh (+ overlaps hero by 1 393 px) | Powder-sky `#b5cedb` | Normal flow; curved text word-spacing scrubbed | Same colour field continues |
| 3 | **Three-reasons slider** "REAL-LIFE LOCATION / BUILT TO STAY / BOUTIQUE CONCEPT" | 3 946 – 4 797 | 1.0 vh | Powder-sky | **Snap** section; auto-advancing slider | Hard cut to photo |
| 4 | **Pull quote** over a pool photograph | 4 797 – 5 610 | 0.95 vh | Photo + parallax | Parallax image | Image edge meets cream with a bougainvillea alpha-video bleed |
| 5 | **Concept + horizontal chapter**: concept statement → "NEW GOLDEN MILE" → terrace photo → "THE COAST YOU WANTED yours THIS YEAR" + route map | 5 610 – 9 008 | 4.0 vh (3 398) | Cream | **Pinned, vertical scroll → horizontal translate** (≥ 992 px) | Aerial photograph with cloud layers scrolls in |
| 6 | **Aerial context** (sky / clouds / coastline photograph) | 9 008 – 9 957 | 1.1 vh | Photo | Scale-down parallax (1.15 → 1) | Powder-sky slab with bevelled top corners |
| 7 | **Typologies slider** "GROUND FLOOR + BASEMENT / GROUND FLOOR / PENTHOUSES" | 9 957 – 10 808 | 1.0 vh | Powder-sky | **Snap** + auto slider | Same field continues |
| 8 | **Range statement** "RESIDENCES RANGE FROM 104 TO 244 SQ.M…" | 10 808 – 11 451 | 0.76 vh | Powder-sky → cut to night photo | Text reveal | Hard cut to night image |
| 9 | **Amenities** (night pool, 5-item tab list) | 11 451 – 14 121 | 3.14 vh | Photo (night) | **Pinned, scrubbed**: image scales ×2 and fades | Cream arch panel rises over it |
| 10 | **"THE SPACE TO Live in"** (interiors, upgrades, interior slider) | 12 728 – 14 970 | 2.64 vh (overlaps amenities by 1 393 px) | Cream | Reveals, slider, parallax | Cream continues into diptych |
| 11 | **Architecture** (diptych → single full-bleed image + giant "ARCHITECTURE") | 14 970 – 17 861 | 3.4 vh | Cream → photo | **Pinned, scrubbed**: clip-path windows, ×1.84 zoom | Image scrolls out; cream block |
| 12 | **Credibility statement** "DEVELOPER / SALES & MARKETING LICENSE OBTAINED 2026" | 17 861 – 18 477 | 0.72 vh | Cream + flower | Text reveal | Photo CTA |
| 13 | **CTA** "PERFECT SEA VIEWS — from rooftop terraces" | 18 477 – ≈ 19 666 | 1.4 vh | Photo + dark veil | Image shrinks to an inset window at the end | Reveals footer behind |
| 14 | **Footer** (phone number on plum) | 19 493 – 20 343 | 1.0 vh | Velvet plum | Content fades/scales in (scrub) | End |

Secondary pages (not part of the home scroll):

| Page | What it is | Key patterns |
|---|---|---|
| `/apartments` | Filterable grid of floor-plan cards (CMS) with "Typology / Bedrooms / Sort by / Reset" bar, count "25" at 12 vw, a photo card interleaved in the grid | Cream page, large `APARTMENTS` + `25`, chamfered cards, lift-on-hover, bougainvillea alpha-video top-right |
| `/apartments/NNN` (e.g. `/032`) | Lot detail: huge floor plan left, spec sidebar right (BEDROOMS, INTERIOR AREA, TERRACE, GARDEN), tabs INFO / BENEFITS with moving highlight, "SUBMIT A REQUEST" + "PDF" buttons, mini site-plan + compass, breadcrumb | Sticky info column (`.lot-s_info_header` toggles `is-top` after 100 px scroll), `+` zoom button on plan |
| `/contact` | **[U]** not inspected | — |

---

### C.1 Fixed UI layer (present on every page)

**Purpose:** persistent identity + navigation + progress, quietly.

| Element | Position (1084 px viewport) | Content | Behaviour |
|---|---|---|---|
| Logo badge | left 33 px, top 33 px, 92 px square | Circular text ring "ERA RESIDENCE · ERA RESIDENCE" around an eight-petal bloom | Ring **rotates continuously** and speeds up/reverses with scroll velocity (G7); link to `/`; recolours via theme (G6) |
| Nav (desktop ≥ 992) | right 33 px, top 33 px, right-aligned | `SELECT AN APARTMENT` (display, 2 lines, underlined) → `/apartments`; `BOOK A CALL` (opens modal); `CONTACT` → `/contact` | Letter-roll hover (G12); theme-switching |
| Menu button (mobile) | top-right | `MENU` + three-dot glyph | Opens full-screen plum menu |
| Scroll bar | left 3 vw, from 14.5 vw down, height `100vh − 29vw` | Vertical hairline with a thumb and a two-digit percentage label `00 … 100` | Progress readout; **draggable** (grab / grabbing cursor) → `lenis.scrollTo(…, {duration:3.2})`; desktop only (G8) |
| Scroll cue | bottom-left | Vertical word `SCROLL` + 1 px arrow line | Fades out as the footer approaches; on the footer shows `→ TO TOP` |
| Cookie card | bottom-right, ≈ 19.5 vw wide | Script "Cookies" (cropped), one-sentence notice, `ACCEPT / DECLINE` | Slides away on choice |

---

### C.2 Section 0 — Preloader (overlay)

See **G1 / G2** in §D. Visual content [V from screenshots]:

- Full-screen **velvet plum** `#340c24`; extremely subtle rounded-rectangle frame lines inset ≈ 2 vw and concentric arch outlines.
- Top centre: small bloom glyph. Centre lockup: `ERA` / `RESIDENCE` (display, white/cream) with script `Estepona` overlapping. Left `COSTA`, right `DEL SOL` (wide-tracked caps, `c1`). Bottom centre: micro-label a micro-label with the project name and its tagline and a vertical progress line that fills.
- At the end an **arch-shaped window** (cream border, concentric hairlines) rises from the bottom showing the *hero photograph inside it*; the arch then widens and travels upward past the top, revealing the page.

---

### C.3 Section 1 — Hero (0 – 4 797 px)

**Purpose:** establish place and mood; offer "day / night" and three hotspots; invite to scroll.

**Structure [V]:** `section#hero > .hero-scroll-area` (4 797 px tall) containing two sticky layers: `.hero-w_bg` (the photo, 976 px tall at 851 vh) and `.hero-s` (text/UI stage).

**Layout (viewport 1084×851, at scroll 0) [E]:**

| Element | Position | Spec |
|---|---|---|
| Headline `ERA` / `RESIDENCE` | centred, top 4.5 vh to 29 vh | `h1` 12 vw, white, two lines, lh 87.5 % |
| Script `Estepona` | overlaps the lower-right half of `RESIDENCE` (≈ x 40–59 vw, y 29–39 vh) | `a2` 7.5 vw, white |
| "A PLACE" / "TO RETURN TO" | y ≈ 42 vh; "A PLACE" x ≈ 22–27 vw, "TO RETURN TO" x ≈ 68–78 vw | `h5` 2.5 vw (27 px) white |
| Day/night toggle | centred between them (x 50 vw, y 42 vh) | `BY DAY ———— BY NIGHT`, `l2` micro caps, active label bright / inactive ≈ 50 % |
| Hotspots (3) | ≈ (27 vw, 67 vh), (57 vw, 71 vh), (76 vw, 84 vh) — positioned on architectural features of the photo | ≈ 24 px ring + centre dot, pulsing |
| "VIEW AVAILABLE APARTMENTS" | bottom centre, ring partly below the fold | Circle CTA 12.9 vw (hover arcs) |
| Scroll cue / progress | left rail (see C.1) | |

**Imagery:** one wide CGI photo of a pool courtyard flanked by white terraced villas draped in bougainvillea, palms, blue sky; a *night* twin (deep blue dusk, warm interior lights). Both full-width.

**Motion:** G1 (arrival) → S1.1 text reveal → S1.2 scrub dolly → S1.3 day/night → S1.4 pins/tooltips → S1.5 CTA ring.

**Transition into next:** by the end of the scroll the photo has zoomed ×2 toward its lower centre (dark-blue sky fills the upper part) and the powder-sky arch panel (section 2) slides up from the bottom over it — pure normal-flow overlap, no tween.

**Mobile (≤ 991) [V]:** no vertical drift tweens; only the image scale 1 → 2 across the whole 2 235 px scroll area. Headline stacks; "A PLACE" and "TO RETURN TO" sit left/right on one line; the toggle moves lower; `MENU` replaces nav.

---

### C.4 Section 2 — Arch intro "THREE REASONS TO CHOOSE ERA" (3 404 – 3 946)

- **Purpose:** hand-off from photograph to calm, flat colour; announce the three-reasons chapter.
- **Layout:** powder-sky arch panel (`border-radius: 50vw 50vw 0 0`), 542 px tall, `margin-top ≈ −(100vh + 50vw)` so it rises over the pinned hero. Inside: words `THREE · REASONS · TO · CHOOSE · ERA` set along a **semicircular arc** following the arch (display caps, ≈ h4 size, each word slightly rotated); under it `COSTA ✿ DEL SOL` (c1) with the bloom glyph; a ≈ 25 vh vertical hairline; a one-line tagline caption (l1, navy, bold).
- **Motion:** S2.1 `word-spacing` 0 → 10 rem scrubbed (words *spread apart along the arc* as you scroll) **[V]**; the curve itself is likely an SVG `textPath` or per-word rotation **[I]**.
- **Transition:** the same powder-sky field continues into section 3 (no seam).
- **Mobile:** same arch, text arc narrower; verified at 390 px.

### C.5 Section 3 — Three-reasons slider (3 946 – 4 797) — **snap section**

- **Purpose:** three one-line value propositions as a slideshow: *Real-Life Location*, *Built to Stay*, *Boutique Concept*.
- **Layout:** `h1` slide title at the top centre (12 vw, navy); a **small landscape image** centred (≈ 26 vw × 13 vw) with pagination under it (`‹ 1 ———— 3 ›`: prev arrow, current number, progress line, total, next arrow); a paragraph (≈ 22 vw wide, centred, `p1`) and a bold one-line micro-tagline about community at the bottom.
- **Motion:** G13 slider (auto 6 s with a linear progress bar; prev/next; pauses when < 20 % visible or tab hidden) + G5 snap.
- **Transition:** hard cut to the photographic quote below.

### C.6 Section 4 — Pull quote over photograph (4 797 – 5 610)

- **Purpose:** an architectural statement by "ARCHITECTURE TEAM".
- **Layout:** full-bleed pool photograph (golden-hour, different to the hero). Quote mark `“` at x ≈ 61 vw; quote in `h5` (27 px) set in 3–4 lines on the right half, left-aligned at ≈ 50 vw, bottom ≈ 25 vh; attribution `ARCHITECTURE TEAM / ERA RESIDENCE` in `l1`.
- **Motion:** image parallax (G10 `img`: yPercent −15 → +15, scrub 0.5); text reveal G9 `h`/`p`.
- **Transition:** at the bottom edge the photo meets cream; a **bougainvillea alpha-video** sits on the seam, overlapping both.

### C.7 Section 5 — Concept + horizontal chapter (5 610 – 9 008)

**Purpose:** the concept statement and the "location" story, told as a left-to-right journey while the user scrolls down.

**Structure [V]:** `.loc-scroll-area` is a tall wrapper whose height is set by JS to `track.scrollWidth` (3 398 px at 1084 wide). Inside it a pinned stage holds `.loc-scroll-area_track` (a wide row ≈ 3 398 px wide) whose `x` is tweened from 0 to `−(scrollWidth − areaWidth)` (≈ −2 347 px). The concept block (`.loc-info-w`, 851 px) is the *first item in the track*, so it slides out to the left as the horizontal travel begins. Horizontal travel ≈ vertical scroll distance (≈ 2 377 px of scroll for ≈ 2 347 px of travel), i.e. roughly 1 : 1.

**Track contents, in order [V visual + E layout]:**

| Block | Description |
|---|---|
| 5a Concept statement | Label `THE CONCEPT` (l1) above a 3-line centred `h4` statement (≈ 20 words) that positions the project as a boutique gated community of 25 homes; small paragraph + bloom glyph below; two bougainvillea alpha-videos in the top-left and bottom-right corners. The whole block slides out to the left as the next block enters from the right |
| 5b "NEW / GOLDEN / MILE" | Three-line stacked `h1` (staggered x: line 1 left, line 2 right, line 3 left), with the micro-caps `SPAIN` (`c1`, +0.8 em) at the left; a large bougainvillea alpha-video rotated 90° bleeds from the bottom |
| 5c Terrace photo | A tall portrait photograph (≈ 37 vw × 100 vh) of a terrace with pergola and sea; to its right a block: heading `BETWEEN MARBELLA AND ESTEPONA` (`h5`), paragraph (`p1`), and a **circle CTA** `VIEW AVAILABLE APARTMENTS` |
| 5d "THE COAST YOU WANTED *yours* THIS YEAR" | Two-line display statement with script `yours` between the lines (with a hand-drawn underline stroke), centred |
| 5e Route map | A wide **SVG route line** (hand-drawn coastline path, 1072×208 viewBox) + separate **labels SVG**: seven stops from Gibraltar to Málaga airport (the project's own bloom marks its position) with drive-time minute counts; dots on the line |

**Motion:** S5.1 concept fade/scale-in; S5.2 horizontal track; S5.3 title-line drift; S5.4 flower drift; S5.5 route-line draw; text reveals fire as each item enters horizontally (G9 with `containerAnimation`).

**Mobile [V]:** the pin/translate is **disabled** (`matchMedia ≥ 992` only). Blocks stack vertically; the route map + aerial photo become a **drag-scroll strip** (`scrollLeft` centred on init) with a `‹ DRAG TO SEE MORE ›` hint.

### C.8 Section 6 — Aerial context (9 008 – 9 957)

- **Purpose:** show the neighbourhood from the air; visual "exhale" after the dense horizontal chapter.
- **Layout:** full-bleed aerial photograph (mountains top, coastline, resort buildings, golf), with a **sky-and-cloud overlay** at the top edge that fades the cream page into the photo (three cloud layers, AVIF, parallaxing) and small white annotation labels with leader lines near buildings **[I — text unreadable at inspection scale]**. At its bottom edge the next powder-sky slab meets the photo with **bevelled (diagonal) top corners** **[I from screenshot; construction unknown]**.
- **Motion:** S6.1 image `scale 1.15 → 1`, transform-origin `center bottom`, ease `Ease`, scrub 0.25 over `top bottom → bottom bottom`; cloud layers use `data-parallax` img-in/img-out (G10).
- **Mobile:** same, plus the drag-strip hint overlaid.

### C.9 Section 7 — Typologies slider (9 957 – 10 808) — **snap section**

- **Purpose:** introduce three typologies and funnel to `/apartments`.
- **Layout (powder-sky):** left-centre stats block (`BEDROOMS` label + number; `AREA UP TO` label + range in display, e.g. `178 — 202 M²`); centre portrait photograph (≈ 27 vw × 46 vh); right a short description (≈ 17 vw wide) and an outlined **pill** `EXPLORE GROUND + BASEMENT`; **below** the image, the typology title in `h1` (`GROUND FLOOR + BASEMENT`); pagination row under it.
- **Motion:** G13 slider — each slide change animates heading chars (rotateY), paragraph lines, CTA fade-up and **the image via diagonal clip wipe + inner scale** (animateSlide). Auto 6 s + arrows.
- **Slides (3):** Ground floor + basement · Ground floor · Penthouses (CTA text changes per slide; all link to `/apartments`).

### C.10 Section 8 — Range statement (10 808 – 11 451)

- **Layout:** centred 3-line `h4` statement on powder-sky (≈ 20 words stating the size range and layout types), a vertical hairline and caption above, a bloom glyph below, a bougainvillea alpha-video in the bottom-left corner.
- **Motion:** G9 `h`/`p` reveals; parallax on the flower.
- **Transition:** *hard cut* from flat colour to the full-bleed night photograph — the strongest cut on the page.

### C.11 Section 9 — Amenities (11 451 – 14 121) — **pinned + scrubbed**

- **Purpose:** the shared amenities as a tab list over full-bleed imagery.
- **Layout:** a full-bleed image (starts with a night shot of the pool/courtyard; other tabs: swimming pool, parking, spa & gym, landscaping). Right column (x ≈ 70–82 vw, y ≈ 7–15 vh): a **vertical list** `GATED COMMUNITY · SWIMMING POOL · PARKING AREA · SPA & GYM · LANDSCAPING` in `h6` display, *active item at 100 %*, others ≈ 50 % opacity, with a **1 px vertical highlight bar** to the left that slides to the active item. Bottom-left caption block: micro label (`GATED COMMUNITY`) + `h5` sentence. Bottom-right: circle CTA `BOOK A CALL NOW`.
- **Motion:** S9.1 whole stage `scale 1 → 2` (`In`) while the wrapper's `opacity 1 → 0` (`In`) over the area (scrub 1:1); S9.2 tab click → diagonal clip-wipe to the next image (1.2 s `InOut`) with inner scale 1.5 → 1 and caption reveal; highlight bar moves 0.8 s `InOut`.
- **Transition:** by ≈ 60 % of the area the cream arch panel of section 10 rises over the (scaling, fading) image.

### C.12 Section 10 — "THE SPACE TO Live in" (12 728 – 14 970)

- **Purpose:** interior quality and "optional upgrades".
- **Layout:** cream arch panel (top radius 50 vw). Centred stack `THE / SPACE / TO` (h1) with script `Live in` (≈ 4 vw script) overlapping; an asymmetric two-column composition: **right** a landscape terrace image (≈ 40 vw, top) with `h5` statement (≈ 15 words) about considered interior detailing and a small paragraph; **left** a **velvet-plum rectangle** with a bougainvillea alpha-video and a smaller inset photo ("garden") inside it; a micro-list headed "optional upgrades" with three dash-prefixed items; a circle CTA; then a **wide interior photograph slider** (flush right, starts ≈ 11 vw from the left; pagination `‹ 1 ——— 2 ›`).
- **Motion:** G9 reveals; image parallax (G10); slider G13; circle hover.
- **Transition:** into the diptych (section 11) with cream continuing.

### C.13 Section 11 — Architecture (14 970 – 17 861) — **pinned + scrubbed**

- **Purpose:** the architectural idea; the biggest "reveal" on the page.
- **Layout (start):** two portrait façade photographs on cream, offset vertically (left lower, right higher), bougainvillea alpha-videos at both bottom corners.
- **Layout (end):** one full-bleed façade image; the word `ARCHITECTURE` spans the full width (≈ 24 vw font-size, auto-fitted); a 3-line `h5` statement (≈ 15 words) about contemporary lines and Mediterranean warmth bottom-left, followed by a small two-line architect credit in `l1`; circle CTA `BOOK A CALL NOW` bottom-right.
- **Motion:** S11.1 scrubbed clip-path "window" timeline, then ×1.84 zoom; S11.2 header/paragraph reveal at `30 % top` (reversible); S11.3 image parallax-out `yPercent 0 → 25`.
- **Transition:** image scrolls up; cream statement block.

### C.14 Section 12 — Credibility statement (17 861 – 18 477)

- Centred 4-line `h4` `DEVELOPER SALES & MARKETING LICENSE OBTAINED 2026` with tiny superscript crosses; long vertical hairline above; bougainvillea alpha-video top-right; caption above the next photo.
- G9 `h` reveal.

### C.15 Section 13 — CTA "PERFECT SEA VIEWS" (18 477 – ≈ 19 666)

- **Layout:** full-bleed rooftop-terrace photograph with sea and city on the horizon, dark veil; `h1` `PERFECT / SEA VIEWS` white centred at the top; script-less sub-line in c1 `FROM  ROOFTOP  TERRACES`; circle CTA `VIEW AVAILABLE APARTMENTS` centred lower; a short invitation caption above.
- **Motion:** S13.1 image `clip-path: inset(0) → inset(8% 22% 8% 22%)` (desktop) / `inset(4% 32% 4% 32%)` (mobile) scrubbed 0.5 as the footer starts (`top 30% → bottom bottom`) while footer contents fade/scale in.

### C.16 Section 14 — Footer (19 493 – 20 343)

- **Layout (plum):** bloom glyph; **a single phone number** in display at ≈ 40 % of viewport width (clickable `tel:`); `SALES OFFICE` + address (l1, link to maps); bottom-left copyright line with privacy/terms links; bottom-right a studio credit with a small **Lottie logo that scrubs forward on hover** (and reverses on leave); bottom-left rail shows `TO TOP`.
- **Motion:** S14.1 `.footer-s` opacity 0 → 1 & scale 0.75 → 1 (linear, scrubbed 0.5, with S13.1); text reveals triggered `onEnter`, hide on `onLeaveBack`.

---

## D. Animation Specification

**Reading guide.** `[V]` values come from the site's own animation code (a single custom module built on GSAP + ScrollTrigger + SplitText + CustomEase, Lenis, Barba, Lottie). Section effects reference the global systems G1–G16 below. "Scrub" means the animation progress is bound to scroll position; "trigger" means it plays once (or on enter/leave) on its own clock.

### D.1 Global systems

#### G1 — Preloader, first visit per browser session **[V]**

Runs when `sessionStorage.hasVisited` is absent; the flag is set immediately after. Scroll is locked (`lockScroll()` + Lenis `stop()`); `scrollToTop` fires at +100 ms.

| t (s, from timeline start) | What happens | Duration / ease |
|---|---|---|
| 0.0 | Overlay (plum) visible. Lockup text groups reveal using the text primitives (§D.2): script chars (type `a`), heading chars (`h`), paragraph lines (`p`), container fade-ups (`ctn`), hairlines (`line`) — each with `delay 0.3 s + 0.1 s × element-index` | 1.2 s each, `Out` |
| 0.0 → 1.2 | spacer | — |
| 1.2 → 2.4 | `.preloader_bg_a` opacity 0 → 0.05; `.preloader_bg_decor` (frame lines / arch outlines) 0 → 1 | 1.2 s, `Out` |
| 2.4 → 6.4 | **Progress track** `yPercent −100 → 0` (a vertical line fills at the bottom) | 4 s, `loaderEase` |
| 6.4 → 7.9 | **Arch rises**: CSS custom properties on the overlay `--arch-w 24vw → 36vw` (mobile `40vw → 50vw`), `--arch-y 104vh → 15vh`; the hero photograph is visible *inside* the arch | 1.5 s (1.25 × durL), `InOut` |
| ≈ 7.75 (`"<90%"`) | **Arch dives**: `--arch-w → 125`, `--arch-y → −100vh` (arch grows past the viewport and exits upward) | 2.4 s, `diveIn` |
| with the dive | Hero image `scale 0.75 → 1` (mobile `1.15 → 1`), `transform-origin: center top` | 1.5 s, `InOut` |
| ≈ +25 % into the dive (`"<25%"`) | `initPageTransitions()` → site init → all ScrollTriggers register and the hero text reveals fire | — |
| end | `unlockScroll()`, overlay `display:none`, master preloader node removed | — |

**Total ≈ 10 s [E, derived: 6.4 + ≈ 1.35 + 2.4]; observed: hero fully assembled ≈ 10–11 s after navigation.** The overlay is a plum field whose "window" is an arch shape defined by `--arch-w` / `--arch-y` **[I: the CSS that turns these variables into a mask/clip was not read]**.

#### G2 — Preloader, return visit (same tab session) **[V]**

Same machinery without the text, progress line or hold: bg fades + arch rise in parallel (1.2 s / 1.5 s), dive from 90 %, hero scale 0.75 → 1, init at +25 %. **≈ 3.7 s [E].** On a page without a hero (e.g. `/apartments`) the arch interior is simply the cream page.

#### G3 — Page transitions (Barba) **[V]**

`sync: false` (sequential). Triggered by in-site link clicks.

| Phase | Action |
|---|---|
| `beforeLeave` | `animateVisibleElements(container, 'hide')` — every visible `data-part` / `data-scroll-reveal` element plays its *hide* animation (0.4 s) |
| `leave` | Container `opacity → 0`, 0.8 s, `In` |
| `afterLeave` | `scrollToTop` (after 60 ms), kill every ScrollTrigger, destroy local Lenis instances, remove old container |
| `beforeEnter` | New container `opacity 0`; re-run all inits (`initScripts`, parallax); `ScrollTrigger.refresh(true)` |
| `enter` | Container `opacity → 1`, 0.8 s, `InOut` |
| `afterEnter` | Re-initialise Webflow interactions for the new page |

Net feel: *breathe out (text hides) → fade to cream → fade in*, ≈ 1.6–2 s. No shared-element transitions.

#### G4 — Smooth scroll + scroll engine **[V]**

```js
const lenis = new Lenis({ wrapper: window, duration: 1.2, smoothWheel: true,
  touchMultiplier: 2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), infinite: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
history.scrollRestoration = 'manual';
// Nested scroll containers ([data-lenis-scroll]) get their own Lenis (duration 0.6).
window.addEventListener('resize', debounce(() => ScrollTrigger.refresh(true), 40));
document.documentElement.style.setProperty('--_100svh', innerHeight + 'px');
```

`syncTouch` is not enabled, so on touch devices scrolling stays native (momentum) while ScrollTrigger still scrubs.

#### G5 — Snap sections (desktop only) **[V]**

```js
// matchMedia (min-width: 992px)
let timer;
lenis.on('scroll', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    // pick the [data-snap] element with the largest visible fraction > 0.5
    // fraction = (min(bottom, vh) - max(top, 0)) / min(el.offsetHeight, vh)
    lenis.scrollTo(best, { duration: 1.2, easing: gsap.parseEase('Ease') });
  }, 40);
});
```

Only **two** sections carry `data-snap` on the home page: the three-reasons slider (section 3) and the typologies slider (section 7). Behaviour: a gentle magnet — if you stop with > 50 % of that section visible it eases into alignment.

#### G6 — Header theme switching **[V]**

Fixed UI elements carry `data-theme`; sections carry `data-bg="light|dark|color"`. For every (element, section) pair whose horizontal extents overlap, a ScrollTrigger is created with `start: () => "top top+=" + elCenterY`, `end: () => "bottom top+=" + elCenterY`; on enter / enter-back the element gets `theme_on-<x>` and loses the others. Result: the logo, nav, scroll bar and cue each recolour *at the exact moment a section edge passes their centre*, so a single UI element can be half navy / half white at different scroll positions. (Suggested equivalent: one IntersectionObserver per UI element with `rootMargin` set to a 1-px line through the element's centre.)

#### G7 — Rotating logo badge **[V]**

```js
const speed = { v: 30 };           // degrees per second
let rot = 0, dir = 1, userScrolled = false;
addEventListener('wheel', () => userScrolled = true, { once: true });
addEventListener('touchmove', () => userScrolled = true, { once: true });
gsap.ticker.add((t, dt) => { rot += speed.v * (Math.min(dt, 100) / 1000); gsap.set(ring, { rotation: rot }); });
lenis.on('scroll', ({ velocity }) => {
  if (!userScrolled) return;
  if (velocity !== 0) dir = velocity > 0 ? 1 : -1;
  gsap.to(speed, { v: dir * (30 + 10 * Math.abs(velocity)), duration: .3, ease: 'Out', overwrite: true });
  clearTimeout(settle);
  settle = setTimeout(() => gsap.to(speed, { v: 30 * dir, duration: 1.2, ease: 'Out' }), 100);
});
```

#### G8 — Custom scroll bar + percentage **[V]** (≥ 992)

- `ScrollTrigger.create({ start:'top top', end:'bottom bottom', onUpdate: s => { bar.style.setProperty('--progress', s.progress*100 + '%'); label.textContent = String(Math.round(s.progress*100)).padStart(2,'0'); } })`.
- Thumb: `pointerenter` → `body{cursor:grab}`; `pointerdown` → capture pointer, `cursor:grabbing`; `pointermove` → `ratio = clamp((clientY − barTop)/barHeight, 0, 1)` → `lenis.scrollTo(ratio × (docHeight − innerHeight), { duration: 3.2 })`.

#### G9 (text-reveal primitives) and G10 (parallax primitives) — see §D.2 and §D.3 below.

#### G11 — Video play/pause on visibility **[V]**

For every `[data-video-playpause]` wrapper: preload each `<video>` (`load()`, `currentTime = 0`), then a ScrollTrigger (`start 'top bottom'`, `end 'bottom top'`) calls `play()` on enter / enter-back and `pause()` on leave / leave-back. On Safari (non-Chrome WebKit) the `.webm` sources are removed so the HEVC-alpha `.mov` is used, and non-hero/non-CTA videos are force-played.

#### G12 — Hover micro-interactions **[V]** (triggers on `mouseenter` / `mouseleave`)

| Name | Markup hook | Behaviour |
|---|---|---|
| **Link hover** | `[hover-link]` with two `[hover=text]` copies | Copy A's chars flip out: `opacity 0, x .4em, yPercent −25, rotateY −90` (0.8 s, `Out`, stagger 0.025). Copy B's chars flip in from `opacity 0, x −.4em, yPercent 25, rotateY 90` (delay 0.2). The underline (`.link_line`, one per text line) `scaleX 1 → 0` with origin *right*; on leave it re-grows from *left*. |
| **Nav-item roll** | `[hover-nav-item]` (14 on the page) | Two copies of the label in word masks. On enter: copy A `yPercent 0 → −100, opacity → 0`; copy B `yPercent 100 → 0, opacity → 1`; 0.8 s `Ease`; **stagger is positional** — each character's delay = (its x-offset ÷ the label width) × 0.2 s, so the roll sweeps left-to-right. Leave reverses. |
| **Circle button** | `[hover-btn-circle]` with `[data-arc]` SVG circle(s), r = 103.5 | `stroke-dasharray` `"${0.0417·C} ${C}"` (≈ 15° arc) → `"${C/2} ${C}"` (half-circle) in 0.8 s `InOut`; a paused timeline: `mouseenter → play()`, `mouseleave → reverse()`. |
| **Magnetic button** (≥ 992 only; 6 on the page) | `[data-magnetic-btn]`, optional `[data-magnetic-inner]`, `data-magnetic-strength` (default 25) | On `mousemove`: `x = ((clientX − left)/width − .5) × (strength/16) em` (same for y); `gsap.to(el, { x, y, ease:'power4.out', duration:1.6 })`; inner element moves with its own strength, 2 s. On leave: `elastic.out(1, 0.3)`, 1.6 s back to 0. |
| **Pin pulse / icon** | `[data-pin]` | Pulse rings `width/height a → 1.6a`, `opacity 1 → 0`, 1.2 s `In`, stagger 0.2, `repeat −1`. Plus-icon rotates `−90°` on enter, `−180°` on leave (0.8 s `Out`). |
| **Credits Lottie** | `.credits` (footer "made by") | Lottie (99 frames) scrubbed by a 1-second paused tween: hover → progress 0.5, leave → 1. |
| **Card parts** | `[hover-card]` (+ `[hover=h|p|info]`) | On enter: heading chars, paragraph lines, hairline reveal (G9); on leave: hide. |
| **Apartment card lift** | CSS | Observed: card fill lightens and a soft drop shadow appears, card nudges up. **[U]** exact CSS values. |

#### G13 — Slider **[V]** (`[data-slider]` with `slide / prev / next / pag / current / total / progress` hooks)

- Slides are stacked: only the current one is `display:block; position:relative`, others `display:none; position:absolute`.
- **Auto-advance every 6 s** with a **linear progress bar** `width 0 → 100 %` over 6 s; clicking prev/next resets the timer. Pauses when < 20 % of the slider is visible (IntersectionObserver `threshold .2`) or the tab is hidden. An `animating` flag blocks clicks mid-transition. Counter text (`current`, `total`, `next-num`) updates immediately; with a single slide the pagination is hidden.
- **Slide change** (≈ 1.4 s total): incoming slide set to its *initial* states (heading chars hidden, paragraph lines at `yPercent 110`, CTA at `y`, image clipped `inset(100% 0 0 0)` with inner scale 1.5, `xPercent 25`); outgoing slide animates *hide* (headline chars `rotateY −90`, lines up, image wipes left with `polygon(0 0, 0 0, 0 100%, 0 100%)` and inner `scale 1.5, xPercent −25`, 1.2 s `InOut`) while the incoming image wipes in (below) and its text reveals at delay 0 (CTA at 0.4 s). Then the outgoing slide is `display:none`.

#### G14 — Modals **[V code + screenshot]**

- **Menu modal** (`[data-modal-menu-btn]` / `[data-modal-menu]`): open → overlay and container `display:block`; every `[data-theme]` element gets `theme_on-dark` (restored on close); label swap `MENU ⇄ CLOSE`; icon bars rotate `−45° / 45°` (0.8 s `InOut`); overlay `opacity 0 → 1` (0.8 s `Out`); content reveals through G9 (`a`, `h`, `p`, `ctn`); `lockScroll()`. Close via button, overlay, or **Esc** → reverse (container `In` 0.8 s, overlay fade 0.8 s, bars rotate back 180°, `unlockScroll()`).
- **"Book a call" modal (desktop)** [V screenshot]: centred card ≈ 75 vw × 48 vh, powder-sky, on a ≈ 70 % navy backdrop. Left: script `Book a call` (≈ 8 vw) and a one-sentence response-time caption; centre: the rotating badge between two long vertical hairlines; right: underline-only fields `NAME / EMAIL / PHONE / MESSAGE`, privacy note, outlined pill `SUBMIT`; circular `×` top-right. Opens ≈ 1 s after click; **not submitted during inspection**.
- **Mobile menu** [V screenshot]: full-screen plum; script `The` overlapping condensed `MENU`; four underlined links (`HOME`, `SELECT AN APARTMENT`, `BOOK A CALL`, `CONTACT`) centred; bloom glyph at the bottom; header shows `CLOSE`.
- **Tip bottom sheet (< 992)**: `[data-modal-tip]` container `yPercent 125 → 0` (1.2 s `Out`) with overlay fade; closes `In` 0.8 s.

#### G15 — Floating tooltip card (≥ 992) **[V]**

`[floating-tip-trigger=id]` hover → `[floating-tip=id]` card is set to the cursor and given `.is-active`. A global `mousemove` handler tweens every active card to the cursor with **`duration: 2.4 s, ease: 'power3'`** — the card *trails the cursor with a long, soft lag* instead of snapping. Classes `.is-left` / `.is-top` are toggled when the card would overflow the right/bottom edge so it flips to the other side. Leave removes the classes. Home: 3 hero pins. Visual: cream card ≈ 17 vw × 24 vw, display title (e.g. `LIGHT & FLOW`) top-left, small paragraph bottom-left.

#### G16 — Tabs **[V]**

- **Hero tabs** (`[data-tabs-hero]`): first trigger gets `is-active`; the divider gets `is-day` / `is-night`. On click (ignored while busy): incoming content `display:block; position:relative; z-index:1`, outgoing `position:absolute; z-index:0`; `ScrollTrigger.refresh()`; incoming image `opacity 0 → 1` 0.8 s `InOut`; outgoing `display:none` afterwards.
- **Tab highlight** (`[data-tabs-hilight]`, `hor` or vertical): after 40 ms the highlight bar tweens to the active item's `offsetLeft/width` (horizontal) or `offsetTop/height` (vertical), 0.8 s `InOut`.

---

### D.2 Text-reveal primitives (the motion vocabulary) **[V]**

All are applied to elements tagged `data-scroll-reveal="<type>"` (scroll-triggered once) or `data-part="<type>"` (called programmatically by preloader/slider/modal). SplitText is created once per element and cached.

| Type | Split | Reveal (initial → final) | Hide | Used for |
|---|---|---|---|---|
| **`a`** (accent / script) | chars (smartWrap) | `opacity 0, rotateX 90°, x 10rem (=10 vw), origin center bottom` → `1, 0°, 0`; **1.2 s, `Out`**; `delay = 0.3 + 0.1 × index`; **stagger 0.1** | `opacity 0, rotateX −90°, x −10rem` (0.4 s, `In`) | Script words (`Estepona`, `yours`, `Live in`, "The" in menu) |
| **`h`** (heading) | words + chars (smartWrap) | `opacity 0, yPercent 50, rotateY 90°` → `1, 0, 0°`; **1.2 s, `Out`**; delay as above; **stagger 0.05** | `opacity 0, yPercent −50, rotateY −90°`; 0.4 s `In`; stagger 0.025 | All display headings and quotes |
| **`p`** (paragraph) | lines + words, `mask: 'lines'` | `yPercent 110 → 0`; **1.2 s, `Out`**; delay 0.3 + 0.1 × index; **stagger 0.1** | `yPercent −110`, 0.4 s `In`, stagger 0.05 | Body copy, statements, captions |
| **`ctn`** (container) | none | `opacity 0, y 3.333 rem (11.54 rem on mobile)` → `1, 0`; 1.2 s `Out`; stagger 0.1 | `opacity → 0` with `y → 0` (it fades in place; it does **not** travel back to the offset); 0.4 s `In`, stagger 0.05 | Buttons, cards, pagination, images that fade up |
| **`line`** | none | `clip-path inset(0 0 100% 0) → inset(0)` 1.2 s `Out`, stagger 0.1 | `inset(100% 0 0 0)` 0.4 s `In` | Hairlines drawing downward |
| **`slide`** | none (wrapper + first child) | wrapper `clip-path polygon(100% 0, 100% 0, 101% 100%, 125% 100%) → polygon(0 0, 100% 0, 100% 100%, 0 100%)` **and** inner child `scale 1.5, xPercent 25 → 1, 0`; **1.2 s, `InOut`** | wrapper → `polygon(0 0, 0 0, 0 100%, 0 100%)` and child `scale 1.5, xPercent −25`; 1.2 s `InOut` | Image reveals in sliders and tab swaps (a *diagonal curtain wipe from the right*) |

**Delay and stagger semantics [V].** Every primitive takes `(elements, mode, delay?)`. Default delay = `delayReveal` (0.3 s) when `delay` is omitted; an explicit `0` is honoured (used by hides and by section timelines). For `a`, `h` and `p` the delay is `(delay ?? 0.3) + elementIndex × 0.1` where *elementIndex* is the element's position within the group being revealed (so three headings in one wrapper start 0.1 s apart), and the per-piece `stagger` then runs inside each element (chars 0.1 for `a`, 0.05 for `h`, lines 0.1 for `p`). `ctn`, `line` and `slide` use a flat `delay ?? 0.3` (with `stagger 0.1` across a group for `ctn` and `line`; `slide` has none). Hide stagger is always half (`a`, `ctn`, `line`, `p`) or a quarter (`h`) of the reveal stagger. **Initial poses:** `a` is initialised in its *hide* pose (`rotateX −90°, x −10rem, origin center top`) but reveals *from* `rotateX +90°, x +10rem, origin center bottom`; `h` initialises to the reveal-from pose; `slide` initialises fully clipped (`inset(100% 0 0 0)`) with the child at `scale 1.5, xPercent 25`.

**Trigger rule [V]:** for each type, elements are first set to their *initial* state and `visibility: visible`; then **one ScrollTrigger per wrapper** (`closest('[data-scroll-reveal="w"]')` or the element itself) with `start: 'top bottom'`, `once: true`, `onEnter → reveal`. Inside horizontal tracks (`[data-scroll-horizontal]`) the trigger uses `containerAnimation: <that track>._horizontalTween` and `start: 'left bottom'`. Elements marked `[data-reveal-first]` suppress sibling reveals so only the first in a group animates. These are **not reversible** (`once: true`) — except in the sections listed in §D.4 that use `onLeaveBack` hides.

**Manually driven variants [V]:** sections with a bespoke timeline (architecture, footer, concept block) do *not* use the wrapper rule. They tag text with `data-text="h|p|ctn"`, call the same primitives with mode `'initial'` at init, then `'reveal'` (with an explicit delay) from their own ScrollTrigger `onEnter` and `'hide'` (delay 0) from `onLeaveBack`. Page-transition and modal code also call the primitives programmatically through `data-part="<type>"` hooks. In your rebuild, expose each primitive as `reveal(el, mode, delay)` where mode ∈ `'initial' | 'reveal' | 'hide'`.

**Pseudocode (reusable hook):**

```ts
function reveal(type: 'a'|'h'|'p'|'ctn'|'line'|'slide', els: Element[], delay = 0.3) { /* per table */ }
els.forEach(group => {
  prime(type, group);                               // set initial states, visibility: visible
  ScrollTrigger.create({ trigger: group.wrapper, start: 'top bottom', once: true,
                         onEnter: () => reveal(type, group.items) });
});
```

### D.3 Parallax primitives **[V]** (`data-parallax` inside a `data-parallax="w"` wrapper)

| Attribute | From → To (`yPercent`) | start → end | Scrub |
|---|---|---|---|
| `img` | −15 → +15 | `top bottom` → (default) `bottom top` | 0.5 |
| `img-out` | 0 → +20 | `bottom bottom` → `bottom top` | 0.5 |
| `img-in` | −20 → 0 | `top bottom` → `bottom bottom` | true |
| `ctn-down` | −10 → +10 | `top 125%` → `bottom −25%` | 0.5 |
| `ctn-up` | +10 → −10 | `top 125%` → `bottom −25%` | 0.5 |

`translateZ: 10` is applied on images to force compositing. Wrappers can opt out with `data-mob="off"` / `data-desk="off"`. 26 elements are parallaxed on the home page. Requires images ≥ 130 % of their frame height.

---

### D.4 Per-section animation specification

> **Columns:** *Trigger / scroll link* tells you whether progress is scrubbed. *Reversible* = does scrolling back undo it.

#### Section 1 — Hero

| ID | Target | Trigger / scroll link | Initial → Final | Timing / ease | Reversible | Implementation | Mobile / reduced motion |
|---|---|---|---|---|---|---|---|
| **S1.1** | `h1` (`ERA`,`RESIDENCE`), script `Estepona`, "A PLACE"/"TO RETURN TO", toggle, circle CTA | Fires at init during the preloader dive (G1 `<25%`); `once` | Per G9: `h` chars flip in; `a` script chars flip up from the right; `ctn` fade-up | 1.2 s `Out`; headline chars stagger 0.05; script 0.1; delays 0.3 + 0.1 × index | No | `reveal()` hook | Same; reduced-motion → show instantly |
| **S1.2** | `.hero-s` (text stage), `.hero-w_bg` (photo) | **Scrubbed 1:1**, trigger = whole hero area, `top top → bottom bottom` (3 946 px) | Stage `y 0 → −(1.25·bgH − vh)` (≈ −369 px); bg `y 0 → −(bgH − vh)` (≈ −125 px); then bg `scale 1 → 2`, `transformOrigin 50% 75%` | Translates occupy timeline 0 – 0.6 (`Ease`); zoom occupies 0.4 – 1.0 (`In` = accelerating) | Yes (scrub) | `gsap.timeline({scrollTrigger:{scrub:true,…}})` — see code below | **Mobile:** translates removed; only `scale 1 → 2` across the whole (shorter, 2 235 px) area |
| **S1.3** | Day/night image pair + toggle | Click on `BY DAY` / `BY NIGHT` | night img `opacity 0 → 1` (or reverse); divider class `is-day` / `is-night`; active label brightens | 0.8 s `InOut`; ignored while busy | n/a | G16 | Same |
| **S1.4** | 3 hotspot pins | Always on; hover | Pulse rings loop; hover reveals trailing tooltip card (G15); plus icon rotates | loop 1.2 s; tooltip lag 2.4 s | n/a | G12 + G15 | < 992: tap opens bottom sheet (G14) |
| **S1.5** | "View available apartments" circle | Hover | Arc grows to half circle | 0.8 s `InOut` | Yes (reverse) | G12 | n/a on touch |
| **S1.6** | Scroll cue + bar | Scrub | Bar number counts 00 → 100; cue fades out near footer | scrub | Yes | G8; `gsap.to(cue,{opacity:0,ease:'InOut',scrollTrigger:{trigger:footer,start:'top bottom',end:'center bottom',scrub:true}})` | Bar hidden < 992 |

```js
// S1.2 — hero dolly
const t = bg.offsetHeight;                              // ~1.15 × viewport height
const tl = gsap.timeline({ scrollTrigger: { trigger: heroArea, start: 'top top', end: 'bottom bottom', scrub: true }});
if (!isMobile) {
  tl.fromTo(stage, { y: 0 }, { y: -(1.25 * t - innerHeight), ease: 'Ease', duration: .6 })
    .fromTo(bg,    { y: 0 }, { y: -(t - innerHeight),        ease: 'Ease', duration: .6 }, '<');
}
tl.fromTo(bg, { scale: 1, translateZ: 10, transformOrigin: '50% 75%' },
              { scale: 2, translateZ: 10, ease: 'In', duration: .6 }, isMobile ? '>' : '-=0.2');
```

#### Section 2 — Arch intro

| ID | Target | Trigger / scroll link | Initial → Final | Timing / ease | Reversible | Implementation |
|---|---|---|---|---|---|---|
| **S2.1** | Arch panel entering over pinned hero | **Plain document flow**, no tween: negative top margin ≈ `−(100vh + 50vw)` with `position: relative; z-index: 1` | n/a | n/a | Yes | CSS only |
| **S2.2** | `[data-circle-text]` words | Scrubbed `top bottom → bottom top` of the section | `word-spacing 0rem → 10rem` | `none` (linear) | Yes | `gsap.fromTo(words,{wordSpacing:'0rem'},{wordSpacing:'10rem',ease:'none',scrollTrigger:{trigger:w,start:'top bottom',end:'bottom top',scrub:true}})` |
| **S2.3** | Label, caption, hairline | G9 `ctn` / `line` on enter | per G9 | 1.2 s | No | `reveal()` |

#### Section 3 — Three-reasons slider; Section 7 — Typologies slider

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S3.1 / S7.1** | Slider | IntersectionObserver ≥ 20 % visible → auto-advance 6 s | G13 |
| **S3.2 / S7.2** | Snap | G5 | Eases into alignment (1.2 s `Ease`) if > 50 % visible on scroll-stop |
| **S3.3** | Title chars flip (`h`), paragraph lines (`p`), CTA fade (`ctn`), image diagonal wipe (`slide`) | Slide change | G9 per slide |

#### Section 4 — Pull quote

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S4.1** | Background photo | Scrub, G10 `img` | `yPercent −15 → +15` |
| **S4.2** | Quote mark, quote (`h`), attribution (`ctn`) | Enter, once | G9 |
| **S4.3** | Bougainvillea alpha-video on the seam | G11 | Plays while visible |

#### Section 5 — Concept + horizontal chapter

| ID | Target | Trigger / scroll link | Initial → Final | Timing / ease | Reversible | Implementation |
|---|---|---|---|---|---|---|
| **S5.1** | `.loc-info-s` (concept block) | Scrubbed 0.5 s lag; trigger `.loc-info-w`, `top 30% → bottom bottom` | `opacity 0, scale 0.75 → 1, 1` (position 0, `none`); paragraph (`p`) and `ctn` reveal on enter (delay 0.1 s) and *hide* on leave-back | scrub 0.5; text 1.2 s | **Yes** | `gsap.timeline({scrollTrigger:{trigger,start:'top 30%',end:'bottom bottom',scrub:.5,onEnter:()=>reveal('p',…,.1),onLeaveBack:()=>hide('p',…,0)}}).fromTo(s,{opacity:0,scale:.75},{opacity:1,scale:1,ease:'none'},0)` |
| **S5.2** | `.loc-scroll-area_track` | Scrub **0.25** (lag); trigger = area, `start "2.5% top"`, `end "97.5% bottom"`; ≥ 992 only; area height = `track.scrollWidth` | `x 0 → −(scrollWidth − areaWidth)` | ease `horScroll` (cubic-bezier .25,0,.75,1) | Yes | `gsap.to(track,{x:-dist,ease:'horScroll',scrollTrigger:{trigger:area,start:'2.5% top',end:'97.5% bottom',scrub:.25}})`; store the tween as `area._horizontalTween` for children's `containerAnimation` |
| **S5.3** | Three title lines `NEW / GOLDEN / MILE` | Scrub 0.25 across the whole area (`top top → bottom bottom`) | `xPercent` per line: `[−5, 25, −15] → [+5, −25, +25]` (via `gsap.utils.wrap`) | `none` | Yes | line 1 drifts right, line 2 left (fast), line 3 right (fast) |
| **S5.4** | Flowers `.flower.loc-intro`, `.flower.loc-path` | Scrub 0.25 | intro flower `xPercent 0 → −25` (whole area); path flower `yPercent 0 → 25` (`bottom bottom → bottom top`) | `none` | Yes | — |
| **S5.5** | Route-line SVG (`.img.loc-path`) | Enters the viewport horizontally (`containerAnimation`, `start 'left bottom'`), `once` | `clip-path inset(0 100% 0 0) → inset(0)` — the line **draws left → right** | **2.4 s (2 × durL), `Out`, delay 0.8 s** | No | `gsap.fromTo(line,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:2.4,ease:'Out',delay:.8,scrollTrigger:{trigger:line,containerAnimation:hTween,start:'left bottom',once:true}})` |
| **S5.6** | All headings / paragraphs / CTAs in the track | G9 with `containerAnimation` (`left bottom`, once) | per G9 | — | No | — |
| **S5.7** | Terrace photograph + text | G9 `slide` and `p`/`ctn` **[I]** | diagonal wipe | 1.2 s `InOut` | No | — |

> **Mobile:** `matchMedia('(min-width:992px)')` guards S5.2–S5.4, so below 992 px none of them exist; blocks stack; route map becomes a manual drag strip with `scrollLeft` pre-centred.

#### Section 6 — Aerial context

| ID | Target | Trigger | Initial → Final | Timing | Reversible |
|---|---|---|---|---|---|
| **S6.1** | `.loc-w_bg_img` | Scrub 0.25, `top bottom → bottom bottom` | `scale 1.15 → 1`, `transformOrigin center bottom` (`gsap.from`) | `Ease` | Yes |
| **S6.2** | Cloud layers (3 sprites, AVIF) | G10 `img-in` / `img-out` | `yPercent −20 → 0` / `0 → 20` | scrub | Yes |

#### Section 8 — Range statement

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S8.1** | 3-line statement (`h`), vertical hairline (`line`), caption (`p` / `ctn`), bloom glyph (`ctn`) | Enter, once | G9: heading chars flip in (stagger 0.05), hairline draws downward (1.2 s `Out`), caption lines rise through their masks |
| **S8.2** | Bottom-left flower clip | G11 (plays while visible); light parallax on its wrapper **[I]** | Foreground "warmth" layer sways while the statement is read |
| **S8.3** | Exit | None | **Hard cut**: the flat powder-sky field ends and the full-bleed night photograph begins with no tween — the strongest cut on the page; preserve it |

#### Section 9 — Amenities

| ID | Target | Trigger / scroll link | Initial → Final | Timing / ease | Reversible | Implementation |
|---|---|---|---|---|---|---|
| **S9.1** | `.amen-cms` (image stage) and `.amen-w` (wrapper) | Scrub 1:1, trigger `.amen-scroll-area`, `top top → bottom bottom` (area 2 670 px tall → **1 819 px of scroll** at vh 851) | stage `scale 1 → 2` (`In`); wrapper `opacity 1 → 0` (`In`, position `<`) | `In` | Yes | `gsap.timeline({scrollTrigger:{trigger:area,start:'top top',end:'bottom bottom',scrub:true}}).fromTo(stage,{scale:1},{scale:2,ease:'In'}).fromTo(wrap,{opacity:1},{opacity:0,ease:'In'},'<')` |
| **S9.2** | Image + caption on tab click | Click on a list item (5 items) | New image wipes in diagonally from the right (`slide` reveal) while the old wipes out left; caption chars/lines hide then reveal | 1.2 s `InOut` | n/a | G16 + G9 `slide` |
| **S9.3** | Highlight bar | Click | `y / height` to the item | 0.8 s `InOut` | n/a | G16 |
| **S9.4** | Auto-advance of amenity tabs | **[U]** Not observed within ≈ 10 s; treat as click-only | — | — | — | — |

#### Section 10 — "THE SPACE TO Live in"

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S10.1** | Cream arch panel over amenities | Document flow (negative margin) | Rises over the scaling/fading image (see S2.1) |
| **S10.2** | Stacked title + script `Live in` | Enter, once | `h` chars + `a` script chars (G9) |
| **S10.3** | Images (terrace, garden inset, interior slider, plum block) | Scrub parallax (`img`, `img-in`), plus `slide` reveals | G10 / G9 |
| **S10.4** | Interior slider | G13 | Auto 6 s, arrows, progress |
| **S10.5** | Circle CTA | Hover | G12 |

#### Section 11 — Architecture (the signature scrub)

Trigger: ScrollTrigger on `.arch-intro-s` with `start: 'top bottom'`, `end: '200% top'` (≈ 3 viewport heights of scroll), `scrub: true`, **desktop only (≥ 992)**. One timeline, with **relative durations** (total = 1.0):

| Order | Time | Target | From → To |
|---|---|---|---|
| 1 | 0 – 0.5 | **Window L** (`.arch-intro-s_bg_l`, `clip-path`) | `polygon(0% 0%, 0% 100%, 44.444% 100%, 44.444% 36.111%, 98.889% 36.111%, 98.889% 99.074%, 44.444% 99.074%, 1.111% 100%, 100% 100%, 100% 0%)` → same with `y₀ = 18.519 %`, `y₁ = 81.481 %` (moves **up** 17.6 % of the box) |
| 1b | 0 – 0.5 (`<`) | **Window R** (`.arch-intro-s_bg_r`) | `polygon(0% 0%, 0% 100%, 1.111% 100%, 1.111% 0.926%, 55.556% 0.926%, 55.556% 63.889%, 1.111% 63.889%, 1.111% 100%, 100% 100%, 100% 0%)` → `y₀ = 18.519 %`, `y₁ = 81.481 %` (moves **down** 17.6 %) |
| 2 | 0.5 – 0.6 (L then R in parallel, 0.1 each) | Window L: right edge `98.889 % → 100 %`, window spans x `44.444 %–100 %`; Window R: left edge `1.111 % → 0 %`, window spans x `0 %–55.556 %` (both y 18.519–81.481 %) | The thin side gaps close; the two horizontally-offset windows now read as **one continuous opening** (they overlap in x 44.4–55.6 %) |
| 3 | 0.6 – 1.0 | Stage `.arch-intro-s` `scale 1 → 1.84` (`InOut`); left flower `scale 1.84, xPercent −50`; right flower `scale 1.84, xPercent +50`; content stage `.arch-w` `scale 0.75 → 1` (`transformOrigin center top`) | The composition zooms until the image fills the viewport while the bougainvillea branches fly outward |

Everything in 1–3 is `ease: 'none'` for steps 1–2 (pure scroll mapping) and `InOut` for step 3 (eased within the scrub).

Additional S11 effects:

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S11.2** | Giant `ARCHITECTURE` (fit-text) + paragraph | `ScrollTrigger` `start '30% top'` on the whole area; **reversible** | `onEnter`: `h` reveal (delay 0), `p` reveal (delay 0.4); `onLeaveBack`: hide both |
| **S11.3** | Façade image | scrub, `start '55% top'`, `end 'bottom top'` | `yPercent 0 → 25` (drops away slower than the page → feels held) |
| **S11.4** | Initial states | on init | `animateTextH(h,'initial')`, `animateTextP(p,'initial')` so they are hidden until S11.2 fires |

*Reproduction note:* the polygons come from a 1920 × 1080-ish stage (percentages such as `44.444 %` = 8/18 and `18.519 %` = 10/54, i.e. a 18 × 54-cell grid). The visible result is a **diptych of one continuous photograph** that slides together and then opens to full-bleed. A modern equivalent: one full-bleed image + two cream plates whose `clip-path: inset(top right bottom left)` windows are interpolated, or two image tiles whose `clip-path`/`object-position` are animated. Reproduce the *visual sequence* (offset diptych → aligned → merged → zoomed), not the polygon coordinates **[U: how the plate layers are stacked in the original was not determined]**.

#### Section 12 — Credibility statement

| ID | Target | Trigger | Behaviour |
|---|---|---|---|
| **S12.1** | 4-line statement (`h`), hairline (`line`), flower video | Enter, once; G11 | G9 |

#### Sections 13–14 — CTA → Footer

| ID | Target | Trigger / scroll link | Initial → Final | Timing | Reversible |
|---|---|---|---|---|---|
| **S13.1** | `[data-footer-clip]` (CTA photograph) | Scrub **0.5**, trigger `.footer-w`, `start 'top 30%'`, `end 'bottom bottom'` | `clip-path inset(0 0 0 0) → inset(8% 22% 8% 22%)` desktop / `inset(4% 32% 4% 32%)` mobile | `none` | Yes |
| **S14.1** | `.footer-s` (footer content) | Same timeline, position 0 | `opacity 0, scale 0.75 → 1, 1` | `none` | Yes |
| **S14.2** | Footer headings / paragraphs / buttons | Same ScrollTrigger `onEnter` (delay 0.1 s) / `onLeaveBack` hide | G9 `h`, `p`, `ctn` | 1.2 s | **Yes** |
| **S14.3** | `.s-down` scroll cue | `top bottom → center bottom` of footer, scrub | `opacity 1 → 0` | `InOut` | Yes |
| **S14.4** | Lot-page sticky header | `/apartments/NNN`: ScrollTrigger `start '100px top'` | toggles `.is-top` on `.lot-s_info_header` / `.lot-s_info_line` | instant | Yes |

---

## E. Scroll Timeline

**How to read.** Positions are `window.scrollY` at a **1084 × 851 desktop viewport** (document 20 343 px; maximum scroll = 19 492 px = 22.9 viewport heights). "% bar" is `scrollY / 19 492` — the number on the site's own scroll-bar label. The ScrollTrigger start/end strings are **[V]**; the pixel positions are those strings applied to *measured* section boxes, so they are **[E]** to within a few tens of pixels. To re-derive for another viewport height: pinned/scrubbed areas scale with `vh`, and the arch overlap is `100vh + 50vw`.

### E.1 The one-page timeline (desktop)

| scrollY (px) | % bar | What the viewer sees / what is running | Driver |
|---|---|---|---|
| t = 0 → ≈ 10 s | — | Preloader: text lockup → progress line → arch rises → dives → hero scales 0.75 → 1. Scroll locked | Timed (G1) |
| 0 | 0 % | Hero assembled: headline, script, toggle, pins, circle CTA; left scroll bar at `00` | Timed text reveals (S1.1) |
| 0 → 3 946 | 0 → 20 % | **Hero dolly.** Text stage rises ≈ 369 px and photo rises ≈ 125 px (timeline 0 → 0.6), then the photo zooms ×2 about its lower-centre (timeline 0.4 → 1.0, accelerating `In`) | **Scrub 1:1** (S1.2) |
| 2 553 → 3 946 | 13 → 20 % | Arch panel rises over the zoomed hero (document flow, margin −(100vh + 50vw)); its words spread apart along the arc | Flow + **scrub** `word-spacing 0 → 10 rem` (S2.2) |
| 3 520 → 4 372 | 18 → 22 % | **Snap zone** for the three-reasons slider: if scrolling stops with > 50 % of the slider visible, the page eases to `scrollY = 3 946` (1.2 s, `Ease`) | Lenis `scrollTo` (G5) |
| ≈ 3 946 | 20 % | Slider cycles every 6 s; progress bar fills; each change flips title chars, lifts paragraph lines, wipes the image diagonally | Timed (G13) |
| 3 946 → 5 610 | 20 → 29 % | Pull-quote photo drifts `yPercent −15 → +15` as the section crosses the viewport; quote chars flip in when its wrapper enters | **Scrub 0.5** + once (S4) |
| ≈ 5 355 → 5 610 | 27.5 → 29 % | Concept block fades in and scales 0.75 → 1 (paragraph reveals on enter, hides on leave-back) | **Scrub 0.5**, reversible (S5.1) |
| 5 695 → 8 072 | 29 → 41 % | **Horizontal chapter.** Track `x: 0 → −2 347 px` (≈ 1 : 1 with scroll, 0.25 s lag, `horScroll` ease). Concept slides left; `NEW / GOLDEN / MILE` lines drift in opposing directions; terrace photo + CTA enter; coast statement; route line draws left → right (2.4 s, delay 0.8 s) | **Scrub 0.25** + `containerAnimation` reveals (S5.2–S5.7) |
| 8 157 → 9 106 | 42 → 47 % | Aerial photograph settles `scale 1.15 → 1` (origin bottom); three cloud layers parallax in/out | **Scrub 0.25** + parallax (S6) |
| 9 957 | 51 % | Typologies slider (snap section): same behaviour as at 3 946 | Timed + snap |
| 10 808 | 55 % | Range statement (powder sky): chars flip in; flower video plays | Once + video (S8) |
| 11 451 → 13 270 | 59 → 68 % | **Amenities pin.** Night-pool image scales ×2 (`In`) while the wrapper's opacity goes 1 → 0 | **Scrub 1:1** (S9.1); tab clicks wipe images |
| 11 877 → 12 728 | 61 → 65 % | Cream arch panel (section 10) rises over the amenities stage (overlap 1 393 px) | Flow; no tween |
| 12 728 → 14 970 | 65 → 77 % | "THE SPACE TO Live in": heading chars + script flip; terrace image parallax; plum block with flower video; interior slider (6 s) | Once + scrub parallax + timed slider |
| 14 119 → 16 672 | 72 → 85.5 % | **Architecture diptych timeline** (relative time 0 → 1): 0–0.5 windows slide in opposite vertical directions; 0.5–0.6 side gaps close; 0.6–1.0 whole stage zooms ×1.84, flowers fly out ±50 %, content stage 0.75 → 1 | **Scrub 1:1** (S11.1) |
| ≈ 15 837 | 81 % | `ARCHITECTURE` headline (chars) then paragraph (+0.4 s) reveal; reverse on scroll-up | ScrollTrigger `30% top`, reversible (S11.2) |
| 16 560 → 17 861 | 85 → 91.6 % | Full-bleed façade image drifts down `yPercent 0 → 25` | **Scrub 1:1** (S11.3) |
| 17 861 → 18 477 | 91.6 → 94.8 % | Credibility statement; flower video | Once (S12) |
| 18 222 → 19 492 | 93.5 → 100 % | **Footer scrub.** CTA photo `clip-path inset(0) → inset(8% 22% 8% 22%)`; footer content fades 0 → 1 and scales 0.75 → 1; footer text reveals at the start (+0.1 s) and hides if you scroll back | **Scrub 0.5** + reversible (S13/S14); assumes `.footer-w` wraps CTA + footer **[E]** |
| 18 477 → 19 492 | 94.8 → 100 % | Scroll cue fades out (`top bottom → center bottom` of the footer); bar label reaches `100` | Scrub (S14.3) |

### E.2 Types of scroll relationship

| Type | Moments | Technique |
|---|---|---|
| **Scrubbed 1:1** (`scrub: true`) | Hero dolly, amenities zoom, architecture diptych, arch text spacing, architecture image drift, scroll cue | Motion locked to the Lenis-smoothed scroll |
| **Scrubbed with lag** (`scrub: 0.25 / 0.5`) | Horizontal chapter, flowers, concept fade-in, aerial scale, parallax images, footer clip | Soft, floaty catch-up |
| **Triggered once** (`once: true`) | Every heading, script, paragraph, CTA, hairline, image wipe, route-line draw | `ScrollTrigger({ start: 'top bottom', once: true })` |
| **Triggered, reversible** | Concept paragraph, architecture heading/paragraph, footer text | `onEnter: reveal`, `onLeaveBack: hide` |
| **Timed, scroll-independent** | Preloader, sliders (6 s), hovers, tooltips, pin pulses, badge rotation (30°/s base) | GSAP timelines, ticker |
| **Pure CSS flow** | Arch panels overlapping the previous section; sticky stages | Negative margins + z-index + `position: sticky` |
| **Snap / assist** | Two slider sections (desktop only) | Lenis `scrollTo` after 40 ms without scroll events |

### E.3 Scroll-length budget (size your pinned areas from this)

| Area | Height (px @ vh 851) | In vh | Scroll consumed |
|---|---|---|---|
| Hero scroll area | 4 797 | 5.64 | 3 946 (= area − vh) |
| Horizontal chapter | 3 398 (= `track.scrollWidth`) | 4.0 | 2 377 (translate 2 347) |
| Amenities | 2 670 | 3.14 | 1 819 |
| Architecture area | 2 891 | 3.4 | ≈ 2 553 for the timeline (3 × vh) **[E]** |
| Whole document | 20 343 | 23.9 | 19 492 |

Rule of thumb: **scroll area height ≈ travel distance + vh**; the JS sets the horizontal area's height from `track.scrollWidth` and relies on native sticky positioning for the pin.

### E.4 Overlap map (what covers what)

```
hero (sticky, scales ×2) ─────────────────┐
   arch intro (z+1, margin-top −(100vh+50vw)) ┐   ← rises over the zoomed hero
      three-reasons slider                    │   (same colour field = no seam)
pull-quote photo ──── hard cut ───────────────┘
concept + horizontal chapter (sticky stage)
aerial photo ── cream→sky cloud overlay ── bevelled slab → typologies slider (snap)
range statement ── HARD CUT ── night amenities (sticky, scales ×2, fades)
      cream arch panel (z+1, margin-top −(100vh+50vw)) rises over amenities
"space to live in" → cream diptych → full-bleed façade → statement
CTA photo (clip-path shrinks) → plum footer behind
```

---

## F. Interaction Specification

**Format:** *trigger → state change → duration / ease → notes.* Mechanisms are in §D.

### F.1 Global

| Interaction | Trigger | Result | Timing | Notes |
|---|---|---|---|---|
| **Smooth scrolling** | wheel / trackpad / keys | Lenis exponential-out easing | 1.2 s | Native scrolling on touch (no `syncTouch`) |
| **Scroll-bar thumb drag** | pointer down on thumb, move | Page scrubs to the pointer ratio | `lenis.scrollTo(…, 3.2 s)` per move | Cursor `grab` → `grabbing`; desktop only |
| **Scroll-bar rail click** | click | **[U]** not tested | — | |
| **Logo badge** | always | Rotates 30°/s; scroll velocity adds ≈ 10 × \|v\| and sets direction; settles 100 ms after scrolling stops, over 1.2 s | G7 | Click → `/` with page transition |
| **Header theme** | scroll | Logo, nav, bar, cue recolour as they cross section edges | class swap + CSS transition | Navy on light, cream on dark |
| **Nav hover** | pointer enter | Per-character vertical roll with left-to-right stagger | 0.8 s `Ease` | |
| **Menu modal** | `MENU` (mobile) | Full-screen plum, links reveal, bars rotate to ✕ | 0.8 s | `Esc` closes |
| **Cookie card** | first visit | Bottom-right; `ACCEPT` / `DECLINE`; inspection used **decline** | **[U]** timing | |

### F.2 Home page

| Interaction | Trigger → response |
|---|---|
| **Day / night toggle** | Click `BY DAY` / `BY NIGHT` → incoming photo `opacity 0 → 1` (0.8 s `InOut`), divider class flips, active label bright / inactive ≈ 50 % |
| **Hero pins (3)** | Hover → cream card (≈ 17 × 24 vw) trails the cursor with a 2.4 s `power3` lag, flipping side near edges; plus icon rotates. < 992 px: tap opens a bottom sheet |
| **Circle CTA** | Hover → SVG arc grows from ≈ 15° to a half-circle (0.8 s `InOut`), reverses on leave; magnetic drift toward the cursor (strength 25, elastic return 1.6 s) |
| **Three-reasons / typologies sliders** | Auto 6 s; arrows; click resets timer; pause when < 20 % visible or tab hidden; mid-transition clicks ignored |
| **Link hover** | Letters flip out/in with rotateY (0.8 s `Out`, stagger 0.025); underline retracts right and re-grows from left |
| **Horizontal chapter** | Scroll only; only the CTA is clickable |
| **Route map** | Draws once on entry; **[U]** no hover states observed |
| **Amenities list** | Click item → diagonal image wipe (1.2 s `InOut`) + caption hide/reveal + highlight bar slides (0.8 s `InOut`). Auto-advance **[U]** (not seen within ≈ 10 s) |
| **Interior slider** | As the sliders above, with `‹ 1 ——— 2 ›` pagination |
| **Book-a-call modal** | `BOOK A CALL` (nav and two CTAs) → centred sky card on a navy veil; underline-only fields NAME / EMAIL / PHONE / MESSAGE; SUBMIT; ✕ and overlay close it. **Not submitted during inspection** |
| **Footer phone** | `tel:` link with letter-roll hover |
| **Credits logo** | Hover → Lottie scrubs to 50 %, leave → 100 % (1 s) |
| **TO TOP** | Click → Lenis scroll to 0 |

### F.3 `/apartments` and lot pages

| Interaction | Behaviour |
|---|---|
| **Filter bar** (`Typology / Bedrooms / Sort by / Reset`) | Custom selects; changing a filter filters/sorts the CMS list client-side; count (`25`) updates; Reset restores. **[U]** exact card in/out animation (`initFilter`, `initSort`, `initReset`, `initSelect` not read) |
| **Apartment card hover** | Lift + lighter fill + soft shadow **[E]** |
| **Card click** | Barba transition (visible text hides → fade out → fade in) → `/apartments/NNN` |
| **Lot sticky info** | After 100 px of scroll the header and line lose `.is-top` |
| **Tabs INFO / BENEFITS** | Highlight bar slides (0.8 s `InOut`); content crossfades (0.8 s) |
| **`+` on plan** | Zoom/lightbox **[U]** (`initImageZoom`, `initLightbox` not read) |
| **SUBMIT A REQUEST / PDF** | Opens the call modal / a PDF link. **No file was downloaded** |

### F.4 Control states

| State | Original | Recommended for the rebuild |
|---|---|---|
| Default | cream / navy, thin outline pills | Match §B tokens |
| Hover | letter roll / arc / underline swap, 0.8 s | Keep; gate behind `@media (hover: hover)` (the original has **no** hover media queries [V: 0 in its CSS]) |
| Focus-visible | **No `:focus-visible` rules; 11 `:focus` rules; 9 `outline: none/0` declarations [V]** | **Add** a visible 2 px outline, offset 3 px, in the current text colour |
| Pressed | none observed | Optional scale 0.98 |
| Disabled / loading | not observed | 40 % opacity / none |

---

## G. Asset Requirements

**Principle.** Rebuild with *your own* brand, copy, photography and fonts. What must be reproduced is the **role, format and treatment** of each asset family, because the choreography depends on them (spare image height for parallax, alpha channels for the foreground flowers, aligned day/night frames, etc.).

### G.1 Delivery facts observed on the home page [V]

| Fact | Value |
|---|---|
| Requests on first load | 108 |
| `<img>` elements | 41 = 24 WebP + 12 AVIF (3 distinct cloud sprites, repeated) + 5 SVG. 35 have `alt=""` (decorative); 0 lack an `alt` attribute |
| Image loading | All `eager`; every raster `<img>` has a `srcset` (Webflow responsive ladder). Largest variant chosen at 1084 px viewport, DPR 2 was ≈ 1084 px wide → the ladder tops out low; true source size **[U]** |
| CSS background images | **None** — all photography is `<img>` (so `object-fit: cover` + `transform` animate cleanly) |
| Video | 8 `<video>` elements, 7 distinct clips (one clip is used twice) — see G.3 |
| Scripts | 13 external (jQuery 3.5.1, Webflow runtime, GSAP 3.15.0 + ScrollTrigger + SplitText + CustomEase from jsDelivr, Lenis from unpkg, Barba 2.10.3, lottie-web 5.12.2, the Slater-hosted custom module) plus Adobe Fonts, GTM and Meta Pixel |
| Byte sizes | Cross-origin responses hide transfer size, so per-asset weights are **[U]**; budgets in G.8 are recommendations, not measurements |

### G.2 Photography (CGI architectural renders + a few aerial / lifestyle images)

| Role | Count (home) | Observed aspect (natural) | Treatment in motion | Requirements for your version |
|---|---|---|---|---|
| **Hero day + hero night** | 2 | 1084 × 975 (≈ 1.11 : 1, i.e. taller than the viewport) | Pinned, drifts up, then scales ×2 about `50% 75%`; day/night crossfade | **Identical camera + framing in both**, pixel-aligned. Keep important detail in the *lower centre* (it ends up filling the viewport). Source ≥ 3 200 px wide so a ×2 zoom is still sharp on 1600 px screens at DPR 2 |
| **Pull-quote photo** | 1 | 4 : 3 – 16 : 9 | Parallax `yPercent −15 → +15` | Needs ≥ 130 % of the frame height (the original uses `scale`/height headroom) |
| **Terrace portrait** | 1–2 | 1084 × 1356 (4 : 5) | Slides in the horizontal track; wipes (`slide`) | Portrait crop with a clear horizon |
| **Aerial context** | 1 | ≈ 1084 × 948 | `scale 1.15 → 1` (origin bottom) | Spare 15 % border; sky at the top so the cloud overlay can blend |
| **Cloud sprites** | 3 (AVIF) | 1084 × 606, 1546 × 960, 1842 × 960 | Parallax in/out; overlap the section seam | **Transparent-background** PNG/AVIF cut-outs of cloud banks; soft alpha edges |
| **Typology images** | 3 | 1084 × 985 – 1084 × 1084 | Diagonal wipe (`slide`), inner scale 1.5 → 1 | Consistent crop across slides |
| **Amenity images** | 5 | 1084 × 704 – 1084 × 1445 | Full-bleed stage scales ×2 then fades; tab swaps wipe | Wide masters; first image is the night shot that continues from the previous section |
| **Interior slider** | 4–6 | 1084 × 813, 1084 × 985, 1084 × 1192 | Auto 6 s slider with wipe | Consistent grade |
| **Architecture façade** | 1 full-bleed (+ two portrait crops) | 3 : 4 each | Two clip-path windows reveal one continuous picture | **Provide one large image** and let the plates reveal it — do not supply two separate crops |
| **CTA rooftop** | 1 | 16 : 9 | `clip-path inset` shrinks to an 8 %/22 % window | Dark enough for white type or add a veil |
| **Floor plans** | 25 (CMS) | Portrait | Cards on `/apartments`; large on lot pages | White-background vector or high-res PNG |

Colour grade (all images): saturated Mediterranean sky blue, warm white stucco, magenta bougainvillea, golden-hour light. Night variants are deep blue with warm interior lights.

### G.3 Foreground "life" videos (the bougainvillea sway) — the signature texture

| Property | Value [V] |
|---|---|
| Count | 7 distinct clips (`_01` … `_07`), 8 elements |
| Resolution / duration | 1080 × 1080, ≈ 10 s |
| Render size | 434 – 767 px squares at 1084 wide (some rotated 90° by CSS) |
| Attributes | `muted`, `loop`, `playsinline`, `preload="metadata"`, `autoplay` **false** (script starts/stops them), an AVIF `poster` on each |
| Sources | `.webm` first, `.mov` second (Safari); on non-Chrome WebKit the script strips the `.webm` sources. That they carry an **alpha channel** is [V visually — the flowers sit transparently over photos and colour fields]; the exact codecs (VP9/AV1 and HEVC) are **[I]** |
| Placement | Section corners and seams (concept, "NEW GOLDEN MILE", range statement, "space to live in" plum block, architecture corners, credibility, apartments page top-right) — see §C |

**If you cannot supply alpha video**, use one of these (in order of fidelity): (1) your own alpha-channel loops produced from a looping render of your own foliage; (2) animated AVIF/APNG with alpha; (3) 3–4 layered PNG leaf clusters swaying with GSAP (`rotation ±2°`, `transformOrigin` at the branch base, `sine.inOut`, yoyo, 6–10 s, de-synchronised); (4) static cut-outs with scroll parallax only.

Suggested encodes **[suggestion — verify with your own footage]**:

```bash
# WebM VP9 with alpha (Chrome, Firefox, Edge)
ffmpeg -i in.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 34 -an -auto-alt-ref 0 out.webm
# HEVC with alpha for Safari must be encoded on macOS (VideoToolbox)
ffmpeg -i in.mov -c:v hevc_videotoolbox -alpha_quality 0.75 -tag:v hvc1 -an out.mov
```

### G.4 Vector and Lottie

| Asset | Details [V] | Notes |
|---|---|---|
| Preloader decoration | SVG 1440 × 864 — frame lines + concentric arch outlines | Fade-in to opacity 1 at 1.2 s |
| Route line | SVG viewBox 1072 × 208 (renders 813 × 158 at 1084) | Hand-drawn coast path. **Drawn by a clip-path wipe, not stroke-dashoffset** |
| Route labels | Separate SVG, same viewBox | Stops + minute counts; dots sit on the line |
| "Landscape" line art | SVG 812 × 372 | Hero-area decoration **[I]** |
| Bloom glyph | Eight-petal flower, inline SVG | Logo core, dividers, footer, mobile menu |
| Badge ring text | Circular text path ("ERA RESIDENCE · ERA RESIDENCE") | Rotated by JS (G7) |
| Circle CTA | Two `<circle r=103.5>` arcs with `stroke-dasharray` | Hover grows arcs (G12) |
| Credits logo | Lottie JSON (99 frames) | Scrubbed by hover |
| Icons | Arrow, `+`/`×` in circles, three-dot menu glyph | ≤ 7 icons total |

### G.5 Fonts (do not copy — license your own)

| Role | Original | Licensing note | Stand-in guidance |
|---|---|---|---|
| Display | `ambroise-francois-std` (Adobe Fonts kit) | Needs your own Adobe Fonts / foundry licence | See §B.2 — condensed high-contrast Didone, uppercase, tight tracking |
| Script | `sloop-script-three` (Adobe Fonts) | As above | Formal copperplate script |
| Body / labels | `Maison Neue Extended` 400 + 700, self-hosted WOFF2 | Commercial | Expanded grotesque; tracking is the identity (0.05–0.8 em) |

Load strategy: `font-display: swap` is **not** needed if the preloader holds the page until `document.fonts.ready` — the original's preloader masks font loading **[I]**. Preload the display font and one body weight.

### G.6 Content model (for a CMS-driven rebuild)

`Apartment` item: number/slug, typology, bedrooms, interior area, terrace area, garden area, floor-plan image, PDF, benefits list, price/status **[U]**. `/apartments` shows the count and filters by Typology and Bedrooms, with sort. The home page copy is short statements (≤ 25 words each) plus micro-labels; write your own, same length discipline.

### G.7 Tracking and third parties (observed, not to be replicated blindly)

Google Tag Manager, gtag, Meta Pixel, Adobe Fonts. Non-essential cookies were **declined** during inspection. In the rebuild load them only after consent.

### G.8 Recommended asset budgets for the rebuild

| Item | Target |
|---|---|
| Hero (day + night) | ≤ 350 KB each at 2 400 w AVIF/WebP, plus a 1 200 w variant for < 992 |
| Each section photo | ≤ 200 KB at 1 800 w |
| Alpha video | ≤ 400 KB per clip (6–10 s loop, 540 px square is enough at ≤ 770 px display) |
| Fonts | ≤ 120 KB total (subset Latin) |
| JS (excluding analytics and framework) | ≈ 60–70 KB gz **[E]** for GSAP core + ScrollTrigger + SplitText + CustomEase + Lenis; add ≈ 60 KB only if you keep lottie-web |
| LCP target | < 2.5 s once past the preloader; the preloader should never block *interactivity* of the page underneath beyond ~10 s first visit |

---

## H. Technical Recommendations

### H.1 Implementation approach — Verified / Strongly inferred / Unknown

| Aspect | Verified **[V]** | Strongly inferred **[I]** | Unknown **[U]** |
|---|---|---|---|
| Platform | Webflow (shared CSS, CMS list on `/apartments`, jQuery 3.5.1, Webflow runtime) | Page layout built visually with custom classes (`.hero-w_bg`, `.loc-scroll-area_track`) | Whether Webflow Interactions (IX2) drive anything beyond the custom module |
| Animation | GSAP 3.15.0 + ScrollTrigger + SplitText + CustomEase; hand-written module hosted on Slater (≈ 59 KB) | Authored as one file, initialised per page | — |
| Smooth scroll | Lenis (duration 1.2), synced to GSAP ticker | — | — |
| Page transitions | Barba 2.10.3 (`sync: false`) | — | Behaviour on browser back/forward (not exercised) |
| Pinning | Computed `position: sticky` on `.hero-w`, `.loc-scroll-area_screen`, `.scroll-area_screen` (amenities stage), `.arch-intro-s`, `.arch-w` inside tall scroll areas — **no ScrollTrigger `pin`**; `initPins` handles **hotspot pins**, not scroll pins | — | — |
| Horizontal chapter | GSAP `x` tween on a track, scrubbed by vertical scroll, area height from `scrollWidth`, children use `containerAnimation` | — | — |
| Text effects | SplitText (chars / words / lines with masks), tagged by data attributes | — | — |
| Hero dolly, amenities zoom, architecture diptych, footer clip | Exact tween values in §D | — | — |
| Rendering tech | No canvas, no WebGL, no `<video>` for the hero | — | — |
| Arch panels | CSS radius `50vw` + negative margin overlap (computed values) | Built as Webflow class combos | — |
| Curved "THREE REASONS" text | `word-spacing` scrubbed (code) | Words placed on an arc by transform/SVG `textPath` | Exact construction |
| Chamfered card corners | Visible | `clip-path`/SVG mask/border-image | Exact construction |
| Alpha videos | Two sources per clip (WebM + MOV) | WebM = VP9 alpha, MOV = HEVC alpha | Codec specifics (not probed) |
| Forms | A form module exists (`initForm`, `initUtmFields`) and the modal has four fields | Posts to an external CRM/Webflow forms | Endpoint, validation (not read, not submitted) |
| Reduced motion | **No** `prefers-reduced-motion` handling anywhere (CSS and JS) | — | — |

### H.2 Recommended stack for the rebuild

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Astro** or **Next.js (App Router)**; static output | Mostly content; transitions can be done with the framework's router or Barba if multi-page |
| Motion | **GSAP 3.15+** with ScrollTrigger, SplitText, CustomEase (all loaded from npm — check the current licence terms) | Matches the reference's semantics 1 : 1 |
| Scroll | **Lenis** + `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` | Same feel |
| Page transitions | Barba (multi-page) or a View-Transitions / router-level fade | Reference is a plain fade-out/fade-in, so any approach is fine |
| Styling | CSS custom properties with the **1 rem = 1 vw** system (§B.1); no utility-class reliance for the fluid scale | Keeps the proportional behaviour |
| Types | TypeScript for the motion modules | Many cross-module states |
| Video | `<video>` with WebM + MOV alpha sources | As the reference |
| Lottie | `lottie-web` (light build) **only if** you keep a Lottie logo; otherwise SVG + GSAP | Saves ≈ 60 KB |

### H.3 Module layout and data-attribute contract

```
src/motion/
  config.ts        // BP = 992, durS .4, durM .8, durL 1.2, stagger .1, delayReveal .3, eases
  eases.ts         // CustomEase.create(...) × 8  (§B.7)
  lenis.ts         // init, ticker sync, lock/unlock, local Lenis for [data-lenis-scroll]
  reveal.ts        // a, h, p, ctn, line, slide  ×  initial | reveal | hide
  parallax.ts      // img, img-in, img-out, ctn-up, ctn-down
  theme.ts         // header theme ScrollTriggers
  snap.ts          // desktop-only magnet
  preloader.ts     // full + short
  transitions.ts   // Barba or router
  ui/{magnetic,link-hover,nav-roll,circle-btn,pins,tips,tabs,slider,modal,logo,scrollbar,video}.ts
  sections/{hero,arch-intro,loc-hscroll,aerial,amenities,architecture,footer}.ts
```

| Attribute (suggested) | Meaning |
|---|---|
| `data-reveal="a|h|p|ctn|line|slide"` + `data-reveal-wrap` | Scroll-triggered text/element reveals (§D.2) |
| `data-part="…"` | Same primitives, called programmatically (preloader, modals, sliders) |
| `data-parallax="img|img-in|img-out|ctn-up|ctn-down"` + wrapper | Parallax (§D.3) |
| `data-theme` on fixed UI, `data-bg="light|dark|color"` on sections | Header theming |
| `data-snap` | Desktop snap sections |
| `data-video-playpause` | Play while visible |
| `data-scroll-horizontal` | Horizontal track container (children use `containerAnimation`) |
| `data-magnetic-btn`, `data-magnetic-strength` | Magnetic buttons |

### H.4 Core initialisation (pseudocode)

```ts
export function initMotion(root: ParentNode = document) {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  registerEases();                              // Out / In / InOut / Ease / diveIn / horScroll / loaderEase
  const lenis = initLenis();                    // ticker-synced; exposes lock()/unlock()

  const mm = gsap.matchMedia();
  mm.add('(min-width: 992px)', () => {          // desktop choreography
    heroDolly(root); hscroll(root); amenitiesZoom(root);
    architectureTimeline(root); footerClip(root);
    snapSections(lenis); magnetic(root); floatingTips(root); customScrollbar(lenis);
    return () => {};                            // gsap.matchMedia auto-reverts on breakpoint change
  });
  mm.add('(max-width: 991px)', () => {          // mobile variants
    heroDollyMobile(root);                      // scale 1 → 2 only
    footerClip(root, { mobile: true });         // inset(4% 32%)
    bottomSheetTips(root);
  });

  // always-on
  revealScrollGroups(root); parallax(root); headerTheme(root);
  sliders(root); tabs(root); modals(root); hoverFx(root); videoPlayPause(root); rotatingBadge(lenis);

  window.addEventListener('resize', debounce(() => ScrollTrigger.refresh(true), 40));
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  imagesLoaded(root).then(() => ScrollTrigger.refresh());   // pinned areas depend on measured sizes
}
```

**Cleanup rule.** Wrap each page's setup in `gsap.context()` (or return cleanups from `matchMedia`) and `revert()` it before a page transition; the original kills every ScrollTrigger and destroys local Lenis instances in `afterLeave`, then re-initialises in `beforeEnter` and calls `ScrollTrigger.refresh(true)`.

### H.5 Techniques worth reproducing exactly

1. **Scroll areas sized by JS.** `area.style.height = track.scrollWidth + 'px'`; `position: sticky; top: 0; height: 100vh` for the stage; refresh on resize/fonts/images.
2. **`containerAnimation` for horizontal reveals.** Every `once` reveal inside the track uses `start: 'left bottom'` bound to the track tween so elements reveal when they *slide into view*, not when the page scrolls.
3. **Initial state first.** Call `initial` for every reveal at init (sets `visibility: visible` after hiding) to avoid a flash of unstyled text.
4. **SplitText created once and cached** per element; `mask: 'lines'` for paragraphs.
5. **Theme switching per element, not per section.** One ScrollTrigger per (UI element, section) pair using the element's centre line.
6. **Hero as an `<img>` with `translateZ(10px)`** to force a compositor layer during the ×2 scale.
7. **Measure after images load.** The hero dolly is created only once the hero `<img>` has loaded (`img.complete ? build() : img.addEventListener('load', build, {once:true})`) because its distances depend on `offsetHeight`.
8. **Preloader as CSS variables** (`--arch-w`, `--arch-y`) animated by GSAP — the arch mask is pure CSS reading those variables.

### H.6 Performance recommendations (beyond the original)

| Original behaviour | Risk | Recommendation |
|---|---|---|
| All 41 images `loading="eager"` | Slow first paint on mobile | Eager only for preloader + hero; `loading="lazy"` + `decoding="async"` below the fold (reserve space with `aspect-ratio`) |
| 8 autoplaying alpha videos (paused off-screen) | Decoder load on phones | Keep play/pause-on-visibility; consider disabling 2–3 on mobile; use poster until first play |
| `word-spacing` scrub on large text | Layout every frame | Prefer per-word `x` transforms; or accept as-is (few elements) |
| Animating `clip-path` on very large images | Paint cost | Use `will-change: clip-path` only during the scrub; test on mid-range Android; fall back to opacity/translate below a quality threshold |
| `scrub: true` + Lenis | Double smoothing feels laggy if both are heavy | Keep Lenis `duration` 1.2 and scrub values ≤ 0.5 as in the reference |
| 117 live ScrollTriggers on the home page at inspection time, 28 of them scrubbed **[V]** (`once` triggers delete themselves after firing, so the count falls as you scroll) | Refresh cost | Batch reveals with `ScrollTrigger.batch`, or one IntersectionObserver; keep scrubbed ones as ScrollTriggers |
| `lagSmoothing(0)` | Large jumps after a tab resumes | Keep, but clamp `dt` in custom tickers (the badge clamps to 100 ms) |

### H.7 What to extract and what **not** to copy

| Extract (principles) | Do not copy |
|---|---|
| The unit system, the three-voice typography hierarchy, the four-colour palette *logic* | The brand name, logo badge text, copy, phone, address |
| Arch-shaped panels, portal preloader, pinned dolly, horizontal chapter, clip-path window timeline, footer iris | Photography, renders, floor plans, the bougainvillea footage, the route map artwork |
| Reveal vocabulary, easing set, timing set, hover microinteractions | Fonts (licensed), Lottie logo, SVG artwork |
| Narrative pacing (one idea per screen, hard cut vs soft overlap) | Section text, claims, legal wording |

---

## I. Responsive Behaviour and Accessibility

### I.1 Responsive model

**One switch, one fluid scale.** The site has a single JavaScript breakpoint (`992 px`) that decides *which choreography runs*, and a single fluid scale (1 rem = 1 vw) that decides *how big everything is* at any width. Below 992 px it is a different composition, not a squeezed desktop **[V]**.

| Width | Layout | Motion that exists | Motion removed |
|---|---|---|---|
| **≥ 992 px (desktop)** | Loose 8.5 vw "cell" composition; fixed header with logo + 3 nav links; custom scroll bar | Everything in §D | — |
| **768 – 991 px (tablet, verified at 820)** | Mobile composition scaled by vw (type is still 23.07 vw for `h1`, so an 820 px screen shows 189 px headings); `MENU` button replaces nav | Preloader, reveals, parallax, sliders, theme switching, hero **scale-only** dolly, amenities zoom, footer clip (4 %/32 %), badge rotation | Horizontal chapter, snap, magnetic buttons, custom scroll bar, hover tooltips (→ bottom sheets), arch diptych windows |
| **≤ 767 / ≤ 479 px (verified at 390)** | Stacked single column; route map becomes a drag strip with `‹ DRAG TO SEE MORE ›`; full-screen plum menu | Same as tablet | Same as tablet |

**Mobile-specific numbers [V from code/CSS]:**

| Item | Desktop | Mobile |
|---|---|---|
| Preloader arch width | `24vw → 36vw` | `40vw → 50vw` |
| Hero image start scale in preloader | 0.75 | 1.15 |
| Hero scroll area | 4 797 px @ vh 851 | 2 235 px @ vh 680 |
| Hero tweens | translate (stage + photo) + scale ×2 | scale ×2 only |
| Footer clip target | `inset(8% 22% 8% 22%)` | `inset(4% 32% 4% 32%)` |
| Text `ctn` reveal offset | 3.333 rem | 11.54 rem (≈ the same pixel travel on a narrow screen) |
| Tooltips | Floating card, 2.4 s lag | Bottom sheet, `yPercent 125 → 0` in 1.2 s |
| `h1` | 12 vw (130 px @ 1084) | 23.1 vw (90 px @ 390) |

**Touch.** Lenis is configured without `syncTouch`, so touch scrolling stays native (momentum, rubber-band, pull-to-refresh) while ScrollTrigger still scrubs; `touchMultiplier 2` only applies if you enable it. Real-device behaviour (iOS address-bar resize, sticky inside transformed parents) was **not** inspected **[U]**. The original sets `--_100svh` (= `innerHeight`) once at load and does not refresh it on resize [V] — use real `100svh` / `dvh` units for pinned stages on mobile instead.

**Recommended improvements.** Gate hover choreography on `@media (hover: hover) and (pointer: fine)` instead of width alone (a 1024 px iPad landscape currently receives the desktop choreography); provide a landscape-phone variant for 568–991 px (very short viewports break the vh-based pins).

### I.2 Test matrix for your build

| Viewport | Purpose |
|---|---|
| 1600 × 900, 1920 × 1080 | Reference canvas (tokens are px@1600) |
| 1084 × 851 | The inspection viewport — compare section positions in §E against this |
| 1280 × 720, 1366 × 768 | Short-height laptops (pins scale with `vh`) |
| 1024 × 768 (landscape tablet) | Just above the 992 breakpoint |
| 820 × 1180, 768 × 1024 | Tablet portrait (mobile composition) |
| 390 × 844, 360 × 740 | Phones |
| 844 × 390 | Landscape phone — worst case for vh-based pins |

### I.3 Accessibility audit of the reference (facts)

| Check | Result [V] |
|---|---|
| `lang` | `en` ✓ |
| Landmarks | 1 `<main>`; **no** `<header>`, `<nav>`, `<footer>`; 14 `<section>` |
| Headings | 5 `<h1>` (page title + modal title + 3 tooltip card titles), 6 `<h2>`, 21 `<h3>` — heading order does not follow the document outline |
| Buttons | **0 `<button>` elements**; menu button, slider arrows and modal triggers are `<div>`s; the day/night toggle uses `<a>` with `aria-label` |
| Dialog semantics | `role="dialog"` 0, `aria-modal` 0, `aria-expanded` 0 |
| Focus styles | `:focus-visible` 0; `:focus` 11; `outline: none/0` ×9 |
| Skip link | None |
| Images | 41; all have `alt`; 35 are `alt=""` (decorative), so informative images are few and mostly rely on adjacent text |
| Split text | SplitText adds `aria-label` to the parent and hides split pieces (71 labelled elements) ✓ — readable by screen readers |
| Video | 8 decorative loops, muted, no `aria-hidden` |
| Form | 1 form (modal), 4 visible labels |
| Reduced motion | **No** `prefers-reduced-motion` support in CSS or JS |
| Auto-advancing content | Sliders advance every 6 s with no pause control (WCAG 2.2.2) |
| Colour contrast | Not formally measured. Navy `#17233b` on cream `#f3f3ec` and cream on plum `#340c24` are high; white micro-labels over photographs and tiny 6–9 px labels are the risk **[E]** |

### I.4 Required accessibility treatment in the rebuild

The goal is to keep the cinematic experience for those who want it and give everyone else an equivalent, calm version.

**Semantics**

- Use real landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), one `<h1>`, logical `<h2>`/`<h3>`. Tooltip/modal titles are `<h2>`/`<h3>` or `role="heading" aria-level`.
- Use `<button>` for every control (menu, slider arrows, tabs, modal open/close, circle CTAs that don't navigate).
- Modals: `role="dialog" aria-modal="true" aria-labelledby`, focus moves in, focus trap, `Esc` closes, focus returns to the trigger, background `inert`.
- Tabs and sliders: ARIA tabs pattern (arrow keys, `aria-selected`), slider counters in an `aria-live="polite"` region; add **Pause/Play** for the 6 s auto-advance and stop it on focus or hover.
- Add a **skip link** (`Skip to content`) and a visible `:focus-visible` ring (2 px outline, 3 px offset, current text colour) — the reference has none.
- Provide meaningful `alt` for photographs that carry information (amenities, plans) and keep `alt=""` for ornament; mark flower videos `aria-hidden="true"`.
- Keep display text readable by screen readers when split: parent gets `aria-label`, pieces `aria-hidden` (SplitText's default).

**Reduced motion (design this deliberately)**

```ts
const mq = matchMedia('(prefers-reduced-motion: reduce)');
if (mq.matches) {
  // Scroll
  lenis.destroy();                         // native scrolling; no easing, no snap
  // Stage transitions → static, cross-faded states
  heroDolly      = fadeBetween(startFrame, endFrame);       // no ×2 zoom, no drift
  hscroll        = stackBlocksVertically();                 // no vertical→horizontal mapping
  amenitiesZoom  = off();   architecture = staticFinalState(); footerClip = staticFinalState();
  parallax       = off();   badge.rotation = off();   magnetic = off();   tooltips = fadeOnly();
  // Text reveals → 0.2 s opacity fades, no rotateX/rotateY, no stagger > 0.02
  reveal = (el) => gsap.to(el, { opacity: 1, duration: .2 });
  // Time-based
  preloader = skip();       sliders.autoAdvance = false;      videos.forEach(v => v.pause());
}
```

**Keyboard in the horizontal chapter.** Because the chapter is pure vertical scroll mapped to `x`, keyboard focus on an off-screen block would not scroll it into view. On `focusin` inside the track, compute the target `scrollY = areaTop + (element.offsetLeft / track.scrollWidth) × scrollDistance` and `window.scrollTo` there.

**Scroll bar and custom cursor.** The custom scroll bar must be an enhancement over the native one (`role="scrollbar"` or hide it from AT); never remove native keyboard scrolling (Lenis preserves it).

### I.5 Performance on small screens

Disable the two heaviest video clips and the cloud parallax below 768 px; serve 1 200 px hero variants; keep `will-change` off until an animation is about to start; test on a mid-range Android phone with 4× CPU throttling; verify the preloader never exceeds ≈ 4 s on return visits.

---

## J. Fidelity Checklist

Use as acceptance criteria. Each line should be testable by screenshot, DevTools or a short script. *Tolerance:* positions ±2 % of viewport, timings ±10 %, colours exact.

### J.1 Foundation

- [ ] `body { font-size: 1vw }` with tokens written as `calc(N rem / 16)` where N = px @ 1600; resizing the window rescales everything proportionally (§B.1)
- [ ] Palette limited to velvet plum `#340c24`, cream `#f3f3ec`, powder sky `#b5cedb`, navy `#17233b`, white, plus alpha tiers; photography supplies all other colour
- [ ] Three type voices only: condensed Didone caps (display), script (accent, mixed case, overlapping), wide-tracked grotesque labels; `h1` = 12 vw, tracking −0.024 em, line-height 0.875
- [ ] Easings registered exactly: `Out .25,1,.5,1` · `In .5,0,.75,0` · `InOut .75,0,.25,1` · `Ease .25,.1,.25,1` · `diveIn .6,0,0,1` · `horScroll .25,0,.75,1` · `loaderEase` (custom)
- [ ] Durations: 0.4 / 0.8 / 1.2 s; stagger 0.1 s; reveal delay 0.3 s

### J.2 Arrival

- [ ] First visit: plum overlay, text lockup, progress line (4 s), arch rises (1.5 s, `InOut`), dives past the top (2.4 s, `diveIn`, starting at 90 % of the rise), hero scales 0.75 → 1 in step; total ≈ 10 s; scroll locked until the end
- [ ] Return visit (same tab session): ≈ 3.7 s with no text or progress line
- [ ] Hero text only starts revealing during the dive (≈ 25 % in), never before

### J.3 Scroll choreography

- [ ] **Hero:** drifts up (stage ≈ 1.25 × photo height − vh, photo ≈ photo height − vh) for the first 60 % of the scroll, zooms ×2 about `50% 75%` from 40 % with `In`; mobile = scale only
- [ ] **Arch panels:** semicircle top (`border-radius: 50vw 50vw 0 0`); rise over the previous section by `100vh + 50vw` using layout, not tweens; same-colour continuation produces no seam
- [ ] **Arch intro words** spread (`word-spacing 0 → 10 rem`) linearly through the section
- [ ] **Sliders:** 6 s auto-advance, progress bar, diagonal wipe + inner scale 1.5 → 1, char flips, line rises; pause off-screen; desktop snap magnet on those two sections only
- [ ] **Horizontal chapter:** vertical scroll ≈ 1 : 1 with track translation; `horScroll` ease; scrub 0.25; title lines drift in opposite directions; route line draws left → right over 2.4 s after 0.8 s delay; reveals inside the track fire on *horizontal* entry
- [ ] **Aerial:** `scale 1.15 → 1`, origin bottom, scrub 0.25
- [ ] **Amenities:** stage scales ×2 (`In`) and fades out over the scroll area; cream arch panel rises over it at ≈ 23 – 70 % of that area
- [ ] **Architecture:** two plate windows offset vertically move to alignment over the first half, close side gaps, then the stage zooms ×1.84 with flowers flying out ±50 % and content stage 0.75 → 1; heading then paragraph reveal at `30% top`, reversible; façade drifts down 25 % afterwards
- [ ] **Footer:** CTA image clips to `inset(8% 22% 8% 22%)` while footer content fades/scales in; text hides when scrolling back
- [ ] Header elements recolour exactly as their centre crosses section edges (not at section start)
- [ ] Rotating badge: 30°/s idle; reverses with scroll direction; settles in ≈ 1.2 s

### J.4 Interaction

- [ ] Letter-roll on nav and link hovers (0.8 s, positional stagger ≤ 0.2 s)
- [ ] Circle CTA arcs grow to half-circle in 0.8 s and reverse; magnetic pull with elastic return (desktop pointer only)
- [ ] Tooltips trail the cursor with ≈ 2.4 s lag and flip at edges; become bottom sheets on touch/narrow
- [ ] Modals: backdrop fade 0.8 s, content reveal with the same text vocabulary, `Esc` and overlay close, scroll locked while open
- [ ] Tab/amenity change: diagonal wipe 1.2 s `InOut`, caption hide/reveal, highlight bar 0.8 s
- [ ] Card hover lift on `/apartments`; Barba-style fade transition between pages

### J.5 Assets

- [ ] Hero day/night are pixel-aligned; lower-centre stays sharp at ×2
- [ ] Foreground alpha loops (or substitutes) overlap section seams and corners; paused when off-screen
- [ ] Cloud sprites have clean alpha and parallax in opposite directions
- [ ] All photography is `<img>` (not CSS backgrounds); explicit `aspect-ratio` prevents layout shift

### J.6 Quality gates

- [ ] 60 fps scrubbing on a mid-range laptop; no long tasks > 50 ms during scroll; no layout shift after the preloader
- [ ] `prefers-reduced-motion` handled (§I.4); visible focus; keyboard reaches every control; modals trap focus
- [ ] 390 px and 820 px layouts match the mobile composition (no horizontal overflow, no desktop-only effects)
- [ ] Consent-gated analytics; no third-party scripts before consent
- [ ] **Originality:** no copied brand, copy, imagery, fonts or artwork; only the principles and mechanisms documented here

---

## K. Appendices

### K1. Animation and interaction inventory (master list)

**Class key:** **T** timed (own clock) · **S** scrubbed (bound to scroll) · **V** viewport-triggered once · **R** triggered and reversible · **H** hover · **C** click · **F** CSS flow only. Durations in seconds; eases are the named set in §B.7.

#### K1.1 Global systems

| ID | Name | Class | Target | Trigger | Motion / values | Time · ease | Reversible |
|---|---|---|---|---|---|---|---|
| G1 | Preloader (first visit) | T | overlay, arch mask, hero photo | page load, no `sessionStorage.hasVisited` | text reveals → bg 0 → 0.05 → track `yPercent −100 → 0` → arch `--arch-y 104vh → 15vh` → dive `--arch-w → 125, --arch-y → −100vh`; hero `scale .75 → 1` | ≈ 10 s · `loaderEase`, `InOut`, `diveIn` | No |
| G2 | Preloader (return) | T | same | `hasVisited` set | same minus text/track | ≈ 3.7 s | No |
| G3 | Page transition | T | `[data-barba]` container | in-site link click | visible text hides (0.4) → container `opacity → 0` (0.8 `In`) → swap → `0 → 1` (0.8 `InOut`) | ≈ 1.6–2 s | No |
| G4 | Smooth scroll | T | window | wheel / keys | Lenis, exponential-out | 1.2 | — |
| G5 | Snap | T | 2 slider sections | 40 ms after scroll stops, > 50 % visible, desktop | `scrollTo(section top)` | 1.2 · `Ease` | — |
| G6 | Header theme | R | logo, nav, bar, cue | element centre crosses section edge | `theme_on-light/dark/color` | class swap | Yes |
| G7 | Rotating badge | T + S-velocity | logo ring | ticker + Lenis velocity | `rotation += v·dt`, v = ±(30 + 10\|vel\|) | settle 1.2 `Out` | Yes |
| G8 | Scroll bar | S | rail, thumb, label | scroll; drag | progress `0 → 100`; drag → `scrollTo` 3.2 s | — | Yes |
| G9a | Reveal `a` | V | script words | wrapper enters (`top bottom`) | chars `rotateX 90 → 0`, `x 10rem → 0`, `opacity` | 1.2 · `Out`, stagger 0.1 | No |
| G9b | Reveal `h` | V | headings | same | chars `yPercent 50 → 0`, `rotateY 90 → 0` | 1.2 · `Out`, stagger 0.05 | No |
| G9c | Reveal `p` | V | paragraphs | same | lines `yPercent 110 → 0` (masked) | 1.2 · `Out`, stagger 0.1 | No |
| G9d | Reveal `ctn` | V | buttons, cards | same | `y 3.333rem → 0`, `opacity` | 1.2 · `Out` | No |
| G9e | Reveal `line` | V | hairlines | same | `clip-path inset(0 0 100% 0) → 0` | 1.2 · `Out` | No |
| G9f | Reveal `slide` | V / C | images | same, or slider/tab change | diagonal polygon wipe + inner `scale 1.5 → 1`, `xPercent 25 → 0` | 1.2 · `InOut` | No |
| G10 | Parallax ×5 | S | images, containers | wrapper in view | `yPercent` −15 → +15 (`img`), 0 → 20, −20 → 0, ∓10 | scrub 0.5 / true | Yes |
| G11 | Video play/pause | R | alpha loops | wrapper in/out of view | `play()` / `pause()` | — | Yes |
| G12a | Link hover | H | text links | pointer enter/leave | char `rotateY ±90`, underline `scaleX 1 → 0` | 0.8 · `Out`, stagger 0.025 | Yes |
| G12b | Nav roll | H | nav items | pointer | `yPercent 0 → −100 / 100 → 0`, positional delay ≤ 0.2 | 0.8 · `Ease` | Yes |
| G12c | Circle CTA | H | ring | pointer | arc dasharray 15° → 180° | 0.8 · `InOut` | Yes |
| G12d | Magnetic | H | buttons (≥ 992) | pointer move | `x,y = Δ·strength/16 em` | 1.6 · `power4.out`; leave `elastic.out(1,.3)` | Yes |
| G12e | Pin pulse | T | hero pins | always | rings `1 → 1.6`, `opacity 1 → 0` | 1.2 · `In`, repeat | — |
| G12f | Credits Lottie | H | footer logo | pointer | progress → 0.5 / 1 | 1 s | Yes |
| G13 | Slider | T / C | 3 sliders | 6 s timer, arrows | see §D.1 G13 | ≈ 1.4 | — |
| G14 | Modals | C | menu, call, tip | click / `Esc` | overlay 0 → 1, content reveals, bars rotate | 0.8–1.2 | Yes |
| G15 | Floating tooltip | H | hero pins | pointer move | card follows cursor | 2.4 · `power3` | Yes |
| G16 | Tabs + highlight | C | hero toggle, amenities, lot tabs | click | crossfade 0.8 / wipe 1.2; bar to item 0.8 | `InOut` | n/a |

#### K1.2 Section effects (home)

| ID | Section | Class | Target | Trigger | From → To | Time · ease | Reversible |
|---|---|---|---|---|---|---|---|
| S1.1 | Hero | V | headline, script, toggle, CTA | during preloader dive | per G9 | 1.2 | No |
| S1.2 | Hero | S | stage, photo | hero area `top top → bottom bottom` | stage `y 0 → −369`; photo `y 0 → −125`; photo `scale 1 → 2` @ `50% 75%` | translate 0–0.6 `Ease`; zoom 0.4–1.0 `In` | Yes |
| S1.3 | Hero | C | night photo | toggle click | `opacity 0 ↔ 1` | 0.8 · `InOut` | Yes |
| S1.4 | Hero | H | 3 pins | pointer | tooltip card (G15) | 2.4 | Yes |
| S2.1 | Arch intro | F | panel | scroll | rises over hero (margin `−(100vh + 50vw)`) | — | Yes |
| S2.2 | Arch intro | S | words | section crossing | `word-spacing 0 → 10rem` | linear | Yes |
| S3 / S7 | Sliders | T + snap | slides | visible ≥ 20 % | G13 + G5 | 6 s cycle | — |
| S4.1 | Pull quote | S | photo | in view | `yPercent −15 → +15` | scrub 0.5 | Yes |
| S5.1 | Concept | S + R | info block | `top 30% → bottom bottom` | `opacity 0 → 1`, `scale .75 → 1`; paragraph reveal/hide | scrub 0.5 | Yes |
| S5.2 | H-chapter | S | track | area `2.5% top → 97.5% bottom` | `x 0 → −(scrollWidth − width)` | `horScroll`, scrub 0.25 | Yes |
| S5.3 | H-chapter | S | 3 title lines | area | `xPercent [−5,25,−15] → [5,−25,25]` | linear, scrub 0.25 | Yes |
| S5.4 | H-chapter | S | flowers | area | intro `xPercent 0 → −25`; path `yPercent 0 → 25` | linear | Yes |
| S5.5 | H-chapter | V | route line | enters horizontally | `clip-path inset(0 100% 0 0) → 0` | 2.4 · `Out`, delay 0.8 | No |
| S6.1 | Aerial | S | photo | `top bottom → bottom bottom` | `scale 1.15 → 1` @ `center bottom` | `Ease`, scrub 0.25 | Yes |
| S6.2 | Aerial | S | cloud sprites | in view | `yPercent −20 → 0 / 0 → 20` | scrub | Yes |
| S8.1 | Range statement | V | statement, hairline, caption, glyph | wrapper enters | G9 `h`, `line`, `p` / `ctn` | 1.2 · `Out` | No |
| S9.1 | Amenities | S | stage, wrapper | area `top top → bottom bottom` | `scale 1 → 2`; `opacity 1 → 0` | `In`, scrub true | Yes |
| S9.2 | Amenities | C | image + caption | list click | `slide` wipe; caption hide/reveal | 1.2 · `InOut` | n/a |
| S9.3 | Amenities | C | highlight bar | list click | to item `y / height` | 0.8 · `InOut` | n/a |
| S10.1 | Space to live in | F | cream arch panel | scroll | rises over amenities | — | Yes |
| S11.1 | Architecture | S | plate windows L/R, stage, flowers, content | `.arch-intro-s` `top bottom → 200% top`, ≥ 992 | see §D.4 S11 (0–0.5, 0.5–0.6, 0.6–1.0) | `none` then `InOut` | Yes |
| S11.2 | Architecture | R | heading, paragraph | `30% top` of area | per G9 (delay 0 / 0.4) | 1.2 | Yes |
| S11.3 | Architecture | S | façade image | `55% top → bottom top` | `yPercent 0 → 25` | linear | Yes |
| S13.1 | CTA | S | photo | `.footer-w` `top 30% → bottom bottom` | `inset(0) → inset(8% 22%)` (mobile `4% 32%`) | linear, scrub 0.5 | Yes |
| S14.1 | Footer | S | content | same | `opacity 0 → 1`, `scale .75 → 1` | linear | Yes |
| S14.2 | Footer | R | text | same | G9 (delay 0.1) / hide | 1.2 | Yes |
| S14.3 | Footer | S | scroll cue | footer `top bottom → center bottom` | `opacity 1 → 0` | `InOut` | Yes |
| S14.4 | Lot page | R | info header | `100px top` | toggles `.is-top` | instant | Yes |

### K2. Source function map (for re-inspection)

The custom module is ≈ 59 KB, minified but with readable function names. Offsets are character positions in that file at inspection time (they will drift if the site is updated). The file is loaded by a Slater loader script and was fetched read-only for analysis.

| Function (offset) | Role | Read in detail |
|---|---|---|
| `initPreloader` (0), `animatePreloaederIntro` (242), `animatePreloaederShort` (2088) | Session-based preloader | ✓ |
| `initPageTransitions` (3315) | Barba hooks | ✓ |
| `initScripts` (4271) | Master init per page | ✓ |
| `initLenis` (4913), `initLocalLenis` (5179) | Smooth scroll | ✓ |
| `initCookies` (5487) | Cookie card | partial |
| `initThemeChange` (6063), `initSnapSections` (6950) | Header theme, snap | ✓ |
| `initForm` (7441), `initUtmFields` (8346) | Modal form, UTM capture | ✗ (never submitted) |
| `initPlayPauseVideoScroll` (8823) | Alpha-video visibility | ✓ |
| `animateTextA` (9272), `H` (10024), `P` (10724), `animateCtn` (11450), `animateLine` (11902), `animateSlide` (12347) | Reveal vocabulary | ✓ |
| `animateVisibleElements` (13187), `lockScroll` (13560), `unlockScroll` (13838), `scrollToTop` (14022), `initResetWebflow` (14169) | Helpers | ✓ |
| `initOther` (14416) | Section-specific timelines (hero, concept, h-chapter, aerial, amenities, architecture, footer, lot header) | ✓ |
| `initIndexCounter` (15538), `fitText` (15731), `initBenefitCards` (16081) | Counter, auto-fit "ARCHITECTURE", benefits | partial |
| `initScrollRevealFirst` (17027), `initAllParallax` (17376), `initScrollElementsReveal` (19069) | Reveal wiring, parallax | ✓ |
| `initMagneticEffect` (21355), `initNavItemHover` (22448), `initLinkHover` (23699), `initBtnCircleHover` (25341) | Hover set | ✓ |
| `initSelect` (25771) | Custom select | ✗ |
| `initPins` (26493), `initLogo` (27072), `initScrollBar` (27796), `initTFTLjson` (28836), `initCardParts` (29421) | Pins, badge, scroll bar, Lottie, card parts | ✓ |
| `initAccordion` (29982) | Accordion | ✗ |
| `initSlider` (30976) | Sliders | ✓ |
| `initCarousel` (33876), `initLightbox` (34654), `initImageZoom` (36416), `initTabs` (39441) | Carousel, lightbox, zoom, tabs | ✗ |
| `initTabsHero` (40983), `initTabsHilight` (42074) | Hero toggle, highlight | ✓ |
| `initModalCta` (42596) | Call modal | ✗ |
| `initModalMenu` (43724), `initModalTip` (45896), `initFloatingTips` (46867) | Menu, bottom sheet, tooltips | ✓ |
| `initFilter` (47831), `initSort` (49699), `initReset` (50910) | `/apartments` filtering | ✗ (internals) |
| `initTranistionFlow` (51677) | Section timelines wired up | ✓ |
| Config + `CustomEase.create` (≈ 58 900 →) | Constants and eases | ✓ |

### K3. Unknowns and not inspected (do not assume)

| # | Item | Why it matters | Suggested handling |
|---|---|---|---|
| 1 | How the apartment-card **chamfered corners** are built | Visual signature of cards and cookie card | Recreate with `clip-path: polygon()` or an SVG mask; match the look |
| 2 | How the **curved "THREE REASONS" text** is laid out | Word placement on an arc | SVG `textPath` + per-word offsets, or rotated spans; keep the `word-spacing` scrub |
| 3 | **Layer stacking of the architecture plates** (what sits under the clip-path "windows") | Needed for exact look | Use one full-bleed image under two cream plates with window cut-outs; tune by eye against §D.4 S11 |
| 4 | **Amenity tab auto-advance** | Could add motion | Treat as click-only; if you add auto-advance, include pause control |
| 5 | **Real touch behaviour** (iOS/Android) | Sticky, momentum, address-bar | Test on devices; see §I.1 |
| 6 | `/contact` page and PDF documents | Not opened | Design from the site's system |
| 7 | **Form** internals, endpoint, validation, UTM handling | Back-end integration | Specify your own CRM; consent-gate |
| 8 | `initFilter`, `initSort`, `initReset`, `initSelect` internals | Card in/out animation on filter | Fade/scale cards 0.4–0.8 s with `Out`; keep count update |
| 9 | `initAccordion`, `initCarousel`, `initLightbox`, `initImageZoom`, `initTabs` | May be used on lot pages | Inspect if lot-page fidelity matters |
| 10 | Original **image source resolutions**, exact **video codecs** | Asset specs | Use §G.8 budgets |
| 11 | Apartment-card hover CSS values | Micro-interaction fidelity | Lift ≈ 4–8 px, shadow `0 12px 32px rgba(23,35,59,.12)` **[suggestion]** |
| 12 | `.footer-w` exact extents | Pixel start of footer scrub | Verify in the rebuild by measuring |
| 13 | Ultra-wide (≥ 1920) and Safari/Firefox rendering | Cross-browser | Test; the Safari path strips WebM sources |
| 14 | Cookie card timing and stored consent keys | Compliance | Implement your own CMP |
| 15 | Analytics events (GTM) | Not needed | Out of scope |

### K4. Verification protocol (how Claude Code should check its build)

**1. Positions.** At 1084 × 851 and 390 × 680, scroll to each `scrollY` in §E.1 (scaled by `vh`) and screenshot. Compare composition (not pixels): headline position, which panel is on top, image crop.

**2. Numeric probes.** Run in the console of your build (and, for comparison, of the reference). It samples a transform at several scroll positions:

```js
async function probe(sel, ys) {
  const el = document.querySelector(sel), out = [];
  for (const y of ys) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 900));           // let Lenis + scrub settle
    const m = new DOMMatrix(getComputedStyle(el).transform);
    out.push({ y, scale: +Math.hypot(m.a, m.b).toFixed(3), ty: Math.round(m.f) });
  }
  return out;
}
```

**3. Expected values** (computed from the verified tweens, hero photo height 976 px, vh 851; tolerance ±5 %):

| Hero · `scrollY` | % of 3 946 | Stage `y` | Photo `y` | Photo scale |
|---|---|---|---|---|
| 395 | 10 % | −81 | −28 | 1.000 |
| 986 | 25 % | −260 | −88 | 1.000 |
| 1 578 | 40 % | −341 | −116 | 1.000 |
| 2 368 | 60 % | −369 | −125 | 1.016 |
| 2 960 | 75 % | −369 | −125 | 1.117 |
| 3 551 | 90 % | −369 | −125 | 1.477 |
| 3 946 | 100 % | −369 | −125 | 2.000 |

| Amenities · `scrollY` | % of 1 819 | Stage scale | Wrapper opacity |
|---|---|---|---|
| 11 451 | 0 % | 1.000 | 1.000 |
| 12 360 | 50 % | 1.066 | 0.934 |
| 12 815 | 75 % | 1.311 | 0.689 |
| 13 270 | 100 % | 2.000 | 0.000 |

| Architecture · relative time | `scrollY` ≈ | Window L y-range | Window R y-range | Stage scale | Flower `xPercent` | Content scale |
|---|---|---|---|---|---|---|
| 0 | 14 119 | 36.1 – 99.1 % | 0.9 – 63.9 % | 1.000 | 0 | 0.750 |
| 0.25 | 14 757 | 27.3 – 90.3 % | 9.7 – 72.7 % | 1.000 | 0 | 0.750 |
| 0.5 | 15 396 | 18.5 – 81.5 % | 18.5 – 81.5 % | 1.000 | 0 | 0.750 |
| 0.7 | 15 906 | 18.5 – 81.5 % | 18.5 – 81.5 % | 1.046 | ±2.7 | 0.764 |
| 0.8 | 16 161 | 18.5 – 81.5 % | 18.5 – 81.5 % | 1.420 | ±25 | 0.875 |
| 0.9 | 16 417 | 18.5 – 81.5 % | 18.5 – 81.5 % | 1.794 | ±47 | 0.986 |
| 1.0 | 16 672 | 18.5 – 81.5 % | 18.5 – 81.5 % | 1.840 | ±50 | 1.000 |

*Read these tables as a sanity check on the **shape** of the motion* (long quiet drift, then a late accelerating zoom): pinned ranges in your build will differ if your sections differ in height.

**4. Timing probes.** Record a Performance trace over the preloader and over the architecture scrub. Expect: no long tasks > 50 ms during scrub; text reveals finishing within 1.2 s + stagger; preloader ≈ 10 s / 3.7 s.

**5. State probes.** `ScrollTrigger.getAll().length` ≈ 117 on the reference home page at the top (varies with `once` triggers); sticky stages present on `.hero-w`, horizontal stage, amenities stage, `.arch-intro-s`, `.arch-w`.

**6. Reduced-motion and keyboard run.** Emulate `prefers-reduced-motion: reduce`; tab through the page; open and close each modal with keyboard only.

**7. Cross-device.** 390 × 844, 820 × 1180, 1024 × 768, 1440 × 900, 1920 × 1080; throttle CPU 4× on the phone profile.

### K5. Suggested implementation order

1. **Tokens and unit system** (§B): `body { font-size: 1vw }`, CSS variables, fonts, colours, themes.
2. **Static layout** of every section at 1600 and 390 with placeholder images (§C).
3. **Scroll engine**: Lenis + ScrollTrigger sync, scroll-bar, badge, header theme (G4, G6–G8).
4. **Motion vocabulary**: eases, durations, the six reveal primitives and parallax (§D.2–D.3).
5. **Preloader + hero dolly** (G1/G2, S1).
6. **Arch panels, sliders, snap** (S2, S3, S7, G5, G13).
7. **Horizontal chapter** and its `containerAnimation` reveals (S5).
8. **Amenities + architecture timelines** (S9, S11) — hardest; build with the §K4 expected values.
9. **CTA/footer clip** (S13/S14).
10. **Interactions**: hovers, magnetic, tooltips, tabs, modals (G12–G16).
11. **Secondary pages** and page transitions (G3, F.3).
12. **Responsive pass** (§I.1) and **accessibility / reduced-motion pass** (§I.4).
13. **Performance pass** (§H.6), then run the **fidelity checklist** (§J).

*End of brief.*
