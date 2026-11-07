import { LoyaltyEntryKind, type LoyaltyTier } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { loyaltyCopy } from "@/i18n/resources/loyalty";

import {
  clubProgress,
  maxSpendablePoints,
  pointsValueMinor,
  priceBreakdown,
  reductionLock,
  referralLink,
} from "./club";

const member: LoyaltyTier = {
  code: "MEMBER",
  nameEn: "Member",
  nameKa: "წევრი",
  thresholdPoints: 0,
  discountPercent: 10,
};
const vip: LoyaltyTier = {
  code: "VIP",
  nameEn: "VIP",
  nameKa: "VIP",
  thresholdPoints: 20000,
  discountPercent: 20,
};
const scheme = { pointsPerGelRedeemed: 100, minimumPayableMinor: 100, progressMarkers: [5000] };

describe("club progress", () => {
  it("starts empty at zero points, with the markers placed along the bar", () => {
    const progress = clubProgress({ tier: member, nextTier: vip, tierPoints: 0 }, scheme);
    expect(progress).toEqual({
      top: false,
      tier: member,
      next: vip,
      fraction: 0,
      remaining: 20000,
      markers: [{ points: 5000, at: 0.25, reached: false }],
    });
  });

  it("is tierPoints over the next threshold, with markers passed", () => {
    const progress = clubProgress({ tier: member, nextTier: vip, tierPoints: 7000 }, scheme);
    if (progress.top) throw new Error("not top");
    expect(progress.fraction).toBe(0.35);
    expect(progress.remaining).toBe(13000);
    expect(progress.markers[0].reached).toBe(true);
  });

  it("is the top tier, with no bar, when there is no next tier", () => {
    expect(clubProgress({ tier: vip, nextTier: null, tierPoints: 25000 }, scheme)).toEqual({
      top: true,
      tier: vip,
    });
  });

  it("never runs past the end or below the start", () => {
    const over = clubProgress({ tier: member, nextTier: vip, tierPoints: 30000 }, scheme);
    const under = clubProgress({ tier: member, nextTier: vip, tierPoints: -50 }, scheme);
    expect(!over.top && over.fraction).toBe(1);
    expect(!under.top && under.fraction).toBe(0);
  });

  it("drops markers at or past the next threshold", () => {
    const progress = clubProgress(
      { tier: member, nextTier: vip, tierPoints: 0 },
      { progressMarkers: [0, 5000, 20000, 25000] },
    );
    expect(!progress.top && progress.markers.map((marker) => marker.points)).toEqual([5000]);
  });
});

describe("points on a booking", () => {
  it("leaves at least the minimum payable after the tier discount", () => {
    // GEL 45.00 less 10% is GEL 40.50; GEL 1.00 must stay, so GEL 39.50 = 3,950 points,
    // in hundreds 3,900.
    expect(
      maxSpendablePoints({ priceMinor: 4500, discountPercent: 10, balance: 10000, scheme }),
    ).toBe(3900);
  });

  it("is capped by the balance, in hundreds", () => {
    expect(
      maxSpendablePoints({ priceMinor: 4500, discountPercent: 10, balance: 1250, scheme }),
    ).toBe(1200);
  });

  it("is nothing below one step, for a zero or negative balance, or a price at the floor", () => {
    expect(maxSpendablePoints({ priceMinor: 4500, discountPercent: 10, balance: 99, scheme })).toBe(0);
    expect(maxSpendablePoints({ priceMinor: 4500, discountPercent: 10, balance: -300, scheme })).toBe(0);
    expect(maxSpendablePoints({ priceMinor: 100, discountPercent: 0, balance: 9000, scheme })).toBe(0);
  });

  it("values points as the platform does", () => {
    expect(pointsValueMinor(3900, 100)).toBe(3900);
    expect(pointsValueMinor(100, 300)).toBe(33);
  });

  it("lists the slot, the tier discount, then the points", () => {
    expect(
      priceBreakdown({ priceMinor: 4500, discountPercent: 10, points: 1000, pointsPerGelRedeemed: 100 }),
    ).toEqual({ slotMinor: 4500, tierDiscountMinor: 450, pointsMinor: 1000, totalMinor: 3050 });
  });

  it("rounds the tier discount down", () => {
    expect(
      priceBreakdown({ priceMinor: 2255, discountPercent: 10, points: 0, pointsPerGelRedeemed: 100 })
        .tierDiscountMinor,
    ).toBe(225);
  });
});

describe("one reduction per booking", () => {
  it("locks the voucher while points are chosen, and points while a voucher is", () => {
    expect(reductionLock({ points: 0, voucher: false })).toEqual({
      pointsLocked: false,
      voucherLocked: false,
    });
    expect(reductionLock({ points: 200, voucher: false }).voucherLocked).toBe(true);
    expect(reductionLock({ points: 0, voucher: true }).pointsLocked).toBe(true);
  });
});

describe("club words", () => {
  it("has an English and a Georgian label for every ledger entry kind", () => {
    for (const kind of Object.values(LoyaltyEntryKind)) {
      for (const locale of ["en", "ka"] as const) {
        expect(loyaltyCopy[locale].kinds[kind], `${locale} ${kind}`).toBeTruthy();
      }
    }
  });

  it("builds the referral link on the register page", () => {
    expect(referralLink("https://stellar.astroman.ge", "ka", "AB12 CD")).toBe(
      "https://stellar.astroman.ge/ka/register?ref=AB12%20CD",
    );
  });
});
