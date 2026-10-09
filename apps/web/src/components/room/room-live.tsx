"use client";

import type {
  ImagingProfile,
  Mission,
  MissionEvent,
  TargetVisibility,
} from "@darkview/contracts";
import Link from "next/link";
import type { ReactNode } from "react";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { Button, ButtonLink } from "@/components/ui/button";
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
          {captures}
        </div>

        {children}
      </div>
    </>
  );
}
