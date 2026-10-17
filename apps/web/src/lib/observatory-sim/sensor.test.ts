import { describe, expect, it } from 'vitest';
import { skyElectronsPerSecond } from './camera';
import { ADU_MAX, faintestStar, hotPixelLevel, hotPixels, sensorLevels, starPeakLin, stretch } from './sensor';

const sky = skyElectronsPerSecond(8, 0.294, 203.2);
const levels = (exposureS: number, gain: number, subs = 1) => sensorLevels({ exposureS, gain, subs, skyEPerS: sky });
const peak0 = (exposureS: number, gain: number) => starPeakLin(0, 2.6, 0.294, 203.2, exposureS, gain);

describe('the sensor', () => {
  it('converts at 12 bits and stretches the darks', () => {
    expect(ADU_MAX).toBe(4095);
    expect(stretch(0)).toBe(0);
    expect(stretch(1)).toBeCloseTo(1, 6);
    expect(stretch(0.01)).toBeGreaterThan(0.1);
  });

  it('more gain and a longer sub brighten the sky and the stars', () => {
    expect(levels(8, 450).sky).toBeGreaterThan(levels(8, 300).sky);
    expect(levels(30, 300).sky).toBeGreaterThan(levels(8, 300).sky);
    expect(peak0(8, 450)).toBeGreaterThan(peak0(8, 300));
    expect(levels(8, 300).sky).toBeLessThan(0.25);
  });

  it('a stack is cleaner than a sub by the square root of its frames, and reaches fainter', () => {
    expect(levels(8, 300, 16).noise).toBeCloseTo(levels(8, 300, 1).noise / 4, 6);
    expect(faintestStar(levels(8, 300, 16), peak0(8, 300))).toBeGreaterThan(faintestStar(levels(8, 300, 1), peak0(8, 300)) + 1);
  });

  it('an 8 s sub from the city reaches about 15th magnitude; a 10 ms frame only the bright stars', () => {
    const deep = faintestStar(levels(8, 300), peak0(8, 300));
    expect(deep).toBeGreaterThan(14.5);
    expect(deep).toBeLessThan(16.5);
    expect(faintestStar(levels(0.01, 250), peak0(0.01, 250))).toBeLessThan(11);
  });

  it('bright stars clip, and gain clips them sooner', () => {
    const mag = 8;
    expect(starPeakLin(mag, 2.6, 0.294, 203.2, 8, 300)).toBeGreaterThan(1);
    expect(starPeakLin(mag, 2.6, 0.294, 203.2, 0.01, 0)).toBeLessThan(1);
    expect(starPeakLin(mag, 2.6, 0.294, 203.2, 1, 400)).toBeGreaterThan(starPeakLin(mag, 2.6, 0.294, 203.2, 1, 100));
  });

  it('a lit sky clips white and shows no stars', () => {
    const day = sensorLevels({ exposureS: 8, gain: 300, subs: 1, skyEPerS: 1e6 });
    expect(day.sky).toBe(1);
    expect(day.noise).toBe(0);
    expect(faintestStar(day, peak0(8, 300))).toBe(-5);
  });

  it('has the same hot pixels every session; long subs show them, the stack rejects them', () => {
    const hot = hotPixels();
    expect(hot).toEqual(hotPixels());
    const worst = hot.reduce((a, b) => (b.ePerS > a.ePerS ? b : a));
    expect(hotPixelLevel(worst, levels(8, 300), 8, 1)).toBeGreaterThan(0.2);
    expect(hotPixelLevel(worst, levels(0.001, 300), 0.001, 1)).toBeLessThan(0.05);
    expect(hotPixelLevel(worst, levels(8, 300, 16), 8, 16)).toBeLessThan(hotPixelLevel(worst, levels(8, 300), 8, 1) / 8);
  });
});
