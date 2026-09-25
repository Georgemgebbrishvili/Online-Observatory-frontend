import "server-only";

import type {
  BookableObservatory,
  ObservatoryMode,
  Target,
  TonightTarget,
} from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zGetTargetResponse,
  zListBookableObservatoriesResponse,
  zListTonightTargetsResponse,
} from "@darkview/contracts/zod";
import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { PlatformError, platformRequest } from "@/lib/platform/client";

import { sortTonight } from "./present";

export type TonightObservatory = {
  name: string;
  timezone: string;
  /** From the observatory's own status. Null when the status could not be read. */
  mode: ObservatoryMode | null;
};

export type TonightResult =
  | { kind: "ok"; observatory: TonightObservatory; items: TonightTarget[] }
  | { kind: "unreachable" }
  | { kind: "no-observatory" };

export type TargetResult =
  | {
      kind: "ok";
      target: Target;
      /** Null when tonight's list could not be read: the target still stands on its own. */
      tonight: { observatory: TonightObservatory; item: TonightTarget } | null;
    }
  | { kind: "not-found" }
  | { kind: "unreachable" };

async function firstPartyObservatory(): Promise<BookableObservatory | null> {
  const { items } = zListBookableObservatoriesResponse.parse(
    await platformRequest<unknown>("/observatories"),
  );
  // Phase 1 is one first-party telescope (ADR-003).
  return items.find((candidate) => candidate.kind === "FIRST_PARTY") ?? null;
}

/**
 * GET /targets/tonight for the first-party observatory. Every target comes back,
 * observable or not, each with the platform's reasons: the page says why a target
 * cannot be observed rather than hiding it.
 */
export const readTonight = cache(async (locale: Locale): Promise<TonightResult> => {
  try {
    const observatory = await firstPartyObservatory();
    if (!observatory) return { kind: "no-observatory" };

    const id = encodeURIComponent(observatory.id);
    const [tonight, mode] = await Promise.all([
      platformRequest<unknown>(`/targets/tonight?observatoryId=${id}`).then((value) =>
        zListTonightTargetsResponse.parse(value),
      ),
      // Only for the "simulated" badge, so losing it must not lose the list.
      platformRequest<unknown>(`/observatories/${id}/state`)
        .then((value) => zGetObservatoryStatusResponse.parse(value).mode)
        .catch(() => null),
    ]);

    return {
      kind: "ok",
      observatory: {
        name: locale === "ka" ? observatory.nameKa : observatory.nameEn,
        timezone: observatory.timezone,
        mode,
      },
      items: sortTonight(tonight.items),
    };
  } catch {
    return { kind: "unreachable" };
  }
});

/** GET /targets/{slug}, which answers enabled targets only, plus its line from tonight's list. */
// cache(): generateMetadata and the page read the same target in one request.
export const readTarget = cache(
  async (slug: string, locale: Locale): Promise<TargetResult> => {
    let target: Target;
    try {
      target = zGetTargetResponse.parse(
        await platformRequest<unknown>(`/targets/${encodeURIComponent(slug)}`),
      );
    } catch (error) {
      if (error instanceof PlatformError && error.status === 404)
        return { kind: "not-found" };
      return { kind: "unreachable" };
    }

    const tonight = await readTonight(locale);
    const item =
      tonight.kind === "ok"
        ? tonight.items.find((candidate) => candidate.target.id === target.id)
        : undefined;

    return {
      kind: "ok",
      target,
      tonight:
        tonight.kind === "ok" && item ? { observatory: tonight.observatory, item } : null,
    };
  },
);
