import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TonightLive } from "@/components/tonight/tonight-live";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { readTonight } from "@/features/tonight/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { tonightCopy } from "@/i18n/resources/tonight";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/pages.css";
import "@/styles/tonight.css";

// What is live is read when the page is opened; a cached answer is a stale one.
export const dynamic = "force-dynamic";

type TonightPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: TonightPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = tonightCopy[locale];
  return localizedMetadata({
    locale,
    path: "tonight",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function TonightPage({ params }: TonightPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = tonightCopy[locale];
  const result = await readTonight();

  let body;
  if (result.kind === "unreachable") {
    body = (
      <StatePanel
        variant="error"
        headingLevel={2}
        title={copy.error.title}
        description={copy.error.detail}
      />
    );
  } else if (result.tonight.live) {
    body = <TonightLive locale={locale} session={result.tonight.live} />;
  } else {
    const offline = result.status?.link === "OFFLINE";
    const hold = result.status?.weather.holdActive === true;
    const state = offline ? copy.offline : hold ? copy.hold : copy.none;
    body = (
      <div
        className="tonight-quiet"
        data-tonight={offline ? "offline" : hold ? "hold" : "none"}
      >
        <StatePanel
          variant="empty"
          headingLevel={2}
          title={state.title}
          description={state.detail}
        />
        <ButtonLink href={`/${locale}/app/book`}>{copy.book}</ButtonLink>
      </div>
    );
  }

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="public-page tonight-page" id="main-content">
        <Container>
          {/* No title block (ADR-056): the heading is for the outline and assistive tech. */}
          <h1 className="visually-hidden">{copy.title}</h1>
          {body}
        </Container>
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} path="tonight" />
    </div>
  );
}
