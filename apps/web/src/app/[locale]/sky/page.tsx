import { zListTargetsResponse } from "@darkview/contracts/zod";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { NightSky, type Bookable } from "@/components/sky3d/night-sky";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { nightSkyCopy } from "@/i18n/resources/night-sky";
import { platformRequest } from "@/lib/platform/client";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/night-sky.css";

// The sky is drawn for the moment the page opens; a cached render is a stale sky.
export const dynamic = "force-dynamic";

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

/** What the observatory offers, for the panel's booking link; none when unreadable. */
async function readBookable(): Promise<Bookable[]> {
  try {
    const { items } = zListTargetsResponse.parse(await platformRequest<unknown>("/targets?limit=100"));
    return items
      .filter((target) => target.enabled)
      .map((target) => ({
        slug: target.slug,
        body: target.solarSystemBody ?? null,
        raHours: target.coordinates?.raHours ?? null,
        decDeg: target.coordinates?.decDegrees ?? null,
      }));
  } catch {
    return [];
  }
}

/** The instant the page is opened: the sky the first frame draws. */
function openedNow() {
  return Date.now();
}

/** ADR-085: the Night Sky, computed for the observatory or the visitor, live. */
export default async function SkyPage({ params }: SkyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, bookable] = await Promise.all([getDictionary(locale), readBookable()]);

  return (
    <div className="site-frame sky-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="sky-page" id="main-content">
        <h1 className="visually-hidden">{nightSkyCopy[locale].title}</h1>
        <NightSky locale={locale} bookable={bookable} openedAt={openedNow()} />
      </main>
    </div>
  );
}
