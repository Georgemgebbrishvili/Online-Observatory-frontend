import type {
  ErrorCode,
  MissionChannelMessage,
  MissionSession,
} from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import {
  channelUrl,
  initialLive,
  liveAction,
  liveReducer,
  liveStatus,
  parseChannelMessage,
  reconnectDelay,
  timeLeft,
  type LiveEvent,
  type LiveState,
} from "./live";

const missionId = "20000000-0000-4000-8000-000000000001";
const session: MissionSession = {
  sessionId: "70000000-0000-4000-8000-000000000001",
  missionId,
  userId: "00000000-0000-4000-8000-000000000001",
  issuedAt: "2026-09-28T10:00:00.000Z",
  expiresAt: "2026-09-28T10:30:00.000Z",
  missionChannelUrl: `/ws/mission/${missionId}`,
  allowedCommands: ["NUDGE", "CAPTURE", "RECENTER", "ABORT"],
};
const header = {
  messageId: "80000000-0000-4000-8000-000000000001",
  sentAt: "2026-09-28T10:00:01.000Z",
};

function message(body: Record<string, unknown>): LiveEvent {
  return {
    type: "message",
    message: { ...header, missionId, ...body } as MissionChannelMessage,
  };
}

function run(state: LiveState, ...events: LiveEvent[]) {
  return events.reduce(liveReducer, state);
}

const observing = initialLive("OBSERVING", null);
const scheduled = initialLive("SCHEDULED", null);
const streamOffer = message({
  type: "MISSION_STREAM",
  streamUrl: `http://localhost:3000/stream/mission/${missionId}?t=signed`,
  encoding: "JPEG",
  mode: "SIMULATED",
  expiresAt: "2026-09-28T10:05:00.000Z",
});

describe("the live feed's status", () => {
  it("waits for the customer on a scheduled mission, and offers the start", () => {
    expect(liveStatus(scheduled)).toBe("not-started");
    expect(liveAction(scheduled)).toBe("start");
  });

  it("goes from starting to connecting to live", () => {
    const starting = run(observing, { type: "start" });
    expect(liveStatus(starting)).toBe("starting");
    expect(liveAction(starting)).toBeNull();

    const connecting = run(
      starting,
      { type: "started", session },
      { type: "socket-open" },
    );
    expect(liveStatus(connecting)).toBe("connecting");

    const live = run(connecting, streamOffer);
    expect(liveStatus(live)).toBe("live");
    expect(live.stream).toEqual({
      url: `http://localhost:3000/stream/mission/${missionId}?t=signed`,
      mode: "SIMULATED",
      expiresAt: "2026-09-28T10:05:00.000Z",
    });
  });

  it("says it is reconnecting when the channel drops, and recovers on reopening", () => {
    const live = run(
      observing,
      { type: "started", session },
      { type: "socket-open" },
      streamOffer,
    );
    const lost = run(live, { type: "socket-lost" });
    expect(liveStatus(lost)).toBe("reconnecting");
    expect(liveStatus(run(lost, { type: "socket-open" }))).toBe("live");
  });

  it("follows the agent's link: offline, then back", () => {
    const held = run(observing, { type: "started", session }, { type: "socket-open" });
    const offline = run(
      held,
      message({ type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "OFFLINE" }),
    );
    expect(liveStatus(offline)).toBe("offline");
    // Nothing to retry: the session is held and the link comes back by itself.
    expect(liveAction(offline)).toBeNull();
    const online = run(
      offline,
      message({ type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "ONLINE" }),
    );
    expect(liveStatus(online)).toBe("connecting");
  });

  it("shows a weather hold from the channel, and drops the stream when the mission stops", () => {
    const live = run(observing, { type: "started", session }, streamOffer);
    const hold = run(
      live,
      message({
        type: "MISSION_STATE",
        state: "WEATHER_HOLD",
        failureReason: "WEATHER_UNSAFE",
        remainingSeconds: null,
      }),
    );
    expect(liveStatus(hold)).toBe("hold");
    expect(hold.failureReason).toBe("WEATHER_UNSAFE");
    expect(liveAction(hold)).toBeNull();

    const failed = run(
      live,
      message({
        type: "MISSION_STATE",
        state: "HARDWARE_ERROR",
        failureReason: "MOUNT_FAULT",
        remainingSeconds: null,
      }),
    );
    expect(liveStatus(failed)).toBe("ended");
    expect(failed.stream).toBeNull();
    expect(failed.seen).toEqual(["HARDWARE_ERROR"]);
  });

  it("ends the session at its expiresAt", () => {
    const live = run(observing, { type: "started", session }, streamOffer);
    const expired = run(live, { type: "expired" }, { type: "socket-lost" });
    expect(liveStatus(expired)).toBe("expired");
    expect(expired.stream).toBeNull();
  });

  it("maps each start refusal to what the customer can do about it", () => {
    const refused = (code: ErrorCode | null) =>
      run(scheduled, { type: "start" }, { type: "start-failed", code });
    expect(liveStatus(refused("OBSERVATORY_OFFLINE"))).toBe("offline");
    expect(liveStatus(refused("WEATHER_HOLD"))).toBe("hold");
    expect(liveStatus(refused(null))).toBe("error");
    expect(liveStatus(refused("RATE_LIMITED"))).toBe("error");
    expect(liveStatus(refused("SAFETY_REFUSED"))).toBe("refused");

    // A scheduled mission's retry is the start itself; a final refusal offers nothing.
    expect(liveAction(refused("SAFETY_REFUSED"))).toBe("start");
    expect(liveAction(refused("SAFETY_NOT_CONFIGURED"))).toBeNull();
    const live = run(
      observing,
      { type: "start" },
      { type: "start-failed", code: "INTERNAL" },
    );
    expect(liveAction(live)).toBe("retry");
  });

  it("offers to watch here when another tab holds the session", () => {
    const held = run(observing, { type: "started", session }, { type: "socket-open" });
    const forbidden = run(
      held,
      message({ type: "MISSION_ERROR", code: "FORBIDDEN", message: "No." }),
      {
        type: "socket-lost",
      },
    );
    expect(liveStatus(forbidden)).toBe("refused");
    expect(liveAction(forbidden)).toBe("reopen");
  });

  it("closes the view for a mission past its live states", () => {
    expect(liveStatus(initialLive("COMPLETE", null))).toBe("ended");
    expect(liveStatus(initialLive("PROCESSING", null))).toBe("ended");
    expect(liveStatus(initialLive("WEATHER_HOLD", "WEATHER_UNSAFE"))).toBe("hold");
  });
});

