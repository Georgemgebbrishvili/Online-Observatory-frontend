import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LiveNext } from "@/components/live/live-next";
import { readMyMissions, readObservatoryPanel, readUpcoming } from "@/features/home/read";
import { activeMission } from "@/features/missions/active";
import { isLocale } from "@/i18n/config";
import { liveCopy } from "@/i18n/resources/live";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";
import "@/styles/pages.css";
import "@/styles/authenticated-home.css";

type LivePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: liveCopy[locale].metadataTitle } : {};
}

/**
 * ADR-037: one room, built once. "Live" is the caller's live or imminent mission's
 * session. With none, ADR-051: the next night and the observatory, and the way to book.
 */
export default async function LivePage({ params }: LivePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);
  const mission = await readActiveMission();

  if (mission) {
    redirect(`/${locale}/app/missions/${encodeURIComponent(mission.id)}/session`);
  }

  // ADR-051 §2: with nothing live, the next night and the observatory's state.
  const [panel, upcoming] = await Promise.all([
    readObservatoryPanel(),
    readUpcoming(undefined, 1),
  ]);
  if (upcoming.kind === "signed-out") redirect(`/${locale}/sign-in`);
  return <LiveNext locale={locale} panel={panel} upcoming={upcoming} />;
}

/** The caller's live or imminent mission, if any, as of now. Outside the render: the clock is not pure. */
async function readActiveMission() {
  const mine = await readMyMissions();
  return mine.kind === "ok" ? activeMission(mine.missions, Date.now()) : null;
}
