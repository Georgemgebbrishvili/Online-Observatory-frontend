'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Map as MapIcon, Megaphone, Minus, Plus, Radio, Star, X } from 'lucide-react';
import { useTranslations } from 'use-intl';
import { claimEscape } from '@/voyage/game/escape';
import { ROAD } from '@/voyage/lib/solar-system/world-earth-data';
import { STATIONS } from '@/voyage/lib/solar-system/world-earth-radio';
import type { CityMap, CityState, Street } from '@/voyage/lib/solar-system/world-earth-street';

export interface CityHudHandle {
  /** From the surface's HUD loop: writes the DOM and the minimap directly, no React render. */
  paint: (city: CityState, heading: number, now: number) => void;
}

interface Props {
  street: () => Street | null;
  touch: boolean;
  open: boolean;
  onOpen: (open: boolean) => void;
}

const CELL = 150;
const NOTE_MS = 3600;
const RADIO_MS = 3400;
const fmtDist = (m: number) => (m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** The streets cut into cells of paths, built once, so the minimap strokes only what is near. */
interface Atlas {
  map: CityMap;
  cells: Map<number, { major: Path2D; minor: Path2D; foot: Path2D }>;
  water: Path2D;
}
const cellKey = (cx: number, cz: number) => (cx + 1000) * 2048 + (cz + 1000);
function buildAtlas(map: CityMap): Atlas {
  const cells: Atlas['cells'] = new Map();
  for (const r of map.roads) {
    const kind = r.cls <= ROAD.secondary ? 'major' : r.cls <= ROAD.service ? 'minor' : 'foot';
    for (let i = 0; i + 3 < r.pts.length; i += 2) {
      const ax = r.pts[i]; const az = r.pts[i + 1]; const bx = r.pts[i + 2]; const bz = r.pts[i + 3];
      const k = cellKey(Math.floor((ax + bx) / 2 / CELL), Math.floor((az + bz) / 2 / CELL));
      let c = cells.get(k);
      if (!c) cells.set(k, (c = { major: new Path2D(), minor: new Path2D(), foot: new Path2D() }));
      c[kind].moveTo(ax, az); c[kind].lineTo(bx, bz);
    }
  }
  const water = new Path2D();
  for (const ring of map.water) {
    water.moveTo(ring[0], ring[1]);
    for (let i = 2; i + 1 < ring.length; i += 2) water.lineTo(ring[i], ring[i + 1]);
    water.closePath();
  }
  return { map, cells, water };
}

/** World (x, z) to the canvas: rotated so that `heading` (degrees clockwise from north, −z) is up. */
function setView(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, heading: number, px: number, pz: number) {
  const h = (heading * Math.PI) / 180;
  const c = Math.cos(h); const n = Math.sin(h);
  ctx.setTransform(s * c, -s * n, s * n, s * c, cx - s * (c * px + n * pz), cy - s * (-n * px + c * pz));
}
function toScreen(x: number, z: number, cx: number, cy: number, s: number, heading: number, px: number, pz: number): [number, number] {
  const h = (heading * Math.PI) / 180;
  const c = Math.cos(h); const n = Math.sin(h);
  const dx = x - px; const dz = z - pz;
  return [cx + s * (c * dx + n * dz), cy + s * (-n * dx + c * dz)];
}

const COLORS = {
  ground: 'rgba(14, 16, 20, 0.86)', water: 'rgba(42, 92, 130, 0.9)', major: 'rgba(236, 228, 210, 0.62)', minor: 'rgba(200, 196, 186, 0.34)',
  foot: 'rgba(170, 170, 160, 0.14)', route: '#e3482c', waypoint: '#f0785a', fare: '#e2b85a', car: '#f4f4f2', police: ['#ff3b30', '#3b82ff'],
};

/** `s` is CSS pixels a metre: line widths below are CSS pixels. */
function drawStreets(ctx: CanvasRenderingContext2D, atlas: Atlas, s: number, px: number, pz: number, reach: number) {
  ctx.fillStyle = COLORS.water;
  ctx.fill(atlas.water);
  const r = Math.ceil(reach / CELL) + 1;
  const cx = Math.floor(px / CELL); const cz = Math.floor(pz / CELL);
  ctx.lineCap = 'round';
  for (const [kind, width, colour] of [['foot', 1.2, COLORS.foot], ['minor', 2.2, COLORS.minor], ['major', 3.6, COLORS.major]] as const) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width / s;
    for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
      const c = atlas.cells.get(cellKey(cx + i, cz + j));
      if (c) ctx.stroke(c[kind]);
    }
  }
}

