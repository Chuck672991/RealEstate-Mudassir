# Reference design → this build

`REFERENCE_WEBSITE_DESIGN_BRIEF.md` describes an editorial, slow-scroll site for a boutique residential development. This project reproduces its **principles and mechanisms** for a different business, with original colours, type, artwork and copy — the brief itself says not to copy brand, copy, imagery, fonts or artwork. This page maps each part of the reference to what exists here, and records **every deliberate difference and why**.

Evidence level of this table: I implemented and measured the build; the reference pages were not re-inspected. Where the brief marked something *[U] unknown/ambiguous* I built the visible sequence it describes rather than guessing internals.

## Narrative order (home page)

| # | Reference section | This build | Notes |
| - | --- | --- | --- |
| 0 | Preloader (~10 s first visit, ~3.7 s return) | **Intro** — plum field, monogram + name reveal, progress hairline, circular opening; ≈3.5 s; once per tab session; **skippable** (key/click/scroll); content already rendered underneath | Shorter and skippable on purpose (a 10 s unskippable gate hurts LCP, accessibility and crawlers). The arch "dive" is replaced by a circular iris. |
| 1 | Hero: pinned dolly (type drifts, photo drifts, photo zooms ×2 about 50% 75%) | **Hero** — leather wall + lit arched doorway; same two-phase scrub (drift 0–0.6, accelerating zoom 0.4–1.0, origin 50% 75%); mobile = scale-only | No photograph exists, so the zoomed "image" is an original lit doorway. Day/night toggle and three hotspot tooltips are **not built** (nothing to toggle or annotate). |
| 2 | Arch intro: panel rises over the pinned hero by `100vh + 50vw`; words spread along an arc | **Arch intro** — identical overlap maths (`--overlap`), semicircle radius `50vw`, three words on spokes whose spread is scrubbed | The reference scrubs `word-spacing`; spokes are rotated about the arch centre and their *angle* is scrubbed — same effect, no per-frame layout. |
| 3 | "Three reasons" slider (snap) | **Expertise** slider — the evidence-backed specialties (5 of 8) | Auto-advance 7 s (not 6), starting by itself in view, **no Pause button** (owner's decision — a WCAG 2.2.2 trade-off, see ACCESSIBILITY.md); diagonal curtain wipe, character flips, progress hairline as specified. |
| 4 | Pull quote over a photograph (parallax, hard cut) | **About** — dark timber plate with ±11% parallax, one large statement + bio + facts | No quote/attribution (nobody has supplied one). |
| 5 | Concept + **horizontal chapter** with route map | **Areas** — vertical scroll → sideways travel (area height = travel + one viewport, 1:1), numerals drift faster than panels, hand-drawn route line draws left→right (2.4 s, after 0.8 s) | Content = real closed-sale counts per community. The line is abstract, *not* a map (the dataset has no coordinates). Stacked/grid on mobile and short screens. |
| 6 | Aerial context (scale 1.15→1) | **Not built** | No aerial imagery; the Market statement takes its place. |
| 7 | Typologies slider (snap) | **Featured homes** slider — only genuinely available listings (never "under contract") | Same wipe/flip vocabulary. |
| 8 | Range statement (hard cut to night photo) | **Market experience** — statement, figures with source + date, calculated price bands as a footnoted table | Hard cut to the dark section preserved. |
| 9 | Amenities: pinned stage scales ×2 and fades; tab list with sliding highlight | **Recently sold** — verified sales; ARIA tab list; diagonal wipe between records; 1 px highlight bar slides; scale ×2 + fade scrubbed over the pin | Records are *real sales*, shown as city · type · month · price (no address). |
| 10 | "The space to *live in*": cream arch panel rises over the stage | **How Mudassir works** — arch panel, stacked headline with a tilted italic accent overlapping, a burgundy block with a framed photograph (left) and a flush-right photograph, then the statement, services paragraph and a round button | Laid out to the reference's measured proportions (shares of the viewport width; `how.css`), columns stack on phones. The reference's "optional upgrades" is not built (no content). The statement is set at 2.05 vw not 2.5 vw: this typeface is ≈ 1.4× wider than the reference's condensed one. |
| 11 | Architecture diptych timeline (windows slide → gap closes → ×1.84 zoom, flowers swell and leave) | **Closing scene** — ONE photograph seen through TWO portrait windows (one `clip-path` polygon, geometry in `components/motion/engine/closing-geometry.ts`): they start side by side, left low and right high (0), slide into line (0–36), the hairline gap closes (36–43), the stage zooms ×1.84 with content 0.75→1 (43–68); the two bougainvillea clips in the bottom corners swell and leave during the zoom | See "ERA residence animation brief" below. The photograph is editor-chosen (Home page → "Closing scene — photograph"). Built as one element with one polygon: two stacked copies showed a seam. |
| 12 | Credibility statement | **Reviews & credentials** — licence/brokerage statement, rating *with source and date range*, approved quotes (none yet), proven credentials (none yet) | Conservative on purpose — see CONTENT-MODEL. |
| 13–14 | CTA clips to `inset(8% 22%)`; footer fades/scales in behind | Scene shrinks to an **arched window** over the top half (`inset(7% 30% 47% 30% round R R 0 0)`); footer (giant phone number, columns) fades/scales 0.75→1 beneath | The footer needs legible space, and the arch is the brand's signature shape. Closing words fade out as the arch forms. |

## Fixed UI and global systems

| Reference | This build |
| --- | --- |
| Logo badge, ring rotates 30°/s, speeds with scroll velocity, reverses with direction | ✔ (`engine/badge.ts`; the ring is a CSS animation whose `playbackRate` follows scroll velocity). Ring text comes from the CMS (name + tagline); the link's accessible name contains it (WCAG 2.5.3). |
| Nav with letter-roll, underline retract | ✔ pointer devices only (`@media (hover: hover) and (pointer: fine)`) |
| Menu button + full-screen menu | ✔ native `<dialog>` (focus trap, Esc, inert background, focus return) |
| Scroll bar + 00–100 label, draggable thumb | ✔ desktop, `aria-hidden` enhancement over the native scrollbar |
| Scroll cue ("SCROLL" → "TO TOP" near the footer) | ✔ fades near the end; the footer has a real "Back to top" link |
| Cookie card | **Omitted** — the site sets no tracking cookies and loads no third-party scripts, so there is nothing to consent to. Add a consent layer if you add analytics. |
| Header theme switching per element at section edges | ✔ per element, by hit-testing the point behind each piece (follows `clip-path` and rounded arches); the nav switches line by line |
| Smooth scroll (Lenis 1.2 s exp-out, `lagSmoothing(0)`) | ✔ desktop + mouse + motion allowed only; touch stays native |
| Snap sections | **Different**: an *approach assist* — it only eases the last ≤12% of an approach toward a snap section and never pulls you back out (the reference's always-magnet makes keyboard/single-notch scrolling out of a snap section impossible). |
| Page transitions (hide → fade out → fade in) | **Enter-only** fade (CSS). No exit animation (it would need router interception). |
| Magnetic buttons (power4.out follow, elastic.out spring-back) | ✔ pure CSS transitions driven by two custom properties; the elastic is a sampled `linear()` easing in the theme |
| Floating tooltips / bottom sheets, pin pulses, hero tabs | **Not built** (no photograph to annotate) |
| Modals (menu, "Book a call") | ✔ both native `<dialog>`; fade, Esc/backdrop/button close, focus return, scroll lock |

## Reveal vocabulary (§D.2)

| Reference | Here |
| --- | --- |
| `a` accent chars flip up from the right (rotateX 90°, x +10vw), 1.2 s Out, stagger 0.1 | ✔ `data-reveal="a"` |
| `h` heading chars flip (rotateY 90°, y 50%), stagger 0.05 | ✔ `data-reveal="h"` |
| `p` paragraph lines rise through masks | **`w`**: *words* rise through masks. Real line-splitting needs JS measurement at render time; word masks are split on the server, work with no JS, and look equivalent. |
| `ctn`, `line`, `slide` | ✔ (fade-up; hairline draws; diagonal curtain wipe + inner de-zoom) |
| Hide = 0.4 s In, reveal = 1.2 s Out | ✔ — hidden state declares the short transition, revealed state the long one |
| Triggered once on `top bottom` | ✔ (rect check per frame, so hidden `clip-path` states and *horizontal* entry inside the sideways chapter both work) |

Above-the-fold text (hero, intro) reveals with **CSS animations that start at first paint** rather than waiting for hydration, so the headline paints immediately (measured LCP ≈ 0.1 s on localhost) and nothing waits on JavaScript.

## Responsive model

One JS breakpoint at **992 px** (as in the reference) decides *which choreography runs*; fluid sizing decides *how big things are*. Differences: type is `calc(N × --px)` with rem clamps (the reference is pure `1rem = 1vw`) so body text honours browser font-size; mobile headline sizes are smaller than the reference's 23 vw because Bodoni is wider than the condensed Didone (see THEMING). Mobile: hero scale-only, no sideways chapter, no snap, no magnetic, no scroll bar, closing scene is a calm full-bleed section followed by the footer. **Added** (the brief recommends it): every pinned stage is also gated on viewport **height** (a 36rem stage needs a 36rem screen), so a landscape phone gets un-pinned sections instead of a stage taller than the screen; the sideways chapter and closing scene need 40rem.

## Accessibility improvements over the reference (§I.3–I.4)

Real landmarks, one `<h1>`, `<button>`s everywhere, modal semantics, skip link, visible `:focus-visible` rings (inverse ring on dark surfaces), ARIA carousel + tabs patterns (auto-advance has **no** Pause control — see ACCESSIBILITY.md), `prefers-reduced-motion` handled deliberately (no pins, no Lenis, no reveals, no badge spin, no autoplay, no intro), keyboard access into the pinned chapters (focusing a link scrolls the page to where it is). Details: [`ACCESSIBILITY.md`](ACCESSIBILITY.md).

## Photographs: a deliberate difference

The reference art-directs its photography (dark, dusk-lit), so light text can sit directly on it. Here the photographs are supplied later by the agent and can be any brightness (a typical listing photo is bright). Text over a photograph therefore carries a **scrim** (a token-derived dark backing), the hero's overlapping accent word has a veil at the top of the doorway, and each fixed header piece gets its own plate while it passes over the photo stage. Over the placeholders this is nearly invisible; over a white picture it reads as caption cards. Details and proof: [`ACCESSIBILITY.md`](ACCESSIBILITY.md#text-over-photographs--the-scrim).

## Not reproduced (and why)

The Lottie credit logo, the reference's aerial and day/night photography, floor-plan cards and the apartments filter (replaced by the properties list/filter), the reference's fonts and logo. **The bougainvillea alpha-video clips ARE used** — supplied by the site owner, rights unconfirmed (docs/ASSETS.md). Everything else visual is generated from CSS/SVG or is a photograph the owner supplied.

## ERA residence animation brief (`ERA_RESIDENCE_ANIMATION_IMPLEMENTATION_BRIEF.md`)

Five experiences were implemented against the brief; the brief's measured **[V]** values were followed, its estimates **[E]** used as starting points.

| # | Experience | Where | How it differs from the brief |
|---|---|---|---|
| 1 | Preloader exit + hero entrance (arch mask) | `components/layout/Intro.tsx`, `components/motion/engine/intro.ts`, `styles/structure/chrome.css` | A CSS mask with a measured arch keyframe table, driven by the Web Animations API (not GSAP, so it runs before the home-only GSAP chunk). Skip on key/click/tap/wheel; a 5 s watchdog; plays once per tab session. |
| 2 | Flowers (assets, positions, layering) | `components/ui/Flower.tsx`, `lib/flower.ts`, `styles/structure/flowers.css`, `scripts/assets/` | Real alpha videos, the reference's own clips as supplied by the site owner (see ASSETS.md). **Closing flower (#8)** is hung from the top-LEFT instead of the top-right: top-right is exactly where the fixed navigation sits. **#5 ("Live in") has no parallax**, because its cut edges coincide with the photo frame's and a drift would pull them into view. Clip 03 (#3) has not been supplied, so that placement is empty. |
| 3 | Moving clouds (three layers, scroll parallax) | `components/sections/Horizon.tsx`, `components/ui/CloudMarquee.tsx`, `styles/structure/sections/horizon.css` | The cloud artwork is original (painted procedurally), not the reference's. Three CSS marquee layers with the brief's speed ratios; the photo parallaxes ±15 % and settles 1.15× → 1×. |
| 4 | "The space to Live in" typography and composition | `components/sections/HowIWork.tsx`, `styles/structure/sections/how.css` | Characters flip in; the tilted italic accent overlaps the last line; the left column (burgundy block + languages) and the right photograph drift in opposite directions; proportions measured from the reference's screenshots (see `how.css`'s header). |
| 5 | Two windows align, merge and zoom, with the corner flowers | `components/sections/CtaFooter.tsx`, `components/motion/engine/home.ts` (`closingScene`), `closing-geometry.ts` | See row 11 above. |

Verification of each is in VERIFICATION.md; what could not be tested (Safari's HEVC-alpha playback) is listed there.
