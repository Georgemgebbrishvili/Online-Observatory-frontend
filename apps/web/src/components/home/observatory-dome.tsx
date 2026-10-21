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
      scene?.aim(x, y);
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

    import("@/components/home/observatory-scene")
      .then(({ createObservatoryScene }) => {
        if (dead) return;
        try {
          scene = createObservatoryScene(canvas, { reduced });
        } catch {
          return;
        }
        canvas.dataset.ready = "";
        layout();
        ro.observe(hero);
        hero.addEventListener(skyAimEvent, onAim);
        idleTimer = window.setTimeout(idle, 1800);
      })
      .catch(() => {});

    return () => {
      dead = true;
      clearTimeout(idleTimer);
      ro.disconnect();
      hero.removeEventListener(skyAimEvent, onAim);
      scene?.dispose();
    };
  }, []);

  return <canvas className="observatory-dome" ref={canvasRef} aria-hidden="true" />;
}
