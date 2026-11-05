'use client';

import type { Axis } from '@/lib/observatory-sim/mount-drive';
import { useCopy } from './copy-context';

export type SlewPadProps = {
  enabled: boolean;
  rate: number;
  rateLabel: string;
  onRate: ((v: number) => void) | null;
  onPress: (a: Axis, d: 1 | -1) => void;
  onRelease: (a: Axis) => void;
  onCentre: () => void;
  canCentre: boolean;
};

type Dir = { key: string; label: string; axes: Array<[Axis, 1 | -1]>; angle: number; big: boolean };

/** Holding any arrow slews; letting go stops. A diagonal drives both axes at once, as the hand control's two buttons do. */
export default function SlewPad(p: SlewPadProps) {
  const t = useCopy();
  const dirs: Dir[] = [
    { key: 'n', label: t.hand.up, axes: [['alt', 1]], angle: 0, big: true },
    { key: 'ne', label: `${t.hand.up} · ${t.hand.east}`, axes: [['alt', 1], ['az', 1]], angle: 45, big: false },
    { key: 'e', label: t.hand.east, axes: [['az', 1]], angle: 90, big: true },
    { key: 'se', label: `${t.hand.down} · ${t.hand.east}`, axes: [['alt', -1], ['az', 1]], angle: 135, big: false },
    { key: 's', label: t.hand.down, axes: [['alt', -1]], angle: 180, big: true },
    { key: 'sw', label: `${t.hand.down} · ${t.hand.west}`, axes: [['alt', -1], ['az', -1]], angle: 225, big: false },
    { key: 'w', label: t.hand.west, axes: [['az', -1]], angle: 270, big: true },
    { key: 'nw', label: `${t.hand.up} · ${t.hand.west}`, axes: [['alt', 1], ['az', -1]], angle: 315, big: false },
  ];
  return (
    <div className="oh-slew">
      <div className="oh-slew__plate" role="group" aria-label={t.hub.slew}>
        {dirs.map((d) => {
          const r = d.big ? 38 : 35;
          const a = (d.angle * Math.PI) / 180;
          return (
            <button
              key={d.key}
              type="button"
              className={`oh-slew__b${d.big ? ' is-big' : ''}`}
              style={{ left: `${50 + r * Math.sin(a)}%`, top: `${50 - r * Math.cos(a)}%` }}
              aria-label={d.label}
              disabled={!p.enabled}
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* a synthetic pointer has no capture to take */
                }
                d.axes.forEach(([axis, dir]) => p.onPress(axis, dir));
              }}
              onPointerUp={() => d.axes.forEach(([axis]) => p.onRelease(axis))}
              onPointerCancel={() => d.axes.forEach(([axis]) => p.onRelease(axis))}
              onLostPointerCapture={() => d.axes.forEach(([axis]) => p.onRelease(axis))}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${d.angle}deg)` }}>
                <path d="M12 5l7 11H5z" />
              </svg>
            </button>
          );
        })}
        <button type="button" className="oh-slew__c" onClick={p.onCentre} disabled={!p.canCentre} aria-label={t.hand.recentre} title={t.hand.recentre} />
      </div>
      <RateSlider label={t.hand.slewRate} value={p.rate} text={`${t.hub.rate} ${p.rate}`} title={p.rateLabel} onChange={p.onRate} />
    </div>
  );
}

/** The rate as SharpCap draws it: a filled track and a pill that names the rate. */
export function RateSlider({ label, value, text, title, onChange }: { label: string; value: number; text: string; title?: string; onChange: ((v: number) => void) | null }) {
  const fill = ((value - 1) / 8) * 100;
  return (
    <label className="oh-rate" title={title}>
      <span className="sdo-sr">{label}</span>
      <input type="range" min={1} max={9} step={1} value={value} disabled={!onChange} onChange={(e) => onChange?.(Number(e.target.value))} style={{ ['--fill' as string]: `${fill}%` }} aria-valuetext={title ? `${text} · ${title}` : text} />
      <span className="oh-rate__pill" style={{ left: `calc(${fill}% + ${(0.5 - fill / 100) * 52}px)` }} aria-hidden="true">{text}</span>
    </label>
  );
}
