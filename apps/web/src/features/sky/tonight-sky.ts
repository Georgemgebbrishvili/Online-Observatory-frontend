import {
  Body,
  Equator,
  Horizon,
  Illumination,
  MakeTime,
  MoonPhase,
} from "astronomy-engine";

import { tbilisi } from "@/features/booking/almanac";
import { nightSky } from "@/features/booking/night-sky";

export type SkyBody =
  "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune";

export type SkyObject = {
  body: SkyBody;
  /** When it stands highest in the night, and how high (degrees). */
  best: number;
  altitude: number;
  /** Compass point at its best, 0-7 from north clockwise. */
  direction: number;
  magnitude: number;
  /** Up from and until, within the night (sunset to sunrise). */
  from: number;
  to: number;
  /** Moon only: lit percent and whether it is growing. */
  lit?: number;
  waxing?: boolean;
};

export type TonightSky = {
  date: string;
  sunset: number;
  sunrise: number;
  objects: SkyObject[];
};

const bodies: SkyBody[] = [
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];
const step = 10 * 60_000;
/** Lower than this, buildings and haze hide it. */
const minAltitude = 10;

/** The calendar date whose evening the night belongs to: before noon it is still last night. */
export function nightDate(now: Date, timezone: string) {
  const local = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  if (local.getHours() < 12) local.setDate(local.getDate() - 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}`;
}

function altAz(body: Body, at: number) {
  const time = MakeTime(new Date(at));
  const equ = Equator(body, time, tbilisi, true, true);
  const hor = Horizon(time, tbilisi, equ.ra, equ.dec, "normal");
  return { alt: hor.altitude, az: hor.azimuth };
}

/** What is up over the observatory tonight: the Moon and the planets, brightest first. */
export function tonightSky(now: Date, timezone: string): TonightSky | null {
  const date = nightDate(now, timezone);
  const night = nightSky(date, timezone);
  if (!night) return null;
  const objects: SkyObject[] = [];

  for (const name of bodies) {
    const body = Body[name];
    // Planets need the sky dark enough to stand out (Sun 6° down); the Moon shows at once.
    const start = name === "Moon" ? night.sunset : night.sunset + 30 * 60_000;
    const end = name === "Moon" ? night.sunrise : night.sunrise - 30 * 60_000;
    let best = { at: start, alt: -90, az: 0 };
    let from: number | null = null;
    let to = start;
    for (let at = start; at <= end; at += step) {
      const { alt, az } = altAz(body, at);
      if (alt > best.alt) best = { at, alt, az };
      if (alt >= minAltitude) {
        from ??= at;
        to = at;
      }
    }
    if (from === null) continue;
    const ill = Illumination(body, MakeTime(new Date(best.at)));
    objects.push({
      body: name,
      best: best.at,
      altitude: Math.round(best.alt),
      direction: Math.round(best.az / 45) % 8,
      magnitude: Math.round(ill.mag * 10) / 10,
      from,
      to,
      ...(name === "Moon" && {
        lit: Math.round(ill.phase_fraction * 100),
        waxing: MoonPhase(MakeTime(new Date(best.at))) < 180,
      }),
    });
  }

  objects.sort((a, b) => a.magnitude - b.magnitude);
  return { date, sunset: night.sunset, sunrise: night.sunrise, objects };
}