describe("the mission channel", () => {
  it("accepts only what the contract's validator accepts", () => {
    const valid = {
      type: "MISSION_STATE",
      ...header,
      missionId,
      state: "OBSERVING",
      failureReason: null,
      remainingSeconds: null,
    };
    expect(parseChannelMessage(JSON.stringify(valid))).toEqual(valid);
    expect(
      parseChannelMessage(JSON.stringify({ ...valid, state: "DANCING" })),
    ).toBeNull();
    expect(
      parseChannelMessage(JSON.stringify({ ...valid, pointing: { alt: 40 } })),
    ).toBeNull();
    expect(parseChannelMessage("not json")).toBeNull();
    expect(parseChannelMessage(new ArrayBuffer(4))).toBeNull();
  });

  it("opens the relative channel path on this origin", () => {
    expect(
      channelUrl(`/ws/mission/${missionId}`, {
        href: "https://stellar.example/en/app",
        protocol: "https:",
      }),
    ).toBe(`wss://stellar.example/ws/mission/${missionId}`);
    expect(
      channelUrl(`/ws/mission/${missionId}`, {
        href: "http://localhost:3000/en",
        protocol: "http:",
      }),
    ).toBe(`ws://localhost:3000/ws/mission/${missionId}`);
  });

  it("backs off from one second to fifteen", () => {
    expect([0, 1, 2, 3, 4, 10].map(reconnectDelay)).toEqual([
      1000, 2000, 4000, 8000, 15000, 15000,
    ]);
  });
});

describe("the time left", () => {
  it("counts down to MissionSession.expiresAt, never below zero", () => {
    const at = Date.parse("2026-09-28T10:05:57.400Z");
    expect(timeLeft(session.expiresAt, at)).toEqual({
      seconds: 1442,
      text: "24:02",
      iso: "PT1442S",
    });
    expect(timeLeft("2026-09-28T12:00:00.000Z", at).text).toBe("1:54:02");
    expect(
      timeLeft(session.expiresAt, Date.parse("2026-09-28T11:00:00.000Z")).seconds,
    ).toBe(0);
  });
});

describe("where the telescope points", () => {
  const telemetry = (pointing: unknown) =>
    message({ type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "ONLINE", pointing });
  const live = run(observing, { type: "started", session }, { type: "socket-open" });

  it("is unknown until the channel says, then follows each report", () => {
    expect(live.pointing).toBeUndefined();
    expect(run(live, telemetry(null)).pointing).toBeNull();
    expect(
      run(live, telemetry({ altitudeDegrees: 20, azimuthDegrees: 130 })).pointing,
    ).toEqual({ altitudeDegrees: 20, azimuthDegrees: 130 });
    // A telemetry frame with no position field says the platform has none.
    expect(
      run(
        live,
        telemetry({ altitudeDegrees: 20, azimuthDegrees: 130 }),
        message({ type: "MISSION_TELEMETRY", mode: "SIMULATED", link: "ONLINE" }),
      ).pointing,
    ).toBeNull();
  });

  it("is no position while the channel is down, and forgotten once the view closes", () => {
    const pointed = run(live, telemetry({ altitudeDegrees: 38, azimuthDegrees: 160 }));
    expect(run(pointed, { type: "socket-lost" }).pointing).toBeNull();
    expect(run(live, { type: "socket-lost" }).pointing).toBeUndefined();
    expect(run(pointed, { type: "expired" }).pointing).toBeUndefined();
    expect(
      run(
        pointed,
        message({
          type: "MISSION_STATE",
          state: "COMPLETE",
          failureReason: null,
          remainingSeconds: null,
        }),
      ).pointing,
    ).toBeUndefined();
    expect(
      run(pointed, message({ type: "MISSION_ERROR", code: "FORBIDDEN", message: "No." }))
        .pointing,
    ).toBeUndefined();
  });
});
