"use client";

import { useEffect, useRef } from "react";

import type { ObservatoryScene } from "@/components/home/observatory-scene";

/** The sky reveal says where its light is, in hero coordinates, every frame it moves. */
export type SkyAim = { x: number; y: number };
export const skyAimEvent = "sky-aim";

/**
 * The observatory at the foot of the homepage sky (ADR-057): a 3D dome on a hill above
 * Tbilisi whose NexStar 8SE turns to wherever the sky's light rests, so the instrument
 * looks at what the pointer reveals. The scene loads after the page, renders only while
 * something moves, and draws nothing where WebGL is unavailable. On a touch screen it
 * ignores taps: from time to time it turns right, back to the middle, then left, on its
 * own, as a telescope at work does.
 */
export function ObservatoryDome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch =
      matchMedia("(hover: none)").matches || matchMedia("(max-width: 29.999rem)").matches;
    let scene: ObservatoryScene | null = null;
    let dead = false;
    let heard = false;
    let idleTimer = 0;
    let idleStep = 0;
    // Its rounds on its own: the middle, right, the middle, left, each held a while.
    const poses = [
      { az: 4, alt: 70, hold: 3600 },
      { az: 52, alt: 36, hold: 4400 },
      { az: -3, alt: 64, hold: 3400 },
      { az: -50, alt: 44, hold: 4800 },
    ];
    let size = { w: 1, h: 1 };
    let pending: SkyAim | null = null;

    const layout = () => {
      const rect = hero.getBoundingClientRect();
      size = { w: Math.max(1, rect.width), h: Math.max(1, rect.height) };
      // The building's height on screen, and its foot above the hero's bottom edge: on a
      // phone it stands at the very foot, clear of the button.
      const r = Math.max(52, Math.min(118, size.w * 0.075, size.h * 0.13));
      scene?.resize(size.w, size.h, r * 2.35, size.w < 480 ? r * 0.04 : r * 0.35);
    };

    const onAim = (event: Event) => {
      if (touch) return;
      const { x, y } = (event as CustomEvent<SkyAim>).detail;
      heard = true;
      if (scene) scene.aim(x, y);
      else pending = { x, y };
    };

    const idle = () => {
      const next = poses[idleStep++ % poses.length];
      if (!heard && !reduced && scene) scene.pose(next.az, next.alt);
      // A little unevenness, so the rounds never feel like a metronome.
      idleTimer = window.setTimeout(idle, next.hold + Math.random() * 1200);
    };

    const ro = new ResizeObserver(layout);

    // three.js downloads at once, beside the page; the scene is built once the page has
    // loaded and the browser is idle, in short steps with its shaders off the main thread,
    // and shows only once it can draw without a stall. Where it cannot be built (no GPU),
    // nothing is drawn.
    hero.addEventListener(skyAimEvent, onAim);
    const loading = import("@/components/home/observatory-scene");
    loading.catch(() => {});
    const start = () =>
      loading
        .then(async ({ createObservatoryScene }) => {
          if (dead) return;
          const made = await createObservatoryScene(canvas, { reduced });
          if (dead) return made.dispose();
          scene = made;
          layout();
          if (pending) scene.aim(pending.x, pending.y);
          ro.observe(hero);
          canvas.dataset.ready = "";
          idleTimer = window.setTimeout(idle, 1800);
        })
        .catch(() => {});
    const whenIdle = () => {
      if (typeof requestIdleCallback === "function")
        requestIdleCallback(start, { timeout: 400 });
      else setTimeout(start, 200);
    };
    if (document.readyState === "complete") whenIdle();
    else addEventListener("load", whenIdle, { once: true });

    return () => {
      dead = true;
      removeEventListener("load", whenIdle);
      clearTimeout(idleTimer);
      ro.disconnect();
      hero.removeEventListener(skyAimEvent, onAim);
      scene?.dispose();
    };
  }, []);

  return <canvas className="observatory-dome" ref={canvasRef} aria-hidden="true" />;
}
