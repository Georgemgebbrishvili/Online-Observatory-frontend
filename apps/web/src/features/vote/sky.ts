import type { Target, TonightTarget } from "@darkview/contracts";
import { Body, Equator, Horizon, Observer } from "astronomy-engine";

import { raDecToAzAlt } from "@/lib/observatory-sim/catalog";
import { getTonightDarkWindow } from "@/lib/observatory-sim/dark-window";
import { NODES } from "@/lib/observatory-sim/nodes";
import type { Locale } from "@/i18n/config";

export type TrackPoint = { at: string; alt: number };

export type VoteCandidate = {
  target: Target;
  name: string;
  /** The highest the target climbs between dusk and dawn, degrees. */
  altitudeDeg: number;
  /** When it is highest, ISO. */
  at: string;
  /** Its altitude through the night, dusk to dawn, for the chart. */
  track: TrackPoint[];
  votes: number;
};

export type NightWindow = { dusk: string; dawn: string };

const BODIES: Partial<Record<string, Body>> = {
  MOON: Body.Moon,
  MERCURY: Body.Mercury,
  VENUS: Body.Venus,
  MARS: Body.Mars,
  JUPITER: Body.Jupiter,
  SATURN: Body.Saturn,
  URANUS: Body.Uranus,
  NEPTUNE: Body.Neptune,
};

/** The site the sky model computes for (ADR-003: one observatory, in Tbilisi). */
const site = NODES[0];

/** A target's altitude over the site at an instant, or null when the model cannot place it. */
function altitudeAt(target: Target, date: Date): number | null {
  if (target.positionSource === "EPHEMERIS") {
    const body = target.solarSystemBody ? BODIES[target.solarSystemBody] : undefined;
    if (!body) return null;
    const observer = new Observer(site.lat, site.lon, 0);
    const eq = Equator(body, date, observer, true, true);
    return Horizon(date, observer, eq.ra, eq.dec, "normal").altitude;
  }
  if (!target.coordinates) return null;
  return raDecToAzAlt(
    target.coordinates.raHours,
    target.coordinates.decDegrees,
    site.lat,
    site.lon,
    date,
  ).altitude;
}

/** Tonight's dark window at the site, or the next twelve hours where the Sun never sets far enough. */
export function nightWindow(now: Date): NightWindow {
  const dark = getTonightDarkWindow(site.lat, site.lon, now, site.timezone);
  if (dark.duskStart && dark.dawnEnd)
    return { dusk: dark.duskStart.toISOString(), dawn: dark.dawnEnd.toISOString() };
  return {
    dusk: now.toISOString(),
    dawn: new Date(now.getTime() + 12 * 3_600_000).toISOString(),
  };
}

/**
 * The week's candidates: every target the platform judges observable tonight, with its
 * path through the night as the sky model draws it. Observability is the platform's
 * verdict; the model only draws where the object will be.
 */
export function voteCandidates(
  items: TonightTarget[],
  window: NightWindow,
  locale: Locale,
  samples = 40,
): VoteCandidate[] {
  const t0 = Date.parse(window.dusk);
  const t1 = Date.parse(window.dawn);
  const out: VoteCandidate[] = [];
  for (const { target, visibility } of items) {
    if (!visibility.observable) continue;
    const track: TrackPoint[] = [];
    let best: TrackPoint | null = null;
    for (let i = 0; i <= samples; i += 1) {
      const t = t0 + ((t1 - t0) * i) / samples;
      const alt = altitudeAt(target, new Date(t));
      if (alt === null) break;
      const point = { at: new Date(t).toISOString(), alt };
      track.push(point);
      if (!best || alt > best.alt) best = point;
    }
    if (!best) continue;
    out.push({
      target,
      name: locale === "ka" ? target.nameKa : target.nameEn,
      altitudeDeg: best.alt,
      at: best.at,
      track,
      votes: 0,
    });
  }
  return out.sort((a, b) => b.altitudeDeg - a.altitudeDeg);
}

/** The Monday of the week a night falls in, as YYYY-MM-DD, and the night itself. */
export function weekOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
