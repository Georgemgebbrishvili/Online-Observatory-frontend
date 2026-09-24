"use client";

import type { MissionCommandAccepted } from "@darkview/contracts";
import { useState } from "react";

import { sendOverride } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

import { liveState, useOperatorConsole } from "./console-provider";

type Outcome =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "accepted"; accepted: MissionCommandAccepted }
  | { kind: "failed"; message: string };

/**
 * One click, no confirmation: an emergency stop that asks "are you sure" is slower
 * exactly when speed matters. PARK is exempt from the platform's rate limit and
 * from the agent's envelope check for the same reason.
 */
export function EmergencyPark({ copy }: { copy: OperatorCopy["park"] }) {
  const { reading } = useOperatorConsole();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const state = liveState(reading);
  const missionId = state?.activeMissionId ?? null;
  const parked = state?.telemetry.parked ?? null;

  async function park() {
    if (!missionId) return;
    setOutcome({ kind: "sending" });
    try {
      const accepted = await sendOverride({
        missionId,
        type: "PARK",
        payload: { kind: "PARK", reason: copy.reason },
        reason: copy.reason,
      });
      setOutcome({ kind: "accepted", accepted });
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? (error.error?.message ?? String(error.status))
          : "";
      setOutcome({ kind: "failed", message });
    }
  }

  let message: string | null = null;
  let tone: "info" | "success" | "error" = "info";
  if (outcome.kind === "accepted" && outcome.accepted.status === "REJECTED") {
    message = fill(copy.rejected, { reason: outcome.accepted.rejectionReason ?? "" });
    tone = "error";
  } else if (outcome.kind === "accepted") {
    message = parked ? copy.confirmed : copy.sent;
    tone = parked ? "success" : "info";
  } else if (outcome.kind === "failed") {
    message = fill(copy.failed, { message: outcome.message });
    tone = "error";
  } else if (state && !missionId) {
    message = parked === false ? copy.unparkedNoMission : copy.noMission;
    tone = parked === false ? "error" : "info";
  }

  return (
    <div className="operator-park">
      <button
        className="operator-park-button"
        disabled={!missionId || outcome.kind === "sending"}
        onClick={park}
        type="button"
      >
        {outcome.kind === "sending" ? copy.sending : copy.label}
      </button>
      <p className={`operator-park-message operator-tone-${tone}`} role="status">
        {message}
      </p>
    </div>
  );
}
