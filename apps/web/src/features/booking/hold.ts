import type { Booking } from "@darkview/contracts";

import { checkoutTarget } from "@/features/booking/checkout";

export type Hold = {
  /** The hold's deadline, while the booking awaits payment and the platform told it. */
  deadline: string | null;
  /** The deadline has passed and the platform has not yet swept the hold. */
  lapsed: boolean;
  /** Where to continue the payment, or null when there is nothing to follow. */
  checkout: string | null;
};

/**
 * The hold a booking awaiting payment is under (ADR-043). The platform sweeps a lapsed
 * hold when a slot is next sold, so a past deadline can still read PENDING_PAYMENT; it
 * offers nothing to follow. The checkout address is followed only as the reserve step
 * follows it: https:, or this origin.
 */
export function describeHold(booking: Booking, origin: string, now = Date.now()): Hold {
  const intent = booking.status === "PENDING_PAYMENT" ? booking.paymentIntent : null;
  const deadline = intent?.expiresAt ?? null;
  const lapsed = deadline !== null && Date.parse(deadline) <= now;
  const checkout =
    intent?.redirectUrl && !lapsed ? checkoutTarget(intent.redirectUrl, origin) : null;
  return { deadline, lapsed, checkout };
}
