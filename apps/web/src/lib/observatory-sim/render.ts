/**
 * Drawing a frame the way the sensor would record it (ADR-054 §4).
 *
 * Everything inside the field is drawn where it really is, at its true angular size,
 * from one projection around the pointing: the anonymous star field fixed to the
 * sky, the catalogue's deep-sky objects, the planets with their phases and moons.
 * Slew by hand and the whole sky slides; track and it holds; leave tracking off and
 * it drifts. No object is pinned to the screen, because none is drawn relative to it.
 *
 * What the instrument and the air do to the light is computed, not painted: the
 * seeing's blur and tip-tilt, the twinkle, the out-of-focus donut of an obstructed
 * telescope, extinction and dispersion by altitude, each star's peak against the
 * converter's ceiling, the sky's glow, drifting cloud, dew on the corrector, the
 * ground below the horizon, and the sensor's hot pixels and grain.
 *
 * Per frame the work is bounded: stars are pre-rendered sprites drawn with one
 * `drawImage` each, the grain is a handful of seeded tiles made once, and nothing is
 * allocated per pixel.
 */

import { burnOut } from './camera';
import { hash01, hashNormal } from './atmosphere';
import { dispersionArcsec, extinctionMag } from './optics';
import type { AltAz } from './safety';
import { hotPixelLevel, hotPixels, stretch, type SensorLevels } from './sensor';
import { airmass } from './site-time';
import {
  altAzToRaDec,
  BRIGHTEST_FIELD_MAG,
  fieldStarsNear,
  northAngleDeg,
  raDecToAltAz,
  tangentOffsetDeg,
  type SkyObject,
} from './sky-field';

export type FrameInputs = {
  /** Canvas size in device-independent pixels. */
  width: number;
  height: number;
  /** Field of view across the long axis, arcminutes. */
  fovArcmin: number;
  /** Seeing FWHM in the field this frame, arcseconds: the night's figure at this altitude. */
  seeingArcsec: number;
  /** Dawes' limit for the aperture: the floor stacking approaches, never beats. */
  diffractionArcsec: number;
  /** The secondary's shadow as a fraction of the aperture, for the defocused donut. */
  obstruction: number;
  /** Focuser steps from best focus; zero is sharp. */
  defocus: number;
  /** Subframes in the stack. Noise falls as its square root. */
  subs: number;
  /** Camera gain in the maker's 0.1 dB units, 0–600. */
  gain: number;
  exposureSec: number;
  /** Illumination at the field's edge, 0–1: the train's vignetting. */
  edgeIllumination: number;
  plateScaleArcsecPx: number;
  apertureMm: number;
  /** The sensor's sky level and grain for this frame. */
  levels: SensorLevels;
  /** A magnitude-0 star's peak pixel on one sub, as a fraction of the converter's range. */
  peakAtMag0: number;
  /** The faintest star this frame shows. */
  limitMag: number;
  /** Twilight's blue in the sky, 0 dark to 1 day. */
  twilight: number;
  /**
   * Cloud in front of the field, 0–1, at the centre and at the frame's right and top
   * edges, and how far the cloud has drifted across the sensor, display pixels.
   */
  cloud: { centre: number; right: number; top: number; driftPx: { x: number; y: number } };
  /** Dew on the corrector, 0–1: it softens and haloes everything. */
  dew: number;
  /** A star's brightness rms on one frame from twinkling, as a fraction. */
  scintillation: number;
  /** The seeing's tip-tilt on this frame, display pixels. */
  tilt: { x: number; y: number };
};

