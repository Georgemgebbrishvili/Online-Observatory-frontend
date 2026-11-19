import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TelemetryOverview } from "@/components/operator/telemetry-overview";
import { ButtonLink } from "@/components/ui/button";
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

  const copy = operatorCopy[locale];
  return (
    <>
      <section
        className="surface-panel operator-open-telescope"
        aria-labelledby="operator-open-telescope-title"
      >
        <h2 id="operator-open-telescope-title">{copy.openTelescope.title}</h2>
        <p>{copy.openTelescope.detail}</p>
        <ButtonLink href={`/${locale}/admin/telescope`}>
          {copy.openTelescope.enter}
        </ButtonLink>
      </section>
      <TelemetryOverview copy={copy} />
    </>
  );
}
