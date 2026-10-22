import type { MissionChannelMessage } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { initialRoom, onRealtime, reduce, remaining, stepOf, verdictOutcome } from "./room";

const base = { messageId: "m", sentAt: "2026-10-22T14:00:00Z", missionId: "mission" };

describe("reduce", () => {
  it("drops the stream and pointing once the mission leaves the live states", () => {
    let room = initialRoom("OBSERVING");
    room = reduce(room, { ...base, type: "MISSION_STREAM", streamUrl: "/stream/mission/x?t=1", encoding: "JPEG", mode: "SIMULATED", expiresAt: "2026-10-22T14:05:00Z" } as MissionChannelMessage);
    room = reduce(room, { ...base, type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "ONLINE", pointing: { altitudeDegrees: 60, azimuthDegrees: 120 } } as MissionChannelMessage);
    expect(room.stream?.mode).toBe("SIMULATED");
    expect(room.pointing).not.toBeNull();

    room = reduce(room, { ...base, type: "MISSION_STATE", state: "COMPLETE" } as MissionChannelMessage);
    expect(room.state).toBe("COMPLETE");
    expect(room.stream).toBeNull();
    expect(room.pointing).toBeNull();
  });

  it("keeps a verdict that arrives before its 202, and counts new captures", () => {
    let room = reduce(initialRoom("OBSERVING"), { ...base, type: "MISSION_COMMAND_RESULT", commandId: "c1", status: "COMPLETED" } as MissionChannelMessage);
    room = reduce(room, { ...base, type: "MISSION_CAPTURE_READY", capture: {} } as MissionChannelMessage);
    expect(room.verdicts.c1).toEqual({ status: "COMPLETED", rejectionReason: null });
    expect(room.capturesArrived).toBe(1);
  });

  it("stops the stream on a channel error", () => {
    const room = reduce(initialRoom("OBSERVING"), { ...base, type: "MISSION_ERROR", code: "FORBIDDEN", message: "x" } as MissionChannelMessage);
    expect(room.channelError).toBe("FORBIDDEN");
    expect(room.stream).toBeNull();
  });
});

describe("rules", () => {
  it("groups states into the website's five steps", () => {
    expect(["SCHEDULED", "SLEWING", "CENTERING", "OBSERVING", "COMPLETE"].map((state) => stepOf(state as never))).toEqual([0, 1, 2, 3, 4]);
    expect(stepOf("FAILED")).toBeNull();
  });

  it("calls ACCEPTED and COMPLETED done, everything else refused", () => {
    expect(verdictOutcome("COMPLETED")).toBe("done");
    expect(verdictOutcome("REJECTED")).toBe("refused");
    expect(verdictOutcome("EXPIRED")).toBe("refused");
  });

  it("formats the time left, and nothing once it is gone", () => {
    const now = Date.parse("2026-10-22T14:00:00Z");
    expect(remaining("2026-10-22T14:29:05Z", now)).toBe("29:05");
    expect(remaining("2026-10-22T15:00:09Z", now)).toBe("1:00:09");
    expect(remaining("2026-10-22T14:00:00Z", now)).toBeNull();
  });

  it("puts the platform's channel and stream paths on the configured realtime host", () => {
    expect(onRealtime("/ws/mission/m", "https://stellar.example", "ws")).toBe("wss://stellar.example/ws/mission/m");
    expect(onRealtime("http://localhost:3000/stream/mission/m?t=abc", "http://127.0.0.1:4021", "http")).toBe(
      "http://127.0.0.1:4021/stream/mission/m?t=abc",
    );
  });
});