export type LiveScene = {
  pointing: AltAz;
  /** How far the sky moved across the sensor during the exposure, degrees (x right, y up). */
  drift: { x: number; y: number };
  latDeg: number;
  lstHours: number;
  objects: SkyObject[];
  image: (src: string) => HTMLImageElement | null;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Gaussian sigma for a FWHM: CSS blur() takes sigma, seeing is quoted as FWHM. */
const FWHM_TO_SIGMA = 1 / 2.355;

/** Mulberry32: small, fast, repeatable, so a field does not shimmer. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --- the sky's own light -------------------------------------------------- */

/** The colour of the sky's glow: the city's sodium-warm grey, turning blue with twilight. */
function skyTint(twilight: number): [number, number, number] {
  return [1.03 - 0.35 * twilight, 1.0 - 0.2 * twilight, 0.94 + 0.06 * twilight];
}

/** The sky's level, as the sensor and the stretch show it, under the grain's pedestal. */
export function drawSky(ctx: CanvasRenderingContext2D, i: FrameInputs) {
  const level = Math.max(0, i.levels.sky - noisePedestal(i.levels.noise)) * 255;
  const [r, g, b] = skyTint(i.twilight);
  const gradient = ctx.createLinearGradient(0, i.height, 0, 0);
  // The bottom of the frame is lower in the sky, and a little brighter.
  gradient.addColorStop(0, `rgb(${Math.min(255, Math.round(level * r * 1.06 + 2))}, ${Math.min(255, Math.round(level * g * 1.05 + 2))}, ${Math.min(255, Math.round(level * b * 1.04 + 2))})`);
  gradient.addColorStop(1, `rgb(${Math.min(255, Math.round(level * r))}, ${Math.min(255, Math.round(level * g))}, ${Math.min(255, Math.round(level * b))})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, i.width, i.height);
}

/* --- blur, focus ----------------------------------------------------------- */

/**
 * Lucky imaging in one line: a single frame is smeared by the seeing; the stack of
 * the best of many walks toward the aperture's diffraction limit, never past it.
 */
export function effectiveBlurArcsec(i: { seeingArcsec: number; diffractionArcsec: number; subs: number }): number {
  const averaged = i.seeingArcsec / Math.sqrt(Math.max(1, i.subs));
  return Math.max(i.diffractionArcsec, averaged);
}

function arcsecPerPx(i: FrameInputs): number {
  return (i.fovArcmin * 60) / i.width;
}

/** The star image's FWHM in this frame, arcseconds: lucky imaging sharpens short frames; dew spreads everything. */
function frameFwhmArcsec(i: FrameInputs): number {
  const lucky = i.exposureSec < 0.1 ? effectiveBlurArcsec(i) : Math.max(i.diffractionArcsec, i.seeingArcsec);
  return lucky * (1 + 1.2 * i.dew);
}

function blurPx(i: FrameInputs): number {
  return Math.max(0.55, (frameFwhmArcsec(i) / arcsecPerPx(i)) * FWHM_TO_SIGMA);
}

/**
 * The defocused star's radius in display pixels. Each focuser step throws the image
 * about 0.9″ out on an f/10; the SCT's secondary leaves a hole in the middle.
 */
function donutPx(i: FrameInputs): number {
  return (Math.abs(i.defocus) * 0.9) / arcsecPerPx(i);
}

/** How many display pixels across an object of this angular size is in this frame. */
export function targetDiameterPx(targetArcmin: number, fovArcmin: number, widthPx: number): number {
  return (targetArcmin / fovArcmin) * widthPx;
}

/* --- grain ----------------------------------------------------------------- */

/** The grain tiles are drawn additively at this mean: the sky is laid down that much lower. */
const GRAIN_MEAN = 0.3;
const GRAIN_SD = 0.18;
const GRAIN_TILE = 128;

const noiseAlpha = (noise: number) => clamp(noise / GRAIN_SD, 0, 0.9);
const noisePedestal = (noise: number) => noiseAlpha(noise) * GRAIN_MEAN;

/**
 * Four tiles of colour grain — a one-shot-colour sensor's noise is in each channel
 * separately — from a seed, made once. Gaussian, mean 0.3, sd 0.18 of full scale.
 */
export function makeGrainTiles(seed = 1): HTMLCanvasElement[] {
  const random = rng(seed);
  const gauss = () => {
    const u = Math.max(1e-9, random());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  };
  return Array.from({ length: 4 }, () => {
    const canvas = document.createElement('canvas');
    canvas.width = GRAIN_TILE;
    canvas.height = GRAIN_TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const data = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
    for (let p = 0; p < data.data.length; p += 4) {
      data.data[p] = clamp(GRAIN_MEAN + GRAIN_SD * gauss(), 0, 1) * 255;
      data.data[p + 1] = clamp(GRAIN_MEAN + GRAIN_SD * gauss(), 0, 1) * 255;
      data.data[p + 2] = clamp(GRAIN_MEAN + GRAIN_SD * gauss(), 0, 1) * 255;
      data.data[p + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
  });
}

/**
 * The frame's grain, at the standard deviation the sensor model gives for this stack:
 * one tile of the four, at a seeded offset, so each frame's grain differs and a
 * repeated frame number repeats it.
 */
export function drawNoise(ctx: CanvasRenderingContext2D, i: FrameInputs, tiles: HTMLCanvasElement[], frame: number) {
  const alpha = noiseAlpha(i.levels.noise);
  if (alpha < 0.01 || tiles.length === 0) return;
  const pattern = ctx.createPattern(tiles[frame % tiles.length], 'repeat');
  if (!pattern) return;
  const ox = Math.floor(hash01(frame, 5, 9) * GRAIN_TILE);
  const oy = Math.floor(hash01(frame, 6, 9) * GRAIN_TILE);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.translate(-ox, -oy);
  ctx.fillStyle = pattern;
  ctx.fillRect(ox, oy, i.width, i.height);
  ctx.restore();
}

/* --- sprites ----------------------------------------------------------------- */

const SPRITE = 32;
const TINT_BUCKETS = 8;
const sprites = new Map<string, HTMLCanvasElement>();

/** A star's image, a Gaussian out to three sigma; a clipped core with a soft rim; a Moffat bloom. */
function sprite(kind: 'psf' | 'core' | 'bloom', bucket = 0): HTMLCanvasElement | null {
  const key = `${kind}:${bucket}`;
  const cached = sprites.get(key);
  if (cached) return cached;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // A clipped core is near white but keeps a trace of the star's colour; the PSF and the bloom carry all of it.
  const [cr, cg, cb] = starColor(bucket / (TINT_BUCKETS - 1));
  const [r, g, b] = kind === 'core' ? [Math.round(255 * 0.6 + cr * 0.4), Math.round(255 * 0.6 + cg * 0.4), Math.round(255 * 0.6 + cb * 0.4)] : [cr, cg, cb];
  const data = ctx.createImageData(SPRITE, SPRITE);
  const half = SPRITE / 2;
  for (let y = 0; y < SPRITE; y++) {
    for (let x = 0; x < SPRITE; x++) {
      const d = Math.hypot(x + 0.5 - half, y + 0.5 - half) / half;
      const a = kind === 'psf' ? Math.exp(-((d * 3) ** 2) / 2) : kind === 'core' ? clamp((1 - d) / 0.25, 0, 1) : Math.pow(1 + (d * 4) ** 2, -2.5) * clamp((1 - d) * 4, 0, 1);
      const p = (y * SPRITE + x) * 4;
      data.data[p] = r;
      data.data[p + 1] = g;
      data.data[p + 2] = b;
      data.data[p + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(data, 0, 0);
  sprites.set(key, canvas);
  return canvas;
}

/* --- the cloud ----------------------------------------------------------------- */

let cloudTile: HTMLCanvasElement | null = null;

/** A tileable cloud texture, made once from seeded value noise, warm-lit from below. */
function cloudTexture(): HTMLCanvasElement | null {
  if (cloudTile || typeof document === 'undefined') return cloudTile;
  const size = 128;
  const period = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const data = ctx.createImageData(size, size);
  const noise = (x: number, y: number, p: number, seed: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const sx = (x - x0) ** 2 * (3 - 2 * (x - x0));
    const sy = (y - y0) ** 2 * (3 - 2 * (y - y0));
    const at = (a: number, b: number) => hash01(((a % p) + p) % p, ((b % p) + p) % p, seed);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * period;
      const v = (y / size) * period;
      const n = 0.6 * noise(u, v, period, 21) + 0.4 * noise(u * 2, v * 2, period * 2, 22);
      const p = (y * size + x) * 4;
      data.data[p] = 255;
      data.data[p + 1] = 246;
      data.data[p + 2] = 232;
      data.data[p + 3] = Math.round(clamp((n - 0.3) / 0.5, 0, 1) * 255);
    }
  }
  ctx.putImageData(data, 0, 0);
  cloudTile = canvas;
  return canvas;
}

/**
 * Cloud in front of the field: a veil whose thickness follows the cloud field across
 * the frame, lit by the city below, and a texture drifting with the wind. Over the
 * stars, so they dim and vanish behind it as they would.
 */
function drawCloud(ctx: CanvasRenderingContext2D, i: FrameInputs, skyHeight: number) {
  const { centre, right, top, driftPx } = i.cloud;
  if (Math.max(centre, right, top) < 0.02 || skyHeight <= 0) return;
  // Clouds are lit by the city from below: brighter than the clear sky beside them.
  const lit = stretch(Math.min(1, i.levels.skyLin * 3.5 + 0.0004));
  const level = Math.round(Math.max(lit, 0.04) * 255);
  const dx = right - centre;
  const dy = top - centre;
  const cx = i.width / 2;
  const cy = i.height / 2;
  const left = clamp(centre - dx, 0, 1);
  const bottom = clamp(centre - dy, 0, 1);
  // The veil runs along the steeper of the two gradients.
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const g = horizontal ? ctx.createLinearGradient(0, cy, i.width, cy) : ctx.createLinearGradient(cx, i.height, cx, 0);
  const a0 = horizontal ? left : bottom;
  const a1 = horizontal ? clamp(right, 0, 1) : clamp(top, 0, 1);
  const colour = (a: number) => `rgba(${level}, ${Math.round(level * 0.97)}, ${Math.round(level * 0.92)}, ${(a * 0.92).toFixed(3)})`;
  g.addColorStop(0, colour(a0));
  g.addColorStop(0.5, colour(clamp(centre, 0, 1)));
  g.addColorStop(1, colour(a1));
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, i.width, skyHeight);
  const tile = cloudTexture();
  if (tile) {
    const pattern = ctx.createPattern(tile, 'repeat');
    if (pattern) {
      const scale = 3;
      const span = tile.width * scale;
      const ox = ((driftPx.x % span) + span) % span;
      const oy = ((driftPx.y % span) + span) % span;
      ctx.globalAlpha = clamp(centre * 0.9, 0, 0.75) * Math.max(lit, 0.08);
      ctx.translate(ox - span, oy - span);
      ctx.scale(scale, scale);
      ctx.fillStyle = pattern;
      ctx.fillRect((span - ox) / scale, (span - oy) / scale, i.width / scale, skyHeight / scale);
    }
  }
  ctx.restore();
}

/* --- the live frame -------------------------------------------------------- */

/** How far beyond the frame a slewing sub looks for stars whose trails cross it. */
const MAX_TRAIL_SEARCH_DEG = 1.5;
const HOT_PIXELS = hotPixels();

/**
 * One frame, built from the sky. Whatever is inside the field at the pointing is drawn
 * where it is, so a hand slew shows the sky sliding at the commanded rate and a
 * target arrives from the edge of the frame rather than materialising in the middle.
 */
export function drawLiveScene(ctx: CanvasRenderingContext2D, i: FrameInputs, frame: number, s: LiveScene) {
  const pxPerDeg = i.width / (i.fovArcmin / 60);
  drawSky(ctx, i);

  const am = airmass(s.pointing.altitude) ?? 10;
  const extinction = extinctionMag(am);
  const north = northAngleDeg(s.pointing, s.latDeg, s.lstHours);
  const shake = i.tilt;
  const sigma = blurPx(i);
  const donut = donutPx(i);
  const streak = { x: s.drift.x * pxPerDeg, y: -s.drift.y * pxPerDeg };

  const project = (o: AltAz) => {
    const d = tangentOffsetDeg(s.pointing, o);
    return { x: i.width / 2 + d.x * pxPerDeg + shake.x, y: i.height / 2 - d.y * pxPerDeg + shake.y };
  };
  const margin = 40 + Math.hypot(streak.x, streak.y);
  const inFrame = (p: { x: number; y: number }, reach: number) =>
    p.x > -reach - margin && p.x < i.width + reach + margin && p.y > -reach - margin && p.y < i.height + reach + margin;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // A trailed star spreads its light along the trail, so each pixel of it is fainter by
  // the trail's length over the star's width: a sub exposed through a slew keeps only
  // the bright stars, as the sensor would.
  const trail = Math.hypot(streak.x, streak.y);
  const spread = trail > 1 ? Math.max(1, trail / Math.max(1, sigma * 2)) : 1;
  const starLimit = i.limitMag - 2.5 * Math.log10(spread) - extinction;
  // The peak of a magnitude-0 star in this frame, through this much air, along this trail.
  const peak0 = (i.peakAtMag0 * Math.pow(10, -0.4 * extinction)) / spread;
  const eq = altAzToRaDec(s.pointing, s.latDeg, s.lstHours);
  // Stars whose trails reach in from further than this are left out: past it a slew's
  // sub is a smear, and searching the whole path would be millions of stars.
  const reachDeg = Math.min(Math.hypot(s.drift.x, s.drift.y), MAX_TRAIL_SEARCH_DEG);
  const radiusDeg = Math.hypot(i.width, i.height) / pxPerDeg / 2 + 0.05 + reachDeg;
  const look: Look = { sigma, donut, obstruction: i.obstruction, streak, skyLin: i.levels.skyLin, sky: i.levels.sky, dew: i.dew };
  const twinkle = (key: number) => Math.max(0.15, 1 + i.scintillation * hashNormal(key, frame, 3));
  if (starLimit > BRIGHTEST_FIELD_MAG) {
    for (const star of fieldStarsNear(eq, radiusDeg)) {
      if (star.mag > starLimit) continue;
      const p = project(raDecToAltAz(star, s.latDeg, s.lstHours));
      if (!inFrame(p, donut)) continue;
      const key = Math.floor(star.raHours * 1e6) ^ Math.floor(star.decDeg * 1e5);
      // Most of a field's stars sit near white; a few are clearly blue or orange.
      drawStar(ctx, p.x, p.y, peak0 * Math.pow(10, -0.4 * star.mag) * twinkle(key), 0.5 + (star.tint - 0.5) * 0.7, look);
    }
  }

  // Extended objects sit behind the planets, and stars on top of everything: a
  // Galilean moon in transit is in front of the disc.
  const order: Record<SkyObject['kind'], number> = { dso: 0, body: 1, star: 2 };
  const objects = [...s.objects].sort((a, b) => order[a.kind] - order[b.kind]);
  for (const o of objects) {
    const p = project(o);
    const diameter = targetDiameterPx(o.sizeArcmin, i.fovArcmin, i.width) * (o.frameSpan ?? 1);
    if (!inFrame(p, diameter / 2 + 30 + donut)) continue;
    if (o.kind === 'star') {
      if (o.mag > starLimit) continue;
      drawStar(ctx, p.x, p.y, peak0 * Math.pow(10, -0.4 * o.mag) * twinkle(seedFrom(o.id)), o.tint ?? 0.5, look);
    } else if (o.kind === 'body') {
      drawBody(ctx, i, o, p, north, look, s, extinction);
    } else {
      drawDeepSky(ctx, i, o, p, north, sigma, s, i.limitMag);
    }
  }
  ctx.restore();

  // Below the horizon is the ground: nothing behind it reaches the sensor.
  const horizonY = i.height / 2 + s.pointing.altitude * pxPerDeg + shake.y;
  const skyHeight = clamp(horizonY, 0, i.height);
  drawCloud(ctx, i, skyHeight);
  if (horizonY < i.height) {
    const top = Math.max(0, horizonY - 3);
    const ground = ctx.createLinearGradient(0, top, 0, Math.min(i.height, horizonY + 24));
    ground.addColorStop(0, 'rgba(5, 7, 12, 0)');
    ground.addColorStop(3 / 27, 'rgba(5, 7, 12, 1)');
    ground.addColorStop(1, 'rgba(3, 6, 14, 1)');
    ctx.fillStyle = ground;
    ctx.fillRect(0, top, i.width, i.height - top);
  }

  // Dew on the corrector scatters light across the whole frame: a milky veil.
  if (i.dew > 0.02) {
    const milk = Math.round(clamp(i.levels.sky * 1.4 + 0.08, 0, 1) * 255);
    ctx.fillStyle = `rgba(${milk}, ${milk}, ${Math.round(milk * 1.04)}, ${(i.dew * 0.22).toFixed(3)})`;
    ctx.fillRect(0, 0, i.width, skyHeight);
  }

  // The train's vignetting, over everything, as it is in a frame.
  if (i.edgeIllumination < 0.95) {
    const v = ctx.createRadialGradient(i.width / 2, i.height / 2, i.width * 0.3, i.width / 2, i.height / 2, i.width * 0.62);
    v.addColorStop(0, 'rgba(0, 0, 0, 0)');
    v.addColorStop(1, `rgba(0, 0, 0, ${(1 - i.edgeIllumination).toFixed(2)})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, i.width, i.height);
  }

  // Hot pixels are on the sensor, not the sky: they do not move with it.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const hot of HOT_PIXELS) {
    const level = hotPixelLevel(hot, i.levels, i.exposureSec, i.subs);
    if (level < 0.02) continue;
    ctx.fillStyle = `rgba(255, ${Math.round(200 + 55 * hash01(Math.round(hot.x * 1e4), 7))}, 235, ${Math.min(1, level).toFixed(3)})`;
    ctx.fillRect(Math.round(hot.x * i.width), Math.round(hot.y * i.height), 1.2, 1.2);
  }
  ctx.restore();
}

