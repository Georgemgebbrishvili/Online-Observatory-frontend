import { describe, expect, it } from "vitest";

import { initialLive, liveReducer, type LiveState } from "./live";
import { openingPhase, packRefund, sessionOver, watchStatus } from "./watch";

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

describe("packRefund (ADR-045)", () => {
  const pack = {
    id: "81000000-0000-4000-8000-000000000001",
    missionId,
    userId: "00000000-0000-4000-8000-000000000004",
    status: "PAID" as const,
    priceMinor: 1500,
    currency: "GEL" as const,
    createdAt: "2026-10-02T12:00:00.000Z",
  };

  it("is the refund issued, or the one owed, and nothing otherwise", () => {
    expect(packRefund({ ...pack, refundedMinor: 750 })).toEqual({
      kind: "refunded",
      minor: 750,
      currency: "GEL",
    });
    expect(packRefund({ ...pack, refundedMinor: null, refundOwedMinor: 750 })).toEqual({
      kind: "owed",
      minor: 750,
      currency: "GEL",
    });
    expect(
      packRefund({ ...pack, refundedMinor: null, refundOwedMinor: null }),
    ).toBeNull();
    expect(packRefund(null)).toBeNull();
  });

  it("says nothing for a refund of zero", () => {
    expect(packRefund({ ...pack, refundedMinor: 0 })).toBeNull();
  });
});

describe("openingPhase", () => {
  type View = Parameters<typeof openingPhase>[0];
  const base = {
    mission: { id: missionId, state: "OBSERVING", observable: true },
    observerCount: 2,
    myObserverSeat: null,
    myObserverPack: null,
  } as unknown as View;
  const paid = { status: "PAID" } as View["myObserverPack"];

  it("puts a seated observer back to watching, and an ended session first", () => {
    expect(
      openingPhase({ ...base, myObserverSeat: {} as View["myObserverSeat"] }, 5),
    ).toBe("watching");
    expect(
      openingPhase({ ...base, mission: { ...base.mission, state: "COMPLETE" } }, 5),
    ).toBe("over");
  });

  it("never sells a paid buyer their own seat again (ADR-045)", () => {
    expect(openingPhase({ ...base, myObserverPack: paid }, 5)).toBe("left");
    expect(
      openingPhase(
        {
          ...base,
          mission: { ...base.mission, observable: false },
          myObserverPack: paid,
        },
        5,
      ),
    ).toBe("closed");
  });

  it("offers a seat, or says they are taken", () => {
    expect(openingPhase(base, 5)).toBe("sale");
    expect(openingPhase({ ...base, observerCount: 5 }, 5)).toBe("full");
  });
});
