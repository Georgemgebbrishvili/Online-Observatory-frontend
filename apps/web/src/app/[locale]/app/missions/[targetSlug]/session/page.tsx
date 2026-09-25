import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionSessionView } from "@/components/missions/mission-session";
import {
  developmentMissions,
  getDevelopmentMission,
} from "@/features/missions/simulator";
import { getMissionTarget } from "@/features/missions/targets";
import { isLocale, locales } from "@/i18n/config";
import { missionSessionCopy } from "@/i18n/resources/missions";
import { requireUser } from "@/lib/platform/session";
import "@/styles/mission-session.css";
import { brand } from "@/brand";

type MissionSessionPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    developmentMissions.map((mission) => ({
      locale,
      targetSlug: mission.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: MissionSessionPageProps): Promise<Metadata> {
  const { locale, targetSlug: missionId } = await params;
  const definition = getDevelopmentMission(missionId);
  const target = definition ? getMissionTarget(definition.targetSlug) : undefined;

  if (!isLocale(locale) || !target) return {};

  const name = locale === "ka" ? target.georgianName : target.commonName;
  return {
    title: `${name} · ${missionSessionCopy[locale].metadataMission} ${missionId} · ${brand.en.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function MissionSessionPage({ params }: MissionSessionPageProps) {
  const { locale, targetSlug: missionId } = await params;

  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const definition = getDevelopmentMission(missionId);
  const target = definition ? getMissionTarget(definition.targetSlug) : undefined;

  if (!definition || !target) notFound();

  return <MissionSessionView definition={definition} locale={locale} target={target} />;
}
