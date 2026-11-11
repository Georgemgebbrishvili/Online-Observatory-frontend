/**
 * What auto exposure and autofocus read off the picture (ADR-083): the frame's levels,
 * its stars and their half-flux radius, its sharpness, the kind of scene it is, and
 * the exposure and gain that bring that scene to its goal. Pure functions of a
 * luminance image, 0–1, so they run on the sky model's canvas and on a real frame alike.
 */

export type Lum = { data: Float32Array; width: number; height: number };

export type FrameStats = {
  mean: number;
  median: number;
  p99: number;
  p999: number;
  max: number;
  /** Share of pixels at the top of the range: blown out. */
  clipped: number;
  /** Share of pixels well above the background: how much of the frame is object. */
  bright: number;
  /** The background's scatter, from the median absolute deviation. */
  sigma: number;
};

const CLIP = 0.98;

export function frameStats(img: Lum): FrameStats {
  const n = img.data.length;
  const sorted = Float32Array.from(img.data).sort();
  const at = (q: number) => sorted[Math.min(n - 1, Math.floor(q * (n - 1)))];
  const median = at(0.5);
  let sum = 0;
  let clipped = 0;
  const dev = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const v = img.data[i];
    sum += v;
    if (v >= CLIP) clipped += 1;
    dev[i] = Math.abs(v - median);
  }
  dev.sort();
  const sigma = Math.max(1e-3, 1.4826 * dev[Math.floor(n / 2)]);
  const cut = median + Math.max(0.15, 8 * sigma);
  let bright = 0;
  for (let i = 0; i < n; i += 1) if (img.data[i] > cut) bright += 1;
  return { mean: sum / n, median, p99: at(0.99), p999: at(0.999), max: sorted[n - 1], clipped: clipped / n, bright: bright / n, sigma };
}

export type Star = { x: number; y: number; peak: number; hfr: number };

/**
 * Stars: local maxima well above the background, each measured by its half-flux radius
 * inside a window `r` pixels out. Only the brightest are measured, one per patch of sky, and
 * a patch still bright at the window's edge is no star: a planet's disc, a galaxy's core, or
 * a star thrown so far out of focus that its ring has left the window. Metering only counts
 * points of light to name the scene, and passes `compact` false: a star out of focus is
 * still a star to it.
 */
export function findStars(img: Lum, stats: FrameStats, max = 40, r = 7, compact = true): Star[] {
  const { data, width: w, height: h } = img;
  const floor = stats.median + Math.max(0.06, 6 * stats.sigma);
  const peaks: Array<{ x: number; y: number; v: number }> = [];
  for (let y = r; y < h - r; y += 1) {
    for (let x = r; x < w - r; x += 1) {
      const v = data[y * w + x];
      if (v < floor) continue;
      let top = true;
      for (let dy = -2; dy <= 2 && top; dy += 1) for (let dx = -2; dx <= 2; dx += 1) if ((dx || dy) && data[(y + dy) * w + x + dx] > v) { top = false; break; }
      if (top) peaks.push({ x, y, v });
    }
  }
  peaks.sort((a, b) => b.v - a.v);
  const found: Star[] = [];
  const taken: Array<{ x: number; y: number }> = [];
  for (const { x, y, v } of peaks) {
    if (found.length >= max || taken.length >= max * 4) break;
    if (taken.some((t) => Math.abs(t.x - x) <= r && Math.abs(t.y - y) <= r)) continue;
    taken.push({ x, y });
    // The window's rim, against the peak: a star's light has died away by there.
    let rim = 0;
    let rimN = 0;
    for (let d = -r; d <= r; d += 1) {
      rim += data[(y - r) * w + x + d] + data[(y + r) * w + x + d] + data[(y + d) * w + x - r] + data[(y + d) * w + x + r];
      rimN += 4;
    }
    if (compact && rim / rimN - stats.median > 0.3 * (v - stats.median)) continue;
    // Half-flux radius: the flux-weighted mean distance from the centroid. Only light
    // clear of the background's noise counts; noise alone, spread evenly over the window,
    // would read as a wide star whatever the focus.
    const cut = stats.median + 3 * stats.sigma;
    const light = (v2: number) => (v2 > cut ? v2 - stats.median : 0);
    let flux = 0;
    let mx = 0;
    let my = 0;
    for (let dy = -r; dy <= r; dy += 1) for (let dx = -r; dx <= r; dx += 1) {
      const f = light(data[(y + dy) * w + x + dx]);
      flux += f;
      mx += f * dx;
      my += f * dy;
    }
    if (flux <= 0) continue;
    mx /= flux;
    my /= flux;
    let rad = 0;
    for (let dy = -r; dy <= r; dy += 1) for (let dx = -r; dx <= r; dx += 1) {
      const f = light(data[(y + dy) * w + x + dx]);
      rad += f * Math.hypot(dx - mx, dy - my);
    }
    found.push({ x: x + mx, y: y + my, peak: v, hfr: rad / flux });
  }
  return found;
}

