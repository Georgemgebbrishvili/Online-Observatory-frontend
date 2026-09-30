import type { MissionEvent, MissionState } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { dialPoint, missionProgress, plateFor, stepOf } from "./room";

function event(state: MissionState, index: number): MissionEvent {
  return {
    id: `70000000-0000-4000-8000-00000000000${index}`,
    missionId: "20000000-0000-4000-8000-000000000001",
    at: `2026-09-23T20:0${index}:00.000Z`,
    state,
    failureReason: null,
    source: "CLOUD",
    commandId: null,
    detail: null,
  };
}

describe("the room's steps", () => {
  it("places every primary state in one step and no failure state in any", () => {
    expect(stepOf("SCHEDULED")).toBe(0);
    expect(stepOf("SLEWING")).toBe(1);
    expect(stepOf("CENTERING")).toBe(2);
    expect(stepOf("OBSERVING")).toBe(3);
    expect(stepOf("PROCESSING")).toBe(4);
    for (const state of [
      "WEATHER_HOLD",
      "NOT_VISIBLE",
      "HARDWARE_ERROR",
      "CANCELLED",
      "FAILED",
    ] as const) {
      expect(stepOf(state), state).toBeNull();
    }
  });

  it("marks the steps before, at and after the current one", () => {
    expect(missionProgress("VERIFYING", null)).toEqual([
      "done",
      "done",
      "current",
      "pending",
      "pending",
    ]);
  });

  it("marks every step done once the mission is complete", () => {
    expect(missionProgress("COMPLETE", null)).toEqual(Array(5).fill("done"));
  });

  it("stops a failed mission at the last step its history reached", () => {
    const events = [
      event("SCHEDULED", 1),
      event("SLEWING", 2),
      event("HARDWARE_ERROR", 3),
    ];
    expect(missionProgress("HARDWARE_ERROR", events)).toEqual([
      "done",
      "stopped",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("uses the last step reached, not the furthest: a hold goes back to SCHEDULED", () => {
    const events = [
      event("SCHEDULED", 1),
      event("PREPARING", 2),
      event("SLEWING", 3),
      event("WEATHER_HOLD", 4),
      event("SCHEDULED", 5),
      event("WEATHER_HOLD", 6),
    ];
    expect(missionProgress("WEATHER_HOLD", events)[0]).toBe("stopped");
  });

  it("stops at the first step when the history could not be read", () => {
    expect(missionProgress("FAILED", null)[0]).toBe("stopped");
  });
});

describe("the sky dial", () => {
  it("puts the zenith at the centre and the horizon at the rim, north up, east right", () => {
    expect(dialPoint(90, 123, 60, 70)).toEqual({ x: 70, y: 70 });
    const north = dialPoint(0, 0, 60, 70);
    expect(north?.x).toBeCloseTo(70);
    expect(north?.y).toBeCloseTo(10);
    const east = dialPoint(0, 90, 60, 70);
    expect(east?.x).toBeCloseTo(130);
    expect(east?.y).toBeCloseTo(70);
    const halfway = dialPoint(45, 180, 60, 70);
    expect(halfway?.y).toBeCloseTo(100);
  });

  it("draws nothing below the horizon", () => {
    expect(dialPoint(-3, 200, 60, 70)).toBeNull();
  });
});

describe("the plates", () => {
  it("has a plate for the four planets and none for deep-sky targets", () => {
    expect(plateFor("saturn")).toBe("/plates/saturn.webp");
    expect(plateFor("m57-ring-nebula")).toBeNull();
    expect(plateFor("m13-hercules-cluster")).toBeNull();
  });
});
