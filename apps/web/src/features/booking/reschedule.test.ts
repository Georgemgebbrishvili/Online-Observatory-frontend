import { beforeEach, describe, expect, it, vi } from "vitest";

const readBooking = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/features/booking/bookings", () => ({ readBooking }));

const { readReschedule } = await import("@/features/booking/reschedule");

const bookingId = "53000000-0000-4000-8000-000000000004";

function lost(status: "OPEN" | "REFUNDED" | "RESCHEDULED") {
  return {
    kind: "ok",
    entry: {
      booking: {
        id: bookingId,
        entitlement: {
          status,
          cause: "WEATHER",
          minutesLost: 18,
          expiresAt: "2026-10-20T16:30:00Z",
          rescheduledBookingId: null,
        },
      },
    },
    mode: null,
  };
}

beforeEach(() => {
  readBooking.mockReset();
});

describe("readReschedule", () => {
  it("is nothing without the parameter", async () => {
    expect(await readReschedule(undefined)).toEqual({ kind: "none" });
    expect(readBooking).not.toHaveBeenCalled();
  });

  it("is open for a booking whose entitlement is OPEN", async () => {
    readBooking.mockResolvedValue(lost("OPEN"));
    const result = await readReschedule(bookingId);
    expect(result.kind).toBe("open");
    expect(readBooking).toHaveBeenCalledWith(bookingId);
  });

  it("is closed once the entitlement is claimed or refunded, or with none", async () => {
    for (const answer of [
      lost("RESCHEDULED"),
      lost("REFUNDED"),
      {
        kind: "ok",
        entry: { booking: { id: bookingId, entitlement: null } },
        mode: null,
      },
    ]) {
      readBooking.mockResolvedValue(answer);
      expect(await readReschedule(bookingId)).toEqual({ kind: "closed", bookingId });
    }
  });

  it("names no booking for one that is not the customer's, or a repeated parameter", async () => {
    readBooking.mockResolvedValue({ kind: "not-found" });
    expect(await readReschedule("anything")).toEqual({
      kind: "closed",
      bookingId: null,
    });
    expect(await readReschedule([bookingId, bookingId])).toEqual({
      kind: "closed",
      bookingId: null,
    });
  });

  it("is unreachable when the booking cannot be read", async () => {
    readBooking.mockResolvedValue({ kind: "unreachable" });
    expect(await readReschedule(bookingId)).toEqual({ kind: "unreachable" });
  });
});
