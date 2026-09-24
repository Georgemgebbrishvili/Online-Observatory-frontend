import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusPage } from "@/components/status/status-page";
import { StatePanel } from "@/components/ui/state-panel";
import { readStatus } from "@/features/status/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { statusCopy } from "@/i18n/resources/status";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/status.css";

// A status page must never be served from cache: a cached reading is a stale one
// presented as live.
export const dynamic = "force-dynamic";

type StatusRouteProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: StatusRouteProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const copy = statusCopy[locale];
  return localizedMetadata({
    locale,
    path: "status",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function StatusRoute({ params }: StatusRouteProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const copy = statusCopy[locale];
  const result = await readStatus(locale);
  const failure = result.kind === "unreachable" ? copy.unavailable : copy.noObservatory;

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      {result.kind === "ok" ? (
        <StatusPage
          conditions={result.reading.conditions}
          copy={copy}
          locale={locale}
          now={result.reading.readAt}
          observatoryName={result.reading.observatoryName}
          status={result.reading.status}
          timezone={result.reading.timezone}
        />
      ) : (
        <main className="status-page status-page-unavailable" id="main-content">
          <StatePanel
            variant="error"
            headingLevel={1}
            title={failure.title}
            description={failure.detail}
          />
        </main>
      )}
      <SiteFooter footer={dictionary.footer} locale={locale} path="status" />
    </div>
  );
}
