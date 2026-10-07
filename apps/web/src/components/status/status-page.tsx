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

export const linkTone: Record<PublicObservatoryStatus["link"], StatusTone> = {
  ONLINE: "success",
  DEGRADED: "warning",
  OFFLINE: "danger",
};

export const weatherTone: Record<
  PublicObservatoryStatus["weather"]["status"],
  StatusTone
> = {
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
  className = "",
  field,
  label,
}: {
  children: ReactNode;
  className?: string;
  field: string;
  label: string;
}) {
  return (
    <div className={`status-row ${className}`} data-field={field}>
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

/**
 * Cloud cover per hour as bars, Photon Blue for data (ADR-039). Decoration for the eye
 * only: the table beneath carries every figure, so the chart is hidden from assistive
 * technology. An hour without a figure draws no bar -- unknown is never drawn as clear.
 */
function CloudChart({
  caption,
  hourLabel,
  hours,
  unknown,
}: {
  caption: string;
  hourLabel: (at: string) => string;
  hours: ViewingConditionsHour[];
  unknown: string;
}) {
  return (
    <figure className="status-chart">
      <figcaption className="plate-title">{caption}</figcaption>
      <ol aria-hidden="true">
        {hours.map((hour) => {
          const value = hour.status === "UNKNOWN" ? null : hour.cloudCoverPercent;
          return (
            <li key={hour.at} className={value === null ? "status-chart-unknown" : ""}>
              <span className="status-chart-value">
                {value === null ? unknown : `${Math.round(value)}%`}
              </span>
              <span className="status-chart-track">
                {value !== null && (
                  <span
                    className="status-chart-bar"
                    style={{ blockSize: `${Math.max(value, 1)}%` }}
                  />
                )}
              </span>
              <time dateTime={hour.at}>{hourLabel(hour.at)}</time>
            </li>
          );
        })}
      </ol>
    </figure>
  );
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
    <main className="public-page status-page" id="main-content">
      <section className="page-hero" aria-labelledby="status-title">
        <Container className="status-hero">
          <header>
            <p className="kicker">{copy.eyebrow}</p>
            <h1 id="status-title">{copy.title}</h1>
            <p className="page-lede">{copy.introduction}</p>
          </header>
          <div className="plate status-observatory">
            <strong>{observatoryName}</strong>
            <span className="data">
              {fill(copy.updated, {
                age: age(now - Date.parse(status.updatedAt), copy.age),
              })}
            </span>
            <ModeNotice mode={status.mode} label={mode.banner} detail={mode.detail} />
          </div>
        </Container>
      </section>

      <section className="page-section" aria-labelledby="status-now">
        <Container>
          <h2 id="status-now" className="status-heading">
            {copy.now.title}
          </h2>
          <dl className="status-summary">
            <Row className="plate" field="link" label={copy.now.link}>
              <StatusIndicator
                label={copy.link[status.link]}
                tone={linkTone[status.link]}
              />
              <span className="status-note">{copy.linkDetail[status.link]}</span>
            </Row>
            <Row className="plate" field="weather" label={copy.now.weather}>
              <StatusIndicator
                label={copy.weather[status.weather.status]}
                tone={weatherTone[status.weather.status]}
              />
              <span className="status-note">
                {copy.now.weatherSource}: {copy.weatherSource[status.weather.source]}
              </span>
            </Row>
            <Row className="plate" field="hold" label={copy.now.hold}>
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
            <Row className="plate" field="mission" label={copy.now.mission}>
              <span className="status-value">
                {status.missionInProgress ? copy.now.yes : copy.now.no}
              </span>
            </Row>
          </dl>
          <dl className="ruled-specs status-rows">
            <Row field="target" label={copy.now.target}>
              {/* Present only while the session owner has opted in (ADR-007). */}
              {status.currentTargetName ?? copy.now.none}
            </Row>
            <Row field="last-mission" label={copy.now.lastMission}>
              {status.lastSuccessfulMissionAt ? (
                <span className="data">
                  {new Date(status.lastSuccessfulMissionAt).toLocaleString(
                    locale === "ka" ? "ka-GE" : "en-GB",
                    { dateStyle: "medium", timeStyle: "short", timeZone: timezone },
                  )}
                </span>
              ) : (
                copy.now.never
              )}
            </Row>
          </dl>
        </Container>
      </section>

      <section className="page-section" aria-labelledby="status-conditions">
        <Container>
          <header className="status-conditions-header">
            <h2 id="status-conditions" className="status-heading">
              {copy.conditions.title}
            </h2>
            <p className="status-advisory">{copy.conditions.detail}</p>
          </header>

          {hours.length === 0 ? (
            <p className="status-empty">{copy.conditions.empty}</p>
          ) : (
            <>
              <CloudChart
                caption={copy.conditions.chartCaption}
                hourLabel={hourLabel}
                hours={hours}
                unknown={copy.conditions.unknown}
              />
              {/* Focusable, so a keyboard can scroll it where it overflows a phone. Its
                  own name: the section around it already carries the heading's. */}
              <div
                className="status-table-scroll"
                role="region"
                aria-label={copy.conditions.tableLabel}
                tabIndex={0}
              >
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
                            <td className="data status-cloud">
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
            </>
          )}

          {hours[0]?.source && hours[0].fetchedAt && (
            <p className="status-source">
              {fill(copy.conditions.source, {
                source: copy.conditions.sources[hours[0].source],
                age: age(now - Date.parse(hours[0].fetchedAt), copy.age),
              })}
            </p>
          )}

          <Link className="page-link status-back" href={`/${locale}`}>
            {copy.back}
          </Link>
        </Container>
      </section>
    </main>
  );
}
