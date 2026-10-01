import type { Currency, Slot, SlotUnavailableReason } from "@darkview/contracts";
import Link from "next/link";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatePanel } from "@/components/ui/state-panel";
import type { NightResult } from "@/features/booking/read";
import type { Locale } from "@/i18n/config";
import { bookingCopy } from "@/i18n/resources/booking";
import { statusCopy } from "@/i18n/resources/status";

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
};

/** One slot: its time in the observatory's zone, its length, its price, and whether it can be had. */
export function SlotRow({
  available,
  currency,
  durationMinutes,
  endAt,
  href,
  locale,
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
      <span className="slot-price">{formatPrice(priceMinor, currency, locale)}</span>
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

type BookingNightProps = {
  locale: Locale;
  result: NightResult;
};

export function BookingNight({ locale, result }: BookingNightProps) {
  const copy = bookingCopy[locale];
  const night = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return (
    <div className="booking-page">
      <header className="booking-hero">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {result.kind === "ok"
            ? locale === "ka"
              ? result.observatory.nameKa
              : result.observatory.nameEn
            : copy.eyebrow}
        </p>
        <h1>{copy.title}</h1>
        <p>{copy.introduction}</p>
        <Link className="booking-bookings" href={`/${locale}/app/bookings`}>
          {copy.yourBookings}
        </Link>
      </header>

      {result.kind === "unreachable" && (
        <StatePanel variant="error" headingLevel={2} {...copy.unreachable} />
      )}
      {result.kind === "no-observatory" && (
        <StatePanel headingLevel={2} {...copy.noObservatory} />
      )}

      {result.kind === "ok" && (
        <>
          {result.mode === "SIMULATED" && (
            <ModeNotice
              mode="SIMULATED"
              label={statusCopy[locale].mode.SIMULATED.banner}
              detail={statusCopy[locale].mode.SIMULATED.detail}
            />
          )}

          <nav className="booking-nights" aria-label={copy.nights}>
            <h2>{copy.nights}</h2>
            <ol>
              {result.nights.map((date) => (
                <li key={date}>
                  <Link
                    href={`/${locale}/app/book?date=${date}`}
                    aria-current={date === result.date ? "date" : undefined}
                  >
                    {/* A calendar date, not an instant: formatted in UTC so it never shifts. */}
                    <time dateTime={date}>
                      {night.format(new Date(`${date}T00:00:00Z`))}
                    </time>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <section className="booking-slots" aria-labelledby="booking-slots-title">
            <h2 id="booking-slots-title">{copy.slots}</h2>
            {result.slots.length === 0 ? (
              <StatePanel {...copy.noSlots} />
            ) : (
              <ol className="slot-list">
                {result.slots.map((slot: Slot) => (
                  <SlotRow
                    key={slot.startAt}
                    {...slot}
                    href={`/${locale}/app/book/reserve?startAt=${encodeURIComponent(slot.startAt)}`}
                    timezone={result.observatory.timezone}
                    locale={locale}
                  />
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
