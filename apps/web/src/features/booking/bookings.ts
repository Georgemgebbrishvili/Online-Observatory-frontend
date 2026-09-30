import "server-only";

import type {
  BookableObservatory,
  Booking,
  ObservatoryMode,
  Target,
} from "@darkview/contracts";
import {
  zBookingId,
  zGetBookingResponse,
  zGetObservatoryStatusResponse,
  zListBookingsResponse,
} from "@darkview/contracts/zod";
import { cache } from "react";

import { readCatalogue, readObservatories } from "@/features/collection/read";
import { PlatformError, platformRequest } from "@/lib/platform/client";

export type BookingEntry = {
  booking: Booking;
  /** Null when the target has been disabled since, or the catalogue could not be read. */
  target: Target | null;
  /** The catalogue was read and this target is not in it. */
  retired: boolean;
  /** Null when the observatory list could not be read, or no longer lists it. */
  observatory: BookableObservatory | null;
  /** The observatory's zone, for the slot's times; UTC when it is unknown. */
  timezone: string;
};

export type BookingsResult =
  | { kind: "ok"; entries: BookingEntry[]; nextCursor: string | null }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

export type BookingResult =
  | {
      kind: "ok";
      entry: BookingEntry;
      /** The observatory's, for the simulated notice. Null when unreadable. */
      mode: ObservatoryMode | null;
    }
  | { kind: "not-found" }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

const pageSize = 20;

function failure(error: unknown): { kind: "signed-out" } | { kind: "unreachable" } {
  return error instanceof PlatformError && error.status === 401
    ? { kind: "signed-out" }
    : { kind: "unreachable" };
}

function entryOf(
  booking: Booking,
  catalogue: Map<string, Target> | null,
  observatories: BookableObservatory[] | null,
): BookingEntry {
  const observatory =
    observatories?.find((candidate) => candidate.id === booking.observatoryId) ?? null;
  return {
    booking,
    target: catalogue?.get(booking.targetId) ?? null,
    retired: catalogue !== null && !catalogue.has(booking.targetId),
    observatory,
    timezone: observatory?.timezone ?? "UTC",
  };
}

/** The cursor is a booking id; anything else is ignored and the list starts at the top. */
export function bookingCursorOf(value: string | string[] | undefined) {
  return typeof value === "string" && zBookingId.safeParse(value).success ? value : null;
}

/** GET /bookings: one page of the signed-in customer's bookings, latest slot first. */
export async function readBookings(
  cursor: string | null,
  limit = pageSize,
): Promise<BookingsResult> {
  try {
    const query = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const [page, catalogue, observatories] = await Promise.all([
      platformRequest<unknown>(`/bookings?limit=${limit}${query}`).then((value) =>
        zListBookingsResponse.parse(value),
      ),
      readCatalogue(),
      readObservatories(),
    ]);
    return {
      kind: "ok",
      entries: page.items.map((booking) => entryOf(booking, catalogue, observatories)),
      nextCursor: page.page.hasMore ? (page.page.nextCursor ?? null) : null,
    };
  } catch (error) {
    return failure(error);
  }
}

/** GET /bookings/{id}. Somebody else's booking and no booking are the same 404. */
// cache(): generateMetadata and the page read the same booking in one request.
export const readBooking = cache(async (bookingId: string): Promise<BookingResult> => {
  if (!zBookingId.safeParse(bookingId).success) return { kind: "not-found" };

  let booking: Booking;
  try {
    booking = zGetBookingResponse.parse(
      await platformRequest<unknown>(`/bookings/${encodeURIComponent(bookingId)}`),
    );
  } catch (error) {
    if (error instanceof PlatformError && error.status === 404)
      return { kind: "not-found" };
    return failure(error);
  }

  const [catalogue, observatories, mode] = await Promise.all([
    readCatalogue(),
    readObservatories(),
    // Only for the simulated notice, so losing it must not lose the booking.
    platformRequest<unknown>(
      `/observatories/${encodeURIComponent(booking.observatoryId)}/state`,
    )
      .then((value) => zGetObservatoryStatusResponse.parse(value).mode)
      .catch(() => null),
  ]);

  return { kind: "ok", entry: entryOf(booking, catalogue, observatories), mode };
});
