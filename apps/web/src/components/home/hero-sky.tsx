"use client";

import { useEffect, useRef } from "react";

import { palette } from "@/styles/tokens";

type Star = { x: number; y: number; r: number; depth: number; phase: number; speed: number; warm: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

/** A small seeded generator, so the field is the same on every load. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * ADR-100: the hero's night. A drawn star field in three depths that leans away from the
 * pointer and drifts as the page scrolls, each star breathing at its own pace, and now and
 * then a meteor. It also hands the pointer to the hero as --tilt-x/--tilt-y, so the planet
 * leans the other way. Reduced motion draws it once and holds it.
 */
export function HeroSky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.closest<HTMLElement>(".home-hero");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = seeded(20261124);
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let width = 0;
    let height = 0;
    let ratio = 1;
    const aim = { x: 0, y: 0 };
    const lean = { x: 0, y: 0 };
    let raf = 0;
    let visible = true;

    const layout = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const count = Math.round(Math.min(420, (width * height) / 4200));
      stars = Array.from({ length: count }, () => {
        const depth = random() < 0.62 ? 0.25 : random() < 0.8 ? 0.6 : 1;
        return {
          x: random() * width,
          y: random() * height,
          r: (random() * 0.7 + 0.35) * (0.6 + depth * 0.9),
          depth,
          phase: random() * Math.PI * 2,
          speed: 0.4 + random() * 1.4,
          warm: random() < 0.28,
        };
      });
    };

    const draw = (time: number) => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const drift = window.scrollY * 0.12;
      for (const star of stars) {
        const shift = star.depth * 14;
        let x = star.x - lean.x * shift;
        let y = star.y - lean.y * shift - drift * star.depth;
        y = ((y % height) + height) % height;
        x = ((x % width) + width) % width;
        const twinkle = still ? 0.8 : 0.55 + 0.45 * Math.sin(time * 0.001 * star.speed + star.phase);
        ctx.globalAlpha = (0.25 + star.depth * 0.6) * twinkle;
        ctx.fillStyle = star.warm ? palette.starWarm : palette.starCool;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.depth === 1 && star.r > 1.2) {
          ctx.globalAlpha *= 0.18;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (meteor) {
        const tail = 90;
        const length = Math.hypot(meteor.vx, meteor.vy);
        const gradient = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - (meteor.vx / length) * tail,
          meteor.y - (meteor.vy / length) * tail,
        );
        gradient.addColorStop(0, palette.flare);
        gradient.addColorStop(1, "transparent");
        ctx.globalAlpha = Math.min(1, meteor.life * 2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - (meteor.vx / length) * tail, meteor.y - (meteor.vy / length) * tail);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (time: number) => {
      raf = 0;
      lean.x += (aim.x - lean.x) * 0.06;
      lean.y += (aim.y - lean.y) * 0.06;
      hero.style.setProperty("--tilt-x", lean.x.toFixed(3));
      hero.style.setProperty("--tilt-y", lean.y.toFixed(3));

      if (!meteor && random() < 0.0016) {
        meteor = { x: width * (0.3 + random() * 0.7), y: height * random() * 0.4, vx: -7 - random() * 4, vy: 3 + random() * 2, life: 1 };
      }
      if (meteor) {
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.018;
        if (meteor.life <= 0) meteor = null;
      }

      draw(time);
      if (visible) raf = window.requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      aim.x = (event.clientX / window.innerWidth - 0.5) * 2;
      aim.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    layout();
    if (still) {
      draw(0);
      const onResize = () => {
        layout();
        draw(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = window.requestAnimationFrame(tick);
    });
    observer.observe(hero);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", layout);
    raf = window.requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", layout);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="home-hero-sky" aria-hidden="true" />;
}
