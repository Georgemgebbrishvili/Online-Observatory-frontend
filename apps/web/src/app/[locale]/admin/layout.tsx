import { zAdminListObservatoriesResponse } from "@darkview/contracts/zod";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { OperatorConsoleProvider } from "@/components/operator/console-provider";
import { EmergencyPark } from "@/components/operator/emergency-park";
import { ModeBanner } from "@/components/operator/mode-banner";
import {
  ObservatoryPicker,
  operatorObservatoryCookie,
} from "@/components/operator/observatory-picker";
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
  const { items } = zAdminListObservatoriesResponse.parse(
    await platformRequest<unknown>("/admin/observatories"),
  );
  // First-party observatories only (ADR-003): the demo, and the hardware test one
  // no customer can book (platform ADR-074). The operator's choice is a cookie,
  // honoured only when it names one of them.
  const operated = items.filter(
    (candidate) => candidate.kind === "FIRST_PARTY" || candidate.hardwareTest,
  );
  const chosen = (await cookies()).get(operatorObservatoryCookie)?.value;
  const observatory = operated.find((candidate) => candidate.id === chosen) ?? operated[0];

  if (!observatory) {
    return (
      <main id="main-content" className="operator-shell">
        <StatePanel
          variant="error"
          headingLevel={1}
          title={copy.title}
          description={copy.noObservatory}
        />
      </main>
    );
  }

  return (
    <OperatorConsoleProvider locale={locale} observatoryId={observatory.id}>
      <div className="operator-shell">
        <header className="operator-header">
          <div className="operator-heading">
            <a href={`/${locale}`}>
              <BrandLockup ariaLabel={dictionary.navigation.brandAriaLabel} />
            </a>
            <div>
              <p>
                {copy.observatory} ·{" "}
                {locale === "ka" ? observatory.nameKa : observatory.nameEn}
              </p>
              <h1>{copy.title}</h1>
            </div>
            <OperatorNavigation copy={copy.navigation} locale={locale} />
            {operated.length > 1 && (
              <ObservatoryPicker
                label={copy.observatory}
                hardwareTest={copy.hardwareTest}
                selected={observatory.id}
                options={operated.map((candidate) => ({
                  id: candidate.id,
                  name: locale === "ka" ? candidate.nameKa : candidate.nameEn,
                  hardwareTest: candidate.hardwareTest,
                }))}
              />
            )}
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
