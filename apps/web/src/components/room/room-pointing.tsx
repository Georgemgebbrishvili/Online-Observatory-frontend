import type { HorizontalCoordinates, TargetVisibility } from "@darkview/contracts";

import { fill } from "@/features/operator/format";
import type { Locale } from "@/i18n/config";
import { roomCopy } from "@/i18n/resources/room";

import { PointingDial } from "./pointing-dial";

type RoomPointingProps = {
  locale: Locale;
  targetName: string;
  timezone: string;
  /** The target tonight, from `listTonightTargets`; null when it could not be read. */
  visibility: TargetVisibility | null;
  /** `MissionTelemetryUpdate.pointing`, as `PointingDial` reads it. */
  telescope: HorizontalCoordinates | null | undefined;
};

function time(iso: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).format(new Date(iso));
}

/**
 * The pointing panel. Before the mission channel reports a position it shows the target's
 * (ADR-027 §3); once it does, the telescope's, to the 0.1° the platform rounds to.
 */
export function RoomPointing({
  locale,
  targetName,
  telescope,
  timezone,
  visibility,
}: RoomPointingProps) {
  const copy = roomCopy[locale].pointing;
  const named = (template: string) => fill(template, { target: targetName });
  const live = telescope !== undefined;
  const shown = live ? telescope : (visibility?.horizontal ?? null);
  const above = visibility && visibility.horizontal.altitudeDegrees >= 0;

  return (
    <section className="room-panel room-pointing" aria-labelledby="room-pointing-title">
      <h2 id="room-pointing-title">{named(live ? copy.titleTelescope : copy.title)}</h2>
      <div className="room-pointing-body">
        <PointingDial
          position={visibility?.horizontal ?? null}
          telescope={telescope}
          label={copy.dial}
          cardinals={copy.cardinals}
        />
        {visibility || live ? (
          <dl className="room-values">
            <div>
              <dt>{copy.altitude}</dt>
              <dd className="data" data-pointing="altitude">
                {shown ? `${shown.altitudeDegrees.toFixed(1)}°` : copy.none}
              </dd>
            </div>
            <div>
              <dt>{copy.azimuth}</dt>
              <dd className="data" data-pointing="azimuth">
                {shown ? `${shown.azimuthDegrees.toFixed(1)}°` : copy.none}
              </dd>
            </div>
            {visibility && (
              <>
                <div>
                  <dt>{copy.rises}</dt>
                  <dd className="data">
                    {visibility.risesAt ? (
                      <time dateTime={visibility.risesAt}>
                        {time(visibility.risesAt, timezone, locale)}
                      </time>
                    ) : (
                      copy.none
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{copy.sets}</dt>
                  <dd className="data">
                    {visibility.setsAt ? (
                      <time dateTime={visibility.setsAt}>
                        {time(visibility.setsAt, timezone, locale)}
                      </time>
                    ) : (
                      copy.none
                    )}
                  </dd>
                </div>
              </>
            )}
          </dl>
        ) : (
          <p className="room-muted">{copy.unknown}</p>
        )}
      </div>
      {live && !telescope && <p className="room-muted">{copy.noPosition}</p>}
      {!live && visibility && !above && <p className="room-muted">{copy.below}</p>}
      {live ? (
        <p className="room-note">{named(copy.telescopeNote)}</p>
      ) : (
        <p className="room-note">
          {copy.note}{" "}
          {visibility && (
            <time dateTime={visibility.evaluatedAt}>
              {fill(copy.computedAt, {
                time: time(visibility.evaluatedAt, timezone, locale),
              })}
            </time>
          )}
        </p>
      )}
    </section>
  );
}
