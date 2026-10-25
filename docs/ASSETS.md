# Images and assets

## Policy

> *Public availability is not permission to reuse.* (Content brief §9)

* **Photographs now on the site were supplied by the site owner, not fetched by this project.** Homes.com refuses automated access (HTTP 403 on the profile page and its image CDN) and this project does not try to get around that. The owner saved 28 pictures from the agent's public Homes.com profile by hand into `public/photos/`: the portrait, 6 area photos and 21 listing photos. Homes.com/MLS pictures are **not cleared for reuse** (content brief §9), so each is recorded in [`content/local-images.json`](../content/local-images.json) with the rights status **`owner_directed`** — *used at the owner's direction; permission NOT confirmed*. It is shown on the site (so the site is not empty) but is deliberately **not** labelled `permission`. **Before launch, get written permission from the photographers / MLS — or replace the files with the agent's own — and then change the status.** The listing photos carry an "MS Photography" watermark, which suggests the agent's own photographer; that is an observation, not a licence.
* The only remote image host the app allows is the Sanity CDN **for this project's own assets** (`cdn.sanity.io/images/<projectId>/…`).
* A picture appears on the site only if **both** are true: a file is attached to that slot **and** its rights are `owned`, `licensed`, `permission` or `owner_directed` (`pending` and `not_cleared` stay hidden). The Studio blocks publishing `not_cleared`, warns on `pending`, and the data layer (`lib/sanity/image.ts → toImage`) enforces the same rule again — an editor mistake cannot publish an uncleared image.
* Where no picture was supplied (the 41 other listing slots, the brokerage logo) the slot renders an **original tactile placeholder** (plaster / travertine / walnut / leather / stone with line-art glyphs for property types) inside *exactly the same box* a photograph uses, so adding photos later changes nothing about the layout. The HomeSmart logo and the Homes.com logo/icons in the saved folder are **not used** (trademarks); the originals are kept out of `public/` in `assets/owner-supplied/`.
* Alt text is mandatory for informative images (Studio validation) or the image is marked *decorative*. Credits and captions travel with the image.

## The asset manifest

[`docs/asset-manifest.json`](asset-manifest.json) lists every picture slot the dataset refers to — **62** — with what it is, where it was found, who probably owns it, the decision taken (`not_downloaded`) and what is needed before the slot can show a real picture.

| Kind | Slots | Rights status | What clears it |
| --- | ---: | --- | --- |
| Agent portrait | 1 | pending | The agent supplies the original file and confirms the photographer's licence |
| Brokerage logo | 1 | pending | HomeSmart's brand rules + written approval; the broker supplies approved files |
| Area photos | 6 | not cleared | Original or licensed photography of each area |
| Listing photos | 54 | not cleared | Photos supplied by the agent/brokerage with written approval — or an MLS-compliant IDX feed |

It is generated from the same mapping that seeds the CMS (`npm run assets:manifest`; `npm run assets:check` fails if the committed file is stale) and is covered by tests (no street addresses in subjects, nothing marked downloaded or cleared, deterministic output).

## How local pictures are wired

`content/local-images.json` lists `{ doc, field, file, width, height, alt, rights, source, hotspot? }` for each picture. In **local-content mode** `lib/sanity/groq-local.ts` attaches them as image assets (a `sanity.imageAsset` document plus a reference, exactly like an upload), so the real queries, the real `toImage` rights check and every component run unchanged. `lib/sanity/local-images.test.ts` checks every file exists with the recorded size, every target document exists, alt text is real and rights stay `owner_directed`. The seed script does **not** push them to Sanity; with a Sanity project, upload via `npm run images:import` (which requires `owned`/`licensed`/`permission`).

**Matching caveats** (please check): files saved from the page lost their listing ids, so photos were matched by address. Three records share 5011 Valley Ln and two share 640 Settlement Dr (same building/house, so any pairing shows the same place). The four area photos named `image.jpg` were matched to Hanover Park, Schaumburg, Bartlett and Streamwood by the page's order — the two named files (South Tri Village, South Schaumburg) fit that order, but verify. Most listing pictures are 650 px wide; full-bleed uses (the Recently-sold stage) are upscaled and will look soft — larger originals fix that.

## Adding real photographs

**In the Studio** — open the document (Agent profile → *Headshot*, Brokerage → *Logo*, Service area → *Image*, Property → *Hero image* / *Gallery*), upload, write the alt text, choose the usage rights, add the credit, publish. The slot's metadata (original source URL, intended use, manifest id) is already filled in from the seed.

**In bulk** — put the originals in a folder with a map file:

```json
[
  { "doc": "agentProfile", "field": "headshot", "file": "portrait.jpg",
    "rights": "owned", "alt": "Mudassir Siddiqui in a dark suit outside a house", "credit": "Photo: …" },
  { "doc": "property-sold-001", "field": "heroImage", "file": "lyons-2f.jpg",
    "rights": "licensed", "alt": "Living room of a second-floor condominium", "credit": "…" }
]
```

```bash
npm run images:import -- --map photos/images.json          # dry run: validates everything
npm run images:import -- --map photos/images.json --write  # uploads + attaches (needs SANITY_API_WRITE_TOKEN)
```

