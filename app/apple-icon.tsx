import { ImageResponse } from "next/og";

import { activeTheme } from "@/lib/theme/active";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the same arch mark, larger. */
export default function AppleIcon() {
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
            width: 92,
            height: 120,
            borderTopLeftRadius: 46,
            borderTopRightRadius: 46,
            border: `6px solid ${palette.inkInverse}`,
            borderBottom: "none",
            marginBottom: 24,
          }}
        />
      </div>
    ),
    size,
  );
}
