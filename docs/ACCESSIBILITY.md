# Accessibility

**Target:** WCAG 2.2 level AA.

**Status:** scripted and automated checks pass (numbers below). **No human assistive-technology testing has been done**, and only Chrome was used. Automated rules catch roughly a third of real problems, so please do not describe the site as "WCAG 2.2 AA conformant" until the [manual checklist](#manual-checklist-before-launch) has been run by a person.

---

## What is built in

| Area | What exists |
| --- | --- |
| **Structure** | `lang="en"`; one `<h1>` per page; ordered headings; landmarks (`header`, `main`, `footer`, labelled `nav`s and a labelled legal `aside`); breadcrumbs on inner pages. |
| **Keyboard** | The first Tab stop is a *Skip to content* link. Everything interactive is a real `<a>` or `<button>`. Visible `:focus-visible` rings (an inverse ring on dark surfaces). Focusing a link inside a pinned or sideways-scrolling section scrolls the page to it (implemented; not yet walked through by a person). |
| **Dialogs** | The contact form and the mobile menu are native `<dialog>` elements: modal, focus moves in, **Esc** closes, the background is inert, focus returns to the opener. |
| **Carousels** | ARIA carousel pattern; arrow keys; inactive slides are `inert` and hidden from assistive technology; **auto-advance starts by itself when the carousel is on screen and has NO pause/play button** (the site owner's decision, replacing the earlier Pause control) — it stops for keyboard focus inside the carousel, when the carousel is off screen, when the tab is hidden, and when reduced motion is requested; a resting mouse pointer or a click on an arrow does not stop it. **⚠ This does not meet WCAG 2.2.2 (Pause, Stop, Hide, level A) for visitors who see the motion:** the slides move without a way to stop them other than the keyboard-focus pause, and previous / next only skip. Restoring a control is a small change in `components/ui/Slider.tsx`. |
| **Tabs** (Recently sold) | ARIA tabs with a roving `tabindex` and arrow-key selection. |
| **Filters** | Toggle buttons with `aria-pressed`; the state is in the URL so a filtered view can be shared and survives a reload. |
| **Forms** | Visible labels; an error summary; `aria-invalid` and `aria-describedby` on every flagged field; an honest result message (sent, or "not connected — please call"). A honeypot field is hidden from people *and* assistive technology. |
| **Names** | Label-in-name (WCAG 2.5.3) for the badge link and buttons; the rotating badge ring is `aria-hidden` and its text is part of the link's accessible name. Visually hidden text where a number needs context ("5.0 out of 5", "Call …"). |
| **Motion** | `prefers-reduced-motion` is handled deliberately: no pinned stages, no smooth-scroll engine, no reveals, no badge spin, no autoplay, no intro. Nothing flashes. The first-visit intro is skippable (key, click or scroll), plays once per tab session and the page is already rendered underneath it. |
| **No JavaScript** | Content is not hidden; every carousel slide is listed; the headline is present. |
| **Zoom and reflow** | No horizontal scrolling at 320 px wide (≈ 400 % zoom) or at 200 % root font size on a phone. |
| **Images** | The Studio requires alt text for an informative image, or an explicit "decorative" flag. Placeholder artwork is decorative and `aria-hidden`. |
| **Contrast** | See [below](#text-over-photographs--the-scrim). |
| **Pointer targets** | Small text links get an invisible extension of their clickable area (`.hit-slop`), the nav links likewise, the carousel buttons are 44 px, the consent checkbox 24 px (WCAG 2.5.8). |

---

## Measured results

All against the production build (`npm run build && npm start`), Chrome, Node 25. Scripts are in [`scripts/verify/`](../scripts/verify); how to re-run them is in [`VERIFICATION.md`](VERIFICATION.md).

| Check | Scope | Result |
| --- | --- | --- |
| **axe-core** (WCAG 2.0/2.1/2.2 A + AA + best practice) | 21 pages (home, `/properties`, all 17 homes, `/contact`, a 404) × 3 contexts (desktop, desktop reduced-motion, phone) = **63 runs** | **0 violations** |
| Interaction script | dialogs, form validation, carousel, tabs, filters, skip link, reduced motion, no-JS, client navigation, 320 px / 200 % text | **43 / 43** |
| Token contrast audit | every foreground/background pair the site uses, both themes | **48 / 48** pass |
| Overlay contrast (text over gradients, textures, the lit doorway) | 10 scenes, 83 text/background pairings, desktop + phone | **83 / 83** pass |
| **Photo stress test** — every photograph slot replaced by flat **white** | hero, sold stage, fixed header; 64 pairings | **64 / 64** pass |
| Photo stress test — flat **black** | same | **64 / 64** pass |
| State audit (console, placeholders, overflow, empty sections, headings, nav) | 21 pages × 3 contexts | **316 / 316** |
| Pointer-target size (WCAG 2.5.8), real hit areas | 637 target measurements on 4 page types, desktop + phone | 10 measurements (2 distinct controls) remain under 24 × 24 px: the footer *Homes.com profile* link passes the spacing exception; *Back to top* has one transient overlap (below) |

### axe "needs review" items

axe could not decide two things and flags them on most pages. Both were examined by hand:

* **`color-contrast` on SVG `textPath`** — the rotating badge ring. axe cannot compute contrast for text on a path. Its colour is an ink token already audited above; it is decorative (`aria-hidden`) and repeats the link's accessible name.
* **`aria-valid-attr-value` on `aria-haspopup="dialog"`** — `dialog` is a valid token; axe cannot confirm the popup target statically.

### Target size, in detail

WCAG 2.5.8 asks for 24 × 24 CSS px *unless* a 24 px circle centred on the target touches no other target. The check (an ad-hoc Playwright script, not committed) samples `elementFromPoint` to find each control's **real** clickable area, then applies that rule. It found, and these changes fixed:

* the desktop **nav links** — only 20 px tall with ~12 px between them. The menu has since been redesigned (one medium two-line link + two small labels; measured at 1470 px wide: 53 px and 23 px tall, no two targets overlapping; axe reports no violation);
* small **text links** — the header and call-to-action phone numbers, *Back to top* (12 px tall), *View details*, *Read the reviews*, the breadcrumbs, the phone link on a home's page (a reusable `.hit-slop` utility, nothing moves);
* the **consent checkbox** (18 → 24 px).

What remains under 24 px: the footer's *Homes.com profile* link (20–22 px tall, nothing within 12 px — passes the spacing exception) and *Back to top* in the pinned closing scene, which for a moment mid-scroll sits within 12 px of the large circular CTA button. At rest the CTA content is hidden and the link has a ≥ 24 px area. This one flag is recorded rather than hidden.

(An earlier version of the check clipped controls at the viewport edge and reported the carousel buttons as 20 px tall; they are 44 px. A check this easy to get wrong is another reason for the manual pass.)

---

## Moving decoration (flowers, clouds)

The flower clips and the cloud layers are decorative: `aria-hidden`, no alt text, no controls, never focusable, `pointer-events: none`. They never autoplay: a clip plays only while its section is within a quarter of a screen of the viewport (`engine/live.ts`) and pauses otherwise. Under `prefers-reduced-motion` the motion layer does not start at all, so the flowers show their first frame (a transparent still), the clouds do not drift, and nothing is downloaded but the stills. Without JavaScript the same stills show. The clips are muted and the files this site ships have no audio track; the footage is a slow sway of foliage (it was *not* checked frame by frame for flashing, and nothing in it is designed to flash). *Not tested:* a screen-reader or switch-control walkthrough of these sections (see "Not verified" below).

**Flowers over the fixed header.** A flower may pass behind the fixed logo or navigation while you scroll; the header pieces are drawn above it and stay legible at the reading position of each section (the Reviews flower was moved from the top-right, where the reference puts it, because that is exactly where this site's navigation sits). The brand mark is partly over foliage in the first Areas screen — it stays recognisable, but it is not a text-contrast guarantee.

## Text over photographs — the scrim

Photographs arrived only late (the owner supplied 28; their rights are not confirmed — [`ASSETS.md`](ASSETS.md)), so the contrast figures above were first measured over the dark material placeholders. That would have hidden a serious problem: the moment someone uploads a *bright* photograph, light text on top of it vanishes.

This was reproduced before it was fixed. With a white picture in the Recently-sold stage, the heading, the tab list (so a visitor could not pick a sale), the price, the caption **and the fixed header's nav, phone number and badge** measured 1.0–3.3 : 1. The hero's italic accent word, which overlaps the top of the lit doorway by design, measured 1.1 : 1 over a white portrait.

The fix is a **scrim**: a dark backing that travels with the text instead of relying on the picture.

* `--scrim` (90 % of `--surface-deep`) backs small text; `--scrim-display` (65 %) backs display-size type, which needs only 3 : 1 so the photo stays visible. Both are tokens in [`styles/tokens.css`](../styles/tokens.css); components never contain a colour.
* `.scrim` (a utility in `styles/structure/materials.css`) is applied to the three text groups of the Recently-sold stage; the hero doorway has a top veil; and **each fixed header piece gets its own plate whenever the surface behind it is marked `data-scrim`** (the tone engine, `components/motion/engine/tone.ts`, hit-tests it). Doing it per piece means it copes with a menu of any length.
* Over the dark placeholders the plates are nearly invisible; over a white photo they read as dark caption cards.
* **Proof, for any theme:** `npm run verify:contrast` computes ivory text on the scrim over a pure-white photograph (10.2 : 1 and 4.9 : 1 for muted text in the default theme; 4.4 : 1 for the display scrim against a 3 : 1 need). **Proof on the page:** `node scripts/verify/overlay-contrast.mjs <url> --stress white` measures the real rendered pixels. The script is also opacity-aware now — it previously ignored `opacity`, which had flattered the dimmed inactive tabs; those are now coloured by a token instead.

**Rule for new work:** any text placed over a photograph must use `.scrim` (or sit outside the picture). `verify:contrast` lists this under MANUAL so it cannot be forgotten.

---

## Not verified

* **Screen readers** — VoiceOver (macOS/iOS), NVDA/JAWS (Windows), TalkBack (Android). The semantics are standard and axe-clean, but real announcements, reading order inside the pinned/sideways sections and the carousel live region have not been listened to.
* **Real devices** — no iOS Safari or Android Chrome; touch behaviour was simulated in desktop Chrome.
* **Other engines** — only Chrome. `:has()`, `color-mix()`, `@starting-style`, native `<dialog>` and `overlay` transitions are used; recent Safari and Firefox support them, but this is unconfirmed here.
* **Forced colors / Windows High Contrast, `prefers-contrast`, voice control (Dragon / Voice Control).**
* **400 % browser zoom** was approximated with a 320 px viewport, not run in a real browser zoom.
* **A human keyboard walkthrough** — Tab order, focus visibility on every surface, not losing focus when a carousel slide changes.
* **Long content** — very long titles or names (the shipped dataset's are short) have not been stress-tested.
* **Real photographs** — only synthetic flat white/black stress images and a bright/dark/busy generated fixture were used.

## Manual checklist before launch

1. Tab through every page with the keyboard only: skip link first; every control reachable and visibly focused; no trap; menu and contact dialogs return focus.
2. With VoiceOver (Safari) and NVDA (Firefox/Chrome): read the home page top to bottom; operate the carousel, the sold tabs, the filters, the contact form (try submitting empty, then valid); confirm errors are announced.
3. Turn on *Reduce motion* in the OS: the page must be a plain scrolling document with all content visible.
4. Zoom the browser to 400 % at 1280 px: no loss of content or function.
5. Windows High Contrast / forced colors: controls and focus rings must remain visible.
6. After the first real photographs are uploaded: re-run `verify:a11y`, `verify:contrast`, and `overlay-contrast.mjs --stress white`, and look at the sold stage and hero with the real pictures.
7. Re-check the colour of anything the agent adds in the Studio — a new text field placed over a photograph needs `.scrim`.
