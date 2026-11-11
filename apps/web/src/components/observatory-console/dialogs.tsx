'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Station } from '@/lib/observatory-sim/sim-stations';
import { targetPosition, type TelescopeTarget } from '@/lib/observatory-sim/telescope-targets';
import { exposureLabel } from '@/lib/observatory-sim/camera';
import { SHOWPIECE_BY_ID } from '@/lib/observatory-sim/showpieces';
import type { SkyBodyName } from '@/features/sky3d/astro';
import type { Locale } from '@/i18n/config';
import { nightSkyCopy, starKa } from '@/i18n/resources/night-sky';
import { AltCurve } from './charts';
import { useCopy } from './copy-context';
import Icon from './icons';
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
  gain: number;
  /** When the stack's first frame began, and when the last ended. */
  startedAt: number;
  capturedAt: number;
  optics: string;
  scale: string;
  seeing: string;
  stationName: string;
  /** What the frame is: the sky model's drawing, or the instrument's output. */
  provenance: string;
};

function Modal({ width, head, tone = '#8fb0ff', night, onClose, labelledBy, children }: {
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

export const displayName = (t: TelescopeTarget) => (t.catalog && t.catalog !== t.name ? `${t.name} · ${t.catalog}` : t.name);

/**
 * A target's name as the console says it: in Georgian the planet's, the star's or the
 * showpiece's Georgian name, and for the rest of the catalogue its designation.
 */
export function targetName(t: TelescopeTarget, locale: Locale): string {
  const english = displayName(t).split(' · ')[0];
  if (locale !== 'ka') return english;
  if (t.body) return nightSkyCopy.ka.bodies[(t.id[0].toUpperCase() + t.id.slice(1)) as SkyBodyName] ?? english;
  if (t.id.startsWith('star-')) return starKa[t.id.slice(5)] ?? english;
  return SHOWPIECE_BY_ID.get(t.id)?.name.ka ?? t.catalog ?? english;
}
export type Refusal = { target: TelescopeTarget; reason: string };

export function RefusedDialog({ night, station, refusal, name, onChoose, onClose }: { night: boolean; station: Station; refusal: Refusal; name: string; onChoose: () => void; onClose: () => void }) {
  const t = useCopy();
  const [at] = useState(skyNow);
  const { target } = refusal;
  const altitude = targetPosition(target, station, new Date(at)).altitude;
  const span = useMemo(() => nightSpan(station, new Date(at)), [station, at]);
  const path = useMemo(() => altitudePath(target, station, span, 30), [target, station, span]);
  const rises = useMemo(() => (altitude > 0 ? null : risesAt(target, station, new Date(at))), [altitude, target, station, at]);
  const best = bestOf(path);
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
          <span className="sdo-hud sdo-glass sdo-hud--tl">{t.capture.hud(frame.n, frame.subs, exposureLabel(frame.exposureSec))}</span>
        </div>
        <div className="sdo-capture__info">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="sdo-lbl" style={{ color: '#8fb0ff' }}>{frame.stationName}</span>
            <h2 id="sdo-capture-t">{frame.targetName}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="sdo-stat__row">
              <span className="sdo-lbl">{t.capture.stack}</span>
              <span className="sdo-mono" style={{ fontSize: 13, color: '#e2b85a' }}>{t.capture.complete(frame.subs)}</span>
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
              [t.capture.captured, `${clock(frame.startedAt, 'UTC', true)}–${clock(frame.capturedAt, 'UTC', true)} UTC`],
              [t.capture.exposure, `${frame.subs} × ${exposureLabel(frame.exposureSec)}`],
              [t.capture.integration, exposureLabel(Number((frame.subs * frame.exposureSec).toPrecision(4)))],
              [t.capture.gain, String(frame.gain)],
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
