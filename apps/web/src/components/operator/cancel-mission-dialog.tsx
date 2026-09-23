"use client";

import type { AdminCancelMissionRequest, Mission } from "@darkview/contracts";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, TextArea } from "@/components/ui/form";
import { cancelMission } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import { describe } from "@/features/operator/use-paged-list";
import type { OperatorCopy } from "@/i18n/resources/operator";

// AdminCancelMissionRequest.reason: minLength 4.
const MINIMUM_REASON = 4;

const resolutions: AdminCancelMissionRequest["resolution"][] = [
  "REFUND",
  "RESCHEDULE",
  "NONE",
];

/**
 * A force-cancel decides how the booking is settled, so the settlement is an explicit
 * choice with no default that quietly refunds or quietly does not.
 */
export function CancelMissionDialog({
  copy,
  mission,
  onCancelled,
  onClose,
}: {
  copy: OperatorCopy;
  mission: Mission;
  onCancelled: (mission: Mission) => void;
  onClose: () => void;
}) {
  const text = copy.missions;
  const [resolution, setResolution] =
    useState<AdminCancelMissionRequest["resolution"]>("NONE");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dialog = event.currentTarget.closest("dialog");
    setPending(true);
    setError(null);
    try {
      const updated = await cancelMission(mission.id, {
        reason: reason.trim(),
        resolution,
      });
      onCancelled(updated);
      setReason("");
      dialog?.close();
    } catch (cause) {
      setError(fill(text.cancelFailed, { message: describe(cause) }));
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      closeLabel={text.close}
      description={text.cancelDetail}
      onClose={onClose}
      open
      title={text.cancelTitle}
    >
      <form className="operator-form" onSubmit={submit}>
        <Dropdown
          label={text.resolution}
          onChange={(event) =>
            setResolution(
              event.currentTarget.value as AdminCancelMissionRequest["resolution"],
            )
          }
          options={resolutions.map((value) => ({
            label: text.resolutions[value],
            value,
          }))}
          value={resolution}
        />
        <Field htmlFor="cancel-reason" hint={text.reasonHint} label={text.reason}>
          <TextArea
            id="cancel-reason"
            minLength={MINIMUM_REASON}
            onChange={(event) => setReason(event.currentTarget.value)}
            required
            value={reason}
          />
        </Field>
        <Button
          disabled={reason.trim().length < MINIMUM_REASON || pending}
          loading={pending}
          type="submit"
          variant="danger"
        >
          {text.submitCancel}
        </Button>
        {error && (
          <p className="operator-tone-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
