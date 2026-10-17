/**
 * The camera as ZWO sells it (ADR-054 §3): the ASI585MC's exposures, gain stages,
 * read noise, full well and read-out regions, and what they do to a frame.
 *
 * A frame takes its exposure time. The feed shows the last sub that finished; a new
 * one lands when the next exposure ends; the stack is the mean of what has landed. A
 * ten-millisecond sub of Jupiter and an eight-second sub of a galaxy are the same
 * camera doing what the operator asked, and the noise, the limit and the burn-out all
 * follow from the numbers rather than from a mood.
 */

import { ASI585MC } from './instrument';

/** The exposures the console offers, seconds: the planetary milliseconds up to a deep-sky minute. */
export const EXPOSURES_S: readonly number[] = [
  0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 4, 8, 15, 30, 60,
];

/** Frames a stack may hold: hundreds for lucky imaging, a handful for a long sub. */
export const STACK_SIZES: readonly number[] = [1, 2, 4, 8, 16, 32, 64, 100, 200, 500];

export const GAIN = { min: ASI585MC.minGain, max: ASI585MC.maxGain, hcg: ASI585MC.hcgGain, step: 10 } as const;

export type RoiPreset = { id: 'full' | '1080' | '640'; label: string; widthPx: number; heightPx: number };

/** Read-out regions: the full sensor, a 1080-line crop, and the planetary 640 × 480. */
export const ROIS: readonly RoiPreset[] = [
  { id: 'full', label: `${ASI585MC.widthPx} × ${ASI585MC.heightPx}`, widthPx: ASI585MC.widthPx, heightPx: ASI585MC.heightPx },
  { id: '1080', label: '1920 × 1080', widthPx: 1920, heightPx: 1080 },
  { id: '640', label: '640 × 480', widthPx: 640, heightPx: 480 },
];

export const ROI_BY_ID = new Map(ROIS.map((r) => [r.id, r]));

/** "8 s", "500 ms", "0.5 ms". */
export function exposureLabel(seconds: number): string {
  if (seconds >= 1) return `${seconds} s`;
  const ms = seconds * 1000;
  return `${ms >= 1 ? ms : ms.toFixed(1)} ms`;
}

/** Electrons per ADU at this gain: ZWO's 0.1 dB steps, so 10 dB of gain is 200 units. */
export function electronsPerAdu(gain: number): number {
  const base = ASI585MC.fullWellE / Math.pow(2, ASI585MC.adcBits);
  return base / Math.pow(10, gain / 200);
}

/** Read noise in electrons at this gain, on the sheet's curve: high at the bottom, a step down at HCG, lowest at the top. */
export function readNoiseE(gain: number): number {
  const { lowGain, hcg, top } = ASI585MC.readNoiseE;
  if (gain < GAIN.hcg) return lowGain - ((lowGain - hcg * 2) * gain) / GAIN.hcg;
  return hcg - ((hcg - top) * (gain - GAIN.hcg)) / (GAIN.max - GAIN.hcg);
}

/** The electrons a pixel can hold before it clips, at this gain. */
export function fullWellE(gain: number): number {
  return Math.max(300, ASI585MC.fullWellE / Math.pow(10, gain / 200));
}

/**
 * Sky background electrons per pixel per second at a plate scale, by Bortle class.
 *
 * A Bortle 8 sky is about 18.0 mag/arcsec²; each class darker is roughly a third of a
 * magnitude. At 0.29″/px on an 8″ f/10 that is a few electrons a second: enough to lift
 * an 8 s sub well clear of the read noise, which is what makes short subs work.
 */
export function skyElectronsPerSecond(bortle: number, plateScaleArcsecPx: number, apertureMm: number): number {
  const magPerArcsec2 = 18.0 + (8 - bortle) * 0.38;
  // Zero-point: a mag-0 star delivers about 1e6 photons/s/cm² in V; QE and losses to 0.5.
  const flux = 1e6 * Math.pow(10, -0.4 * magPerArcsec2) * plateScaleArcsecPx ** 2;
  const areaCm2 = Math.PI * (apertureMm / 20) ** 2 * (1 - 0.31 ** 2);
  return flux * areaCm2 * 0.5;
}

export type FrameNoise = {
  /** Total noise in electrons on one sub. */
  subE: number;
  /** Signal-to-noise of the sky background per pixel on one sub. */
  skySnr: number;
  /** Noise as a fraction of the display range once the frame is stretched, 0–1. */
  display: number;
};

/**
 * What one sub's noise looks like after the display stretch.
 *
 * Live-stacking software stretches so the sky sits near the bottom of the range; the
 * grain you see is the noise against that stretch, which falls with the square root of
 * the stack. Short subs are read-noise limited, long ones sky limited.
 */
export function frameNoise(exposureS: number, gain: number, skyEPerS: number, subs: number): FrameNoise {
  const sky = skyEPerS * exposureS;
  const read = readNoiseE(gain);
  const subE = Math.sqrt(read * read + sky + 0.02 * exposureS);
  const skySnr = sky / subE;
  // The stretch maps about six sigma of a single sub's noise to the display's darks.
  const display = Math.min(0.6, 0.28 / Math.sqrt(Math.max(1, subs))) * (0.6 + 0.4 * Math.min(1, read / 4));
  return { subE, skySnr, display };
}

/**
 * The faintest star one sub records at this plate scale, before stacking.
 *
 * A 1 s sub on 200 mm reaches about 14.5 at a dark site; stacking buys 1.25 magnitudes
 * per tenfold; the city sky and a short exposure take it back. Clamped to what the
 * 8SE can reach at all.
 */
export function limitingMagnitude(exposureS: number, gain: number, subs: number, bortle: number): number {
  const base = 14.5 + 2.5 * Math.log10(Math.max(1e-4, exposureS));
  const stacked = base + 1.25 * Math.log10(Math.max(1, subs));
  const skyPenalty = (bortle - 3) * 0.3;
  const gainHelp = gain >= GAIN.hcg ? 0.4 : (gain / GAIN.hcg) * 0.4;
  return Math.min(17, Math.max(2, stacked - skyPenalty + gainHelp));
}

/**
 * Whether a body of this surface brightness burns out at this exposure and gain, and
 * by how much: 1 is the first clipped pixel, 10 is a white blob with a bloom.
 *
 * `saturateS` is the exposure at which the body's brightest pixel fills the well at
 * gain 0; the well shrinks with gain.
 */
export function burnOut(saturateS: number, exposureS: number, gain: number): number {
  const well = fullWellE(gain) / ASI585MC.fullWellE;
  return exposureS / (saturateS * well);
}

/** Frames per second the sensor delivers at this region and exposure. */
export function frameRate(roi: RoiPreset, exposureS: number): number {
  const readout = (ASI585MC.widthPx * ASI585MC.heightPx) / (roi.widthPx * roi.heightPx);
  return Math.min(1 / Math.max(exposureS, 1e-4), ASI585MC.maxFps * Math.min(12, readout));
}