The script reads **local files only** (it never fetches a URL), requires an explicit `rights` of owned/licensed/permission for every image, requires alt text unless `decorative`, accepts JPG/PNG/WebP/AVIF ≤ 25 MB, refuses to attach a field to the wrong kind of document, preserves the slot's existing metadata, and reports each success/failure. Validation is unit-tested.

**Any brightness is fine.** Text that sits on a photograph (the Recently-sold stage, the fixed header over it, the hero's accent word) carries its own dark backing — a *scrim* — so a white photo cannot make it unreadable. After uploading real pictures, still look at the sold stage and the hero, and re-run `node scripts/verify/overlay-contrast.mjs <url> --stress white` (see [`ACCESSIBILITY.md`](ACCESSIBILITY.md#text-over-photographs--the-scrim)).

## How images are served

`next/image` with AVIF → WebP negotiation, an allow-list of qualities (60/75/85), explicit `sizes` on every use, `width`/`height` from the CMS asset metadata (so no layout shift), a blurred LQIP placeholder when Sanity provides one, hotspot-aware `object-position`, `priority`/`preload` only for the first card(s) and the hero doorway, lazy loading elsewhere. Sanity serves the originals from its CDN; the site never re-hosts them.

## Brand marks and generated artwork

The monogram (an arch around "MS"), the line-art property glyphs, the material textures, the favicon/Apple icon and the social card (`/og`) are **original artwork** generated in code from the active theme; the lettering of the monogram is outlined from Bodoni Moda (SIL OFL). Nothing in that list is taken from the reference site or from Homes.com. The exceptions are the **bougainvillea flower clips**, which are the reference's own media supplied by the site owner (see *Flower clips* below, including their unconfirmed rights); the cloud artwork is original but was painted to match the reference's look.

## Flower clips (bougainvillea video)

The flowers are short looped videos with a transparent background, as in the reference (brief §2). The site owner supplied the clips as `public/flowers/bougainvillea-flowers_NN.mov` (Apple HEVC-with-alpha, 7.6–10.6 MB each) and `…_04.webm` (VP9-with-alpha). **They are the reference site's own media. They were supplied at the owner's direction; permission from their creator has not been independently confirmed** — treat them like the `owner_directed` photographs: replace them, or confirm the licence, before launch.

| Clip | Shape | Used for (brief row) |
|---|---|---|
| 01 | hangs from the top-left corner | Areas chapter, first panel (#1) |
| 02 | a pendant bunch from the top edge | Areas chapter, second panel (#2) — peeks from the stage's bottom edge, mirrored |
| 03 | — **not supplied** | Areas chapter end (#3) — renders nothing until the clip exists |
| 04 | hangs from the top-left corner | Market (#4), mirrored into the bottom-left corner |
| 05 | a band along the whole top edge | Closing windows, left (#6) |
| 06 | a cluster in the top-right corner | "Live in" photograph, over its top-right corner (#5) |
| 07 | hangs from the top edge, right of centre | Closing windows, right (#7) and the Reviews section (#8) |

**They are not served as supplied.** `npm run flowers:build` (macOS with Xcode command-line tools and ffmpeg; `scripts/assets/flower-clips.mjs`) turns each into three small files under `public/flowers/clips/` and records them in `content/flower-clips.json`:

- `NN.webm` — VP9 + alpha, 720 px, 16 fps (1–3 MB) for Chrome, Firefox and Edge;
- `NN.mov` — HEVC + alpha (1–2 MB) for Safari;
- `NN.webp` — the first frame, transparent: the poster, and the only picture reduced-motion visitors and no-JS visitors ever see.

ffmpeg cannot read the alpha layer of an Apple HEVC `.mov` (it decodes it onto white), so the script decodes with AVFoundation (`scripts/assets/alpha-video.swift`) and encodes both outputs from those frames. **Adding a clip is: drop `bougainvillea-flowers_NN.mov` (or `.webm`) into `public/flowers/` or `assets/flowers/`, run `npm run flowers:build`, commit the outputs.** A placement whose clip does not exist renders nothing — never a stand-in picture. The built files are committed so that building or deploying the site needs neither tool.

> **Deploy size.** The supplied masters (≈ 50 MB) sit in `public/flowers/`, so they are deployed although nothing references them. Move them to `assets/flowers/` (the script reads both) to keep them out of the deploy.

Playback: `preload="none"`, muted, looped, `playsinline`, no `autoplay`; `engine/live.ts` plays a clip only while its section is within a quarter of a screen of the viewport and pauses it otherwise. The `.mov` is listed first under a QuickTime MIME type only Safari claims to play, so Chrome and Firefox take the WebM.

## Clouds

`public/clouds/cloud-{a,b,c}.webp` are **original artwork**, painted procedurally with canvas 2D (layered soft puffs, displaced edges, blue-grey shading) and are illustrations, not photographs. They are not the reference's clouds.

## The closing scene's photograph

An optional field on the Home document, **"Closing scene — photograph"**, chosen by the editor (landscape, at least 1600 px wide). With none, the page falls back to the last service area's photograph. In local-content mode `content/local-images.json` fills it with a photograph the owner supplied (`owner_directed`, as the others).
