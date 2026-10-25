# Content model and publication rules

All business content is stored as Sanity documents. This page explains how the twelve collections of `content_seed.json` were mapped (deliberately, not mechanically), what the website is *allowed* to show, how the seed treats your edits, and what "local content" mode is.

## The twelve collections → Sanity types

| `content_seed.json` | Sanity | Why it is shaped this way |
| --- | --- | --- |
| `agent_profile` | **`agentProfile`** (singleton) | Name, languages, years, licence, rating, credentials and links are all *claims* — each carries a verification status, so one unverified value (a second phone number, an unproven designation) can never leak. Credentials are an array of objects with their own status. |
| `brokerage_details` | **`brokerage`** (singleton, referenced by the agent) | The brokerage is a separate entity (logo rights, disclosures, office address differ from the agent's). |
| `agent_experience` + `price_statistics` | **`marketStatistics`** (singleton) + `agentProfile.yearsExperience` | Headline five-year figures, 12-month/5-year buyer/seller windows, price bands (*calculated from a subset*, with the basis text), consistency checks and the known limitation notes. The `$193K–$990K` headline range is stored but **never selected by any query** (it contradicts the component ranges). |
| `agent_specialties` | **`specialty`** (one doc each) | Each has `safeToFeature` and the evidence behind it; unsupported specialties (luxury, relocation, …) are stored but not shown. |
| `service_areas` | **`serviceArea`** (one doc each) | Closed-sales count and share per area with `showOnSite`; the office is a flagged entry, not a "service area". |
| `sold_properties` + `active_listings` | **`property`** (one type) | `status` (active / pending / sold / for_rent) and `recordTier` (full detail / price + address only / map sample) keep sold, current, pending, rental and partial records **distinct** while sharing one card, one detail page and one set of filters. |
| `testimonials` | **`testimonial`** (one doc each, 88) | Loaded as **unpublished** with their integrity flags (same-day cluster, identical text, same surname …). Only `approvedForPublication && reviewerPermission` with the exact text present can render. |
| `professional_links` | `agentProfile.links[]` | Each link has its own status (the agent's website did not resolve; Facebook was not viewable) — unverified links never render. |
| `media_assets` + photo URLs | `imageWithMeta` on the slot the picture is for | Source URL, intended use, rights status and manifest id travel with the (empty) slot; see [`ASSETS.md`](ASSETS.md). |
| `source_references` | **`source`** (22 docs) | Every claim points at its source; useful provenance for editors. |
| `meta` | `siteSettings.dataProvenance` | Observation date (drives every "as of" note) and the data policy. |

Plus three **editorial** singletons that the dataset cannot supply: **Home page**, **Homes page**, **Contact page** (headings, introductions, SEO — starter copy drafted *only* from facts in the brief and left marked "needs the agent's approval"), and **Site settings** (navigation, inquiry topics, compliance notice, listing disclaimer, **data-source notice**, default SEO).

Seeded: **196 documents** — 22 sources · 1 brokerage · 1 agent profile · 16 specialties · 8 service areas · 55 properties · 88 testimonials · 1 market statistics · 1 site settings · 3 page documents.

## What the website will show (and what it will not)

Applied in two places that must agree — the GROQ queries (`lib/sanity/queries.ts`) and the data-access layer (`features/*`, with unit tests):

| Rule | Effect with the shipped dataset |
| --- | --- |
| A claim renders only if its status is **verified** or **calculated** (`inferred`, `unavailable`, `needs_verification` never render) | Primary phone, address, licence, brokerage, languages, rating render. The second phone number, email (none exists), agent website, Facebook, **every designation and award**, the exact title class do not. |
| Properties need `publicDisplay` **and** a publishable verification status | **17 of 55** shown: 9 verified sold, 4 for sale, 4 under contract. Hidden: 30 "price + address only" sales, 1 map-sample sale, 7 rentals. |
| Under-contract homes are never "available" (no Offer markup, "Under contract" label, never in the featured slider) | 4 pending homes appear in the list, labelled. |
| Street address shows only when `addressPublic` is on (default **off**); sold cards show city, type, month, price | No street address anywhere on the site. |
| `suppressedFields` removes specific specs from cards, pages **and** structured data | The research found inconsistent specs for a few records (SOLD-003 beds/baths, SOLD-006 beds/sqft/price-vs-list, LIST-006 beds); they are suppressed. |
| Testimonials need approval + reviewer permission + exact text | **0 of 88** shown. The rating summary (5.0 · 88 reviews) is shown *with its source and its date range (July 2021 – July 2022)* so it cannot read as recent. No `AggregateRating` markup is ever emitted. |
| Specialties need `safeToFeature` | 8 of 16 shown. |
| Service areas need `showOnSite` | 7 of 8 shown (six communities + the office). |
| Images need an attached file **and** rights *owned / licensed / permission / owner_directed* | The portrait, six area photos and the 17 published homes show the owner-supplied pictures (`owner_directed`, permission unconfirmed — see [`ASSETS.md`](ASSETS.md)); other slots show placeholders |
| Calculated price bands are footnoted as covering "a subset of the sales" | Shown as a small table with its basis. |

The same rules protect future edits: an editor ticking the wrong box cannot publish an unverified claim, because the Studio *and* the data layer both refuse it.

## When content is missing

A section with nothing to show renders **nothing** — no heading over a void, no placeholder, no zero. Concretely:

| Missing | Behaviour |
| --- | --- |
| A whole document (e.g. a Sanity project that was never seeded) | Safe defaults: the agent's name, a hero from it, the menu *Homes · Contact*; every other section is absent; the inquiry form still works. |
| The menu | Falls back to *Homes · Contact* — routes that always exist, never `#anchors`. A link such as `/#about` only works while that home-page section is shown. |
| A page's SEO title | The page inherits the layout's default `<title>` (it is never blank). |
| Brokerage / address / licence | The footer's *Office* column and the contact page's details panel simply do not render; the form takes the full layout. |
| *Data source notice* | The footer's "collected from …" sentence is an editable field (*Site settings → Data source notice*), seeded once with the dataset's provenance. Empty = nothing shown. |
| Market figures / areas with a verified count / a rating | Only what exists is shown; with none of it the section is omitted. |
| Photographs | Material placeholder in an identical box (see [`ASSETS.md`](ASSETS.md)). |
| Properties | `/properties` says there are no homes; the sitemap lists only real routes; `/properties/__no-homes__` is the prerendered sentinel and is a true 404. |

This was exercised by building the real code against an **empty** and a **no-properties** dataset ([`VERIFICATION.md`](VERIFICATION.md#missing-content)).

## Statuses, in plain words

`verified` — read directly from the source · `calculated` — derived arithmetic from verified data (shown, labelled) · `inferred` — a reasonable guess (never shown) · `unavailable` — looked for, not there · `needs_verification` — present but unconfirmed (never shown).

## Local-content mode

`CONTENT_SOURCE=auto` (default) uses Sanity when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, otherwise **local content**: `lib/seed/mapper.ts` turns `content_seed.json` into exactly the documents the seed would create, and `groq-js` evaluates the *same GROQ queries* over them. So the fallback exercises the real queries and the real publication rules; it is also what CI and a fresh clone render. Use `CONTENT_SOURCE=sanity` in production to fail loudly if the CMS is not configured; `local` to force the bundled data.

If Sanity *is* configured but unreachable, the last cached render keeps serving; with nothing cached a route shows the site's error page (`app/(site)/error.tsx`) rather than empty or fabricated content.

## Typed contract with the CMS

`npm run typegen` extracts the Studio schemas and generates `sanity/sanity.types.ts` (types for every GROQ query). `lib/sanity/contract.ts` asserts, at compile time, that each query's generated result is assignable to the `Raw*` shape the data layer expects — renaming a field in the Studio or changing a query breaks `tsc`, not a page. Singleton queries filter by `_type` as well as `_id` so TypeGen can infer them precisely.

## The seed script — what "idempotent and safe" means here

* **Stable IDs** — `agentProfile`, `property-sold-001`, `serviceArea-hanover-park`, … (no dots: Sanity treats dotted IDs as private).
* **Three-way merge** — each document records a hash per dataset-derived field. On a re-run, a field is updated only if the dataset changed **and** the editor has not touched it; otherwise it is reported as a *conflict* and left alone.
* **Editorial copy, toggles and uploads are written once** and never overwritten.
* **Never deletes**, never touches documents that were created by hand, isolates a failing document without losing the rest, and reports `created / updated / unchanged / skipped / conflicts / failed`.
* **Never invents data**: placeholder text in the source ("(address not displayed)") is dropped and reported; `SOLD-038` is the one record with such a placeholder.
* Covered by 21 tests that run the seed against an in-memory store (including idempotency and edit-preservation).

## Where things live

`sanity/schemaTypes/` (schemas, grouped for editors; validation with errors vs warnings) · `sanity/structure.ts` (desk layout: "For sale", "Under contract", "Sold — shown on site", "Sold — hidden", "Rentals", "Needs verification") · `sanity/lib/enums.ts` (shared vocabularies, imported by Studio, app and seed alike) · `features/*/shape.ts` (pure publication logic, unit-tested) · `features/*/index.ts` (server-only fetch + shape).
