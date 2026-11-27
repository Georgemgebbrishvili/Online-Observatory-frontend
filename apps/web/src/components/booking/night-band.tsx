import type { CSSProperties } from "react";

import { MoonGlyph } from "@/components/booking/moon-glyph";
import type { NightSky } from "@/features/booking/night-sky";

type NightBandProps = {
  sky: NightSky;
  /** The chosen session, start and end in epoch milliseconds, or null. */
  run: { from: number; to: number } | null;
  moon: { lit: number; waxing: boolean };
  clock: (at: number) => string;
  words: {
    sunset: string;
    dark: string;
    sunrise: string;
    moonUp: string;
    moonLit: (percent: number) => string;
  };
};

/**
 * ADR-110: the chosen night from sunset to sunrise as one bar: twilight either side of
 * the dark the slots are sold in, the hours the Moon is up, and the chosen session on it.
 */
export function NightBand({ clock, moon, run, sky, words }: NightBandProps) {
  const span = sky.sunrise - sky.sunset;
  const at = (time: number) =>
    `${Math.min(100, Math.max(0, ((time - sky.sunset) / span) * 100)).toFixed(2)}%`;
  const hours: number[] = [];
  const firstHour = Math.ceil(sky.sunset / 3_600_000) * 3_600_000;
  // An hour's label needs room either side, so none sits on the bar's ends.
  const edge = span * 0.03;
  for (let time = firstHour; time < sky.sunrise - edge; time += 3_600_000)
    if (time > sky.sunset + edge) hours.push(time);
  const summary = [
    `${words.sunset} ${clock(sky.sunset)}`,
    `${words.dark} ${clock(sky.dusk)} – ${clock(sky.dawn)}`,
    `${words.sunrise} ${clock(sky.sunrise)}`,
    words.moonLit(moon.lit),
    ...(sky.moonUp.length > 0 ? [words.moonUp] : []),
  ].join(", ");

  return (
    <figure
      className="night-band"
      role="img"
      aria-label={summary}
      style={{ "--dusk": at(sky.dusk), "--dawn": at(sky.dawn) } as CSSProperties}
    >
      <div className="night-band-bar">
        {sky.moonUp.map((stretch) => (
          <span
            key={stretch.from}
            className="night-band-moon"
            style={{ left: at(stretch.from), right: `calc(100% - ${at(stretch.to)})` }}
          />
        ))}
        {hours.map((time, index) => (
          <span
            key={time}
            className={`night-band-tick${index % 2 ? " is-odd" : ""}`}
            style={{ left: at(time) }}
          >
            <span>{clock(time).slice(0, 2)}</span>
          </span>
        ))}
        {run && (
          <span
            className="night-band-run"
            style={{ left: at(run.from), right: `calc(100% - ${at(run.to)})` }}
          />
        )}
      </div>
      <figcaption className="night-band-legend" aria-hidden="true">
        <span>
          {words.sunset} <b>{clock(sky.sunset)}</b>
        </span>
        <span className="night-band-dark">
          {words.dark}{" "}
          <b>
            {clock(sky.dusk)} – {clock(sky.dawn)}
          </b>
        </span>
        <span className="night-band-moon-key">
          <MoonGlyph lit={moon.lit} waxing={moon.waxing} />
          {words.moonLit(moon.lit)}
        </span>
        <span>
          {words.sunrise} <b>{clock(sky.sunrise)}</b>
        </span>
      </figcaption>
    </figure>
  );
}
