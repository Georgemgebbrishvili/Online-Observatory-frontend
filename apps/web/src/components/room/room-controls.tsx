"use client";

import type { ImagingProfile, MissionState } from "@darkview/contracts";
import {
  zCommandRejectionReason,
  zSubmitMissionCommandResponse,
} from "@darkview/contracts/zod";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  commandRequest,
  NUDGE_STEP_ARCMINUTES,
  offeredControls,
  outcomeOf,
  waitUntil,
  type CommandVerdict,
  type Control,
  type Offered,
  type Outcome,
  type Pending,
  type Refusal,
} from "@/features/missions/controls";
import { fill } from "@/features/operator/format";
import type { RoomControlsCopy } from "@/i18n/resources/room-controls";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import { PanelHead } from "./panel-head";
import { refocus } from "./refocus";

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
  pending: { control: Control; relayed: boolean; targetId?: string | null } | null;
  outcome: { control: Control; outcome: Outcome; targetId?: string | null } | null;
  confirmingStop: boolean;
  onPress?: (control: Control) => void;
  /** ADR-079: switch to another object, by its catalogue id. */
  onRetarget?: (targetId: string) => void;
  onConfirmingStop?: (confirming: boolean) => void;
};

type ViewProps = RoomControlsState & {
  copy: RoomControlsCopy;
  /** The region's name when it is not the heading: specimens side by side need their own. */
  label?: string;
};

export function describeOutcome(
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
  // A switch of object is answered in the object list, where it was pressed.
  const message =
    outcome?.control === "retarget" ? null : describeOutcome(copy, outcome);
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
              aria-disabled={busy || undefined}
              aria-busy={pending?.control === control}
              onClick={() => !busy && onPress?.(control)}
            >
              <span aria-hidden="true">{glyph}</span>
            </button>
          ))}
          <button
            type="button"
            className="room-controls-centre"
            aria-disabled={busy || undefined}
            aria-busy={pending?.control === "recenter"}
            onClick={() => !busy && onPress?.("recenter")}
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

/**
 * Capture, the room's one primary action while the target is observed. A session may
 * capture many times (ADR-079 §3): after each, the button waits out `captureAllowedAt`.
 */
export function RoomCaptureAction({
  allowedAt = null,
  copy,
  now = null,
  offered,
  onPress,
  pending,
}: Pick<ViewProps, "copy" | "offered" | "onPress" | "pending"> & {
  /** `MissionTelemetryUpdate.captureAllowedAt`: the next capture is accepted from then. */
  allowedAt?: string | null;
  now?: number | null;
}) {
  if (!offered.capture) return null;
  const wait = waitUntil(allowedAt, now);
  return (
    <Button
      size="large"
      disabled={pending !== null || wait !== null}
      loading={pending?.control === "capture"}
      onClick={() => onPress?.("capture")}
      data-capture-wait={wait ? wait.seconds : undefined}
    >
      {wait ? fill(copy.captureAgain, { time: wait.text }) : copy.labels.capture}
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
  const panel = useRef<HTMLElement>(null);
  const question = useRef<HTMLDivElement>(null);
  const stop = useRef<HTMLButtonElement>(null);
  const asked = useRef(confirmingStop);
  // The question replaces Stop, and Stop the question: the keyboard follows.
  useEffect(() => {
    if (asked.current === confirmingStop) return;
    asked.current = confirmingStop;
    refocus(panel.current, confirmingStop ? question.current : stop.current);
  }, [confirmingStop]);
  if (!offered.stop) return null;
  const busy = pending !== null;
  return (
    <section
      ref={panel}
      className="room-panel room-session"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead id={titleId} icon="session" title={copy.sessionTitle} />
      {confirmingStop ? (
        <div
          ref={question}
          className="room-controls-confirm"
          role="group"
          aria-label={copy.stopQuestion}
          tabIndex={-1}
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
          ref={stop}
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
function refusalOf(error: ApiRequestError, control: Control): Refusal | null {
  const named = zCommandRejectionReason.safeParse(error.error?.details?.rejectionReason);
  if (named.success) return named.data;
  if (error.error?.code === "SESSION_NOT_OWNER") return "WRONG_SESSION";
  if (error.error?.code === "MISSION_NOT_ACTIVE") return "NO_ACTIVE_MISSION";
  // ADR-079: a switch to the object already on the telescope.
  if (control === "retarget" && error.error?.code === "CONFLICT") return "ALREADY_ON_TARGET";
  if (error.error?.code === "TARGET_NOT_OBSERVABLE") return "TARGET_NOT_VISIBLE_NOW";
  return null;
}

/** `details.allowedAt` of a DWELL_LOCKED or CAPTURE_COOLDOWN refusal, when it is one. */
function allowedAtOf(error: ApiRequestError) {
  const value = error.error?.details?.allowedAt;
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
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

  async function press(control: Control, targetId: string | null = null) {
    if (pending) return;
    setCommand({ control, targetId, commandId: null, expiresAt: null, outcome: null });
    try {
      const accepted = await apiRequest(
        `/missions/${encodeURIComponent(missionId)}/command`,
        {
          method: "POST",
          body: commandRequest(control, imagingProfile, targetId),
          schema: zSubmitMissionCommandResponse,
        },
      );
      setCommand({
        control,
        targetId,
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
      const answered =
        error instanceof ApiRequestError && (error.status === 403 || error.status === 409)
          ? error
          : null;
      const refusal = answered ? refusalOf(answered, control) : null;
      const allowedAt = answered ? allowedAtOf(answered) : null;
      setCommand({
        control,
        targetId,
        commandId: null,
        expiresAt: null,
        outcome: refusal
          ? { kind: "refused", reason: refusal, allowedAt }
          : { kind: "error" },
      });
    }
  }

  const stopped = command?.control === "stop" && outcome?.kind === "done";

  return {
    offered,
    pending: pending && {
      control: pending.control,
      relayed: pending.commandId !== null,
      targetId: pending.targetId,
    },
    outcome:
      command && outcome
        ? { control: command.control, outcome, targetId: command.targetId }
        : null,
    confirmingStop: confirmingStop && !stopped,
    onPress: (control) => void press(control),
    onRetarget: (targetId) => void press("retarget", targetId),
    onConfirmingStop: (confirming) => {
      if (!pending) setCommand(null);
      setConfirmingStop(confirming);
    },
  };
}