function drawRoute(ctx: CanvasRenderingContext2D, route: Float32Array, s: number) {
  ctx.beginPath();
  ctx.moveTo(route[0], route[1]);
  for (let i = 2; i + 1 < route.length; i += 2) ctx.lineTo(route[i], route[i + 1]);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 7 / s;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.strokeStyle = COLORS.route;
  ctx.lineWidth = 4 / s;
  ctx.stroke();
}

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size); ctx.lineTo(size * 0.7, size * 0.75); ctx.lineTo(0, size * 0.35); ctx.lineTo(-size * 0.7, size * 0.75);
  ctx.closePath();
  ctx.fillStyle = '#fff1d6';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

function blip(ctx: CanvasRenderingContext2D, x: number, y: number, colour: string, size: number, square = false) {
  ctx.beginPath();
  if (square) ctx.rect(x - size, y - size, size * 2, size * 2);
  else ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();
}

/** The angle on the canvas of a world direction (sin yaw, cos yaw), with the map turned to `heading`. */
function screenAngle(yaw: number, heading: number) {
  if (Number.isNaN(yaw)) return 0;
  const [sx, sy] = toScreen(Math.sin(yaw), Math.cos(yaw), 0, 0, 1, heading, 0, 0);
  return Math.atan2(sx, -sy);
}

/** Everything that sits on the streets: the car, the police, the fare, the waypoint. Blips past the rim are held on it. */
function drawMarks(ctx: CanvasRenderingContext2D, city: CityState, cx: number, cy: number, s: number, heading: number, rim: number, now: number, dpr: number) {
  const place = (x: number, z: number): [number, number] => {
    let [sx, sy] = toScreen(x, z, cx, cy, s, heading, city.px, city.pz);
    const dx = sx - cx; const dy = sy - cy; const d = Math.hypot(dx, dy);
    if (rim > 0 && d > rim) { sx = cx + (dx / d) * rim; sy = cy + (dy / d) * rim; }
    return [sx, sy];
  };
  if (city.parked) { const [x, y] = place(city.parked.x, city.parked.z); blip(ctx, x, y, COLORS.car, 4.5 * dpr, true); }
  if (city.target) {
    const [x, y] = place(city.target.x, city.target.z);
    blip(ctx, x, y, city.target.kind === 'waypoint' ? COLORS.waypoint : COLORS.fare, 6.5 * dpr);
  }
  const flash = Math.floor(now / 180) % 2;
  for (let i = 0; i + 1 < city.police.length; i += 2) {
    const [x, y] = place(city.police[i], city.police[i + 1]);
    blip(ctx, x, y, COLORS.police[(flash + i / 2) % 2], 5 * dpr);
  }
}

