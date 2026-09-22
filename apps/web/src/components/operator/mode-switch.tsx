"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Checkbox, Field, TextArea } from "@/components/ui/form";
import { setObservatoryMode } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

import { liveState, useOperatorConsole } from "./console-provider";

const MINIMUM_REASON = 8;

/**
 * SetObservatoryModeRequest: REAL needs a written reason and an affirmative
 * attended-presence confirmation. The confirmation is a box the operator ticks
 * each time, never a default — a background process must not be able to set it.
 */
export function ModeSwitch({ copy }: { copy: OperatorCopy["switcher"] }) {
  const { accept, observatoryId, reading } = useOperatorConsole();
  const mode = liveState(reading)?.telemetry.mode ?? null;
  const target = mode === "REAL" ? "SIMULATED" : "REAL";
  const [attended, setAttended] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const ready =
    reason.trim().length >= MINIMUM_REASON &&
    (target === "SIMULATED" || attended) &&
    !pending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dialog = event.currentTarget.closest("dialog");
    setPending(true);
    try {
      const state = await setObservatoryMode(observatoryId, {
        mode: target,
        reason: reason.trim(),
        attendedOperatorPresent: target === "REAL" ? attended : false,
      });
      accept(state);
      setResult({ ok: true, text: fill(copy.changed, { mode: state.telemetry.mode }) });
      setAttended(false);
      setReason("");
      dialog?.close();
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? (error.error?.message ?? String(error.status))
          : "";
      setResult({ ok: false, text: fill(copy.failed, { message }) });
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className="surface-panel operator-mode-switch"
      aria-labelledby="operator-mode-title"
    >
      <h2 id="operator-mode-title">{copy.title}</h2>
      <p>
        {copy.current}: <strong className="data">{mode ?? "—"}</strong>
      </p>
      {mode && (
        <Modal
          closeLabel={copy.close}
          description={target === "REAL" ? undefined : copy.simulatedDetail}
          title={target === "REAL" ? copy.realTitle : copy.simulatedTitle}
          triggerLabel={target === "REAL" ? copy.toReal : copy.toSimulated}
        >
          <form className="operator-form" onSubmit={submit}>
            {target === "REAL" && (
              <>
                <p className="operator-warning" role="note">
                  {copy.realWarning}
                </p>
                <Checkbox
                  checked={attended}
                  label={copy.attended}
                  onChange={(event) => setAttended(event.currentTarget.checked)}
                />
              </>
            )}
            <Field htmlFor="mode-reason" label={copy.reason} hint={copy.reasonHint}>
              <TextArea
                id="mode-reason"
                minLength={MINIMUM_REASON}
                onChange={(event) => setReason(event.currentTarget.value)}
                required
                value={reason}
              />
            </Field>
            <Button
              disabled={!ready}
              loading={pending}
              type="submit"
              variant={target === "REAL" ? "danger" : "primary"}
            >
              {target === "REAL" ? copy.submitReal : copy.submitSimulated}
            </Button>
            {result && !result.ok && (
              <p className="operator-tone-error" role="alert">
                {result.text}
              </p>
            )}
          </form>
        </Modal>
      )}
      {result?.ok && <p role="status">{result.text}</p>}
    </section>
  );
}
