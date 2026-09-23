import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuditLog } from "@/components/operator/audit-log";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";

type OperatorLogsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: OperatorLogsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.logs} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

export default async function OperatorLogsPage({
  params,
  searchParams,
}: OperatorLogsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { mission } = await searchParams;
  return (
    <AuditLog
      copy={operatorCopy[locale]}
      initialMission={typeof mission === "string" ? mission : null}
      locale={locale}
    />
  );
}
