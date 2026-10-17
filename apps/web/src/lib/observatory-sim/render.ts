/**
 * Drawing a frame the way the sensor would record it (ADR-054 §4).
 *
 * Everything inside the field is drawn where it really is, at its true angular size,
 * from one projection around the pointing: the anonymous star field fixed to the
 * sky, the catalogue's deep-sky objects, the planets with their phases and moons.
 * Slew by hand and the whole sky slides; track and it holds; leave tracking off and
 * it drifts. No object is pinned to the screen, because none is drawn relative to it.
 *
 * What the instrument and the air do to the light — the seeing's blur, the
 * out-of-focus donut of an obstructed telescope, atmospheric extinction and
 * dispersion by altitude, burn-out past the sensor's full well, the sky's glow by
 * Bortle class and moonlight, cloud — is computed, not painted.
 */

import { burnOut, limitingMagnitude } from './camera';
import { dispersionArcsec, extinctionMag } from './optics';
import type { AltAz } from './safety';
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
  /** Seeing FWHM in arcseconds. */
  seeingArcsec: number;
  /** Dawes' limit for the aperture: the floor stacking approaches, never beats. */
  diffractionArcsec: number;
  /** The secondary's shadow as a fraction of the aperture, for the defocused donut. */
  obstruction: number;
  /** Focuser steps from best focus; zero is sharp. */
  defocus: number;
  /** Bortle class at the site, 1–9. */
  bortle: number;
  /** Moonlight on the sky tonight, 0–1. */
  moonlight: number;
  /** Cloud across the field, 0–1: thins the stars and lifts the background. */
  cloud: number;
  /** Subframes in the stack. Noise falls as its square root. */
  subs: number;
  /** Camera gain in ZWO units, 0–600. */
  gain: number;
  exposureSec: number;
  /** Illumination at the field's edge, 0–1: the train's vignetting. */
  edgeIllumination: number;
};

