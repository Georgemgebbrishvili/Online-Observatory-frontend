import "server-only";

import type { MissionWatchView } from "@darkview/contracts";
import { zGetMissionWatchViewResponse, zMissionId } from "@darkview/contracts/zod";
import { cache } from "react";

import { PlatformError, platformRequest } from "@/lib/platform/client";

export type WatchResult =
  | { kind: "ok"; view: MissionWatchView }
  | { kind: "not-found" }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

/**
 * GET /missions/{id}/watch (ADR-034): one read for everybody allowed to watch. A mission
 * that does not exist and one that is not open to this caller are the same 404.
 */
// cache(): generateMetadata and the page read the same view in one request.
export const readWatch = cache(async (missionId: string): Promise<WatchResult> => {
  if (!zMissionId.safeParse(missionId).success) return { kind: "not-found" };
  try {
    const view = zGetMissionWatchViewResponse.parse(
      await platformRequest<unknown>(`/missions/${encodeURIComponent(missionId)}/watch`),
    );
    return { kind: "ok", view };
  } catch (error) {
    if (error instanceof PlatformError && error.status === 404)
      return { kind: "not-found" };
    if (error instanceof PlatformError && error.status === 401)
      return { kind: "signed-out" };
    return { kind: "unreachable" };
  }
});
