'use client';

import { useEffect, useRef } from 'react';
import {
  CLOUD_WIND,
  cloudOpacity,
  scintillation,
  seeingAtAltitude,
  skySurfaceBrightness,
  tipTiltArcsec,
  twilightFraction,
} from '@/lib/observatory-sim/atmosphere';
import { skyElectronsFromSurface } from '@/lib/observatory-sim/camera';
import { drawLiveScene, drawNoise, makeGrainTiles, type FrameInputs, type LiveScene } from '@/lib/observatory-sim/render';
import { angularSeparation, type AltAz } from '@/lib/observatory-sim/safety';
import { faintestStar, sensorLevels, starPeakLin } from '@/lib/observatory-sim/sensor';
import { altAzToRaDec, raDecToAltAz, tangentOffsetDeg, type SkyObject } from '@/lib/observatory-sim/sky-field';

export type MountSample = {
  pointing: AltAz;
  lstHours: number;
  nowMs: number;
  /** Where the image sits from the encoders' pointing: tracking error and ringing, degrees. */
  imageOffset: { alt: number; az: number };
  /** The mount is slewing or settling: a sub that spans the stop is a smear. */
  moving: boolean;
};

export type Exposure = {
  /** When the running exposure began, and how long it runs. */
  startedAtMs: number;
  seconds: number;
};

export type LiveViewProps = {
  /** Read once per animation frame: where the tube is and what sidereal time it is. */
  sample: () => MountSample;
  /** Everything real near the pointing, refreshed a few times a second. */
  objects: SkyObject[];
  latDeg: number;
  sunAltitudeDeg: number;
  /** The Moon tonight: where it is and how much of it is lit; null when it is down. */
  moon: { altitudeDeg: number; azimuthDeg: number; fraction: number } | null;
  exposureSec: number;
  fovArcmin: number;
  /** The night's seeing at the zenith right now, arcseconds FWHM. */
  seeingArcsec: number;
  diffractionArcsec: number;
  plateScaleArcsecPx: number;
  apertureMm: number;
  obstruction: number;
  defocus: number;
  bortle: number;
  /** The forecast's cloud cover, 0–1: the cloud the field drifts through. */
  cloudCover: number;
  /** Dew on the corrector, 0–1. */
  dew: number;
  edgeIllumination: number;
  /** Subs in the stack shown; 1 when not stacking. */
  subs: number;
  gain: number;
  /** Called when a sub finishes, with the fraction of the next already exposed. */
  onExposure?: (progress: number) => void;
  /** The displayed frame's brightness histogram, 32 bins, a couple of times a second. */
  onHistogram?: (bins: number[]) => void;
};

/** Frames shorter than this are shown as they come; longer ones land when they end. */
const VIDEO_RATE_S = 1 / 30;
/** The plate-solve frame's exposure: what shows while the first long sub integrates. */
const PREVIEW_S = 1;

/**
 * The camera's live view: one canvas, drawn by the sky model from the mount's pointing.
 * A frame takes its exposure time (ADR-054 §3): the canvas shows the last completed sub
 * and the next lands when its exposure ends, with the sky's motion across the sensor
 * during that exposure drawn as its trail. At video rates the canvas simply follows.
 */
