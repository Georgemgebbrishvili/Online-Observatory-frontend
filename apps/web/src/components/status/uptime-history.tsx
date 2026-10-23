import type { ObservatoryUptime } from "@darkview/contracts";

import type { Locale } from "@/i18n/config";
import type { StatusCopy } from "@/i18n/resources/status";

export type UptimeTone = "up" | "partial" | "down" | "unmeasured";

/** One day's colour. Unmeasured is never drawn as up. */
export function uptimeTone(percent: number | null): UptimeTone {
  if (percent === null) return "unmeasured";
  if (percent >= 99.5) return "up";
  if (percent >= 90) return "partial";
  return "down";
}

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

function formatPercent(value: number, locale: Locale) {
  return `${new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    maximumFractionDigits: value >= 99.95 && value < 100 ? 2 : 1,
  }).format(value)}%`;
}

function minutes(from: string, to: string) {
  return Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 60_000));
}

const MAX_INCIDENTS = 5;

/**
 * Thirty days of the observatory link (Phase 6.0), from GET
 * /observatories/{observatoryId}/uptime. Null means the history could not be read;
 * the rest of the status page does not depend on it.
 */
export function UptimeHistory({
  copy,
  locale,
  timezone,
  uptime,
}: {
  copy: StatusCopy["uptime"];
  locale: Locale;
  timezone: string;
  uptime: ObservatoryUptime | null;
}) {
  if (!uptime) {
    return (
      <p className="status-empty" data-uptime="unavailable">
        {copy.unavailable}
      </p>
    );
  }

  const language = locale === "ka" ? "ka-GE" : "en-GB";
  const dayLabel = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString(language, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  const instant = (iso: string) =>
    new Date(iso).toLocaleString(language, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    });
  const incidents = uptime.incidents.slice(0, MAX_INCIDENTS);

  return (
    <div
      className="uptime"
      data-uptime={uptime.uptimePercent === null ? "unmeasured" : "measured"}
    >
      <p className="uptime-summary">
        {uptime.uptimePercent === null ? (
          copy.notMeasured
        ) : (
          <>
            <strong className="data">
              {formatPercent(uptime.uptimePercent, locale)}
            </strong>{" "}
            {copy.summary}
          </>
        )}
      </p>

      <ol className="uptime-days" aria-label={copy.daysLabel}>
        {uptime.days.map((day) => {
          const tone = uptimeTone(day.uptimePercent);
          return (
            <li key={day.date} className={`uptime-day uptime-${tone}`} data-tone={tone}>
              <span className="visually-hidden">
                {fill(copy.dayLabel, {
                  date: dayLabel(day.date),
                  value:
                    day.uptimePercent === null
                      ? copy.legend.unmeasured
                      : formatPercent(day.uptimePercent, locale),
                })}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="uptime-axis" aria-hidden="true">
        <span>{dayLabel(uptime.days[0]?.date ?? "")}</span>
        <span>{copy.today}</span>
      </div>

      <ul className="uptime-legend" aria-label={copy.legendLabel}>
        {(["up", "partial", "down", "unmeasured"] as const).map((tone) => (
          <li key={tone}>
            <span className={`uptime-swatch uptime-${tone}`} aria-hidden="true" />
            {copy.legend[tone]}
          </li>
        ))}
      </ul>

      <h3 className="uptime-incidents-title">{copy.incidentsTitle}</h3>
      {incidents.length === 0 ? (
        <p className="status-empty">
          {uptime.uptimePercent === null ? copy.notMeasured : copy.noIncidents}
        </p>
      ) : (
        <ul className="uptime-incidents">
          {incidents.map((incident) => (
            <li key={incident.lostAt} className="data">
              {incident.restoredAt
                ? fill(copy.incident, {
                    from: instant(incident.lostAt),
                    minutes: String(minutes(incident.lostAt, incident.restoredAt)),
                  })
                : fill(copy.ongoing, { from: instant(incident.lostAt) })}
            </li>
          ))}
        </ul>
      )}
      <p className="status-advisory">{copy.detail}</p>
    </div>
  );
}
