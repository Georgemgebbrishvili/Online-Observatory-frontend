"use client";

import type {
  ImagingProfile,
  Mission,
  MissionEvent,
  MissionState,
  ObservatoryHorizon,
  TargetVisibility,
} from "@darkview/contracts";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { slotEndOf } from "@/features/missions/active";
import {
  isStopped,
  liveAction,
  liveStatus,
  reopensSession,
  timeLeft,
  type LiveState,
} from "@/features/missions/live";
import { missionProgress, type FeedPlates } from "@/features/missions/room";
import { frameNote } from "@/features/missions/frame-note";
import { useLiveSession, useNow } from "@/features/missions/use-live-session";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { roomCopy } from "@/i18n/resources/room";
import { roomControlsCopy } from "@/i18n/resources/room-controls";
import { roomSessionCopy } from "@/i18n/resources/room-session";
import { roomSharingCopy } from "@/i18n/resources/room-sharing";

import { LiveFeed } from "./live-feed";
import { MissionSteps } from "./mission-steps";
import {
  describeOutcome,
  RoomCaptureAction,
  RoomControlsView,
  RoomSessionView,
  useRoomControls,
} from "./room-controls";
import { RoomHealth } from "./room-health";
import { RoomSharing } from "./room-sharing";
import { RoomTargetsView, useMissionTargets, type TargetOption } from "./room-targets";
import { RoomTonight } from "./room-tonight";
import { RoomPointing } from "./room-pointing";
import { SkyChart } from "./sky-chart";
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
  /** The horizon and the site, for the sky chart; null when unread (the dial is shown). */
  horizon?: ObservatoryHorizon | null;
  /** The instrument and the target, for the feed's corner plates. */
  plates?: FeedPlates | null;
  /** The observatory's readings, rendered on the server, beside the pointing dial. */
  readings: ReactNode;
  /** ADR-069: what the customer is looking at, rendered on the server. */
  guide?: ReactNode;
  /** ADR-070: the presenter view's switch, beside the way back. */
  headerAction?: ReactNode;
  /** The captures panel, in the right column of the desk (ADR-050). */
  captures?: ReactNode;
  /** How many captures the mission has, for the phone's stats. */
  captureCount?: number;
  /**
   * The catalogue's objects by id, named in the locale, so the object a RETARGET put on
   * the telescope is named and captured with its own profile (ADR-079).
   */
  catalogue?: Record<string, { name: string; imagingProfile: ImagingProfile }>;
  /** The captures and history, rendered on the server. */
  children: ReactNode;
};

type Copy = (typeof roomCopy)["en"];

/** The states the sky chart fills the feed in: the telescope is on its way. */
const travelling: readonly MissionState[] = [
  "PREPARING",
  "SLEWING",
  "VERIFYING",
  "CENTERING",
];

/** Clock skew between this browser and the platform, at most. */
const slotEndedMarginMs = 5 * 60_000;