export default function LiveView(props: LiveViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(new Map<string, HTMLImageElement>());
  const grainRef = useRef<HTMLCanvasElement[]>([]);
  // The draw loop reads the newest props without being torn down on every render.
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    grainRef.current = makeGrainTiles();
    let frame = 0;
    let running = true;
    let lastHistogram = 0;
    const hist = document.createElement('canvas');
    hist.width = 64;
    hist.height = 36;
    const histCtx = hist.getContext('2d', { willReadFrequently: true });
    // The exposure in progress: when it began, and where the sky was then.
    let exposure: { startedAtMs: number; seconds: number; start: MountSample } | null = null;
    let lastDrawnKey = '';
    let wasMoving = false;

    const image = (src: string): HTMLImageElement | null => {
      const cached = imagesRef.current.get(src);
      if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;
      const el = new Image();
      el.decoding = 'async';
      el.src = src;
      imagesRef.current.set(src, el);
      return null;
    };

    /**
     * How far a sky point at the centre moved across the sensor between two samples,
     * degrees: the mount's motion, and the tracking error and ringing the encoders miss,
     * which trail a long sub as they would on an unguided mount.
     */
    const driftBetween = (a: MountSample, b: MountSample, p: LiveViewProps) => {
      const eq = altAzToRaDec(a.pointing, p.latDeg, a.lstHours);
      const later = raDecToAltAz(eq, p.latDeg, b.lstHours);
      const d = tangentOffsetDeg(b.pointing, later);
      const steady = 1 / Math.sqrt(Math.max(1, p.subs));
      const cosAlt = Math.cos((b.pointing.altitude * Math.PI) / 180);
      return {
        x: d.x - (b.imageOffset.az - a.imageOffset.az) * cosAlt * steady,
        y: d.y - (b.imageOffset.alt - a.imageOffset.alt) * steady,
      };
    };

    const draw = (p: LiveViewProps, at: MountSample, drift: { x: number; y: number }, width: number, height: number, time: number) => {
      // The stack aligns its frames: tracking error and ringing shrink as it grows.
      const steady = 1 / Math.sqrt(Math.max(1, p.subs));
      const alt = at.pointing.altitude + at.imageOffset.alt * steady;
      const cosAlt = Math.max(0.05, Math.cos((alt * Math.PI) / 180));
      const pointing = { altitude: alt, azimuth: at.pointing.azimuth + (at.imageOffset.az * steady) / cosAlt };
      const arcsecPerPx = (p.fovArcmin * 60) / width;
      const seeing = seeingAtAltitude(p.seeingArcsec, alt);
      const skyMag = skySurfaceBrightness({
        bortle: p.bortle,
        sunAltitudeDeg: p.sunAltitudeDeg,
        moon: p.moon ? { altitudeDeg: p.moon.altitudeDeg, fraction: p.moon.fraction, separationDeg: angularSeparation(pointing, { altitude: p.moon.altitudeDeg, azimuth: p.moon.azimuthDeg }) } : null,
        altitudeDeg: alt,
        cloud: 0,
      });
      const levels = sensorLevels({ exposureS: p.exposureSec, gain: p.gain, subs: p.subs, skyEPerS: skyElectronsFromSurface(skyMag, p.plateScaleArcsecPx, p.apertureMm) });
      const peakAtMag0 = starPeakLin(0, seeing, p.plateScaleArcsecPx, p.apertureMm, p.exposureSec, p.gain);
      const halfW = p.fovArcmin / 120;
      const halfH = (halfW * height) / width;
      const cloudAt = (dAlt: number, dAz: number) => cloudOpacity({ altitude: alt + dAlt, azimuth: pointing.azimuth + dAz / cosAlt }, at.nowMs, p.cloudCover);
      // The cloud layer's drift across the sensor: its angular speed falls off toward the horizon.
      const cloudPx = (1 - cosAlt * cosAlt) * (180 / Math.PI) * (width / (p.fovArcmin / 60)) * (at.nowMs / 1000);
      const tilt = tipTiltArcsec(seeing, p.exposureSec, frame);
      const inputs: FrameInputs = {
        width,
        height,
        fovArcmin: p.fovArcmin,
        seeingArcsec: seeing,
        diffractionArcsec: p.diffractionArcsec,
        obstruction: p.obstruction,
        defocus: p.defocus,
        subs: p.subs,
        gain: p.gain,
        exposureSec: p.exposureSec,
        edgeIllumination: p.edgeIllumination,
        plateScaleArcsecPx: p.plateScaleArcsecPx,
        apertureMm: p.apertureMm,
        levels,
        peakAtMag0,
        limitMag: faintestStar(levels, peakAtMag0),
        twilight: twilightFraction(p.sunAltitudeDeg),
        cloud: p.cloudCover > 0.001
          ? { centre: cloudAt(0, 0), right: cloudAt(0, halfW), top: cloudAt(halfH, 0), driftPx: { x: -CLOUD_WIND.u * cloudPx, y: CLOUD_WIND.v * cloudPx } }
          : { centre: 0, right: 0, top: 0, driftPx: { x: 0, y: 0 } },
        dew: p.dew,
        scintillation: scintillation(alt, p.exposureSec, p.apertureMm),
        tilt: { x: (tilt.x * steady) / arcsecPerPx, y: (tilt.y * steady) / arcsecPerPx },
      };
      const scene: LiveScene = {
        pointing,
        drift,
        latDeg: p.latDeg,
        lstHours: at.lstHours,
        objects: p.objects,
        image,
      };
      drawLiveScene(ctx, inputs, frame, scene);
      drawNoise(ctx, inputs, grainRef.current, frame);
      if (histCtx && p.onHistogram && time - lastHistogram > 500) {
        lastHistogram = time;
        histCtx.drawImage(canvas, 0, 0, hist.width, hist.height);
        const { data } = histCtx.getImageData(0, 0, hist.width, hist.height);
        const bins = new Array<number>(32).fill(0);
        for (let i = 0; i < data.length; i += 4) {
          bins[Math.min(31, Math.floor((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 8))] += 1;
        }
        p.onHistogram(bins);
      }
    };

    const render = (time: number) => {
      if (!running) return;
      frame += 1;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round((rect.width * 9) / 16);
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        lastDrawnKey = '';
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const p = latest.current;
      const now = p.sample();
      const seconds = Math.max(p.exposureSec, VIDEO_RATE_S);

      // A new sub starts when the mount comes to rest, as capture software restarts one
      // after a slew: the first frame on target is the target, not the slew's smear.
      const settled = wasMoving && !now.moving;
      if (!exposure || exposure.seconds !== seconds || settled) {
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
      }
      wasMoving = now.moving;
      if (seconds > VIDEO_RATE_S * 2 && (settled || lastDrawnKey === '')) {
        // Until the first full sub lands, the short frame the solve and centring took is
        // what is on screen: the target from the first moment, fainter than the sub to come.
        draw({ ...p, exposureSec: Math.min(p.exposureSec, PREVIEW_S), subs: 1 }, now, { x: 0, y: 0 }, width, height, time);
        lastDrawnKey = 'preview';
      }
      const elapsed = (now.nowMs - exposure.startedAtMs) / 1000;
      if (seconds <= VIDEO_RATE_S * 2) {
        // Video rate: every animation frame is a sub; its trail is the motion since the last.
        const drift = driftBetween(exposure.start, now, p);
        draw(p, now, drift, width, height, time);
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
        p.onExposure?.(1);
        requestAnimationFrame(render);
        return;
      }

      if (elapsed >= seconds) {
        // The sub ends: draw it as the sensor integrated it, from where the sky was at
        // its start to where it is now, then begin the next.
        const drift = driftBetween(exposure.start, now, p);
        draw(p, now, drift, width, height, time);
        lastDrawnKey = `${now.nowMs}`;
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
        p.onExposure?.(0);
      } else {
        p.onExposure?.(elapsed / seconds);
      }
      requestAnimationFrame(render);
    };

    const handle = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(handle);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full rounded-lg"
      style={{ aspectRatio: '16 / 9', background: '#05070c' }}
      role="img"
      aria-label="Simulated telescope camera view"
    />
  );
}
