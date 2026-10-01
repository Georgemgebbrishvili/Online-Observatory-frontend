import type {
  CommandAcceptanceStatus,
  CommandRejectionReason,
  ImagingProfile,
  MissionCommandRequest,
  MissionState,
} from "@darkview/contracts";

/** What the customer can press. Each is one `submitMissionCommand`. */
export type Control = "up" | "down" | "left" | "right" | "recenter" | "capture" | "stop";

/**
 * One press of a nudge arrow, in arcminutes. The client's to choose
 * (`NudgePayload.stepArcminutes`); the safety envelope bounds the total from the target.
 */
export const NUDGE_STEP_ARCMINUTES = 2;

const nudges = {
  up: { axis: "ALTITUDE", direction: "POSITIVE" },
  down: { axis: "ALTITUDE", direction: "NEGATIVE" },
  right: { axis: "AZIMUTH", direction: "POSITIVE" },
  left: { axis: "AZIMUTH", direction: "NEGATIVE" },
} as const;

/** Intent only: the cloud mints the envelope (id, session, user, issued, expires). */
export function commandRequest(
  control: Control,
  imagingProfile: ImagingProfile | null,
): MissionCommandRequest {
  switch (control) {
    case "up":
    case "down":
    case "left":
    case "right":
      return {
        type: "NUDGE",
        nudge: {
          kind: "NUDGE",
          ...nudges[control],
          stepArcminutes: NUDGE_STEP_ARCMINUTES,
        },
      };
    case "recenter":
      return { type: "RECENTER" };
    case "capture":
      if (!imagingProfile)
        throw new Error("A capture needs the target's imaging profile.");
      return { type: "CAPTURE", capture: { kind: "CAPTURE", imagingProfile } };
    case "stop":
      return { type: "ABORT", reason: null };
  }
}

/** The live states `submitMissionCommand` accepts (the platform's LIVE_MISSION_STATES). */
const live: readonly MissionState[] = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
  "OBSERVING",
  "CAPTURING",
];

export type Offered = {
  /** Nudge and re-centre: the target is on and being observed. */
  move: boolean;
  /** Capture: as `move`, and the target's profile is known. */
  capture: boolean;
  /** Stop: any live moment. */
  stop: boolean;
  /** Why the rest are not offered yet, when the room is live. */
  waiting: "centring" | "capturing" | null;
};

const none: Offered = { move: false, capture: false, stop: false, waiting: null };

/** What the room offers, from the mission's state and whether the room is connected. */
export function offeredControls(
  state: MissionState,
  connected: boolean,
  imagingProfile: ImagingProfile | null,
): Offered {
  if (!connected || !live.includes(state)) return none;
  if (state === "OBSERVING") {
    return { move: true, capture: imagingProfile !== null, stop: true, waiting: null };
  }
  return {
    move: false,
    capture: false,
    stop: true,
    waiting: state === "CAPTURING" ? "capturing" : "centring",
  };
}

/** The agent's verdict on one command, from `MISSION_COMMAND_RESULT`. */
export type CommandVerdict = {
  status: CommandAcceptanceStatus;
  rejectionReason: CommandRejectionReason | null;
};

export type Outcome =
  | { kind: "done" }
  | { kind: "refused"; reason: CommandRejectionReason | null }
  | { kind: "no-answer" }
  | { kind: "error" };

/** What the customer is told about a verdict. Only ACCEPTED and COMPLETED are success. */
export function outcomeOf(verdict: CommandVerdict): Outcome {
  if (verdict.status === "ACCEPTED" || verdict.status === "COMPLETED")
    return { kind: "done" };
  if (verdict.status === "EXPIRED") return { kind: "refused", reason: "COMMAND_EXPIRED" };
  if (verdict.status === "DUPLICATE") {
    return { kind: "refused", reason: "DUPLICATE_COMMAND_ID" };
  }
  return { kind: "refused", reason: verdict.rejectionReason };
}

/** A command in flight: pressed, relayed, and waiting for the agent. */
export type Pending = {
  control: Control;
  /** From the 202; null while the request itself is in flight. */
  commandId: string | null;
  /** The envelope's own deadline: with no verdict by then, there will be none. */
  expiresAt: string | null;
};
