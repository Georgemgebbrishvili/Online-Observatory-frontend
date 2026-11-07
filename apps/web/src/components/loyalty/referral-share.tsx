"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { referralLink } from "@/features/loyalty/club";
import type { Locale } from "@/i18n/config";
import { loyaltyCopy } from "@/i18n/resources/loyalty";

const noop = () => () => {};

/** The member's code, its register link, and copy / share (ADR-084 §2). */
export function ReferralShare({ code, locale }: { code: string; locale: Locale }) {
  const copy = loyaltyCopy[locale].referral;
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  // Read in the browser; the server render has neither, and hydration agrees with it.
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(
    noop,
    () => typeof navigator.share === "function",
    () => false,
  );

  const link = origin ? referralLink(origin, locale, code) : `/${locale}/register?ref=${encodeURIComponent(code)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setNotice("copied");
    } catch {
      setNotice("failed");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: copy.title, text: copy.shareText, url: link });
    } catch {
      // A dismissed share sheet is not a failure.
    }
  }

  return (
    <section className="surface-panel club-panel club-referral" aria-labelledby="club-referral-title">
      <h2 id="club-referral-title">{copy.title}</h2>
      <p>{copy.lede}</p>
      <p className="club-code">
        <span>{copy.code}</span>
        <strong className="data" data-field="referral-code">
          {code}
        </strong>
      </p>
      <input
        className="field-input data club-link"
        readOnly
        value={link}
        aria-label={copy.copy}
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="club-referral-actions">
        <Button variant="primary" onClick={() => void copyLink()}>
          {copy.copy}
        </Button>
        {canShare && (
          <Button variant="secondary" onClick={() => void share()}>
            {copy.share}
          </Button>
        )}
      </div>
      <p className="club-notice" role="status">
        {notice === "copied" ? copy.copied : notice === "failed" ? copy.failed : ""}
      </p>
    </section>
  );
}
