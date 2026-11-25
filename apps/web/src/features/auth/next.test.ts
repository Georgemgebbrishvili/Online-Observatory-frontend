import { describe, expect, it } from "vitest";

import { bookingReturn } from "@/features/auth/next";

describe("bookingReturn", () => {
  it("keeps the booking board and the slot chosen on it", () => {
    const next = "/en/app/book?startAt=2026-11-25T18%3A00%3A00.000Z&length=30&target=jupiter";
    expect(bookingReturn(next, "en")).toBe(next);
    expect(bookingReturn("/ka/app/book", "ka")).toBe("/ka/app/book");
  });

  it("ignores every other address", () => {
    for (const value of [
      undefined,
      "",
      "https://example.com/en/app/book",
      "//example.com/en/app/book",
      "/en/app/bookings",
      "/en/app/book/../../admin",
      "/en/app/book?x=<script>",
      "/en/app/book#x",
      "/ka/app/book",
      `/en/app/book?${"a".repeat(300)}`,
    ]) {
      expect(bookingReturn(value, "en")).toBeNull();
    }
  });
});
