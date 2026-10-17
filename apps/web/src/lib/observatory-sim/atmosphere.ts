/**
 * The air between the telescope and the sky: how bright it glows, how much it shakes
 * the image, the cloud drifting through it and the dew it leaves on the corrector.
 *
 * Every function here is pure and seeded. The same instant, pointing and seed give the
 * same sky on every run, so a test or a screenshot is stable and a session is
 * repeatable; the variety comes from the clock and the pointing, never from
 * `Math.random`.
 */

import type { AltAz } from './safety';
import { airmass } from './site-time';

const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

/* --- deterministic noise ----------------------------------------------- */

/** A repeatable value in [0, 1) for a pair of integers and a seed. */
export function hash01(a: number, b = 0, seed = 0): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** A repeatable value of roughly unit standard deviation and zero mean. */
export function hashNormal(a: number, b = 0, seed = 0): number {
  // The sum of three uniforms is close enough to a bell for a shimmer.
  return (hash01(a, b, seed) + hash01(a, b, seed + 1) + hash01(a, b, seed + 2) - 1.5) * 2;
}

/** Smooth 2-D value noise in [0, 1], one lattice cell per unit. */
export function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash01(x0, y0, seed);
  const b = hash01(x0 + 1, y0, seed);
  const c = hash01(x0, y0 + 1, seed);
  const d = hash01(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/* --- the sky's glow ------------------------------------------------------ */

export type SkyLight = {
  bortle: number;
  sunAltitudeDeg: number;
  /** The Moon's altitude, its distance from the pointing and its lit fraction; null when it is down. */
  moon: { altitudeDeg: number; separationDeg: number; fraction: number } | null;
  /** Altitude of the pointing: the city's glow climbs toward the horizon. */
  altitudeDeg: number;
  /** Cloud in front of the field, 0–1: a city lights its clouds from below. */
  cloud: number;
};

const flux = (mag: number) => Math.pow(10, -0.4 * mag);

/**
 * Twilight's own surface brightness, mag/arcsec², by the Sun's altitude: about 10 at
 * sunset, 14 at the end of civil twilight, 18 at the end of nautical, 22 at the end of
 * astronomical, after which it no longer counts.
 */
export function twilightMag(sunAltitudeDeg: number): number {
  if (sunAltitudeDeg > 0) return Math.max(4, 10.5 - 0.35 * sunAltitudeDeg);
  return 10.5 - 0.62 * sunAltitudeDeg;
}

/**
 * The sky's surface brightness in the field, V mag/arcsec²: the city's glow by Bortle
 * class, brighter toward the horizon and under cloud, plus twilight and the Moon's
 * scattered light, which grows as the pointing closes on it.
 */
export function skySurfaceBrightness(s: SkyLight): number {
  const zenith = 18.0 + (8 - s.bortle) * 0.38;
  const lowDown = 0.6 * (1 - Math.sin(clamp(s.altitudeDeg, 2, 90) * DEG));
  let total = flux(zenith - lowDown) * (1 + 2.5 * s.cloud);
  if (s.sunAltitudeDeg > -18) total += flux(twilightMag(s.sunAltitudeDeg));
  if (s.moon && s.moon.altitudeDeg > 0) {
    // A high full Moon puts a dark site near 18.3 mag/arcsec²; closer in, more scatter.
    const scatter = 0.6 + 25 / Math.max(4, s.moon.separationDeg);
    const height = Math.sqrt(Math.sin(s.moon.altitudeDeg * DEG));
    total += flux(18.3) * Math.pow(s.moon.fraction, 1.5) * height * scatter * (1 + s.cloud);
  }
  return -2.5 * Math.log10(total);
}

/** How far into twilight the sky is, 0 dark to 1 day: the blue the sensor sees. */
export function twilightFraction(sunAltitudeDeg: number): number {
  return smoothstep(-18, 0, sunAltitudeDeg);
}

/* --- seeing --------------------------------------------------------------- */

/**
 * Seeing at the zenith right now, arcseconds FWHM. The site's typical figure wanders
 * by a quarter over minutes and a little over seconds, as a night's seeing does.
 */
export function seeingAt(typicalArcsec: number, ms: number, seed = 1): number {
  const s = ms / 1000;
  const p = hash01(seed, 0, 7) * 100;
  const wander = 0.16 * Math.sin(s / 97 + p) + 0.07 * Math.sin(s / 23.3 + p * 1.7) + 0.04 * Math.sin(s / 6.1 + p * 2.3);
  return typicalArcsec * (1 + wander);
}

/** Seeing grows with the air the light crosses: FWHM scales as airmass to the 0.6. */
export function seeingAtAltitude(zenithArcsec: number, altitudeDeg: number): number {
  return zenithArcsec * Math.pow(airmass(Math.max(3, altitudeDeg)) ?? 15, 0.6);
}

/**
 * The image's tip-tilt for one frame, arcseconds. A millisecond frame freezes the
 * seeing and the whole image jumps by a fair fraction of the FWHM from frame to frame;
 * a long sub averages that out. Correlated over a few frames, as the air is.
 */
export function tipTiltArcsec(fwhmArcsec: number, exposureS: number, frame: number, seed = 1): { x: number; y: number } {
  const rms = 0.42 * fwhmArcsec * Math.min(1, Math.sqrt(0.02 / Math.max(0.0005, exposureS)));
  const f = frame;
  const x = 0.55 * Math.sin(f * 0.31 + seed) + 0.35 * Math.sin(f * 0.113 + seed * 2.1) + 0.45 * hashNormal(f >> 1, 1, seed);
  const y = 0.55 * Math.cos(f * 0.27 + seed * 1.3) + 0.35 * Math.cos(f * 0.131 + seed * 0.7) + 0.45 * hashNormal(f >> 1, 2, seed);
  return { x: x * rms, y: y * rms };
}

/**
 * Scintillation — twinkling — as the fractional rms of a star's brightness on one
 * frame: strong low down and on short frames, a few percent on a long sub (Young's
 * approximation, scaled for a 200 mm aperture).
 */
export function scintillation(altitudeDeg: number, exposureS: number, apertureMm: number): number {
  const am = airmass(Math.max(3, altitudeDeg)) ?? 15;
  const aperture = Math.pow(200 / Math.max(50, apertureMm), 2 / 3);
  return clamp((0.012 * aperture * Math.pow(am, 1.75)) / Math.sqrt(Math.max(0.002, exposureS)), 0, 0.45);
}

/* --- cloud ------------------------------------------------------------------ */

/** The cloud layer's features, in units of its height above the site, and its drift per second. */
const CLOUD_CELL = 0.016;
export const CLOUD_WIND = { u: 0.00031, v: 0.00009 };

/**
 * How much cloud is in front of this point of the sky now, 0 clear to 1 opaque, for a
 * forecast cover of `cover` (0–1).
 *
 * The cloud is a layer over the site, drifting with the wind: a point on the sky is
 * projected onto it, so the same cloud looks larger overhead than low down, and a
 * field the size of the telescope's sees an edge sweep across it in seconds.
 */
export function cloudOpacity(p: AltAz, ms: number, cover: number, seed = 1): number {
  if (cover <= 0.001) return 0;
  const alt = clamp(p.altitude, 5, 90) * DEG;
  const cot = Math.cos(alt) / Math.sin(alt);
  const t = ms / 1000;
  const u = (cot * Math.sin(p.azimuth * DEG) + CLOUD_WIND.u * t) / CLOUD_CELL;
  const v = (cot * Math.cos(p.azimuth * DEG) + CLOUD_WIND.v * t) / CLOUD_CELL;
  const n = 0.65 * valueNoise(u, v, seed) + 0.35 * valueNoise(u * 2.7 + 13.1, v * 2.7 - 7.4, seed + 1);
  // The noise sits mostly between 0.25 and 0.75: map the cover onto that band.
  const edge = 0.78 - 0.56 * clamp(cover, 0, 1);
  return smoothstep(edge - 0.06, edge + 0.1, n) * (0.55 + 0.45 * cover);
}

/* --- humidity and dew -------------------------------------------------------- */

/**
 * Relative humidity at the site, percent. The air cools after dusk and its humidity
 * climbs through the night; a cloudy night cools less. Each night starts from its own
 * seeded figure.
 */
export function humidityAt(ms: number, duskMs: number | null, cover: number): number {
  const night = Math.floor(ms / 86_400_000);
  const base = 46 + hash01(night, 3, 11) * 22;
  const hours = duskMs === null ? 0 : clamp((ms - duskMs) / 3_600_000, -3, 14);
  const rh = base + 4.4 * Math.max(0, hours) - 8 * clamp(cover, 0, 1) + 2.5 * Math.sin(ms / 1_700_000);
  return clamp(rh, 25, 99);
}

/**
 * Dew on the corrector plate, 0–1. An unheated Schmidt-Cassegrain's front glass
 * radiates to the sky and drops below the dew point on a humid night: dew forms above
 * about 85 % and thickens over the first half hour the tube is open to the sky.
 */
export function dewOnOptics(humidity: number, minutesOpen: number): number {
  return smoothstep(84, 97, humidity) * clamp(minutesOpen / 30, 0, 1);
}
