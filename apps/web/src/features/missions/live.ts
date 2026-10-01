import type {
  ErrorCode,
  HorizontalCoordinates,
  MissionChannelMessage,
  MissionFailureReason,
  MissionSession,
  MissionState,
  ObservatoryLinkState,
  ObservatoryMode,
} from "@darkview/contracts";
import { zMissionChannelMessage } from "@darkview/contracts/zod";

import type { CommandVerdict } from "./controls";

/**
 * The live room's feed, as the platform describes it (Phase 4 slice 2): the session
 * from `startMissionSession`, what `/ws/mission/{id}` has said, and the signed MJPEG
 * URL it offered. Pure, so every state is reachable from a test without a socket.
 */
export type LiveStatus =
  /** SCHEDULED: the customer starts it, inside the booked slot (ADR-018). */
  | "not-started"
  /** POST /missions/{id}/start in flight. */
  | "starting"
  /** A session is held; the channel is opening or no stream has been offered yet. */
  | "connecting"
  /** A stream URL is on screen. */
  | "live"
  /** The channel dropped; it is being reopened. */
  | "reconnecting"
  /** The observatory's agent is not connected. */
  | "offline"
  | "hold"
  /** The session's `expiresAt` has passed. */
  | "expired"
  /** The mission is past its live view: processing, complete, stopped. */
  | "ended"
  /** The platform refused the start, or the channel refused the session. */
  | "refused"
  | "error";

export type LiveStream = { url: string; mode: ObservatoryMode; expiresAt: string };

export type LiveState = {
  missionState: MissionState;
  failureReason: MissionFailureReason | null;
  /** States the channel reported, oldest first, for the step flow. */
  seen: MissionState[];
  session: MissionSession | null;
  stream: LiveStream | null;
  link: ObservatoryLinkState | null;
  /**
   * Where the mount points, from `MissionTelemetryUpdate.pointing`: undefined until the
   * channel has said, null while it has no position (or the channel is down).
   */
  pointing: HorizontalCoordinates | null | undefined;
  start: "idle" | "pending" | "failed";
  /** Why the start failed; null for a network failure or an unreadable answer. */
  startError: ErrorCode | null;
  socket: "closed" | "open" | "lost";
  /** The channel's MISSION_ERROR, when it refused this session. */
  channelError: ErrorCode | null;
  expired: boolean;
  /**
   * The agent's verdicts, by `commandId` (slice 3). Kept rather than handled as they
   * arrive: a verdict can land before the 202 that names its command.
   */
  verdicts: Record<string, CommandVerdict>;
};

export type LiveEvent =
  | { type: "start" }
  | { type: "started"; session: MissionSession }
  | { type: "start-failed"; code: ErrorCode | null }
  | { type: "socket-open" }
  | { type: "socket-lost" }
  | { type: "message"; message: MissionChannelMessage }
  | { type: "stream-failed" }
  | { type: "expired" };

/**
 * The states `startMissionSession` opens a session for: SCHEDULED, which the customer
 * starts by hand, and the live ones, which reopen (the platform rotates the session, so
 * a stale tab stops watching). As `LIVE_MISSION_STATES` in the platform's
 * `features/missions/session.ts`.
 */
const reopenable: readonly MissionState[] = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
];

export function reopensSession(state: MissionState) {
  return reopenable.includes(state);
}

/** Start refusals that trying again later can change; the rest are final. */
const retryable: readonly (ErrorCode | null)[] = [
  null,
  "INTERNAL",
  "RATE_LIMITED",
  "CONFLICT",
  "MISSION_NOT_ACTIVE",
  "OBSERVATORY_OFFLINE",
  "WEATHER_HOLD",
  "SAFETY_REFUSED",
];

export function initialLive(
  state: MissionState,
  failureReason: MissionFailureReason | null,
) {
  return {
    missionState: state,
    failureReason,
    seen: [],
    session: null,
    stream: null,
    link: null,
    pointing: undefined,
    start: "idle",
    startError: null,
    socket: "closed",
    channelError: null,
    expired: false,
    verdicts: {},
  } satisfies LiveState;
}

export function liveReducer(state: LiveState, event: LiveEvent): LiveState {
  switch (event.type) {
    case "start":
      return { ...state, start: "pending", startError: null, channelError: null };
    case "started":
      return {
        ...state,
        start: "idle",
        session: event.session,
        stream: null,
        pointing: undefined,
        socket: "closed",
        expired: false,
      };
    case "start-failed":
      return { ...state, start: "failed", startError: event.code };
    case "socket-open":
      return { ...state, socket: "open" };
    case "socket-lost":
      // A position the channel can no longer confirm is not shown as current.
      return state.channelError || state.expired
        ? state
        : {
            ...state,
            socket: "lost",
            pointing: state.pointing === undefined ? undefined : null,
          };
    case "stream-failed":
      return { ...state, stream: null };
    case "expired":
      return {
        ...state,
        expired: true,
        stream: null,
        pointing: undefined,
        socket: "closed",
      };
    case "message":
      return onMessage(state, event.message);
  }
}

