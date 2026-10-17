"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { skyPlates, type SkyPlate } from "@/features/targets/homepage-data";
import type { Locale } from "@/i18n/config";
import { palette, withAlpha } from "@/styles/tokens";

type SkyRevealProps = {
  locale: Locale;
  names: Record<SkyPlate, string>;
  copy: {
    label: string;
    explore: string;
    tap: string;
    foundBefore: string;
    foundAfter: string;
    illustration: string;
  };
};

type Live = {
  slug: SkyPlate;
  name: string;
  x: number;
  y: number;
  s: number;
  feather: number;
  bmp?: HTMLCanvasElement;
  ar: number;
  cx: number;
  cy: number;
  r: number;
  h: number;
  found: boolean;
  lit: boolean;
  litAt: number;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The black sky behind the homepage words, as the Skychaser site draws its own: our drawn
 * plates sit in it unseen; the pointer reveals the one beneath it, which ignites, settles
 * and is named. One canvas, redrawn only while something still moves. With no pointer the
 * sky tours its plates on its own. A phone has no sky: the hero is the words and the
 * button. Every plate is an illustration, and the sky says so beneath it.
 */
export function SkyReveal({ copy, locale, names }: SkyRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLCanvasElement>(null);
  const foundRef = useRef<HTMLElement>(null);
  const verbRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const starsCanvas = starsRef.current;
    const foundEl = foundRef.current;
    const hero = root?.parentElement;
    if (
      !root ||
      !canvas ||
      !starsCanvas ||
      !foundEl ||
      !hero ||
      matchMedia("(max-width: 29.999rem)").matches
    )
      return;
    const ctx = canvas.getContext("2d", { desynchronized: true });
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverless = matchMedia("(hover: none)").matches;
    const objects: Live[] = skyPlates.map((plate) => ({
      ...plate,
      name: names[plate.slug],
      ar: 1,
      cx: 0,
      cy: 0,
      r: 0,
      h: 0,
      found: false,
      lit: false,
      litAt: 0,
    }));

    let W = 1;
    let H = 1;
    let dpr = 1;
    let R = 120;
    let labelFont = "300 24px sans-serif";
    // The live layer only clears what it drew last frame.
    let dirty: number[] = [];
    let wasDirty: number[] = [];
    const mark = (x: number, y: number, w: number, h: number) => {
      dirty.push(x, y, w, h);
    };
    const tgt = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let gain = 0;
    let gainTgt = 0;
    let found = 0;
    let raf = 0;
    let last = 0;
    let activeUntil = 0;
    let visible = true;
    let dead = false;
    let touring = false;
    let tourIdx = 0;
    let tourTimer = 0;
    let rectCache: DOMRect | null = null;
    let target = "";
    let swallowClick = false;

    // Each plate feathered into the black once, kept as a bitmap.
    for (const o of objects) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (dead) return;
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext("2d");
        if (!g) return;
        g.drawImage(img, 0, 0);
        g.globalCompositeOperation = "destination-in";
        g.save();
        g.translate(c.width / 2, c.height / 2);
        g.scale(c.width / 2, c.height / 2);
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0, withAlpha(palette.black, 1));
        grad.addColorStop(o.feather, withAlpha(palette.black, 1));
        grad.addColorStop(1, withAlpha(palette.black, 0));
        g.fillStyle = grad;
        g.fillRect(-1, -1, 2, 2);
        g.restore();
        o.bmp = c;
        o.ar = c.width / c.height;
        wake();
      };
      img.src = `/sky/${o.slug}.webp`;
    }

    function buildStars() {
      starsCanvas!.width = W * dpr;
      starsCanvas!.height = H * dpr;
      const g = starsCanvas!.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const n = Math.round((W * H) / 2100);
      for (let i = 0; i < n; i++) {
        const x = rnd() * W;
        const y = rnd() * H;
        const m = rnd();
        const r = m > 0.97 ? 1.6 : m > 0.8 ? 1 : 0.6;
        const a = m > 0.97 ? 0.95 : 0.25 + rnd() * 0.5;
        g.fillStyle =
          rnd() < 0.22 ? withAlpha(palette.starWarm, a) : withAlpha(palette.starCool, a);
        g.beginPath();
        g.arc(x, y, r, 0, 6.2832);
        g.fill();
        if (m > 0.985) {
          g.strokeStyle = withAlpha(palette.flare, a * 0.5);
          g.lineWidth = 0.6;
          g.beginPath();
          g.moveTo(x - 6, y);
          g.lineTo(x + 6, y);
          g.moveTo(x, y - 6);
          g.lineTo(x, y + 6);
          g.stroke();
        }
      }
    }

    function layout() {
      const rect = root!.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      // Never more than ~3.2 megapixels per layer, whatever the screen.
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.2e6 / (W * H)));
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      wasDirty = [0, 0, W, H];
      labelFont = `300 24px ${getComputedStyle(root!).getPropertyValue("--font-label").trim() || "sans-serif"}`;
      // The reach of the light: wide enough that pointing near a plate shows most of it.
      R = Math.max(170, Math.min(300, W * 0.17));
      const base = Math.min(W, H * 1.6);
      for (const o of objects) {
        o.cx = o.x * W;
        o.cy = o.y * H;
        o.r = (o.s * base) / 2;
      }
      buildStars();
      wake();
    }

    function wake() {
      if (!raf && visible && !dead) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    function frame(now: number) {
      raf = 0;
      const dt = Math.min(now - last, 48);
      last = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt / 45);
      cur.x += (tgt.x - cur.x) * k;
      cur.y += (tgt.y - cur.y) * k;
      gain += (gainTgt - gain) * (reduced ? 1 : 1 - Math.exp(-dt / 90));
      draw(now);
      const moving =
        Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.25 ||
        Math.abs(gainTgt - gain) > 0.004 ||
        now < activeUntil;
      if (moving) raf = requestAnimationFrame(frame);
    }

    function draw(now: number) {
      const c = ctx!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < wasDirty.length; i += 4)
        c.clearRect(
          wasDirty[i] - 2,
          wasDirty[i + 1] - 2,
          wasDirty[i + 2] + 4,
          wasDirty[i + 3] + 4,
        );
      dirty = [];

      if (gain > 0.01) {
        const lg = c.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, R * 1.4);
        lg.addColorStop(0, withAlpha(palette.cream, 0.07 * gain));
        lg.addColorStop(0.5, withAlpha(palette.cream, 0.02 * gain));
        lg.addColorStop(1, withAlpha(palette.black, 0));
        c.fillStyle = lg;
        c.fillRect(cur.x - R * 1.4, cur.y - R * 1.4, R * 2.8, R * 2.8);
        mark(cur.x - R * 1.4, cur.y - R * 1.4, R * 2.8, R * 2.8);
      }

      let nearest: Live | null = null;
      let nearestA = 0;
      for (const o of objects) {
        if (!o.bmp) continue;
        const d = Math.hypot(cur.x - o.cx, cur.y - o.cy);
        const inner = o.r * 0.9 + 24;
        let a = d <= inner ? 1 : 1 - (d - inner) / R;
        a = a <= 0 ? 0 : Math.pow(smooth(Math.min(1, a)), 0.7) * gain;
        if (a > 0.9 && !o.found) {
          o.found = true;
          found++;
          foundEl!.textContent = String(found);
        }
        if (a > 0.3 && !o.lit) {
          o.lit = true;
          o.litAt = now;
          activeUntil = Math.max(activeUntil, now + 1000);
        }
        if (a < 0.08) o.lit = false;
        const alpha = Math.max(o.found ? 0.035 : 0, a);
        if (alpha < 0.004) continue;
        const t = o.lit ? Math.min(1, (now - o.litAt) / 900) : 1;
        const pop = 1 - Math.pow(1 - t, 3);
        const sc = (0.84 + 0.16 * pop) * (0.96 + 0.04 * a);
        const w = (o.ar >= 1 ? o.r * 2 : o.r * 2 * o.ar) * sc;
        const h = (o.ar >= 1 ? (o.r * 2) / o.ar : o.r * 2) * sc;
        c.globalAlpha = alpha;
        c.drawImage(o.bmp, o.cx - w / 2, o.cy - h / 2, w, h);
        mark(o.cx - w / 2, o.cy - h / 2, w, h);
        if (o.lit && t < 1) {
          // Ignition: a bloom of light and a moment of overexposure that settles.
          const br = o.r * (0.9 + t * 1.1);
          const fg = c.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, br);
          fg.addColorStop(0, withAlpha(palette.bloomHot, (1 - t) * 0.38 * a));
          fg.addColorStop(0.4, withAlpha(palette.bloomWarm, (1 - t) * 0.12 * a));
          fg.addColorStop(1, withAlpha(palette.black, 0));
          c.fillStyle = fg;
          c.fillRect(o.cx - br, o.cy - br, br * 2, br * 2);
          mark(o.cx - br, o.cy - br, br * 2, br * 2);
          c.globalCompositeOperation = "lighter";
          c.globalAlpha = (1 - t) * 0.7 * a;
          c.drawImage(o.bmp, o.cx - w / 2, o.cy - h / 2, w, h);
          c.globalCompositeOperation = "source-over";
        }
        c.globalAlpha = 1;
        o.h = h;
        if (a > nearestA) {
          nearestA = a;
          nearest = o;
        }
      }

      const next = nearest && nearestA > 0.85 ? nearest.slug : "";
      if (next !== target) {
        target = next;
        root!.style.cursor = target ? "pointer" : "";
      }
      if (nearest && nearestA > 0.35) {
        const o: Live = nearest;
        const la = (nearestA - 0.35) / 0.65;
        const below = o.cy + o.h / 2 + 30 < H - 12;
        const ty = below ? o.cy + o.h / 2 + 26 : o.cy - o.h / 2 - 22;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.letterSpacing = "0.04em";
        c.font = labelFont;
        c.fillStyle = withAlpha(palette.cream, 0.96 * la);
        const lx = Math.min(W - 80, Math.max(80, o.cx));
        c.fillText(o.name, lx, ty);
        const tw = c.measureText(o.name).width;
        mark(lx - tw / 2 - 8, ty - 18, tw + 16, 36);
        c.letterSpacing = "0px";
      }
      wasDirty = dirty;
    }

    function point(e: PointerEvent) {
      const r = rectCache || (rectCache = root!.getBoundingClientRect());
      tgt.x = e.clientX - r.left;
      tgt.y = Math.min(H, Math.max(0, e.clientY - r.top));
    }
    function startTour(delay: number) {
      stopTour();
      touring = true;
      const step = () => {
        const o = objects[tourIdx % objects.length];
        tourIdx++;
        tgt.x = o.cx;
        tgt.y = o.cy;
        gainTgt = 1;
        wake();
        tourTimer = window.setTimeout(step, 2600);
      };
      tourTimer = window.setTimeout(step, delay);
    }
    function stopTour() {
      if (touring) {
        touring = false;
        clearTimeout(tourTimer);
      }
    }

    // A mouse explores by moving; a finger taps. A tap sends the light to the nearest
    // plate; a second tap on the lit one opens its target. Swipes still scroll the page.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      stopTour();
      point(e);
      gainTgt = 1;
      wake();
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      rectCache = null;
      point(e);
      gainTgt = 1;
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      gainTgt = 0;
      wake();
      if (hoverless) startTour(2200);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      rectCache = null;
      const r = root!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let near: Live | null = null;
      let best = Infinity;
      for (const o of objects) {
        const d = Math.hypot(x - o.cx, y - o.cy) - o.r;
        if (d < best) {
          best = d;
          near = o;
        }
      }
      if (!near) return;
      if (target === near.slug && Math.hypot(cur.x - near.cx, cur.y - near.cy) < near.r) {
        swallowClick = false;
        return;
      }
      swallowClick = true;
      stopTour();
      tgt.x = near.cx;
      tgt.y = near.cy;
      gainTgt = 1;
      wake();
      startTour(6000);
    };
    const onClick = () => {
      if (swallowClick) {
        swallowClick = false;
        return;
      }
      if (target) router.push(`/${locale}/app/missions/${target}`);
    };
    const onScroll = () => {
      rectCache = null;
    };
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerenter", onEnter);
    hero.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("click", onClick);
    addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      rectCache = null;
      layout();
    });
    ro.observe(root);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        if (visible) wake();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(hero);
    const onVis = () => {
      visible = !document.hidden;
      if (visible) wake();
    };
    document.addEventListener("visibilitychange", onVis);

    layout();
    // First light: drift up to Saturn, then wait for the pointer.
    const first = objects[0];
    cur.x = W * 0.5;
    cur.y = H * 0.55;
    tgt.x = first.cx;
    tgt.y = first.cy;
    if (reduced) {
      cur.x = tgt.x;
      cur.y = tgt.y;
    }
    gainTgt = 1;
    document.fonts.ready.then(wake);
    if (hoverless) verbRef.current!.textContent = copy.tap;
    if (hoverless && !reduced) startTour(2400);
    wake();

    return () => {
      dead = true;
      stopTour();
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerenter", onEnter);
      hero.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [copy.tap, locale, names, router]);

  return (
    <div className="sky" ref={rootRef}>
      <canvas className="sky-stars" ref={starsRef} aria-hidden="true" />
      <canvas className="sky-live" ref={canvasRef} role="img" aria-label={copy.label} />
      <div className="sky-vignette" aria-hidden="true" />
      <div className="sky-grain" aria-hidden="true" />
      <div className="sky-hint">
        <p aria-live="polite">
          <span ref={verbRef}>{copy.explore}</span>
          <span aria-hidden="true">·</span>
          {copy.foundBefore && <span>{copy.foundBefore}</span>}
          <b ref={foundRef}>0</b>
          <span>/</span>
          <b>{skyPlates.length}</b>
          {copy.foundAfter && <span>{copy.foundAfter}</span>}
        </p>
        <p className="sky-caption">{copy.illustration}</p>
      </div>
    </div>
  );
}
