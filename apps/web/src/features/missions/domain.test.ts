import { describe, expect, it } from "vitest";

import {
  canTransitionMission,
  missionFailureStates,
  missionStates,
  transitionMission,
  type MissionSession,
} from "./domain";
import {
  advanceMissionSimulator,
  createDevelopmentSession,
  developmentMissions,
  injectSimulatorFailure,
} from "./simulator";

describe("mission state machine", () => {
  it("contains every operational and failure state", () => {
    expect(missionStates).toEqual([
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
    ]);
    expect(missionFailureStates).toEqual([
      "WEATHER_HOLD",
      "NOT_VISIBLE",
      "HARDWARE_ERROR",
      "CANCELLED",
      "FAILED",
    ]);
  });

  it("permits the nominal sequence and rejects skipped states", () => {
    expect(canTransitionMission("PREPARING", "SLEWING")).toBe(true);
    expect(canTransitionMission("PREPARING", "OBSERVING")).toBe(false);

    const session = createDevelopmentSession(developmentMissions[0]);
    expect(() =>
      transitionMission(session, "OBSERVING", "2026-08-25T18:41:00.000Z", "SYSTEM"),
    ).toThrow("Invalid mission transition");
  });

  it("records simulator transitions as immutable events", () => {
    const session = createDevelopmentSession(developmentMissions[0]);
    const advanced = advanceMissionSimulator(session, "2026-08-25T18:41:00.000Z");

    expect(session.mission.state).toBe("PREPARING");
    expect(advanced.mission.state).toBe("SLEWING");
    expect(advanced.events).toHaveLength(session.events.length + 1);
    expect(advanced.events.at(-1)).toMatchObject({
      state: "SLEWING",
      source: "SIMULATOR",
    });
  });

  it("keeps simulator actions away from real missions", () => {
    const simulated = createDevelopmentSession(developmentMissions[0]);
    const realSession: MissionSession = {
      ...simulated,
      mission: { ...simulated.mission, simulated: false },
    };

    expect(() =>
      advanceMissionSimulator(realSession, "2026-08-25T18:41:00.000Z"),
    ).toThrow("Simulator cannot transition a real observatory mission");
    expect(() =>
      injectSimulatorFailure(realSession, "WEATHER_HOLD", "2026-08-25T18:41:00.000Z"),
    ).toThrow("Simulator cannot transition a real observatory mission");
  });
});
