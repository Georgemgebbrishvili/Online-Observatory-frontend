import "server-only";

import type {
  BookableObservatory,
  Mission,
  PublicObservatoryStatus,
  Target,
} from "@darkview/contracts";
import {
  zGetObservatoryStatusResponse,
  zListMissionsResponse,
} from "@darkview/contracts/zod";

import { readCatalogue, readObservatories } from "@/features/collection/read";
import { PlatformError, platformRequest } from "@/lib/platform/client";

export type ObservatoryPanelResult =
  | { kind: "ok"; observatory: BookableObservatory; status: PublicObservatoryStatus }
  | { kind: "no-observatory" }
  | { kind: "unreachable" };

export type UpcomingMission = { mission: Mission; target: Target | null };

export type UpcomingResult =
  | { kind: "ok"; items: UpcomingMission[] }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

/** The first-party observatory and its public status (ADR-003: Phase 1 is one telescope). */
export async function readObservatoryPanel(): Promise<ObservatoryPanelResult> {
  const observatories = await readObservatories();
  if (!observatories) return { kind: "unreachable" };
  const observatory = observatories.find((candidate) => candidate.kind === "FIRST_PARTY");
  if (!observatory) return { kind: "no-observatory" };

  try {
    const status = zGetObservatoryStatusResponse.parse(
      await platformRequest<unknown>(
        `/observatories/${encodeURIComponent(observatory.id)}/state`,
      ),
    );
    return { kind: "ok", observatory, status };
  } catch {
    return { kind: "unreachable" };
  }
}

/**
 * The caller's scheduled missions still ahead, soonest first. `GET /missions` is
 * ordered by requestedAt (features/missions/mine.ts), not by start, so every page is
 * read and filtered here -- bounded, as the catalogue is.
 */
export async function readUpcoming(now = Date.now(), count = 3): Promise<UpcomingResult> {
  const missions: Mission[] = [];
  let cursor: string | null = null;
  try {
    for (let page = 0; page < 20; page += 1) {
      const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const { items, page: meta } = zListMissionsResponse.parse(
        await platformRequest<unknown>(`/missions?limit=100${query}`),
      );
      missions.push(...items);
      cursor = meta.hasMore ? (meta.nextCursor ?? null) : null;
      if (!cursor) break;
    }
  } catch (error) {
    return error instanceof PlatformError && error.status === 401
      ? { kind: "signed-out" }
      : { kind: "unreachable" };
  }

  const upcoming = missions
    .filter(
      (mission) =>
        mission.state === "SCHEDULED" &&
        mission.scheduledStartAt &&
        Date.parse(mission.scheduledStartAt) > now,
    )
    .sort(
      (left, right) =>
        Date.parse(left.scheduledStartAt ?? "") -
        Date.parse(right.scheduledStartAt ?? ""),
    )
    .slice(0, count);

  const catalogue = await readCatalogue();
  return {
    kind: "ok",
    items: upcoming.map((mission) => ({
      mission,
      target: catalogue?.get(mission.targetId) ?? null,
    })),
  };
}
