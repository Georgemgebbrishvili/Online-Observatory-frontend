import type { BookableObservatory, SlotList } from "@darkview/contracts";

import { hasSlotAhead, nightDates } from "@/present";

import { platform } from "./api";

/** Tonight's night: the one still in progress after midnight, else today's evening. */
export async function readNight(observatory: BookableObservatory): Promise<SlotList> {
  const now = Date.now();
  const [first, second] = nightDates(now, observatory.timezone);
  const night = await platform.slots(observatory.id, first);
  if (second && !hasSlotAhead(night.items, now)) return platform.slots(observatory.id, second);
  return night;
}
