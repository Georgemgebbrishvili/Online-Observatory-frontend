import "server-only";

import { PlatformError, platformRequest } from "@/lib/platform/client";

export const sharedMissionStates = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
  "PROCESSING",
] as const;

export type SharedMissionState = (typeof sharedMissionStates)[number];

export type ProcessingPreset = "NATURAL" | "BRIGHT" | "DETAIL";

export type SharedMissionView = {
  id: string;
  state: SharedMissionState;
  target: {
    commonName: string;
    georgianName: string;
    catalogId: string | null;
  };
  observatory: { nameEn: string; nameKa: string };
  telescope: string;
  ownerName: string;
  initialElapsedSeconds: number;
  viewerCount: number;
  participantStatus: string | null;
  canJoin: boolean;
  canControl: boolean;
  allowSharedCaptures: boolean;
  simulated: boolean;
  captures: {
    id: string;
    thumbnailUrl: string;
    processingPreset: ProcessingPreset;
    capturedAt: string;
    canSave: boolean;
  }[];
};

export async function getSharedMissionView(missionId: string) {
  try {
    return await platformRequest<SharedMissionView>(
      `/v1/missions/${encodeURIComponent(missionId)}/shared-view`,
    );
  } catch (error) {
    if (error instanceof PlatformError && (error.status === 403 || error.status === 404)) {
      return null;
    }
    throw error;
  }
}
