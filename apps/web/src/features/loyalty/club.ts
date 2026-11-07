import type { LoyaltyAccount, LoyaltyScheme, LoyaltyTier } from "@darkview/contracts";

/** The contract's step for `loyaltyPoints`: at least 100, in hundreds. */
export const POINTS_STEP = 100;

export type ClubProgress =
  | { top: true; tier: LoyaltyTier }
  | {
      top: false;
      tier: LoyaltyTier;
      next: LoyaltyTier;
      /** 0..1 along the bar: tierPoints / next.thresholdPoints. */
      fraction: number;
      remaining: number;
      markers: { points: number; at: number; reached: boolean }[];
    };

/** Where a member stands: top tier, or how far along the bar to the next one. */
export function clubProgress(
  account: Pick<LoyaltyAccount, "tier" | "nextTier" | "tierPoints">,
  scheme: Pick<LoyaltyScheme, "progressMarkers">,
): ClubProgress {
  const { tier, nextTier: next, tierPoints } = account;
  if (!next || next.thresholdPoints <= 0) return { top: true, tier };
  const points = Math.max(tierPoints, 0);
  return {
    top: false,
    tier,
    next,
    fraction: Math.min(points / next.thresholdPoints, 1),
    remaining: Math.max(next.thresholdPoints - points, 0),
    markers: scheme.progressMarkers
      .filter((marker) => marker > 0 && marker < next.thresholdPoints)
      .map((marker) => ({
        points: marker,
        at: marker / next.thresholdPoints,
        reached: points >= marker,
      })),
  };
}

/** The tier discount on a price, as the platform takes it: rounded down (DV-095). */
export function tierDiscountMinor(priceMinor: number, discountPercent: number) {
  return Math.floor((priceMinor * discountPercent) / 100);
}

/** What `points` take off a booking, in tetri, as the platform values them. */
export function pointsValueMinor(points: number, pointsPerGelRedeemed: number) {
  return Math.floor((points * 100) / pointsPerGelRedeemed);
}

/**
 * The most points a booking can take: the price after the tier discount may not fall
 * below the scheme's minimum payable, the balance caps it, and the contract counts in
 * hundreds. The same arithmetic as the platform's reserve (features/booking/reserve.ts).
 */
export function maxSpendablePoints(input: {
  priceMinor: number;
  discountPercent: number;
  balance: number;
  scheme: Pick<LoyaltyScheme, "pointsPerGelRedeemed" | "minimumPayableMinor">;
}) {
  const { priceMinor, discountPercent, balance, scheme } = input;
  const discounted = priceMinor - tierDiscountMinor(priceMinor, discountPercent);
  const maximumValue = Math.max(discounted - scheme.minimumPayableMinor, 0);
  const byPrice =
    Math.floor((maximumValue * scheme.pointsPerGelRedeemed) / 100 / POINTS_STEP) * POINTS_STEP;
  const byBalance = Math.floor(Math.max(balance, 0) / POINTS_STEP) * POINTS_STEP;
  const most = Math.min(byPrice, byBalance);
  return most >= POINTS_STEP ? most : 0;
}

export type PriceBreakdown = {
  slotMinor: number;
  tierDiscountMinor: number;
  pointsMinor: number;
  totalMinor: number;
};

/** The board's price lines: the slot, the tier discount, then the points. */
export function priceBreakdown(input: {
  priceMinor: number;
  discountPercent: number;
  points: number;
  pointsPerGelRedeemed: number;
}): PriceBreakdown {
  const tier = tierDiscountMinor(input.priceMinor, input.discountPercent);
  const points = input.points > 0 ? pointsValueMinor(input.points, input.pointsPerGelRedeemed) : 0;
  return {
    slotMinor: input.priceMinor,
    tierDiscountMinor: tier,
    pointsMinor: points,
    totalMinor: input.priceMinor - tier - points,
  };
}

/**
 * One price reduction per booking: points, or a voucher (a gift code or a card prize).
 * The contract answers 422 for both, so the board never offers both at once.
 */
export function reductionLock(state: { points: number; voucher: boolean }) {
  return {
    pointsLocked: state.voucher,
    voucherLocked: state.points > 0,
  };
}

/** `/[locale]/register?ref=CODE` on the site's own origin. */
export function referralLink(origin: string, locale: string, code: string) {
  return `${origin}/${locale}/register?ref=${encodeURIComponent(code)}`;
}
