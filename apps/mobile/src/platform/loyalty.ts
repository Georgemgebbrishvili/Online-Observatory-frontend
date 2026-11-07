import type { LoyaltyAccount, LoyaltyScheme } from "@darkview/contracts";

/**
 * Where a member stands (clients ADR-084): top tier, or the bar to the next tier as
 * tierPoints / nextTier.thresholdPoints with the scheme's markers. The website's
 * features/loyalty/club.ts does the same sum; the app lives outside the workspaces.
 */
export function clubProgress(
  account: Pick<LoyaltyAccount, "nextTier" | "tierPoints">,
  scheme: Pick<LoyaltyScheme, "progressMarkers">,
) {
  const next = account.nextTier;
  if (!next || next.thresholdPoints <= 0) return { top: true as const };
  const points = Math.max(account.tierPoints, 0);
  return {
    top: false as const,
    next,
    fraction: Math.min(points / next.thresholdPoints, 1),
    remaining: Math.max(next.thresholdPoints - points, 0),
    markers: scheme.progressMarkers
      .filter((marker) => marker > 0 && marker < next.thresholdPoints)
      .map((marker) => ({ at: marker / next.thresholdPoints, reached: points >= marker })),
  };
}

/** Thousands with a comma, as the website prints them; Hermes lacks ka Intl data. */
export function points(value: number, signed = false) {
  const digits = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${value < 0 ? "−" : signed && value > 0 ? "+" : ""}${digits}`;
}
