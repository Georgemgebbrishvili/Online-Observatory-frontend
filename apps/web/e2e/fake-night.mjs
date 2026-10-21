import { Body, MakeTime, Observer, SearchAltitude } from "astronomy-engine";

// The fake's nights, by the platform's rule (apps/api/src/lib/slots/darkness.ts and
// generate.ts in darkview-platform): astronomical darkness at Tbilisi, the first slot on
// the next five-minute mark after dusk, 30-minute slots on a 40-minute stride, the last
// one ending before dawn. Shared by the fake and the specs, so neither hard-codes a time.
const site = new Observer(41.7151, 44.8271, 490);
// Tbilisi keeps UTC+4 all year.
const tbilisiOffsetMs = 4 * 3_600_000;
const strideMs = 40 * 60_000;
const durationMs = 30 * 60_000;
const alignMs = 5 * 60_000;

/** The night that begins on `date` (YYYY-MM-DD, Tbilisi): its first slot and how many. */
export function fakeNight(date) {
  const noon = new Date(Date.parse(`${date}T12:00:00.000Z`) - tbilisiOffsetMs);
  const dusk = SearchAltitude(Body.Sun, site, -1, MakeTime(noon), 1, -18);
  const dawn = SearchAltitude(Body.Sun, site, +1, dusk, 1, -18);
  const first = Math.ceil(dusk.date.getTime() / alignMs) * alignMs;
  const count = Math.floor((dawn.date.getTime() - durationMs - first) / strideMs) + 1;
  return { first, count };
}

/** The night an instant falls in, by the Tbilisi calendar: the evening it began on. */
export function fakeNightOf(at) {
  return new Date(at + tbilisiOffsetMs - 12 * 3_600_000).toISOString().slice(0, 10);
}

/** The nth slot of a night, as the instant the platform writes. */
export function fakeSlotAt(date, index) {
  return new Date(fakeNight(date).first + index * strideMs).toISOString();
}

/** A slot's start in Tbilisi wall-clock time, "HH:MM". */
export function fakeLocalTime(iso) {
  return new Date(Date.parse(iso) + tbilisiOffsetMs).toISOString().slice(11, 16);
}
