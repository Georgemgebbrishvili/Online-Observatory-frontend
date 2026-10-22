import type { Currency, SlotUnavailableReason } from "@darkview/contracts";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { bookingCopy } from "@/i18n/resources/booking";

function intlLocale(locale: Locale) {
  return locale === "ka" ? "ka-GE" : "en-GB";
}

/** A minor-unit amount in its currency, with that currency's own number of decimals. */
export function formatPrice(priceMinor: number, currency: Currency, locale: Locale) {
  const format = new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
  });
  const digits = format.resolvedOptions().maximumFractionDigits ?? 2;
  return format.format(priceMinor / 10 ** digits);
}

type SlotRowProps = {
  startAt: string;
  endAt: string;
  durationMinutes: number;
  priceMinor: number;
  currency: Currency;
  available: boolean;
  unavailableReason?: SlotUnavailableReason | null;
  timezone: string;
  locale: Locale;
  /** Where an available slot leads: its reserve page. None where the slot is already chosen. */
  href?: string;
  /** In place of the slot's price: a reschedule's is free. */
  priceLabel?: string;
};

/** One slot: its time in the observatory's zone, its length, its price, and whether it can be had. */
export function SlotRow({
  available,
  currency,
  durationMinutes,
  endAt,
  href,
  locale,
  priceLabel,
  priceMinor,
  startAt,
  timezone,
  unavailableReason,
}: SlotRowProps) {
  const copy = bookingCopy[locale];
  const time = new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });
  const zone = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(new Date(startAt))
    .find((part) => part.type === "timeZoneName")?.value;

  return (
    <li className="slot-row" data-available={available}>
      <span className="slot-time">
        <time dateTime={startAt}>{time.format(new Date(startAt))}</time>
        {" – "}
        <time dateTime={endAt}>{time.format(new Date(endAt))}</time>
        {zone && <small>{zone}</small>}
      </span>
      <span className="slot-length">{copy.minutes(durationMinutes)}</span>
      <span className="slot-price">
        {priceLabel ?? formatPrice(priceMinor, currency, locale)}
      </span>
      <span className="slot-state">
        {available && href ? (
          <Link
            href={href}
            aria-label={`${copy.choose} ${time.format(new Date(startAt))}–${time.format(new Date(endAt))}`}
          >
            {copy.choose}
          </Link>
        ) : available ? (
          copy.available
        ) : unavailableReason ? (
          copy.reasons[unavailableReason]
        ) : (
          copy.unavailable
        )}
      </span>
    </li>
  );
}
