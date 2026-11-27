import type { BookingStatus } from "@darkview/contracts";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatPrice } from "@/components/booking/booking-night";
import { TargetArt } from "@/components/booking/target-art";
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
  /** ADR-110: the object's drawn picture beside its name; none for a retired one. */
  art?: ReactNode;
  title: string;
  slot: string;
  price: string;
  status: BookingStatus;
  statusLabel: string;
};

/** One booking in the list: what, when, how much, and where it stands. */
export function BookingRow({
  art,
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
        <span className="booking-row-title">
          {art && (
            <span className="booking-row-art" aria-hidden="true">
              {art}
            </span>
          )}
          {title}
        </span>
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
  /** The request's clock, for which nights are still ahead. */
  now: string;
};

const live = (entry: BookingEntry) =>
  entry.booking.status === "CONFIRMED" || entry.booking.status === "PENDING_PAYMENT";
const endOf = ({ booking }: BookingEntry) =>
  Date.parse(booking.slotStartAt) + booking.durationMinutes * 60_000;

/** Calendar days from `now` to `at`, on the observatory's clock. */
function daysUntil(at: string, now: string, timezone: string) {
  const day = (time: string) =>
    Date.parse(
      new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(time)),
    );
  return Math.round((day(at) - day(now)) / 86_400_000);
}

/**
 * The customer's nights (ADR-110): the next one large with its object, the rest as rows,
 * and beside them the account's nights in three figures and the ways on.
 */
export function BookingList({ locale, now, paged, result }: BookingListProps) {
  const copy = bookingsCopy[locale];
  const base = `/${locale}/app/bookings`;
  const hero = (
    <header className="nights-head">
      <h1>{copy.section}</h1>
      <Link className="button button-primary" href={`/${locale}/app/book`}>
        <span>{copy.bookSlot}</span>
      </Link>
    </header>
  );
  const stateHeading = 2;
  const more = (
    <nav className="nights-more" aria-label={copy.more.title}>
      <h2>{copy.more.title}</h2>
      <Link href={`/${locale}/app/cards`}>{copy.more.cards}</Link>
      <Link href={`/${locale}/app/collection`}>{copy.more.collection}</Link>
      <Link href={`/${locale}/gift`}>{copy.more.gift}</Link>
    </nav>
  );
  const frame = (children: ReactNode, aside: ReactNode = more) => (
    <div className="booking-page nights-page">
      {hero}
      <div className="nights-layout">
        <div className="nights-main">{children}</div>
        <aside className="nights-aside">{aside}</aside>
      </div>
    </div>
  );

  if (result.kind === "unreachable") {
    return frame(
      <StatePanel variant="error" headingLevel={stateHeading} {...copy.unreachable} />,
    );
  }

  if (result.entries.length === 0) {
    const state = paged ? copy.noMore : copy.empty;
    return frame(
      <StatePanel
        headingLevel={stateHeading}
        {...state}
        action={
          paged ? (
            <Link className="button button-secondary" href={base}>
              <span>{copy.newest}</span>
            </Link>
          ) : undefined
        }
      />,
    );
  }

  const clock = Date.parse(now);
  const upcoming = result.entries
    .filter((entry) => live(entry) && endOf(entry) > clock)
    .sort(
      (a, b) => Date.parse(a.booking.slotStartAt) - Date.parse(b.booking.slotStartAt),
    );
  const next = paged ? undefined : upcoming[0];
  const slotOf = (entry: BookingEntry) =>
    formatSlot(
      entry.booking.slotStartAt,
      entry.booking.durationMinutes,
      entry.timezone,
      locale,
    );
  const priceOf = (entry: BookingEntry) =>
    formatPrice(entry.booking.priceMinor, entry.booking.currency, locale);

  // The figures count every booking only when they are all on this one page.
  const whole = !paged && !result.nextCursor;
  const confirmed = result.entries.filter(
    (entry) => entry.booking.status === "CONFIRMED",
  );
  const figures = whole && [
    {
      label: copy.summary.ahead,
      value: confirmed.filter((entry) => endOf(entry) > clock).length,
    },
    {
      label: copy.summary.observed,
      value: confirmed.filter((entry) => endOf(entry) <= clock).length,
    },
    {
      label: copy.summary.hours,
      value: new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
        maximumFractionDigits: 1,
      }).format(
        confirmed.reduce((sum, entry) => sum + entry.booking.durationMinutes, 0) / 60,
      ),
    },
  ];

  const days = next ? daysUntil(next.booking.slotStartAt, now, next.timezone) : 0;
  const when =
    days <= 0
      ? copy.ahead.tonight
      : days === 1
        ? copy.ahead.tomorrow
        : copy.ahead.inDays(days);

  return frame(
    <>
      {next && (
        <Link className="nights-next" href={`${base}/${next.booking.id}`}>
          <span className="nights-next-art" aria-hidden="true">
            {next.target && <TargetArt target={next.target} />}
          </span>
          <span className="nights-next-text">
            <span className="nights-next-kicker">
              {copy.ahead.label} · {when}
            </span>
            <span className="nights-next-title">{bookingTitle(next, locale)}</span>
            <span className="nights-next-slot">{slotOf(next)}</span>
            <span className="nights-next-foot">
              <StatusIndicator
                label={copy.status[next.booking.status]}
                tone={statusTone[next.booking.status]}
              />
              <span className="nights-next-price">{priceOf(next)}</span>
              <span className="nights-next-go">{copy.ahead.open} →</span>
            </span>
          </span>
        </Link>
      )}
      <ol className="booking-list">
        {result.entries.map((entry) => (
          <BookingRow
            key={entry.booking.id}
            href={`${base}/${entry.booking.id}`}
            art={entry.target ? <TargetArt target={entry.target} /> : undefined}
            title={bookingTitle(entry, locale)}
            slot={slotOf(entry)}
            price={priceOf(entry)}
            status={entry.booking.status}
            statusLabel={copy.status[entry.booking.status]}
          />
        ))}
      </ol>
      <p className="nights-caption">{copy.illustrations}</p>
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
    <>
      {figures && (
        <section className="nights-figures" aria-labelledby="nights-figures-title">
          <h2 id="nights-figures-title">{copy.summary.title}</h2>
          <dl>
            {figures.map((figure) => (
              <div key={figure.label}>
                <dt>{figure.label}</dt>
                <dd>{figure.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {more}
    </>,
  );
}
