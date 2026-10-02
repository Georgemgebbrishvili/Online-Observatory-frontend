"use client";

import type {
  CommandRejectionReason,
  ImagingProfile,
  MissionState,
} from "@darkview/contracts";
import {
  zCommandRejectionReason,
  zSubmitMissionCommandResponse,
} from "@darkview/contracts/zod";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  commandRequest,
  NUDGE_STEP_ARCMINUTES,
  offeredControls,
  outcomeOf,
  type CommandVerdict,
  type Control,
  type Offered,
  type Outcome,
  type Pending,
} from "@/features/missions/controls";
import { fill } from "@/features/operator/format";
import type { RoomControlsCopy } from "@/i18n/resources/room-controls";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import { PanelHead } from "./panel-head";

const arrows = [
  ["up", "↑"],
  ["left", "←"],
  ["right", "→"],
  ["down", "↓"],
] as const;

/** The controls in one moment, drawn from props alone: the design system shows each. */
export type RoomControlsState = {
  offered: Offered;
  /** A command in flight: which control, and whether the request itself has been answered. */
  pending: { control: Control; relayed: boolean } | null;
  outcome: { control: Control; outcome: Outcome } | null;
  confirmingStop: boolean;
  onPress?: (control: Control) => void;
  onConfirmingStop?: (confirming: boolean) => void;
};

type ViewProps = RoomControlsState & {
  copy: RoomControlsCopy;
  /** The region's name when it is not the heading: specimens side by side need their own. */
  label?: string;
};

function describe(
  copy: RoomControlsCopy,
  outcome: RoomControlsState["outcome"],
): string | null {
  if (!outcome) return null;
  switch (outcome.outcome.kind) {
    case "done":
      return copy.done[outcome.control];
    case "refused":
      return outcome.outcome.reason ? copy.reasons[outcome.outcome.reason] : copy.refused;
    case "no-answer":
      return copy.noAnswer;
    case "error":
      return copy.failed;
  }
}

/**
 * Hand control: the four nudges on a pad around re-centre, as the console draws it, and
 * what the last command came to. Present for every live moment; the pad only while the
 * target is being observed.
 */
export function RoomControlsView({
  copy,
  label,
  offered,
  onPress,
  outcome,
  pending,
}: ViewProps) {
  const titleId = useId();
  if (!offered.stop) return null;
  const busy = pending !== null;
  const message = describe(copy, outcome);
  const step = fill(copy.step, { step: String(NUDGE_STEP_ARCMINUTES) });

  return (
    <section
      className="room-panel room-controls"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead
        id={titleId}
        icon="hand"
        title={copy.title}
        meta={offered.move ? `${NUDGE_STEP_ARCMINUTES}′` : undefined}
      />

      {offered.waiting && (
        <p className="room-muted">
          {offered.waiting === "capturing" ? copy.capturing : copy.centring}
        </p>
      )}

      {offered.move && (
        <div className="room-controls-pad">
          {arrows.map(([control, glyph]) => (
            <button
              key={control}
              type="button"
              className={`room-controls-arrow room-controls-${control}`}
              aria-label={`${copy.labels[control]}, ${step}`}
              disabled={busy}
              aria-busy={pending?.control === control}
              onClick={() => onPress?.(control)}
            >
              <span aria-hidden="true">{glyph}</span>
            </button>
          ))}
          <button
            type="button"
            className="room-controls-centre"
            disabled={busy}
            aria-busy={pending?.control === "recenter"}
            onClick={() => onPress?.("recenter")}
          >
            {copy.labels.recenter}
          </button>
        </div>
      )}

      {offered.move && !offered.capture && <p className="room-muted">{copy.noCapture}</p>}

      <p className="room-controls-status" aria-live="polite">
        {pending ? (pending.relayed ? copy.waiting : copy.sending) : message}
      </p>
    </section>
  );
}

/** Capture, the room's one primary action while the target is observed. */
export function RoomCaptureAction({
  copy,
  offered,
  onPress,
  pending,
}: Pick<ViewProps, "copy" | "offered" | "onPress" | "pending">) {
  if (!offered.capture) return null;
  return (
    <Button
      size="large"
      disabled={pending !== null}
      loading={pending?.control === "capture"}
      onClick={() => onPress?.("capture")}
    >
      {copy.labels.capture}
    </Button>
  );
}

