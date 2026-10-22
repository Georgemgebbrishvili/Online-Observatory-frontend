import "server-only";

import type { CardDraw, CardPrize, ObservatoryMode } from "@darkview/contracts";
import {
  zGetCurrentCardDrawResponse,
  zGetObservatoryStatusResponse,
  zListMyCardPrizesResponse,
} from "@darkview/contracts/zod";

import { PlatformError, platformRequest } from "@/lib/platform/client";

export type CardDrawResult =
  | { kind: "ok"; draw: CardDraw }
  /** 503: prize codes are not configured on this deployment. */
  | { kind: "not-configured" }
  /** 404: the observatory is not bookable, or not first-party. */
  | { kind: "no-observatory" }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

/**
 * GET /card-draws/current (ADR-060). The first read of the week deals the cards; every
 * later read answers the same deal, so reading on render is safe to repeat.
 */
export async function readCardDraw(observatoryId: string): Promise<CardDrawResult> {
  try {
    const draw = zGetCurrentCardDrawResponse.parse(
      await platformRequest<unknown>(
        `/card-draws/current?observatoryId=${encodeURIComponent(observatoryId)}`,
      ),
    );
    return { kind: "ok", draw };
  } catch (error) {
    if (error instanceof PlatformError) {
      if (error.status === 401) return { kind: "signed-out" };
      if (error.status === 404) return { kind: "no-observatory" };
      if (error.status === 503) return { kind: "not-configured" };
    }
    return { kind: "unreachable" };
  }
}

/** GET /prizes, newest first. Null when it cannot be read: the page then says so. */
export async function readPrizes(): Promise<CardPrize[] | null> {
  try {
    return zListMyCardPrizesResponse.parse(await platformRequest<unknown>("/prizes")).items;
  } catch {
    return null;
  }
}

/** The observatory's mode, only for the simulated notice: null when unreadable. */
export async function readObservatoryMode(observatoryId: string): Promise<ObservatoryMode | null> {
  try {
    return zGetObservatoryStatusResponse.parse(
      await platformRequest<unknown>(`/observatories/${encodeURIComponent(observatoryId)}/state`),
    ).mode;
  } catch {
    return null;
  }
}
