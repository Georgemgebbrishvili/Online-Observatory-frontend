"use client";

import { zPurchaseGiftVoucherResponse } from "@darkview/contracts/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { checkoutTarget } from "@/features/booking/checkout";
import type { Locale } from "@/i18n/config";
import { giftCopy } from "@/i18n/resources/gift";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

export type GiftFormPhase = "idle" | "buying" | "redirecting";
export type GiftFormRefusal = "notConfigured" | "invalid" | "failed";

/**
 * Clients ADR-067: who the gift is for, then the checkout. Everything is optional; the
 * platform prices it and refuses a length it does not sell.
 */
export function GiftForm({
  durationMinutes,
  locale,
}: {
  durationMinutes: number;
  locale: Locale;
}) {
  const [phase, setPhase] = useState<GiftFormPhase>("idle");
  const [refusal, setRefusal] = useState<GiftFormRefusal | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase !== "idle") return;
    const form = new FormData(event.currentTarget);
    const text = (name: string) => {
      const value = String(form.get(name) ?? "").trim();
      return value ? value : undefined;
    };
    setPhase("buying");
    setRefusal(null);
    try {
      const { voucher, paymentIntent } = await apiRequest("/vouchers", {
        method: "POST",
        body: {
          durationMinutes,
          recipientName: text("recipientName"),
          recipientEmail: text("recipientEmail"),
          message: text("message"),
        },
        schema: zPurchaseGiftVoucherResponse,
      });
      setPhase("redirecting");
      const checkout = paymentIntent.redirectUrl
        ? checkoutTarget(paymentIntent.redirectUrl, window.location.origin)
        : null;
      // A full navigation: the checkout is not a page of this app.
      navigateWithFreshSession(checkout ?? `/${locale}/gift/${voucher.id}`);
    } catch (error) {
      setPhase("idle");
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(`/${locale}/sign-in`);
        return;
      }
      setRefusal(
        error instanceof ApiRequestError && error.status === 503
          ? "notConfigured"
          : error instanceof ApiRequestError && error.status === 422
            ? "invalid"
            : "failed",
      );
    }
  }

  return (
    <GiftFormView locale={locale} phase={phase} refusal={refusal} onSubmit={submit} />
  );
}

export function GiftFormView({
  locale,
  onSubmit,
  phase,
  refusal,
}: {
  locale: Locale;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  phase: GiftFormPhase;
  refusal: GiftFormRefusal | null;
}) {
  const copy = giftCopy[locale];
  const busy = phase !== "idle";
  return (
    <form className="gift-form" onSubmit={onSubmit} aria-busy={busy || undefined}>
      <fieldset disabled={busy}>
        <legend>{copy.form.legend}</legend>
        <label className="field">
          <span className="field-label">{copy.form.name}</span>
          <input
            className="field-input"
            name="recipientName"
            maxLength={100}
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span className="field-label">{copy.form.email}</span>
          <input
            className="field-input"
            name="recipientEmail"
            type="email"
            maxLength={254}
            autoComplete="off"
          />
          <span className="field-hint">{copy.form.emailHint}</span>
        </label>
        <label className="field">
          <span className="field-label">{copy.form.message}</span>
          <textarea className="field-input" name="message" maxLength={500} rows={3} />
          <span className="field-hint">{copy.form.messageHint}</span>
        </label>
      </fieldset>
      <Button type="submit" size="large" loading={busy} disabled={busy}>
        {phase === "buying"
          ? copy.form.buying
          : phase === "redirecting"
            ? copy.form.redirecting
            : copy.form.buy}
      </Button>
      {refusal && (
        <p className="booking-feedback" role="alert">
          {copy.refused[refusal]}
        </p>
      )}
    </form>
  );
}
