import { Body, Equator, Horizon, Illumination, MakeTime, SiderealTime } from "astronomy-engine";

import { tbilisi } from "@/features/booking/almanac";
import { nightSky } from "@/features/booking/night-sky";
import { nightDate } from "@/features/sky/tonight-sky";

export type StoryKind = "moon" | "planet" | "galaxy" | "nebula" | "cluster";

/** One showpiece on the homepage's scroll story, with where it stands tonight. */
export type StoryObject = {
  id: string;
  kind: StoryKind;
  /** The picture it is drawn with: a photograph for the Moon and planets, a painted plate otherwise. */
  image: string;
  /** When it stands highest in the dark, and how high (degrees). */
  best: number;
  altitude: number;
  /** Compass point at its best, 0-7 from north clockwise. */
  direction: number;
  /** Up (15° or more) from and until, within the dark. */
  from: number;
  to: number;
  /** Of date, degrees, at the start of the dark; a body drifts by dra/ddec degrees an hour. */
  ra: number;
  dec: number;
  dra: number;
  ddec: number;
  magnitude: number;
};

/** Everything the story's drawn sky needs, for tonight over the observatory. */
export type StorySky = {
  date: string;
  /** Astronomical dusk and dawn: the dark the platform sells slots in. */
  start: number;
  end: number;
  latitude: number;
  /** Local sidereal time at the start, degrees. */
  lst0: number;
  /** Years since J2000, for precessing the star catalogue. */
  years: number;
  /** The Sun at the start (of date), to turn the Moon's lit side toward it. */
  sun: { ra: number; dec: number };
  moonLit: number;
  /** Up to six, the Moon and planets first, each high enough to be worth a session. */
  objects: StoryObject[];
};

type Candidate = {
  id: string;
  kind: StoryKind;
  image: string;
  body?: Body;
  /** J2000, hours and degrees, as the simulator's catalogue has them. */
  raHours?: number;
  dec?: number;
  magnitude?: number;
};

/** The showpieces (lib/observatory-sim/showpieces.ts) the homepage has a picture for. */
const candidates: Candidate[] = [
  { id: "moon", kind: "moon", image: "/sky/moon-lro.webp", body: Body.Moon },
  { id: "saturn", kind: "planet", image: "/sky/targets/saturn.jpg", body: Body.Saturn },
  { id: "jupiter", kind: "planet", image: "/sky/targets/jupiter.jpg", body: Body.Jupiter },
  { id: "mars", kind: "planet", image: "/sky/targets/mars.jpg", body: Body.Mars },
  { id: "venus", kind: "planet", image: "/sky/targets/venus.jpg", body: Body.Venus },
  { id: "m42", kind: "nebula", image: "/sky/plates/m42.webp", raHours: 5.591, dec: -5.391, magnitude: 4 },
  { id: "m31", kind: "galaxy", image: "/sky/plates/m31.webp", raHours: 0.712, dec: 41.269, magnitude: 3.4 },
  { id: "m13", kind: "cluster", image: "/sky/plates/m13.webp", raHours: 16.695, dec: 36.46, magnitude: 5.8 },
  { id: "ngc869", kind: "cluster", image: "/sky/plates/ngc869.webp", raHours: 2.317, dec: 57.13, magnitude: 5.3 },
  { id: "m27", kind: "nebula", image: "/sky/plates/m27.webp", raHours: 19.993, dec: 22.721, magnitude: 7.5 },
  { id: "m51", kind: "galaxy", image: "/sky/plates/m51.webp", raHours: 13.498, dec: 47.195, magnitude: 8.4 },
  { id: "m81", kind: "galaxy", image: "/sky/plates/m81.webp", raHours: 9.926, dec: 69.067, magnitude: 6.9 },
];

const DEG = Math.PI / 180;
const step = 10 * 60_000;
const hour = 3_600_000;
/** High enough to clear the roofs and the worst of the air. */
const minBest = 25;
const minUp = 15;
const shown = 6;

/** J2000 to the date, first-order precession (arcseconds over a few decades). */
export function precess(ra: number, dec: number, years: number): [number, number] {
  const r = ra * DEG;
  const d = Math.min(89, Math.max(-89, dec)) * DEG;
  return [
    (ra + ((46.1244 + 20.0431 * Math.sin(r) * Math.tan(d)) * years) / 3600 + 360) % 360,
    dec + (20.0431 * Math.cos(r) * years) / 3600,
  ];
}

/**
 * Tonight's dark over the observatory and the showpieces worth pointing at in it: where
 * each stands, when it is highest, and the numbers the drawn sky turns by. Null where
 * the night has no astronomical dark.
 */
export function storySky(now: Date, timezone: string): StorySky | null {
  const date = nightDate(now, timezone);
  const night = nightSky(date, timezone);
  if (!night) return null;
  const { dusk: start, dawn: end } = night;
  const years = (start - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86_400_000);

  const equator = (body: Body, at: number) => {
    const e = Equator(body, MakeTime(new Date(at)), tbilisi, true, true);
    return { ra: e.ra * 15, dec: e.dec };
  };
  const altAz = (ra: number, dec: number, at: number) => {
    const h = Horizon(MakeTime(new Date(at)), tbilisi, ra / 15, dec, "normal");
    return { alt: h.altitude, az: h.azimuth };
  };

  const objects: StoryObject[] = [];
  for (const c of candidates) {
    const fixed = c.body === undefined ? precess((c.raHours ?? 0) * 15, c.dec ?? 0, years) : null;
    const place = (at: number) => (c.body === undefined ? { ra: fixed![0], dec: fixed![1] } : equator(c.body, at));
    let best = { at: start, alt: -90, az: 0 };
    let from: number | null = null;
    let to = start;
    for (let at = start; at <= end; at += step) {
      const p = place(at);
      const { alt, az } = altAz(p.ra, p.dec, at);
      if (alt > best.alt) best = { at, alt, az };
      if (alt >= minUp) {
        from ??= at;
        to = at;
      }
    }
    if (from === null || best.alt < minBest) continue;
    const a = place(start);
    const b = place(start + 2 * hour);
    objects.push({
      id: c.id,
      kind: c.kind,
      image: c.image,
      best: best.at,
      altitude: Math.round(best.alt),
      direction: Math.round(best.az / 45) % 8,
      from,
      to,
      ra: a.ra,
      dec: a.dec,
      dra: (((b.ra - a.ra + 540) % 360) - 180) / 2,
      ddec: (b.dec - a.dec) / 2,
      magnitude: c.body === undefined ? (c.magnitude ?? 6) : Illumination(c.body, MakeTime(new Date(best.at))).mag,
    });
  }

  // The Moon and planets lead (brightest first), then the deep sky, highest first.
  const solar = objects.filter((o) => o.kind === "moon" || o.kind === "planet").sort((a, b) => a.magnitude - b.magnitude);
  const deep = objects.filter((o) => o.kind !== "moon" && o.kind !== "planet").sort((a, b) => b.altitude - a.altitude);
  const picks = [...solar.slice(0, 3), ...deep].slice(0, shown);

  const time = MakeTime(new Date(start));
  return {
    date,
    start,
    end,
    latitude: tbilisi.latitude,
    lst0: (SiderealTime(time) * 15 + tbilisi.longitude + 360) % 360,
    years,
    sun: equator(Body.Sun, start),
    moonLit: Illumination(Body.Moon, time).phase_fraction,
    objects: picks,
  };
}