/* --- stars ----------------------------------------------------------------- */

type Look = {
  sigma: number;
  donut: number;
  obstruction: number;
  streak: { x: number; y: number };
  /** The sky the star sits on, linear and displayed. */
  skyLin: number;
  sky: number;
  dew: number;
};

/** Star colour by a 0–1 tint: blue-white through white to orange. */
function starColor(tint: number): [number, number, number] {
  if (tint < 0.5) {
    const t = tint / 0.5;
    return [Math.round(150 + 105 * t), Math.round(185 + 70 * t), 255];
  }
  const t = (tint - 0.5) / 0.5;
  return [255, Math.round(255 - 70 * t), Math.round(255 - 150 * t)];
}

/**
 * A star as the sensor records it. `peak` is its brightest pixel on one sub as a
 * fraction of the converter's range: the stretch decides how bright that shows over
 * the sky. Past 1 the core clips to a white disc that widens with the star's light,
 * and a bright star blooms. Out of focus it opens into the ring of an obstructed
 * telescope; moving, its light spreads along its trail. An SCT has no spider, so
 * there are no spikes.
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, peak: number, tint: number, look: Look) {
  if (!(peak > 0)) return;
  const shown = (stretch(look.skyLin + Math.min(1, peak)) - look.sky) * (1 - 0.3 * look.dew);
  if (shown < 0.004) return;
  const [r, g, b] = starColor(tint);
  const length = Math.hypot(look.streak.x, look.streak.y);

  if (look.donut > 1.5) {
    // The light is spread over the ring: a faint star vanishes, a bright one is a bright ring.
    const outer = look.donut + look.sigma;
    const inner = look.donut * look.obstruction;
    const alpha = clamp(shown * 1.6 * Math.min(1, (look.sigma * 3) / outer) + (peak > 1 ? 0.15 : 0), 0, 1);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1, outer - inner);
    ctx.beginPath();
    ctx.arc(x, y, (outer + inner) / 2, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  // The clipped core: where the Gaussian stands above the converter's ceiling.
  const clipped = peak > 1 ? look.sigma * Math.sqrt(2 * Math.log(peak)) : 0;

  if (length > 1) {
    const width = Math.max(look.sigma * 2.2, clipped * 2);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${clamp(shown * Math.max(0.25, Math.min(1, (width * 1.4) / length)), 0, 1).toFixed(3)})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - look.streak.x / 2, y - look.streak.y / 2);
    ctx.lineTo(x + look.streak.x / 2, y + look.streak.y / 2);
    ctx.stroke();
    return;
  }

  const bucket = Math.round(clamp(tint, 0, 1) * (TINT_BUCKETS - 1));
  const psf = sprite('psf', bucket);
  if (!psf) return;
  // An extended object's own transparency carries into its stars.
  const base = ctx.globalAlpha;
  const R = look.sigma * 3;
  ctx.globalAlpha = base * clamp(shown, 0, 1);
  ctx.drawImage(psf, x - R, y - R, R * 2, R * 2);
  // Bloom: the bright star's wings, and dew's halo around anything bright. Drawn first,
  // in the star's colour: a colour sensor's clipped star is white only at its heart.
  const wings = peak > 4 ? Math.min(0.6, 0.18 * Math.log10(peak)) : 0;
  const halo = look.dew > 0.15 ? look.dew * 0.22 * Math.min(1, peak) : 0;
  if (wings + halo > 0.01) {
    const bloom = sprite('bloom', bucket);
    const rb = look.sigma * (4 + 3 * Math.log10(Math.max(1, peak)) + 6 * look.dew) + clipped * 2.5;
    if (bloom) {
      ctx.globalAlpha = base * clamp(wings + halo, 0, 0.65);
      ctx.drawImage(bloom, x - rb, y - rb, rb * 2, rb * 2);
    }
  }
  if (clipped > 0) {
    // The Gaussian's shoulder beyond the clipped core: the coloured ring around it.
    const Rs = (clipped + look.sigma * 1.5) * 1.6;
    ctx.globalAlpha = base;
    ctx.drawImage(psf, x - Rs, y - Rs, Rs * 2, Rs * 2);
    const core = sprite('core', bucket);
    const rc = Math.max(clipped * 0.85, look.sigma * 0.8);
    if (core) {
      ctx.globalAlpha = base * 0.85;
      ctx.drawImage(core, x - rc, y - rc, rc * 2, rc * 2);
    }
  }
  ctx.globalAlpha = base;
}

/* --- bodies ----------------------------------------------------------------- */

