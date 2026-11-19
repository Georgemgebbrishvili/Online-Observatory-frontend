import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpenTelescope } from "@/components/operator/open-telescope";
import { readOperatedObservatories } from "@/features/operator/observatories";
import { isLocale } from "@/i18n/config";
import { operatorCopy } from "@/i18n/resources/operator";

type OpenTelescopePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: OpenTelescopePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: `${operatorCopy[locale].navigation.telescope} · ${operatorCopy[locale].metadataTitle}`,
      }
    : {};
}

/**
 * Platform ADR-082: opening this page opens the operator's own free session and goes
 * into its room, where opening inside the slot starts it (ADR-079 §1). The observatory
 * chosen in the console is tried first, then the others.
 */
export default async function OpenTelescopePage({ params }: OpenTelescopePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { operated, observatory } = await readOperatedObservatories();
  const ordered = observatory
    ? [observatory, ...operated.filter((candidate) => candidate.id !== observatory.id)]
    : operated;

  return (
    <OpenTelescope
      copy={operatorCopy[locale].openTelescope}
      locale={locale}
      observatoryIds={ordered.map((candidate) => candidate.id)}
    />
  );
}
