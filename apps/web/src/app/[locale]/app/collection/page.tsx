import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CollectionGallery } from "@/components/collection/collection-gallery";
import { ObserverLog, type LogRow } from "@/components/collection/observer-log";
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
  const log = cursor === null && result.kind === "ok" ? await readLog(locale) : null;
  return (
    <CollectionGallery
      locale={locale}
      nights={nights}
      paged={cursor !== null}
      log={log}
      result={result}
    />
  );
}

/**
 * ADR-070: each kind the catalogue offers, and how many of its targets the customer has a
 * capture of, from their missions' captures. Null when either read fails.
 */
async function readLog(locale: "en" | "ka") {
  const [mine, catalogue] = await Promise.all([readMyMissions(), readCatalogue()]);
  if (mine.kind !== "ok" || !catalogue) return null;
  const captured = mine.missions.filter((mission) => (mission.captureIds?.length ?? 0) > 0);
  const seen = new Set(captured.map((mission) => mission.targetId));
  const offered = [...catalogue.values()].filter((target) => target.enabled);
  const rows: LogRow[] = [];
  for (const target of offered) {
    let row = rows.find((candidate) => candidate.type === target.type);
    if (!row) rows.push((row = { type: target.type, seen: 0, of: 0 }));
    row.of += 1;
    if (seen.has(target.id)) row.seen += 1;
  }
  if (rows.length === 0) return null;
  rows.sort((a, b) => KINDS.indexOf(a.type) - KINDS.indexOf(b.type));
  return (
    <ObserverLog
      locale={locale}
      rows={rows}
      simulated={captured.some((mission) => mission.mode === "SIMULATED")}
    />
  );
}

const KINDS = [
  "MOON",
  "PLANET",
  "DOUBLE_STAR",
  "GLOBULAR_CLUSTER",
  "PLANETARY_NEBULA",
  "BRIGHT_NEBULA",
] as const satisfies readonly LogRow["type"][];

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
