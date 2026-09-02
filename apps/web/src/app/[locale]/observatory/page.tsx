import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ObservatoryPage } from "@/components/observatory/observatory-page";
import { JsonLd } from "@/components/seo/json-ld";
import { observatories } from "@/features/observatory/observatories";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { localizedMetadata, siteUrl } from "@/lib/seo";
import "@/styles/observatory.css";

type ObservatoryRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ObservatoryRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = observatoryPageCopy[locale];
  return localizedMetadata({
    locale,
    path: "observatory",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function ObservatoryRoute({ params }: ObservatoryRouteProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const copy = observatoryPageCopy[locale];
  const observatory = observatories[0];

  return (
    <div className="site-frame">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Place",
          name: observatory.name[locale],
          description: copy.metadataDescription,
          url: new URL(`/${locale}/observatory`, siteUrl).toString(),
          address: {
            "@type": "PostalAddress",
            addressLocality: locale === "ka" ? "თბილისი" : "Tbilisi",
            addressCountry: "GE",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: observatory.coordinates.latitude,
            longitude: observatory.coordinates.longitude,
          },
        }}
      />
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <ObservatoryPage locale={locale} />
      <SiteFooter footer={dictionary.footer} locale={locale} path="observatory" />
    </div>
  );
}
