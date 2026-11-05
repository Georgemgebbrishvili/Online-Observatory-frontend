'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  classify,
  contrast,
  exposureError,
  findStars,
  fitParabola,
  fitV,
  frameStats,
  measureOf,
  median,
  nextSetting,
  type Fit,
  type Lum,
  type Scene,
} from '@/lib/observatory-sim/metering';

const scratch: { canvas: HTMLCanvasElement | null } = { canvas: null };

/**
 * The feed's luminance, 0–1: the whole frame shrunk to 320 wide for metering, or a
 * square from its centre at full resolution for focus.
 */
export function grabLum(view: HTMLElement | null, crop?: number): Lum | null {
  const src = view?.querySelector('canvas');
  if (!src || src.width < 16 || src.height < 16) return null;
  scratch.canvas ??= document.createElement('canvas');
  const c = scratch.canvas;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  let w: number;
  let h: number;
  if (crop) {
    const size = Math.min(crop, src.width, src.height);
    w = h = size;
    c.width = w;
    c.height = h;
    ctx.drawImage(src, (src.width - size) / 2, (src.height - size) / 2, size, size, 0, 0, size, size);
  } else {
    w = 320;
    h = Math.max(16, Math.round((320 * src.height) / src.width));
    c.width = w;
    c.height = h;
    ctx.drawImage(src, 0, 0, w, h);
  }
  const { data } = ctx.getImageData(0, 0, w, h);
  const out = new Float32Array(w * h);
  for (let i = 0, j = 0; j < out.length; i += 4, j += 1) out[j] = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  return { data: out, width: w, height: h };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* --- auto exposure ------------------------------------------------------- */

export type AeMode = Scene | 'auto';
export type AeState = {
  running: boolean;
  status: 'idle' | 'metering' | 'locked' | 'limit' | 'failed';
  mode: AeMode;
  scene: Scene | null;
  pass: number;
  /** The scene's measure and the share of blown pixels on the last frame read. */
  level: number | null;
  clipped: number | null;
};

type AeDeps = {
  view: () => HTMLElement | null;
  read: () => { exposureS: number; gain: number };
  apply: (exposureS: number, gain: number) => void;
  hint: () => { sunAltitudeDeg: number; kind: string | null };
  /** False while the mount slews, a stack runs or focus moves: the picture is not the scene. */
  allowed: () => boolean;
};

/** How long a new setting takes to show: one full sub, and a frame for the view to draw it. */
const settleMs = (exposureS: number) => Math.max(exposureS, 1 / 30) * 1000 + (exposureS >= 0.5 ? 450 : 180);

export function useAutoExposure(deps: AeDeps) {
  const d = useRef(deps);
  d.current = deps;
  const token = useRef(0);
  const [state, setState] = useState<AeState>({ running: false, status: 'idle', mode: 'auto', scene: null, pass: 0, level: null, clipped: null });
  const [keep, setKeep] = useState(false);
  const modeRef = useRef<AeMode>('auto');

  const meter = useCallback((mode: AeMode) => {
    const img = grabLum(d.current.view());
    if (!img) return null;
    const s = frameStats(img);
    const stars = findStars(img, s, 12).length;
    const h = d.current.hint();
    const scene = mode === 'auto' ? classify(s, { ...h, stars }) : mode;
    return { s, scene, err: exposureError(s, scene) };
  }, []);

  const run = useCallback(async (mode: AeMode = modeRef.current) => {
    const my = ++token.current;
    modeRef.current = mode;
    setState((st) => ({ ...st, running: true, status: 'metering', mode, pass: 0 }));
    for (let pass = 1; pass <= 10; pass += 1) {
      await sleep(settleMs(d.current.read().exposureS));
      if (token.current !== my) return;
      const m = meter(mode);
      if (!m) {
        setState((st) => ({ ...st, running: false, status: 'failed' }));
        return;
      }
      const level = measureOf(m.s, m.scene);
      setState((st) => ({ ...st, scene: m.scene, pass, level, clipped: m.s.clipped }));
      if (Math.abs(m.err) < 0.12) {
        setState((st) => ({ ...st, running: false, status: 'locked' }));
        return;
      }
      const now = d.current.read();
      const next = nextSetting(m.scene, m.err, now);
      if (next.exposureS === now.exposureS && next.gain === now.gain) {
        setState((st) => ({ ...st, running: false, status: 'limit' }));
        return;
      }
      d.current.apply(next.exposureS, next.gain);
    }
    if (token.current === my) setState((st) => ({ ...st, running: false, status: 'limit' }));
  }, [meter]);

  const stop = useCallback(() => {
    token.current += 1;
    setState((st) => ({ ...st, running: false, status: st.status === 'metering' ? 'idle' : st.status }));
  }, []);

  // Keep adjusting: a look every few seconds; a scene that has drifted twice in a row is metered again.
  useEffect(() => {
    if (!keep) return;
    let off = 0;
    const id = setInterval(() => {
      if (state.running || !d.current.allowed()) return;
      const m = meter(modeRef.current);
      off = m && Math.abs(m.err) > 0.3 ? off + 1 : 0;
      if (off >= 2) {
        off = 0;
        void run();
      }
    }, 2500);
    return () => clearInterval(id);
  }, [keep, state.running, meter, run]);

  return { state, run, stop, keep, setKeep };
}

/* --- autofocus ------------------------------------------------------------ */

export type AfMethod = 'auto' | 'hfr' | 'contrast';
export type AfPoint = { x: number; y: number; pass: 1 | 2 };
export type AfState = {
  running: boolean;
  status: 'idle' | 'coarse' | 'fine' | 'done' | 'failed';
  method: AfMethod;
  /** The method the run settled on for this scene. */
  used: 'hfr' | 'contrast' | null;
  points: AfPoint[];
  fit: { best: number; r2: number; line: Array<[number, number]> } | null;
  /** Where the run left the focuser: the fit's vertex, or the best sample without one. */
  best: number | null;
  before: number | null;
  after: number | null;
  message: string | null;
};

type AfDeps = {
  view: () => HTMLElement | null;
  position: () => number;
  moveTo: (pos: number) => Promise<void>;
  exposureS: () => number;
  /** The coarse step, in focuser steps: wider for a faster beam's shallower depth of focus. */
  step: () => number;
};

const CROP = 256;

type Raw = { x: number; hfr: number; con: number; pass: 1 | 2 };

export function useAutofocus(deps: AfDeps) {
  const d = useRef(deps);
  d.current = deps;
  const token = useRef(0);
  const [state, setState] = useState<AfState>({ running: false, status: 'idle', method: 'auto', used: null, points: [], fit: null, best: null, before: null, after: null, message: null });

  /** Both measures at the current position: the stars' half-flux radius where stars show, the contrast always. */
  const sample = useCallback(async (): Promise<{ hfr: number; con: number }> => {
    const hfrs: number[] = [];
    const cons: number[] = [];
    // Two reads at video rate average the air's boil; a long sub has already averaged it.
    const reads = d.current.exposureS() >= 0.3 ? 1 : 2;
    for (let i = 0; i < reads; i += 1) {
      await sleep(settleMs(d.current.exposureS()));
      const img = grabLum(d.current.view(), CROP);
      if (!img) continue;
      cons.push(contrast(img));
      const stars = findStars(img, frameStats(img), 15);
      if (stars.length >= 1) hfrs.push(median(stars.map((s) => s.hfr)));
    }
    return { hfr: hfrs.length ? median(hfrs) : NaN, con: cons.length ? median(cons) : NaN };
  }, []);

  const run = useCallback(async (method: AfMethod = 'auto') => {
    const my = ++token.current;
    const alive = () => token.current === my;
    setState((s) => ({ ...s, running: true, status: 'coarse', method, used: method === 'auto' ? null : method, points: [], fit: null, best: null, before: null, after: null, message: null }));
    const raw: Raw[] = [];
    // The measure: stars by their half-flux radius wherever the sweep finds them at most
    // positions, anything else by contrast. Auto decides after the first sweep, when the
    // sharp positions have shown whether there are stars to measure.
    let used: 'hfr' | 'contrast' = method === 'auto' ? 'contrast' : method;
    const y = (r: Raw) => (used === 'hfr' ? r.hfr : r.con);
    const publish = () => setState((s) => ({ ...s, used, points: raw.filter((r) => Number.isFinite(y(r))).map((r) => ({ x: r.x, y: y(r), pass: r.pass })) }));
    const decide = () => {
      if (method !== 'auto') return;
      const withStars = raw.filter((r) => Number.isFinite(r.hfr)).length;
      used = withStars >= Math.max(5, Math.ceil(raw.length * 0.6)) ? 'hfr' : 'contrast';
    };

    const first = await sample();
    if (!alive()) return;

    const sweep = async (centre: number, step: number, count: number, pass: 1 | 2) => {
      const half = Math.floor(count / 2);
      // Every sample is approached from below, so the gear's backlash is always taken up the same way.
      await d.current.moveTo(Math.round(centre - (half + 1) * step));
      for (let k = -half; k <= half; k += 1) {
        if (!alive()) return;
        const x = Math.round(centre + k * step);
        await d.current.moveTo(x);
        const m = await sample();
        if (!alive()) return;
        raw.push({ x, hfr: m.hfr, con: m.con, pass });
        publish();
      }
    };
    const fitOf = (pass: 1 | 2 | 0): Fit | null => {
      const pts = raw.filter((r) => (pass === 0 || r.pass === pass) && Number.isFinite(y(r)));
      if (pts.length < 4) return null;
      if (used === 'hfr') return fitV(pts.map((r) => r.x), pts.map(y));
      // Contrast peaks: the parabola through the top of the curve.
      const top = [...pts].sort((a, b) => y(b) - y(a)).slice(0, 5);
      return fitParabola(top.map((r) => r.x), top.map(y));
    };
    const bestSample = (pass: 1 | 2) => {
      const pts = raw.filter((r) => r.pass === pass && Number.isFinite(y(r)));
      return pts.reduce<Raw | null>((a, b) => (a === null || (used === 'hfr' ? y(b) < y(a) : y(b) > y(a)) ? b : a), null);
    };
    const fail = (message: string) => setState((s) => ({ ...s, running: false, status: 'failed', message }));

    const start = d.current.position();
    const step = d.current.step();
    await sweep(start, step, 9, 1);
    if (!alive()) return;
    decide();
    publish();
    let coarse = fitOf(1);
    const xs = raw.map((r) => r.x);
    // A best focus outside the sweep: go again around the best sample.
    if (!coarse || coarse.best < Math.min(...xs) || coarse.best > Math.max(...xs)) {
      const edge = bestSample(1);
      if (!edge) return fail('no measure');
      await sweep(edge.x, step, 9, 1);
      if (!alive()) return;
      decide();
      publish();
      coarse = fitOf(1);
    }
    const centre = coarse ? coarse.best : bestSample(1)?.x ?? start;
    setState((s) => ({ ...s, status: 'fine', before: Number.isFinite(y({ x: 0, pass: 1, ...first })) ? y({ x: 0, pass: 1, ...first }) : null }));
    const fine = Math.max(4, Math.round(step / 3));
    await sweep(centre, fine, 7, 2);
    if (!alive()) return;
    const fit = fitOf(2) ?? coarse;
    const best = Math.round(fit ? fit.best : bestSample(2)?.x ?? centre);
    await d.current.moveTo(best - 2 * fine);
    await d.current.moveTo(best);
    const last = await sample();
    if (!alive()) return;
    const after = y({ x: best, pass: 2, ...last });
    const lo = Math.min(...raw.map((r) => r.x));
    const hi = Math.max(...raw.map((r) => r.x));
    const line: Array<[number, number]> = fit ? Array.from({ length: 41 }, (_, i) => { const x = lo + ((hi - lo) * i) / 40; return [x, fit.curve(x)]; }) : [];
    setState((s) => ({ ...s, running: false, status: 'done', used, fit: fit ? { best, r2: fit.r2, line } : null, best, after: Number.isFinite(after) ? after : null }));
  }, [sample]);

  const stop = useCallback(() => {
    token.current += 1;
    setState((s) => ({ ...s, running: false, status: s.running ? 'idle' : s.status }));
  }, []);

  return { state, run, stop };
}
