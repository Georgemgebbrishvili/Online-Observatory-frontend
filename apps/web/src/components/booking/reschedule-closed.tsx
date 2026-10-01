import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import type { Locale } from "@/i18n/config";
import { rescheduleCopy } from "@/i18n/resources/reschedule";

type RescheduleClosedProps = {
  /** The booking named, when it is the customer's; otherwise the way back is the list. */
  bookingId: string | null;
  locale: Locale;
};

/** A `reschedule` that names no open entitlement: nothing to choose, and the way back. */
export function RescheduleClosed({ bookingId, locale }: RescheduleClosedProps) {
  const copy = rescheduleCopy[locale];
  const bookings = `/${locale}/app/bookings`;

  return (
    <div className="booking-page">
      <StatePanel
        headingLevel={1}
        {...copy.closed}
        action={
          <Link
            className="button button-secondary"
            href={bookingId ? `${bookings}/${bookingId}` : bookings}
          >
            <span>{bookingId ? copy.toBooking : copy.toBookings}</span>
          </Link>
        }
      />
    </div>
  );
}
