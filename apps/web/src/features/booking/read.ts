import "server-only";

import type { BookableObservatory, ObservatoryMode, Slot } from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zListSlotsResponse,
} from "@darkview/contracts/zod";

import { readObservatories } from "@/features/collection/read";
import { platformRequest } from "@/lib/platform/client";

export type NightResult =
  | {
      kind: "ok";
      observatory: BookableObservatory;
      /** From the observatory's status, for the simulated notice. Null when unreadable. */
      mode: ObservatoryMode | null;
      date: string;
      /** Today and the six nights after it, in the observatory's own calendar. */
      nights: string[];
      slots: Slot[];
    }
  | { kind: "no-observatory" }
  | { kind: "unreachable" };

const nightsShown = 7;

/** YYYY-MM-DD for an instant, in a time zone: the date `GET /slots` means. */
export function localDate(at: number, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  }).format(new Date(at));
}

/** The next `count` calendar dates from `first`, by date arithmetic, not by clock. */
export function nightsFrom(first: string, count = nightsShown) {
  const [year, month, day] = first.split("-").map(Number);
  return Array.from({ length: count }, (_, offset) =>
    new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10),
  );
}

const halfDay = 12 * 60 * 60_000;

/**
 * GET /slots for one night on the first-party observatory (ADR-003), or on
 * `observatoryId` when a reschedule names the booking's own. A requested date
 * outside the seven nights shown is ignored rather than sent: it is user input.
 *
 * `GET /slots` names a night by the date its evening falls on, so after midnight the
 * night still in progress is yesterday's date. Before local noon, that night comes
 * first for as long as it has a slot yet to start.
 */
export async function readNight(
  requested: string | undefined,
  now = Date.now(),
  observatoryId?: string,
): Promise<NightResult> {
  const observatories = await readObservatories();
  if (!observatories) return { kind: "unreachable" };
  const observatory = observatories.find((candidate) =>
    observatoryId ? candidate.id === observatoryId : candidate.kind === "FIRST_PARTY",
  );
  if (!observatory) return { kind: "no-observatory" };

  const id = encodeURIComponent(observatory.id);
  const readSlots = (date: string) =>
    platformRequest<unknown>(`/slots?observatoryId=${id}&date=${date}`).then((value) =>
      zListSlotsResponse.parse(value),
    );

  try {
    const today = localDate(now, observatory.timezone);
    const lastNight = localDate(now - halfDay, observatory.timezone);
    const inProgress =
      lastNight === today
        ? null
        : await readSlots(lastNight).then((list) =>
            list.items.some((slot) => Date.parse(slot.startAt) > now) ? list : null,
          );

    const nights = nightsFrom(inProgress ? lastNight : today);
    const date = requested && nights.includes(requested) ? requested : nights[0];

    const [list, mode] = await Promise.all([
      inProgress && date === lastNight ? inProgress : readSlots(date),
      // Only for the simulated notice, so losing it must not lose the night.
      platformRequest<unknown>(`/observatories/${id}/state`)
        .then((value) => zGetObservatoryStatusResponse.parse(value).mode)
        .catch(() => null),
    ]);
    return { kind: "ok", observatory, mode, date, nights, slots: list.items };
  } catch {
    return { kind: "unreachable" };
  }
}
