# Mudassir Siddiqui — real estate portfolio

A premium, editorial website for a Chicagoland real-estate broker, built on **Next.js 16 (Cache Components, Partial Prefetching)**, **React 19**, **Tailwind CSS v4**, **Sanity v6** (embedded Studio at `/studio`) and **GSAP + Lenis** for the scroll choreography.

* **Design** follows `REFERENCE_WEBSITE_DESIGN_BRIEF.md` (an arch-shaped, editorial, slow-scroll language) rendered in an original palette, original artwork and original copy. Where the build differs from the reference it says so: [`docs/REFERENCE-MAPPING.md`](docs/REFERENCE-MAPPING.md).
* **Facts** come from `REAL_ESTATE_AGENT_CONTENT_BRIEF.md` / `content_seed.json` and are shown only when their research status allows it (verified / calculated). Nothing is invented: [`docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md).
* **All business content lives in Sanity.** With no CMS connected, the site runs on the same documents from the bundled dataset ("local content" mode), so a fresh clone renders everything.
* **The theme is replaceable** (CSS tokens + a build-time registry; a second theme is included to prove it): [`docs/THEMING.md`](docs/THEMING.md).

> **Honest status.** Everything that could be verified without a Sanity project, an email provider or a deployed host was verified — see [Verification](#verification). The integrations that need your accounts (Sanity project, webhook, Draft Mode / Presentation, inquiry delivery, deployment) are implemented but **not exercised against real services**; their set-up is below and the gaps are listed in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

---

## Quick start (no accounts needed)

```bash
npm install
npm run dev          # http://localhost:3000  — local-content mode
```

Requires Node **20.9+** (22 or 24 LTS recommended). With no `NEXT_PUBLIC_SANITY_PROJECT_ID` the site reads `content_seed.json` through the same GROQ queries and the same publication rules it uses against Sanity.

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Develop, production build, serve the build |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint · `next typegen` + `tsc` · 116 unit tests |
| `npm run schema:validate` | Validates the Sanity schemas with the Sanity CLI |
| `npm run typegen` | Regenerates `sanity/sanity.types.ts` from the schemas + GROQ queries (checked by `lib/sanity/contract.ts`) |
| `npm run seed:sanity:dry` · `npm run seed:sanity` | Plan / apply the idempotent import into Sanity |
| `npm run assets:manifest` · `assets:check` | Write / verify `docs/asset-manifest.json` |
| `npm run images:import -- --map <file>` | Upload **agent-supplied** originals with recorded rights |
| `npm run verify:contrast` | WCAG contrast audit of every theme (includes the photo-scrim guarantee) |
| `npm run verify:states \| interactions \| a11y \| seo \| perf \| console -- <url>` | Browser/SEO/performance checks against a running server |
| `node scripts/verify/overlay-contrast.mjs <url> [--stress white]` | Contrast of text over gradients and photographs, measured from rendered pixels |
| `npm run screenshots -- <url> <outDir>` | One screenshot per section |

---

## Connect Sanity

1. **Create a project** at <https://www.sanity.io/manage> and note its *Project ID*. Create the `production` dataset.
2. **Public or private dataset?** A *public* dataset is readable by anyone through the API — including fields the website never shows (street addresses, source URLs, internal notes). Those are public listing facts, but "not displayed" is not "secret". If you prefer to keep them out of the open, create the dataset as **private** (`npx sanity datasets create production --visibility private`) and set `SANITY_API_READ_TOKEN`; the server-only client then authenticates every read ([`lib/sanity/client.ts`](lib/sanity/client.ts)). *Never store anything confidential in Sanity*: inquiries are deliberately **not** stored there (see [Inquiry form](#inquiry-form)).
3. **CORS** (Manage → API → CORS origins): add `http://localhost:3000` and your production origin, **with credentials allowed** (the embedded Studio signs in from those origins).
4. **Tokens** (Manage → API → Tokens): a **Viewer** token → `SANITY_API_READ_TOKEN` (Draft Mode / private dataset); an **Editor** token → `SANITY_API_WRITE_TOKEN` (used only by the seed script, on your machine — do **not** put it in your host's environment).
5. **Environment** — `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, the tokens, a random `SANITY_REVALIDATE_SECRET`, and `NEXT_PUBLIC_SITE_URL`. Set `CONTENT_SOURCE=sanity` in production so a missing project id fails loudly instead of silently serving local content.
6. **Seed** — preview, then apply:

   ```bash
   npm run seed:sanity:dry      # offline: shows what would be created (196 documents)
   npm run seed:sanity          # writes to your dataset
   ```

   The seed is **idempotent and non-destructive**: stable document IDs (no duplicates), a per-field hash so a re-run only updates dataset-derived fields an editor has not touched, editorial copy and uploads are written once and never overwritten, nothing is ever deleted, hand-made documents are skipped, and the report lists created / updated / unchanged / skipped / conflicts / failed. It records photo *source URLs as metadata only* and never downloads an image.
7. **Open `/studio`**, review the starter copy (each editorial document has a *"Copy approved by the agent"* checkbox that starts **off**), and publish.
8. **Webhook** (Manage → API → Webhooks) so publishing updates the site without a redeploy: URL `https://<your-site>/api/revalidate`, method `POST`, trigger on create/update/delete for your dataset, secret = `SANITY_REVALIDATE_SECRET`. The route verifies the signature (`next-sanity/webhook`) and expires the `sanity-content` cache tag. Content also revalidates on a safety-net schedule (1 h).
9. **Presentation / Draft Mode** — in the Studio, the Presentation tool previews the site and enters Draft Mode through `/api/draft-mode/enable` (needs `SANITY_API_READ_TOKEN`). While in Draft Mode the site shows an "Exit" pill and mounts `<SanityLive>` + visual-editing overlays; visitors get none of that.

Document types: Home page · Homes page · Contact page · Site settings · Agent profile · Brokerage · Properties · Service areas · Specialties · Testimonials · Market statistics · Sources. Home/Homes/Contact/Site settings/Agent/Brokerage/Market statistics are singletons (no "create new", cannot be deleted from the Studio).

---

## Inquiry form

Contact details are entered by visitors, so they are **never written to the (public) Sanity dataset**. The server action ([`app/actions/inquiry.ts`](app/actions/inquiry.ts)) validates and sanitises every field, applies a honeypot, an advisory minimum-fill-time check and a per-instance rate limit, then hands the message to **at least one transport you configure** ([`lib/inquiry/deliver.ts`](lib/inquiry/deliver.ts)):

* `RESEND_API_KEY` + `INQUIRY_TO_EMAIL` + `INQUIRY_FROM_EMAIL` — email via Resend, **and/or**
* `INQUIRY_WEBHOOK_URL` — any HTTPS endpoint (Zapier, Make, a CRM).

With neither configured the form says so and shows the verified phone number instead of pretending to deliver. **Limitations:** delivery has not been exercised against Resend/a webhook here; the rate limiter is per server instance (put a WAF or a hosted limiter in front for real traffic); consider adding Cloudflare Turnstile/hCaptcha before launch.

---

## Theming

All decoration is CSS custom properties; components only read **semantic** tokens (`--surface`, `--ink`, `--ff-display`, `--ease-out` …), never hex values — a unit test fails the build if a literal colour appears outside `styles/themes/`. Two themes ship: `plum-luxury` (default) and `slate-linen`.

```bash
NEXT_PUBLIC_THEME=slate-linen npm run build     # build-time selection
```

Adding or switching a theme, the token contract, and what is structural vs decorative: [`docs/THEMING.md`](docs/THEMING.md).

---

## Images

Homes.com refuses automated access (HTTP 403), so **this project downloads nothing**. The site owner saved 28 pictures by hand from the agent's public Homes.com profile into `public/photos/`; they are mapped in [`content/local-images.json`](content/local-images.json) with the rights status **`owner_directed` (permission NOT confirmed)** and shown in local-content mode — the portrait, six area photos and the 17 published homes. Homes.com/MLS pictures are **not cleared for reuse** (content brief §9): get the photographers'/MLS's written permission, or the agent's own originals, before launch ([`docs/ASSETS.md`](docs/ASSETS.md)). The photographs are shipped as high-resolution lossless PNGs made from the originals with Apple's on-device super-resolution (`npm run photos:hires`; the originals are kept in `assets/owner-supplied/photo-originals/`) — see the **High-resolution versions** note in [`docs/ASSETS.md`](docs/ASSETS.md) for what that does and does not do. Every other slot renders a tactile material + line-art placeholder in an identical box (`npm run images:import` uploads agent-supplied originals to Sanity), and the site refuses to render any image whose rights are `pending` or `not cleared`. Photographs can be any brightness, so text placed over one carries its own dark backing (`.scrim`, token-based) — proven against a pure-white picture, see [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md#text-over-photographs--the-scrim).

---

## Deployment

Any Node host works; Vercel needs no extra config.

1. Set the environment variables from `.env.example` on the host — **not** `SANITY_API_WRITE_TOKEN`. Required in production: `NEXT_PUBLIC_SITE_URL` (the real `https://` origin — while it is the localhost placeholder `robots.txt` blocks all crawling), the Sanity project id/dataset, `CONTENT_SOURCE=sanity`, `SANITY_REVALIDATE_SECRET`, and an inquiry transport.
2. `npm run build && npm start` (or let the platform build).
3. Add the Sanity webhook and the production origin to CORS; deploy the Studio nowhere else — it is served from `/studio` of this app.
4. Run the [launch checklist](docs/OPEN-ITEMS.md#launch-checklist).

Notes: the home page, `/properties`, `/contact` and every published home are prerendered; the cache lifetime is 1 h with tag-based expiry from the webhook. An unknown `/properties/<slug>` renders the "not found" page with a `noindex` tag but, because Cache Components streams the response, answers HTTP 200 — unknown URLs elsewhere return a true 404 (details: [`docs/VERIFICATION.md`](docs/VERIFICATION.md)).

---

## Verification

Run against a production build (`npm run build && npm start`) unless noted. Results at the time of writing are in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

```bash
npm run lint && npm run typecheck && npm test      # static checks + 163 unit tests
npm run schema:validate && npm run seed:sanity:dry # Sanity schemas + seed plan
npm run verify:contrast                            # WCAG AA contrast, all themes
node scripts/verify/overlay-contrast.mjs http://localhost:3000 --stress white   # text over a worst-case (white) photograph
npm run verify:states -- http://localhost:3000         # every page, 3 contexts: console, placeholders, overflow, nothing empty (add --empty for an empty CMS)
npm run verify:interactions -- http://localhost:3000   # dialogs, forms, carousel, tabs, filters, navigation, no-JS, reduced motion
npm run verify:a11y -- http://localhost:3000           # axe-core, every page incl. all published homes, 3 contexts
npm run verify:seo -- http://localhost:3000 https://your-origin   # metadata, JSON-LD, sitemap, robots, links
npm run verify:perf -- http://localhost:3000           # LCP / CLS / payload
npm run verify:console -- http://localhost:3000        # run against `npm run dev` to catch hydration mismatches
npm run verify:flowers -- http://localhost:3000        # flower videos: play only near the viewport, WebM chosen, nothing plays under reduced motion
npm run photos:hires                                   # (macOS 26+, Apple silicon) redo the photograph PNGs from assets/owner-supplied/photo-originals/
npm run flowers:build                                  # (macOS) rebuild the flower video clips from public/flowers/bougainvillea-flowers_NN.mov — see docs/ASSETS.md
```

The browser scripts use `playwright-core` with an installed Chrome (`PW_CHANNEL` overrides the channel). **Only Chrome was used** and nothing was exercised against a live Sanity project — the full list of what was and was not verified is in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

---

## Project layout

```
app/                    routes: (site) pages, (studio) /studio, api/, og, sitemap, robots, icons
  (site)/(pages)/       /properties, /properties/[slug], /contact + shared footer
components/             sections/ (home), ui/, layout/, forms/, properties/, motion/ (+ engine/)
features/               data-access layer: queries → publication rules → minimal DTOs (tested)
lib/                    sanity/ (clients, GROQ, contract), seed/ (mapper, assets), seo/, theme/, inquiry/, utils/
sanity/                 schemas, Studio structure, generated types
scripts/                seed, asset manifest, image import, verify/ (browser + SEO + contrast checks)
styles/                 tokens.css (contract) · themes/ (decoration) · structure/ (layout, sections, motion)
docs/                   theming, content model, assets, reference mapping, accessibility, open items, verification
types/content.ts        the DTOs components are allowed to see
```

Why this shape: pages never see raw CMS data. `features/*` turns it into DTOs after applying the publication policy (only verified/calculated claims, approved testimonials, cleared images, public records), so a component *cannot* render an unverified phone number or an uncleared photo.

---

## Notes and licences

* **Fonts** — Bodoni Moda and Archivo (SIL OFL), self-hosted by `next/font`; static copies for generated images in `assets/fonts/`.
* **GSAP** (incl. ScrollTrigger / CustomEase) is free to use under GSAP's standard licence but is **not open source** — read it before redistributing. **Lenis** is MIT.
* **Node** — built and verified on Node 25.2; Next 16 supports 20.9+, and 22/24 LTS are the safer production choices.
* `AGENTS.md` is written and re-added by `next dev` (framework notice); leave it.
