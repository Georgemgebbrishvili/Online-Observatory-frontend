"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { adjustLoyaltyPoints } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * DV-092: add or remove points with a reason. The adjustment id is made once per
 * attempt, so a retried press after a timeout is a no-op on the platform, and a new one
 * after an answer.
 */
export function LoyaltyAdjustment({ copy }: { copy: OperatorCopy["loyalty"] }) {
  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [adjustmentId, setAdjustmentId] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(points);
    const why = reason.trim();
    if (!UUID.test(userId.trim()) || !Number.isInteger(amount) || amount === 0 || why.length < 3 || why.length > 500) {
      setOutcome({ tone: "error", text: copy.invalid });
      return;
    }
    setPending(true);
    setOutcome(null);
    try {
      const account = await adjustLoyaltyPoints({
        adjustmentId,
        userId: userId.trim(),
        points: amount,
        reason: why,
      });
      setOutcome({
        tone: "ok",
        text: fill(copy.done, { name: account.userId, balance: String(account.balance) }),
      });
      setAdjustmentId(crypto.randomUUID());
      setPoints("");
      setReason("");
    } catch (failure) {
      const status = failure instanceof ApiRequestError ? failure.status : 0;
      // An answer, even a refusal, settles this id; a timeout keeps it for the retry.
      if (status) setAdjustmentId(crypto.randomUUID());
      setOutcome({
        tone: "error",
        text:
          status === 404
            ? copy.notFound
            : status === 409
              ? copy.negative
              : status === 403
                ? copy.forbidden
                : status === 422
                  ? copy.invalid
                  : fill(copy.failed, {
                      message: failure instanceof ApiRequestError ? (failure.error?.message ?? "") : "",
                    }),
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="surface-panel operator-loyalty" aria-labelledby="operator-loyalty-title">
      <h2 id="operator-loyalty-title">{copy.title}</h2>
      <p className="operator-note">{copy.detail}</p>
      <form className="operator-form" onSubmit={submit} noValidate>
        <Field htmlFor="loyalty-user" label={copy.user} hint={copy.userHint}>
          <TextInput
            id="loyalty-user"
            name="userId"
            className="data"
            autoComplete="off"
            spellCheck={false}
            value={userId}
            onChange={(event) => setUserId(event.currentTarget.value)}
          />
        </Field>
        <Field htmlFor="loyalty-points" label={copy.points} hint={copy.pointsHint}>
          <TextInput
            id="loyalty-points"
            name="points"
            inputMode="numeric"
            value={points}
            onChange={(event) => setPoints(event.currentTarget.value.replace(/[^\d-]/g, ""))}
          />
        </Field>
        <Field htmlFor="loyalty-reason" label={copy.reason} hint={copy.reasonHint}>
          <TextInput
            id="loyalty-reason"
            name="reason"
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.currentTarget.value)}
          />
        </Field>
        <Button type="submit" loading={pending}>
          {copy.submit}
        </Button>
        {outcome && (
          <p
            className={outcome.tone === "error" ? "operator-tone-error" : undefined}
            role={outcome.tone === "error" ? "alert" : "status"}
          >
            {outcome.text}
          </p>
        )}
      </form>
    </section>
  );
}
