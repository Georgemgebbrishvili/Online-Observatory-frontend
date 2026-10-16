'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Station } from '@/lib/observatory-sim/sim-stations';
import { TELESCOPE_TARGETS, sortGraded, targetPosition, type TargetKind, type TargetOrder, type TelescopeTarget } from '@/lib/observatory-sim/telescope-targets';
import { AltCurve } from './charts';
import { useCopy } from './copy-context';
import Icon from './icons';
import { plateArt, plateFor } from './plates';
import { altitudePath, bestOf, clock, nightSpan, risesAt, skyNow } from './sky';

export type Frame = {
  id: string;
  n: number;
  dataUrl: string;
  filename: string;
  /** SHA-256 of the PNG bytes, hex. */
  hash: string;
  targetName: string;
  subs: number;
  exposureSec: number;
  capturedAt: number;
  optics: string;
  scale: string;
  seeing: string;
  stationName: string;
  /** What the frame is: the sky model's drawing, or the instrument's output. */
  provenance: string;
};

function Modal({ width, head, tone = '#f0785a', night, onClose, labelledBy, children }: {
  width: number; head: ReactNode; tone?: string; night: boolean; onClose: () => void; labelledBy: string; children: ReactNode;
}) {
  const t = useCopy();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => before?.focus?.();
  }, []);
  return createPortal(
    <div className={`sdo sdo-scrim${night ? ' is-night' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sdo-modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} style={{ maxWidth: width }}>
        <div className="sdo-mh">
          <p className="sdo-mh__t" style={{ color: tone }}>{head}</p>
          <button ref={closeRef} className="sdo-ib" type="button" onClick={onClose} aria-label={t.close}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="sdo-mb">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

const TABS: Array<{ id: 'all' | 'solar' | 'nebula' | 'galaxy' | 'cluster' | 'star'; kinds: TargetKind[] | null }> = [
  { id: 'all', kinds: null },
  { id: 'solar', kinds: ['planet', 'moon'] },
  { id: 'nebula', kinds: ['nebula'] },
  { id: 'galaxy', kinds: ['galaxy'] },
  { id: 'cluster', kinds: ['cluster'] },
  { id: 'star', kinds: ['star'] },
];

const SWATCH: Record<TargetKind, string> = {
  planet: 'radial-gradient(circle at 42% 38%, #f3dcb5 0 14%, #c9a06a 30%, #7f5232 48%, #220e0b 62%)',
  moon: 'radial-gradient(circle at 62% 40%, #f1f0ea 0%, #a6a49e 50%, #38201a 54%, #22100a 100%)',
  galaxy: 'radial-gradient(ellipse 60% 22% at 50% 50%, #fff4de 0%, #eac6b9 40%, #3c1f1b 75%, #220e0b 100%)',
  nebula: 'radial-gradient(ellipse at 45% 55%, #f4a8c2 0 16%, #6d4a6a 40%, #220e0b 70%)',
  cluster: 'radial-gradient(circle at 50% 46%, #fff 0 3%, transparent 5%), radial-gradient(circle at 32% 60%, #fff0df 0 3%, transparent 5%), radial-gradient(circle at 68% 34%, #fff0df 0 3%, transparent 5%), radial-gradient(circle, #783a1d 0, #2a1208 70%)',
  star: 'radial-gradient(circle at 50% 50%, #fff 0 8%, #ffd8bc 18%, #582a1a 40%, #2a1208 70%)',
};

export const displayName = (t: TelescopeTarget) => (t.catalog && t.catalog !== t.name ? `${t.name} · ${t.catalog}` : t.name);
const signed = (v: number, digits = 0) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(digits)}`;

export function TargetsDialog({ night, station, tonightId, onPoint, onClose }: {
  night: boolean; station: Station; tonightId: string | null; onPoint: (t: TelescopeTarget) => void; onClose: () => void;
}) {
  const t = useCopy();
  const [at] = useState(skyNow);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [order, setOrder] = useState<TargetOrder>('zenith');
  const span = useMemo(() => nightSpan(station, new Date(at)), [station, at]);
  const graded = useMemo(
    () => TELESCOPE_TARGETS.map((target) => ({ target, position: targetPosition(target, station, new Date(at)), visible: true })),
    [station, at],
  );
  const rows = useMemo(() => {
    const kinds = TABS.find((t) => t.id === tab)?.kinds ?? null;
    const q = query.trim().toLowerCase();
    const list = graded.filter(({ target }) =>
      (!kinds || kinds.includes(target.kind)) && (!q || `${target.name} ${target.catalog ?? ''}`.toLowerCase().includes(q)),
    );
    const sorted = sortGraded(list, order);
    const first = sorted.findIndex((g) => g.target.id === tonightId);
    if (first > 0) sorted.unshift(...sorted.splice(first, 1));
    return sorted.slice(0, 60);
  }, [graded, tab, query, order, tonightId]);
  const paths = useMemo(() => new Map(rows.map((r) => [r.target.id, altitudePath(r.target, station, span, 30)])), [rows, station, span]);

  return (
    <Modal width={860} night={night} onClose={onClose} labelledBy="sdo-targets-t" head={<><Icon name="search" size={16} /><span id="sdo-targets-t">{t.targets.title}</span></>}>
      <div className="sdo-targets">
        <div className="sdo-targets__top">
          <label className="sdo-search">
            <Icon name="search" size={16} />
            <span className="sdo-sr">{t.targets.search}</span>
            <input type="search" placeholder={t.targets.search} value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="sdo-seg" role="group" aria-label={t.targets.order}>
            {([['zenith', t.targets.zenith], ['brightest', t.targets.brightest], ['name', t.targets.name]] as const).map(([id, label]) => (
              <button key={id} type="button" className={order === id ? 'is-on' : ''} aria-pressed={order === id} onClick={() => setOrder(id)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="sdo-tabs" role="group" aria-label={t.targets.kind}>
          {TABS.map((item) => (
            <button key={item.id} type="button" className={`sdo-tab${tab === item.id ? ' is-on' : ''}`} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{t.targets[item.id]}</button>
          ))}
        </div>
        <ul className="sdo-tlist">
          {rows.map(({ target, position }) => {
            const low = position.altitude < 0;
            const card = plateFor(target.id);
            const tonight = target.id === tonightId;
            return (
              <li key={target.id}>
                <button type="button" className={`sdo-tgt${low ? ' is-low' : ''}`} onClick={() => onPoint(target)}>
                  <span className="sdo-sw" style={card ? undefined : { background: SWATCH[target.kind] }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {card && <img src={plateArt(card)} alt="" loading="lazy" />}
                  </span>
                  <span className="sdo-tgt__name">
                    <b><span>{displayName(target)}</span>{tonight && <span className="sdo-badge sdo-badge--best">{t.targets.tonightBadge}</span>}</b>
                    <span className="sdo-lbl">{t.targets.kinds[target.kind]} · {t.targets.mag} {signed(position.mag, 1).replace('+', '')}</span>
                  </span>
                  <span className="sdo-tgt__col sdo-tgt__curve">
                    <span className="sdo-lbl">{t.targets.tonight}</span>
                    <AltCurve path={paths.get(target.id) ?? []} span={span} now={at} color={low ? '#ff7a6b' : '#f0785a'} />
                  </span>
                  <span className="sdo-tgt__now">
                    <span className="sdo-lbl">{t.targets.now}</span>
                    <b className={low ? 'is-low' : ''}>{signed(position.altitude)}°</b>
                  </span>
                  <span className={`sdo-btn${low ? ' sdo-btn--ghost' : tonight ? ' sdo-btn--primary' : ''}`}>{low ? t.targets.notRisen : t.targets.point}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="sdo-targets__foot">
          <span>{t.targets.foot(station.name)}</span>
          <span>{t.targets.refusedBelow}</span>
        </div>
      </div>
    </Modal>
  );
}

export type Refusal = { target: TelescopeTarget; reason: string };

export function RefusedDialog({ night, station, refusal, onChoose, onClose }: { night: boolean; station: Station; refusal: Refusal; onChoose: () => void; onClose: () => void }) {
  const t = useCopy();
  const [at] = useState(skyNow);
  const { target } = refusal;
  const altitude = targetPosition(target, station, new Date(at)).altitude;
  const span = useMemo(() => nightSpan(station, new Date(at)), [station, at]);
  const path = useMemo(() => altitudePath(target, station, span, 30), [target, station, span]);
  const rises = useMemo(() => (altitude > 0 ? null : risesAt(target, station, new Date(at))), [altitude, target, station, at]);
  const best = bestOf(path);
  const name = displayName(target).split(' · ')[0];
  const title = altitude <= 0 ? t.refused.notRisen(name) : t.refused.refused(name);
  const text = altitude <= 0 ? t.refused.below(station.name) : t.refused.reason(refusal.reason.replace(/^./, (c) => c.toUpperCase()));
  return (
    <Modal width={560} night={night} onClose={onClose} labelledBy="sdo-refused-t" tone="#ff9a8e" head={<><span className="sdo-led is-warn" />{t.refused.head}</>}>
      <div className="sdo-refused">
        <div className="sdo-refused__top">
          <span className="sdo-refused__icon"><Icon name="alert" size={22} /></span>
          <div>
            <h2 id="sdo-refused-t">{title}</h2>
            <p>{text}</p>
          </div>
        </div>
        <div className="sdo-refused__curve">
          <AltCurve path={path} span={span} now={at} color="#ff7a6b" w={240} h={40} />
          <span>
            {altitude <= 0 && <>{t.refused.rises} {rises ? clock(rises, station.timezone) : '—'}<br /></>}
            {t.refused.best} {best.altitude > 0 ? `${clock(best.t, station.timezone)} · ${best.altitude.toFixed(0)}°` : t.refused.notUpTonight}
          </span>
        </div>
        <div className="sdo-refused__btns">
          <button className="sdo-btn sdo-btn--ghost" type="button" onClick={onClose}>{t.refused.cancel}</button>
          <button className="sdo-btn sdo-btn--primary" type="button" onClick={onChoose}>{t.refused.chooseAnother}</button>
        </div>
      </div>
    </Modal>
  );
}

/** Luminance histogram of the frame itself, fifty bins. */
function useHistogram(src: string) {
  const [bins, setBins] = useState<number[] | null>(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 96;
      c.height = 96;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 96, 96);
      const { data } = ctx.getImageData(0, 0, 96, 96);
      const out = new Array(50).fill(0);
      for (let i = 0; i < data.length; i += 4) out[Math.min(49, Math.floor(((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 256) * 50))]++;
      // Log scale: the sky floor would flatten everything else.
      setBins(out.map((v) => Math.log1p(v)));
    };
    img.src = src;
  }, [src]);
  return bins;
}

export function CaptureDialog({ night, frame, onClose }: { night: boolean; frame: Frame; onClose: () => void }) {
  const t = useCopy();
  const bins = useHistogram(frame.dataUrl);
  const [copied, setCopied] = useState(false);
  const max = bins ? Math.max(...bins) || 1 : 1;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(frame.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard refused; the hash is on screen to select */
    }
  };
  return (
    <Modal width={860} night={night} onClose={onClose} labelledBy="sdo-capture-t" tone="#e2b85a" head={<><span className="sdo-led is-go" />{t.capture.head}</>}>
      <div className="sdo-capture">
        <div className="sdo-capture__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frame.dataUrl} alt={t.capture.frameAlt(frame.targetName, frame.n)} />
          <span className="sdo-hud sdo-glass sdo-hud--tl">{t.capture.hud(frame.n, frame.subs, frame.exposureSec)}</span>
        </div>
        <div className="sdo-capture__info">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="sdo-lbl" style={{ color: '#f0785a' }}>{frame.stationName}</span>
            <h2 id="sdo-capture-t">{frame.targetName}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sdo-stat__row">
              <span className="sdo-lbl">{t.capture.stack}</span>
              <span className="sdo-mono" style={{ fontSize: 12, color: '#e2b85a' }}>{t.capture.complete(frame.subs)}</span>
            </div>
            <div className="sdo-track"><i style={{ width: '100%' }} /></div>
          </div>
          <svg width="100%" height="54" viewBox="0 0 400 54" preserveAspectRatio="none" role="img" aria-label={t.capture.histogram}>
            <defs>
              <linearGradient id="sdo-hg" x1="0" x2="1">
                <stop offset="0" stopColor="#e3482c" />
                <stop offset="1" stopColor="#e2b85a" />
              </linearGradient>
            </defs>
            {bins?.map((v, i) => {
              const h = 3 + (v / max) * 51;
              return <rect key={i} x={i * 8} y={54 - h} width="7" height={h} fill="url(#sdo-hg)" opacity=".85" />;
            })}
          </svg>
          <dl className="sdo-dl">
            {([
              [t.capture.captured, `${clock(frame.capturedAt, 'UTC')} UTC`],
              [t.capture.exposure, `${frame.subs} × ${frame.exposureSec} s`],
              [t.capture.optics, frame.optics],
              [t.capture.seeing, frame.seeing],
              [t.capture.scale, frame.scale],
              [t.capture.provenance, frame.provenance],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="sdo-lbl">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="sdo-lbl">SHA-256</span>
            <span className="sdo-hash">{frame.hash}</span>
          </div>
          <div className="sdo-row">
            <a className="sdo-btn sdo-btn--primary" href={frame.dataUrl} download={frame.filename}>
              <Icon name="download" size={16} />{t.capture.download}
            </a>
            <button className="sdo-btn" type="button" onClick={() => void copy()}>
              <Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? t.capture.copied : t.capture.copyHash}
            </button>
            <button className="sdo-btn sdo-btn--ghost" type="button" onClick={onClose}>{t.capture.keepObserving}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** A plain sheet for the phone: the station list, the hand control. */
export function SheetDialog({ night, title, onClose, children }: { night: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal width={520} night={night} onClose={onClose} labelledBy="sdo-sheet-t" head={<span id="sdo-sheet-t">{title}</span>}>
      <div className="sdo-psheet">{children}</div>
    </Modal>
  );
}
