"use client";

import type { OperatorObservatoryState } from "@darkview/contracts";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchObservatoryState } from "@/features/operator/api";
import type { Locale } from "@/i18n/config";
import { ApiRequestError, navigateWithFreshSession } from "@/lib/platform/browser";

/**
 * ADR-017: GET /admin/observatories/{id}/state reads the sample the realtime
 * service holds for the live agent link, and releases it when the link closes.
 * Polling it reads the link, not a cache: when the link is gone the answer is
 * 503, and the console shows no telemetry rather than the last it saw.
 */
export const POLL_INTERVAL_MS = 1000;

type Sample = { state: OperatorObservatoryState; receivedAt: number };

export type ConsoleReading =
  | { kind: "waiting" }
  | ({ kind: "live" } & Sample)
  | { kind: "offline" }
  | { kind: "not-configured" }
  // The API itself did not answer: the last sample is kept, with its age shown.
  | { kind: "unreachable"; last: Sample | null };

type ConsoleContextValue = {
  observatoryId: string;
  locale: Locale;
  reading: ConsoleReading;
  now: number;
  accept: (state: OperatorObservatoryState) => void;
};

const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function useOperatorConsole() {
  const value = useContext(ConsoleContext);
  if (!value) throw new Error("useOperatorConsole outside OperatorConsoleProvider");
  return value;
}

export function liveState(reading: ConsoleReading) {
  if (reading.kind === "live") return reading.state;
  if (reading.kind === "unreachable") return reading.last?.state ?? null;
  return null;
}

export function OperatorConsoleProvider({
  children,
  locale,
  observatoryId,
}: {
  children: ReactNode;
  locale: Locale;
  observatoryId: string;
}) {
  const [reading, setReading] = useState<ConsoleReading>({ kind: "waiting" });
  const [now, setNow] = useState(() => Date.now());

  const accept = (state: OperatorObservatoryState) =>
    setReading({ kind: "live", state, receivedAt: Date.now() });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const state = await fetchObservatoryState(observatoryId);
        if (!cancelled) setReading({ kind: "live", state, receivedAt: Date.now() });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiRequestError && error.status === 401) {
          navigateWithFreshSession(`/${locale}/sign-in`);
          return;
        }
        if (error instanceof ApiRequestError && error.status === 403) {
          navigateWithFreshSession(`/${locale}/app`);
          return;
        }
        const code = error instanceof ApiRequestError ? error.error?.code : undefined;
        if (code === "OBSERVATORY_OFFLINE") setReading({ kind: "offline" });
        else if (code === "SAFETY_NOT_CONFIGURED") setReading({ kind: "not-configured" });
        else
          setReading((previous) => ({
            kind: "unreachable",
            last:
              previous.kind === "live"
                ? { state: previous.state, receivedAt: previous.receivedAt }
                : previous.kind === "unreachable"
                  ? previous.last
                  : null,
          }));
      }
      if (!cancelled) {
        setNow(Date.now());
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [locale, observatoryId]);

  return (
    <ConsoleContext.Provider value={{ observatoryId, locale, reading, now, accept }}>
      {children}
    </ConsoleContext.Provider>
  );
}
