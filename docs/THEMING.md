# Theming

The visual identity can be replaced without touching content, schemas, data-fetching or component code. This page explains how the system is split, how to switch themes, and how to add one.

## The three layers

| Layer | Files | Contains | May contain literal colours? |
| --- | --- | --- | --- |
| **Contract** | `styles/tokens.css` | Structural tokens shared by every theme (layout rhythm, z-index scale, pinned-stage geometry, breakpoint) **and a neutral fallback for every semantic token** | Neutral greys only (fallbacks) |
| **Theme** | `styles/themes/<id>.css` | Everything decorative: raw palette, semantic roles, type voices, sizes, shape, shadows, motion timing/easing, material textures, the "lit doorway" light | **Yes — this is the only place** |
| **Structure** | `styles/structure/**`, `styles/base.css`, every component | Layout and behaviour. Reads **semantic tokens only** (`var(--surface)`, `var(--ink)`, `var(--ff-display)`, `var(--ease-out)`, …) | **No** (a unit test fails the build) |

A theme is scoped by `:root[data-theme="<id>"]`, so several can be imported at once; only the one named on `<html data-theme>` applies. If a theme forgets a token, the contract's fallback keeps the page readable instead of producing invalid CSS.

### Semantic tokens (what a theme must provide)

* **Surfaces** `--surface` (page) · `--surface-raised` (plaster plates) · `--surface-sunken` · `--surface-inverse` (dark sections) · `--surface-deep` (darkest)
* **Ink** `--ink` · `--ink-muted` · `--ink-subtle` (ornament only) · `--ink-inverse` · `--ink-inverse-muted`
* **Lines & focus** `--line` · `--line-strong` · `--line-inverse` · `--focus` · `--focus-inverse` · `--selection-*` · `--error` · `--success`
* **Status chips** `--status-sale/pending/sold-*`
* **Type** `--ff-display` · `--ff-accent` · `--ff-body` · `--ff-label` · `--display-*` · `--label-tracking` · `--text-body|small|label|h1…h6|accent-*`
* **Shape** `--radius-arch` · `--radius-pill` · `--chamfer` · `--border-hair` · `--shadow-lift` · `--drop-lift`
* **Motion** `--dur-s|m|l` · `--stagger*` · `--delay-reveal` · `--ease-out|in|in-out|soft|dive|hscroll|follow|elastic`
* **Materials** `--material-plaster|travertine|walnut|leather|stone`, `--doorway-light`, `--light-sun`, `--glyph-ink-on-light|dark` (photo-less slots and the hero/closing "doorway")
* **Botanicals** `--flower-filter` — a CSS `filter` applied to the flower videos and their posters (`none` by default). The footage is magenta; a theme that wants another palette re-tints it here (`slate-linen` uses `hue-rotate(-22deg) saturate(0.6) brightness(0.96)`, a dusk orchid). The tint is an approximation done by the browser, not a re-grade of the footage.
* **Scrim** (text over photographs) `--scrim` · `--scrim-display` · `--scrim-strength` · `--scrim-display-strength` · `--scrim-feather` — declared **once, in the contract**, and derived from the theme's `--surface-deep`. A theme does not set them; it only has to keep `--surface-deep` dark. See [Text over photographs](#text-over-photographs) below.

**Motion is a theme concern too.** CSS transitions read the `--dur-*` / `--ease-*` tokens directly, and the GSAP layer reads the same custom properties at runtime (`components/motion/engine/config.ts → readBezier`), so retiming the site is a CSS edit.

### Two halves: CSS and TypeScript

Some consumers cannot read CSS variables — the generated social image, the favicon, `<meta name="theme-color">`. Each theme therefore also has a tiny pure-data module:

```
lib/theme/themes/<id>/palette.ts   ← hex values (no next/font; safe in route handlers)
lib/theme/themes/<id>/fonts.ts     ← next/font loaders (imported only by the site layout)
lib/theme/registry.ts              ← { id → palette }, DEFAULT_THEME, resolveTheme()
lib/theme/active.ts                ← the palette of NEXT_PUBLIC_THEME
lib/theme/active-fonts.ts          ← the font class of the active theme
```

