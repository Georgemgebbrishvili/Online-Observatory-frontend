import type { BookingStatus } from "@darkview/contracts";
import Link from "next/link";
import type { ReactNode } from "react";

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
  /**
   * ADR-051: the list is a section of /app/book, "Your nights", under a heading of its
   * own; its pages run on that URL. Without it, the list is a page of its own.
   */
  embedded?: boolean;
};

export function BookingList({
  embedded = false,
  locale,
  paged,
  result,
}: BookingListProps) {
  const copy = bookingsCopy[locale];
  const base = embedded ? `/${locale}/app/book` : `/${locale}/app/bookings`;
  const detail = `/${locale}/app/bookings`;
  const hero = embedded ? (
    <header className="booking-nights-head">
      <h2 id="booking-nights-title">{copy.section}</h2>
    </header>
  ) : (
    <header className="booking-hero">
      <p className="kicker">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p>{copy.introduction}</p>
    </header>
  );
  const stateHeading = embedded ? 3 : 2;
  const frame = (children: ReactNode) =>
    embedded ? (
      <section
        id="booking-nights"
        className="booking-page booking-nights-section"
        aria-labelledby="booking-nights-title"
      >
        {children}
      </section>
    ) : (
      <div className="booking-page">{children}</div>
    );

  if (result.kind === "unreachable") {
    return frame(
      <>
        {hero}
        <StatePanel variant="error" headingLevel={stateHeading} {...copy.unreachable} />
      </>,
    );
  }

  if (result.entries.length === 0) {
    const state = paged ? copy.noMore : copy.empty;
    return frame(
      <>
        {hero}
        <StatePanel
          headingLevel={stateHeading}
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
      </>,
    );
  }

  return frame(
    <>
      {hero}
      <ol className="booking-list">
        {result.entries.map((entry) => (
          <BookingRow
            key={entry.booking.id}
            href={`${detail}/${entry.booking.id}`}
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
    </>,
  );
}
