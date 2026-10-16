import "server-only";

import type {
  BookableObservatory,
  ObservatoryMode,
  Slot,
  Target,
} from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zListSlotsResponse,
} from "@darkview/contracts/zod";

import { formatPrice } from "@/components/booking/booking-night";
import { localDate, nightsFrom } from "@/features/booking/read";
import { readCatalogue, readObservatories } from "@/features/collection/read";
import type { Locale } from "@/i18n/config";
import { platformRequest } from "@/lib/platform/client";

export type NightLabel = { weekday: string; day: string; month: string; long: string; short: string };
/** A slot with its price worded, on the server, in its currency and the page's language. */
export type BoardSlot = Slot & { price: string };
export type BoardNight = { date: string; slots: BoardSlot[]; label: NightLabel };

export type BoardResult =
  | {
      kind: "ok";
      observatory: BookableObservatory;
      /** From the observatory's status, for the simulated notice. Null when unreadable. */
      mode: ObservatoryMode | null;
      /** Today and the six nights after it, each with its slots, in the observatory's calendar. */
      nights: BoardNight[];
      /** The enabled catalogue: what a session may be pointed at. */
      targets: Target[];
    }
  | { kind: "no-observatory" }
  | { kind: "unreachable" };

const halfDay = 12 * 60 * 60_000;

/**
 * The booking board (ADR-053): every night the customer may book, with its slots, read
 * in one go so the board switches nights without a round trip. The nights are the same
 * seven `readNight` offers, by the same rule: after midnight the night still in progress
 * comes first while it has a slot yet to start.
 */
export async function readBoard(
  locale: Locale,
  now = Date.now(),
  observatoryId?: string,
  startAt?: string,
): Promise<BoardResult> {
  // A calendar date, not an instant: formatted in UTC so it never shifts. Worded here, on
  // the server, so the board hydrates to the same text in both languages.
  const intl = locale === "ka" ? "ka-GE" : "en-GB";
  const dayOf = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intl, { timeZone: "UTC", ...options }).format(
      new Date(`${date}T00:00:00Z`),
    );
  const labelOf = (date: string): NightLabel => ({
    weekday: dayOf(date, { weekday: "short" }),
    day: dayOf(date, { day: "numeric" }),
    month: dayOf(date, { month: "short" }),
    long: dayOf(date, { weekday: "long", day: "numeric", month: "long" }),
    short: dayOf(date, { weekday: "short", day: "numeric", month: "short" }),
  });
  const observatories = await readObservatories();
  if (!observatories) return { kind: "unreachable" };
  const observatory = observatories.find((candidate) =>
    observatoryId ? candidate.id === observatoryId : candidate.kind === "FIRST_PARTY",
  );
  if (!observatory) return { kind: "no-observatory" };

  const id = encodeURIComponent(observatory.id);
  const readSlots = (date: string) =>
    platformRequest<unknown>(`/slots?observatoryId=${id}&date=${date}`).then(
      (value) => zListSlotsResponse.parse(value).items,
    );

  try {
    const today = localDate(now, observatory.timezone);
    const lastNight = localDate(now - halfDay, observatory.timezone);
    const inProgress =
      lastNight === today
        ? null
        : await readSlots(lastNight).then((slots) =>
            slots.some((slot) => Date.parse(slot.startAt) > now) ? slots : null,
          );
    const dates = nightsFrom(inProgress ? lastNight : today);
    // A slot named in the address (the old reserve link) may be on a later night: that
    // night joins the board so the link still lands on its slot. User input, so it is
    // looked up in `GET /slots` like any other night and never trusted on its own.
    const named = startAt ? Date.parse(startAt) : Number.NaN;
    if (!Number.isNaN(named)) {
      const namedDate = localDate(named - halfDay, observatory.timezone);
      if (!dates.includes(namedDate)) dates.push(namedDate);
      dates.sort();
    }

    const [slotsByNight, catalogue, mode] = await Promise.all([
      Promise.all(
        dates.map((date) =>
          inProgress && date === lastNight ? inProgress : readSlots(date),
        ),
      ),
      readCatalogue(),
      // Only for the simulated notice, so losing it must not lose the board.
      platformRequest<unknown>(`/observatories/${id}/state`)
        .then((value) => zGetObservatoryStatusResponse.parse(value).mode)
        .catch(() => null),
    ]);

    return {
      kind: "ok",
      observatory,
      mode,
      nights: dates.map((date, index) => ({
        date,
        slots: slotsByNight[index].map((slot) => ({
          ...slot,
          price: formatPrice(slot.priceMinor, slot.currency, locale),
        })),
        label: labelOf(date),
      })),
      targets: catalogue ? [...catalogue.values()].filter((target) => target.enabled) : [],
    };
  } catch {
    return { kind: "unreachable" };
  }
}
