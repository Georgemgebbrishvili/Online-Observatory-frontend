import { describe, expect, it } from "vitest";

import { initialLive, liveReducer, type LiveState } from "./live";
import { sessionOver, watchStatus } from "./watch";

const missionId = "23000000-0000-4000-8000-000000000004";
const header = {
  messageId: "70000000-0000-4000-8000-000000000001",
  sentAt: "2026-10-02T12:00:00.000Z",
  missionId,
};

function telemetry(link: "ONLINE" | "OFFLINE") {
  return {
    type: "MISSION_TELEMETRY",
    ...header,
    mode: "SIMULATED",
    link,
    tracking: link === "ONLINE",
    centeringIteration: null,
    residualArcminutes: null,
    nudgeUsedDegrees: null,
    ambientTemperatureC: null,
    pointing: null,
  } as const;
}

const stream = {
  type: "MISSION_STREAM",
  ...header,
  streamUrl: `http://localhost:3100/stream/mission/${missionId}?t=signed`,
  encoding: "JPEG",
  mode: "SIMULATED",
  expiresAt: "2026-10-02T12:05:00.000Z",
} as const;

function apply(state: LiveState, ...events: Parameters<typeof liveReducer>[1][]) {
  return events.reduce(liveReducer, state);
}

describe("watchStatus", () => {
  const observing = initialLive("OBSERVING", null);

  it("connects with no session to start, then shows the stream", () => {
    expect(watchStatus(observing)).toBe("connecting");
    const open = apply(observing, { type: "socket-open" });
    expect(watchStatus(open)).toBe("connecting");
    expect(watchStatus(apply(open, { type: "message", message: stream }))).toBe("live");
  });

  it("puts a weather hold, an end, an offline agent and a dropped channel first, in that order", () => {
    const live = apply(
      observing,
      { type: "socket-open" },
      { type: "message", message: stream },
    );
    expect(watchStatus(apply(live, { type: "socket-lost" }))).toBe("reconnecting");
    expect(
      watchStatus(apply(live, { type: "message", message: telemetry("OFFLINE") })),
    ).toBe("offline");
    expect(watchStatus(initialLive("WEATHER_HOLD", null))).toBe("hold");
    expect(watchStatus(initialLive("COMPLETE", null))).toBe("ended");
    expect(watchStatus(initialLive("CANCELLED", "CUSTOMER_CANCELLED"))).toBe("ended");
  });
});

describe("sessionOver", () => {
  it("keeps the live states, a weather hold and a scheduled mission as sessions", () => {
    for (const state of [
      "SCHEDULED",
      "WEATHER_HOLD",
      "SLEWING",
      "OBSERVING",
      "CAPTURING",
    ] as const)
      expect(sessionOver(state)).toBe(false);
    for (const state of ["PROCESSING", "COMPLETE", "FAILED", "HARDWARE_ERROR"] as const)
      expect(sessionOver(state)).toBe(true);
  });
});
