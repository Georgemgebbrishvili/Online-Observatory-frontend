import type {
  CommandAcceptanceStatus,
  CommandRejectionReason,
  ErrorCode,
  HorizontalCoordinates,
  MissionChannelMessage,
  MissionFailureReason,
  MissionState,
  ObservatoryLinkState,
  ObservatoryMode,
} from "@darkview/contracts";

// The room's rules follow the website's (apps/web/src/features/missions/live.ts), so a
// mission reads the same on a phone and in a browser.

/** States a started session is live in; the channel and controls run only in these. */
export const liveStates: readonly MissionState[] = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
];

export const stoppedStates: readonly MissionState[] = [
  "NOT_VISIBLE",
  "HARDWARE_ERROR",
  "CANCELLED",
  "FAILED",
];

export const isLive = (state: MissionState) => liveStates.includes(state);

export type Room = {
  state: MissionState;
  failureReason: MissionFailureReason | null;
  link: ObservatoryLinkState | null;
  pointing: HorizontalCoordinates | null;
  stream: { url: string; mode: ObservatoryMode; expiresAt: string } | null;
  verdicts: Record<string, { status: CommandAcceptanceStatus; rejectionReason: CommandRejectionReason | null }>;
  channelError: ErrorCode | null;
  capturesArrived: number;
};

export function initialRoom(state: MissionState, failureReason: MissionFailureReason | null = null): Room {
  return {
    state,
    failureReason,
    link: null,
    pointing: null,
    stream: null,
    verdicts: {},
    channelError: null,
    capturesArrived: 0,
  };
}

/** One message from the mission channel. */
export function reduce(room: Room, message: MissionChannelMessage): Room {
  switch (message.type) {
    case "MISSION_STATE": {
      const ended = !isLive(message.state) && message.state !== "SCHEDULED";
      return {
        ...room,
        state: message.state,
        failureReason: message.failureReason ?? null,
        stream: ended ? null : room.stream,
        pointing: ended ? null : room.pointing,
      };
    }
    case "MISSION_TELEMETRY":
      return { ...room, link: message.link, pointing: message.pointing ?? null };
    case "MISSION_STREAM":
      return {
        ...room,
        stream: { url: message.streamUrl, mode: message.mode, expiresAt: message.expiresAt },
      };
    case "MISSION_CAPTURE_READY":
      return { ...room, capturesArrived: room.capturesArrived + 1 };
    case "MISSION_COMMAND_RESULT":
      return {
        ...room,
        verdicts: {
          ...room.verdicts,
          [message.commandId]: {
            status: message.status,
            rejectionReason: message.rejectionReason ?? null,
          },
        },
      };
    case "MISSION_ERROR":
      return { ...room, channelError: message.code, stream: null };
  }
}

/** The five steps the website shows, and which one a state belongs to. */
export function stepOf(state: MissionState): number | null {
  switch (state) {
    case "REQUESTED":
    case "SCHEDULED":
    case "PREPARING":
      return 0;
    case "SLEWING":
      return 1;
    case "VERIFYING":
    case "CENTERING":
      return 2;
    case "OBSERVING":
      return 3;
    case "CAPTURING":
    case "PROCESSING":
    case "COMPLETE":
      return 4;
    default:
      return null;
  }
}

/** A verdict the UI can say: ACCEPTED or COMPLETED succeeded, the rest were refused. */
export function verdictOutcome(status: CommandAcceptanceStatus) {
  return status === "ACCEPTED" || status === "COMPLETED" ? "done" : "refused";
}

/** Time left in the session, "m:ss" or "h:mm:ss"; null once it has run out. */
export function remaining(expiresAt: string, now: number) {
  const seconds = Math.floor((Date.parse(expiresAt) - now) / 1000);
  if (seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = `${seconds % 60}`.padStart(2, "0");
  return h > 0 ? `${h}:${`${m}`.padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * The platform's URLs for the channel and the stream are on the website's origin, which
 * serves /ws and /stream on the same host. A phone resolves their path against the
 * realtime address it is configured with.
 */
export function onRealtime(url: string, realtimeBase: string, protocol: "http" | "ws") {
  const target = new URL(url, realtimeBase);
  const base = new URL(realtimeBase);
  const secure = base.protocol === "https:";
  const scheme = protocol === "ws" ? (secure ? "wss:" : "ws:") : base.protocol;
  return `${scheme}//${base.host}${target.pathname}${target.search}`;
}