function onMessage(state: LiveState, message: MissionChannelMessage): LiveState {
  switch (message.type) {
    case "MISSION_STATE": {
      const ended = !reopensSession(message.state) && message.state !== "SCHEDULED";
      return {
        ...state,
        missionState: message.state,
        failureReason: message.failureReason ?? null,
        seen:
          state.seen.at(-1) === message.state
            ? state.seen
            : [...state.seen, message.state],
        // No live view outlives the live states; the stream and the position end with them.
        stream: ended ? null : state.stream,
        pointing: ended ? undefined : state.pointing,
      };
    }
    case "MISSION_TELEMETRY":
      return { ...state, link: message.link, pointing: message.pointing ?? null };
    case "MISSION_STREAM":
      // A late offer after the session ended is not a live view.
      if (state.expired) return state;
      return {
        ...state,
        stream: {
          url: message.streamUrl,
          mode: message.mode,
          expiresAt: message.expiresAt,
        },
      };
    case "MISSION_ERROR":
      return {
        ...state,
        channelError: message.code,
        socket: "closed",
        stream: null,
        pointing: undefined,
      };
    case "MISSION_COMMAND_RESULT":
      return {
        ...state,
        verdicts: {
          ...state.verdicts,
          [message.commandId]: {
            status: message.status,
            rejectionReason: message.rejectionReason ?? null,
          },
        },
      };
    case "MISSION_CAPTURE_READY":
      return state;
  }
}

/** The one status the feed shows. Earlier rules win. */
export function liveStatus(state: LiveState): LiveStatus {
  const mission = state.missionState;
  if (mission === "WEATHER_HOLD") return "hold";
  if (mission !== "SCHEDULED" && !reopensSession(mission)) return "ended";
  if (state.expired) return "expired";
  if (state.start === "pending") return "starting";
  if (state.start === "failed") {
    if (state.startError === "OBSERVATORY_OFFLINE") return "offline";
    if (state.startError === "WEATHER_HOLD") return "hold";
    const unanswered: (ErrorCode | null)[] = [null, "INTERNAL", "RATE_LIMITED"];
    return unanswered.includes(state.startError) ? "error" : "refused";
  }
  if (state.channelError) return state.channelError === "FORBIDDEN" ? "refused" : "error";
  if (!state.session) return mission === "SCHEDULED" ? "not-started" : "starting";
  if (state.link === "OFFLINE") return "offline";
  if (state.socket === "lost") return "reconnecting";
  if (state.stream) return "live";
  return "connecting";
}

/** Whether the feed offers to start again, and what that button means. */
export function liveAction(state: LiveState): "start" | "retry" | "reopen" | null {
  const status = liveStatus(state);
  if (status === "not-started") return "start";
  if (
    status === "offline" ||
    status === "hold" ||
    status === "refused" ||
    status === "error"
  ) {
    if (state.missionState === "WEATHER_HOLD") return null;
    if (state.channelError === "FORBIDDEN") return "reopen";
    if (state.start === "failed" && !retryable.includes(state.startError)) return null;
    if (state.session && state.link === "OFFLINE") return null;
    return state.missionState === "SCHEDULED" ? "start" : "retry";
  }
  return null;
}

/** One channel frame, parsed by the generated validator; null when it is not one. */
export function parseChannelMessage(raw: unknown): MissionChannelMessage | null {
  if (typeof raw !== "string") return null;
  try {
    const parsed = zMissionChannelMessage.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as MissionChannelMessage) : null;
  } catch {
    return null;
  }
}

/** The channel's address on this origin: `missionChannelUrl` is a relative WSS path. */
export function channelUrl(path: string, location: { href: string; protocol: string }) {
  const url = new URL(path, location.href);
  url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

/** Delay before the n-th reconnect (from 0): 1 s doubling to 15 s. */
export function reconnectDelay(attempt: number) {
  return Math.min(15_000, 1_000 * 2 ** attempt);
}

/**
 * Time left in the session, `MissionSession.expiresAt` minus now: the channel's
 * `remainingSeconds` is always null (ADR-027, Phase 4 README). "24:03", or "1:02:03".
 */
export function timeLeft(expiresAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((Date.parse(expiresAt) - now) / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const text =
    hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds % 60)}`
      : `${minutes}:${pad(seconds % 60)}`;
  return { seconds, text, iso: `PT${seconds}S` };
}
