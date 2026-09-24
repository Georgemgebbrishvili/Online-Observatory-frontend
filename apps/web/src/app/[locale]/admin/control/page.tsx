import { zListTargetsResponse } from "@darkview/contracts/zod";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ManualControl } from "@/components/operator/manual-control";
import { ModeSwitch } from "@/components/operator/mode-switch";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";
import { platformRequest } from "@/lib/platform/client";

type OperatorControlPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: OperatorControlPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.control} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

export default async function OperatorControlPage({ params }: OperatorControlPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = operatorCopy[locale];
  // Phase 1's catalogue is a few dozen operator-approved targets: one page covers it.
  const { items } = zListTargetsResponse.parse(
    await platformRequest<unknown>("/targets?limit=100"),
  );

  return (
    <div className="operator-control">
      <ModeSwitch copy={copy.switcher} />
      <ManualControl copy={copy.manual} locale={locale} targets={items} />
    </div>
  );
}
