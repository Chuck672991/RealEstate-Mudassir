# Open items

Everything here is something **only the agent, the broker or the site owner can decide or supply**. None of it is a code defect: each item is a place where the site deliberately **shows less rather than guess**, because the research behind the content (`REAL_ESTATE_AGENT_CONTENT_BRIEF.md`) could not verify it.

Where the data genuinely conflicts, the conflict is listed — not resolved — and the contested value is not shown.

## Launch checklist

Work top to bottom. Items marked ▢ are blockers for a public launch; the rest improve it.

### A. Facts the agent must confirm

| ▢ | Question | What the site does now |
| :-: | --- | --- |
| ▢ | **Which phone number and email?** The profile shows **(224) 231-4552** (verified). The bio also prints `630-965-5492` (garbled, unverified). No email is published anywhere. | Shows (224) 231-4552 only. No email; the contact form is the channel. |
| ▢ | **Exact title and licence class.** The bio says "real estate **broker**"; the FAQ says "real estate **agent**" and "licensed REALTOR®". The Illinois licence #475192496 is shown as displayed on the profile but was **not looked up on the state registry**. | The title is not a claim the site makes. The *editorial* copy (hero eyebrow, default SEO title and description, the structured-data page name) uses the bio's word "broker" — covered by the copy-approval step below, so confirm it. The licence number is shown. |
| ▢ | **The price range.** Homes.com's headline range `$193K–$990K` **contradicts** its own component ranges (buyer-side `$105K–$990K`, seller-side `$125K–$640K`). | The headline range is stored but **never selected by any query**. Component ranges stay hidden until confirmed (*Market statistics → Show published price ranges*). The price *bands* shown are calculated from the sales in the dataset and footnoted as a subset. |
|   | **Designations, awards, NAR / REALTOR® membership.** None is evidenced. | None is shown, and the structured data has no `hasCredential`. Provide issuer + year to add one. |
|   | **Years of experience.** "18 years" is the profile's own statement; how many are real estate versus finance and banking? | Shown as "18 years *(as stated by Mudassir)*". |
|   | **Agent website and Facebook.** `buywithms.com` did not resolve on 2026-10-24; the Facebook page is not viewable logged out. | Neither is linked. |
|   | **Prior brokerage.** Two 2021 reviews name "Realty Executives". | Not mentioned. |
|   | **Which specialties are real?** Luxury, relocation, commercial, military/veteran, senior, short-sale, mortgage — none is evidenced. | 8 of 16 specialties (those with evidence) are shown; the rest are stored with `safeToFeature` off. |
|   | **Brand name** (the URLs hint at "MS") **and how to group neighbourhoods.** | The site is named for the agent. Areas follow Homes.com's labels, which overlap (a footnote says so). |

### B. Reviews