export type LiveScene = {
  pointing: AltAz;
  /** How far the sky moved across the sensor during the exposure, degrees (x right, y up). */
  drift: { x: number; y: number };
  latDeg: number;
  lstHours: number;
  objects: SkyObject[];
  image: (src: string) => HTMLImageElement | null;
  sunAltitudeDeg: number;
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

/**
 * Sky background luminance, 0–1, from the Bortle class, the Moon and the cloud. A
 * Bortle 8 sky on a short sub is dark grey, not fog; moonlight and cloud lift it.
 */
function skyGlow(i: FrameInputs): number {
  const ceiling = 0.13;
  const city = Math.max(0.008, (i.bortle - 1) / 8) * ceiling;
  return Math.min(0.3, city + i.moonlight * 0.06 + i.cloud * city * 1.5);
}

export function drawSky(ctx: CanvasRenderingContext2D, i: FrameInputs, wash = 0) {
  const glow = skyGlow(i) * (0.6 + i.gain / 900);
  const level = Math.round(glow * 255);
  const gradient = ctx.createLinearGradient(0, i.height, 0, 0);
  gradient.addColorStop(0, `rgb(${level + 5}, ${level + 3}, ${level})`);
  gradient.addColorStop(1, `rgb(${Math.max(0, level - 2)}, ${Math.max(0, level - 1)}, ${level})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, i.width, i.height);

  // Daylight. The sensor does not adapt the way the eye does: a sub of any real
  // length under a lit sky is pale blue, and the stars are gone.
  if (wash > 0) {
    ctx.fillStyle = `rgba(158, 186, 232, ${Math.min(1, wash).toFixed(3)})`;
    ctx.fillRect(0, 0, i.width, i.height);
  }
}

/* --- blur, focus, jitter --------------------------------------------------- */

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

function blurPx(i: FrameInputs): number {
  return Math.max(0.3, (effectiveBlurArcsec(i) / arcsecPerPx(i)) * FWHM_TO_SIGMA);
}

/**
 * The defocused star's radius in display pixels. Each focuser step throws the image
 * about 0.9″ out on an f/10; the SCT's secondary leaves a hole in the middle.
 */
function donutPx(i: FrameInputs): number {
  return (Math.abs(i.defocus) * 0.9) / arcsecPerPx(i);
}

/**
 * Atmospheric wobble for the current frame, in display pixels. Seeing moves the
 * image between frames as well as blurring it; the stack aligns them, so the shake
 * dies away as subs accumulate.
 */
export function jitterPx(i: FrameInputs, frame: number): { x: number; y: number } {
  const amplitude = (i.seeingArcsec / arcsecPerPx(i)) / Math.sqrt(Math.max(1, i.subs));
  return {
    x: Math.sin(frame * 0.31) * amplitude * 0.5 + Math.sin(frame * 0.11) * amplitude * 0.3,
    y: Math.cos(frame * 0.27) * amplitude * 0.5 + Math.cos(frame * 0.13) * amplitude * 0.3,
  };
}

/** How many display pixels across an object of this angular size is in this frame. */
export function targetDiameterPx(targetArcmin: number, fovArcmin: number, widthPx: number): number {
  return (targetArcmin / fovArcmin) * widthPx;
}

/* --- noise ---------------------------------------------------------------- */

/** Sensor noise on the stack, as `frameNoise` sized it: one sub is grain, sixteen are four times cleaner. */
export function drawNoise(ctx: CanvasRenderingContext2D, i: FrameInputs, tile: CanvasImageSource, amplitude: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(amplitude, 0, 0.6);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, i.width, i.height);
  }
  ctx.restore();
}

/** A small monochrome noise tile, redrawn occasionally so grain does not freeze. */
export function makeNoiseTile(size = 96): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const data = ctx.createImageData(size, size);
  for (let p = 0; p < data.data.length; p += 4) {
    const v = Math.random() * 255;
    data.data[p] = v;
    data.data[p + 1] = v;
    data.data[p + 2] = v;
    data.data[p + 3] = 26;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/* --- the live frame -------------------------------------------------------- */

/**
 * One frame, built from the sky. Whatever is inside the field at the pointing is drawn
 * where it is, so a hand slew shows the sky sliding at the commanded rate and a
 * target arrives from the edge of the frame rather than materialising in the middle.
 */
/** How far beyond the frame a slewing sub looks for stars whose trails cross it. */
const MAX_TRAIL_SEARCH_DEG = 1.5;

export function drawLiveScene(ctx: CanvasRenderingContext2D, i: FrameInputs, frame: number, s: LiveScene) {
  const pxPerDeg = i.width / (i.fovArcmin / 60);
  // Astronomical twilight ends at -18°; the wash ramps from -12° up.
  const daylight = clamp((s.sunAltitudeDeg + 12) / 18, 0, 1);
  drawSky(ctx, i, daylight * clamp(i.exposureSec / 0.004, 0.35, 1));

  const am = airmass(s.pointing.altitude) ?? 10;
  const extinction = extinctionMag(am);
  const limit = limitingMagnitude(i.exposureSec, i.gain, i.subs, i.bortle) - daylight * 14 - extinction - i.cloud * 4 - i.moonlight * 1.2;
  const north = northAngleDeg(s.pointing, s.latDeg, s.lstHours);
  const shake = jitterPx(i, frame);
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
  const starLimit = limit - (trail > 1 ? 2.5 * Math.log10(Math.max(1, trail / Math.max(1, sigma * 2))) : 0);
  const eq = altAzToRaDec(s.pointing, s.latDeg, s.lstHours);
  // Stars whose trails reach in from further than this are left out: past it a slew's
  // sub is a smear, and searching the whole path would be millions of stars.
  const reachDeg = Math.min(Math.hypot(s.drift.x, s.drift.y), MAX_TRAIL_SEARCH_DEG);
  const radiusDeg = Math.hypot(i.width, i.height) / pxPerDeg / 2 + 0.05 + reachDeg;
  const look = { sigma, donut, obstruction: i.obstruction, streak };
  if (starLimit > BRIGHTEST_FIELD_MAG) {
    for (const star of fieldStarsNear(eq, radiusDeg)) {
      if (star.mag > starLimit) continue;
      const p = project(raDecToAltAz(star, s.latDeg, s.lstHours));
      if (!inFrame(p, donut)) continue;
      drawStar(ctx, p.x, p.y, starLimit - star.mag, star.tint, look);
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
      drawStar(ctx, p.x, p.y, starLimit - o.mag, 0.45, look);
    } else if (o.kind === 'body') {
      drawBody(ctx, i, o, p, north, look, s, extinction);
    } else {
      drawDeepSky(ctx, i, o, p, north, sigma, s, limit);
    }
  }
  ctx.restore();

  // The train's vignetting, and cloud's veil: both over everything, as they are in a frame.
  if (i.edgeIllumination < 0.95) {
    const v = ctx.createRadialGradient(i.width / 2, i.height / 2, i.width * 0.3, i.width / 2, i.height / 2, i.width * 0.62);
    v.addColorStop(0, 'rgba(0, 0, 0, 0)');
    v.addColorStop(1, `rgba(0, 0, 0, ${(1 - i.edgeIllumination).toFixed(2)})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, i.width, i.height);
  }
  if (i.cloud > 0.02) {
    const level = Math.round(skyGlow(i) * 255 * 1.6);
    ctx.fillStyle = `rgba(${level + 8}, ${level + 6}, ${level + 2}, ${(i.cloud * 0.5).toFixed(2)})`;
    ctx.fillRect(0, 0, i.width, i.height);
  }
}

