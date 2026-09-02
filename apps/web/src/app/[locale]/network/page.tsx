import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NetworkPage } from "@/components/network/network-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { networkPageCopy } from "@/i18n/resources/network";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/network.css";

type NetworkRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: NetworkRouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const copy = networkPageCopy[locale];
  return localizedMetadata({
    locale,
    path: "network",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function NetworkRoute({ params }: NetworkRouteProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <NetworkPage locale={locale} />
      <SiteFooter footer={dictionary.footer} locale={locale} path="network" />
    </div>
  );
}
