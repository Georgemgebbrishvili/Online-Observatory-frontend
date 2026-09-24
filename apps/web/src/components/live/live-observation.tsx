"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  formatElapsedTime,
  type CaptureState,
  type LiveObservation,
  type ProcessingPreset,
} from "@/features/live/live-data";
import type { Locale } from "@/i18n/config";
import { liveObservationCopy } from "@/i18n/resources/live";

type LiveObservationViewProps = {
  locale: Locale;
  observation: LiveObservation;
  safeNudgeEnabled: boolean;
  canControl: boolean;
  sharedMissionUrl: string;
};

const presets: ProcessingPreset[] = ["NATURAL", "BRIGHT", "DETAIL"];

const SafeNudgeControl = dynamic(() =>
  import("@/components/live/safe-nudge-control").then(
    (module) => module.SafeNudgeControl,
  ),
);

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active ? (
        <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
      ) : (
        <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
      )}
    </svg>
  );
}

export function LiveObservationView({
  locale,
  observation,
  safeNudgeEnabled,
  canControl,
  sharedMissionUrl,
}: LiveObservationViewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(observation.initialElapsedSeconds);
  const [preset, setPreset] = useState<ProcessingPreset>("NATURAL");
  const [captureState, setCaptureState] = useState<CaptureState>("READY");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const copy = liveObservationCopy[locale];

  useEffect(() => {
    const timer = window.setInterval(
      () => setElapsedSeconds((seconds) => seconds + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      captureState !== "CAPTURING" &&
      captureState !== "PROCESSING" &&
      captureState !== "COMPLETE"
    ) {
      return;
    }

    const nextState: Record<Exclude<CaptureState, "READY">, CaptureState> = {
      CAPTURING: "PROCESSING",
      PROCESSING: "COMPLETE",
      COMPLETE: "READY",
    };
    const delay = captureState === "COMPLETE" ? 2400 : 1300;
    const timer = window.setTimeout(
      () => setCaptureState(nextState[captureState]),
      delay,
    );
    return () => window.clearTimeout(timer);
  }, [captureState]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewportRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    try {
      setFullscreenError(false);
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (viewportRef.current?.requestFullscreen) {
        await viewportRef.current.requestFullscreen();
      } else {
        setFullscreenError(true);
      }
    } catch {
      setFullscreenError(true);
    }
  }

  const isBusy = captureState === "CAPTURING" || captureState === "PROCESSING";

  return (
    <article className="live-page">
      <h1 className="visually-hidden">{copy.pageHeading(observation.target[locale])}</h1>
      <div
        ref={viewportRef}
        className="live-viewport"
        data-capture-state={captureState}
        data-preset={preset}
      >
        <div className="live-viewport-stars" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="live-viewport-top">
          <div className="live-broadcast-label">
            <span aria-hidden="true" />
            <strong>{copy.live}</strong>
            {observation.simulated && <small>{copy.demonstration}</small>}
          </div>
          <button
            type="button"
            className="live-fullscreen-button"
            aria-label={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
            onClick={toggleFullscreen}
          >
            <FullscreenIcon active={isFullscreen} />
          </button>
        </div>

        <dl className="live-viewport-identity">
          <div>
            <dt>{copy.observatory}</dt>
            <dd>{observation.observatory[locale]}</dd>
          </div>
          <div>
            <dt>{copy.target}</dt>
            <dd>{observation.target[locale]}</dd>
          </div>
          <div>
            <dt>{copy.status}</dt>
            <dd>
              <i aria-hidden="true" />
              {observation.telescopeState[locale]}
            </dd>
          </div>
        </dl>

        <div
          className="live-optical-field"
          role="img"
          aria-label={copy.viewportLabel(observation.target[locale])}
        >
          <span
            className="live-optical-axis live-optical-axis-horizontal"
            aria-hidden="true"
          />
          <span
            className="live-optical-axis live-optical-axis-vertical"
            aria-hidden="true"
          />
          <span
            className="live-optical-ring live-optical-ring-outer"
            aria-hidden="true"
          />
          <span
            className="live-optical-ring live-optical-ring-inner"
            aria-hidden="true"
          />
          <span className="live-saturn" aria-hidden="true">
            <i />
          </span>
          <span className="live-focus-point" aria-hidden="true" />
        </div>

        <div className="live-capture-readout" aria-live="polite">
          <span>{copy.exposure}</span>
          <strong>{copy.captureStates[captureState]}</strong>
        </div>
        <div className="live-viewport-scan" aria-hidden="true" />
      </div>

      {fullscreenError && (
        <p className="live-fullscreen-error" role="alert">
          {copy.fullscreenUnavailable}
        </p>
      )}

      <section className="live-instrument-panel" aria-label={copy.live}>
        <dl className="live-readouts">
          <div>
            <dt>{copy.elapsed}</dt>
            <dd className="live-time">{formatElapsedTime(elapsedSeconds)}</dd>
          </div>
          <div>
            <dt>{copy.telescope}</dt>
            <dd>
              <span className="live-readout-dot" />
              {observation.telescopeState[locale]}
            </dd>
          </div>
          <div>
            <dt>{copy.target}</dt>
            <dd>{observation.target[locale]}</dd>
          </div>
          <div>
            <dt>{copy.exposure}</dt>
            <dd>{copy.captureStates[captureState]}</dd>
          </div>
          <div>
            <dt>{copy.viewers}</dt>
            <dd>{observation.viewerCount.toLocaleString(locale)}</dd>
          </div>
          {observation.publicSharingEnabled && observation.missionOwner && (
            <div>
              <dt>{copy.owner}</dt>
              <dd>
                {observation.missionOwner} · {copy.shared}
              </dd>
            </div>
          )}
        </dl>

        <div className="live-controls">
          <div className="live-presets" role="group" aria-label={copy.presetsLabel}>
            {presets.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={preset === item}
                onClick={() => setPreset(item)}
              >
                <strong>{copy.presets[item].label}</strong>
                <span>{copy.presets[item].description}</span>
              </button>
            ))}
          </div>
          {canControl ? (
            <button
              type="button"
              className="live-capture-button"
              disabled={isBusy}
              onClick={() => setCaptureState("CAPTURING")}
            >
              <span className="live-capture-button-ring" aria-hidden="true">
                <i />
              </span>
              <strong>{copy.capture}</strong>
              <small>{copy.presets[preset].label}</small>
            </button>
          ) : (
            <Link
              className="button button-primary button-large live-watch-mission"
              href={sharedMissionUrl}
            >
              <span>{copy.watchMission}</span>
            </Link>
          )}
        </div>
      </section>

      {safeNudgeEnabled && canControl && (
        <>
          <p className="safe-nudge-feature-label">{copy.safeControl}</p>
          <SafeNudgeControl locale={locale} />
        </>
      )}
    </article>
  );
}
