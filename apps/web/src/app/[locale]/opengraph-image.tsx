import { ImageResponse } from "next/og";

import { palette } from "@/styles/tokens";

export const alt = "Darkview by Astroman — Live Remote Observatory · Tbilisi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "84px 96px",
        background: palette.neutral950,
        color: palette.neutral100,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div style={{ color: palette.neutral300, fontSize: 28 }}>
          Darkview by Astroman
        </div>
        <div style={{ display: "flex", maxWidth: 680, fontSize: 72, lineHeight: 1.04 }}>
          The real sky, live.
        </div>
        <div style={{ color: palette.neutral300, fontSize: 26 }}>
          Live Remote Observatory · Tbilisi, Georgia
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          width: 330,
          height: 330,
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${palette.neutral500}`,
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 190,
            height: 190,
            border: `2px solid ${palette.neutral600}`,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: 42,
            height: 42,
            border: `3px solid ${palette.photon}`,
            borderRadius: "50%",
          }}
        />
      </div>
    </div>,
    size,
  );
}
