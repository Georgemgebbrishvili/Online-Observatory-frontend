"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { skyAimEvent, type SkyAim } from "@/components/home/observatory-dome";
import { skyPlates, type SkyKind, type SkyPlate } from "@/features/targets/homepage-data";
import type { Locale } from "@/i18n/config";
import { palette, withAlpha } from "@/styles/tokens";

type SkyRevealProps = {
  locale: Locale;
  names: Record<SkyPlate, string>;
  kinds: Record<SkyKind, string>;
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
  kindName: string;
  x: number;
  y: number;
  s: number;
  feather: number;
  bmp?: HTMLCanvasElement;
  /** The plate out of focus, blurred once, so focusing is a cross-fade, not a filter. */
  soft?: HTMLCanvasElement;
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
/** The eyepiece ring's radius once it has closed round a plate. */
const ringFor = (o: { r: number }) => o.r * 0.9 + 12;

/**
 * The black sky behind the homepage words, as the Skychaser site draws its own: our drawn
 * plates sit in it unseen; the pointer reveals the one beneath it, which ignites, settles
 * and is named. One canvas, redrawn only while something still moves. With no pointer the
 * sky tours its plates on its own. A phone has no sky: the hero is the words and the
 * button. Every plate is an illustration, and the sky says so beneath it.
 */
export function SkyReveal({ copy, kinds, locale, names }: SkyRevealProps) {
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
      kindName: kinds[plate.kind],
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
    let kindFont = "500 13px sans-serif";
    // Georgian is never uppercased or tracked.
    const tracked = locale !== "ka";
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
    // The light's hold on the plate under it: 0 roaming, 1 centred on it. The telescope
    // and the eyepiece ring follow the plate's centre as the hold tightens.
    let lock = 0;
    let lockTgt = 0;
    let locked: Live | null = null;
    const aimAt = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let activeUntil = 0;
    let visible = true;
    let dead = false;
    let touring = false;
    let tourIdx = 0;
    let tourTimer = 0;
    let rectCache: DOMRect | null = null;
    // The words' box (headline, lede, button), so a name is never written across them.
    const words = { top: 0, bottom: 0, left: 0, right: 0 };
    let target = "";
    let swallowClick = false;

    // Each plate feathered into the black once, kept as a bitmap, with a blurred copy.
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
        const soft = document.createElement("canvas");
        soft.width = c.width;
        soft.height = c.height;
        const sg = soft.getContext("2d");
        if (sg && "filter" in sg) {
          sg.filter = `blur(${Math.round(c.width * 0.035)}px)`;
          sg.drawImage(c, 0, 0);
          o.soft = soft;
        }
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
      for (const o of objects) if (o.found) ghost(o, g);
    }

    // A found plate stays faintly in the sky, drawn once into the still layer.
    function ghost(o: Live, g = starsCanvas!.getContext("2d")) {
      if (!g || !o.bmp) return;
      const w = o.ar >= 1 ? o.r * 2 : o.r * 2 * o.ar;
      const h = o.ar >= 1 ? (o.r * 2) / o.ar : o.r * 2;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalAlpha = 0.035;
      g.drawImage(o.bmp, o.cx - w / 2, o.cy - h / 2, w, h);
      g.globalAlpha = 1;
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
      const family =
        getComputedStyle(root!).getPropertyValue("--font-label").trim() || "sans-serif";
      labelFont = `300 24px ${family}`;
      kindFont = `500 13px ${family}`;
      words.top = words.left = Infinity;
      words.bottom = words.right = -Infinity;
      for (const el of hero!.querySelectorAll(".sky-hero-copy > *")) {
        const t = el.getBoundingClientRect();
        words.top = Math.min(words.top, t.top - rect.top);
        words.bottom = Math.max(words.bottom, t.bottom - rect.top);
        words.left = Math.min(words.left, t.left - rect.left);
        words.right = Math.max(words.right, t.right - rect.left);
      }
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
      lock += (lockTgt - lock) * (reduced ? 1 : 1 - Math.exp(-dt / 110));
      aimAt.x = locked ? cur.x + (locked.cx - cur.x) * lock : cur.x;
      aimAt.y = locked ? cur.y + (locked.cy - cur.y) * lock : cur.y;
      draw(now);
      // The observatory below turns its telescope to wherever the light is, and onto the
      // plate's centre once the light holds one.
      if (gainTgt > 0)
        hero!.dispatchEvent(
          new CustomEvent<SkyAim>(skyAimEvent, { detail: { x: aimAt.x, y: aimAt.y } }),
        );
      const moving =
        Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.25 ||
        Math.abs(gainTgt - gain) > 0.004 ||
        Math.abs(lockTgt - lock) > 0.004 ||
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
        lg.addColorStop(0, withAlpha(palette.cream, 0.055 * gain));
        lg.addColorStop(0.55, withAlpha(palette.cream, 0.016 * gain));
        lg.addColorStop(1, withAlpha(palette.black, 0));
        c.fillStyle = lg;
        c.fillRect(cur.x - R * 1.4, cur.y - R * 1.4, R * 2.8, R * 2.8);
        mark(cur.x - R * 1.4, cur.y - R * 1.4, R * 2.8, R * 2.8);
        // The eyepiece's field: one faint ring where the telescope is looking, closing
        // round a plate as the light holds it.
        const ringR = locked ? R * 0.7 + (ringFor(locked) - R * 0.7) * lock : R * 0.7;
        c.strokeStyle = withAlpha(palette.cream, (0.09 + 0.07 * lock) * gain);
        c.lineWidth = 1;
        c.beginPath();
        c.arc(aimAt.x, aimAt.y, ringR, 0, 6.2832);
        c.stroke();
        mark(aimAt.x - ringR - 2, aimAt.y - ringR - 2, ringR * 2 + 4, ringR * 2 + 4);
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
          ghost(o);
          found++;
          foundEl!.textContent = String(found);
        }
        if (a > 0.3 && !o.lit) {
          o.lit = true;
          o.litAt = now;
          activeUntil = Math.max(activeUntil, now + 950);
        }
        if (a < 0.08) o.lit = false;
        const alpha = a;
        if (alpha < 0.004) continue;
        // A plate comes into focus as the light reaches it: soft, then sharp, settling
        // from a touch smaller, the way an image does when the focuser finds it.
        const t = o.lit ? Math.min(1, (now - o.litAt) / 850) : 1;
        const pop = 1 - Math.pow(1 - t, 3);
        const sc = (0.965 + 0.035 * pop) * (0.985 + 0.015 * a);
        const w = (o.ar >= 1 ? o.r * 2 : o.r * 2 * o.ar) * sc;
        const h = (o.ar >= 1 ? (o.r * 2) / o.ar : o.r * 2) * sc;
        const blur =
          reduced || !o.soft ? 0 : Math.min(1, (1 - pop) * 0.7 + (1 - a) * 0.4);
        const fade = alpha * (0.55 + 0.45 * pop);
        if (blur > 0.02) {
          c.globalAlpha = fade * blur;
          c.drawImage(o.soft!, o.cx - w / 2, o.cy - h / 2, w, h);
        }
        c.globalAlpha = fade * (1 - blur * 0.85);
        c.drawImage(o.bmp, o.cx - w / 2, o.cy - h / 2, w, h);
        mark(o.cx - w / 2, o.cy - h / 2, w, h);
        if (o.lit && t < 1) {
          // A faint warmth around it while it settles, never a flash.
          const br = o.r * 1.5;
          const fg = c.createRadialGradient(o.cx, o.cy, o.r * 0.5, o.cx, o.cy, br);
          fg.addColorStop(0, withAlpha(palette.bloomWarm, (1 - t) * 0.08 * a));
          fg.addColorStop(1, withAlpha(palette.black, 0));
          c.globalAlpha = 1;
          c.fillStyle = fg;
          c.fillRect(o.cx - br, o.cy - br, br * 2, br * 2);
          mark(o.cx - br, o.cy - br, br * 2, br * 2);
        }
        c.globalAlpha = 1;
        o.h = h;
        if (a > nearestA) {
          nearestA = a;
          nearest = o;
        }
      }

      // The light holds the plate it mostly reveals; a new plate is taken from roaming.
      if (nearest && nearestA > 0.6) {
        if (locked !== nearest) {
          locked = nearest;
          lock = 0;
        }
        lockTgt = smooth(Math.min(1, (nearestA - 0.6) / 0.35));
      } else lockTgt = 0;
      const next = nearest && nearestA > 0.85 ? nearest.slug : "";
      if (next !== target) {
        target = next;
        root!.style.cursor = target ? "pointer" : "";
      }
      if (nearest && nearestA > 0.35) {
        const o: Live = nearest;
        const la = (nearestA - 0.35) / 0.65;
        // Two lines: what it is, small and gold, then its name. Under the plate and its
        // ring; over them where that would cross the words or sink behind the hill;
        // beside them where neither fits.
        const edge = Math.max(o.h / 2, ringFor(o));
        const below = o.cy + edge + 14;
        const above = o.cy - edge - 62;
        const kind = tracked ? o.kindName.toUpperCase() : o.kindName;
        c.font = kindFont;
        c.letterSpacing = tracked ? "0.2em" : "0px";
        const kindW = c.measureText(kind).width;
        c.font = labelFont;
        c.letterSpacing = tracked ? "0.04em" : "0px";
        const nameW = c.measureText(o.name).width;
        // A label box fits in the sky above the hill, off the words and the other plates.
        const fits = (x: number, y: number, w: number) =>
          y >= 10 &&
          y + 56 < H * 0.8 &&
          x >= 12 &&
          x + w <= W - 12 &&
          (y + 56 < words.top ||
            y > words.bottom ||
            x + w < words.left - 12 ||
            x > words.right + 12) &&
          objects.every((p) => {
            if (p === o) return true;
            const nx = Math.max(x, Math.min(p.cx, x + w));
            const ny = Math.max(y, Math.min(p.cy, y + 56));
            return Math.hypot(p.cx - nx, p.cy - ny) > p.r * 0.7;
          });
        const w = Math.max(nameW, kindW) + 8;
        let lx = Math.min(W - 12 - w / 2, Math.max(12 + w / 2, o.cx));
        let top = below;
        let align: CanvasTextAlign = "center";
        if (!fits(lx - w / 2, below, w)) {
          if (fits(lx - w / 2, above, w)) top = above;
          else {
            // Beside the ring, on the side away from the middle when there is room.
            top = o.cy - 30;
            const outRight = o.cx + ringFor(o) + 18;
            const outLeft = o.cx - ringFor(o) - 18;
            const right =
              o.cx > W / 2
                ? fits(outRight, top, w) || !fits(outLeft - w, top, w)
                : !fits(outLeft - w, top, w);
            align = right ? "left" : "right";
            lx = right ? outRight : outLeft;
          }
        }
        // Rises a few pixels into place as it appears.
        const rise = (1 - la) * 6;
        c.textAlign = align;
        c.textBaseline = "middle";
        c.font = kindFont;
        c.letterSpacing = tracked ? "0.2em" : "0px";
        c.fillStyle = withAlpha(palette.gold, 0.9 * la);
        c.fillText(kind, lx, top + 8 + rise);
        c.font = labelFont;
        c.letterSpacing = tracked ? "0.04em" : "0px";
        c.fillStyle = withAlpha(palette.cream, 0.96 * la);
        c.fillText(o.name, lx, top + 34 + rise);
        const left = align === "center" ? lx - w / 2 : align === "left" ? lx : lx - w;
        mark(left - 10, top - 4, w + 20, 66);
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
    document.fonts.ready.then(() => !dead && layout());
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
  }, [copy.tap, kinds, locale, names, router]);

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