`lib/theme/theme.test.ts` fails if a palette drifts from its CSS file, if a theme lacks a required token, or if a literal colour appears anywhere outside `styles/themes/`.

## Selecting a theme

Themes are chosen **at build time** (fonts are loaded by `next/font` at build time, and a fixed theme keeps pages fully static):

```bash
NEXT_PUBLIC_THEME=slate-linen npm run build
```

Unset or unknown → `plum-luxury`. Two themes ship so you can see the difference without writing anything:

* `plum-luxury` — burgundy leather, travertine, cream plaster, dark walnut; warm and tactile.
* `slate-linen` — slate-blue leather, linen paper, grey plaster, night timber; cool and quiet. Same components, same content, same motion.

## Adding a theme

1. **CSS** — copy `styles/themes/plum-luxury.css` to `styles/themes/<id>.css`; change the selector to `:root[data-theme="<id>"]`; edit the raw palette (`--c-deep`, `--c-night`, `--c-paper`, `--c-plaster`, `--c-stone`, `--c-text` and the three tints) and anything else decorative (type scale, shape, materials, motion). Then `@import "./<id>.css";` in `styles/themes/index.css`.
2. **Palette** — add `lib/theme/themes/<id>/palette.ts` exporting a `ThemeMeta` with the same six colours.
3. **Fonts** — add `lib/theme/themes/<id>/fonts.ts` exporting `fontClassName` (re-export an existing theme's if you keep its faces).
4. **Register** — add the palette to `lib/theme/registry.ts` and the font class to `lib/theme/active-fonts.ts`.
5. **Check** — `npm test` (drift + token + no-literal-colour tests) and `npm run verify:contrast` (WCAG AA for every pairing the site uses, **including the photo scrim over a pure-white picture** — it fails if a lighter `--surface-deep` weakens the backing). Then look at it: hero and closing scene at 1600×900 and 390×844 — the text over the lit doorway is checked by eye ([`ACCESSIBILITY.md`](ACCESSIBILITY.md)).

## Text over photographs

Photographs arrive later and can be any brightness, so text that sits on one cannot rely on the picture. Such text carries a **scrim** — a dark backing derived from `--surface-deep`:

* `--scrim` (90 %) backs small text; `--scrim-display` (65 %) backs display-size type, which only needs 3 : 1, so the photo stays visible.
* The `.scrim` utility (`styles/structure/materials.css`) applies it to a text group; the hero doorway carries a top veil; and every fixed header piece gets its own plate while the surface behind it is marked `data-scrim`.
* Over the dark material placeholders it is nearly invisible. Over a white photograph it reads as a dark caption card.
* `npm run verify:contrast` proves the guarantee for each theme (ivory text ≥ 4.5 : 1 on the scrim over pure white; display type ≥ 3 : 1), and `node scripts/verify/overlay-contrast.mjs <url> --stress white` proves it on the rendered page.

**Rule:** new text placed over a photograph must use `.scrim`. Background: [`ACCESSIBILITY.md`](ACCESSIBILITY.md#text-over-photographs--the-scrim).

## What a theme cannot change (by design)

* **Section order and pinned geometry** — the arch panels overlap pinned stages by exact amounts (`--overlap`, `--hero-run`, …), which are structural tokens.
* **Content and what is allowed to show** — the publication rules live in the data layer, not the theme.
* **Accessibility behaviour** — focus rings always exist; reduced-motion handling is not a theme choice.

## Typography notes (plum-luxury)

Three voices, never mixed: **display** (Bodoni Moda, capitals, optical-size axis so large type gets the razor-thin display cut), **accent** (Bodoni Moda italic, 1–2 mixed-case words overlapping a headline), **body/labels** (Archivo; labels get their identity from tiny size + wide tracking). The reference's condensed Didone runs at 12 vw; this wider face runs at ~9.4 vw on desktop and 15 vw below 992 px so the widest headline word ("MUDASSIR") fits a 390 px phone. Total font payload ≈ 95 KB (budget ≤ 120 KB).
