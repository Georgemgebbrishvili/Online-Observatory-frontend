import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MissionTable } from "@/components/operator/mission-table";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";

type OperatorMissionsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: OperatorMissionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.missions} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

export default async function OperatorMissionsPage({
  params,
}: OperatorMissionsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <MissionTable copy={operatorCopy[locale]} locale={locale} />;
}
