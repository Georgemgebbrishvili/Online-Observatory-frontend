import {
  AngleBetween,
  Body,
  Elongation,
  Equator,
  GeoVector,
  Horizon,
  MoonPhase,
  Observer,
  SearchGlobalSolarEclipse,
  SearchLocalSolarEclipse,
  SearchLunarEclipse,
  SearchMoonQuarter,
  SearchRelativeLongitude,
  Seasons,
  NextMoonQuarter,
} from "astronomy-engine";

/**
 * The sky's calendar for the booking board: the Moon's phases, close passes, oppositions,
 * eclipses, the seasons and the meteor showers of a month, dated on the observatory's
 * clock. Computed in the browser from astronomy-engine; nothing here comes from, or goes
 * to, the platform. The observer is Tbilisi, at city precision: it only decides whether
 * an eclipse is above the horizon there.
 */

export type Planet =
  "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";
export type MoonPhaseName = "new" | "first" | "full" | "last";
export type SeasonName =
  "marchEquinox" | "juneSolstice" | "septemberEquinox" | "decemberSolstice";
export type EclipseKindName = "penumbral" | "partial" | "annular" | "total";
export type Shower =
  | "quadrantids"
  | "lyrids"
  | "etaAquariids"
  | "perseids"
  | "orionids"
  | "leonids"
  | "geminids";

/** What happens, without when. */
export type SkyEvent =
  | { kind: "moon"; phase: MoonPhaseName }
  | { kind: "moonNear"; body: Planet; degrees: number }
  | { kind: "pair"; bodies: [Planet, Planet]; degrees: number }
  | { kind: "opposition"; body: Planet }
  | { kind: "season"; season: SeasonName }
  | { kind: "lunarEclipse"; eclipse: EclipseKindName; visible: boolean }
  | { kind: "solarEclipse"; eclipse: EclipseKindName; visible: boolean }
  | { kind: "meteors"; shower: Shower };

export type AlmanacEvent = SkyEvent & { date: string; at: string | null };

export type AlmanacKind = AlmanacEvent["kind"];

/** The observatory's site; the contract carries no coordinates, so Tbilisi's. */
export const tbilisi = new Observer(41.7151, 44.8271, 490);
const day = 86_400_000;

const bodies: Record<Planet, Body> = {
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};
/** Bright enough to make a pass worth a note. */
const nakedEye: Planet[] = ["mercury", "venus", "mars", "jupiter", "saturn"];
const outer: Planet[] = ["mars", "jupiter", "saturn", "uranus", "neptune"];
const phases: MoonPhaseName[] = ["new", "first", "full", "last"];

/** Peak nights of the major annual showers (IMO calendar; they drift by a day at most). */
const showers: { shower: Shower; month: number; day: number }[] = [
  { shower: "quadrantids", month: 1, day: 3 },
  { shower: "lyrids", month: 4, day: 22 },
  { shower: "etaAquariids", month: 5, day: 6 },
  { shower: "perseids", month: 8, day: 12 },
  { shower: "orionids", month: 10, day: 21 },
  { shower: "leonids", month: 11, day: 17 },
  { shower: "geminids", month: 12, day: 14 },
];

const pad = (n: number) => String(n).padStart(2, "0");

