import "server-only";

import type { LoyaltyScheme } from "@darkview/contracts";
import { zGetLoyaltySchemeResponse } from "@darkview/contracts/zod";

import { formatPrice } from "@/components/booking/booking-night";
import { readBoard } from "@/features/booking/board";
import type { Locale } from "@/i18n/config";
import { platformRequest } from "@/lib/platform/client";

export type PricingSlot = { startAt: string; price: string; durationMinutes: number };

export type PricingFacts = {
  /** The slot price and length as the platform sells them, from the board's next open slot. */
  slot: {
    price: string;
    durationMinutes: number;
    /** The price with the entry tier's discount, which every account starts in. */
    memberPrice: string | null;
    perMinute: string;
    /** ADR-075: what a few lengths cost at the same rate per minute (ADR-072). */
    lengths: { minutes: number; price: string }[];
  } | null;
  /** Open slots tonight (or the next night with any), for the "tonight" panel. */
  tonight: {
    date: string;
    label: string;
    isToday: boolean;
    slots: PricingSlot[];
    timezone: string;
  } | null;
  openThisWeek: number;
  /** False when the platform could not be read, so the page says so instead of "no slots". */
  reachable: boolean;
  loyalty: LoyaltyScheme | null;
};

/**
 * Everything the pricing page says about money, read from the platform: the slot price
 * from `GET /slots` (through the booking board's read) and the club from
 * `GET /loyalty/scheme`. The page states no amount of its own; when the platform cannot
 * be read it falls back to words.
 */
export async function readPricing(locale: Locale, now = Date.now()): Promise<PricingFacts> {
  const [board, loyalty] = await Promise.all([
    readBoard(locale, now),
    platformRequest<unknown>("/loyalty/scheme")
      .then((value) => zGetLoyaltySchemeResponse.parse(value))
      .catch(() => null),
  ]);

  if (board.kind !== "ok") {
    return { slot: null, tonight: null, openThisWeek: 0, reachable: false, loyalty };
  }

  const open = (slot: { available: boolean }) => slot.available;
  const nights = board.nights.map((night) => ({ ...night, slots: night.slots.filter(open) }));
  const first = nights.flatMap((night) => night.slots)[0];
  const night = nights.find((candidate) => candidate.slots.length > 0) ?? null;

  const entry = loyalty?.tiers
    .filter((tier) => tier.thresholdPoints === 0)
    .sort((left, right) => right.discountPercent - left.discountPercent)[0];

  return {
    slot: first
      ? {
          price: first.price,
          durationMinutes: first.durationMinutes,
          memberPrice:
            entry && entry.discountPercent > 0
              ? formatPrice(
                  first.priceMinor - Math.floor((first.priceMinor * entry.discountPercent) / 100),
                  first.currency,
                  locale,
                )
              : null,
          perMinute: formatPrice(
            Math.round(first.priceMinor / first.durationMinutes),
            first.currency,
            locale,
          ),
          // The platform's rule (ADR-072): whole tetri, rounded down, by the minute.
          lengths: [15, 30, 60, 120].map((minutes) => ({
            minutes,
            price: formatPrice(
              Math.floor((first.priceMinor * minutes) / first.durationMinutes),
              first.currency,
              locale,
            ),
          })),
        }
      : null,
    tonight: night
      ? {
          date: night.date,
          label: night.label.long,
          isToday: night.date === nights[0]?.date,
          timezone: board.observatory.timezone,
          slots: night.slots.map(({ startAt, price, durationMinutes }) => ({
            startAt,
            price,
            durationMinutes,
          })),
        }
      : null,
    openThisWeek: nights.reduce((total, candidate) => total + candidate.slots.length, 0),
    reachable: true,
    loyalty,
  };
}
