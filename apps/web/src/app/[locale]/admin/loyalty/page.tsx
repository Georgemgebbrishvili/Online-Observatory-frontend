import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LoyaltyAdjustment } from "@/components/operator/loyalty-adjustment";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";

type OperatorLoyaltyPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: OperatorLoyaltyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.loyalty} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

/** ADR-084 §5: the operator's points adjustment. */
export default async function OperatorLoyaltyPage({ params }: OperatorLoyaltyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LoyaltyAdjustment copy={operatorCopy[locale].loyalty} />;
}
