import { describe, expect, it } from "vitest";

import { pricingOfferings } from "./plans";

describe("pricing offerings", () => {
  it("lists only what exists today", () => {
    expect(pricingOfferings.map((offering) => offering.id)).toEqual(["watch", "slot"]);
  });

  it("keeps watching free and carries no amount of its own for a slot", () => {
    expect(pricingOfferings.find((offering) => offering.id === "watch")?.price).toEqual({
      kind: "FREE",
    });
    const slot = pricingOfferings.find((offering) => offering.id === "slot");
    expect(slot?.price).toEqual({ kind: "PER_SLOT" });
    expect(JSON.stringify(pricingOfferings)).not.toMatch(/amount|currency|GEL|₾/);
  });
});
