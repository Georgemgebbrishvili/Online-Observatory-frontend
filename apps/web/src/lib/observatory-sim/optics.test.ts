import { describe, expect, it } from 'vitest';
import { EXPOSURES_S, GAIN, burnOut, exposureLabel, frameNoise, fullWellE, limitingMagnitude, readNoiseE } from './camera';
import { ASI585MC, NEXSTAR_8SE, TBILISI_8SE } from './instrument';
import { TRAIN_BY_ID, dispersionArcsec, fieldOfView, obstructionRatio, resolvingPowerArcsec } from './optics';

describe('the NexStar 8SE with the ASI585MC', () => {
  it('frames 18.8′ × 10.6′ at native focal length, at 0.29″ per pixel', () => {
    const fov = fieldOfView(TBILISI_8SE, TRAIN_BY_ID.get('F10_NATIVE')!);
    expect(fov.widthPx).toBe(3840);
    expect(fov.heightPx).toBe(2160);
    expect(fov.plateScaleArcsecPx).toBeCloseTo(0.294, 2);
    expect(fov.widthArcmin).toBeCloseTo(18.8, 0);
    expect(fov.heightArcmin).toBeCloseTo(10.6, 0);
  });

  it('widens with the reducer and halves with the Barlow', () => {
    const reduced = fieldOfView(TBILISI_8SE, TRAIN_BY_ID.get('F6_3_REDUCER')!);
    const barlow = fieldOfView(TBILISI_8SE, TRAIN_BY_ID.get('F20_BARLOW')!);
    expect(reduced.widthArcmin / 18.8).toBeCloseTo(1 / 0.63, 1);
    expect(barlow.widthArcmin / 18.8).toBeCloseTo(0.5, 1);
  });

  it('a read-out region crops the field without changing the scale', () => {
    const native = fieldOfView(TBILISI_8SE);
    const roi = fieldOfView(TBILISI_8SE, TRAIN_BY_ID.get('F10_NATIVE')!, { widthPx: 640, heightPx: 480 });
    expect(roi.plateScaleArcsecPx).toBe(native.plateScaleArcsecPx);
    expect(roi.widthArcmin).toBeCloseTo((640 / 3840) * native.widthArcmin, 6);
  });

  it("resolves to Dawes' limit with a 31 % obstruction, as Celestron quotes", () => {
    expect(resolvingPowerArcsec(TBILISI_8SE)).toBeCloseTo(NEXSTAR_8SE.dawesArcsec, 1);
    expect(obstructionRatio(TBILISI_8SE)).toBeCloseTo(0.315, 2);
    expect(ASI585MC.widthMm).toBeCloseTo(11.14, 2);
  });

  it('dispersion grows toward the horizon', () => {
    expect(dispersionArcsec(80)).toBeLessThan(0.3);
    expect(dispersionArcsec(20)).toBeGreaterThan(2);
  });
});

describe('the camera', () => {
  it('offers planetary milliseconds through a deep-sky minute, labelled as such', () => {
    expect(EXPOSURES_S[0]).toBe(0.0005);
    expect(EXPOSURES_S.at(-1)).toBe(60);
    expect(exposureLabel(0.0005)).toBe('0.5 ms');
    expect(exposureLabel(0.01)).toBe('10 ms');
    expect(exposureLabel(8)).toBe('8 s');
  });

  it("read noise steps down at HCG and the well shrinks with gain, on ZWO's curve", () => {
    expect(readNoiseE(0)).toBeGreaterThan(readNoiseE(GAIN.hcg - 1));
    expect(readNoiseE(GAIN.hcg)).toBeLessThan(readNoiseE(GAIN.hcg - 1));
    expect(readNoiseE(GAIN.max)).toBeCloseTo(0.7, 1);
    expect(fullWellE(0)).toBe(40_000);
    expect(fullWellE(200)).toBeCloseTo(4000, -2);
  });

  it('a stack is cleaner than a sub, and a long sub reaches fainter than a short one', () => {
    expect(frameNoise(8, 300, 3, 16).display).toBeLessThan(frameNoise(8, 300, 3, 1).display);
    expect(limitingMagnitude(8, 300, 1, 8)).toBeGreaterThan(limitingMagnitude(0.01, 300, 1, 8));
    expect(limitingMagnitude(8, 300, 100, 8)).toBeGreaterThan(limitingMagnitude(8, 300, 1, 8));
  });

  it('Jupiter burns out on a one-second sub and not on a ten-millisecond one', () => {
    expect(burnOut(0.03, 1, 250)).toBeGreaterThan(6);
    expect(burnOut(0.03, 0.01, 250)).toBeLessThan(6);
  });
});
