import type {
  BookableObservatory,
  MissionEvent,
  MissionState,
  Target,
} from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { roomCopy } from "@/i18n/resources/room";

import { dialPoint, feedPlates, missionProgress, plateFor, stepOf } from "./room";

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

describe("feedPlates", () => {
  const observatory: BookableObservatory = {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "tbilisi",
    kind: "FIRST_PARTY",
    nameEn: "Tbilisi Observatory",
    nameKa: "თბილისის ობსერვატორია",
    city: "Tbilisi",
    countryCode: "GE",
    timezone: "Asia/Tbilisi",
    telescope: {
      manufacturer: "Celestron",
      model: "NexStar 6SE",
      apertureMm: 150,
      focalLengthMm: 1500,
    },
  };
  const m13 = {
    nameEn: "Hercules Cluster",
    nameKa: "ჰერკულესის გროვა",
    opticalConfig: "F10_NATIVE",
    coordinates: { raHours: 16.695, decDegrees: 36.4613, epoch: "J2000" },
  } as Target;

  it("names the first-party camera and the target's optics, and a fixed target's RA/Dec", () => {
    expect(feedPlates(observatory, m13, "en", roomCopy.en.feed)).toEqual({
      instrument: ["Tbilisi Observatory", "ZWO ASI585MC · 1500 mm · f/10"],
      subject: { name: "Hercules Cluster", coordinates: "16h 41m 42s / +36° 27′ 41″" },
    });
  });

  it("names only a partner's published telescope, and invents nothing it lacks", () => {
    const partner = { ...observatory, kind: "PARTNER" } as const;
    const saturn = { ...m13, nameEn: "Saturn", coordinates: null } as Target;
    expect(feedPlates(partner, saturn, "en", roomCopy.en.feed)).toEqual({
      instrument: ["Tbilisi Observatory", "Celestron NexStar 6SE"],
      subject: { name: "Saturn", coordinates: null },
    });
    expect(feedPlates(null, null, "ka", roomCopy.ka.feed)).toEqual({
      instrument: null,
      subject: null,
    });
  });
});
