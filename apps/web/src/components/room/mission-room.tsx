import type { ViewingConditions } from "@darkview/contracts";
import Link from "next/link";

import { CaptureCard } from "@/components/collection/capture-card";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import {
  captureReference,
  captureTitle,
  formatCapturedAt,
} from "@/features/collection/present";
import type { Room } from "@/features/missions/read-room";
import { missionPhase, missionProgress, plateFor } from "@/features/missions/room";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { roomCopy } from "@/i18n/resources/room";
import { statusCopy } from "@/i18n/resources/status";

import { MissionSteps } from "./mission-steps";
import { PointingDial } from "./pointing-dial";
import { TargetPreview } from "./target-preview";

type MissionRoomProps = {
  room: Room;
  locale: Locale;
};

const linkTone: Record<string, StatusTone> = {
  ONLINE: "success",
  DEGRADED: "warning",
  OFFLINE: "danger",
};

function time(iso: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).format(new Date(iso));
}

/** The forecast hour the page was read in, or null when none is stored for it. */
function currentHour(conditions: ViewingConditions | null, now: number) {
  const hour = conditions?.items.find((item) => {
    const start = Date.parse(item.at);
    return start <= now && now < start + 3_600_000;
  });
  return hour && hour.status !== "UNKNOWN" ? hour : null;
}

