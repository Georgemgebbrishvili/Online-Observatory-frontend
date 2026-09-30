import "server-only";

import type {
  Mission,
  MissionEvent,
  PublicObservatoryStatus,
  Target,
  TonightTarget,
  ViewingConditions,
} from "@darkview/contracts";
import {
  zGetCaptureResponse,
  zGetMissionResponse,
  zGetObservatoryConditionsResponse,
  zGetObservatoryStatusResponse,
  zListMissionEventsResponse,
  zListTonightTargetsResponse,
  zMissionId,
} from "@darkview/contracts/zod";
import { cache } from "react";

import {
  entryOf,
  readCatalogue,
  readObservatories,
  type CollectionEntry,
} from "@/features/collection/read";
import { PlatformError, platformRequest } from "@/lib/platform/client";

export type Room = {
  mission: Mission;
  /** Null when the target has been disabled since, or the catalogue could not be read. */
  target: Target | null;
  /** Null when the history could not be read. */
  events: MissionEvent[] | null;
  /** Tonight's line for the target; "unreadable" when tonight's list could not be read. */
  tonight: TonightTarget | null | "unreadable";
  status: PublicObservatoryStatus | null;
  conditions: ViewingConditions | null;
  captures: CollectionEntry[];
  timezone: string;
  /** When the room was read, so the forecast hour is the hour it was read in. */
  readAt: number;
};

export type RoomResult =
  | { kind: "ok"; room: Room }
  | { kind: "not-found" }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

/** Bounds, as the dashboard bounds its reads: a mission's history and captures are short. */
const eventPages = 5;
const capturesShown = 8;

async function readEvents(missionId: string) {
  const events: MissionEvent[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < eventPages; page += 1) {
    const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const { items, page: meta } = zListMissionEventsResponse.parse(
      await platformRequest<unknown>(`/missions/${missionId}/events?limit=100${query}`),
    );
    events.push(...items);
    cursor = meta.hasMore ? (meta.nextCursor ?? null) : null;
    if (!cursor) break;
  }
  return events;
}

async function readCaptures(ids: readonly string[]) {
  const catalogue = await readCatalogue();
  const newest = ids.slice(-capturesShown).reverse();
  const entries = await Promise.all(
    newest.map((id) =>
      platformRequest<unknown>(`/captures/${encodeURIComponent(id)}`)
        .then((value) => entryOf(zGetCaptureResponse.parse(value), catalogue))
        .catch(() => null),
    ),
  );
  return entries.filter((entry) => entry !== null);
}

/**
 * GET /missions/{id} and everything the room shows around it. Only the mission itself
 * is required; every other read is lost on its own, and the room says what is missing.
 */
// cache(): generateMetadata and the page read the same mission in one request.
export const readRoom = cache(async (missionId: string): Promise<RoomResult> => {
  if (!zMissionId.safeParse(missionId).success) return { kind: "not-found" };
  const id = encodeURIComponent(missionId);

  let mission: Mission;
  try {
    mission = zGetMissionResponse.parse(
      await platformRequest<unknown>(`/missions/${id}`),
    );
  } catch (error) {
    if (error instanceof PlatformError && error.status === 404)
      return { kind: "not-found" };
    if (error instanceof PlatformError && error.status === 401)
      return { kind: "signed-out" };
    return { kind: "unreachable" };
  }

  const observatoryId = encodeURIComponent(mission.observatoryId);
  const [catalogue, observatories, events, tonight, status, conditions, captures] =
    await Promise.all([
      readCatalogue(),
      readObservatories(),
      readEvents(id).catch(() => null),
      // The mission's own observatory: another site has another sky.
      platformRequest<unknown>(`/targets/tonight?observatoryId=${observatoryId}`)
        .then((value) => zListTonightTargetsResponse.parse(value).items)
        .catch(() => null),
      platformRequest<unknown>(`/observatories/${observatoryId}/state`)
        .then((value) => zGetObservatoryStatusResponse.parse(value))
        .catch(() => null),
      platformRequest<unknown>(`/observatories/${observatoryId}/conditions`)
        .then((value) => zGetObservatoryConditionsResponse.parse(value))
        .catch(() => null),
      readCaptures(mission.captureIds ?? []),
    ]);

  return {
    kind: "ok",
    room: {
      mission,
      target: catalogue?.get(mission.targetId) ?? null,
      events,
      tonight: tonight
        ? (tonight.find((item) => item.target.id === mission.targetId) ?? null)
        : "unreadable",
      status,
      conditions,
      captures,
      timezone:
        observatories?.find((candidate) => candidate.id === mission.observatoryId)
          ?.timezone ?? "UTC",
      readAt: Date.now(),
    },
  };
});
