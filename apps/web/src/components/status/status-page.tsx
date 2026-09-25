import type {
  PublicObservatoryStatus,
  ViewingConditions,
  ViewingConditionsHour,
} from "@darkview/contracts";
import Link from "next/link";
import type { ReactNode } from "react";

import { ModeNotice } from "@/components/observatory/mode-notice";
import { Container } from "@/components/ui/container";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import type { Locale } from "@/i18n/config";
import type { StatusCopy } from "@/i18n/resources/status";

const linkTone: Record<PublicObservatoryStatus["link"], StatusTone> = {
  ONLINE: "success",
  DEGRADED: "warning",
  OFFLINE: "danger",
};

const weatherTone: Record<PublicObservatoryStatus["weather"]["status"], StatusTone> = {
  CLEAR: "success",
  CLOUDY: "warning",
  UNSAFE: "danger",
  UNKNOWN: "neutral",
};

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/** Seconds, then minutes, then hours, in the reader's language. */
function age(milliseconds: number, copy: StatusCopy["age"]) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  if (seconds < 60) return fill(copy.seconds, { value: String(seconds) });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return fill(copy.minutes, { value: String(minutes) });
  return fill(copy.hours, { value: String(Math.floor(minutes / 60)) });
}

/** `field` names the row for tests; see the same prop on the operator overview. */
function Row({
  children,
  field,
  label,
}: {
  children: ReactNode;
  field: string;
  label: string;
}) {
  return (
    <div className="status-row" data-field={field}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function percent(value: number | null, unknown: string) {
  return value === null ? unknown : `${Math.round(value)}%`;
}

function layers(hour: ViewingConditionsHour, unknown: string) {
  const parts = [
    hour.cloudCoverLowPercent,
    hour.cloudCoverMidPercent,
    hour.cloudCoverHighPercent,
  ];
  // Shown only when the source gave at least one layer: three dashes say nothing.
  if (parts.every((part) => part === null)) return null;
  return parts.map((part) => percent(part, unknown)).join(" / ");
}

export function StatusPage({
  conditions,
  copy,
  locale,
  now,
  observatoryName,
  status,
  timezone,
}: {
  conditions: ViewingConditions | null;
  copy: StatusCopy;
  locale: Locale;
  /** Passed in so the server decides "now", and the rendered age is not a guess. */
  now: number;
  observatoryName: string;
  status: PublicObservatoryStatus;
  timezone: string;
}) {
  const mode = copy.mode[status.mode];
  const hours = conditions?.items ?? [];
  const hourLabel = (at: string) =>
    new Date(at).toLocaleTimeString(locale === "ka" ? "ka-GE" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    });

  return (
    <main className="status-page" id="main-content">
      <Container>
        <header className="status-header">
          <span className="status-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p className="status-introduction">{copy.introduction}</p>
          <p className="status-observatory">
            <strong>{observatoryName}</strong>
            <span className="data">
              {fill(copy.updated, {
                age: age(now - Date.parse(status.updatedAt), copy.age),
              })}
            </span>
          </p>
        </header>

        <ModeNotice mode={status.mode} label={mode.banner} detail={mode.detail} />

        <section className="status-panel" aria-labelledby="status-now">
          <h2 id="status-now">{copy.now.title}</h2>
          <dl className="status-rows">
            <Row field="link" label={copy.now.link}>
              <StatusIndicator
                label={copy.link[status.link]}
                tone={linkTone[status.link]}
              />
              <span className="status-note">{copy.linkDetail[status.link]}</span>
            </Row>
            <Row field="weather" label={copy.now.weather}>
              <StatusIndicator
                label={copy.weather[status.weather.status]}
                tone={weatherTone[status.weather.status]}
              />
              <span className="status-note">
                {copy.now.weatherSource}: {copy.weatherSource[status.weather.source]}
              </span>
            </Row>
            <Row field="hold" label={copy.now.hold}>
              <StatusIndicator
                label={
                  status.weather.holdActive ? copy.now.holdActive : copy.now.holdInactive
                }
                tone={status.weather.holdActive ? "danger" : "success"}
              />
              {status.weather.note && (
                <span className="status-note">{status.weather.note}</span>
              )}
            </Row>
            <Row field="mission" label={copy.now.mission}>
              {status.missionInProgress ? copy.now.yes : copy.now.no}
            </Row>
            <Row field="target" label={copy.now.target}>
              {/* Present only while the session owner has opted in (ADR-007). */}
              {status.currentTargetName ?? copy.now.none}
            </Row>
            <Row field="last-mission" label={copy.now.lastMission}>
              {status.lastSuccessfulMissionAt
                ? new Date(status.lastSuccessfulMissionAt).toLocaleString(
                    locale === "ka" ? "ka-GE" : "en-GB",
                    { dateStyle: "medium", timeStyle: "short", timeZone: timezone },
                  )
                : copy.now.never}
            </Row>
          </dl>
        </section>

        <section className="status-panel" aria-labelledby="status-conditions">
          <h2 id="status-conditions">{copy.conditions.title}</h2>
          <p className="status-advisory">{copy.conditions.detail}</p>

          {hours.length === 0 ? (
            <p className="status-empty">{copy.conditions.empty}</p>
          ) : (
            <div className="status-table-scroll">
              <table className="status-table">
                <thead>
                  <tr>
                    <th scope="col">{copy.conditions.hour}</th>
                    <th scope="col">{copy.conditions.cloud}</th>
                    <th scope="col">{copy.conditions.cloudLayers}</th>
                    <th scope="col">{copy.conditions.precipitation}</th>
                    <th scope="col">{copy.conditions.humidity}</th>
                    <th scope="col">{copy.conditions.wind}</th>
                    <th scope="col">{copy.conditions.seeing}</th>
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour) => (
                    <tr key={hour.at}>
                      <th scope="row" className="data">
                        {hourLabel(hour.at)}
                      </th>
                      {/* An hour with no stored forecast is unknown, never clear. */}
                      {hour.status === "UNKNOWN" ? (
                        <td className="status-unknown-hour" colSpan={6}>
                          {copy.conditions.unknownHour}
                        </td>
                      ) : (
                        <>
                          <td className="data">
                            {percent(hour.cloudCoverPercent, copy.conditions.unknown)}
                          </td>
                          <td className="data">
                            {layers(hour, copy.conditions.unknown) ??
                              copy.conditions.unknown}
                          </td>
                          <td className="data">
                            {percent(
                              hour.precipitationProbabilityPercent,
                              copy.conditions.unknown,
                            )}
                          </td>
                          <td className="data">
                            {percent(
                              hour.relativeHumidityPercent,
                              copy.conditions.unknown,
                            )}
                          </td>
                          <td className="data">
                            {hour.windSpeedMetresPerSecond === null
                              ? copy.conditions.unknown
                              : `${hour.windSpeedMetresPerSecond.toFixed(1)} m/s`}
                          </td>
                          <td className="data">
                            {hour.seeingArcseconds === null
                              ? copy.conditions.unknown
                              : `${hour.seeingArcseconds.toFixed(1)}″`}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hours[0]?.source && hours[0].fetchedAt && (
            <p className="status-source">
              {fill(copy.conditions.source, {
                source: copy.conditions.sources[hours[0].source],
                age: age(now - Date.parse(hours[0].fetchedAt), copy.age),
              })}
            </p>
          )}
        </section>

        <Link className="status-back" href={`/${locale}`}>
          {copy.back}
        </Link>
      </Container>
    </main>
  );
}
