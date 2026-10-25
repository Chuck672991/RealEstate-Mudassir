# Fonts used only by generated images

`BodoniModa-Regular.ttf` and `BodoniModa-Italic.ttf` are static 400-weight instances of
**Bodoni Moda** (Owen Earl / Indestructible Type), downloaded from Google Fonts and
licensed under the **SIL Open Font License 1.1** — free to use and embed.

They are read by `app/opengraph-image.tsx` (the social-sharing card), because image
generation cannot use the `next/font` files the website itself loads. The website's own
typography is configured in `lib/theme/themes/plum-luxury/fonts.ts`.
