import "server-only";

import type { PublicObservatoryStatus, Tonight } from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zGetTonightResponse,
  zListBookableObservatoriesResponse,
} from "@darkview/contracts/zod";

import { platformRequest } from "@/lib/platform/client";

export type TonightResult =
  | { kind: "ok"; tonight: Tonight; status: PublicObservatoryStatus | null }
  | { kind: "unreachable" };

/**
 * Clients ADR-066: the session open to anyone, and, when there is none, the first-party
 * observatory's status, so the page can say offline or weather hold rather than only
 * "nothing". The status is advisory here: losing it keeps the page.
 */
export async function readTonight(): Promise<TonightResult> {
  let tonight: Tonight;
  try {
    tonight = zGetTonightResponse.parse(await platformRequest<unknown>("/tonight"));
  } catch {
    return { kind: "unreachable" };
  }

  const status = await platformRequest<unknown>("/observatories")
    .then((value) => zListBookableObservatoriesResponse.parse(value).items)
    .then((items) => {
      const id =
        tonight.live?.observatoryId ??
        items.find((item) => item.kind === "FIRST_PARTY")?.id;
      return id
        ? platformRequest<unknown>(`/observatories/${encodeURIComponent(id)}/state`)
        : Promise.reject(new Error("no observatory"));
    })
    .then((value) => zGetObservatoryStatusResponse.parse(value))
    .catch(() => null);

  return { kind: "ok", tonight, status };
}
