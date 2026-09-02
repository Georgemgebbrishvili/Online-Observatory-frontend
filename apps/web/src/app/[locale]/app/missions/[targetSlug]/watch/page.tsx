import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SharedMission } from "@/components/missions/shared-mission";
import { getSharedMissionView } from "@/features/shared-observations/data";
import { isLocale } from "@/i18n/config";
import { sharedObservationCopy } from "@/i18n/resources/shared-observation";
import { requireSession } from "@/lib/platform/session";
import "@/styles/shared-mission.css";

type SharedMissionPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export async function generateMetadata({
  params,
}: SharedMissionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${sharedObservationCopy[locale].metadataTitle} · Darkview`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedMissionPage({ params }: SharedMissionPageProps) {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) notFound();

  const session = await requireSession(locale);
  const mission = await getSharedMissionView(missionId);
  if (!mission) notFound();

  return (
    <SharedMission csrfToken={session.csrfToken} locale={locale} mission={mission} />
  );
}
