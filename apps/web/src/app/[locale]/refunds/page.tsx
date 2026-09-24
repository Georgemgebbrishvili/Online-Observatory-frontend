import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LegalDocumentPage } from "@/components/legal/legal-document";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { legalCopy, legalPaths } from "@/i18n/resources/legal";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/legal.css";

type LegalRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LegalRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const document = legalCopy[locale].documents.refunds;
  return localizedMetadata({
    locale,
    path: legalPaths.refunds,
    title: document.metadataTitle,
    description: document.metadataDescription,
  });
}

export default async function RefundsRoute({ params }: LegalRouteProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const copy = legalCopy[locale];

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <LegalDocumentPage copy={copy} document={copy.documents.refunds} locale={locale} />
      <SiteFooter footer={dictionary.footer} locale={locale} path={legalPaths.refunds} />
    </div>
  );
}
