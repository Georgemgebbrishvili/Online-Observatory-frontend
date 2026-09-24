import { describe, expect, it } from "vitest";

import { networkNodes } from "./network";

describe("observatory network", () => {
  it("represents only the current Stellar-operated site", () => {
    expect(networkNodes).toHaveLength(1);
    expect(networkNodes[0]).toMatchObject({
      ownerType: "DARKVIEW",
      kind: "FIRST_PARTY",
      approvalStatus: "APPROVED",
    });
    expect(networkNodes.some((node) => node.kind === "PARTNER")).toBe(false);
  });

  it("keeps scheduling inputs explicit without commercial data", () => {
    expect(networkNodes[0].capabilities.length).toBeGreaterThan(0);
    expect(networkNodes[0].availabilityMode).toBe("CONFIGURED_WINDOWS");
    expect(networkNodes[0]).not.toHaveProperty("commission");
    expect(networkNodes[0]).not.toHaveProperty("price");
  });
});
