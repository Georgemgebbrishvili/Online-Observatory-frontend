import type { Booking } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { describeHold } from "@/features/booking/hold";

const origin = "https://stellar.example";
const now = Date.parse("2030-01-16T14:00:00.000Z");

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: "52000000-0000-4000-8000-000000000003",
    userId: "10000000-0000-4000-8000-000000000001",
    observatoryId: "20000000-0000-4000-8000-000000000001",
    targetId: "30000000-0000-4000-8000-000000000021",
    slotStartAt: "2030-01-16T15:20:00.000Z",
    durationMinutes: 30,
    status: "PENDING_PAYMENT",
    priceMinor: 4500,
    currency: "GEL",
    paymentId: "62000000-0000-4000-8000-000000000003",
    paymentIntent: {
      paymentId: "62000000-0000-4000-8000-000000000003",
      provider: "SANDBOX",
      status: "PENDING",
      redirectUrl: `${origin}/api/payments/62000000-0000-4000-8000-000000000003/sandbox-checkout`,
      expiresAt: "2030-01-16T14:35:00.000Z",
    },
    createdAt: "2026-09-29T09:00:00.000Z",
    ...overrides,
  };
}

describe("describeHold", () => {
  it("offers the checkout and the deadline while the hold lasts", () => {
    expect(describeHold(booking({}), origin, now)).toEqual({
      deadline: "2030-01-16T14:35:00.000Z",
      lapsed: false,
      checkout: `${origin}/api/payments/62000000-0000-4000-8000-000000000003/sandbox-checkout`,
    });
  });

  it("offers nothing once the deadline has passed, although the status has not moved", () => {
    const hold = describeHold(booking({}), origin, Date.parse("2030-01-16T14:35:00.000Z"));
    expect(hold).toEqual({ deadline: "2030-01-16T14:35:00.000Z", lapsed: true, checkout: null });
  });

  it("follows only https: or this origin, as the reserve step does", () => {
    const elsewhere = booking({
      paymentIntent: {
        paymentId: "62000000-0000-4000-8000-000000000003",
        provider: "SANDBOX",
        status: "PENDING",
        redirectUrl: "http://elsewhere.example/pay",
        expiresAt: "2030-01-16T14:35:00.000Z",
      },
    });
    expect(describeHold(elsewhere, origin, now).checkout).toBeNull();
  });

  it("is nothing for a booking in any other status", () => {
    expect(describeHold(booking({ status: "CONFIRMED", paymentIntent: null }), origin, now)).toEqual({
      deadline: null,
      lapsed: false,
      checkout: null,
    });
  });
});
