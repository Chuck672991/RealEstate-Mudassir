import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import { getAgent } from "@/features/agent";
import { getHome } from "@/features/home";
import { activeTheme } from "@/lib/theme/active";

const size = { width: 1200, height: 630 };

const font = (file: string) => readFile(path.join(process.cwd(), "assets/fonts", file));

/**
 * The default social-sharing card (used wherever a page has no sharing image of its
 * own in the CMS). Colours come from the active theme's palette, type is the theme's
 * display face, and every word comes from the CMS — nothing here is hard-coded copy.
 *
 * A plain route handler rather than the `opengraph-image` file convention on purpose:
 * the convention resolves its absolute URL from hosting-provider environment
 * variables, ignoring `metadataBase` on self-hosted deployments. Pages reference
 * this route explicitly (see lib/seo/metadata.ts), so the URL is always built from
 * NEXT_PUBLIC_SITE_URL.
 */
export async function GET() {
  const [agent, home, regular, italic] = await Promise.all([
    getAgent(),
    getHome(),
    font("BodoniModa-Regular.ttf"),
    font("BodoniModa-Italic.ttf"),
  ]);
  const { palette } = activeTheme;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: palette.surfaceInverse,
          color: palette.inkInverse,
          padding: "64px 72px",
          fontFamily: "Bodoni",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: palette.accent }}>
          {home.heroEyebrow ?? "Real estate · Chicagoland"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: -3 }}>
            {home.heroLine1}
          </div>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: -3 }}>
            {home.heroLine2}
          </div>
          {home.heroAccent ? (
            <div
              style={{
                position: "absolute",
                right: 40,
                bottom: -30,
                display: "flex",
                fontSize: 110,
                fontStyle: "italic",
                color: palette.surfaceRaised,
              }}
            >
              {home.heroAccent}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: palette.accent }}>
          <span>{agent.brokerage?.name ?? ""}</span>
          <span>{agent.phone?.display ?? ""}</span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
      fonts: [
        { name: "Bodoni", data: regular, style: "normal", weight: 400 },
        { name: "Bodoni", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
