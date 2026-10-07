"use client";

import type { Locale } from "@darkview/contracts";
import {
  zCreateBookingResponse,
  zRescheduleBookingResponse,
} from "@darkview/contracts/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { checkoutTarget } from "@/features/booking/checkout";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";
import type { ReserveFormCopy } from "@/i18n/resources/reserve";

export type ReserveChoice = {
  id: string;
  name: string;
  detail: string;
};

type ReserveFormProps = {
  observatoryId: string;
  slotStartAt: string;
  durationMinutes: number;
  choices: ReserveChoice[];
  locale: Locale;
  signInPath: string;
  copy: ReserveFormCopy;
  /** A lost booking being replaced for free: its slot is claimed, not bought. */
  replacing?: { bookingId: string; targetId: string };
};

export type ReservePhase = "idle" | "reserving" | "redirecting";
type Phase = ReservePhase;

type ReserveFormViewProps = {
  choices: ReserveChoice[];
  copy: ReserveFormCopy;
  targetId: string | null;
  phase: ReservePhase;
  feedback: string | null;
  onChoose?: (targetId: string) => void;
  onSubmit?: (event: React.FormEvent) => void;
};

/** The form in one state, drawn from props alone: the design system shows each. */
export function ReserveFormView({
  choices,
  copy,
  feedback,
  onChoose,
  onSubmit,
  phase,
  targetId,
}: ReserveFormViewProps) {
  return (
    <form className="reserve-form" onSubmit={onSubmit}>
      <fieldset disabled={phase !== "idle"}>
        <legend>{copy.choose}</legend>
        <ul className="reserve-choices">
          {choices.map((choice) => (
            <li key={choice.id}>
              <label className="reserve-choice">
                <input
                  type="radio"
                  name="target"
                  value={choice.id}
                  checked={targetId === choice.id}
                  onChange={() => onChoose?.(choice.id)}
                />
                <span className="reserve-choice-name">{choice.name}</span>
                <span className="reserve-choice-detail">{choice.detail}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <Button type="submit" size="large" disabled={!targetId} loading={phase !== "idle"}>
        {phase === "reserving"
          ? copy.reserving
          : phase === "redirecting"
            ? copy.redirecting
            : copy.reserve}
      </Button>
      {feedback && (
        <p className="booking-feedback" role="alert">
          {feedback}
        </p>
      )}
    </form>
  );
}

/**
 * The target, then `createBooking`. The Idempotency-Key is minted once per visit, so a
 * second press after a failure returns the booking the first one made, if it did, rather
 * than holding a second slot.
 *
 * Replacing a lost slot is `rescheduleBooking` instead, which takes no key: the
 * entitlement is claimed once, so a repeat is 409 CONFLICT, and that answer goes back to
 * the lost booking, which says what became of it.
 */
export function ReserveForm({
  choices,
  copy,
  durationMinutes,
  locale,
  observatoryId,
  replacing,
  signInPath,
  slotStartAt,
}: ReserveFormProps) {
  const [key] = useState(() => crypto.randomUUID());
  const [targetId, setTargetId] = useState<string | null>(
    choices.find((choice) => choice.id === replacing?.targetId)?.id ??
      (choices.length === 1 ? choices[0].id : null),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function reserve(event: React.FormEvent) {
    event.preventDefault();
    if (!targetId || phase !== "idle") return;
    setPhase("reserving");
    setFeedback(null);
    try {
      if (replacing) {
        const booking = await apiRequest(
          `/bookings/${encodeURIComponent(replacing.bookingId)}/reschedule`,
          {
            method: "POST",
            body: { slotStartAt, targetId },
            schema: zRescheduleBookingResponse,
          },
        );
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${booking.id}`);
        return;
      }
      const { booking, paymentIntent } = await apiRequest("/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: { observatoryId, targetId, slotStartAt, durationMinutes, locale },
        schema: zCreateBookingResponse,
      });
      const bookingPage = `/${locale}/app/bookings/${booking.id}`;
      const checkout = paymentIntent?.redirectUrl
        ? checkoutTarget(paymentIntent.redirectUrl, window.location.origin)
        : null;
      setPhase("redirecting");
      // A full navigation: the checkout is not a page of this app, and it sets cookies of
      // its own on the way back.
      navigateWithFreshSession(checkout ?? bookingPage);
    } catch (error) {
      setPhase("idle");
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const code = error instanceof ApiRequestError ? error.error?.code : undefined;
      if (replacing && code === "CONFLICT") {
        setPhase("redirecting");
        navigateWithFreshSession(`/${locale}/app/bookings/${replacing.bookingId}`);
        return;
      }
      setFeedback(
        code === "SLOT_UNAVAILABLE" || code === "CONFLICT"
          ? copy.taken
          : code === "WEATHER_HOLD"
            ? copy.weatherHold
            : code === "OBSERVATORY_OFFLINE"
              ? copy.offline
              : code === "TARGET_NOT_OBSERVABLE"
                ? copy.notObservable
                : copy.failed,
      );
    }
  }

  return (
    <ReserveFormView
      choices={choices}
      copy={copy}
      targetId={targetId}
      phase={phase}
      feedback={feedback}
      onChoose={setTargetId}
      onSubmit={reserve}
    />
  );
}
