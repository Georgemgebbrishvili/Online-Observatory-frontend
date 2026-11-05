'use client';

import { memo, useId } from 'react';
import { EXPOSURES_S, GAIN, STACK_SIZES, exposureLabel } from '@/lib/observatory-sim/camera';
import { HC_RATES, type MountSettings, type TrackingMode } from '@/lib/observatory-sim/mount-drive';
import type { AltAz } from '@/lib/observatory-sim/safety';
import { Dial, Spark } from './charts';
import type { Frame } from './dialogs';
import Icon from './icons';
import { useCopy } from './copy-context';
import type { PathPoint } from './sky';

export type PointingProps = {
  path: PathPoint[] | null;
  pointing: AltAz | null;
  rows: [string, string][];
  rms: string;
  rmsHistory: number[];
  seeing: string;
  seeingHistory: number[];
  battery: number | null;
  sensor: string;
};

function PointingBase({ path, pointing, rows, rms, rmsHistory, seeing, seeingHistory, battery, sensor }: PointingProps) {
  const t = useCopy();
  return (
    <section className="sdo-panel" aria-labelledby="sdo-point-t">
      <div className="sdo-ph">
        <h2 id="sdo-point-t" className="sdo-ph__t"><Icon name="sky" size={15} />{t.pointing.title}</h2>
        <span className="sdo-ph__id">{t.pointing.altAz}</span>
      </div>
      <div className="sdo-point">
        <Dial path={path} pointing={pointing} />
        <div className="sdo-point__vals">
          {rows.map(([k, v]) => (
            <div key={k}>
              <span className="sdo-lbl">{k}</span>
              <span className="sdo-v">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sdo-stats">
        <div className="sdo-stat">
          <div className="sdo-stat__row"><span className="sdo-lbl">{t.pointing.trackRms}</span><span className="sdo-v sdo-v--sm">{rms}</span></div>
          <Spark values={rmsHistory} color="#e6edff" lo={0} hi={1.4} />
        </div>
        <div className="sdo-stat">
          <div className="sdo-stat__row"><span className="sdo-lbl">{t.seeing}</span><span className="sdo-v sdo-v--sm">{seeing}</span></div>
          <Spark values={seeingHistory} color="#8fb0ff" lo={1} hi={5} />
        </div>
        <div className="sdo-stat">
          <span className="sdo-lbl">{t.pointing.battery}</span>
          <div className="sdo-stat__row">
            <span className="sdo-v sdo-v--sm">{battery === null ? '—' : `${battery}%`}</span>
            <div className="sdo-track" style={{ flexGrow: 1 }}><i style={{ width: `${battery ?? 0}%` }} /></div>
          </div>
        </div>
        <div className="sdo-stat">
          <span className="sdo-lbl">{t.pointing.sensor}</span>
          <span className="sdo-v sdo-v--sm">{sensor}</span>
        </div>
      </div>
    </section>
  );
}

function Stepper({ label, value, onDown, onUp, min, max }: { label: string; value: string; onDown: () => void; onUp: () => void; min: boolean; max: boolean }) {
  const t = useCopy();
  return (
    <div className="sdo-stepper" role="group" aria-label={label}>
      <button type="button" onClick={onDown} disabled={min} aria-label={`${label}: ${t.camera.less}`}><Icon name="minus" size={14} /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={onUp} disabled={max} aria-label={`${label}: ${t.camera.more}`}><Icon name="plus" size={14} /></button>
    </div>
  );
}

export type CameraProps = {
  /** Index into EXPOSURES_S and STACK_SIZES. */
  exp: number;
  subs: number;
  gain: number;
  total: string;
  locked: boolean;
  /** The platform sets the real camera: the controls show, and do nothing. */
  enabled: boolean;
  onExp: (i: number) => void;
  onSubs: (i: number) => void;
  onGain: (v: number) => void;
  onAuto: (() => void) | null;
  refreshNote: string | null;
  /** The live frame's brightness histogram, 32 bins; null with no frame. */
  histogram: number[] | null;
  /** An element whose text completes the panel's name, where several panels share a page. */
  nameId?: string;
  /** Inside a card that already names it: the controls alone. */
  bare?: boolean;
};

/** The live frame's histogram, log-scaled so the sky's peak does not flatten the stars' tail. */
function Histogram({ bins, label }: { bins: number[]; label: string }) {
  const logs = bins.map((v) => Math.log1p(v));
  const max = Math.max(...logs) || 1;
  return (
    <svg className="sdo-cam__hist" width="100%" height="40" viewBox="0 0 256 40" preserveAspectRatio="none" role="img" aria-label={label}>
      {logs.map((v, i) => {
        // Rounded: Math.log1p differs in its last digit between Node and the browser,
        // and an unrounded height is a hydration mismatch.
        const h = v > 0 ? Math.round((2 + (v / max) * 38) * 100) / 100 : 0;
        return <rect key={i} x={i * 8} y={40 - h} width="7" height={h} fill={i >= 31 ? '#e6edff' : '#3b70f6'} opacity=".85" />;
      })}
    </svg>
  );
}

function CameraBase({ exp, subs, gain, total, locked, enabled, onExp, onSubs, onGain, onAuto, refreshNote, histogram, nameId, bare }: CameraProps) {
  const t = useCopy();
  const id = useId();
  const off = locked || !enabled;
  const controls = (
      <div className="sdo-cam">
      <div className="sdo-cam__row">
        <span className="sdo-lbl">{t.camera.exposure}</span>
        <Stepper label={t.camera.exposure} value={exposureLabel(EXPOSURES_S[exp])} onDown={() => onExp(exp - 1)} onUp={() => onExp(exp + 1)} min={off || exp <= 0} max={off || exp >= EXPOSURES_S.length - 1} />
      </div>
      <div className="sdo-cam__row">
        <span className="sdo-lbl">{t.camera.frames}</span>
        <Stepper label={t.camera.frames} value={String(STACK_SIZES[subs])} onDown={() => onSubs(subs - 1)} onUp={() => onSubs(subs + 1)} min={off || subs <= 0} max={off || subs >= STACK_SIZES.length - 1} />
      </div>
      <div className="sdo-cam__gain">
        <div className="sdo-cam__row">
          <label className="sdo-lbl" htmlFor={`${id}-gain`}>{t.camera.gain}</label>
          <span className="sdo-mono" style={{ fontSize: 13 }}>{gain}{gain >= GAIN.hcg ? ' · HCG' : ''}</span>
        </div>
        <input id={`${id}-gain`} className="sdo-range" type="range" min={GAIN.min} max={GAIN.max} step={GAIN.step} value={gain} disabled={off}
          aria-valuetext={`${gain}${gain >= GAIN.hcg ? ', high conversion gain' : ''}`}
          style={{ ['--fill' as string]: `${(gain / GAIN.max) * 100}%`, ['--hcg' as string]: `${(GAIN.hcg / GAIN.max) * 100}%` }} onChange={(e) => onGain(Number(e.target.value))} />
      </div>
      {onAuto && (
        <button type="button" className="sdo-sec" onClick={onAuto} disabled={off}>{t.camera.auto}</button>
      )}
      {histogram && (
        <div className="sdo-cam__gain">
          <span className="sdo-lbl">{t.camera.histogram}</span>
          <Histogram bins={histogram} label={t.camera.histogram} />
        </div>
      )}
      {refreshNote && <p className="sdo-note" style={{ padding: 0 }}>{refreshNote}</p>}
    </div>
  );
  if (bare) return controls;
  return (
    <section className="sdo-panel" aria-labelledby={nameId ? `${id}-t ${nameId}` : `${id}-t`}>
      <div className="sdo-ph">
        <h2 id={`${id}-t`} className="sdo-ph__t"><Icon name="camera" size={15} />{t.camera.title}</h2>
        <span className="sdo-ph__id">{total}</span>
      </div>
      {controls}
    </section>
  );
}

export type HandProps = {
  rate: number;
  onRate: ((v: number) => void) | null;
  tracking: TrackingMode;
  onTracking: ((v: TrackingMode) => void) | null;
  onCentre: () => void;
  canCentre: boolean;
  onSync: (() => void) | null;
  synced: boolean;
  onStop: () => void;
  canStop: boolean;
  onSettings: (() => void) | null;
  /** What the pad does on the real instrument: bounded steps. */
  stepNote: string | null;
  limitNote: string | null;
  commandNote: string | null;
};

function HandControlBase(p: HandProps) {
  const t = useCopy();
  // The desk's panel and the phone's sheet can both be in the document: ids are per instance.
  const titleId = useId();
  const trackId = useId();
  const rateLabel = HC_RATES.find((r) => r.rate === p.rate)?.label ?? '';
  const modes: TrackingMode[] = ['off', 'sidereal', 'lunar', 'solar'];
  return (
    <section className="sdo-panel" aria-labelledby={titleId}>
      <div className="sdo-ph">
        <h2 id={titleId} className="sdo-ph__t"><Icon name="target" size={15} />{t.hand.title}</h2>
        <span className="sdo-ph__id">{p.stepNote ?? t.hand.rate(p.rate, rateLabel)}</span>
      </div>
      <div className="sdo-hand__track">
        <span className="sdo-lbl">{t.hand.slewRate}</span>
        <Stepper label={t.hand.slewRate} value={`${p.rate} · ${rateLabel}`} onDown={() => p.onRate?.(p.rate - 1)} onUp={() => p.onRate?.(p.rate + 1)} min={!p.onRate || p.rate <= 1} max={!p.onRate || p.rate >= 9} />
      </div>
      <div className="sdo-hand__track">
        <span className="sdo-lbl" id={trackId}>{t.hand.tracking}</span>
        <div className="sdo-seg sdo-seg--sm" role="group" aria-labelledby={trackId}>
          {modes.map((m) => (
            <button key={m} type="button" className={p.tracking === m ? 'is-on' : ''} aria-pressed={p.tracking === m} disabled={!p.onTracking} onClick={() => p.onTracking?.(m)}>{t.hand.trackingModes[m]}</button>
          ))}
        </div>
      </div>
      <div className="sdo-hand__foot">
        <button className="sdo-sec" type="button" onClick={p.onCentre} disabled={!p.canCentre} aria-label={t.hand.recentre}>{t.hand.centre}</button>
        <button className="sdo-sec" type="button" disabled={!p.onSync} onClick={() => p.onSync?.()} title={p.onSync ? undefined : t.hand.operatorOnly}>{p.synced ? t.hand.synced : t.hand.sync}</button>
        <button className="sdo-sec" type="button" disabled={!p.onSettings} onClick={() => p.onSettings?.()} title={p.onSettings ? undefined : t.hand.operatorOnly}>{t.hand.settings}</button>
        <button className="sdo-sec sdo-sec--danger" type="button" disabled={!p.canStop} onClick={p.onStop}>{t.hand.stop}</button>
      </div>
      {(p.limitNote || p.commandNote) && <p className="sdo-note sdo-hand__note" role="status">{p.limitNote ?? p.commandNote}</p>}
    </section>
  );
}

export type MountSettingsProps = { settings: MountSettings; onChange: (next: MountSettings) => void };

function Choice<T extends string | number | boolean>({ label, value, options, onPick }: { label: string; value: T; options: Array<[T, string]>; onPick: (v: T) => void }) {
  return (
    <div className="sdo-mount__row">
      <span className="sdo-lbl">{label}</span>
      <div className="sdo-seg sdo-seg--sm" role="group" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={String(v)} type="button" className={value === v ? 'is-on' : ''} aria-pressed={value === v} onClick={() => onPick(v)}>{text}</button>
        ))}
      </div>
    </div>
  );
}

