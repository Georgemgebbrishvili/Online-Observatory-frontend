import { describe, expect, it } from "vitest";

import { pricingOfferings } from "./plans";

describe("pricing offerings", () => {
  it("lists only what exists today", () => {
    expect(pricingOfferings.map((offering) => offering.id)).toEqual([
      "browse",
      "seat",
      "slot",
    ]);
  });

  it("keeps browsing free and carries no amount of its own for a seat or a slot", () => {
    expect(pricingOfferings.find((offering) => offering.id === "browse")?.price).toEqual({
      kind: "FREE",
    });
    // A seat is an Observer Pack, sold by the platform (ADR-007): never free.
    const seat = pricingOfferings.find((offering) => offering.id === "seat");
    expect(seat?.price).toEqual({ kind: "PER_SEAT" });
    expect(seat?.action).toBeUndefined();
    const slot = pricingOfferings.find((offering) => offering.id === "slot");
    expect(slot?.price).toEqual({ kind: "PER_SLOT" });
    expect(JSON.stringify(pricingOfferings)).not.toMatch(/amount|currency|GEL|₾/);
  });
});
