import { describe, expect, it } from 'vitest';
import { SCENE_GOAL, amplification, classify, contrast, exposureError, findStars, fitParabola, fitV, frameStats, nextSetting, type Lum } from './metering';

/** A dark frame with Gaussian stars of this sigma. */
function starfield(sigma: number, w = 96, h = 96): Lum {
  const data = new Float32Array(w * h).fill(0.05);
  for (const [cx, cy] of [[20, 20], [60, 30], [40, 70], [75, 75]]) {
    for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
      data[y * w + x] += 0.8 * (1.2 / sigma) ** 2 * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma * sigma));
    }
  }
  return { data, width: w, height: h };
}

describe('metering', () => {
  it('finds the stars and their half-flux radius grows with defocus', () => {
    const sharp = starfield(1.2);
    const soft = starfield(3);
    const a = findStars(sharp, frameStats(sharp));
    const b = findStars(soft, frameStats(soft));
    expect(a).toHaveLength(4);
    const mean = (s: typeof a) => s.reduce((t, x) => t + x.hfr, 0) / s.length;
    expect(mean(b)).toBeGreaterThan(mean(a) * 1.5);
  });

  it('reads a sharper frame as more contrast', () => {
    expect(contrast(starfield(1.2))).toBeGreaterThan(contrast(starfield(3)) * 1.5);
  });

  it('fits a V-curve and a parabola to their true best focus', () => {
    const xs = [-400, -300, -200, -100, 0, 100, 200, 300, 400].map((x) => x + 1000);
    const v = fitV(xs, xs.map((x) => 1.5 + Math.abs(x - 1060) * 0.01));
    expect(v!.best).toBeCloseTo(1060, 0);
    expect(v!.r2).toBeGreaterThan(0.99);
    const p = fitParabola(xs, xs.map((x) => 50 - ((x - 940) / 100) ** 2));
    expect(p!.best).toBeCloseTo(940, 0);
  });

  it('calls a bright sky daylight, a bright disc the Moon and points stars', () => {
    const day = { data: new Float32Array(400).fill(0.6), width: 20, height: 20 };
    expect(classify(frameStats(day), { sunAltitudeDeg: 30, kind: 'planet', stars: 0 })).toBe('daylight');
    const sf = starfield(1.2);
    expect(classify(frameStats(sf), { sunAltitudeDeg: -30, kind: null, stars: 4 })).toBe('star');
    expect(classify(frameStats(sf), { sunAltitudeDeg: -30, kind: 'galaxy', stars: 4 })).toBe('deepsky');
  });

  it('turns a too-bright daylight frame down and keeps within the scene', () => {
    const day = { data: new Float32Array(400).fill(0.99), width: 20, height: 20 };
    const s = frameStats(day);
    const err = exposureError(s, 'daylight');
    expect(err).toBeGreaterThan(0.3);
    const next = nextSetting('daylight', err, { exposureS: 0.01, gain: 0 });
    expect(amplification(next.exposureS, next.gain)).toBeLessThan(amplification(0.01, 0));
    expect(next.exposureS).toBeGreaterThanOrEqual(SCENE_GOAL.daylight.exp[0]);
    // A dark deep-sky frame goes up to seconds before it adds gain.
    const deep = nextSetting('deepsky', -1.5, { exposureS: 1, gain: 300 });
    expect(deep.exposureS).toBeGreaterThan(1);
  });
});