/* --- stars ----------------------------------------------------------------- */

type Look = { sigma: number; donut: number; obstruction: number; streak: { x: number; y: number } };

/** Star colour by a 0–1 tint: blue-white through white to orange. */
function starColor(tint: number): [number, number, number] {
  if (tint < 0.5) {
    const t = tint / 0.5;
    return [Math.round(205 + 50 * t), Math.round(220 + 35 * t), 255];
  }
  const t = (tint - 0.5) / 0.5;
  return [255, Math.round(255 - 45 * t), Math.round(255 - 95 * t)];
}

/**
 * A star as the sensor records it: a seeing-blurred spot whose size and brightness
 * grow with how far above the limit it sits; past saturation it blooms. Out of focus
 * it opens into the ring of an obstructed telescope. Moving, its light spreads along
 * its trail. An SCT has no spider, so there are no spikes.
 */
function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, excess: number, tint: number, look: Look) {
  const e = Math.max(0, excess);
  const bloom = e > 6 ? Math.pow(1.35, e - 6) : 1;
  const [r, g, b] = starColor(tint);
  const length = Math.hypot(look.streak.x, look.streak.y);

  if (look.donut > 1.5) {
    // The light is spread over the ring: a faint star vanishes, a bright one is a bright ring.
    const outer = look.donut + look.sigma;
    const inner = look.donut * look.obstruction;
    const alpha = clamp((0.2 + e * 0.12) * Math.min(1, (look.sigma * 3) / outer), 0, 1);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1, outer - inner);
    ctx.beginPath();
    ctx.arc(x, y, (outer + inner) / 2, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const radius = Math.min(60, Math.max(0.8, look.sigma * (0.7 + Math.min(e, 6) * 0.3) * bloom));
  const alpha = Math.min(1, 0.32 + e * 0.15);

  if (length > 1) {
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(alpha * Math.max(0.25, Math.min(1, (radius * 2.5) / length))).toFixed(3)})`;
    ctx.lineWidth = radius * 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - look.streak.x / 2, y - look.streak.y / 2);
    ctx.lineTo(x + look.streak.x / 2, y + look.streak.y / 2);
    ctx.stroke();
    return;
  }

  const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
  halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`);
  halo.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${(alpha * 0.35).toFixed(3)})`);
  halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
  ctx.fill();
  if (e > 8) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const still: Look = { sigma, donut: 0, obstruction: 0, streak: { x: 0, y: 0 } };
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
        drawStar(ctx, Math.cos(t) * r, Math.sin(t) * r, 1 + random() * 3.5, 0.6, still);
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
        drawStar(ctx, Math.cos(t) * r, Math.sin(t) * r, 2 + random() * 6, 0.3 + random() * 0.4, still);
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
