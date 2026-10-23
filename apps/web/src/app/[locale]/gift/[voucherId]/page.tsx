import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { GiftCard } from "@/components/gift/gift-card";
import { PrintButton } from "@/components/gift/print-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { readGifts } from "@/features/gift/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { giftCopy } from "@/i18n/resources/gift";
import "@/styles/pages.css";
import "@/styles/gift.css";

export const dynamic = "force-dynamic";

type GiftDetailProps = { params: Promise<{ locale: string; voucherId: string }> };

export async function generateMetadata({ params }: GiftDetailProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // The buyer's own page: never indexed.
  return { title: giftCopy[locale].detail.metadataTitle, robots: { index: false } };
}

/**
 * Clients ADR-067: one gift, as its buyer sees it -- where the sandbox checkout returns
 * them. The code is shown, with Print, only while the gift can be spent.
 */
export default async function GiftDetailPage({ params }: GiftDetailProps) {
  const { locale, voucherId } = await params;
  if (!isLocale(locale)) notFound();

  const copy = giftCopy[locale];
  const [dictionary, gifts] = await Promise.all([getDictionary(locale), readGifts()]);
  if (gifts.kind === "signed-out") redirect(`/${locale}/sign-in`);

  const gift =
    gifts.kind === "ok" ? gifts.items.find((item) => item.id === voucherId) : null;
  const back = (
    <Link className="page-link" href={`/${locale}/gift`}>
      {copy.detail.back}
    </Link>
  );

  let body;
  if (gifts.kind === "unreachable") {
    body = (
      <StatePanel
        variant="error"
        headingLevel={2}
        title={copy.title}
        description={copy.unreachable}
        action={back}
      />
    );
  } else if (!gift) {
    body = (
      <StatePanel
        variant="empty"
        headingLevel={2}
        title={copy.title}
        description={copy.detail.notFound}
        action={back}
      />
    );
  } else if (gift.status === "ACTIVE" && gift.code) {
    body = (
      <div className="gift-detail" data-gift={gift.status}>
        <GiftCard gift={{ ...gift, code: gift.code }} locale={locale} />
        <div className="gift-detail-actions">
          <PrintButton label={copy.detail.print} />
          {back}
        </div>
        <p className="gift-note">{copy.detail.how}</p>
      </div>
    );
  } else {
    const said =
      gift.status === "REDEEMED"
        ? copy.detail.redeemed
        : gift.status === "EXPIRED"
          ? copy.detail.expired
          : gift.status === "CANCELLED"
            ? copy.detail.cancelled
            : copy.detail.pending;
    body = (
      <div data-gift={gift.status}>
        <StatePanel
          variant="empty"
          headingLevel={2}
          title={copy.status[gift.status]}
          description={said}
          action={back}
        />
      </div>
    );
  }

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="public-page gift-page" id="main-content">
        <Container>
          <h1 className="visually-hidden">{copy.detail.metadataTitle}</h1>
          {body}
        </Container>
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} path={`gift/${voucherId}`} />
    </div>
  );
}
