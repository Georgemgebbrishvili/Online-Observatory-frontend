import type { BookingStatus } from "@darkview/contracts";
import Link from "next/link";

import { formatPrice } from "@/components/booking/booking-night";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import type { BookingEntry, BookingsResult } from "@/features/booking/bookings";
import { formatSlot } from "@/features/booking/present";
import { targetName } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { bookingsCopy } from "@/i18n/resources/bookings";

export const statusTone: Record<BookingStatus, StatusTone> = {
  PENDING_PAYMENT: "warning",
  CONFIRMED: "success",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
  REFUNDED: "neutral",
};

export function bookingTitle({ retired, target }: BookingEntry, locale: Locale) {
  const copy = bookingsCopy[locale];
  return target ? targetName(target, locale) : retired ? copy.retiredTarget : "—";
}

type BookingRowProps = {
  href: string;
  title: string;
  slot: string;
  price: string;
  status: BookingStatus;
  statusLabel: string;
};

/** One booking in the list: what, when, how much, and where it stands. */
export function BookingRow({
  href,
  price,
  slot,
  status,
  statusLabel,
  title,
}: BookingRowProps) {
  return (
    <li className="booking-row" data-status={status}>
      <Link href={href}>
        <span className="booking-row-title">{title}</span>
        <span className="booking-row-slot">{slot}</span>
        <span className="booking-row-price">{price}</span>
        <StatusIndicator
          className="booking-row-status"
          label={statusLabel}
          tone={statusTone[status]}
        />
      </Link>
    </li>
  );
}

type BookingListProps = {
  result: Exclude<BookingsResult, { kind: "signed-out" }>;
  /** True past the first page: a way back to the latest. */
  paged: boolean;
  locale: Locale;
};

export function BookingList({ locale, paged, result }: BookingListProps) {
  const copy = bookingsCopy[locale];
  const base = `/${locale}/app/bookings`;

  const hero = (
    <header className="booking-hero">
      <p className="kicker">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p>{copy.introduction}</p>
    </header>
  );

  if (result.kind === "unreachable") {
    return (
      <div className="booking-page">
        {hero}
        <StatePanel variant="error" headingLevel={2} {...copy.unreachable} />
      </div>
    );
  }

  if (result.entries.length === 0) {
    const state = paged ? copy.noMore : copy.empty;
    return (
      <div className="booking-page">
        {hero}
        <StatePanel
          headingLevel={2}
          {...state}
          action={
            <Link
              className="button button-secondary"
              href={paged ? base : `/${locale}/app/book`}
            >
              <span>{paged ? copy.newest : copy.bookSlot}</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="booking-page">
      {hero}
      <ol className="booking-list">
        {result.entries.map((entry) => (
          <BookingRow
            key={entry.booking.id}
            href={`${base}/${entry.booking.id}`}
            title={bookingTitle(entry, locale)}
            slot={formatSlot(
              entry.booking.slotStartAt,
              entry.booking.durationMinutes,
              entry.timezone,
              locale,
            )}
            price={formatPrice(entry.booking.priceMinor, entry.booking.currency, locale)}
            status={entry.booking.status}
            statusLabel={copy.status[entry.booking.status]}
          />
        ))}
      </ol>

      {(paged || result.nextCursor) && (
        <nav className="booking-pages" aria-label={copy.eyebrow}>
          {paged && (
            <Link className="button button-ghost" href={base}>
              <span>{copy.newest}</span>
            </Link>
          )}
          {result.nextCursor && (
            <Link
              className="button button-secondary"
              href={`${base}?cursor=${encodeURIComponent(result.nextCursor)}`}
            >
              <span>{copy.older}</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
