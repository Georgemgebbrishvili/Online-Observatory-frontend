"use client";

import type {
  CommandPayload,
  FocusMode,
  ImagingProfile,
  MissionCommandAccepted,
  Target,
} from "@darkview/contracts";
import { ImagingProfile as imagingProfiles } from "@darkview/contracts";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { sendOverride } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

import { liveState, useOperatorConsole } from "./console-provider";

const MINIMUM_REASON = 8;

type FixedTarget = Target & { coordinates: NonNullable<Target["coordinates"]> };

/**
 * GotoPayload requires J2000 coordinates. Only FIXED catalogue targets carry
 * them; an EPHEMERIS target's position is computed by the platform, and the
 * contract gives the console no way to ask for it. Converting in the browser
 * is ruled out by EquatorialCoordinates itself.
 */
export function fixedTargets(targets: readonly Target[]): FixedTarget[] {
  return targets.filter(
    (target): target is FixedTarget =>
      target.enabled && target.positionSource === "FIXED" && target.coordinates != null,
  );
}

export function ManualControl({
  copy,
  locale,
  targets,
}: {
  copy: OperatorCopy["manual"];
  locale: Locale;
  targets: readonly Target[];
}) {
  const { reading } = useOperatorConsole();
  const missionId = liveState(reading)?.activeMissionId ?? null;
  const gotoTargets = fixedTargets(targets);
  const [reason, setReason] = useState("");
  const [targetId, setTargetId] = useState(gotoTargets[0]?.id ?? "");
  const [focusMode, setFocusMode] = useState<FocusMode>("AUTOFOCUS");
  const [focusPosition, setFocusPosition] = useState("");
  const [profile, setProfile] = useState<ImagingProfile>("LUNAR");
  const [frames, setFrames] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const disabled = !missionId || reason.trim().length < MINIMUM_REASON || pending;

  async function send(command: string, payload: CommandPayload) {
    if (!missionId) return;
    setPending(true);
    try {
      const accepted: MissionCommandAccepted = await sendOverride({
        missionId,
        type: payload.kind,
        payload,
        reason: reason.trim(),
      });
      setResult(
        accepted.status === "REJECTED"
          ? {
              ok: false,
              text: fill(copy.rejected, {
                command,
                reason: accepted.rejectionReason ?? "",
              }),
            }
          : { ok: true, text: fill(copy.sent, { command, status: accepted.status }) },
      );
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? (error.error?.message ?? String(error.status))
          : "";
      setResult({ ok: false, text: fill(copy.failed, { command, message }) });
    } finally {
      setPending(false);
    }
  }

  function onGoto(event: FormEvent) {
    event.preventDefault();
    const target = gotoTargets.find((candidate) => candidate.id === targetId);
    if (!target) return;
    send(copy.goto.title, {
      kind: "GOTO",
      targetId: target.id,
      coordinates: target.coordinates,
      opticalConfig: target.opticalConfig,
      imagingProfile: target.imagingProfile,
    });
  }

  function onFocus(event: FormEvent) {
    event.preventDefault();
    send(copy.focus.title, {
      kind: "FOCUS",
      mode: focusMode,
      absolutePosition:
        focusMode === "ABSOLUTE" ? Number.parseInt(focusPosition, 10) : null,
    });
  }

  function onCapture(event: FormEvent) {
    event.preventDefault();
    send(copy.capture.title, {
      kind: "CAPTURE",
      imagingProfile: profile,
      requestedFrames: frames ? Number.parseInt(frames, 10) : null,
    });
  }

  const targetName = (target: Target) =>
    [target.catalogId, locale === "ka" ? target.nameKa : target.nameEn]
      .filter(Boolean)
      .join(" · ");

  return (
    <section
      className="surface-panel operator-manual"
      aria-labelledby="operator-manual-title"
    >
      <h2 id="operator-manual-title">{copy.title}</h2>
      <p>{copy.detail}</p>
      {!missionId && (
        <p className="operator-tone-info" role="status">
          {copy.needsMission}
        </p>
      )}

      <Field htmlFor="override-reason" label={copy.reason} hint={copy.reasonHint}>
        <TextArea
          id="override-reason"
          minLength={MINIMUM_REASON}
          onChange={(event) => setReason(event.currentTarget.value)}
          value={reason}
        />
      </Field>

      <div className="operator-commands">
        <form className="operator-form" onSubmit={onGoto}>
          <h3>{copy.goto.title}</h3>
          <Dropdown
            label={copy.goto.target}
            onChange={(event) => setTargetId(event.currentTarget.value)}
            options={gotoTargets.map((target) => ({
              label: targetName(target),
              value: target.id,
            }))}
            value={targetId}
          />
          <p className="operator-note">{copy.goto.fixedOnly}</p>
          <Button disabled={disabled || !targetId} type="submit" variant="secondary">
            {copy.goto.submit}
          </Button>
        </form>

        <form className="operator-form" onSubmit={onFocus}>
          <h3>{copy.focus.title}</h3>
          <Dropdown
            label={copy.focus.mode}
            onChange={(event) => setFocusMode(event.currentTarget.value as FocusMode)}
            options={[
              { label: copy.focus.AUTOFOCUS, value: "AUTOFOCUS" },
              { label: copy.focus.ABSOLUTE, value: "ABSOLUTE" },
            ]}
            value={focusMode}
          />
          {focusMode === "ABSOLUTE" && (
            <Field htmlFor="focus-position" label={copy.focus.position}>
              <TextInput
                id="focus-position"
                inputMode="numeric"
                onChange={(event) => setFocusPosition(event.currentTarget.value)}
                pattern="[0-9]+"
                required
                value={focusPosition}
              />
            </Field>
          )}
          <Button
            disabled={
              disabled || (focusMode === "ABSOLUTE" && !/^\d+$/.test(focusPosition))
            }
            type="submit"
            variant="secondary"
          >
            {copy.focus.submit}
          </Button>
        </form>

        <form className="operator-form" onSubmit={onCapture}>
          <h3>{copy.capture.title}</h3>
          <Dropdown
            label={copy.capture.profile}
            onChange={(event) => setProfile(event.currentTarget.value as ImagingProfile)}
            options={Object.values(imagingProfiles).map((value) => ({
              label: value,
              value,
            }))}
            value={profile}
          />
          <Field htmlFor="capture-frames" label={copy.capture.frames}>
            <TextInput
              id="capture-frames"
              inputMode="numeric"
              onChange={(event) => setFrames(event.currentTarget.value)}
              pattern="[1-9][0-9]*"
              value={frames}
            />
          </Field>
          <Button
            disabled={disabled || (frames !== "" && !/^[1-9]\d*$/.test(frames))}
            type="submit"
            variant="secondary"
          >
            {copy.capture.submit}
          </Button>
        </form>

        <div className="operator-form">
          <h3>{copy.abort.title}</h3>
          <p className="operator-note">{copy.abort.detail}</p>
          <Button
            disabled={disabled}
            onClick={() =>
              send(copy.abort.title, { kind: "ABORT", reason: reason.trim() })
            }
            variant="danger"
          >
            {copy.abort.submit}
          </Button>
        </div>
      </div>

      {result && (
        <p
          className={result.ok ? "operator-tone-info" : "operator-tone-error"}
          role="status"
        >
          {result.text}
        </p>
      )}
    </section>
  );
}
