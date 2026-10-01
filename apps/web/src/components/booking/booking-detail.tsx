import type { ObservatoryMode } from "@darkview/contracts";
import Link from "next/link";

import { BookingActions } from "@/components/booking/booking-actions";
import { bookingTitle, statusTone } from "@/components/booking/booking-list";
import { formatPrice } from "@/components/booking/booking-night";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatusIndicator } from "@/components/ui/status-indicator";
import type { BookingEntry } from "@/features/booking/bookings";
import { bookingReference, formatDay, formatSlot } from "@/features/booking/present";
import type { Locale } from "@/i18n/config";
import { bookingActionsCopy, bookingsCopy } from "@/i18n/resources/bookings";
import { rescheduleCopy } from "@/i18n/resources/reschedule";
import { statusCopy } from "@/i18n/resources/status";

type BookingDetailProps = {
  entry: BookingEntry;
  mode: ObservatoryMode | null;
  locale: Locale;
};

export function BookingDetail({ entry, locale, mode }: BookingDetailProps) {
  const copy = bookingsCopy[locale];
  const { booking, observatory, timezone } = entry;
  const entitlement = booking.entitlement ?? null;
  const open = entitlement?.status === "OPEN";
  const base = `/${locale}/app/bookings`;

  return (
    <div className="booking-page booking-detail">
      <Link className="booking-back" href={base}>
        {copy.back}
      </Link>

      <header className="booking-hero">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {observatory
            ? locale === "ka"
              ? observatory.nameKa
              : observatory.nameEn
            : copy.unknownObservatory}
        </p>
        <h1>{bookingTitle(entry, locale)}</h1>
        <StatusIndicator
          label={copy.status[booking.status]}
          tone={statusTone[booking.status]}
        />
        <p>{copy.statement[booking.status]}</p>
      </header>

      {mode === "SIMULATED" && (
        <ModeNotice
          mode="SIMULATED"
          label={statusCopy[locale].mode.SIMULATED.banner}
          detail={statusCopy[locale].mode.SIMULATED.detail}
        />
      )}

      <dl className="booking-facts">
        <div>
          <dt>{copy.facts.slot}</dt>
          <dd>
            <time dateTime={booking.slotStartAt}>
              {formatSlot(booking.slotStartAt, booking.durationMinutes, timezone, locale)}
            </time>
          </dd>
        </div>
        <div>
          <dt>{copy.facts.length}</dt>
          <dd>{copy.minutes(booking.durationMinutes)}</dd>
        </div>
        <div>
          <dt>{copy.facts.price}</dt>
          <dd>{formatPrice(booking.priceMinor, booking.currency, locale)}</dd>
        </div>
        {!!booking.tierDiscountMinor && (
          <div>
            <dt>{copy.facts.tierDiscount}</dt>
            <dd>{formatPrice(booking.tierDiscountMinor, booking.currency, locale)}</dd>
          </div>
        )}
        {!!booking.loyaltyPointsRedeemed && (
          <div>
            <dt>{copy.facts.loyaltyPoints}</dt>
            <dd>{copy.points(booking.loyaltyPointsRedeemed)}</dd>
          </div>
        )}
        {!!booking.subscriptionMinutesSpent && (
          <div>
            <dt>{copy.facts.subscriptionMinutes}</dt>
            <dd>{copy.minutes(booking.subscriptionMinutesSpent)}</dd>
          </div>
        )}
        <div>
          <dt>{copy.facts.reference}</dt>
          <dd>{bookingReference(booking.id)}</dd>
        </div>
      </dl>

      {entitlement && (
        <p className="booking-entitlement">
          {entitlement.status === "OPEN"
            ? copy.lostSlot(
                entitlement.minutesLost,
                copy.cause[entitlement.cause],
                formatDay(entitlement.expiresAt, timezone, locale),
              )
            : entitlement.status === "REFUNDED"
              ? copy.refunded
              : copy.rescheduled}
          {entitlement.rescheduledBookingId && (
            <>
              {" "}
              <Link href={`${base}/${entitlement.rescheduledBookingId}`}>
                {copy.rescheduledTo}
              </Link>
            </>
          )}
        </p>
      )}

      {booking.status === "CONFIRMED" && booking.missionId && (
        <Link
          className="button button-primary button-large booking-observe"
          href={`/${locale}/app/missions/${booking.missionId}/session`}
        >
          <span>{copy.openObservation}</span>
        </Link>
      )}

      {open && (
        <Link
          className="button button-secondary button-large booking-reschedule"
          href={`/${locale}/app/book?reschedule=${booking.id}`}
        >
          <span>{rescheduleCopy[locale].offer}</span>
        </Link>
      )}

      {booking.status === "CONFIRMED" && !open && (
        <p className="booking-rule">{copy.paidCannotCancel}</p>
      )}

      <BookingActions
        bookingId={booking.id}
        cancellable={booking.status === "PENDING_PAYMENT"}
        refundable={open}
        signInPath={`/${locale}/sign-in`}
        copy={bookingActionsCopy(locale)}
      />
    </div>
  );
}
