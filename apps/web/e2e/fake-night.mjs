import { Body, MakeTime, Observer, SearchAltitude } from "astronomy-engine";

// The fake's nights, by the platform's rule (apps/api/src/lib/slots/darkness.ts and
// generate.ts in darkview-platform): astronomical darkness at Tbilisi, the first slot on
// the next quarter hour after dusk, 30-minute slots starting every 15 minutes, the last
// one ending before dawn. Shared by the fake and the specs, so neither hard-codes a time.
const site = new Observer(41.7151, 44.8271, 490);
// Tbilisi keeps UTC+4 all year.
const tbilisiOffsetMs = 4 * 3_600_000;
const strideMs = 15 * 60_000;
const durationMs = 30 * 60_000;
const alignMs = 15 * 60_000;

/** The fake's one held booking: the night's fifth start. */
export const fakeBookedIndex = 4;

/**
 * Starts a held booking blocks: its own, and any whose session of `minutes` would reach
 * it or its 10-minute turnaround (ADR-072: a session may run any quarter hour to 4 h).
 */
export function fakeBlocked(index, minutes = 30) {
  const start = index * 15;
  const held = fakeBookedIndex * 15;
  return start < held + 30 + 10 && held < start + minutes + 10;
}

/** ADR-072: whether a session may run this long -- a quarter hour from 15 to 240. */
export function fakeSessionLength(minutes) {
  return (
    Number.isInteger(minutes) && minutes >= 15 && minutes <= 240 && minutes % 15 === 0
  );
}

/** ADR-072: how many starts a night has for a session this long, ending before dawn. */
export function fakeStarts(date, minutes = 30) {
  return Math.max(0, fakeNight(date).count - (minutes - 30) / 15);
}

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