/** Within a day of the slot, the page counts down to it. */
const countdownFromMs = 24 * 60 * 60_000;

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
  guide,
  headerAction,
  captures,
  captureCount = 0,
  catalogue = {},
  targetName: bookedName,
  targetSlug,
  timezone,
  visibility,
  horizon = null,
}: RoomLiveProps) {
  const copy = roomCopy[locale];
  const sessionCopy = roomSessionCopy[locale];
  const now = useNow();
  const opensAt = mission.scheduledStartAt ? Date.parse(mission.scheduledStartAt) : null;
  const endsAt = slotEndOf(mission);
  const { live, onStreamError, start } = useLiveSession({
    missionId: mission.id,
    state: mission.state,
    failureReason: mission.failureReason ?? null,
    locale,
    opensAt,
    endsAt,
    startsOnOpen: true,
  });

  // ADR-079: the object on the telescope now, which a RETARGET changes; the booked one
  // until the channel or the mission says otherwise.
  const currentTargetId =
    live.currentTargetId ?? mission.currentTargetId ?? mission.targetId;
  const current = catalogue[currentTargetId];
  const targetName =
    currentTargetId === mission.targetId ? bookedName : (current?.name ?? bookedName);
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
  const slotOpen = now !== null && (opensAt === null || now >= opensAt);
  // A scheduled mission past its slot's end is never started (ADR-079 §1). Without a
  // known end, the platform's MISSION_NOT_ACTIVE well past the opening can only be it.
  const slotEnded =
    live.missionState === "SCHEDULED" &&
    now !== null &&
    ((endsAt !== null && now >= endsAt) ||
      (live.startError === "MISSION_NOT_ACTIVE" &&
        opensAt !== null &&
        now > opensAt + slotEndedMarginMs));
  const action = slotEnded ? null : liveAction(live);
  const untilOpen = opensAt !== null && now !== null ? opensAt - now : null;

  const described = slotEnded ? copy.live.slotEnded : describe(copy, live, named);
  const saved = live.ended
    ? fill(copy.live.saved[live.ended.captureIds.length === 1 ? "one" : "other"], {
        count: String(live.ended.captureIds.length),
      })
    : null;
  const text = (described &&
    saved && {
      title: described.title,
      description: `${described.description} ${saved}`,
    }) ||
    described || {
      title: copy.live.notStarted.title,
      description:
        opensAtText && !slotOpen
          ? untilOpen !== null && untilOpen <= countdownFromMs
            ? fill(copy.live.notStarted.soon, {
                time: opensAtText,
                left: timeLeft(new Date(opensAt ?? 0).toISOString(), now ?? 0).text,
              })
            : fill(copy.live.notStarted.before, { time: opensAtText })
          : named(copy.live.notStarted.open),
    };

  const controlsCopy = roomControlsCopy[locale];
  const connected =
    live.session !== null &&
    live.socket === "open" &&
    !live.expired &&
    live.channelError === null;
  const controls = useRoomControls({
    missionId: mission.id,
    missionState: state,
    connected,
    verdicts: live.verdicts,
    // The capture names the object on the telescope now, not the booked one.
    imagingProfile:
      currentTargetId === mission.targetId
        ? imagingProfile
        : (current?.imagingProfile ?? imagingProfile),
    signInPath: `/${locale}/sign-in`,
  });

  // ADR-079 §4: the objects up now, while the session runs.
  const targetsRead = useMissionTargets({
    missionId: mission.id,
    active: connected && reopensSession(state),
    currentTargetId,
  });
  const list = targetsRead.kind === "ok" ? targetsRead.list : null;
  const unlisted = targetsRead.kind === "unreadable" ? "unreadable" : "loading";
  const refusedAt = (control: "retarget" | "capture") =>
    controls.outcome?.control === control && controls.outcome.outcome.kind === "refused"
      ? (controls.outcome.outcome.allowedAt ?? null)
      : null;
  const later = (...values: (string | null | undefined)[]) =>
    values
      .filter((value): value is string => typeof value === "string")
      .sort()
      .at(-1) ?? null;
  // The channel's dwell lock is the latest word; before it speaks, the list's, then the
  // mission's. A refusal names when it lifts too.
  const lockedUntil = later(
    live.retargetAllowedAt !== undefined
      ? live.retargetAllowedAt
      : (list?.retargetAllowedAt ?? mission.retargetAllowedAt),
    refusedAt("retarget"),
  );
  const captureAllowedAt = later(live.captureAllowedAt, refusedAt("capture"));
  const options: TargetOption[] | "loading" | "unreadable" = list
    ? [
        ...(list.items.some((item) => item.target.id === currentTargetId)
          ? []
          : [{ id: currentTargetId, name: targetName, current: true }]),
        ...list.items.map((item) => ({
          id: item.target.id,
          name: locale === "ka" ? item.target.nameKa : item.target.nameEn,
          current: item.target.id === currentTargetId,
        })),
      ]
    : unlisted;
  const switchMessage =
    controls.outcome?.control === "retarget"
      ? describeOutcome(controlsCopy, controls.outcome)
      : null;

  // One primary action at a time: Capture during the session, the Collection once it
  // has ended, and another night once the observation has stopped short. There is no
  // Start: opening the page inside the slot starts it (ADR-079 §1).
  const over = feedStatus === "parked" || feedStatus === "parking" || live.ended !== null;
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
    ) : over ? (
      <>
        <ButtonLink variant="secondary" href={`/${locale}/app/book`}>
          {copy.live.actions.book}
        </ButtonLink>
        <ButtonLink href={`/${locale}/app/collection`}>
          {copy.live.actions.collection}
        </ButtonLink>
      </>
    ) : action ? (
      <Button variant="secondary" onClick={() => void start()}>
        {action === "reopen" ? copy.live.actions.reopen : copy.live.actions.retry}
      </Button>
    ) : (
      <RoomCaptureAction
        {...controls}
        copy={controlsCopy}
        allowedAt={captureAllowedAt}
        now={now}
      />
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
              {headerAction}
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
                // While the telescope gets ready and travels, the sky it travels across.
                horizon && now !== null && travelling.includes(live.missionState) ? (
                  <SkyChart
                    at={now}
                    horizon={horizon}
                    target={visibility?.horizontal ?? null}
                    telescope={live.pointing}
                    label={named(copy.pointing.sky)}
                    caption={copy.feed.illustration}
                    cardinals={copy.pointing.cardinals}
                  />
                ) : (
                  <TargetPreview
                    plate={plate}
                    name={targetName}
                    caption={copy.feed.illustration}
                  />
                )
              }
              plates={
                plates && currentTargetId !== mission.targetId
                  ? { ...plates, subject: { name: targetName, coordinates: null } }
                  : plates
              }
              notice={
                <RoomHealth
                  copy={sessionCopy.health}
                  health={state === "OBSERVING" ? live.imageHealth : null}
                  now={now}
                />
              }
              frameNote={
                live.stream && live.frame
                  ? frameNote(live.frame, copy.live.frame, locale)
                  : null
              }
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
            horizon={horizon}
            now={now}
          />
          {guide}
          {connected && reopensSession(state) && (
            <RoomTargetsView
              copy={sessionCopy.targets}
              options={options}
              lockedUntil={lockedUntil}
              now={now}
              observing={state === "OBSERVING"}
              pendingId={
                controls.pending?.control === "retarget"
                  ? (controls.pending.targetId ?? null)
                  : null
              }
              busy={controls.pending !== null}
              message={switchMessage}
              onSwitch={controls.onRetarget}
            />
          )}
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
          <RoomTonight
            broadcast={mission.broadcast ?? false}
            locale={locale}
            missionId={mission.id}
            missionState={state}
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