/**
 * The night side of a disc: the terminator is an ellipse whose minor axis is the
 * cosine of the phase angle. Drawn as a mask that darkens what the Sun does not
 * light, with the bright limb toward the Sun.
 */
function maskPhase(ctx: CanvasRenderingContext2D, radius: number, phase: { fraction: number; limbPaDeg: number }, northDeg: number) {
  const k = clamp(phase.fraction, 0, 1);
  if (k > 0.995) return;
  // The bright limb points toward the Sun; position angle runs east of north, east is
  // anticlockwise on the sensor once north is where the frame puts it.
  ctx.save();
  ctx.rotate(((northDeg - phase.limbPaDeg) * Math.PI) / 180);
  // In this frame the lit limb is at -y. The dark region is the far half plus the
  // terminator ellipse (lit half minus the crescent) when k < 0.5, or the far half
  // minus the ellipse when k > 0.5.
  const b = Math.abs(2 * k - 1) * radius;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(4, 4, 6, 0.96)';
  ctx.beginPath();
  // The half away from the Sun.
  ctx.arc(0, 0, radius + 0.5, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  if (k < 0.5) {
    // Less than half lit: the terminator bulges into the sunward half; darken it.
    ctx.ellipse(0, 0, radius + 0.5, b, 0, Math.PI, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
  } else {
    // More than half lit: the terminator bulges into the far half; relight it.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.ellipse(0, 0, radius - 0.5, b, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * A planet or the Moon: the reference photograph at its true angular size, rotated
 * to the frame's north, its phase masked, dimmed by extinction and fringed by
 * dispersion low down; or, past the full well, a white blob with a bloom, which is
 * what a 30-second sub of Jupiter looks like.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  i: FrameInputs,
  o: SkyObject,
  p: { x: number; y: number },
  northDeg: number,
  look: Look,
  s: LiveScene,
  extinction: number,
) {
  const diameter = targetDiameterPx(o.sizeArcmin, i.fovArcmin, i.width);
  const factor = burnOut(o.saturateSec ?? 1, i.exposureSec, i.gain);
  const sigma = look.sigma + look.donut * 0.6;

  if (factor > 6) {
    const radius = (diameter / 2) * (1 + 0.35 * Math.log10(factor)) + sigma * 2;
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 1.6);
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glow.addColorStop(1 / 1.6, 'rgba(255, 250, 240, 0.95)');
    glow.addColorStop(1, 'rgba(255, 245, 225, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const image = o.photoSrc ? s.image(o.photoSrc) : null;
  const brightness = clamp(Math.pow(factor, 0.5), 0.25, 1.25) * Math.pow(10, -0.4 * extinction);
  const contrast = 1 + Math.min(0.45, Math.log2(Math.max(1, i.subs)) * 0.09);
  const dispersion = dispersionArcsec(o.altitude) / arcsecPerPx(i);
  const length = Math.hypot(look.streak.x, look.streak.y);

  const disc = (dx: number, dy: number, tint: string | null, alpha: number) => {
    ctx.save();
    ctx.translate(p.x + dx, p.y + dy);
    ctx.rotate((northDeg * Math.PI) / 180);
    ctx.globalAlpha = alpha;
    ctx.filter = `blur(${sigma.toFixed(2)}px) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
    if (image) {
      const w = diameter * (o.frameSpan ?? 1);
      const h = image.naturalWidth ? w * (image.naturalHeight / image.naturalWidth) : w;
      ctx.drawImage(image, -w / 2, -h / 2, w, h);
    } else {
      ctx.fillStyle = 'rgba(235, 225, 205, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, diameter / 2), 0, Math.PI * 2);
      ctx.fill();
    }
    if (tint) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = tint;
      ctx.filter = 'none';
      ctx.fillRect(-diameter, -diameter, diameter * 2, diameter * 2);
    }
    ctx.restore();
  };

  // The trail of a moving disc: a few copies along the streak, each fainter.
  const copies = length > 2 ? Math.min(6, Math.ceil(length / Math.max(2, diameter / 3))) : 1;
  for (let c = 0; c < copies; c++) {
    const t = copies === 1 ? 0 : c / (copies - 1) - 0.5;
    disc(look.streak.x * t, look.streak.y * t, null, 1 / copies);
  }
  if (dispersion > 0.6 && copies === 1) {
    // Refraction lifts blue more than red: a blue fringe on the upper limb, red below.
    disc(0, -dispersion / 2, 'rgba(120, 160, 255, 0.5)', 0.22);
    disc(0, dispersion / 2, 'rgba(255, 110, 80, 0.5)', 0.22);
  }

  if (o.phase && image && copies === 1) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = `blur(${(sigma * 0.8).toFixed(2)}px)`;
    maskPhase(ctx, diameter / 2, o.phase, northDeg);
    ctx.restore();
  }
}

/* --- deep sky ---------------------------------------------------------------- */

/**
 * How much of a faint extended object this sub and stack reveal, 0–1: nothing at
 * planetary exposures, the bright ones from half a second, and the stack keeps
 * lifting the faint ones out of the noise.
 */
function deepSkyVisibility(mag: number, exposureSec: number, subs: number, limit: number): number {
  const exposure = clamp((Math.log10(Math.max(0.001, exposureSec)) + 1.3) / 2.2, 0, 1);
  const faintness = clamp(1 - (mag - 4) / 8, 0.25, 1);
  const reach = clamp((limit - 8) / 6, 0, 1);
  return clamp(exposure * faintness * reach * (1 + 0.2 * Math.log10(Math.max(1, subs))), 0, 1);
}

function seedFrom(id: string): number {
  let h = 2166136261;
  for (let n = 0; n < id.length; n++) h = Math.imul(h ^ id.charCodeAt(n), 16777619);
  return h >>> 0;
}

/**
 * A deep-sky object: three have photographs; the rest are drawn from their catalogued
 * shape, size and orientation. Illustrated where there is no photograph, never a
 * photograph of something else.
 */
function drawDeepSky(
  ctx: CanvasRenderingContext2D,
  i: FrameInputs,
  o: SkyObject,
  p: { x: number; y: number },
  northDeg: number,
  sigma: number,
  s: LiveScene,
  limit: number,
) {
  const alpha = deepSkyVisibility(o.mag, i.exposureSec, i.subs, limit);
  if (alpha <= 0.01) return;

  const major = targetDiameterPx(o.sizeArcmin, i.fovArcmin, i.width);
  const minor = targetDiameterPx(o.minorArcmin ?? o.sizeArcmin, i.fovArcmin, i.width);
  const image = o.photoSrc ? s.image(o.photoSrc) : null;

  ctx.save();
  ctx.translate(p.x, p.y);
  // Position angle runs east of north, and east is anticlockwise on the sensor.
  ctx.rotate(((northDeg - (o.paDeg ?? 0)) * Math.PI) / 180);
  ctx.globalAlpha = alpha;

  if (image) {
    const contrast = 1 + Math.min(0.45, Math.log2(Math.max(1, i.subs)) * 0.09);
    ctx.rotate(((o.paDeg ?? 0) * Math.PI) / 180);
    ctx.filter = `blur(${sigma.toFixed(2)}px) contrast(${contrast.toFixed(2)}) brightness(1.06)`;
    const w = major * (o.frameSpan ?? 1);
    const h = image.naturalWidth ? w * (image.naturalHeight / image.naturalWidth) : w;
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }

  const random = rng(seedFrom(o.id));
  const still: Look = { sigma, donut: 0, obstruction: 0, streak: { x: 0, y: 0 }, skyLin: i.levels.skyLin, sky: i.levels.sky, dew: i.dew };
  // A member star `e` magnitudes above the frame's limit, as a peak: six above is the first to clip.
  const member = (e: number) => Math.pow(10, 0.4 * (e - 6));
  switch (o.shape) {
    case 'galaxy': {
      ctx.filter = `blur(${(sigma * 2).toFixed(2)}px)`;
      ctx.scale(1, Math.max(0.15, minor / major));
      const disc = ctx.createRadialGradient(0, 0, 0, 0, 0, major / 2);
      disc.addColorStop(0, 'rgba(255, 244, 222, 0.95)');
      disc.addColorStop(0.12, 'rgba(240, 228, 205, 0.55)');
      disc.addColorStop(0.5, 'rgba(210, 205, 200, 0.18)');
      disc.addColorStop(1, 'rgba(190, 190, 200, 0)');
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(0, 0, major / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'globular': {
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, major / 2);
      core.addColorStop(0, 'rgba(255, 246, 228, 0.8)');
      core.addColorStop(0.3, 'rgba(250, 240, 220, 0.25)');
      core.addColorStop(1, 'rgba(240, 235, 225, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, major / 2, 0, Math.PI * 2);
      ctx.fill();
      for (let n = 0; n < 260; n++) {
        const r = (major / 2) * Math.pow(random(), 1.6);
        const t = random() * Math.PI * 2;
        drawStar(ctx, Math.cos(t) * r, Math.sin(t) * r, member(1 + random() * 3.5), 0.6, still);
      }
      break;
    }
    case 'open': {
      const count = Math.round(clamp(major / 6, 12, 60));
      if (o.id === 'm45') {
        ctx.filter = `blur(${(sigma * 3).toFixed(2)}px)`;
        const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, major / 3);
        haze.addColorStop(0, 'rgba(180, 200, 255, 0.12)');
        haze.addColorStop(1, 'rgba(180, 200, 255, 0)');
        ctx.fillStyle = haze;
        ctx.beginPath();
        ctx.arc(0, 0, major / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';
      }
      for (let n = 0; n < count; n++) {
        const r = (major / 2) * Math.sqrt(random());
        const t = random() * Math.PI * 2;
        drawStar(ctx, Math.cos(t) * r, Math.sin(t) * r, member(2 + random() * 6), 0.3 + random() * 0.4, still);
      }
      break;
    }
    case 'nebula': {
      ctx.filter = `blur(${(sigma * 2.5).toFixed(2)}px)`;
      ctx.scale(1, Math.max(0.2, minor / major));
      for (let n = 0; n < 4; n++) {
        const r = (major / 2) * (0.45 + random() * 0.35);
        const cx = (random() - 0.5) * major * 0.35;
        const cy = (random() - 0.5) * major * 0.35;
        const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        blob.addColorStop(0, 'rgba(225, 190, 205, 0.32)');
        blob.addColorStop(0.5, 'rgba(200, 175, 200, 0.14)');
        blob.addColorStop(1, 'rgba(180, 170, 200, 0)');
        ctx.fillStyle = blob;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'planetary': {
      ctx.filter = `blur(${(sigma * 1.5).toFixed(2)}px)`;
      ctx.scale(1, Math.max(0.3, minor / major));
      const ring = ctx.createRadialGradient(0, 0, 0, 0, 0, major / 2);
      ring.addColorStop(0, 'rgba(160, 200, 205, 0.12)');
      ring.addColorStop(0.55, 'rgba(170, 215, 215, 0.2)');
      ring.addColorStop(0.85, 'rgba(180, 225, 220, 0.6)');
      ring.addColorStop(1, 'rgba(180, 225, 220, 0)');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(0, 0, major / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
