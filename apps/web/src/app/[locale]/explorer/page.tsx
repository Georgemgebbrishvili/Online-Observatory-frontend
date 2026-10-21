import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExplorerLaunch } from "@/components/explorer/explorer-launch";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { explorerCopy } from "@/i18n/resources/explorer";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/explorer.css";

type ExplorerRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ExplorerRouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = explorerCopy[locale];
  return localizedMetadata({
    locale,
    path: "explorer",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/** The game in the header (ADR-057): the launch screen for the game, which plays on its own site. */
export default async function ExplorerRoute({ params }: ExplorerRouteProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = await getDictionary(locale);
  return (
    <div className="site-frame explorer-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <ExplorerLaunch locale={locale} />
      <SiteFooter footer={dictionary.footer} locale={locale} path="explorer" />
    </div>
  );
}
