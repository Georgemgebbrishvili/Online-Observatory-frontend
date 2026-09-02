import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PricingPage } from "@/components/pricing/pricing-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pricingPageCopy } from "@/i18n/resources/pricing";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/pricing.css";

type PricingRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PricingRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = pricingPageCopy[locale];
  return localizedMetadata({
    locale,
    path: "pricing",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function PricingRoute({ params }: PricingRouteProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <PricingPage locale={locale} />
      <SiteFooter footer={dictionary.footer} locale={locale} path="pricing" />
    </div>
  );
}
