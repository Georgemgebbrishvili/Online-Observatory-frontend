export const missionStates = [
  "REQUESTED",
  "SCHEDULED",
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
  "PROCESSING",
  "COMPLETE",
] as const;

export const missionFailureStates = [
  "WEATHER_HOLD",
  "NOT_VISIBLE",
  "HARDWARE_ERROR",
  "CANCELLED",
  "FAILED",
] as const;

export type MissionState =
  (typeof missionStates)[number] | (typeof missionFailureStates)[number];

export type MissionEventSource = "SIMULATOR" | "OBSERVATORY" | "SYSTEM";

export type MissionEvent = {
  id: string;
  missionId: string;
  state: MissionState;
  occurredAt: string;
  source: MissionEventSource;
};

export type Mission = {
  id: string;
  targetId: string;
  targetSlug: string;
  observatoryId: string;
  state: MissionState;
  simulated: boolean;
  requestedAt: string;
  scheduledFor: string;
};

export type MissionSession = {
  mission: Mission;
  events: MissionEvent[];
};

const interruptStates = [
  "WEATHER_HOLD",
  "NOT_VISIBLE",
  "HARDWARE_ERROR",
  "CANCELLED",
  "FAILED",
] as const;

export const allowedMissionTransitions: Record<MissionState, readonly MissionState[]> = {
  REQUESTED: ["SCHEDULED", "CANCELLED", "FAILED"],
  SCHEDULED: ["PREPARING", ...interruptStates],
  PREPARING: ["SLEWING", ...interruptStates],
  SLEWING: ["VERIFYING", ...interruptStates],
  VERIFYING: ["CENTERING", ...interruptStates],
  CENTERING: ["OBSERVING", ...interruptStates],
  OBSERVING: ["CAPTURING", ...interruptStates],
  CAPTURING: ["PROCESSING", ...interruptStates],
  PROCESSING: ["COMPLETE", "HARDWARE_ERROR", "CANCELLED", "FAILED"],
  COMPLETE: [],
  WEATHER_HOLD: ["SCHEDULED", "CANCELLED", "FAILED"],
  NOT_VISIBLE: [],
  HARDWARE_ERROR: [],
  CANCELLED: [],
  FAILED: [],
};

export function canTransitionMission(from: MissionState, to: MissionState) {
  return allowedMissionTransitions[from].includes(to);
}

export function transitionMission(
  session: MissionSession,
  nextState: MissionState,
  occurredAt: string,
  source: MissionEventSource,
): MissionSession {
  if (!canTransitionMission(session.mission.state, nextState)) {
    throw new Error(
      `Invalid mission transition: ${session.mission.state} → ${nextState}`,
    );
  }

  const event: MissionEvent = {
    id: `${session.mission.id}-event-${session.events.length + 1}`,
    missionId: session.mission.id,
    state: nextState,
    occurredAt,
    source,
  };

  return {
    mission: { ...session.mission, state: nextState },
    events: [...session.events, event],
  };
}
