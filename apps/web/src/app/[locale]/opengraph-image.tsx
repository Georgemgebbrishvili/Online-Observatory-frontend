import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { brand } from "@/brand";
import { cometMarkPath } from "@/components/brand/brand-mark";
import { palette } from "@/styles/tokens";

export const alt = `${brand.en.siteName} — Live Remote Observatory · Tbilisi`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ADR-052: the Skychaser social card — ember ground, the name in amber Geist, the line in
// white — with the comet mark over a red glow where Skychaser shows its Saturn plate.
export default async function OpenGraphImage() {
  const geist = await readFile(join(process.cwd(), "src/app/fonts/og/geist-600.ttf"));

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: palette.ember,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 700,
          display: "flex",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.red}66, ${palette.ember}00 62%)`,
        }}
      />
      <svg
        viewBox="0.1439 0.3757 21.485 21.485"
        width={300}
        height={300}
        style={{ position: "absolute", left: 850, top: 165 }}
      >
        <defs>
          <linearGradient
            id="core"
            gradientUnits="userSpaceOnUse"
            x1="14.008"
            y1="3.555"
            x2="14.008"
            y2="12.437"
          >
            <stop offset="0" stopColor={palette.markCoreHi} />
            <stop offset="1" stopColor={palette.markCore} />
          </linearGradient>
        </defs>
        <circle cx="14.0083" cy="7.996" r="4.4812" fill="url(#core)" />
        <path
          transform="rotate(180 11 11)"
          fill={palette.mark}
          fillRule="evenodd"
          d={cometMarkPath}
        />
      </svg>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 30,
          width: 780,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 14,
            color: palette.amber,
          }}
        >
          {brand.en.name.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 66,
            fontWeight: 600,
            letterSpacing: -2.5,
            lineHeight: 1.06,
            color: palette.white,
          }}
        >
          {brand.en.tagline}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 3,
            color: `${palette.blush}b3`,
          }}
        >
          LIVE REMOTE OBSERVATORY · TBILISI
        </div>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Geist", data: geist, weight: 600, style: "normal" }] },
  );
}