export const median = (xs: number[]) => {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Sharpness of an extended object or a daylight scene: gradient energy over the mean level (Tenengrad). */
export function contrast(img: Lum): number {
  const { data, width: w, height: h } = img;
  let energy = 0;
  let level = 0;
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      const gx = data[i + 1] - data[i - 1];
      const gy = data[i + w] - data[i - w];
      energy += gx * gx + gy * gy;
      level += data[i];
    }
  }
  return level > 0 ? (energy / level) * 100 : 0;
}

export type Fit = { best: number; r2: number; curve: (x: number) => number };

/** Least squares a·x² + b·x + c: the vertex is the best focus of a contrast curve. */
export function fitParabola(xs: number[], ys: number[]): Fit | null {
  const n = xs.length;
  if (n < 3) return null;
  const x0 = xs.reduce((a, b) => a + b, 0) / n;
  const u = xs.map((x) => x - x0);
  let s1 = 0, s2 = 0, s3 = 0, s4 = 0, t0 = 0, t1 = 0, t2 = 0;
  for (let i = 0; i < n; i += 1) {
    const a = u[i];
    s1 += a; s2 += a * a; s3 += a ** 3; s4 += a ** 4;
    t0 += ys[i]; t1 += a * ys[i]; t2 += a * a * ys[i];
  }
  const m = [[s4, s3, s2], [s3, s2, s1], [s2, s1, n]];
  const v = [t2, t1, t0];
  const sol = solve3(m, v);
  if (!sol) return null;
  const [a, b, c] = sol;
  if (Math.abs(a) < 1e-12) return null;
  const curve = (x: number) => a * (x - x0) ** 2 + b * (x - x0) + c;
  return { best: x0 - b / (2 * a), r2: rSquared(xs, ys, curve), curve };
}

/** Two straight lines, one per side of the minimum: the best focus of an HFR V-curve is where they cross. */
export function fitV(xs: number[], ys: number[]): Fit | null {
  if (xs.length < 5) return null;
  const order = xs.map((x, i) => [x, ys[i]] as const).sort((a, b) => a[0] - b[0]);
  // Every split into a falling and a rising side; the one the two lines fit best wins.
  let found: { best: number; sse: number; curve: (x: number) => number } | null = null;
  for (let k = 2; k <= order.length - 2; k += 1) {
    const l = line(order.slice(0, k));
    const r = line(order.slice(k));
    if (!l || !r || l.m >= 0 || r.m <= 0) continue;
    const curve = (x: number) => Math.max(l.m * x + l.c, r.m * x + r.c);
    const sse = order.reduce((t, [x, y]) => t + (y - curve(x)) ** 2, 0);
    if (!found || sse < found.sse) found = { best: (r.c - l.c) / (l.m - r.m), sse, curve };
  }
  if (!found) return null;
  return { best: found.best, r2: rSquared(xs, ys, found.curve), curve: found.curve };
}

function line(pts: ReadonlyArray<readonly [number, number]>) {
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p[0], 0) / n;
  const my = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  if (sxx === 0) return null;
  const m = sxy / sxx;
  return { m, c: my - m * mx };
}

function rSquared(xs: number[], ys: number[], f: (x: number) => number) {
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let res = 0;
  let tot = 0;
  for (let i = 0; i < xs.length; i += 1) {
    res += (ys[i] - f(xs[i])) ** 2;
    tot += (ys[i] - my) ** 2;
  }
  return tot === 0 ? 1 : 1 - res / tot;
}

function solve3(m: number[][], v: number[]): [number, number, number] | null {
  const det = (a: number[][]) => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  const d = det(m);
  if (Math.abs(d) < 1e-18) return null;
  const col = (k: number) => m.map((row, i) => row.map((x, j) => (j === k ? v[i] : x)));
  return [det(col(0)) / d, det(col(1)) / d, det(col(2)) / d];
}

/* --- auto exposure ------------------------------------------------------- */

export type Scene = 'daylight' | 'moon' | 'planet' | 'star' | 'deepsky' | 'dark';
export const SCENES: readonly Scene[] = ['daylight', 'moon', 'planet', 'star', 'deepsky', 'dark'];

