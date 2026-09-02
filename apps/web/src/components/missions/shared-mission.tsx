"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatElapsedTime } from "@/features/live/live-data";
import {
  joinSharedMissionAction,
  leaveMissionPresenceAction,
  leaveSharedMissionAction,
  recordMissionPresenceAction,
  saveSharedCaptureAction,
} from "@/features/shared-observations/actions";
import type { SharedMissionView } from "@/features/shared-observations/data";
import type { Locale } from "@/i18n/config";
import { sharedObservationCopy } from "@/i18n/resources/shared-observation";

type SharedMissionProps = {
  csrfToken: string;
  locale: Locale;
  mission: SharedMissionView;
};

export function SharedMission({ csrfToken, locale, mission }: SharedMissionProps) {
  const copy = sharedObservationCopy[locale];
  const [elapsedSeconds, setElapsedSeconds] = useState(mission.initialElapsedSeconds);
  const [viewerCount, setViewerCount] = useState(mission.viewerCount);
  const [joined, setJoined] = useState(mission.participantStatus === "JOINED");
  const [savedCaptures, setSavedCaptures] = useState<Set<string>>(new Set());
  const [saveableCaptures, setSaveableCaptures] = useState<Set<string>>(
    () =>
      new Set(
        mission.captures
          .filter((capture) => capture.canSave)
          .map((capture) => capture.id),
      ),
  );
  const [actionError, setActionError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<"JOIN" | "LEAVE" | string | null>(
    null,
  );
  const targetName =
    locale === "ka" ? mission.target.georgianName : mission.target.commonName;
  const observatoryName =
    locale === "ka" ? mission.observatory.nameKa : mission.observatory.nameEn;
  const actionInput = { missionId: mission.id, locale, csrfToken };
  const stateLabel = copy.states[mission.state];

  useEffect(() => {
    const presenceInput = { missionId: mission.id, locale, csrfToken };
    const elapsedTimer = window.setInterval(
      () => setElapsedSeconds((seconds) => seconds + 1),
      1000,
    );

    function recordPresence() {
      void recordMissionPresenceAction(presenceInput)
        .then((result) => setViewerCount(result.viewerCount))
        .catch(() => setActionError(true));
    }

    recordPresence();
    const presenceTimer = window.setInterval(recordPresence, 25_000);

    return () => {
      window.clearInterval(elapsedTimer);
      window.clearInterval(presenceTimer);
      void leaveMissionPresenceAction(presenceInput);
    };
  }, [csrfToken, locale, mission.id]);

  async function changeParticipation(nextJoined: boolean) {
    setActionError(false);
    setPendingAction(nextJoined ? "JOIN" : "LEAVE");
    setIsPending(true);
    try {
      if (nextJoined) {
        const result = await joinSharedMissionAction(actionInput);
        setSaveableCaptures(new Set(result.saveableCaptureIds));
      } else {
        await leaveSharedMissionAction(actionInput);
        setSaveableCaptures(new Set());
      }
      setJoined(nextJoined);
    } catch {
      setActionError(true);
    } finally {
      setPendingAction(null);
      setIsPending(false);
    }
  }

  async function saveCapture(captureId: string) {
    setActionError(false);
    setPendingAction(captureId);
    setIsPending(true);
    try {
      await saveSharedCaptureAction({ ...actionInput, captureId });
      setSavedCaptures((current) => {
        const next = new Set(current);
        next.add(captureId);
        return next;
      });
    } catch {
      setActionError(true);
    } finally {
      setPendingAction(null);
      setIsPending(false);
    }
  }

  return (
    <article className="shared-mission-page">
      <header className="shared-mission-header">
        <Link href={`/${locale}/app/live`}>
          <span aria-hidden="true">←</span> {copy.back}
        </Link>
        <div className="shared-live-identity">
          <span className="shared-live-dot" aria-hidden="true" />
          <strong>{copy.live}</strong>
          {mission.simulated && <small>{copy.simulated}</small>}
        </div>
        <div className="shared-viewer-count" aria-live="polite">
          <strong>{viewerCount.toLocaleString(locale)}</strong>
          <span>{copy.viewers}</span>
        </div>
      </header>

      <section className="shared-observation-stage" aria-labelledby="shared-target-title">
        <div className="shared-stage-copy">
          <p>
            {mission.target.catalogId} · {stateLabel}
          </p>
          <h1 id="shared-target-title">{targetName}</h1>
          <span>{observatoryName}</span>
        </div>

        <div
          className="shared-optical-view"
          role="img"
          aria-label={`${targetName} · ${stateLabel}`}
        >
          {mission.captures[0] ? (
            <Image
              src={mission.captures[0].thumbnailUrl}
              alt=""
              fill
              preload
              sizes="(min-width: 70rem) 68vw, 100vw"
              unoptimized
            />
          ) : (
            <span className="shared-target-placeholder" aria-hidden="true">
              <i />
            </span>
          )}
          <span className="shared-optical-ring shared-ring-outer" aria-hidden="true" />
          <span className="shared-optical-ring shared-ring-inner" aria-hidden="true" />
          <span className="shared-reticle-horizontal" aria-hidden="true" />
          <span className="shared-reticle-vertical" aria-hidden="true" />
          <div className="shared-state-readout">
            <span>{copy.state}</span>
            <strong>{stateLabel}</strong>
          </div>
        </div>

        <dl className="shared-mission-readouts">
          <div>
            <dt>{copy.elapsed}</dt>
            <dd>{formatElapsedTime(elapsedSeconds)}</dd>
          </div>
          <div>
            <dt>{copy.owner}</dt>
            <dd>{mission.ownerName}</dd>
          </div>
          <div>
            <dt>{copy.telescope}</dt>
            <dd>{mission.telescope}</dd>
          </div>
          <div>
            <dt>{copy.observatory}</dt>
            <dd>{observatoryName}</dd>
          </div>
        </dl>
      </section>

      <div className="shared-mission-lower">
        <section className="shared-access-panel" aria-labelledby="shared-access-title">
          <div className="shared-access-icon" aria-hidden="true">
            <span />
          </div>
          <div>
            <p>{mission.canControl ? copy.controller : copy.readOnly}</p>
            <h2 id="shared-access-title">
              {mission.canControl
                ? copy.controllerDescription
                : joined
                  ? copy.joined
                  : copy.watchOnly}
            </h2>
            <span>
              {mission.canControl
                ? copy.readOnlyDescription
                : joined
                  ? copy.joinedDescription
                  : copy.joinDescription}
            </span>
            {!mission.canControl && <small>{copy.readOnlyDescription}</small>}
          </div>
          {!mission.canControl && mission.canJoin && (
            <button
              type="button"
              className={`button ${joined ? "button-secondary" : "button-primary"} button-large`}
              disabled={isPending}
              onClick={() => void changeParticipation(!joined)}
            >
              <span>
                {pendingAction === "JOIN"
                  ? copy.joining
                  : pendingAction === "LEAVE"
                    ? copy.leaving
                    : joined
                      ? copy.leave
                      : copy.join}
              </span>
            </button>
          )}
        </section>

        <section className="shared-captures" aria-labelledby="shared-captures-title">
          <header>
            <div>
              <p>02</p>
              <h2 id="shared-captures-title">{copy.captures}</h2>
            </div>
            <span>{copy.capturesDescription}</span>
          </header>

          {mission.captures.length === 0 ? (
            <p className="shared-captures-empty">{copy.noCaptures}</p>
          ) : (
            <div className="shared-capture-grid">
              {mission.captures.map((capture) => {
                const saved = savedCaptures.has(capture.id);
                const canSave =
                  joined &&
                  mission.allowSharedCaptures &&
                  saveableCaptures.has(capture.id);
                return (
                  <article key={capture.id}>
                    <div className="shared-capture-image">
                      <Image
                        src={capture.thumbnailUrl}
                        alt={targetName}
                        fill
                        sizes="(min-width: 60rem) 22rem, 100vw"
                        unoptimized
                      />
                    </div>
                    <div className="shared-capture-meta">
                      <div>
                        <span>{copy.presets[capture.processingPreset]}</span>
                        <strong>{targetName}</strong>
                      </div>
                      <button
                        type="button"
                        disabled={!canSave || saved || isPending}
                        onClick={() => void saveCapture(capture.id)}
                      >
                        {saved
                          ? copy.saved
                          : pendingAction === capture.id
                            ? copy.saving
                            : !joined
                              ? copy.joinToSave
                              : canSave
                                ? copy.save
                                : copy.unavailable}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {actionError && (
        <p className="shared-action-error" role="alert">
          {copy.actionError}
        </p>
      )}
    </article>
  );
}
