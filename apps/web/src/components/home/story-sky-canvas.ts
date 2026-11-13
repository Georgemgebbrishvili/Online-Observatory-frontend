import { precess, type StorySky } from "@/features/sky/story-sky";
import { FIGURES_URL, STARS_URL, decodeCatalogue, starsAtDate } from "@/features/sky3d/astro";
import { palette, withAlpha } from "@/styles/tokens";

/**
 * Tonight's sky over the observatory, drawn for any minute of the dark: the catalogue
 * stars and figures turned to that minute's sidereal time, the showpieces where they
 * stand, a city's roofs on the horizon, and the telescope's reticle slewing from target
 * to target. One view, altitude over azimuth, that pans to follow the telescope. It is a
 * drawing of the real positions, never the telescope's picture.
 */

export type SkyAim = { at: number; aim: string };
export type SkyPoint = { id: string; alt: number; az: number; slewing: boolean; x: number; y: number };
export type SkyCatalogue = {
  /** Float32 records [x, y, z, V, B-V], J2000 unit vectors, brightest first (public/sky/data). */
  stars: Float32Array;
  figures: { id: string; name: string; label: number[]; lines: number[][] }[];
};
export type SkyLabels = {
  names: Record<string, string>;
  /** Eight compass points from north clockwise, short. */
  compass: readonly string[];
  /** Constellation names by IAU abbreviation, where the language has its own. */
  constellations?: Record<string, string>;
};

const D = Math.PI / 180;
const RETICLE_SLEW = 16;
const VIEW_SLEW = 28;
const FAINTEST = 4.9;
/** The brand's floor for drawn text, in CSS pixels. */
const TEXT = 13;

const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const INK = palette.ink;
const COOL = palette.starCool;
const WARM = palette.starWarm;
const AMBER = palette.amber;
const RED = palette.redHi;
const BODY: Record<string, string> = {
  saturn: palette.targetSaturn,
  jupiter: palette.targetJupiter,
  mars: palette.targetMars,
  venus: palette.targetVenus,
};

/** Roofs and towers along the whole horizon, from a fixed seed, in degrees. */
function skyline() {
  let s = 20261110;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const blocks: { a: number; w: number; h: number; roof: boolean; mast: number; lit: [number, number][] }[] = [];
  for (let a = 0; a < 360; ) {
    const w = 1.2 + rnd() * 4.2;
    const tower = rnd() < 0.12;
    const h = tower ? 3.6 + rnd() * 2.4 : 0.9 + rnd() * 2.2;
    const lit: [number, number][] = [];
    const n = Math.floor(w * h * (tower ? 1.6 : 0.5));
    for (let i = 0; i < n; i++) if (rnd() < 0.22) lit.push([0.15 + rnd() * 0.7, 0.12 + rnd() * 0.7]);
    blocks.push({ a, w, h, roof: !tower && rnd() < 0.45, mast: rnd() < 0.1 ? 1 + rnd() * 1.6 : 0, lit });
    a += w + (rnd() < 0.3 ? rnd() * 1.2 : 0);
  }
  return blocks;
}
const hill = (az: number) =>
  2.6 + 1.2 * Math.sin(az * D * 3 + 0.6) + 0.7 * Math.sin(az * D * 7 + 2.1) + 0.3 * Math.sin(az * D * 17 + 0.4);

