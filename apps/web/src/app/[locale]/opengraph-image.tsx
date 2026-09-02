import { ImageResponse } from "next/og";

export const alt = "Darkview by Astroman — real remote observatory access";
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
        background: "#05070a",
        color: "#f3f6f8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <div style={{ color: "#8d99a8", fontSize: 24, letterSpacing: 7 }}>
          DARKVIEW · BY ASTROMAN
        </div>
        <div style={{ display: "flex", maxWidth: 680, fontSize: 72, lineHeight: 1.04 }}>
          Explore the real universe.
        </div>
        <div style={{ color: "#8d99a8", fontSize: 26 }}>
          Real telescope access · Tbilisi, Georgia
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
          border: "2px solid rgba(141,153,168,.38)",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 190,
            height: 190,
            border: "2px solid rgba(141,153,168,.25)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            width: 42,
            height: 42,
            border: "3px solid #18c8ff",
            borderRadius: "50%",
            boxShadow: "0 0 32px rgba(24,200,255,.35)",
          }}
        />
      </div>
    </div>,
    size,
  );
}