| ▢ | Question | What the site does now |
| :-: | --- | --- |
| ▢ | **Are the review integrity flags benign?** 18 of the 88 reviews share the date 2021-07-23; three pairs are word-for-word identical; 11 reviewers share the agent's surname and one posts under his own name; nine have business-style names; the newest is July 2022 (§8.3 of the brief). | **No review text is shown** — the 88 are loaded unpublished with their flags. |
| ▢ | **Keep the "5.0 · 88 reviews" summary?** | Shown **with its source and its date range (July 2021 – July 2022)** so it cannot read as recent. Hide it with *Site settings → Show the review rating summary*. |
|   | **Which individual reviews may be quoted, and do you have each reviewer's consent?** | A quote appears only when it is marked *approved*, *reviewer permission* is ticked **and** the exact text is present. Verified on a fixture (three approved quotes render correctly). |
|   | — | **No `AggregateRating` or `Review` markup is ever emitted** (self-published review markup on an entity's own site is not allowed). A unit test pins this. Keep it that way. |

### C. Rights and permissions

| ▢ | Item | What the site does now |
| :-: | --- | --- |
| ▢ | **Photographs — permission.** 28 pictures (the agent's portrait, 6 area photos, 21 listing photos) were saved by hand from the agent's public Homes.com profile and are **shown on the site with rights `owner_directed`: permission is NOT confirmed.** Homes.com/MLS pictures are not cleared for reuse. Obtain written permission from the photographers/MLS, or the agent's own originals (larger ones too — most are 650 px wide), then set the rights to *Written permission obtained*. 41 listing slots and the brokerage logo still have none. | The pictures appear; the rest show placeholders. A takedown or claim from the photographers/MLS is the risk if this goes public without permission. |
| ▢ | **HomeSmart logo, trademark and required disclosures.** | No logo. The brokerage *name* is shown as text. Put the broker's required advertising wording in *Site settings → Compliance notice* and *Listing data disclaimer* (the MLS Grid wording is **not** copied). |
| ▢ | **May sold addresses and prices be shown?** What does HomeSmart / MLS policy allow? | Sold records show city · type · month · price. **No street address** anywhere (`addressPublic` is off). |
|   | **Live listings.** The for-sale and pending homes are a snapshot from 2026-10-24. | Each carries "Details as of …" and "Please confirm availability". For truly live listings use a broker-approved IDX/MLS feed. |
|   | **The data-source notice in the footer.** | Seeded text in *Site settings → Data source notice* ("collected from … public Homes.com profile on October 24, 2026 …"). Rewrite it if the data source changes; leave it empty to show nothing. |

### D. Copy approvals

The starter copy was drafted **only from facts in the brief**. Each editorial document has a *"Copy approved by the agent"* checkbox that starts **off**:

- [ ] Home page
- [ ] Homes page
- [ ] Contact page
- [ ] Agent profile (introduction and bio)

### E. Accounts and configuration (none could be exercised here)

- [ ] ▢ Create the Sanity project and `production` dataset; set the CORS origins (with credentials); create the Viewer and Editor tokens; run `npm run seed:sanity` ([README → Connect Sanity](../README.md#connect-sanity)).
- [ ] **Public or private dataset?** A public dataset is readable by anyone, including fields the site never shows (street addresses, source URLs, internal notes). A private dataset needs `SANITY_API_READ_TOKEN`; that path is implemented but was **not** exercised.
- [ ] ▢ `NEXT_PUBLIC_SITE_URL` set to the real `https://` origin (while it is the localhost placeholder, `robots.txt` blocks all crawling and canonical URLs point at localhost).
- [ ] ▢ `CONTENT_SOURCE=sanity` in production, so a missing project id fails the build instead of serving bundled content.
- [ ] ▢ Webhook → `/api/revalidate` with `SANITY_REVALIDATE_SECRET`; test by publishing a change.
- [ ] ▢ **Inquiry delivery:** configure Resend (`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`) and/or `INQUIRY_WEBHOOK_URL`, then send a real test inquiry. Until then the form honestly says it is not connected and shows the phone number.
- [ ] Add a CAPTCHA (e.g. Cloudflare Turnstile) and a hosted rate limiter — the built-in limiter is per server instance.
- [ ] Test Presentation / Draft Mode with a Viewer token.
- [ ] Restrict who can edit in the Studio; decide who approves copy.
- [ ] Choose the host and domain; set the production env vars (**not** `SANITY_API_WRITE_TOKEN`).
- [ ] If analytics or tracking are added later, add a consent layer — the site currently sets no cookies and loads no third-party scripts, which is why there is no cookie banner.
- [ ] Read GSAP's licence (free, but not open source) before redistributing; Lenis is MIT; the fonts are SIL OFL.

### F. Quality gates still to run

- [ ] The [manual accessibility checklist](ACCESSIBILITY.md#manual-checklist-before-launch) (screen readers, real devices, forced colours, 400 % zoom).
- [ ] Safari, Firefox and a real phone — only Chrome has been used.
- [ ] After the first real photographs: re-run `verify:a11y`, `verify:contrast`, `overlay-contrast.mjs --stress white`, and look at the sold stage and hero.
- [ ] Look at Core Web Vitals on the real host (the lab numbers here are from localhost and are optimistic).
- [ ] Submit the sitemap in Search Console once the real origin is live.

---

## Known limitations of the build

These are engineering facts, not decisions. Details and evidence: [`VERIFICATION.md`](VERIFICATION.md).

- **Unknown home URLs answer HTTP 200** (with the "not found" page and `noindex`), because Cache Components streams the response. `/properties/__no-homes__` and every other unknown URL return a true 404. Search engines treat the `noindex` page correctly, but a strict 404 would be cleaner; this is a framework trade-off.
- **Local-content mode** evaluates the same GROQ with `groq-js`, not Sanity's engine. They implement the same language, but they are not the same code.
- **The fixed header follows the section behind it, not the picture.** The Recently-sold stage and the hero are protected by a scrim; elsewhere a header piece can pass over a photograph for a moment while scrolling, in the wrong ink.
- **Photographs in an inactive carousel slide load when the slide is first shown** (the blurred preview covers the gap). Not measured on a slow network.
- **The `next/image` allow-list is built from the Sanity project id at build time** — changing the project means rebuilding.
- **Theme selection is build-time** (`NEXT_PUBLIC_THEME`), not a runtime switch.
- **Node 25** was used; Next supports 20.9+ and 22/24 LTS are the safer production choices. Node 25 prints a `--localstorage-file` warning during builds and dev (environmental, no visible effect — [details](VERIFICATION.md#known-limitations)).
- **Very long text** (a long name, headline or title) has not been stress-tested; the shipped content is short.
