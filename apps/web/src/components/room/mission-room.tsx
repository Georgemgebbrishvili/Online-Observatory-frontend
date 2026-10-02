import type { ViewingConditions } from "@darkview/contracts";
import Link from "next/link";

import { CaptureCard } from "@/components/collection/capture-card";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import {
  captureReference,
  captureTitle,
  formatCapturedAt,
} from "@/features/collection/present";
import type { Room } from "@/features/missions/read-room";
import { feedPlates, plateFor } from "@/features/missions/room";
import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { roomCopy } from "@/i18n/resources/room";
import { statusCopy } from "@/i18n/resources/status";

import { PanelHead } from "./panel-head";
import { RoomLive } from "./room-live";

type MissionRoomProps = {
  room: Room;
  locale: Locale;
};

const linkTone: Record<string, StatusTone> = {
  ONLINE: "success",
  DEGRADED: "warning",
  OFFLINE: "danger",
};

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
  const {
    captures,
    conditions,
    events,
    mission,
    observatory,
    target,
    timezone,
    tonight,
  } = room;

  const name = target ? (locale === "ka" ? target.nameKa : target.nameEn) : "—";
  const named = (template: string) => fill(template, { target: name });
  const visibility = tonight !== "unreadable" ? tonight?.visibility : undefined;
  const hour = currentHour(conditions, room.readAt);

  return (
    <div className="room">
      <RoomLive
        locale={locale}
        mission={mission}
        events={events}
        targetName={name}
        targetSlug={target?.slug ?? null}
        plate={target ? plateFor(target.slug) : null}
        imagingProfile={target?.imagingProfile ?? null}
        timezone={timezone}
        opensAtText={
          mission.scheduledStartAt
            ? formatCapturedAt(mission.scheduledStartAt, timezone, locale)
            : null
        }
        visibility={visibility ?? null}
        plates={feedPlates(observatory, target, locale, copy.feed)}
        readings={
          <section className="room-panel" aria-labelledby="room-readings-title">
            <PanelHead
              id="room-readings-title"
              icon="observatory"
              title={copy.readings.title}
              meta={
                observatory
                  ? locale === "ka"
                    ? observatory.nameKa
                    : observatory.nameEn
                  : undefined
              }
            />
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
        }
      >
        <section
          className="room-panel room-captures"
          aria-labelledby="room-captures-title"
        >
          <PanelHead
            id="room-captures-title"
            icon="captures"
            title={copy.captures.title}
            meta={<Link href={`/${locale}/app/collection`}>{copy.captures.all}</Link>}
          />
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
          <PanelHead id="room-history-title" icon="history" title={copy.history.title} />
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
      </RoomLive>
    </div>
  );
}
