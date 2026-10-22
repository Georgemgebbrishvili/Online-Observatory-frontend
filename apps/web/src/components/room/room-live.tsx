"use client";

import type {
  ImagingProfile,
  Mission,
  MissionEvent,
  TargetVisibility,
} from "@darkview/contracts";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  isStopped,
  liveAction,
  liveStatus,
  timeLeft,
  type LiveState,
} from "@/features/missions/live";
import { missionProgress, type FeedPlates } from "@/features/missions/room";
import { useLiveSession, useNow } from "@/features/missions/use-live-session";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { roomCopy } from "@/i18n/resources/room";
import { roomControlsCopy } from "@/i18n/resources/room-controls";
import { roomSharingCopy } from "@/i18n/resources/room-sharing";
import { statusCopy } from "@/i18n/resources/status";

import { LiveFeed } from "./live-feed";
import { MissionSteps } from "./mission-steps";
import {
  RoomCaptureAction,
  RoomControlsView,
  RoomSessionView,
  useRoomControls,
} from "./room-controls";
import { RoomSharing } from "./room-sharing";
import { RoomPointing } from "./room-pointing";
import { TargetPreview } from "./target-preview";

type RoomLiveProps = {
  locale: Locale;
  mission: Mission;
  events: MissionEvent[] | null;
  targetName: string;
  targetSlug: string | null;
  plate: string | null;
  timezone: string;
  /**
   * When the slot opens, formatted on the server: a browser without Georgian date data
   * would format it in English, and the render would not hydrate.
   */
  opensAtText: string | null;
  /** The target's profile, which a capture names; null when the target is no longer offered. */
  imagingProfile: ImagingProfile | null;
  /** The target tonight, for the pointing dial; null when it could not be read. */
  visibility: TargetVisibility | null;
  /** The instrument and the target, for the feed's corner plates. */
  plates?: FeedPlates | null;
  /** The observatory's readings, rendered on the server, beside the pointing dial. */
  readings: ReactNode;
  /** The captures panel, in the right column of the desk (ADR-050). */
  captures?: ReactNode;
  /** How many captures the mission has, for the phone's stats. */
  captureCount?: number;
  /** The captures and history, rendered on the server. */
  children: ReactNode;
};

type Copy = (typeof roomCopy)["en"];

/** Clock skew between this browser and the platform, at most. */
const slotEndedMarginMs = 5 * 60_000;

function describe(copy: Copy, live: LiveState, named: (text: string) => string) {
  const status = liveStatus(live);
  if (status === "refused") {
    const code = live.channelError ?? live.startError;
    return {
      title: copy.live.refused.title,
      description: (code && copy.live.refused.reasons[code]) ?? copy.live.refused.other,
    };
  }
  if (status === "not-started") return null;
  if (status === "stopped" && isStopped(live.missionState)) {
    return {
      title: copy.states[live.missionState].title,
      description: named(copy.live.stopped[live.missionState]),
    };
  }
  if (status === "live" && live.stream?.mode === "REAL") {
    return { title: copy.live.status.live.title, description: copy.live.liveReal };
  }
  const text = copy.live.status[status];
  return { title: text.title, description: named(text.description) };
}

/**
 * The room's live half (Phase 4 slice 2): the heading, the feed, the steps and the
 * pointing dial follow the mission channel, so they are rendered here; everything else
 * stays on the server.
 */
