import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { brand } from "@/brand";
import { formatCapturedAt } from "@/features/collection/present";
import { readGalleryCapture } from "@/features/collection/read-gallery";
import { isLocale } from "@/i18n/config";
import { palette } from "@/styles/tokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `A capture shared from the ${brand.en.name} observatory`;

async function asDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "image/jpeg";
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * ADR-065 §5: the card a shared link unfurls into. The picture, with the target and the
 * date over it, and the name of the place it was seen from. Never the owner.
 */
export default async function GalleryImage({
  params,
}: {
  params: Promise<{ locale: string; captureId: string }>;
}) {
  const { locale, captureId } = await params;
  const language = isLocale(locale) ? locale : "en";
  const [geist, firago, result] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/og/geist-600.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/og/firago-600.ttf")),
    readGalleryCapture(captureId),
  ]);
  const fonts = [
    { name: "Geist", data: geist, weight: 600 as const },
    { name: "FiraGO", data: firago, weight: 600 as const },
  ];
  const site = language === "ka" ? brand.ka.nominative : brand.en.name;

  if (result.kind !== "ok") {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: palette.ember,
          color: palette.ink,
          fontFamily: "Geist",
          fontSize: 72,
        }}
      >
        {site}
      </div>,
      { ...size, fonts },
    );
  }

  const { capture } = result;
  const target = language === "ka" ? capture.target.nameKa : capture.target.nameEn;
  const date = formatCapturedAt(capture.capturedAt, capture.place.timezone, language);
  const image = await asDataUrl(capture.imageUrl);
  const face = language === "ka" ? "FiraGO" : "Geist";

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: palette.bar,
        fontFamily: face,
      }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          background: `linear-gradient(to top, ${palette.bar}eb, ${palette.bar}00)`,
          color: palette.ink,
        }}
      >
        <div style={{ fontSize: 76, lineHeight: 1.05 }}>{target}</div>
        <div style={{ marginTop: 14, fontSize: 32, color: palette.ink2 }}>
          {`${date} · ${site}`}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
