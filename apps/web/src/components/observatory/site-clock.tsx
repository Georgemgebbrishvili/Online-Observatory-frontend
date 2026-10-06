"use client";

import { useEffect, useState } from "react";

type SiteClockProps = {
  timezone: string;
  locale: "en" | "ka";
  zoneLabel: string;
};

/**
 * The observatory's own date and time, the way a control room shows it (ADR-041).
 * Blank until the browser takes over: a clock rendered on the server is wrong for
 * everyone who loads the page later.
 */
export function SiteClock({ locale, timezone, zoneLabel }: SiteClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tag = locale === "ka" ? "ka-GE" : "en-GB";
  const date = now
    ? new Intl.DateTimeFormat(tag, {
        timeZone: timezone,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    : "";
  const time = now
    ? new Intl.DateTimeFormat(tag, {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(now)
    : "--:--";

  return (
    <div className="site-clock">
      {/* A no-break space holds the line, so the clock does not grow when it mounts. */}
      <span className="site-clock-date">{date || "\u00a0"}</span>
      <time className="site-clock-time" dateTime={now?.toISOString()}>
        {time}
      </time>
      <span className="site-clock-zone">{zoneLabel}</span>
    </div>
  );
}
