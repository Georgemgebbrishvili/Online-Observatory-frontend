'use client';

import { useId } from 'react';
import { EXPOSURES_S, GAIN, STACK_SIZES, exposureLabel } from '@/lib/observatory-sim/camera';
import { SCENES } from '@/lib/observatory-sim/metering';
import { useCopy } from './copy-context';
import Icon from './icons';
import { Histogram, Stepper } from './panels';
import type { AeMode, AeState } from './use-auto';

const MIN_S = EXPOSURES_S[0];
const MAX_S = EXPOSURES_S[EXPOSURES_S.length - 1];
const toSlider = (s: number) => Math.round((Math.log(s / MIN_S) / Math.log(MAX_S / MIN_S)) * 1000);
const fromSlider = (v: number) => Number((MIN_S * (MAX_S / MIN_S) ** (v / 1000)).toPrecision(2));

export type ExposurePanelProps = {
  exposureS: number;
  onExposure: ((s: number) => void) | null;
  gain: number;
  onGain: ((g: number) => void) | null;
  /** Index into STACK_SIZES. */
  subs: number;
  onSubs: ((i: number) => void) | null;
  total: string;
  locked: boolean;
  histogram: number[] | null;
  ae: { state: AeState; run: (m: AeMode) => void; stop: () => void; keep: boolean; setKeep: (v: boolean) => void } | null;
};

/** Exposure and gain as capture software sets them, with auto exposure that reads the picture. */
export default function ExposurePanel(p: ExposurePanelProps) {
  const t = useCopy();
  const id = useId();
  const off = p.locked || !p.onExposure;
  const below = EXPOSURES_S.filter((s) => s < p.exposureS * 0.999);
  const above = EXPOSURES_S.filter((s) => s > p.exposureS * 1.001);
  const ae = p.ae;
  const aeText = !ae ? null
    : ae.state.status === 'metering' ? t.hub.ae.metering(ae.state.pass)
    : ae.state.status === 'locked' ? t.hub.ae.locked(ae.state.pass)
    : ae.state.status === 'limit' ? t.hub.ae.limit
    : ae.state.status === 'failed' ? t.hub.ae.failed
    : t.hub.ae.idle;
  return (
    <section className="oh-card oh-exp" aria-label={t.camera.title} data-tab="camera">
      <div className="oh-exp__row">
        <span className="oh-exp__lbl">{t.camera.exposure}</span>
        <Stepper label={t.camera.exposure} value={exposureLabel(p.exposureS)} onDown={() => p.onExposure?.(below[below.length - 1])} onUp={() => p.onExposure?.(above[0])} min={off || below.length === 0} max={off || above.length === 0} />
      </div>
      <input className="oh-ticks" type="range" min={0} max={1000} value={toSlider(p.exposureS)} disabled={off} aria-label={t.camera.exposure} aria-valuetext={exposureLabel(p.exposureS)} onChange={(e) => p.onExposure?.(fromSlider(Number(e.target.value)))} style={{ ['--fill' as string]: `${toSlider(p.exposureS) / 10}%` }} />
      <div className="oh-exp__row">
        <label className="oh-exp__lbl" htmlFor={`${id}-g`}>{t.camera.gain}</label>
        <output className="sdo-mono oh-exp__val">{p.gain}{p.gain >= GAIN.hcg ? ' · HCG' : ''}</output>
      </div>
      <input id={`${id}-g`} className="oh-ticks" type="range" min={GAIN.min} max={GAIN.max} step={GAIN.step} value={p.gain} disabled={off || !p.onGain} onChange={(e) => p.onGain?.(Number(e.target.value))} style={{ ['--fill' as string]: `${(p.gain / GAIN.max) * 100}%` }} />
      {ae && (
        <div className="oh-ae">
          <button type="button" className={`oh-ae__auto${ae.state.running ? ' is-on' : ''}`} onClick={() => (ae.state.running ? ae.stop() : ae.run('auto'))} disabled={off} aria-pressed={ae.state.running}>
            <Icon name="sun" size={16} />{ae.state.running ? t.hub.ae.stop : t.hub.ae.auto}
          </button>
          <div className="oh-ae__modes" role="group" aria-label={t.hub.ae.scene}>
            {SCENES.map((s) => (
              <button key={s} type="button" className={(ae.state.mode === s && ae.state.status !== 'idle') || (ae.state.mode === 'auto' && ae.state.scene === s) ? 'is-on' : ''} onClick={() => ae.run(s)} disabled={off}>{t.hub.ae.scenes[s]}</button>
            ))}
          </div>
          <label className="oh-ae__keep"><input type="checkbox" checked={ae.keep} onChange={(e) => ae.setKeep(e.target.checked)} disabled={off} />{t.hub.ae.keep}</label>
          <p className="oh-ae__status" role="status">
            {ae.state.scene && <b>{t.hub.ae.scenes[ae.state.scene]}</b>}
            {aeText}
            {ae.state.level !== null && <span className="sdo-mono"> · {t.hub.ae.level(Math.round(ae.state.level * 100), ae.state.clipped === null ? 0 : ae.state.clipped * 100)}</span>}
          </p>
        </div>
      )}
      <div className="oh-exp__row">
        <span className="oh-exp__lbl">{t.camera.frames}</span>
        <Stepper label={t.camera.frames} value={String(STACK_SIZES[p.subs])} onDown={() => p.onSubs?.(p.subs - 1)} onUp={() => p.onSubs?.(p.subs + 1)} min={off || !p.onSubs || p.subs <= 0} max={off || !p.onSubs || p.subs >= STACK_SIZES.length - 1} />
      </div>
      {p.histogram && <Histogram bins={p.histogram} label={t.camera.histogram} />}
    </section>
  );
}
