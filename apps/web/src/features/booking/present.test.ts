import { describe, expect, it } from "vitest";

import { bookingReference, formatDay, formatSlot } from "@/features/booking/present";

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

describe("bookingReference", () => {
  it("is the id's first eight characters, upper case", () => {
    expect(bookingReference("4a000000-0000-4000-8000-000000000001")).toBe("4A000000");
  });
});
