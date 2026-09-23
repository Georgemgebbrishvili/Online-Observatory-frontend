import { zListTargetsResponse } from "@darkview/contracts/zod";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TargetCatalogue } from "@/components/operator/target-catalogue";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";
import { platformRequest } from "@/lib/platform/client";

type OperatorTargetsPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: OperatorTargetsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.targets} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

export default async function OperatorTargetsPage({ params }: OperatorTargetsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // Phase 1's catalogue is a few dozen operator-approved targets: one page covers it.
  const { items } = zListTargetsResponse.parse(
    await platformRequest<unknown>("/targets?limit=100"),
  );

  return <TargetCatalogue copy={operatorCopy[locale]} locale={locale} targets={items} />;
}
