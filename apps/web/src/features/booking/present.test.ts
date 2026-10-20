import { describe, expect, it } from "vitest";

import {
  bookingReference,
  formatDay,
  formatDeadline,
  formatSlot,
  stillToCome,
} from "@/features/booking/present";

describe("formatSlot", () => {
  it("reads the slot in the observatory's zone, with the zone named", () => {
    expect(formatSlot("2026-09-30T14:00:00.000Z", 30, "Asia/Tbilisi", "en")).toBe(
      "Wed, 30 Sept 2026, 18:00–18:30 GMT+4",
    );
  });

  it("crosses midnight in the observatory's zone, not the reader's", () => {
    expect(formatSlot("2026-09-30T19:40:00.000Z", 30, "Asia/Tbilisi", "en")).toBe(
      "Wed, 30 Sept 2026, 23:40–00:10 GMT+4",
    );
  });

  it("formats in Georgian", () => {
    expect(formatSlot("2026-09-30T14:00:00.000Z", 30, "Asia/Tbilisi", "ka")).toContain(
      "18:00–18:30",
    );
  });
});

describe("formatDay", () => {
  it("is the day in the observatory's zone", () => {
    expect(formatDay("2026-10-30T21:00:00.000Z", "Asia/Tbilisi", "en")).toBe(
      "31 October 2026",
    );
  });
});

describe("formatDeadline", () => {
  it("is the instant in the observatory's zone, with the zone named", () => {
    expect(formatDeadline("2030-01-16T14:35:00.000Z", "Asia/Tbilisi", "en")).toBe(
      "Wed, 16 Jan 2030, 18:35 GMT+4",
    );
    expect(formatDeadline("2030-01-16T14:35:00.000Z", "Asia/Tbilisi", "ka")).toContain(
      "18:35",
    );
  });
});

describe("bookingReference", () => {
  it("is the id's first eight characters, upper case", () => {
    expect(bookingReference("4a000000-0000-4000-8000-000000000001")).toBe("4A000000");
  });
});

describe("stillToCome", () => {
  const start = Date.parse("2030-01-15T14:00:00.000Z");
  const paid = {
    status: "CONFIRMED" as const,
    slotStartAt: "2030-01-15T14:00:00.000Z",
    durationMinutes: 30,
    entitlement: null,
  };

  it("holds before the slot and while it runs", () => {
    expect(stillToCome(paid, start - 60_000)).toBe(true);
    expect(stillToCome(paid, start + 29 * 60_000)).toBe(true);
  });

  it("ends with the slot", () => {
    expect(stillToCome(paid, start + 30 * 60_000)).toBe(false);
  });

  it("is only for a paid booking that was not lost", () => {
    expect(stillToCome({ ...paid, status: "PENDING_PAYMENT" }, start - 60_000)).toBe(false);
    expect(
      stillToCome({ ...paid, entitlement: { status: "OPEN" } as never }, start - 60_000),
    ).toBe(false);
  });
});
