import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LiveObservationView } from "@/components/live/live-observation";
import { currentLiveObservation } from "@/features/live/live-data";
import { isLocale } from "@/i18n/config";
import { liveObservationCopy } from "@/i18n/resources/live";
import { requireSession } from "@/lib/platform/session";
import "@/styles/live.css";

type LivePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: liveObservationCopy[locale].metadataTitle,
    robots: { index: false, follow: false },
  };
}

export default async function LivePage({ params }: LivePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const session = await requireSession(locale);

  const safeNudgeEnabled = process.env.NEXT_PUBLIC_ENABLE_SAFE_NUDGE === "true";

  return (
    <LiveObservationView
      locale={locale}
      observation={currentLiveObservation}
      safeNudgeEnabled={safeNudgeEnabled}
      canControl={
        session.user.id === currentLiveObservation.missionOwnerId ||
        session.user.role === "OPERATOR" ||
        session.user.role === "ADMIN"
      }
      sharedMissionUrl={`/${locale}/app/missions/${currentLiveObservation.missionId}/watch`}
    />
  );
}
