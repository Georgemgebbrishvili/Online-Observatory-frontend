/**
 * What this instrument actually shows (ADR-054 §1).
 *
 * These numbers are the product. A 203 mm f/10 with the IMX585 frames 18.8′ × 10.6′
 * at native focal length — the full Moon overflows it, Jupiter is 4 % of the frame
 * width, and M31 is nine fields wide. Getting that wrong turns the simulator into a
 * toy that teaches people something false about the telescope they are booking.
 */

import { Body, GeoVector, KM_PER_AU } from 'astronomy-engine';
import { NEXSTAR_8SE } from './instrument';
import type { Instrument } from './types';

const ARCSEC_PER_RAD = 206264.806;

/**
 * The platform's three optical configurations (`OpticalConfig`), at this tube's focal
 * lengths: the f/6.3 reducer, native f/10, and a 2× Barlow for the planets. A train is
 * a mission's setting, chosen when the session is booked; the console lets the model's
 * user pick one so the field is honest for each.
 */
export type OpticalTrainId = 'F6_3_REDUCER' | 'F10_NATIVE' | 'F20_BARLOW';
export type OpticalTrain = { id: OpticalTrainId; label: string; short: string; multiplier: number };

export const TRAINS: OpticalTrain[] = [
  { id: 'F6_3_REDUCER', label: 'f/6.3 reducer', short: 'f/6.3', multiplier: 0.63 },
  { id: 'F10_NATIVE', label: 'Native f/10', short: 'f/10', multiplier: 1 },
  { id: 'F20_BARLOW', label: '2× Barlow, f/20', short: 'f/20', multiplier: 2 },
];

export const TRAIN_BY_ID = new Map(TRAINS.map((t) => [t.id, t]));

export type FieldOfView = {
  widthArcmin: number;
  heightArcmin: number;
  /** Arcseconds covered by one sensor pixel. */
  plateScaleArcsecPx: number;
  /** Sensor pixels across the long axis of the region read out. */
  widthPx: number;
  heightPx: number;
};

export function effectiveFocalLength(instrument: Instrument, train: OpticalTrain): number {
  return instrument.focalLengthMm * train.multiplier;
}

export function fieldOfView(
  instrument: Instrument,
  train: OpticalTrain = TRAIN_BY_ID.get('F10_NATIVE')!,
  roi: { widthPx: number; heightPx: number } | null = null,
): FieldOfView {
  const { sensorWidthMm, sensorHeightMm, pixelSizeUm } = instrument;
  const focal = effectiveFocalLength(instrument, train);
  const sensorPxWide = Math.round((sensorWidthMm * 1000) / pixelSizeUm);
  const sensorPxHigh = Math.round((sensorHeightMm * 1000) / pixelSizeUm);
  const widthPx = Math.min(roi?.widthPx ?? sensorPxWide, sensorPxWide);
  const heightPx = Math.min(roi?.heightPx ?? sensorPxHigh, sensorPxHigh);
  const plateScaleArcsecPx = ((pixelSizeUm / 1000) / focal) * ARCSEC_PER_RAD;
  return {
    widthArcmin: (widthPx * plateScaleArcsecPx) / 60,
    heightArcmin: (heightPx * plateScaleArcsecPx) / 60,
    plateScaleArcsecPx,
    widthPx,
    heightPx,
  };
}

export function focalRatio(instrument: Instrument, train: OpticalTrain = TRAIN_BY_ID.get('F10_NATIVE')!): number {
  return effectiveFocalLength(instrument, train) / instrument.apertureMm;
}

/**
 * Typical Tbilisi seeing. Good nights reach 2″, poor ones 4″. A property of the site's
 * air, so the console and the gallery blur a frame by the same amount.
 */
export const DEFAULT_SEEING_ARCSEC = 2.6;

/** Dawes' limit for the aperture: the floor stacking approaches and never beats. */
export function resolvingPowerArcsec(instrument: Instrument): number {
  return 116 / instrument.apertureMm;
}

/** The secondary's shadow as a fraction of the aperture: the hole in a defocused star. */
export function obstructionRatio(instrument: Instrument): number {
  return instrument.optics === NEXSTAR_8SE.model ? NEXSTAR_8SE.obstructionRatio : 0.31;
}

/**
 * Vignetting at the edge of the field as a fraction of full illumination, 0–1. A
 * reducer on a 1/1.2″ sensor darkens the corners by a fifth; native and Barlow do not.
 */
export function edgeIllumination(train: OpticalTrain): number {
  return train.id === 'F6_3_REDUCER' ? 0.8 : 0.97;
}

/** Equatorial radii in kilometres, for apparent-size computation. */
const RADIUS_KM: Partial<Record<string, number>> = {
  moon: 1737.4,
  mercury: 2439.7,
  venus: 6051.8,
  mars: 3396.2,
  jupiter: 71492,
  saturn: 60268,
  uranus: 25559,
  neptune: 24764,
};

const BODY: Partial<Record<string, Body>> = {
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
};

/**
 * Apparent diameter of a solar-system body right now, in arcseconds, from its real
 * distance — so Mars is 4″ at conjunction and 25″ at a good opposition. Null for
 * anything that is not a solar-system body.
 */
export function apparentDiameterArcsec(targetId: string, date: Date): number | null {
  const body = BODY[targetId];
  const radiusKm = RADIUS_KM[targetId];
  if (!body || !radiusKm) return null;
  const vector = GeoVector(body, date, true);
  const distanceKm = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z) * KM_PER_AU;
  return 2 * Math.atan(radiusKm / distanceKm) * ARCSEC_PER_RAD;
}

/**
 * Field rotation rate for an altazimuth mount, degrees per hour: fastest near the
 * zenith and toward the meridian. The reason alt-az rigs cap their sub-exposures.
 */
export function fieldRotationDegPerHour(latDeg: number, altDeg: number, azDeg: number): number {
  const toRad = Math.PI / 180;
  const cosAlt = Math.cos(altDeg * toRad);
  if (Math.abs(cosAlt) < 1e-6) return 0;
  return (15.041 * Math.cos(latDeg * toRad) * Math.cos(azDeg * toRad)) / cosAlt;
}

/**
 * Atmospheric dispersion between the red and blue ends of the visible band, in
 * arcseconds, at this altitude: about 1″ at 45°, 2.5″ at 20°. Why a low planet wears
 * a red fringe on one limb and a blue one on the other.
 */
export function dispersionArcsec(altDeg: number): number {
  const z = (90 - Math.max(5, altDeg)) * (Math.PI / 180);
  return 1.0 * Math.tan(z);
}

/** Atmospheric extinction in magnitudes at this airmass for a city sky. */
export function extinctionMag(airmass: number): number {
  return 0.28 * (airmass - 1);
}