export function RoomLive({
  children,
  events,
  imagingProfile,
  locale,
  mission,
  opensAtText,
  plate,
  plates,
  readings,
  captures,
  captureCount = 0,
  targetName,
  targetSlug,
  timezone,
  visibility,
}: RoomLiveProps) {
  const copy = roomCopy[locale];
  const status = statusCopy[locale];
  const now = useNow();
  const { live, onStreamError, start } = useLiveSession({
    missionId: mission.id,
    state: mission.state,
    failureReason: mission.failureReason ?? null,
    locale,
  });

  const named = (template: string) => fill(template, { target: targetName });
  const state = live.missionState;
  const failureReason = live.failureReason;
  const history = [...(events ?? []), ...live.seen.map((seen) => ({ state: seen }))];
  const statuses = missionProgress(
    state,
    events === null && !live.seen.length ? null : history,
  );
  const reached = Math.max(
    statuses.findIndex((step) => step === "current" || step === "stopped"),
    state === "COMPLETE" ? 4 : 0,
  );

  // The heading follows the mission, but a heading changing is silent: the stage is
  // spoken through a status region, filled only on a change so the page is not read
  // twice on arrival (WCAG 4.1.3). The feed's own status line stays the one role=status.
  const [spokenState, setSpokenState] = useState(state);
  const [announcement, setAnnouncement] = useState("");
  if (state !== spokenState) {
    setSpokenState(state);
    setAnnouncement(
      [
        `${named(copy.states[state].title)}.`,
        named(copy.states[state].description),
        failureReason ? copy.reasons[failureReason] : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }

  const feedStatus = liveStatus(live);
  const opensAt = mission.scheduledStartAt ?? null;
  const slotOpen = now !== null && (opensAt === null || now >= Date.parse(opensAt));
  // The platform refuses a start with MISSION_NOT_ACTIVE both before a slot opens and
  // after it ends. Well past the opening it can only be the end, and pressing Start
  // again can never succeed.
  const slotEnded =
    live.startError === "MISSION_NOT_ACTIVE" &&
    opensAt !== null &&
    now !== null &&
    now > Date.parse(opensAt) + slotEndedMarginMs;
  const action = slotEnded ? null : liveAction(live);
  const pending = live.start === "pending";

  const text = (slotEnded ? copy.live.slotEnded : describe(copy, live, named)) ?? {
    title: copy.live.notStarted.title,
    description:
      opensAtText && !slotOpen
        ? fill(copy.live.notStarted.before, { time: opensAtText })
        : named(copy.live.notStarted.open),
  };

  const controlsCopy = roomControlsCopy[locale];
  const controls = useRoomControls({
    missionId: mission.id,
    missionState: state,
    connected:
      live.session !== null &&
      live.socket === "open" &&
      !live.expired &&
      live.channelError === null,
    verdicts: live.verdicts,
    imagingProfile,
    signInPath: `/${locale}/sign-in`,
  });

  // One primary action at a time: Start before the session, Capture during it, and
  // another night once the observation has stopped short.
  const button =
    feedStatus === "stopped" || slotEnded ? (
      <>
        {mission.bookingId && (
          <ButtonLink
            variant="secondary"
            href={`/${locale}/app/bookings/${encodeURIComponent(mission.bookingId)}`}
          >
            {copy.live.actions.booking}
          </ButtonLink>
        )}
        <ButtonLink href={`/${locale}/app/book`}>{copy.live.actions.book}</ButtonLink>
      </>
    ) : action === "start" || (pending && state === "SCHEDULED") ? (
      <Button
        size="large"
        onClick={() => void start()}
        disabled={!slotOpen}
        loading={pending}
      >
        {copy.live.actions.start}
      </Button>
    ) : action ? (
      <Button variant="secondary" onClick={() => void start()}>
        {action === "reopen" ? copy.live.actions.reopen : copy.live.actions.retry}
      </Button>
    ) : (
      <RoomCaptureAction {...controls} copy={controlsCopy} />
    );

  const [handOpen, setHandOpen] = useState(false);
  const altitude = live.pointing !== undefined ? live.pointing : visibility?.horizontal;

  const left =
    live.session &&
    !live.expired &&
    feedStatus !== "ended" &&
    feedStatus !== "stopped" &&
    now !== null
      ? timeLeft(live.session.expiresAt, now)
      : null;

  return (
    <>
      <div className="room-atmo" aria-hidden="true">
        <div className="room-atmo-glow" />
        <div className="room-atmo-aurora room-atmo-aurora-a" />
        <div className="room-atmo-aurora room-atmo-aurora-b" />
        <div className="room-atmo-aurora room-atmo-aurora-c" />
        <div className="room-atmo-dots" />
        <div className="room-atmo-ring" />
        <div className="room-atmo-ring room-atmo-ring-b" />
      </div>

      <div className="room-grid">
        <div className="room-col room-col-left">
          <section
            className="room-panel room-tonight"
            aria-labelledby="room-tonight-title"
          >
            <header className="room-head">
              {targetSlug && (
                <Link
                  className="room-back"
                  href={`/${locale}/app/missions/${targetSlug}`}
                >
                  <span aria-hidden="true">←</span> {named(copy.back)}
                </Link>
              )}
              <p className="eyebrow">
                <span aria-hidden="true" />
                {named(copy.eyebrow)}
              </p>
              <h1 id="room-tonight-title">{named(copy.states[state].title)}</h1>
              <p>{named(copy.states[state].description)}</p>
              {failureReason && (
                <p className="room-reason">{copy.reasons[failureReason]}</p>
              )}
              <p className="visually-hidden" aria-live="polite" aria-atomic="true">
                {announcement}
              </p>
            </header>

            {mission.mode === "SIMULATED" && (
              <ModeNotice
                mode="SIMULATED"
                label={status.mode.SIMULATED.banner}
                detail={status.mode.SIMULATED.detail}
              />
            )}
          </section>
          {readings}
          <RoomSessionView {...controls} copy={controlsCopy} />
        </div>

        <div className="room-col room-col-centre">
          <section className="room-feed" aria-labelledby="room-feed-title">
            <h2 id="room-feed-title" className="visually-hidden">
              {copy.feed.label}
            </h2>
            <LiveFeed
              status={feedStatus}
              stream={
                live.stream && {
                  url: live.stream.url,
                  simulated: live.stream.mode === "SIMULATED",
                  alt: named(
                    live.stream.mode === "SIMULATED"
                      ? copy.live.streamAltSimulated
                      : copy.live.streamAlt,
                  ),
                }
              }
              preview={
                <TargetPreview
                  plate={plate}
                  name={targetName}
                  caption={copy.feed.illustration}
                />
              }
              plates={plates}
              title={text.title}
              description={text.description}
              labels={{
                simulated: copy.live.simulated,
                live: copy.live.live,
                timeLeft: copy.live.timeLeft,
              }}
              timeLeft={left && left.seconds > 0 ? left : null}
              steps={
                <MissionSteps
                  title={copy.steps.title}
                  names={copy.steps.names}
                  statuses={statuses}
                  position={fill(copy.steps.stepOf, { step: String(reached + 1) })}
                  now={copy.steps.now}
                  stopped={copy.steps.stopped}
                />
              }
              action={button}
              onStreamError={onStreamError}
            />
          </section>

          {/* The phone's three stats (ADR-050 §1); the desk reads these in its panels. */}
          <dl className="room-stats" aria-label={copy.phone.stats}>
            <div>
              <dt>{copy.pointing.altitude}</dt>
              <dd className="data">
                {altitude
                  ? `${altitude.altitudeDegrees.toFixed(1)}°`
                  : copy.pointing.none}
              </dd>
            </div>
            <div>
              <dt>{copy.live.timeLeft}</dt>
              <dd className="data">
                {left && left.seconds > 0 ? (
                  <time dateTime={left.iso}>{left.text}</time>
                ) : (
                  copy.pointing.none
                )}
              </dd>
            </div>
            <div>
              <dt>{copy.phone.captures}</dt>
              <dd className="data">{captureCount}</dd>
            </div>
          </dl>
          {captures}
        </div>

        <div className="room-col room-col-right room-side">
          <RoomPointing
            locale={locale}
            targetName={targetName}
            timezone={timezone}
            visibility={visibility}
            telescope={live.pointing}
          />
          <RoomControlsView {...controls} copy={controlsCopy} />
          <RoomSharing
            missionId={mission.id}
            missionState={state}
            observable={mission.observable ?? false}
            observerCount={mission.observerCount ?? 0}
            observerCapacity={mission.observerCapacity ?? 5}
            watchPath={`/${locale}/app/missions/${mission.id}/watch`}
            signInPath={`/${locale}/sign-in`}
            copy={roomSharingCopy[locale]}
          />
        </div>

        {children}
      </div>

      {/*
       * The phone's dock: hand control, which opens its sheet, and the ground under the
       * flow's own primary action, which the phone fixes beside it (room-console.css).
       */}
      <div className="room-dock">
        {controls.offered.stop && (
          <button
            type="button"
            className="room-dock-hand"
            aria-haspopup="dialog"
            onClick={() => setHandOpen(true)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 2.5l2 2H6zM8 13.5l-2-2h4zM2.5 8l2-2v4zM13.5 8l-2 2V6z" />
            </svg>
            <span className="visually-hidden">{copy.phone.hand}</span>
          </button>
        )}
      </div>
      {controls.offered.stop && (
        <Dialog
          variant="sheet"
          title={copy.phone.hand}
          closeLabel={copy.phone.close}
          open={handOpen}
          onClose={() => setHandOpen(false)}
        >
          <RoomControlsView {...controls} copy={controlsCopy} />
        </Dialog>
      )}
    </>
  );
}
