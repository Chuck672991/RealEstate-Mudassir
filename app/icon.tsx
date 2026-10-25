import { ImageResponse } from "next/og";

import { activeTheme } from "@/lib/theme/active";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the arch mark (the site's signature shape) in the theme's colours. */
export default function Icon() {
  const { palette } = activeTheme;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          background: palette.surfaceInverse,
        }}
      >
        <div
          style={{
            width: 34,
            height: 44,
            borderTopLeftRadius: 17,
            borderTopRightRadius: 17,
            border: `3px solid ${palette.inkInverse}`,
            borderBottom: "none",
            marginBottom: 8,
          }}
        />
      </div>
    ),
    size,
  );
}
