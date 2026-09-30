"use client";

import { zCancelBookingResponse, zRefundBookingResponse } from "@darkview/contracts/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

export type BookingActionsCopy = {
  cancel: string;
  cancelQuestion: string;
  cancelConfirm: string;
  cancelKeep: string;
  cancelling: string;
  refund: string;
  refunding: string;
  changed: string;
  refundUnavailable: string;
  failed: string;
};

type Action = "cancel" | "refund";

type BookingActionsViewProps = {
  /** Only a PENDING_PAYMENT booking can be cancelled (`cancelMyBooking`). */
  cancellable: boolean;
  /** An OPEN entitlement: the slot was lost on our side. */
  refundable: boolean;
  confirming: boolean;
  pending: Action | null;
  feedback: string | null;
  copy: BookingActionsCopy;
  onAct?: (action: Action) => void;
  onConfirming?: (confirming: boolean) => void;
};

/** The controls in one state, drawn from props alone: the design system shows each. */
export function BookingActionsView({
  cancellable,
  confirming,
  copy,
  feedback,
  onAct,
  onConfirming,
  pending,
  refundable,
}: BookingActionsViewProps) {
  if (!cancellable && !refundable) return null;

  return (
    <div className="booking-actions">
      {refundable && (
        <Button
          size="large"
          loading={pending === "refund"}
          disabled={pending !== null}
          onClick={() => onAct?.("refund")}
        >
          {pending === "refund" ? copy.refunding : copy.refund}
        </Button>
      )}
      {cancellable &&
        (confirming ? (
          <div className="booking-confirm" role="group" aria-label={copy.cancelQuestion}>
            <p>{copy.cancelQuestion}</p>
            <div>
              <Button
                variant="danger"
                loading={pending === "cancel"}
                disabled={pending !== null}
                onClick={() => onAct?.("cancel")}
              >
                {pending === "cancel" ? copy.cancelling : copy.cancelConfirm}
              </Button>
              <Button
                variant="ghost"
                disabled={pending !== null}
                onClick={() => onConfirming?.(false)}
              >
                {copy.cancelKeep}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => onConfirming?.(true)}>
            {copy.cancel}
          </Button>
        ))}
      {feedback && (
        <p className="booking-feedback" role="alert">
          {feedback}
        </p>
      )}
    </div>
  );
}

type BookingActionsProps = Pick<
  BookingActionsViewProps,
  "cancellable" | "refundable" | "copy"
> & {
  bookingId: string;
  signInPath: string;
};

/**
 * Cancel and refund, each one request the customer asked for. Neither is retried by
 * itself: the platform's answer is shown, and the page is re-read when it succeeds.
 */
export function BookingActions({ bookingId, signInPath, ...props }: BookingActionsProps) {
  const { copy } = props;
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<Action | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function act(action: Action) {
    setPending(action);
    setFeedback(null);
    try {
      await apiRequest(`/bookings/${encodeURIComponent(bookingId)}/${action}`, {
        method: "POST",
        // CancelBookingRequest is optional and empty here; the refund takes no body.
        body: action === "cancel" ? {} : undefined,
        schema: action === "cancel" ? zCancelBookingResponse : zRefundBookingResponse,
      });
      setConfirming(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      setFeedback(
        error instanceof ApiRequestError && error.status === 409
          ? copy.changed
          : error instanceof ApiRequestError && error.status === 503
            ? copy.refundUnavailable
            : copy.failed,
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <BookingActionsView
      {...props}
      confirming={confirming}
      pending={pending}
      feedback={feedback}
      onAct={act}
      onConfirming={(next) => {
        setFeedback(null);
        setConfirming(next);
      }}
    />
  );
}
