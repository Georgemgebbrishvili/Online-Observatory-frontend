import type { Mission } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { activeMission } from "./active";

const now = Date.parse("2026-09-26T18:00:00Z");
const minutes = (count: number) => new Date(now + count * 60_000).toISOString();

function mission(id: string, overrides: Partial<Mission>): Mission {
  return {
    id,
    userId: "00000000-0000-4000-8000-000000000001",
    bookingId: null,
    targetId: "30000000-0000-4000-8000-000000000006",
    observatoryId: "10000000-0000-4000-8000-000000000001",
    state: "SCHEDULED",
    failureReason: null,
    mode: "SIMULATED",
    scheduledStartAt: null,
    requestedAt: "2026-09-20T12:00:00.000Z",
    startedAt: null,
    endedAt: null,
    captureIds: [],
    observable: false,
    ...overrides,
  } as Mission;
}

describe("activeMission", () => {
  it("opens a live mission before any scheduled one", () => {
    const soon = mission("soon", { scheduledStartAt: minutes(10) });
    const live = mission("live", { state: "OBSERVING", scheduledStartAt: minutes(-5) });
    expect(activeMission([soon, live], now)?.id).toBe("live");
  });

  it("keeps a weather hold in the room, where it may resume", () => {
    expect(activeMission([mission("held", { state: "WEATHER_HOLD" })], now)?.id).toBe(
      "held",
    );
  });

  it("opens the nearest scheduled mission from an hour before until a slot after", () => {
    const later = mission("later", { scheduledStartAt: minutes(50) });
    const sooner = mission("sooner", { scheduledStartAt: minutes(20) });
    expect(activeMission([later, sooner], now)?.id).toBe("sooner");
    expect(
      activeMission([mission("started", { scheduledStartAt: minutes(-29) })], now)?.id,
    ).toBe("started");
  });

  it("sends anyone else to booking", () => {
    expect(
      activeMission(
        [
          mission("tomorrow", { scheduledStartAt: minutes(61) }),
          mission("missed", { scheduledStartAt: minutes(-30) }),
          mission("done", { state: "COMPLETE" }),
          mission("failed", { state: "HARDWARE_ERROR" }),
          mission("unscheduled", { scheduledStartAt: null }),
        ],
        now,
      ),
    ).toBeNull();
    expect(activeMission([], now)).toBeNull();
  });
});
