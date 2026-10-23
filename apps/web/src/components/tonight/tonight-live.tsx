"use client";

import type { TonightSession } from "@darkview/contracts";
import { useEffect, useId, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { tonightCopy } from "@/i18n/resources/tonight";

/**
 * Clients ADR-066: the spectator view. An `<img>` plays the MJPEG stream (ADR-011); when
 * it fails -- the twenty are watching, or the session just closed -- it says so and
 * offers to try again or to book. A simulated stream is badged.
 */
export function TonightLive({
  initiallyFailed = false,
  label,
  locale,
  session,
}: {
  /** For /design-system's specimen of the full or ended view. */
  initiallyFailed?: boolean;
  /** Only where several are on one page, as on /design-system. */
  label?: string;
  locale: Locale;
  session: TonightSession;
}) {
  const copy = tonightCopy[locale];
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(initiallyFailed);
  const titleId = useId();
  const stream = useRef<HTMLImageElement>(null);
  // An answer that failed before hydration fired its error event before React listened.
  useEffect(() => {
    const image = stream.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [attempt]);
  const target = locale === "ka" ? session.target.nameKa : session.target.nameEn;
  const simulated = session.mode === "SIMULATED";
  const endsAt = session.endsAt
    ? new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Asia/Tbilisi",
      }).format(new Date(session.endsAt))
    : null;

  return (
    <section
      className="tonight-live"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <header className="tonight-live-header">
        <p className="kicker">{copy.liveNow}</p>
        <h2 id={titleId}>{fill(copy.watching, { target })}</h2>
        <p className="tonight-state">{copy.states[session.state] ?? ""}</p>
        {endsAt && (
          <p className="tonight-ends data">{fill(copy.endsAt, { time: endsAt })}</p>
        )}
      </header>
      <div className="tonight-feed" data-tonight-feed={failed ? "unavailable" : "live"}>
        {failed ? (
          <div className="tonight-unavailable" role="status">
            <p>{copy.unavailable}</p>
            <div className="tonight-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setFailed(false);
                  setAttempt((value) => value + 1);
                }}
              >
                {copy.retry}
              </Button>
              <ButtonLink href={`/${locale}/app/book`}>{copy.book}</ButtonLink>
            </div>
          </div>
        ) : (
          <>
            {/* multipart/x-mixed-replace: an <img> is the whole player (ADR-011). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={attempt}
              ref={stream}
              src={
                attempt ? `${session.streamPath}?attempt=${attempt}` : session.streamPath
              }
              alt={fill(simulated ? copy.streamAltSimulated : copy.streamAlt, { target })}
              onError={() => setFailed(true)}
              data-tonight-stream=""
            />
            {simulated && (
              <span className="tonight-badge">
                <span className="capture-simulated">{copy.simulated}</span>
              </span>
            )}
          </>
        )}
      </div>
      <p className="tonight-rate">{copy.rate}</p>
      <ButtonLink href={`/${locale}/app/book`}>{copy.book}</ButtonLink>
    </section>
  );
}
