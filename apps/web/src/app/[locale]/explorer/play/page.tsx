import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { ExplorerGame } from "@/components/explorer/explorer-game";
import { isLocale } from "@/i18n/config";
import { explorerCopy } from "@/i18n/resources/explorer";
import { localizedMetadata } from "@/lib/seo";
import { palette } from "@/styles/tokens";
import "@/voyage/styles/solar-system.css";
import "@/voyage/styles/suit-jet.css";
import "@/voyage/styles/landing.css";
import "@/voyage/styles/voyage.css";

type ExplorerPlayRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ExplorerPlayRouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = explorerCopy[locale];
  return localizedMetadata({
    locale,
    path: "explorer/play",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/** Flown with two thumbs: a second finger on the deck is a second key, never a pinch. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: palette.canvas,
};

/** The game itself (ADR-089), full screen, on this site. */
export default async function ExplorerPlayRoute({ params }: ExplorerPlayRouteProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main id="main-content">
      <h1 className="visually-hidden">{explorerCopy[locale].metadataTitle}</h1>
      <ExplorerGame />
    </main>
  );
}
