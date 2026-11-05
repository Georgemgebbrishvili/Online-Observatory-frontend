'use client';

import { useRef } from 'react';
import { useCopy } from './copy-context';
import { RateSlider } from './slew-pad';

/** The hold speeds, steps a second, as the hub measured the AUX focuser: 1 = 2 steps/s up to 9 = 350. */
export const FOCUS_SPEEDS = [2, 5, 10, 20, 40, 80, 150, 250, 350] as const;

export type FocusDialProps = {
  position: number | null;
  enabled: boolean;
  moving: boolean;
  rate: number;
  onRate: ((v: number) => void) | null;
  /** Turn by this many steps: a drag of the dial. */
  onNudge: (steps: number) => void;
  /** Hold a direction, 0 to stop: the two rotate buttons. */
  onHold: (dir: -1 | 0 | 1) => void;
};

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

/** The focuser as a knob: drag it round, or hold a rotate button. One turn of the dial is four seconds at the chosen speed. */
export default function FocusDial(p: FocusDialProps) {
  const t = useCopy();
  const drag = useRef<{ angle: number; carry: number } | null>(null);
  const speed = FOCUS_SPEEDS[p.rate - 1];
  const perTurn = speed * 4;
  const angle = p.position === null ? 0 : ((p.position % perTurn) / perTurn) * 360;
  const at = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };
  const hold = (dir: -1 | 1, label: string, cls: string) => (
    <button
      type="button"
      className={`oh-dial__rot ${cls}`}
      aria-label={label}
      disabled={!p.enabled}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* a synthetic pointer has no capture to take */
        }
        p.onHold(dir);
      }}
      onPointerUp={() => p.onHold(0)}
      onPointerCancel={() => p.onHold(0)}
      onLostPointerCapture={() => p.onHold(0)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {dir < 0 ? <path d="M7 7a7 7 0 1 1-2 6M7 3v4h4" /> : <path d="M17 7a7 7 0 1 0 2 6M17 3v4h-4" />}
      </svg>
    </button>
  );
  return (
    <div className="oh-dial">
      <div
        className={`oh-dial__knob${p.moving ? ' is-moving' : ''}${p.enabled ? '' : ' is-off'}`}
        role="slider"
        aria-label={t.hub.focuser.title}
        aria-valuenow={p.position ?? undefined}
        aria-valuetext={p.position === null ? '—' : String(p.position)}
        tabIndex={p.enabled ? 0 : -1}
        onKeyDown={(e) => {
          if (!p.enabled) return;
          const step = e.shiftKey ? speed : Math.max(1, Math.round(speed / 10));
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); p.onNudge(step); }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); p.onNudge(-step); }
        }}
        onPointerDown={(e) => {
          if (!p.enabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { angle: at(e), carry: 0 };
        }}
        onPointerMove={(e) => {
          const g = drag.current;
          if (!g) return;
          const a = at(e);
          const delta = ((a - g.angle + 540) % 360) - 180;
          g.angle = a;
          g.carry += (delta / 360) * perTurn;
          const whole = Math.trunc(g.carry);
          if (whole !== 0) {
            g.carry -= whole;
            p.onNudge(whole);
          }
        }}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="94" className="oh-dial__rim" />
          <circle cx="100" cy="100" r="84" className="oh-dial__face" />
          {TICKS.map((d) => (
            <line key={d} x1="100" y1="22" x2="100" y2={d % 90 === 0 ? 34 : 30} transform={`rotate(${d} 100 100)`} className="oh-dial__tick" />
          ))}
          <g transform={`rotate(${angle} 100 100)`}>
            <circle cx="100" cy="42" r="8" className="oh-dial__dot" />
          </g>
        </svg>
        <output className="oh-dial__pos sdo-mono">{p.position ?? '—'}</output>
      </div>
      <div className="oh-dial__row">
        {hold(-1, t.hand.focusIn, 'is-in')}
        <RateSlider label={t.hub.focuser.speed} value={p.rate} text={`${t.hub.rate} ${p.rate}`} title={`${speed} ${t.hub.focuser.stepsPerS}`} onChange={p.onRate} />
        {hold(1, t.hand.focusOut, 'is-out')}
      </div>
    </div>
  );
}
