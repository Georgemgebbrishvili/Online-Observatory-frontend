import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { SharedMission } from "@/components/missions/shared-mission";
import { getSharedMissionView } from "@/features/shared-observations/data";
import { isLocale } from "@/i18n/config";
import { sharedObservationCopy } from "@/i18n/resources/shared-observation";
import { csrfCookieName } from "@/lib/platform/config";
import { requireUser } from "@/lib/platform/session";
import "@/styles/shared-mission.css";
import { brand } from "@/brand";

type SharedMissionPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export async function generateMetadata({
  params,
}: SharedMissionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: `${sharedObservationCopy[locale].metadataTitle} · ${brand.en.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedMissionPage({ params }: SharedMissionPageProps) {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);
  const mission = await getSharedMissionView(missionId);
  if (!mission) notFound();
  // ADR-016 §2: the CSRF cookie is the one the page may read.
  const csrfToken = (await cookies()).get(csrfCookieName)?.value ?? "";

  return <SharedMission csrfToken={csrfToken} locale={locale} mission={mission} />;
}
