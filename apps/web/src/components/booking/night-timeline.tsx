"use client";

import type { CSSProperties } from "react";

import type { NightSky } from "@/features/booking/night-sky";
import type { BoardCopy } from "@/i18n/resources/board";

type TimelineSlot = {
  startAt: string;
  durationMinutes: number;
  state: "open" | "taken" | "chosen";
};

type NightTimelineProps = {
  sky: NightSky;
  slots: TimelineSlot[];
  copy: BoardCopy["timeline"];
  /** "HH:MM" on the observatory's clock. */
  clock: (at: number) => string;
};

const margin = 20 * 60_000;

/**
 * The night above the start picker: sunset to sunrise, the dark the platform sells
 * between dusk and dawn, when the Moon is up, and every slot as a tick on it, the chosen
 * one lit. Drawn from astronomy-engine for the observatory's site; it shows, it does
 * not choose — the half-hours below are the controls.
 */
export function NightTimeline({ clock, copy, sky, slots }: NightTimelineProps) {
  const from = sky.sunset - margin;
  const to = sky.sunrise + margin;
  const share = (time: number) => (time - from) / (to - from);
  const at = (time: number) => `${(share(time) * 100).toFixed(2)}%`;
  // A mark near an end is anchored inward, so its words never run off the bar.
  const anchor = (time: number) =>
    share(time) < 0.15 ? "is-start" : share(time) > 0.85 ? "is-end" : undefined;
  const band = {
    "--tl-sunset": at(sky.sunset),
    "--tl-dusk": at(sky.dusk),
    "--tl-dawn": at(sky.dawn),
    "--tl-sunrise": at(sky.sunrise),
  } as CSSProperties;
  const said = [
    `${copy.sunset} ${clock(sky.sunset)}`,
    `${copy.dusk} ${clock(sky.dusk)}`,
    `${copy.dawn} ${clock(sky.dawn)}`,
    `${copy.sunrise} ${clock(sky.sunrise)}`,
  ].join(", ");

  return (
    <div className="night" role="img" aria-label={`${copy.label}: ${said}`}>
      <div className="night-sun" aria-hidden="true">
        <span>
          {copy.sunset} <time>{clock(sky.sunset)}</time>
        </span>
        {sky.moonUp.length > 0 && (
          <span className="night-moon-key">
            <i />
            {copy.moon}
          </span>
        )}
        <span>
          {copy.sunrise} <time>{clock(sky.sunrise)}</time>
        </span>
      </div>
      <div className="night-bar" style={band} aria-hidden="true">
        {sky.moonUp.map((span) => (
          <span
            key={span.from}
            className="night-moon"
            style={{
              left: at(span.from),
              width: `calc(${at(span.to)} - ${at(span.from)})`,
            }}
          />
        ))}
        <span className="night-midnight" style={{ left: at(sky.midnight) }} />
        {slots.map((slot) => {
          const start = Date.parse(slot.startAt);
          return (
            <span
              key={slot.startAt}
              className={`night-tick is-${slot.state}`}
              style={{
                left: at(start),
                width: `calc(${at(start + slot.durationMinutes * 60_000)} - ${at(start)})`,
              }}
            />
          );
        })}
      </div>
      <div className="night-marks" aria-hidden="true">
        <span className={anchor(sky.dusk)} style={{ left: at(sky.dusk) }}>
          {copy.dusk} <time>{clock(sky.dusk)}</time>
        </span>
        <span className="night-midnight-mark" style={{ left: at(sky.midnight) }}>
          {copy.midnight}
        </span>
        <span className={anchor(sky.dawn)} style={{ left: at(sky.dawn) }}>
          {copy.dawn} <time>{clock(sky.dawn)}</time>
        </span>
      </div>
    </div>
  );
}