/** The hand control's Scope Setup: anti-backlash, slew limits, GoTo approach, cordwrap. */
function MountSettingsBase({ settings: s, onChange }: MountSettingsProps) {
  const t = useCopy();
  const set = (patch: Partial<MountSettings>) => onChange({ ...s, ...patch });
  return (
    <div className="sdo-mount">
      <div className="sdo-mount__group">
        <span className="sdo-lbl">{t.mount.backlash}</span>
        <div className="sdo-mount__row"><span>{t.mount.backlashAlt}</span><Stepper label={`${t.mount.backlash} · ${t.mount.backlashAlt}`} value={String(s.backlashAlt)} onDown={() => set({ backlashAlt: Math.max(0, s.backlashAlt - 10) })} onUp={() => set({ backlashAlt: Math.min(99, s.backlashAlt + 10) })} min={s.backlashAlt <= 0} max={s.backlashAlt >= 99} /></div>
        <div className="sdo-mount__row"><span>{t.mount.backlashAz}</span><Stepper label={`${t.mount.backlash} · ${t.mount.backlashAz}`} value={String(s.backlashAz)} onDown={() => set({ backlashAz: Math.max(0, s.backlashAz - 10) })} onUp={() => set({ backlashAz: Math.min(99, s.backlashAz + 10) })} min={s.backlashAz <= 0} max={s.backlashAz >= 99} /></div>
      </div>
      <div className="sdo-mount__group">
        <span className="sdo-lbl">{t.mount.limits}</span>
        <div className="sdo-mount__row"><span>{t.mount.altMin}</span><Stepper label={t.mount.altMin} value={`${s.slewAltMin}°`} onDown={() => set({ slewAltMin: Math.max(0, s.slewAltMin - 5) })} onUp={() => set({ slewAltMin: Math.min(s.slewAltMax - 5, s.slewAltMin + 5) })} min={s.slewAltMin <= 0} max={s.slewAltMin >= s.slewAltMax - 5} /></div>
        <div className="sdo-mount__row"><span>{t.mount.altMax}</span><Stepper label={t.mount.altMax} value={`${s.slewAltMax}°`} onDown={() => set({ slewAltMax: Math.max(s.slewAltMin + 5, s.slewAltMax - 5) })} onUp={() => set({ slewAltMax: Math.min(90, s.slewAltMax + 5) })} min={s.slewAltMax <= s.slewAltMin + 5} max={s.slewAltMax >= 90} /></div>
      </div>
      <div className="sdo-mount__group">
        <span className="sdo-lbl">{t.mount.approach}</span>
        <Choice label={t.mount.approachAlt} value={s.approachAlt} options={[[1, t.mount.positive], [-1, t.mount.negative]]} onPick={(v) => set({ approachAlt: v })} />
        <Choice label={t.mount.approachAz} value={s.approachAz} options={[[1, t.mount.positive], [-1, t.mount.negative]]} onPick={(v) => set({ approachAz: v })} />
      </div>
      <div className="sdo-mount__group">
        <Choice label={t.mount.cordwrap} value={s.cordwrap} options={[[false, t.mount.off], [true, t.mount.on]]} onPick={(v) => set({ cordwrap: v })} />
      </div>
      <p className="sdo-note" style={{ padding: 0 }}>{t.mount.note}</p>
    </div>
  );
}

function FrameThumbsBase({ frames, onOpen }: { frames: Frame[]; onOpen: (f: Frame) => void }) {
  const t = useCopy();
  return (
    <>
      {frames.map((f) => (
        <button key={f.id} type="button" className="sdo-thumb" onClick={() => onOpen(f)} aria-label={t.frames.open(f.n, f.targetName)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.dataUrl} alt="" />
          <span>#{f.n}</span>
        </button>
      ))}
    </>
  );
}

export const Pointing = memo(PointingBase);
export const Camera = memo(CameraBase);
export const HandControl = memo(HandControlBase);
export const MountSettingsPanel = memo(MountSettingsBase);
export const FrameThumbs = memo(FrameThumbsBase);
