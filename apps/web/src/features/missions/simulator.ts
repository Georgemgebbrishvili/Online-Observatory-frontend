import { missionTargets } from "@/features/missions/targets";

import {
  canTransitionMission,
  missionFailureStates,
  missionStates,
  transitionMission,
  type MissionSession,
  type MissionState,
} from "./domain";

export type DevelopmentMissionDefinition = {
  id: string;
  targetId: string;
  targetSlug: string;
};

export const developmentMissions: DevelopmentMissionDefinition[] = missionTargets.map(
  (target, index) => ({
    id: `DV-SIM-${String(index + 1).padStart(3, "0")}`,
    targetId: target.id,
    targetSlug: target.slug,
  }),
);

export function getDevelopmentMission(missionId: string) {
  return developmentMissions.find((mission) => mission.id === missionId);
}

export function getDevelopmentMissionForTarget(targetSlug: string) {
  return developmentMissions.find((mission) => mission.targetSlug === targetSlug);
}

const initialTimes = [
  "2026-08-25T12:28:00.000Z",
  "2026-08-25T12:29:00.000Z",
  "2026-08-25T12:30:00.000Z",
] as const;

export function createDevelopmentSession(
  definition: DevelopmentMissionDefinition,
): MissionSession {
  let session: MissionSession = {
    mission: {
      ...definition,
      observatoryId: "tbilisi-01",
      state: "REQUESTED",
      simulated: true,
      requestedAt: initialTimes[0],
      scheduledFor: "2026-08-25T12:30:00.000Z",
    },
    events: [
      {
        id: `${definition.id}-event-1`,
        missionId: definition.id,
        state: "REQUESTED",
        occurredAt: initialTimes[0],
        source: "SIMULATOR",
      },
    ],
  };

  session = transitionMission(session, "SCHEDULED", initialTimes[1], "SIMULATOR");
  return transitionMission(session, "PREPARING", initialTimes[2], "SIMULATOR");
}

export function advanceMissionSimulator(
  session: MissionSession,
  occurredAt: string,
): MissionSession {
  if (!session.mission.simulated) {
    throw new Error("Simulator cannot transition a real observatory mission");
  }

  const currentIndex = missionStates.indexOf(
    session.mission.state as (typeof missionStates)[number],
  );

  if (currentIndex < 0 || currentIndex === missionStates.length - 1) {
    return session;
  }

  return transitionMission(
    session,
    missionStates[currentIndex + 1],
    occurredAt,
    "SIMULATOR",
  );
}

export function injectSimulatorFailure(
  session: MissionSession,
  failure: (typeof missionFailureStates)[number],
  occurredAt: string,
): MissionSession {
  if (!session.mission.simulated) {
    throw new Error("Simulator cannot transition a real observatory mission");
  }

  return transitionMission(session, failure, occurredAt, "SIMULATOR");
}

export function availableSimulatorFailures(state: MissionState) {
  return missionFailureStates.filter((failure) => canTransitionMission(state, failure));
}
