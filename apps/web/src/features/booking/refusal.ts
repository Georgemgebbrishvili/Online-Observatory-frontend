import type { VisibilityBlockReason } from "@darkview/contracts";
import { zVisibilityBlockReason } from "@darkview/contracts/zod";

import type { ReserveFormCopy } from "@/i18n/resources/reserve";
import { ApiRequestError } from "@/lib/platform/browser";

export type Refusal = {
  message: string;
  /** The slot went to somebody else (409): take it off the board and read the night again. */
  slotGone: boolean;
  /** The target is not up across the slot (422): read the slot's sky again. */
  skyChanged: boolean;
};

/**
 * What a refused `createBooking` tells the customer. A 422 TARGET_NOT_OBSERVABLE names
 * its reasons in `details.blockReasons`; a reason this client does not know is left out
 * rather than shown raw.
 */
export function readRefusal(
  error: unknown,
  copy: ReserveFormCopy,
  reasons: Record<VisibilityBlockReason, string>,
): Refusal {
  const code = error instanceof ApiRequestError ? error.error?.code : undefined;
  if (code === "SLOT_UNAVAILABLE" || code === "CONFLICT")
    return { message: copy.taken, slotGone: true, skyChanged: false };
  if (code === "WEATHER_HOLD")
    return { message: copy.weatherHold, slotGone: false, skyChanged: false };
  if (code === "OBSERVATORY_OFFLINE")
    return { message: copy.offline, slotGone: false, skyChanged: false };
  if (code === "TARGET_NOT_OBSERVABLE") {
    const raw = (error as ApiRequestError).error?.details?.blockReasons;
    const known = (Array.isArray(raw) ? raw : []).flatMap((reason) => {
      const parsed = zVisibilityBlockReason.safeParse(reason);
      return parsed.success ? [reasons[parsed.data]] : [];
    });
    return {
      message: known.length
        ? copy.notObservableBecause.replace("{reasons}", [...new Set(known)].join(", "))
        : copy.notObservable,
      slotGone: false,
      skyChanged: true,
    };
  }
  return { message: copy.failed, slotGone: false, skyChanged: false };
}
