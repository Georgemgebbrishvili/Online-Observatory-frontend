import "server-only";

import type {
  BookableObservatory,
  ObservatoryMode,
  Slot,
  SlotTarget,
} from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zListSlotTargetsResponse,
  zListSlotsResponse,
} from "@darkview/contracts/zod";

import { localDate } from "@/features/booking/read";
import { readObservatories } from "@/features/collection/read";
import { platformRequest } from "@/lib/platform/client";

export type SlotOffer = {
  observatory: BookableObservatory;
  mode: ObservatoryMode | null;
  slot: Slot;
  /** The night the slot belongs to, as `GET /slots` names it: for the way back. */
  date: string;
  /** Observable across the whole slot and short enough for it: these may be booked. */
  offered: SlotTarget[];
  /** Everything else, each with why not. */
  withheld: SlotTarget[];
};

export type OfferResult =
  | { kind: "ok"; offer: SlotOffer }
  | { kind: "not-offered"; date: string | null }
  | { kind: "unreachable" };

const halfDay = 12 * 60 * 60_000;

/** Whether a target can be booked for a slot, by the two rules `createBooking` applies. */
export function bookable({ target, visibility }: SlotTarget, durationMinutes: number) {
  return visibility.observable && target.expectedMissionMinutes <= durationMinutes;
}

/**
 * One slot on the first-party observatory (ADR-003), with what it can deliver.
 *
 * `startAt` is user input: it is looked up in `GET /slots` for its night, and a slot
 * the platform does not list there, or lists as unavailable, is not offered.
 */
export async function readOffer(startAt: string | undefined): Promise<OfferResult> {
  const at = startAt ? Date.parse(startAt) : Number.NaN;
  if (Number.isNaN(at)) return { kind: "not-offered", date: null };

  const observatories = await readObservatories();
  if (!observatories) return { kind: "unreachable" };
  const observatory = observatories.find((candidate) => candidate.kind === "FIRST_PARTY");
  if (!observatory) return { kind: "not-offered", date: null };

  const id = encodeURIComponent(observatory.id);
  // A night is named by the date its evening falls on: a slot after midnight is the
  // previous date's.
  const date = localDate(at - halfDay, observatory.timezone);

  try {
    const slots = zListSlotsResponse.parse(
      await platformRequest<unknown>(`/slots?observatoryId=${id}&date=${date}`),
    );
    const slot = slots.items.find((candidate) => Date.parse(candidate.startAt) === at);
    if (!slot?.available) return { kind: "not-offered", date };

    const [targets, mode] = await Promise.all([
      platformRequest<unknown>(
        `/targets/visibility?observatoryId=${id}&startAt=${encodeURIComponent(
          slot.startAt,
        )}&durationMinutes=${slot.durationMinutes}`,
      ).then((value) => zListSlotTargetsResponse.parse(value)),
      // Only for the simulated notice, so losing it must not lose the slot.
      platformRequest<unknown>(`/observatories/${id}/state`)
        .then((value) => zGetObservatoryStatusResponse.parse(value).mode)
        .catch(() => null),
    ]);

    return {
      kind: "ok",
      offer: {
        observatory,
        mode,
        slot,
        date,
        offered: targets.items.filter((item) => bookable(item, slot.durationMinutes)),
        withheld: targets.items.filter((item) => !bookable(item, slot.durationMinutes)),
      },
    };
  } catch {
    return { kind: "unreachable" };
  }
}
