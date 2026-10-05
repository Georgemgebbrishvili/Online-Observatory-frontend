import { notFound, redirect } from "next/navigation";

import { readMyMissions } from "@/features/home/read";
import { activeMission } from "@/features/missions/active";
import { isLocale } from "@/i18n/config";
import { requireUser } from "@/lib/platform/session";

type LivePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * ADR-037: one room, built once. "Live" is the caller's live or imminent mission's
 * session; with none, it is booking one.
 */
export default async function LivePage({ params }: LivePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);
  const mine = await readMyMissions();
  const mission = mine.kind === "ok" ? activeMission(mine.missions, Date.now()) : null;

  redirect(
    mission
      ? `/${locale}/app/missions/${encodeURIComponent(mission.id)}/session`
      : `/${locale}/app/book`,
  );
}
