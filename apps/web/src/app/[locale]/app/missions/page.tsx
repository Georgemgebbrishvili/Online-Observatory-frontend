import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionBrowser } from "@/components/missions/mission-browser";
import { isLocale } from "@/i18n/config";
import { missionBrowserCopy } from "@/i18n/resources/missions";
import { requireSession } from "@/lib/platform/session";
import "@/styles/missions.css";

type MissionsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MissionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = missionBrowserCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function MissionsPage({ params }: MissionsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  await requireSession(locale);

  return <MissionBrowser locale={locale} />;
}
