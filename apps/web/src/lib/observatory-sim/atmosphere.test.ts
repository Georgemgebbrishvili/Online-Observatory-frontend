import { describe, expect, it } from 'vitest';
import {
  cloudOpacity,
  dewOnOptics,
  humidityAt,
  scintillation,
  seeingAt,
  seeingAtAltitude,
  skySurfaceBrightness,
  tipTiltArcsec,
  twilightMag,
  valueNoise,
} from './atmosphere';

const dark = { bortle: 8, sunAltitudeDeg: -30, moon: null, altitudeDeg: 60, cloud: 0 };

describe('the sky’s glow', () => {
  it('is the city’s at night, brighter toward the horizon and under cloud', () => {
    expect(skySurfaceBrightness(dark)).toBeCloseTo(18.0 - 0.6 * (1 - Math.sin(Math.PI / 3)), 2);
    expect(skySurfaceBrightness({ ...dark, altitudeDeg: 20 })).toBeLessThan(skySurfaceBrightness(dark));
    expect(skySurfaceBrightness({ ...dark, cloud: 0.8 })).toBeLessThan(skySurfaceBrightness(dark) - 1);
    expect(skySurfaceBrightness({ ...dark, bortle: 3 })).toBeGreaterThan(skySurfaceBrightness(dark) + 1.5);
  });

  it('brightens with the Moon, more near it and more when it is full', () => {
    const moon = (separationDeg: number, fraction: number) =>
      skySurfaceBrightness({ ...dark, moon: { altitudeDeg: 50, separationDeg, fraction } });
    expect(moon(90, 1)).toBeLessThan(skySurfaceBrightness(dark));
    expect(moon(10, 1)).toBeLessThan(moon(90, 1));
    expect(moon(30, 0.2)).toBeGreaterThan(moon(30, 1));
    expect(skySurfaceBrightness({ ...dark, moon: { altitudeDeg: -5, separationDeg: 10, fraction: 1 } })).toBe(skySurfaceBrightness(dark));
  });

  it('runs through twilight from sunset to astronomical dark', () => {
    expect(twilightMag(0)).toBeCloseTo(10.5, 6);
    expect(twilightMag(-6)).toBeLessThan(twilightMag(-12));
    expect(skySurfaceBrightness({ ...dark, sunAltitudeDeg: -8 })).toBeLessThan(16);
    expect(skySurfaceBrightness({ ...dark, sunAltitudeDeg: -17.9 })).toBeCloseTo(skySurfaceBrightness(dark), 0);
  });
});

describe('seeing', () => {
  it('wanders about the site’s figure, the same at the same instant', () => {
    const values = Array.from({ length: 200 }, (_, n) => seeingAt(2.6, n * 15_000));
    expect(Math.min(...values)).toBeGreaterThan(2.6 * 0.7);
    expect(Math.max(...values)).toBeLessThan(2.6 * 1.3);
    expect(Math.max(...values) - Math.min(...values)).toBeGreaterThan(0.3);
    expect(seeingAt(2.6, 123_456)).toBe(seeingAt(2.6, 123_456));
  });

  it('worsens low down, and short frames shake and twinkle more than long ones', () => {
    expect(seeingAtAltitude(2.6, 90)).toBeCloseTo(2.6, 2);
    expect(seeingAtAltitude(2.6, 25)).toBeGreaterThan(3.5);
    const rms = (exposure: number) => {
      let sum = 0;
      for (let f = 0; f < 400; f++) {
        const t = tipTiltArcsec(2.6, exposure, f);
        sum += t.x * t.x + t.y * t.y;
      }
      return Math.sqrt(sum / 400);
    };
    expect(rms(0.005)).toBeGreaterThan(0.5);
    expect(rms(8)).toBeLessThan(rms(0.005) / 10);
    expect(scintillation(25, 0.01, 203)).toBeGreaterThan(scintillation(80, 0.01, 203));
    expect(scintillation(60, 8, 203)).toBeLessThan(scintillation(60, 0.01, 203) / 10);
  });
});

describe('cloud', () => {
  it('is absent on a clear forecast and covers about the forecast fraction otherwise', () => {
    const covered = (cover: number) => {
      let n = 0;
      let total = 0;
      for (let az = 0; az < 360; az += 7) {
        for (let alt = 25; alt < 85; alt += 6) {
          total++;
          if (cloudOpacity({ altitude: alt, azimuth: az }, 0, cover) > 0.25) n++;
        }
      }
      return n / total;
    };
    expect(covered(0)).toBe(0);
    expect(covered(0.2)).toBeLessThan(covered(0.6));
    expect(covered(0.95)).toBeGreaterThan(0.8);
  });

  it('drifts: a field goes from clear to clouded and back as the wind carries it', () => {
    const p = { altitude: 55, azimuth: 140 };
    const series = Array.from({ length: 240 }, (_, s) => cloudOpacity(p, s * 1000, 0.5));
    expect(Math.min(...series)).toBeLessThan(0.1);
    expect(Math.max(...series)).toBeGreaterThan(0.4);
    expect(cloudOpacity(p, 61_000, 0.5)).toBe(series[61]);
  });

  it('value noise is smooth and bounded', () => {
    for (let n = 0; n < 50; n++) {
      const v = valueNoise(n * 0.37, n * 0.11, 4);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
      expect(Math.abs(valueNoise(n * 0.37 + 0.001, n * 0.11, 4) - v)).toBeLessThan(0.01);
    }
  });
});

describe('humidity and dew', () => {
  it('humidity climbs through the night and dew builds once it is high', () => {
    const dusk = Date.UTC(2026, 9, 17, 15, 0);
    const early = humidityAt(dusk + 30 * 60_000, dusk, 0);
    const late = humidityAt(dusk + 8 * 3_600_000, dusk, 0);
    expect(late).toBeGreaterThan(early + 20);
    expect(late).toBeLessThanOrEqual(99);
    expect(humidityAt(dusk + 3_600_000, dusk, 1)).toBeLessThan(humidityAt(dusk + 3_600_000, dusk, 0));
    expect(dewOnOptics(70, 60)).toBe(0);
    expect(dewOnOptics(95, 2)).toBeLessThan(dewOnOptics(95, 30));
    expect(dewOnOptics(98, 40)).toBe(1);
  });
});
