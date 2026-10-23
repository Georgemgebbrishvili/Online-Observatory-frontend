import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GiftForm } from "@/components/gift/gift-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { longDate } from "@/features/cards/dates";
import { readGifts } from "@/features/gift/read";
import { readPricing } from "@/features/pricing/read";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { giftCopy } from "@/i18n/resources/gift";
import { getCurrentUser } from "@/lib/platform/session";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/pages.css";
import "@/styles/gift.css";

// The price and the buyer's gifts are read when the page is opened.
export const dynamic = "force-dynamic";

type GiftPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: GiftPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = giftCopy[locale];
  return localizedMetadata({
    locale,
    path: "gift",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/**
 * Clients ADR-067: buy a night for someone else. The price and length are the next open
 * slot's, as the pricing page reads them; the platform prices the gift itself.
 */
export default async function GiftPage({ params }: GiftPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = giftCopy[locale];
  const [dictionary, user, pricing] = await Promise.all([
    getDictionary(locale),
    getCurrentUser(),
    readPricing(locale),
  ]);
  const gifts = user ? await readGifts() : null;
  const slot = pricing.slot;

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main className="public-page gift-page" id="main-content">
        <Container>
          {/* No title block (ADR-056): the heading is for the outline and assistive tech. */}
          <h1 className="visually-hidden">{copy.title}</h1>
          <div className="gift-grid">
            <section className="gift-intro" aria-labelledby="gift-intro-title">
              <h2 id="gift-intro-title">{copy.title}</h2>
              <p className="gift-lede">{copy.lede}</p>
              <ul className="gift-facts">
                {slot && <li>{copy.facts.length(slot.durationMinutes)}</li>}
                <li>{copy.facts.valid}</li>
                <li>{copy.facts.noCash}</li>
              </ul>
              <p className="gift-price" data-gift-price="">
                <span className="board-label">{copy.price}</span>
                <strong>{slot ? slot.price : "—"}</strong>
              </p>
              {!slot && <p className="gift-note">{copy.priceUnknown}</p>}
            </section>
            <section className="gift-buy" aria-label={copy.form.legend}>
              {!user ? (
                <>
                  <p className="gift-note">{copy.signInNote}</p>
                  <ButtonLink href={`/${locale}/sign-in`}>{copy.signIn}</ButtonLink>
                </>
              ) : slot ? (
                <GiftForm durationMinutes={slot.durationMinutes} locale={locale} />
              ) : null}
            </section>
          </div>
          {gifts && (
            <section className="gift-mine" aria-labelledby="gift-mine-title">
              <h2 id="gift-mine-title">{copy.mine}</h2>
              {gifts.kind !== "ok" ? (
                <p className="gift-note">{copy.unreachable}</p>
              ) : gifts.items.length === 0 ? (
                <p className="gift-note">{copy.none}</p>
              ) : (
                <ul className="gift-list">
                  {gifts.items.map((gift) => (
                    <li key={gift.id} data-gift-row={gift.status}>
                      <span>
                        {gift.recipientName ??
                          (gift.codeLast4 ? `…${gift.codeLast4}` : "—")}
                      </span>
                      <span className="gift-status">{copy.status[gift.status]}</span>
                      <span className="data">
                        {longDate(new Date(gift.createdAt), locale, "Asia/Tbilisi")}
                      </span>
                      <Link className="page-link" href={`/${locale}/gift/${gift.id}`}>
                        {copy.open}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </Container>
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} path="gift" />
    </div>
  );
}