export function MissionRoom({ locale, room }: MissionRoomProps) {
  const copy = roomCopy[locale];
  const status = statusCopy[locale];
  const captureCopy = collectionGalleryCopy[locale];
  const { captures, conditions, events, mission, target, timezone, tonight } = room;

  const name = target ? (locale === "ka" ? target.nameKa : target.nameEn) : "—";
  const named = (template: string) => fill(template, { target: name });
  const state = copy.states[mission.state];
  const phase = missionPhase(mission.state);
  const statuses = missionProgress(mission.state, events);
  const reached = Math.max(
    statuses.findIndex((step) => step === "current" || step === "stopped"),
    mission.state === "COMPLETE" ? 4 : 0,
  );
  const visibility = tonight !== "unreadable" ? tonight?.visibility : undefined;
  const above = visibility && visibility.horizontal.altitudeDegrees >= 0;
  const hour = currentHour(conditions, room.readAt);

  return (
    <div className="room">
      <header className="room-head">
        {target && (
          <Link className="room-back" href={`/${locale}/app/missions/${target.slug}`}>
            <span aria-hidden="true">←</span> {named(copy.back)}
          </Link>
        )}
        <p className="eyebrow">
          <span aria-hidden="true" />
          {named(copy.eyebrow)}
        </p>
        <h1>{named(state.title)}</h1>
        <p>{named(state.description)}</p>
        {mission.failureReason && (
          <p className="room-reason">{copy.reasons[mission.failureReason]}</p>
        )}
      </header>

      {mission.mode === "SIMULATED" && (
        <ModeNotice
          mode="SIMULATED"
          label={status.mode.SIMULATED.banner}
          detail={status.mode.SIMULATED.detail}
        />
      )}

      <div className="room-grid">
        <section className="room-feed" aria-labelledby="room-feed-title">
          <h2 id="room-feed-title" className="visually-hidden">
            {copy.feed.label}
          </h2>
          <TargetPreview
            plate={target ? plateFor(target.slug) : null}
            name={name}
            caption={copy.feed.illustration}
            note={named(copy.feed[phase])}
          />
        </section>

        <MissionSteps
          title={copy.steps.title}
          names={copy.steps.names}
          statuses={statuses}
          position={fill(copy.steps.stepOf, { step: String(reached + 1) })}
          stopped={copy.steps.stopped}
        />

        <div className="room-side">
          <section
            className="room-panel room-pointing"
            aria-labelledby="room-pointing-title"
          >
            <h2 id="room-pointing-title">{named(copy.pointing.title)}</h2>
            <div className="room-pointing-body">
              <PointingDial
                position={visibility?.horizontal ?? null}
                label={copy.pointing.dial}
                cardinals={copy.pointing.cardinals}
              />
              {visibility ? (
                <dl className="room-values">
                  <div>
                    <dt>{copy.pointing.altitude}</dt>
                    <dd className="data">
                      {visibility.horizontal.altitudeDegrees.toFixed(1)}°
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.pointing.azimuth}</dt>
                    <dd className="data">
                      {visibility.horizontal.azimuthDegrees.toFixed(1)}°
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.pointing.rises}</dt>
                    <dd className="data">
                      {visibility.risesAt ? (
                        <time dateTime={visibility.risesAt}>
                          {time(visibility.risesAt, timezone, locale)}
                        </time>
                      ) : (
                        copy.pointing.none
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.pointing.sets}</dt>
                    <dd className="data">
                      {visibility.setsAt ? (
                        <time dateTime={visibility.setsAt}>
                          {time(visibility.setsAt, timezone, locale)}
                        </time>
                      ) : (
                        copy.pointing.none
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="room-muted">{copy.pointing.unknown}</p>
              )}
            </div>
            {visibility && !above && <p className="room-muted">{copy.pointing.below}</p>}
            <p className="room-note">
              {copy.pointing.note}{" "}
              {visibility && (
                <time dateTime={visibility.evaluatedAt}>
                  {fill(copy.pointing.computedAt, {
                    time: time(visibility.evaluatedAt, timezone, locale),
                  })}
                </time>
              )}
            </p>
          </section>

          <section className="room-panel" aria-labelledby="room-readings-title">
            <h2 id="room-readings-title">{copy.readings.title}</h2>
            <dl className="room-readings">
              <div>
                <dt>{status.now.link}</dt>
                <dd>
                  {room.status ? (
                    <StatusIndicator
                      label={status.link[room.status.link]}
                      tone={linkTone[room.status.link]}
                    />
                  ) : (
                    status.now.unknown
                  )}
                </dd>
              </div>
              <div>
                <dt>{status.now.weather}</dt>
                <dd>
                  {room.status
                    ? room.status.weather.holdActive
                      ? status.now.holdActive
                      : status.weather[room.status.weather.status]
                    : status.now.unknown}
                </dd>
              </div>
              <div>
                <dt>{copy.readings.cloud}</dt>
                <dd className="data room-reading-live">
                  {hour?.cloudCoverPercent != null
                    ? `${Math.round(hour.cloudCoverPercent)}%`
                    : copy.readings.cloudUnknown}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section
          className="room-panel room-captures"
          aria-labelledby="room-captures-title"
        >
          <header>
            <h2 id="room-captures-title">{copy.captures.title}</h2>
            <Link href={`/${locale}/app/collection`}>{copy.captures.all}</Link>
          </header>
          {captures.length === 0 ? (
            <p className="room-muted">{copy.captures.empty}</p>
          ) : (
            <div className="room-capture-grid">
              {captures.map((entry) => (
                <CaptureCard
                  key={entry.capture.id}
                  captureId={entry.capture.id}
                  href={`/${locale}/app/collection/${entry.capture.id}`}
                  title={captureTitle(entry, locale)}
                  reference={captureReference(entry)}
                  capturedAt={formatCapturedAt(
                    entry.capture.capturedAt,
                    timezone,
                    locale,
                  )}
                  thumbnail={entry.thumbnail}
                  simulated={entry.capture.mode === "SIMULATED"}
                  visibility={entry.capture.visibility}
                  copy={captureCopy}
                />
              ))}
            </div>
          )}
        </section>

        <section className="room-panel room-history" aria-labelledby="room-history-title">
          <h2 id="room-history-title">{copy.history.title}</h2>
          {!events || events.length === 0 ? (
            <p className="room-muted">
              {events ? copy.history.empty : copy.history.unreadable}
            </p>
          ) : (
            <ol>
              {[...events].reverse().map((event) => (
                <li key={event.id}>
                  <time dateTime={event.at}>
                    {formatCapturedAt(event.at, timezone, locale)}
                  </time>
                  <strong>{named(copy.states[event.state].event)}</strong>
                  <span>
                    {copy.history.sources[event.source]}
                    {event.failureReason && ` · ${copy.reasons[event.failureReason]}`}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