export const CityHud = forwardRef<CityHudHandle, Props>(function CityHud({ street, touch, open, onOpen }, ref) {
  const t = useTranslations('solarSystem.worlds.earth.city');
  const tRef = useRef(t);
  tRef.current = t;
  const rootRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const cashRef = useRef<HTMLSpanElement>(null);
  const bustRef = useRef<HTMLDivElement>(null);
  const bustTextRef = useRef<HTMLSpanElement>(null);
  const fareRef = useRef<HTMLDivElement>(null);
  const fareWhereRef = useRef<HTMLSpanElement>(null);
  const fareMetaRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const radioRef = useRef<HTMLDivElement>(null);
  const radioNameRef = useRef<HTMLSpanElement>(null);
  const radioLineRef = useRef<HTMLSpanElement>(null);
  const bustedRef = useRef<HTMLDivElement>(null);
  const bustedLineRef = useRef<HTMLSpanElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  const sayRef = useRef<HTMLParagraphElement>(null);
  const driveKeysRef = useRef<HTMLDivElement>(null);
  const atlasRef = useRef<Atlas | null>(null);
  const seen = useRef({ note: -1, radio: -1, stars: -1, cash: -1, fare: '', busted: false, health: -2, driving: false, say: -1 });
  const until = useRef({ note: 0, radio: 0, say: 0 });
  const lastMini = useRef(0);
  const zoom = useRef(1);
  const atlas = useCallback(() => {
    if (!atlasRef.current) { const s = street(); if (s) atlasRef.current = buildAtlas(s.map()); }
    return atlasRef.current;
  }, [street]);

  useImperativeHandle(ref, () => ({
    paint(city, heading, now) {
      const tt = tRef.current;
      const was = seen.current;
      // ── Stars and cash. ──
      if (was.stars !== city.stars) {
        was.stars = city.stars;
        const el = starsRef.current;
        if (el) {
          el.dataset.on = String(city.stars > 0);
          el.setAttribute('aria-label', tt('stars', { n: city.stars }));
          Array.from(el.children).forEach((c, i) => { (c as HTMLElement).dataset.lit = String(i < city.stars); });
        }
      }
      starsRef.current?.setAttribute('data-evading', String(city.stars > 0 && city.evade > 0.15));
      if (was.cash !== city.cash) { was.cash = city.cash; if (cashRef.current) cashRef.current.textContent = tt('cash', { n: city.cash }); }
      const bust = bustRef.current;
      if (bust) {
        const on = city.bust > 0.02 && city.busted <= 0;
        if (bust.hidden === on) bust.hidden = !on;
        if (on) {
          bust.style.setProperty('--v', city.bust.toFixed(3));
          const key = city.carHealth >= 0 ? 'bust' : 'bustFoot';
          if (bustTextRef.current && bustTextRef.current.dataset.key !== key) { bustTextRef.current.dataset.key = key; bustTextRef.current.textContent = tt(key); }
        }
      }
      // ── The car's health, and the drive keys, while at the wheel. ──
      const driving = city.carHealth >= 0;
      const hb = healthRef.current;
      if (hb) {
        if (hb.hidden === driving) hb.hidden = !driving;
        const h = Math.round(city.carHealth * 20) / 20;
        if (driving && was.health !== h) { was.health = h; hb.style.setProperty('--v', String(h)); hb.dataset.low = String(h < 0.34); }
      }
      if (was.driving !== driving) {
        was.driving = driving;
        if (driveKeysRef.current) driveKeysRef.current.hidden = !driving;
      }
      // ── The fare. ──
      const fare = fareRef.current;
      if (fare) {
        const f = city.fare;
        if (fare.hidden === !!f) fare.hidden = !f;
        if (f) {
          const where = f.stage === 'pickup' ? tt('fare.pickup') : tt('fare.ride', { place: tt(`places.${f.dest}`) });
          const meta = f.stage === 'pickup'
            ? fmtDist(f.remaining)
            : `${fmtDist(f.remaining)} · ${f.timeLeft > 0 ? tt('fare.timeLeft', { t: fmtTime(f.timeLeft) }) : tt('fare.late')} · ${tt('fare.meter', { n: f.base })}`;
          const sig = where + meta;
          if (was.fare !== sig) {
            was.fare = sig;
            if (fareWhereRef.current) fareWhereRef.current.textContent = where;
            if (fareMetaRef.current) fareMetaRef.current.textContent = meta;
            fare.dataset.late = String(f.stage === 'ride' && f.timeLeft <= 0);
          }
        }
      }
      // ── A line across the glass for what just happened. ──
      const note = noteRef.current;
      if (note) {
        if (was.note < 0) was.note = city.note.serial;
        if (city.note.serial !== was.note) {
          was.note = city.note.serial;
          const k = city.note.key;
          const key = k === 'wanted' && city.note.n !== 1 ? 'wantedMany' : k;
          note.textContent = tt(`notes.${key}`, { n: city.note.n, m: city.note.m });
          note.dataset.kind = k;
          until.current.note = now + NOTE_MS;
          if (k === 'busted') {
            if (bustedLineRef.current) bustedLineRef.current.textContent = city.note.n > 0 ? tt('bustedLine', { n: city.note.n }) : tt('bustedFree');
          }
        }
        const on = now < until.current.note && city.busted <= 0;
        if (note.hidden === on) note.hidden = !on;
      }
      const busted = bustedRef.current;
      if (busted) {
        const on = city.busted > 0;
        if (busted.hidden === on) busted.hidden = !on;
      }
      // ── A passer-by's hello, in Georgian with the English under it. ──
      const say = sayRef.current;
      if (say) {
        if (was.say < 0) was.say = city.say.serial;
        if (city.say.serial !== was.say) {
          was.say = city.say.serial;
          say.textContent = tt(`greetings.${city.say.line}`);
          until.current.say = now + 3200;
        }
        const on = now < until.current.say;
        if (say.hidden === on) say.hidden = !on;
      }
      // ── The station, when it changes. ──
      const radio = radioRef.current;
      if (radio) {
        if (was.radio < 0) was.radio = city.radioSerial;
        if (city.radioSerial !== was.radio) {
          was.radio = city.radioSerial;
          const id = city.radio >= 0 ? STATIONS[city.radio] : null;
          if (radioNameRef.current) radioNameRef.current.textContent = id ? tt(`stations.${id}.name`) : tt('radioOff');
          if (radioLineRef.current) radioLineRef.current.textContent = id ? tt(`stations.${id}.line`) : '';
          // Off on leaving the car says nothing; turned off at the wheel says so.
          until.current.radio = id || driving ? now + RADIO_MS : 0;
        }
        const on = now < until.current.radio;
        if (radio.hidden === on) radio.hidden = !on;
      }

      // ── The minimap, fifteen times a second. ──
      if (now - lastMini.current < 66) return;
      lastMini.current = now;
      const cv = miniRef.current;
      const at = atlas();
      if (!cv || !at) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = cv.clientWidth;
      if (!size) return;
      if (cv.width !== Math.round(size * dpr)) { cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr); }
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const W = cv.width; const R = W / 2;
      // Further out at the wheel, where the streets go by faster.
      zoom.current += ((driving ? 1.7 : 1) - zoom.current) * 0.15;
      const reach = 150 * zoom.current;
      const s = R / reach;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, W);
      ctx.save();
      ctx.beginPath(); ctx.arc(R, R, R - dpr, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = COLORS.ground; ctx.fillRect(0, 0, W, W);
      setView(ctx, R, R, s, heading, city.px, city.pz);
      drawStreets(ctx, at, s / dpr, city.px, city.pz, reach * 1.45);
      if (city.route) drawRoute(ctx, city.route, s / dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      drawMarks(ctx, city, R, R, s, heading, R - 9 * dpr, now, dpr);
      arrow(ctx, R, R, screenAngle(city.yaw, heading), 8 * dpr);
      ctx.restore();
      // North on the rim.
      const [nx, ny] = toScreen(city.px, city.pz - 1e4, R, R, 1, heading, city.px, city.pz);
      const a = Math.atan2(ny - R, nx - R);
      ctx.font = `600 ${11 * dpr}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const rx = R + Math.cos(a) * (R - 10 * dpr); const ry = R + Math.sin(a) * (R - 10 * dpr);
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.arc(rx, ry, 8 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff1d6'; ctx.fillText('N', rx, ry + 0.5);
    },
  }), [atlas]);

  return (
    <div ref={rootRef} className="city-hud" data-touch={touch}>
      <div className="city-hud__status">
        <div ref={starsRef} className="city-hud__stars" data-on="false" role="img" aria-label={t('stars', { n: 0 })}>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={17} aria-hidden data-lit="false" />)}
        </div>
        <span ref={cashRef} className="city-hud__cash" />
      </div>
      <div ref={bustRef} className="city-hud__bust" role="status" hidden>
        <span ref={bustTextRef} />
        <i />
      </div>
      <div className="city-hud__mapwrap">
        <canvas ref={miniRef} className="city-hud__mini" aria-hidden />
        <button type="button" className="city-hud__mapkey" onClick={() => onOpen(true)} aria-label={t('openMap')} title={t('openMap')}>
          <MapIcon size={16} aria-hidden />{!touch && <kbd>Tab</kbd>}
        </button>
        <div ref={healthRef} className="city-hud__health" hidden aria-label={t('carHealth')}><i /></div>
      </div>
      <div ref={fareRef} className="city-hud__fare" role="status" hidden>
        <span ref={fareWhereRef} className="city-hud__fare-where" />
        <span ref={fareMetaRef} className="city-hud__fare-meta" />
      </div>
      <div ref={noteRef} className="city-hud__note" role="status" hidden />
      <p ref={sayRef} className="city-hud__say" role="status" hidden />
      <div ref={radioRef} className="city-hud__radio" role="status" hidden>
        <Radio size={15} aria-hidden />
        <span ref={radioNameRef} className="city-hud__radio-name" />
        <span ref={radioLineRef} className="city-hud__radio-line" />
        {!touch && <small>{t('nextStation')}</small>}
      </div>
      <div ref={bustedRef} className="city-hud__busted" role="alert" hidden>
        <b>{t('busted')}</b>
        <span ref={bustedLineRef} />
      </div>
      {touch && (
        <div ref={driveKeysRef} className="city-hud__drivekeys" hidden>
          <button type="button" className="moon-hud__key"
            onPointerDown={(e) => { e.preventDefault(); street()?.horn(true); }}
            onPointerUp={() => street()?.horn(false)} onPointerCancel={() => street()?.horn(false)} onPointerLeave={() => street()?.horn(false)}
            aria-label={t('horn')}>
            <Megaphone size={18} aria-hidden /><span>{t('horn')}</span>
          </button>
          <button type="button" className="moon-hud__key" onClick={() => street()?.radioNext()} aria-label={t('radio')}>
            <Radio size={18} aria-hidden /><span>{t('radio')}</span>
          </button>
        </div>
      )}
      {open && <CityMapPanel street={street} atlas={atlas} onClose={() => onOpen(false)} />}
    </div>
  );
});

/** The whole city, to pick a waypoint on: drawn once, panned and zoomed. */
function CityMapPanel({ street, atlas, onClose }: { street: () => Street | null; atlas: () => Atlas | null; onClose: () => void }) {
  const t = useTranslations('solarSystem.worlds.earth.city');
  const cvRef = useRef<HTMLCanvasElement>(null);
  const view = useRef({ x: 0, z: 0, s: 0.25, ready: false });
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [, setTick] = useState(0);
  const st = street();

  const draw = useCallback(() => {
    const cv = cvRef.current; const at = atlas(); const s = street();
    if (!cv || !at || !s) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth; const h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const v = view.current;
    const city = s.state;
    if (!v.ready) { v.x = city.px; v.z = city.pz; v.s = Math.min(w, h) / 1400; v.ready = true; }
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const S = v.s * dpr;
    const cx = cv.width / 2; const cy = cv.height / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, cv.width, cv.height);
    setView(ctx, cx, cy, S, 0, v.x, v.z);
    // Every cell in view.
    ctx.fillStyle = COLORS.water; ctx.fill(at.water);
    const half = Math.max(cv.width, cv.height) / S / 2 + CELL;
    ctx.lineCap = 'round';
    for (const [kind, width, colour] of [['foot', 0.8, COLORS.foot], ['minor', 1.4, COLORS.minor], ['major', 2.4, COLORS.major]] as const) {
      ctx.strokeStyle = colour; ctx.lineWidth = (width * dpr) / S;
      for (const [k, c] of at.cells) {
        const ccx = Math.floor(k / 2048) - 1000; const ccz = (k % 2048) - 1000;
        if (Math.abs((ccx + 0.5) * CELL - v.x) > half || Math.abs((ccz + 0.5) * CELL - v.z) > half) continue;
        ctx.stroke(c[kind]);
      }
    }
    if (city.route) drawRoute(ctx, city.route, S / dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // The places, named.
    ctx.font = `600 ${12 * dpr}px Geist, system-ui, sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const p of at.map.places) {
      const [x, y] = toScreen(p.x, p.z, cx, cy, S, 0, v.x, v.z);
      blip(ctx, x, y, '#b8b8b4', 3.5 * dpr);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      const label = t(`places.${p.id}`);
      const tw = ctx.measureText(label).width;
      ctx.fillRect(x + 7 * dpr, y - 9 * dpr, tw + 8 * dpr, 18 * dpr);
      ctx.fillStyle = '#f4f4f2';
      ctx.fillText(label, x + 11 * dpr, y);
    }
    const mapCity = { ...city, px: v.x, pz: v.z };
    drawMarks(ctx, mapCity, cx, cy, S, 0, 0, performance.now(), dpr);
    const [px, py] = toScreen(city.px, city.pz, cx, cy, S, 0, v.x, v.z);
    arrow(ctx, px, py, screenAngle(city.yaw, 0), 9 * dpr);
  }, [atlas, street, t]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    // The police and the pilot move: redraw a few times a second while open.
    const id = window.setInterval(draw, 250);
    // Tab closes it as it opened it; Esc closes it before it would pause the game.
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Tab' && !e.repeat) { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', onKey);
    const release = claimEscape(() => { onClose(); return true; });
    return () => { window.removeEventListener('resize', onResize); window.clearInterval(id); window.removeEventListener('keydown', onKey); release(); };
  }, [draw, onClose]);

  const zoomBy = (k: number) => { const v = view.current; v.s = Math.max(0.05, Math.min(3, v.s * k)); draw(); };
  const toWorld = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = e.currentTarget; const r = cv.getBoundingClientRect(); const v = view.current;
    return { x: v.x + (e.clientX - r.left - r.width / 2) / v.s, z: v.z + (e.clientY - r.top - r.height / 2) / v.s };
  };

  return (
    <div className="city-map" role="dialog" aria-label={t('map')}>
      <div className="city-map__head">
        <span>{t('map')}</span>
        <small>{t('mapHint')}</small>
        <button type="button" onClick={onClose} aria-label={t('closeMap')}><X size={16} aria-hidden /></button>
      </div>
      <canvas ref={cvRef} className="city-map__canvas"
        onWheel={(e) => zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2)}
        onPointerDown={(e) => { drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const dx = e.clientX - d.x; const dy = e.clientY - d.y;
          if (!d.moved && Math.hypot(dx, dy) < 6) return;
          d.moved = true;
          const v = view.current;
          v.x -= dx / v.s; v.z -= dy / v.s;
          d.x = e.clientX; d.y = e.clientY;
          draw();
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d || d.moved) return;
          const w = toWorld(e);
          street()?.setWaypoint(w.x, w.z);
          setTick((n) => n + 1);
          draw();
        }} />
      <div className="city-map__side">
        <div className="city-map__zoom">
          <button type="button" onClick={() => zoomBy(1.3)} aria-label={t('zoomIn')}><Plus size={16} aria-hidden /></button>
          <button type="button" onClick={() => zoomBy(1 / 1.3)} aria-label={t('zoomOut')}><Minus size={16} aria-hidden /></button>
        </div>
        <ul className="city-map__places">
          {(atlas()?.map.places ?? []).map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => { street()?.setWaypoint(p.x, p.z); const v = view.current; v.x = p.x; v.z = p.z; setTick((n) => n + 1); draw(); }}>
                {t(`places.${p.id}`)}
              </button>
            </li>
          ))}
        </ul>
        {st?.state.waypoint && (
          <button type="button" className="city-map__clear" onClick={() => { street()?.clearWaypoint(); setTick((n) => n + 1); draw(); }}>
            {t('clearWaypoint')}
          </button>
        )}
      </div>
    </div>
  );
}