/** The session panel: Stop, asked twice, at any live moment. */
export function RoomSessionView({
  confirmingStop,
  copy,
  label,
  offered,
  onConfirmingStop,
  onPress,
  pending,
}: ViewProps) {
  const titleId = useId();
  if (!offered.stop) return null;
  const busy = pending !== null;
  return (
    <section
      className="room-panel room-session"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead id={titleId} icon="session" title={copy.sessionTitle} />
      {confirmingStop ? (
        <div
          className="room-controls-confirm"
          role="group"
          aria-label={copy.stopQuestion}
        >
          <p>
            <strong>{copy.stopQuestion}</strong> {copy.stopDetail}
          </p>
          <div>
            <Button
              variant="danger"
              disabled={busy}
              loading={pending?.control === "stop"}
              onClick={() => onPress?.("stop")}
            >
              {copy.stopConfirm}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => onConfirmingStop?.(false)}
            >
              {copy.stopKeep}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="room-session-stop"
          disabled={busy}
          onClick={() => onConfirmingStop?.(true)}
        >
          {copy.labels.stop}
        </Button>
      )}
    </section>
  );
}

/** The refusal a 403 or 409 names, in the agent's vocabulary, when it names one. */
function refusalOf(error: ApiRequestError): CommandRejectionReason | null {
  const named = zCommandRejectionReason.safeParse(error.error?.details?.rejectionReason);
  if (named.success) return named.data;
  if (error.error?.code === "SESSION_NOT_OWNER") return "WRONG_SESSION";
  if (error.error?.code === "MISSION_NOT_ACTIVE") return "NO_ACTIVE_MISSION";
  return null;
}

type RoomControlsProps = {
  missionId: string;
  missionState: MissionState;
  /** A session is held and the channel is open: the verdict has somewhere to arrive. */
  connected: boolean;
  verdicts: Record<string, CommandVerdict>;
  imagingProfile: ImagingProfile | null;
  signInPath: string;
};

/**
 * Nudge, re-centre, capture and stop (Phase 4 slice 3), whose views sit apart in the
 * room: the pad at the side, Capture under the feed, Stop in the session panel. Each press is one
 * `submitMissionCommand`; a 202 means relayed, so the control stays locked until the
 * agent's `MISSION_COMMAND_RESULT` names it, or its envelope expires unanswered. Commands
 * carry no idempotency key, so none is ever retried by itself.
 */
export function useRoomControls({
  connected,
  imagingProfile,
  missionId,
  missionState,
  signInPath,
  verdicts,
}: RoomControlsProps): RoomControlsState {
  // The latest press: its command once relayed, and its outcome once known. An outcome
  // set here is the request's own (a refusal, an error, no answer); otherwise it is
  // the agent's verdict, read from the channel's.
  const [command, setCommand] = useState<(Pending & { outcome: Outcome | null }) | null>(
    null,
  );
  const [confirmingStop, setConfirmingStop] = useState(false);
  const offered = offeredControls(missionState, connected, imagingProfile);

  const verdict = command?.commandId ? verdicts[command.commandId] : undefined;
  const outcome = command?.outcome ?? (verdict ? outcomeOf(verdict) : null);
  const pending = command && !outcome ? command : null;

  // The envelope's own deadline: past it the agent refuses the command as expired, so
  // with no verdict by then there will be none worth waiting for.
  const waitUntil = pending?.expiresAt ?? null;
  useEffect(() => {
    if (!waitUntil) return;
    const timer = window.setTimeout(
      () =>
        setCommand((current) =>
          current && current.expiresAt === waitUntil
            ? { ...current, outcome: { kind: "no-answer" } }
            : current,
        ),
      Math.max(Date.parse(waitUntil) - Date.now(), 0) + 1000,
    );
    return () => window.clearTimeout(timer);
  }, [waitUntil]);

  async function press(control: Control) {
    if (pending) return;
    setCommand({ control, commandId: null, expiresAt: null, outcome: null });
    try {
      const accepted = await apiRequest(
        `/missions/${encodeURIComponent(missionId)}/command`,
        {
          method: "POST",
          body: commandRequest(control, imagingProfile),
          schema: zSubmitMissionCommandResponse,
        },
      );
      setCommand({
        control,
        commandId: accepted.commandId,
        expiresAt: accepted.expiresAt,
        outcome:
          accepted.status === "ACCEPTED"
            ? null
            : outcomeOf({
                status: accepted.status,
                rejectionReason: accepted.rejectionReason ?? null,
              }),
      });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const refusal =
        error instanceof ApiRequestError && (error.status === 403 || error.status === 409)
          ? refusalOf(error)
          : null;
      setCommand({
        control,
        commandId: null,
        expiresAt: null,
        outcome: refusal ? { kind: "refused", reason: refusal } : { kind: "error" },
      });
    }
  }

  const stopped = command?.control === "stop" && outcome?.kind === "done";

  return {
    offered,
    pending: pending && { control: pending.control, relayed: pending.commandId !== null },
    outcome: command && outcome ? { control: command.control, outcome } : null,
    confirmingStop: confirmingStop && !stopped,
    onPress: (control) => void press(control),
    onConfirmingStop: (confirming) => {
      if (!pending) setCommand(null);
      setConfirmingStop(confirming);
    },
  };
}
