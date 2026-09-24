import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TelemetryOverview } from "@/components/operator/telemetry-overview";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";

type OperatorPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: OperatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: operatorCopy[locale].metadataTitle } : {};
}

export default async function OperatorOverviewPage({ params }: OperatorPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <TelemetryOverview copy={operatorCopy[locale]} />;
}
