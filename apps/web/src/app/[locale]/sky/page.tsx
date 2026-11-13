import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";

import { SiteHeader } from "@/components/layout/site-header";
import { NightSky } from "@/components/sky3d/night-sky";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { nightSkyCopy } from "@/i18n/resources/night-sky";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/night-sky.css";

type SkyPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: SkyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = nightSkyCopy[locale];
  return localizedMetadata({
    locale,
    path: "sky",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/** The instant the page is rendered: what the browser falls back on if its clock is behind. */
function openedNow() {
  return Date.now();
}

/**
 * ADR-085: the Night Sky, computed for the observatory or the visitor, live. Rendering it
 * asks the platform for nothing, so a cold API never holds the page: the browser fetches
 * what can be booked once the sky is up.
 */
export default async function SkyPage({ params }: SkyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  // The catalogue and the figures start loading with the page, not after its script runs.
  preload("/sky/data/stars.bin", { as: "fetch", crossOrigin: "anonymous" });
  preload("/sky/data/constellations.json", { as: "fetch", crossOrigin: "anonymous" });

  return (
    <div className="site-frame sky-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="sky-page" id="main-content">
        <h1 className="visually-hidden">{nightSkyCopy[locale].title}</h1>
        <NightSky locale={locale} openedAt={openedNow()} />
      </main>
    </div>
  );
}
