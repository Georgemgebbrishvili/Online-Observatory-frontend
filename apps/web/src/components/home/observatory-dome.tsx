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
 * something moves, and draws nothing where WebGL is unavailable. With no sky to follow
 * (a phone), the telescope looks around on its own.
 */
export function ObservatoryDome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: ObservatoryScene | null = null;
    let dead = false;
    let heard = false;
    let idleTimer = 0;
    let idleStep = 0;
    let size = { w: 1, h: 1 };
    let pending: SkyAim | null = null;

    const layout = () => {
      const rect = hero.getBoundingClientRect();
      size = { w: Math.max(1, rect.width), h: Math.max(1, rect.height) };
      // The building's height on screen, and its foot above the hero's bottom edge.
      const r = Math.max(52, Math.min(118, size.w * 0.075, size.h * 0.13));
      scene?.resize(size.w, size.h, r * 2.35, r * 0.35);
    };

    const onAim = (event: Event) => {
      const { x, y } = (event as CustomEvent<SkyAim>).detail;
      heard = true;
      if (scene) scene.aim(x, y);
      else pending = { x, y };
    };

    const idle = () => {
      if (!heard && !reduced && scene) {
        const spots = [
          [0.3, 0.2],
          [0.64, 0.14],
          [0.8, 0.32],
          [0.42, 0.3],
        ];
        const [sx, sy] = spots[idleStep++ % spots.length];
        scene.aim(sx * size.w, sy * size.h);
      }
      idleTimer = window.setTimeout(idle, 4600);
    };

    const ro = new ResizeObserver(layout);

    // The scene waits for the page: three.js loads once the browser is idle, the scene is
    // built in short steps and its shaders off the main thread, and it shows only once it
    // can draw without a stall. Where it cannot be built (no GPU), nothing is drawn.
    hero.addEventListener(skyAimEvent, onAim);
    const start = () =>
      import("@/components/home/observatory-scene")
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
        requestIdleCallback(start, { timeout: 1200 });
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
