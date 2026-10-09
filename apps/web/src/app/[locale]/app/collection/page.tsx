import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CollectionGallery } from "@/components/collection/collection-gallery";
import { cursorOf, readCatalogue, readCollection } from "@/features/collection/read";
import { readMyMissions } from "@/features/home/read";
import { targetName } from "@/features/targets/present";
import { isLocale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { requireUser } from "@/lib/platform/session";
import "@/styles/pages.css";
import "@/styles/collection.css";

type CollectionPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = collectionGalleryCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const cursor = cursorOf((await searchParams).cursor);
  const result = await readCollection(cursor);
  // The session ended between the check above and the read.
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);

  // ADR-051 §3: the past nights, on the first page. Unreadable missions leave the
  // section out rather than empty, which would say there were none.
  const nights =
    cursor === null && result.kind === "ok"
      ? await readPastNights(locale, result.timezone)
      : null;
  return (
    <CollectionGallery
      locale={locale}
      nights={nights}
      paged={cursor !== null}
      result={result}
    />
  );
}

const ENDED = new Set([
  "COMPLETE",
  "FAILED",
  "CANCELLED",
  "NOT_VISIBLE",
  "HARDWARE_ERROR",
]);

async function readPastNights(locale: "en" | "ka", timezone: string) {
  const mine = await readMyMissions();
  if (mine.kind !== "ok") return null;
  const catalogue = await readCatalogue();
  return mine.missions
    .filter((mission) => ENDED.has(mission.state))
    .sort(
      (left, right) =>
        Date.parse(right.endedAt ?? right.startedAt ?? right.requestedAt) -
        Date.parse(left.endedAt ?? left.startedAt ?? left.requestedAt),
    )
    .slice(0, 8)
    .map((mission) => {
      const target = catalogue?.get(mission.targetId) ?? null;
      return { mission, target: target ? targetName(target, locale) : null, timezone };
    });
}
