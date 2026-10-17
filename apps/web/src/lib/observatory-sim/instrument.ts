/**
 * The instrument, as its makers specify it (ADR-054).
 *
 * Every number here has a source: Celestron's NexStar 8SE specification page and the
 * NexStar SE instruction manual, and ZWO's ASI585MC sheet. Nothing is rounded for
 * effect; where a maker gives a range, the conservative end is taken and said.
 */

import type { Instrument } from './types';

/** Celestron NexStar 8SE: 203.2 mm Schmidt-Cassegrain, 2032 mm, f/10. */
export const NEXSTAR_8SE = {
  model: 'Celestron NexStar 8SE',
  apertureMm: 203.2,
  focalLengthMm: 2032,
  /** Secondary obstruction, 64 mm: 31 % by diameter, 9.8 % by area. Out of focus a star is this ring. */
  obstructionMm: 64,
  obstructionRatio: 64 / 203.2,
  /** Dawes' limit as Celestron quotes it; Rayleigh is 0.69″. */
  dawesArcsec: 0.57,
  rayleighArcsec: 0.69,
  /** Visual limiting magnitude, Celestron's figure. */
  limitingMagnitude: 14,
  mount: 'Computerised altazimuth single fork arm, DC servo motors with encoders',
  /** Motor encoder resolution, from the manual's mechanical specifications. */
  encoderArcsec: 0.26,
} as const;

/**
 * The hand control's nine rates, as the NexStar SE manual's table lists them:
 * 1 = .5x, 2 = 1x, 3 = 4x, 4 = 8x, 5 = 16x, 6 = 64x (sidereal), 7 = 1°/s, 8 = 3°/s,
 * 9 = 5°/s ("depending on power source"). Rates 1–6 are for centring in the eyepiece,
 * 7–9 for getting across the sky.
 */
export const SIDEREAL_DEG_S = 15.041 / 3600;
export const HC_RATES: ReadonlyArray<{ rate: number; degPerSec: number; label: string }> = [
  { rate: 1, degPerSec: 0.5 * SIDEREAL_DEG_S, label: '0.5×' },
  { rate: 2, degPerSec: 1 * SIDEREAL_DEG_S, label: '1×' },
  { rate: 3, degPerSec: 4 * SIDEREAL_DEG_S, label: '4×' },
  { rate: 4, degPerSec: 8 * SIDEREAL_DEG_S, label: '8×' },
  { rate: 5, degPerSec: 16 * SIDEREAL_DEG_S, label: '16×' },
  { rate: 6, degPerSec: 64 * SIDEREAL_DEG_S, label: '64×' },
  { rate: 7, degPerSec: 1, label: '1°/s' },
  { rate: 8, degPerSec: 3, label: '3°/s' },
  { rate: 9, degPerSec: 5, label: '5°/s' },
];
export const MAX_SLEW_DEG_S = 5;

/** ZWO ASI585MC: Sony IMX585, 3840 × 2160 at 2.9 µm, 11.14 × 6.26 mm, 12-bit. */
export const ASI585MC = {
  model: 'ZWO ASI585MC',
  sensor: 'IMX585',
  widthPx: 3840,
  heightPx: 2160,
  pixelUm: 2.9,
  widthMm: 3840 * 2.9e-3,
  heightMm: 2160 * 2.9e-3,
  /** Exposure range from the sheet: 32 µs to 2000 s. */
  minExposureS: 32e-6,
  maxExposureS: 2000,
  /** Gain in ZWO's 0.1 dB units; the high-conversion-gain stage switches in at 252. */
  minGain: 0,
  maxGain: 600,
  hcgGain: 252,
  /** Full well at gain 0, electrons. */
  fullWellE: 40_000,
  /** Read noise, electrons: the sheet's range runs from about 7 e⁻ at gain 0 to 0.7 e⁻ at the top. */
  readNoiseE: { lowGain: 7, hcg: 1.5, top: 0.7 },
  adcBits: 12,
  /** Full-frame frame rate, frames per second; a smaller region runs faster. */
  maxFps: 47,
  peakQe: 0.91,
} as const;

/** The station's instrument record, as the rest of the model consumes it. */
export const TBILISI_8SE: Instrument = {
  optics: NEXSTAR_8SE.model,
  apertureMm: NEXSTAR_8SE.apertureMm,
  focalLengthMm: NEXSTAR_8SE.focalLengthMm,
  mount: 'Single-fork altazimuth, GoTo',
  camera: ASI585MC.model,
  sensorWidthMm: ASI585MC.widthMm,
  sensorHeightMm: ASI585MC.heightMm,
  pixelSizeUm: ASI585MC.pixelUm,
  suitedTo: ['Moon', 'Planets', 'BrightDeepSky'],
};
