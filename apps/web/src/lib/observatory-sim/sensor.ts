/**
 * What the sensor records and how the console displays it (ADR-054 §3).
 *
 * Photons become electrons, electrons become ADU at the gain's conversion factor, and
 * the 12-bit converter clips at 4095. The display is a fixed asinh stretch on ADU, the
 * way a live-stacking screen shows a frame: so a longer sub or more gain brightens the
 * sky and the stars, lifts the grain with them, and pushes bright stars into a clipped
 * white core. The noise is the frame's own — read noise, the sky's shot noise, dark
 * current — and it falls as the square root of the frames stacked.
 */

import { electronsPerAdu, readNoiseE, starElectronsPerSecond } from './camera';
import { ASI585MC } from './instrument';
import { hash01 } from './atmosphere';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The converter's ceiling: 12 bits. */
export const ADU_MAX = 2 ** ASI585MC.adcBits - 1;

/** Dark current of a normal pixel at the sensor's working temperature, electrons per second. */
export const DARK_E_PER_S = 0.004;

const STRETCH = 100;
const ASINH_STRETCH = Math.asinh(STRETCH);

/** The display stretch: a fraction of the converter's range to a display level, 0–1. */
export function stretch(lin: number): number {
  return clamp(Math.asinh(STRETCH * Math.max(0, lin)) / ASINH_STRETCH, 0, 1);
}

/** How steep the stretch is at a level: how much a small linear change shows. */
export function stretchSlope(lin: number): number {
  const x = STRETCH * Math.max(0, lin);
  return STRETCH / Math.sqrt(1 + x * x) / ASINH_STRETCH;
}

export type SensorInput = {
  exposureS: number;
  gain: number;
  /** Frames in the stack shown. */
  subs: number;
  /** Sky background on one pixel, electrons per second. */
  skyEPerS: number;
};

export type SensorLevels = {
  ePerAdu: number;
  /** The sky background as a fraction of the converter's range, before the stretch. */
  skyLin: number;
  /** The sky as displayed, 0–1. */
  sky: number;
  /** The stacked frame's noise as displayed: one standard deviation, 0–1. */
  noise: number;
  /** Signal-to-noise of the sky background per pixel, in the stack. */
  snr: number;
};

/** The frame's background and grain for this exposure, gain, sky and stack. */
export function sensorLevels(x: SensorInput): SensorLevels {
  const ePerAdu = electronsPerAdu(x.gain);
  const subs = Math.max(1, x.subs);
  const skyE = x.skyEPerS * x.exposureS;
  const darkE = DARK_E_PER_S * x.exposureS;
  const read = readNoiseE(x.gain);
  const noiseE = Math.sqrt(read * read + skyE + darkE);
  const skyLin = Math.min(1, (skyE + darkE) / ePerAdu / ADU_MAX);
  const noiseLin = noiseE / ePerAdu / ADU_MAX / Math.sqrt(subs);
  // A clipped sky has no grain left to show: the frame is white.
  const noise = skyLin >= 1 ? 0 : Math.min(0.3, stretchSlope(skyLin) * noiseLin);
  return { ePerAdu, skyLin, sky: stretch(skyLin), noise, snr: (skyE / noiseE) * Math.sqrt(subs) };
}

/**
 * A star's brightest pixel on one sub, as a fraction of the converter's range: its
 * light spread by a Gaussian of this FWHM over pixels of this scale. Past 1 its core
 * is clipped, and the clipped disc grows with the star's brightness.
 */
export function starPeakLin(mag: number, fwhmArcsec: number, plateScaleArcsecPx: number, apertureMm: number, exposureS: number, gain: number): number {
  const sigmaPx = Math.max(0.6, fwhmArcsec / 2.355 / plateScaleArcsecPx);
  const electrons = (starElectronsPerSecond(mag, apertureMm) * exposureS) / (2 * Math.PI * sigmaPx * sigmaPx);
  return electrons / electronsPerAdu(gain) / ADU_MAX;
}

/**
 * The faintest star the frame shows: the magnitude whose peak stands 2.5 standard
 * deviations of the stacked noise clear of the sky. A clipped sky shows none.
 */
export function faintestStar(levels: SensorLevels, peakAtMag0: number): number {
  if (levels.skyLin >= 1) return -5;
  const needed = (2.5 * Math.max(levels.noise, 0.002)) / stretchSlope(levels.skyLin);
  return clamp(-2.5 * Math.log10(needed / peakAtMag0), -5, 18);
}

export type HotPixel = {
  /** Position on the sensor as a fraction of its width and height. */
  x: number;
  y: number;
  /** Dark current of this pixel, electrons per second. */
  ePerS: number;
};

/**
 * The sensor's hot pixels: a fixed handful, the same every session, fixed to the
 * sensor rather than the sky. Each leaks tens to hundreds of electrons a second, so a
 * long sub at high gain shows them and a millisecond frame does not.
 */
export function hotPixels(seed = 585, count = 14): HotPixel[] {
  return Array.from({ length: count }, (_, n) => ({
    x: 0.02 + hash01(n, 1, seed) * 0.96,
    y: 0.02 + hash01(n, 2, seed) * 0.96,
    ePerS: 20 * Math.pow(20, hash01(n, 3, seed)),
  }));
}

/** A hot pixel's level above the sky on the stack, 0–1: a stack's outlier rejection thins it frame by frame. */
export function hotPixelLevel(p: HotPixel, levels: SensorLevels, exposureS: number, subs: number): number {
  const lin = (p.ePerS * exposureS) / levels.ePerAdu / ADU_MAX;
  return (stretch(levels.skyLin + Math.min(1, lin)) - levels.sky) / Math.max(1, subs);
}