export function createSky(canvas: HTMLCanvasElement, sky: StorySky, plan: SkyAim[], labels: SkyLabels) {
  const ctx = canvas.getContext("2d")!;
  const sinL = Math.sin(sky.latitude * D);
  const cosL = Math.cos(sky.latitude * D);
  const blocks = skyline();
  const byId = new Map(sky.objects.map((o) => [o.id, o]));

  let stars: { ra: number; sd: number; cd: number; mag: number; rgb: string }[] = [];
  let figures: number[][] = [];
  let names: [string, number, number][] = [];

  const toRaDec = (x: number, y: number, z: number) =>
    precess((Math.atan2(y, x) / D + 360) % 360, Math.asin(clamp(z, -1, 1)) / D, sky.years);

  const setCatalogue = (catalogue: SkyCatalogue) => {
    stars = [];
    for (let i = 0; i < catalogue.stars.length; i += 5) {
      const mag = catalogue.stars[i + 3];
      if (mag > FAINTEST) break;
      const [ra, dec] = toRaDec(catalogue.stars[i], catalogue.stars[i + 1], catalogue.stars[i + 2]);
      const bv = catalogue.stars[i + 4];
      stars.push({ ra, sd: Math.sin(dec * D), cd: Math.cos(dec * D), mag, rgb: bv < 0.3 ? COOL : bv < 0.9 ? INK : WARM });
    }
    figures = catalogue.figures.flatMap((f) =>
      f.lines.map((line) => {
        const out: number[] = [];
        for (let i = 0; i < line.length; i += 3) out.push(...toRaDec(line[i], line[i + 1], line[i + 2]));
        return out;
      }),
    );
    names = catalogue.figures.map((f) => {
      const [ra, dec] = toRaDec(f.label[0], f.label[1], f.label[2]);
      return [labels.constellations?.[f.id] ?? f.name.toUpperCase(), ra, dec];
    });
  };

  let W = 0;
  let H = 0;
  let dpr = 1;
  let H0 = 0;
  let sc = 8;
  let cx = 0;
  let font = "sans-serif";
  let phone = false;

  const altAz = (ra: number, dec: number, lst: number): [number, number] => {
    const h = (lst - ra) * D;
    const sd = Math.sin(dec * D);
    const cd = Math.cos(dec * D);
    let alt = Math.asin(clamp(sd * sinL + cd * cosL * Math.cos(h), -1, 1)) / D;
    const az = (Math.atan2(-cd * Math.sin(h), sd * cosL - cd * sinL * Math.cos(h)) / D + 360) % 360;
    if (alt > -1) alt += 1.02 / Math.tan((alt + 10.3 / (alt + 5.11)) * D) / 60;
    return [alt, az];
  };
  const lstAt = (hr: number) => sky.lst0 + 15.04107 * hr;
  const where = (id: string, hr: number): [number, number] => {
    const o = byId.get(id);
    if (!o) return [-90, 0];
    return altAz((o.ra + o.dra * hr + 360) % 360, o.dec + o.ddec * hr, lstAt(hr));
  };

  /** Where the telescope points (and where the view looks), easing from the last target to this one. */
  const aimAt = (min: number, slew: number): [number, number, string, boolean] => {
    const hr = min / 60;
    let i = 0;
    plan.forEach((p, j) => {
      if (min >= p.at) i = j;
    });
    const now = where(plan[i].aim, hr);
    if (i === 0 || plan[i - 1].aim === plan[i].aim) return [...now, plan[i].aim, false];
    const p = ease(clamp((min - plan[i].at) / slew, 0, 1));
    const was = where(plan[i - 1].aim, hr);
    return [was[0] + (now[0] - was[0]) * p, (was[1] + wrap(now[1] - was[1]) * p + 360) % 360, plan[i].aim, p < 1];
  };

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth * dpr;
    H = canvas.clientHeight * dpr;
    canvas.width = W;
    canvas.height = H;
    phone = canvas.clientWidth < 768;
    H0 = H * (phone ? 0.52 : 0.8);
    sc = H0 / 84;
    cx = W * (phone ? 0.5 : 0.56);
    font = getComputedStyle(canvas).fontFamily || font;
  };

  const draw = (min: number): SkyPoint => {
    const hr = min / 60;
    const lst = lstAt(hr);
    const view = aimAt(min, VIEW_SLEW)[1];
    const [aAlt, aAz, aim, slewing] = aimAt(min, RETICLE_SLEW);
    // Following a high target, the view tilts up and the roofs sink out of frame.
    const hz = Math.max(H0, aAlt * sc + H * (phone ? 0.3 : 0.26));
    const proj = (alt: number, az: number): [number, number] => [cx + wrap(az - view) * sc, hz - alt * sc];
    const k = clamp(sc / (8 * dpr), 0.75, 1.25) * dpr;
    const text = TEXT * dpr;

    // Sky: the canvas black overhead, the city's warm glow on the horizon.
    const g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, palette.bar);
    g.addColorStop(0.6, palette.canvas);
    g.addColorStop(1, palette.ember);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createLinearGradient(0, hz - 30 * sc, 0, hz);
    glow.addColorStop(0, withAlpha(RED, 0));
    glow.addColorStop(0.7, withAlpha(RED, 0.06));
    glow.addColorStop(1, withAlpha(AMBER, 0.2));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, hz);

    // Constellation figures and names
    ctx.lineWidth = dpr;
    ctx.strokeStyle = withAlpha(COOL, 0.13);
    ctx.beginPath();
    for (const f of figures) {
      let last: [number, number] | null = null;
      for (let i = 0; i < f.length; i += 2) {
        const [alt, az] = altAz(f[i], f[i + 1], lst);
        const p = alt > -3 ? proj(alt, az) : null;
        if (p && last && Math.abs(p[0] - last[0]) < W / 2) {
          ctx.moveTo(last[0], last[1]);
          ctx.lineTo(p[0], p[1]);
        }
        last = p;
      }
    }
    ctx.stroke();
    ctx.font = `500 ${text}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha(COOL, 0.3);
    for (const [n, ra, dec] of names) {
      const [alt, az] = altAz(ra, dec, lst);
      if (alt < 8) continue;
      const [x, y] = proj(alt, az);
      if (x > -80 && x < W + 80) ctx.fillText(n, x, y);
    }

    // Stars, dimmed by the air toward the horizon
    for (const s of stars) {
      const h = (lst - s.ra) * D;
      const sa = s.sd * sinL + s.cd * cosL * Math.cos(h);
      if (sa < -0.02) continue;
      const alt = Math.asin(sa) / D;
      const az = (Math.atan2(-s.cd * Math.sin(h), s.sd * cosL - s.cd * sinL * Math.cos(h)) / D + 360) % 360;
      const [x, y] = proj(alt, az);
      if (x < -10 || x > W + 10) continue;
      const a = clamp(1.35 - s.mag * 0.2, 0.2, 1) * clamp(alt / 14, 0.2, 1);
      const r = Math.max(0.6, 2.1 - 0.32 * s.mag) * k;
      if (s.mag < 1.6) {
        const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        gl.addColorStop(0, withAlpha(s.rgb, 0.3 * a));
        gl.addColorStop(1, withAlpha(s.rgb, 0));
        ctx.fillStyle = gl;
        ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
      }
      ctx.fillStyle = withAlpha(s.rgb, a);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // The showpieces: the Moon lit on the Sun's side, planets as coloured points, the deep sky as a faint glow.
    for (const o of sky.objects) {
      const [alt, az] = where(o.id, hr);
      if (alt < -0.5) continue;
      const [x, y] = proj(alt, az);
      if (o.kind === "moon") {
        const sp = proj(...altAz(sky.sun.ra, sky.sun.dec, lst));
        const r = 0.9 * sc;
        const lit = sky.moonLit;
        const halo = ctx.createRadialGradient(x, y, r, x, y, r * 7);
        halo.addColorStop(0, withAlpha(WARM, 0.12 + lit * 0.2));
        halo.addColorStop(1, withAlpha(WARM, 0));
        ctx.fillStyle = halo;
        ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.atan2(sp[1] - y, sp[0] - x));
        ctx.fillStyle = withAlpha(COOL, 0.16);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = palette.flare;
        ctx.beginPath();
        ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
        ctx.ellipse(0, 0, Math.abs(1 - 2 * lit) * r, r, 0, Math.PI / 2, -Math.PI / 2, lit < 0.5);
        ctx.fill();
        ctx.restore();
      } else if (o.kind === "planet") {
        const colour = BODY[o.id] ?? palette.flare;
        const r = Math.max(1.8, 2.8 - 0.45 * o.magnitude) * k;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
        gl.addColorStop(0, withAlpha(colour, 0.4));
        gl.addColorStop(1, withAlpha(colour, 0));
        ctx.fillStyle = gl;
        ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const r = (o.kind === "galaxy" ? 1.6 : 1) * sc;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, r);
        gl.addColorStop(0, withAlpha(o.kind === "nebula" ? WARM : COOL, 0.24));
        gl.addColorStop(1, withAlpha(COOL, 0));
        ctx.fillStyle = gl;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }

    // Names for what the telescope can visit tonight
    const [rx, ry] = proj(aAlt, aAz);
    ctx.font = `600 ${text}px ${font}`;
    ctx.textAlign = "left";
    ctx.fillStyle = withAlpha(INK, 0.62);
    for (const o of sky.objects) {
      const [alt, az] = where(o.id, hr);
      if (alt < 1.5 || (o.id === aim && !slewing)) continue;
      const [x, y] = proj(alt, az);
      if (Math.hypot(x - rx, y - ry) < 80 * dpr) continue;
      ctx.fillText(labels.names[o.id] ?? o.id, x + 10 * dpr, y - 8 * dpr);
    }

    // Hills behind the city, then the roofs
    ctx.fillStyle = palette.monolithTop;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, hz - hill(view + (x - cx) / sc) * sc);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    const base = hz + 1.2 * sc;
    const half = W / sc / 2 + 6;
    ctx.fillStyle = palette.bar;
    ctx.fillRect(0, base, W, H - base);
    const lights: [number, number, number][] = [];
    for (const b of blocks) {
      const d = wrap(b.a - view);
      if (d < -half - 8 || d > half) continue;
      const x0 = cx + d * sc;
      const w = b.w * sc;
      const top = base - b.h * sc;
      ctx.fillRect(x0, top, w, base - top + 1);
      if (b.roof) {
        ctx.beginPath();
        ctx.moveTo(x0 - 0.2 * sc, top);
        ctx.lineTo(x0 + w / 2, top - Math.min(w * 0.3, 1.1 * sc));
        ctx.lineTo(x0 + w + 0.2 * sc, top);
        ctx.fill();
      }
      if (b.mast) ctx.fillRect(x0 + w * 0.7, top - b.mast * sc, Math.max(1, 0.12 * sc), b.mast * sc);
      for (const [u, v] of b.lit) lights.push([x0 + u * w, top + v * (base - top), 0.18 * sc]);
    }
    ctx.fillStyle = withAlpha(AMBER, 0.5);
    for (const [x, y, s] of lights) ctx.fillRect(x, y, Math.max(1, s), Math.max(1, s * 0.8));

    // Compass under the roofs
    ctx.font = `600 ${text}px ${font}`;
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha(INK, 0.45);
    for (let i = 0; i < 8; i++) {
      const x = cx + wrap(i * 45 - view) * sc;
      if (x > 20 && x < W - 20) ctx.fillText(labels.compass[i], x, base + 24 * dpr);
    }

    // The telescope: a reticle on its target, the camera's field inside it
    const R = 26 * dpr;
    ctx.strokeStyle = withAlpha(RED, 0.95);
    ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath();
    ctx.arc(rx, ry, R, 0, Math.PI * 2);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      ctx.moveTo(rx + dx * (R + 4 * dpr), ry + dy * (R + 4 * dpr));
      ctx.lineTo(rx + dx * (R + 12 * dpr), ry + dy * (R + 12 * dpr));
    }
    ctx.stroke();
    ctx.lineWidth = dpr;
    ctx.strokeRect(rx - 4 * dpr, ry - 2.5 * dpr, 8 * dpr, 5 * dpr);
    if (!slewing) {
      ctx.font = `600 ${text}px ${font}`;
      ctx.textAlign = "left";
      ctx.fillStyle = palette.redInk;
      ctx.fillText(labels.names[aim] ?? aim, rx + R + 16 * dpr, ry + 4 * dpr);
    }

    return { id: aim, alt: aAlt, az: aAz, slewing, x: rx / W, y: ry / H };
  };

  resize();
  return { draw, resize, setCatalogue };
}

let catalogue: Promise<SkyCatalogue> | null = null;
/**
 * The Night Sky page's star data (ADR-085), fetched once for every drawn sky on the page,
 * as five numbers a star (x, y, z, V, B−V) moved to today. The file holds seven a star
 * since 2026-11-11, which read five at a time had scrambled this sky.
 */
export function loadCatalogue(): Promise<SkyCatalogue> {
  catalogue ??= Promise.all([
    fetch(STARS_URL).then((r) => r.arrayBuffer()),
    fetch(FIGURES_URL).then((r) => r.json() as Promise<SkyCatalogue["figures"]>),
  ]).then(([stars, figures]) => ({ stars: starsAtDate(decodeCatalogue(stars), new Date()), figures }));
  return catalogue;
}
