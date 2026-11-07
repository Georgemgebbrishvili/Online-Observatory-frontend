import { LoyaltyEntryKind } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { copy } from "../i18n/copy";
import { clubProgress, points } from "./loyalty";

const vip = { code: "VIP", nameEn: "VIP", nameKa: "VIP", thresholdPoints: 20000, discountPercent: 20 };

describe("club progress", () => {
  it("is empty at zero points, markers placed", () => {
    expect(clubProgress({ nextTier: vip, tierPoints: 0 }, { progressMarkers: [5000] })).toEqual({
      top: false,
      next: vip,
      fraction: 0,
      remaining: 20000,
      markers: [{ at: 0.25, reached: false }],
    });
  });

  it("is the top tier with no next tier", () => {
    expect(clubProgress({ nextTier: null, tierPoints: 30000 }, { progressMarkers: [] })).toEqual({ top: true });
  });

  it("caps at the end", () => {
    const progress = clubProgress({ nextTier: vip, tierPoints: 25000 }, { progressMarkers: [] });
    expect(!progress.top && progress.fraction).toBe(1);
  });
});

describe("club words", () => {
  it("labels every ledger entry kind in English and Georgian", () => {
    for (const kind of Object.values(LoyaltyEntryKind)) {
      expect(copy.en.club.kinds[kind], kind).toBeTruthy();
      expect(copy.ka.club.kinds[kind], kind).toBeTruthy();
    }
  });

  it("prints points with a sign and thousands", () => {
    expect(points(4200)).toBe("4,200");
    expect(points(-2800)).toBe("−2,800");
    expect(points(100, true)).toBe("+100");
  });
});
