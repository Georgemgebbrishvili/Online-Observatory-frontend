import type { Locale } from "@/i18n/config";
import { giftCopy } from "@/i18n/resources/gift";

/** The eyepiece's ring on the stub: a tick every 10°, a longer one every 30°. */
function Ring() {
  return (
    <svg className="gift-ticket-ring" viewBox="-50 -50 100 100">
      <circle r="46" />
      <circle r="30" />
      <circle className="gift-ticket-ring-dot" r="2.6" />
      {Array.from({ length: 36 }, (_, index) => (
        <line
          key={index}
          y1="-46"
          y2={index % 3 === 0 ? -40 : -43}
          transform={`rotate(${index * 10})`}
        />
      ))}
    </svg>
  );
}

/**
 * ADR-102: the gift as the thing you hand over — a cream ticket with a torn stub. It
 * repeats what the page says beside it (the length and the price), so it is hidden from
 * assistive technology. The code is a row of dots: only a paid gift has one.
 */
export function GiftTicket({
  durationMinutes,
  locale,
  price,
}: {
  durationMinutes?: number;
  locale: Locale;
  price?: string;
}) {
  const copy = giftCopy[locale];
  return (
    <div className="gift-ticket" aria-hidden="true">
      <div className="gift-ticket-face">
        <div className="gift-ticket-main">
          <span className="gift-ticket-kicker">{copy.card.kicker}</span>
          <b className="gift-ticket-heading">{copy.card.heading}</b>
          {durationMinutes && (
            <span className="gift-ticket-length">
              {copy.card.length(durationMinutes)}
            </span>
          )}
          <span className="gift-ticket-code">
            <small>{copy.card.code}</small>
            <span className="data">•••• ••••</span>
          </span>
        </div>
        <div className="gift-ticket-stub">
          <Ring />
          <span className="gift-ticket-admit">{copy.ticket.admit}</span>
          {price && <span className="gift-ticket-price data">{price}</span>}
        </div>
        <span className="gift-ticket-sheen" />
      </div>
    </div>
  );
}