/** The calendar date of an instant on the observatory's clock, as YYYY-MM-DD. */
export function localDate(instant: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** An hour of a calendar date on the observatory's clock, as an instant. */
export function localHour(date: string, hour: number, timezone: string) {
  const guess = new Date(`${date}T${pad(hour)}:00:00Z`);
  const offset =
    new Date(guess.toLocaleString("en-US", { timeZone: timezone })).getTime() -
    new Date(guess.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(guess.getTime() - offset);
}

/** Every date of a month, YYYY-MM-DD. */
export function monthDates(year: number, month: number) {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`);
}

const shift = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * day).toISOString().slice(0, 10);

const cache = new Map<string, AlmanacEvent[]>();

/** The month's events, in date order. Memoised per month and zone. */
export function monthAlmanac(
  year: number,
  month: number,
  timezone: string,
): AlmanacEvent[] {
  const key = `${year}-${month}-${timezone}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const dates = monthDates(year, month);
  const first = dates[0];
  const last = dates[dates.length - 1];
  const inMonth = (date: string) => date >= first && date <= last;
  const start = new Date(localHour(first, 0, timezone).getTime() - day);
  const end = new Date(localHour(last, 0, timezone).getTime() + 2 * day);
  const events: AlmanacEvent[] = [];
  const push = (instant: Date, event: SkyEvent) => {
    const date = localDate(instant, timezone);
    if (inMonth(date)) events.push({ ...event, date, at: instant.toISOString() });
  };

  // The Moon's four phases.
  for (let q = SearchMoonQuarter(start); q.time.date < end; q = NextMoonQuarter(q)) {
    push(q.time.date, { kind: "moon", phase: phases[q.quarter] });
  }

  // Close passes, judged each evening at 21:00 on the site's clock: a night whose
  // separation is the smallest of its neighbours', under the limit, with both bodies
  // far enough from the Sun to be seen.
  const evenings = [shift(first, -1), ...dates, shift(last, 1)];
  const at = evenings.map((date) => localHour(date, 21, timezone));
  const moon = at.map((t) => GeoVector(Body.Moon, t, true));
  const planet = Object.fromEntries(
    nakedEye.map((p) => [p, at.map((t) => GeoVector(bodies[p], t, true))]),
  ) as Record<Planet, ReturnType<typeof GeoVector>[]>;
  const elong = Object.fromEntries(
    nakedEye.map((p) => [p, at.map((t) => Elongation(bodies[p], t).elongation)]),
  ) as Record<Planet, number[]>;
  const minima = (series: number[], limit: number) =>
    series
      .map((value, i) => ({ value, i }))
      .filter(
        ({ value, i }) =>
          i > 0 &&
          i < series.length - 1 &&
          value < limit &&
          value <= series[i - 1] &&
          value < series[i + 1],
      );

  for (const p of nakedEye) {
    const separation = at.map((_, i) => AngleBetween(moon[i], planet[p][i]));
    for (const { value, i } of minima(separation, 5)) {
      const moonElong = MoonPhase(at[i]);
      const awayFromSun = Math.min(moonElong, 360 - moonElong) > 25 && elong[p][i] > 15;
      if (awayFromSun) push(at[i], { kind: "moonNear", body: p, degrees: round(value) });
    }
  }
  for (let a = 0; a < nakedEye.length; a++) {
    for (let b = a + 1; b < nakedEye.length; b++) {
      const pa = nakedEye[a];
      const pb = nakedEye[b];
      const separation = at.map((_, i) => AngleBetween(planet[pa][i], planet[pb][i]));
      for (const { value, i } of minima(separation, 3)) {
        if (elong[pa][i] > 15 && elong[pb][i] > 15)
          push(at[i], { kind: "pair", bodies: [pa, pb], degrees: round(value) });
      }
    }
  }

  // Oppositions: the planet opposite the Sun, up all night.
  for (const p of outer) {
    const t = SearchRelativeLongitude(bodies[p], 0, start).date;
    if (t < end) push(t, { kind: "opposition", body: p });
  }

  // Equinoxes and solstices.
  const seasons = Seasons(year);
  const seasonTimes: [SeasonName, Date][] = [
    ["marchEquinox", seasons.mar_equinox.date],
    ["juneSolstice", seasons.jun_solstice.date],
    ["septemberEquinox", seasons.sep_equinox.date],
    ["decemberSolstice", seasons.dec_solstice.date],
  ];
  for (const [season, t] of seasonTimes) push(t, { kind: "season", season });

  // Eclipses, and whether Tbilisi sees them.
  for (
    let e = SearchLunarEclipse(start);
    e.peak.date < end;
    e = SearchLunarEclipse(new Date(e.peak.date.getTime() + day))
  ) {
    const eq = Equator(Body.Moon, e.peak, tbilisi, true, true);
    const altitude = Horizon(e.peak, tbilisi, eq.ra, eq.dec).altitude;
    push(e.peak.date, { kind: "lunarEclipse", eclipse: e.kind, visible: altitude > 0 });
  }
  const solar = SearchGlobalSolarEclipse(start);
  if (solar.peak.date < end) {
    const local = SearchLocalSolarEclipse(start, tbilisi);
    const visible =
      Math.abs(local.peak.time.date.getTime() - solar.peak.date.getTime()) < day &&
      local.peak.altitude > 0;
    push(solar.peak.date, {
      kind: "solarEclipse",
      eclipse: visible ? local.kind : solar.kind,
      visible,
    });
  }

  // Meteor showers, on their peak night.
  for (const s of showers) {
    if (s.month === month) {
      const date = `${year}-${pad(month)}-${pad(s.day)}`;
      events.push({ kind: "meteors", shower: s.shower, date, at: null });
    }
  }

  const order: AlmanacKind[] = [
    "solarEclipse",
    "lunarEclipse",
    "moon",
    "opposition",
    "pair",
    "moonNear",
    "meteors",
    "season",
  ];
  events.sort(
    (x, y) =>
      x.date.localeCompare(y.date) || order.indexOf(x.kind) - order.indexOf(y.kind),
  );
  cache.set(key, events);
  return events;
}

function round(degrees: number) {
  return Math.round(degrees * 10) / 10;
}
