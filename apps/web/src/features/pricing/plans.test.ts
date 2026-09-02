import { describe, expect, it } from "vitest";

import { getPricingOffering, isOfferingEnabled, pricingConfiguration } from "./plans";

describe("pricing configuration", () => {
  it("stores every offering in one configuration source", () => {
    expect(pricingConfiguration.offerings.map((offering) => offering.id)).toEqual([
      "observer",
      "explorer",
      "advanced",
      "private-observatory",
    ]);
  });

  it("does not invent undecided production prices", () => {
    const configurableOfferings = pricingConfiguration.offerings.filter(
      (offering) => offering.price.kind === "CONFIGURABLE",
    );

    expect(pricingConfiguration.currency).toBeNull();
    expect(pricingConfiguration.paymentsEnabled).toBe(false);
    expect(
      configurableOfferings.every(
        (offering) =>
          offering.price.amountMinor === undefined &&
          offering.price.currency === undefined,
      ),
    ).toBe(true);
  });

  it("keeps Observer free and Advanced feature-gated", () => {
    expect(getPricingOffering("observer")?.price).toEqual({
      kind: "FREE",
      amountMinor: 0,
    });

    const advanced = getPricingOffering("advanced");
    expect(advanced && isOfferingEnabled(advanced)).toBe(false);
  });

  it("configures the three private session durations", () => {
    expect(getPricingOffering("private-observatory")?.sessionDurations).toEqual([
      30, 60, 120,
    ]);
  });
});