/** What each scene asks of the frame, and the exposure and gain it may use to get there. */
export const SCENE_GOAL: Record<Scene, { measure: 'median' | 'p999' | 'max'; goal: number; clipMax: number; exp: [number, number]; gain: [number, number]; preferGain: number }> = {
  // A blue sky mid-grey, the Moon or a planet in it unclipped.
  daylight: { measure: 'median', goal: 0.42, clipMax: 0.004, exp: [0.00005, 0.05], gain: [0, 200], preferGain: 0 },
  // The lit limb just short of white.
  moon: { measure: 'p999', goal: 0.86, clipMax: 0.0008, exp: [0.0002, 0.05], gain: [0, 300], preferGain: 50 },
  // Lucky imaging: short enough to freeze the air, the disc's peak at 80 %.
  planet: { measure: 'max', goal: 0.8, clipMax: 0.0002, exp: [0.0005, 0.015], gain: [100, 480], preferGain: 250 },
  // A double or a bright star: cores just below clipping, colour kept.
  star: { measure: 'max', goal: 0.6, clipMax: 0.0004, exp: [0.001, 0.5], gain: [0, 400], preferGain: 200 },
  // Faint fuzz: the background lifted off black so the object shows, seconds of exposure.
  deepsky: { measure: 'median', goal: 0.12, clipMax: 0.01, exp: [0.5, 8], gain: [200, 450], preferGain: 300 },
  // Nothing recognised: a quick, bright finder view.
  dark: { measure: 'median', goal: 0.22, clipMax: 0.02, exp: [0.02, 0.5], gain: [200, 570], preferGain: 400 },
};

/**
 * The scene, from the picture first: a bright sky is daylight whatever the target; a big
 * bright area on dark is the Moon, a small one a planet, points are stars. The target the
 * user chose only settles what the picture leaves open.
 */
export function classify(s: FrameStats, hint: { sunAltitudeDeg: number; kind: string | null; stars: number }): Scene {
  if (hint.sunAltitudeDeg > -4 && s.median > 0.18) return 'daylight';
  if (hint.sunAltitudeDeg > 0) return 'daylight';
  if (hint.kind === 'moon' || s.bright > 0.08) return 'moon';
  if (hint.kind === 'planet' || (s.bright > 0.0015 && s.bright < 0.08 && hint.stars < 4)) return 'planet';
  if (hint.kind === 'star') return 'star';
  if (hint.kind === 'galaxy' || hint.kind === 'nebula' || hint.kind === 'cluster') return 'deepsky';
  if (hint.stars >= 4) return 'star';
  return 'dark';
}

export const measureOf = (s: FrameStats, scene: Scene) => {
  const m = SCENE_GOAL[scene].measure;
  return m === 'median' ? s.median : m === 'p999' ? s.p999 : s.max;
};

/** How far off the goal, as a log ratio: 0 on target, positive too bright. */
export function exposureError(s: FrameStats, scene: Scene): number {
  const g = SCENE_GOAL[scene];
  const m = Math.max(0.004, measureOf(s, scene));
  const err = Math.log(m / g.goal);
  // Blown-out pixels count as too bright however the measure reads.
  return s.clipped > g.clipMax ? Math.max(err, 0.35 + Math.min(1.5, Math.log10(s.clipped / g.clipMax))) : err;
}

/** Signal per unit of exposure-gain: the sensor's response, 10 dB per 200 gain steps. */
export const amplification = (exposureS: number, gain: number) => exposureS * 10 ** (gain / 200);

/**
 * The next exposure and gain: the display is roughly the square root of the signal, so
 * the signal must move by the square of the brightness ratio. Exposure first, within
 * the scene's range; gain only for what exposure cannot reach.
 */
export function nextSetting(scene: Scene, err: number, now: { exposureS: number; gain: number }): { exposureS: number; gain: number; atLimit: boolean } {
  const g = SCENE_GOAL[scene];
  const factor = Math.min(16, Math.max(1 / 16, Math.exp(-2 * err)));
  const want = amplification(now.exposureS, now.gain) * factor;
  const preferred = 10 ** (g.preferGain / 200);
  let exposureS = clamp(want / preferred, g.exp[0], g.exp[1]);
  let gain = clamp(200 * Math.log10(want / exposureS), g.gain[0], g.gain[1]);
  gain = Math.round(gain / 10) * 10;
  exposureS = clamp(want / 10 ** (gain / 200), g.exp[0], g.exp[1]);
  exposureS = Number(exposureS.toPrecision(2));
  const atLimit = Math.abs(Math.log(amplification(exposureS, gain) / want)) > 0.2;
  return { exposureS, gain, atLimit };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
