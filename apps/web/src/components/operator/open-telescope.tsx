"use client";

import type { TestMission } from "@darkview/contracts";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { scheduleTestMission } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";
import { ApiRequestError } from "@/lib/platform/browser";

const SESSION_MINUTES = 60;

/** Refusals that another observatory may not give: nothing up here, or a customer's time. */
const TRY_NEXT = new Set(["SAFETY_REFUSED", "SLOT_UNAVAILABLE"]);

/**
 * Platform ADR-082: an operator's free hour on the first observatory that will give
 * one, then straight into its room. An operator already in a session there gets it
 * back, so reopening this page returns to the same room.
 */
export function OpenTelescope({
  copy,
  locale,
  observatoryIds,
}: {
  copy: OperatorCopy["openTelescope"];
  locale: Locale;
  observatoryIds: readonly string[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const opened = useRef(false);

  const open = useCallback(async () => {
    setError(null);
    let first: unknown = null;
    for (const observatoryId of observatoryIds) {
      let session: TestMission;
      try {
        session = await scheduleTestMission(observatoryId, {
          durationMinutes: SESSION_MINUTES,
        });
      } catch (failure) {
        first ??= failure;
        const code = failure instanceof ApiRequestError ? failure.error?.code : null;
        if (code && TRY_NEXT.has(code)) continue;
        break;
      }
      router.replace(`/${locale}/app/missions/${session.missionId}/session`);
      return;
    }
    const message =
      first instanceof ApiRequestError
        ? (first.error?.message ?? String(first.status))
        : "";
    setError(fill(copy.failed, { message }));
  }, [copy.failed, locale, observatoryIds, router]);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    void open();
  }, [open]);

  return (
    <section
      className="surface-panel operator-open-telescope"
      aria-labelledby="operator-open-telescope-title"
    >
      <h2 id="operator-open-telescope-title">{copy.title}</h2>
      <p>{copy.detail}</p>
      {error ? (
        <>
          <p className="operator-tone-error" role="alert">
            {error}
          </p>
          <Button onClick={() => void open()}>{copy.retry}</Button>
        </>
      ) : (
        <p role="status">{copy.opening}</p>
      )}
    </section>
  );
}
