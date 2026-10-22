import {
  Body,
  Equator,
  Horizon,
  MakeTime,
  SearchAltitude,
  SearchRiseSet,
} from "astronomy-engine";

import { localHour, tbilisi } from "@/features/booking/almanac";

/** A night's light at the observatory: when the Sun goes, when the dark is, when it is back. */
export type NightSky = {
  sunset: number;
  /** Astronomical dusk and dawn: the Sun 18° down, the platform's dark window. */
  dusk: number;
  dawn: number;
  sunrise: number;
  midnight: number;
  /** The stretches of the drawn span with the Moon above the horizon. */
  moonUp: { from: number; to: number }[];
};

const minute = 60_000;

/**
 * The night that begins on `date` on the observatory's clock, by astronomy-engine: the
 * same dusk and dawn the platform sells slots between (darkness.ts), and the sunset and
 * sunrise either side. Null where the Sun never sets or never goes 18° down.
 */
export function nightSky(date: string, timezone: string): NightSky | null {
  const key = `${date}|${timezone}`;
  if (!nights.has(key)) nights.set(key, computeNight(date, timezone));
  return nights.get(key) ?? null;
}

// A night's light never changes: worked out once per date and zone.
const nights = new Map<string, NightSky | null>();

function computeNight(date: string, timezone: string): NightSky | null {
  const noon = MakeTime(localHour(date, 12, timezone));
  const sunset = SearchRiseSet(Body.Sun, tbilisi, -1, noon, 1);
  if (!sunset) return null;
  const dusk = SearchAltitude(Body.Sun, tbilisi, -1, sunset, 1, -18);
  if (!dusk) return null;
  const dawn = SearchAltitude(Body.Sun, tbilisi, +1, dusk, 1, -18);
  if (!dawn) return null;
  const sunrise = SearchRiseSet(Body.Sun, tbilisi, +1, dawn, 1);
  if (!sunrise) return null;

  const from = sunset.date.getTime();
  const to = sunrise.date.getTime();
  // The Moon sampled every ten minutes: plenty for a bar a few hundred pixels long.
  const moonUp: NightSky["moonUp"] = [];
  let open: number | null = null;
  for (let at = from; at <= to; at += 10 * minute) {
    const time = MakeTime(new Date(at));
    const equ = Equator(Body.Moon, time, tbilisi, true, true);
    const up = Horizon(time, tbilisi, equ.ra, equ.dec, "normal").altitude > 0;
    if (up && open === null) open = at;
    if (!up && open !== null) {
      moonUp.push({ from: open, to: at });
      open = null;
    }
  }
  if (open !== null) moonUp.push({ from: open, to });

  const nextDay = new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000)
    .toISOString()
    .slice(0, 10);
  return {
    sunset: from,
    dusk: dusk.date.getTime(),
    dawn: dawn.date.getTime(),
    sunrise: to,
    midnight: localHour(nextDay, 0, timezone).getTime(),
    moonUp,
  };
}
