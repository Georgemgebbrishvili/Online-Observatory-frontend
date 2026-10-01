import "server-only";

import type { Booking } from "@darkview/contracts";

import { readBooking } from "@/features/booking/bookings";

export type RescheduleResult =
  | { kind: "none" }
  | { kind: "open"; booking: Booking }
  /** No free slot to claim: already claimed or refunded, or no such booking. */
  | { kind: "closed"; bookingId: string | null }
  | { kind: "unreachable" };

/**
 * The `reschedule` parameter: a booking whose lost slot may still be replaced for free.
 *
 * OPEN is the whole test, as on the booking's page. Lapsing is the platform's to judge:
 * it refunds an entitlement that lapses OPEN, and refuses a late claim with 409 CONFLICT,
 * which the form answers by going back to the booking.
 */
export async function readReschedule(
  value: string | string[] | undefined,
): Promise<RescheduleResult> {
  if (value === undefined) return { kind: "none" };
  if (typeof value !== "string") return { kind: "closed", bookingId: null };

  const result = await readBooking(value);
  if (result.kind === "not-found") return { kind: "closed", bookingId: null };
  if (result.kind !== "ok") return { kind: "unreachable" };

  const { booking } = result.entry;
  return booking.entitlement?.status === "OPEN"
    ? { kind: "open", booking }
    : { kind: "closed", bookingId: booking.id };
}
