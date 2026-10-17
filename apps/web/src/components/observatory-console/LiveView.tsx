'use client';

import { useEffect, useRef } from 'react';
import { frameNoise, skyElectronsPerSecond } from '@/lib/observatory-sim/camera';
import { drawLiveScene, drawNoise, makeNoiseTile, type FrameInputs, type LiveScene } from '@/lib/observatory-sim/render';
import { altAzToRaDec, raDecToAltAz, tangentOffsetDeg, type SkyObject } from '@/lib/observatory-sim/sky-field';
import type { AltAz } from '@/lib/observatory-sim/safety';

export type MountSample = { pointing: AltAz; lstHours: number; nowMs: number };

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
  exposureSec: number;
  fovArcmin: number;
  seeingArcsec: number;
  diffractionArcsec: number;
  plateScaleArcsecPx: number;
  apertureMm: number;
  obstruction: number;
  defocus: number;
  bortle: number;
  moonlight: number;
  cloud: number;
  edgeIllumination: number;
  /** Subs in the stack shown; 1 when not stacking. */
  subs: number;
  gain: number;
  /** Called when a sub finishes, with the fraction of the next already exposed. */
  onExposure?: (progress: number) => void;
};

/** Frames shorter than this are shown as they come; longer ones land when they end. */
const VIDEO_RATE_S = 1 / 30;

/**
 * The camera's live view: one canvas, drawn by the sky model from the mount's pointing.
 * A frame takes its exposure time (ADR-054 §3): the canvas shows the last completed sub
 * and the next lands when its exposure ends, with the sky's motion across the sensor
 * during that exposure drawn as its trail. At video rates the canvas simply follows.
 */
export default function LiveView(props: LiveViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef(new Map<string, HTMLImageElement>());
  const noiseRef = useRef<HTMLCanvasElement | null>(null);
  // The draw loop reads the newest props without being torn down on every render.
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    noiseRef.current = makeNoiseTile();
    let frame = 0;
    let running = true;
    let lastNoiseSwap = 0;
    // The exposure in progress: when it began, and where the sky was then.
    let exposure: { startedAtMs: number; seconds: number; start: MountSample } | null = null;
    let lastDrawnKey = '';

    const image = (src: string): HTMLImageElement | null => {
      const cached = imagesRef.current.get(src);
      if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null;
      const el = new Image();
      el.decoding = 'async';
      el.src = src;
      imagesRef.current.set(src, el);
      return null;
    };

    /** How far a sky point at the centre moved across the sensor between two samples, degrees. */
    const driftBetween = (a: MountSample, b: MountSample, latDeg: number) => {
      const eq = altAzToRaDec(a.pointing, latDeg, a.lstHours);
      const later = raDecToAltAz(eq, latDeg, b.lstHours);
      const d = tangentOffsetDeg(b.pointing, later);
      return { x: d.x, y: d.y };
    };

    const draw = (p: LiveViewProps, at: MountSample, drift: { x: number; y: number }, width: number, height: number, time: number) => {
      const skyE = skyElectronsPerSecond(p.bortle, p.plateScaleArcsecPx, p.apertureMm);
      const noise = frameNoise(p.exposureSec, p.gain, skyE, p.subs);
      const inputs: FrameInputs = {
        width,
        height,
        fovArcmin: p.fovArcmin,
        seeingArcsec: p.seeingArcsec,
        diffractionArcsec: p.diffractionArcsec,
        obstruction: p.obstruction,
        defocus: p.defocus,
        bortle: p.bortle,
        moonlight: p.moonlight,
        cloud: p.cloud,
        subs: p.subs,
        gain: p.gain,
        exposureSec: p.exposureSec,
        edgeIllumination: p.edgeIllumination,
      };
      const scene: LiveScene = {
        pointing: at.pointing,
        drift,
        latDeg: p.latDeg,
        lstHours: at.lstHours,
        objects: p.objects,
        image,
        sunAltitudeDeg: p.sunAltitudeDeg,
      };
      drawLiveScene(ctx, inputs, frame, scene);
      if (noiseRef.current && time - lastNoiseSwap > 180) {
        noiseRef.current = makeNoiseTile();
        lastNoiseSwap = time;
      }
      if (noiseRef.current) drawNoise(ctx, inputs, noiseRef.current, noise.display);
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

      if (!exposure || exposure.seconds !== seconds) {
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
      }
      const elapsed = (now.nowMs - exposure.startedAtMs) / 1000;
      if (seconds <= VIDEO_RATE_S * 2) {
        // Video rate: every animation frame is a sub; its trail is the motion since the last.
        const drift = driftBetween(exposure.start, now, p.latDeg);
        draw(p, now, drift, width, height, time);
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
        p.onExposure?.(1);
        requestAnimationFrame(render);
        return;
      }

      if (elapsed >= seconds) {
        // The sub ends: draw it as the sensor integrated it, from where the sky was at
        // its start to where it is now, then begin the next.
        const drift = driftBetween(exposure.start, now, p.latDeg);
        draw(p, now, drift, width, height, time);
        lastDrawnKey = `${now.nowMs}`;
        exposure = { startedAtMs: now.nowMs, seconds, start: now };
        p.onExposure?.(0);
      } else {
        if (lastDrawnKey === '') {
          // Nothing has landed yet: the sensor is dark until the first sub ends.
          ctx.fillStyle = '#05070c';
          ctx.fillRect(0, 0, width, height);
          lastDrawnKey = 'dark';
        }
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
