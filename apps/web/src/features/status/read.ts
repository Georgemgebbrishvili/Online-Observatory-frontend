import "server-only";

import type { PublicObservatoryStatus, ViewingConditions } from "@darkview/contracts";
import {
  zGetObservatoryConditionsResponse,
  zGetObservatoryStatusResponse,
  zListBookableObservatoriesResponse,
} from "@darkview/contracts/zod";

import type { Locale } from "@/i18n/config";
import { platformRequest } from "@/lib/platform/client";

export type StatusReading = {
  observatoryName: string;
  timezone: string;
  status: PublicObservatoryStatus;
  /** Null when the forecast could not be read. It is advisory, so the page still works. */
  conditions: ViewingConditions | null;
  /** When the reading was taken, so every age on the page is measured from it. */
  readAt: number;
};

/**
 * `unreachable` and `no-observatory` are different things a visitor deserves told
 * apart, and neither is ever answered with an older reading: a status page that
 * shows a stale value as current is worse than one that shows nothing.
 */
export type StatusResult =
  | { kind: "ok"; reading: StatusReading }
  | { kind: "unreachable" }
  | { kind: "no-observatory" };

export async function readStatus(locale: Locale): Promise<StatusResult> {
  try {
    const { items } = zListBookableObservatoriesResponse.parse(
      await platformRequest<unknown>("/observatories"),
    );
    // Phase 1 is one first-party telescope (ADR-003).
    const observatory = items.find((candidate) => candidate.kind === "FIRST_PARTY");
    if (!observatory) return { kind: "no-observatory" };

    const id = encodeURIComponent(observatory.id);
    const status = zGetObservatoryStatusResponse.parse(
      await platformRequest<unknown>(`/observatories/${id}/state`),
    );
    // DV-110: conditions are advisory, so losing them must not lose the page.
    const conditions = await platformRequest<unknown>(`/observatories/${id}/conditions`)
      .then((value) => zGetObservatoryConditionsResponse.parse(value))
      .catch(() => null);

    return {
      kind: "ok",
      reading: {
        observatoryName: locale === "ka" ? observatory.nameKa : observatory.nameEn,
        timezone: observatory.timezone,
        status,
        conditions,
        readAt: Date.now(),
      },
    };
  } catch {
    return { kind: "unreachable" };
  }
}
