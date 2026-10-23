import type { GiftVoucher } from "@darkview/contracts";

import { longDate } from "@/features/cards/dates";
import type { Locale } from "@/i18n/config";
import { giftCopy } from "@/i18n/resources/gift";

/**
 * Clients ADR-067: the printable card. Only an ACTIVE gift has a code; the page shows a
 * card for nothing else. Printing hides everything on the page but this (gift.css).
 */
export function GiftCard({
  gift,
  label,
  locale,
}: {
  gift: GiftVoucher & { code: string };
  /** Only where several are on one page, as on /design-system. */
  label?: string;
  locale: Locale;
}) {
  const copy = giftCopy[locale].card;
  return (
    <article className="gift-card" aria-label={label ?? copy.heading} data-gift-card="">
      <p className="kicker">{copy.kicker}</p>
      <h2 className="gift-card-heading">{copy.heading}</h2>
      {gift.recipientName && (
        <p className="gift-card-for">{copy.for(gift.recipientName)}</p>
      )}
      {gift.message && <blockquote className="gift-card-note">{gift.message}</blockquote>}
      <p className="gift-card-length">{copy.length(gift.durationMinutes)}</p>
      <div className="gift-card-code">
        <span className="board-label">{copy.code}</span>
        <strong className="data" data-gift-code="">
          {gift.code}
        </strong>
      </div>
      {gift.expiresAt && (
        <p className="gift-card-until">
          {copy.until(longDate(new Date(gift.expiresAt), locale, "Asia/Tbilisi"))}
        </p>
      )}
      <p className="gift-card-redeem">{copy.redeem}</p>
    </article>
  );
}
