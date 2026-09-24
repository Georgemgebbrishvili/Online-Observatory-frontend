import { zListBookableObservatoriesResponse } from "@darkview/contracts/zod";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { OperatorConsoleProvider } from "@/components/operator/console-provider";
import { EmergencyPark } from "@/components/operator/emergency-park";
import { ModeBanner } from "@/components/operator/mode-banner";
import { OperatorNavigation } from "@/components/operator/operator-navigation";
import { StatePanel } from "@/components/ui/state-panel";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { operatorCopy } from "@/i18n/resources/operator";
import { platformRequest } from "@/lib/platform/client";
import { requireOperator } from "@/lib/platform/session";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/operator.css";

export const metadata: Metadata = privatePageMetadata;

type OperatorLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function OperatorLayout({ children, params }: OperatorLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireOperator(locale);
  const copy = operatorCopy[locale];
  const dictionary = await getDictionary(locale);
  const { items } = zListBookableObservatoriesResponse.parse(
    await platformRequest<unknown>("/observatories"),
  );
  // Phase 1 is one first-party telescope (ADR-003); a partner node is not operated here.
  const observatory = items.find((candidate) => candidate.kind === "FIRST_PARTY");

  if (!observatory) {
    return (
      <main id="main-content" className="operator-shell">
        <StatePanel variant="error" title={copy.title} description={copy.noObservatory} />
      </main>
    );
  }

  return (
    <OperatorConsoleProvider locale={locale} observatoryId={observatory.id}>
      <div className="operator-shell">
        <header className="operator-header">
          <div className="operator-heading">
            <a href={`/${locale}`}>
              <BrandLockup
                ariaLabel={dictionary.navigation.app.brandAriaLabel}
                compact
                endorsement={dictionary.navigation.app.brandEndorsement}
              />
            </a>
            <div>
              <p>
                {copy.observatory} ·{" "}
                {locale === "ka" ? observatory.nameKa : observatory.nameEn}
              </p>
              <h1>{copy.title}</h1>
            </div>
            <OperatorNavigation copy={copy.navigation} locale={locale} />
          </div>
          <ModeBanner copy={copy.mode} />
          <EmergencyPark copy={copy.park} />
        </header>
        <main id="main-content" className="operator-main">
          {children}
        </main>
      </div>
    </OperatorConsoleProvider>
  );
}
