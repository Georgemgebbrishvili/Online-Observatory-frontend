'use client';

import { memo, type ReactNode, type RefObject } from 'react';
import { ROIS, type RoiPreset } from '@/lib/observatory-sim/camera';
import { TRAINS, type OpticalTrainId } from '@/lib/observatory-sim/optics';
import { useCopy } from './copy-context';
import Icon from './icons';

const RULER = (() => {
  const lines: string[] = [];
  for (let i = 0; i <= 900; i += 15) {
    const L = i % 150 === 0 ? 9 : 4;
    lines.push(`M${i} 0v${L}M${i} 600v-${L}`);
  }
  for (let i = 0; i <= 600; i += 15) {
    const L = i % 150 === 0 ? 9 : 4;
    lines.push(`M0 ${i}h${L}M900 ${i}h-${L}`);
  }
  return lines.join('');
})();

function Reticle() {
  return (
    <svg className="sdo-overlay" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g fill="none">
        <path d="M450 40v160M450 400v160M120 300h200M580 300h200" stroke="rgba(243, 246, 251, .22)" vectorEffect="non-scaling-stroke" />
        <circle cx="450" cy="300" r="60" stroke="rgba(243, 246, 251, .16)" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

export type ViewStageProps = {
  viewRef: RefObject<HTMLDivElement | null>;
  /** The camera's picture: the sky model's canvas, or the platform's stream. */
  feed: ReactNode | null;
  /** The feed is a stream: it keeps its own aspect and is never drawn over. */
  stream: boolean;
  train: OpticalTrainId;
  onTrain: ((t: OpticalTrainId) => void) | null;
  roi: RoiPreset['id'];
  onRoi: ((r: RoiPreset['id']) => void) | null;
  reticle: boolean;
  onReticle: () => void;
  full: boolean;
  onFull: () => void;
  status: { text: string; go: boolean; blink: boolean };
  /** The running exposure, 0–1, under the status pill; null at video rate or off. */
  exposing: number | null;
  /** What the field is going through: below the horizon, cloud, dew. A warning is red. */
  alerts: Array<{ text: string; warn: boolean }>;
  hudLive: [string, string, string];
  hudTarget: [string, string, string | null] | null;
  hudField: [string, string];
  /** Under the frame, always: what is drawn here is an illustration (ADR-052). */
  caption: string;
  idle: { title: string; text: string; note?: string } | null;
};

/** What the field is going through, over the picture: a warning is red, a passing condition is not. */
export function ConditionAlerts({ alerts }: { alerts: ViewStageProps['alerts'] }) {
  const t = useCopy();
  if (alerts.length === 0) return null;
  return (
    <ul className="sdo-alerts" aria-label={t.stage.conditions}>
      {alerts.map((a) => (
        <li key={a.text} className={`sdo-pill sdo-glass${a.warn ? ' is-warn' : ''}`}><span className={`sdo-led ${a.warn ? 'is-warn' : 'is-hold'}`} />{a.text}</li>
      ))}
    </ul>
  );
}

function ViewStage(p: ViewStageProps) {
  const t = useCopy();
  const trains = TRAINS.map((train) => (
    <button key={train.id} type="button" className={p.train === train.id ? 'is-on' : ''} aria-pressed={p.train === train.id} title={train.label} disabled={!p.onTrain} onClick={() => p.onTrain?.(train.id)}>
      {train.short}
    </button>
  ));
  const rois = ROIS.map((roi) => (
    <button key={roi.id} type="button" className={p.roi === roi.id ? 'is-on' : ''} aria-pressed={p.roi === roi.id} title={roi.label} disabled={!p.onRoi} onClick={() => p.onRoi?.(roi.id)}>
      {roi.id === 'full' ? 'Full' : roi.id === '1080' ? '1080' : '640'}
    </button>
  ));
  const toggles = (
    <button className={`sdo-ib${p.reticle ? ' is-on' : ''}`} type="button" onClick={p.onReticle} aria-pressed={p.reticle} aria-label={t.stage.reticle} title={t.stage.reticle}><Icon name="target" /></button>
  );

  return (
    <section className={`sdo-view${p.full ? ' is-full' : ''}${p.status.go ? ' is-go' : ''}`} aria-label={t.stage.aria}>
      <div className="sdo-view__sky" aria-hidden="true" />
      <div className={`sdo-view__feed${p.stream ? ' is-stream' : ''}`} ref={p.viewRef}>{p.feed}</div>
      {p.reticle && p.feed && <Reticle />}
      <svg className="sdo-overlay" viewBox="0 0 900 600" preserveAspectRatio="none" aria-hidden="true">
        <path d={RULER} stroke="rgba(243, 246, 251, .35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {!p.stream && <div className="sdo-scan" />}
      <div className="sdo-vignette" />

      <div className="sdo-tools sdo-glass">
        <span className="sdo-lbl">{t.stage.optics}</span>
        <div className="sdo-seg" role="group" aria-label={t.stage.train}>{trains}</div>
        <span className="sdo-tools__sep" />
        <div className="sdo-seg" role="group" aria-label={t.stage.roi}>{rois}</div>
        <span className="sdo-tools__sep" />
        {toggles}
        <button className={`sdo-ib${p.full ? ' is-on' : ''}`} type="button" onClick={p.onFull} aria-pressed={p.full} aria-label={t.stage.fullView} title={t.stage.fullView}><Icon name="expand" /></button>
      </div>

      <div className="sdo-status" role="status">
        <span className={`sdo-pill sdo-glass${p.status.go ? ' is-go' : ''}`}>
          <span className={`sdo-led ${p.status.go ? 'is-go' : 'is-hold'}${p.status.blink ? ' sdo-blink' : ''}`} />
          {p.status.text}
        </span>
        {p.exposing !== null && (
          <span className="sdo-expose" aria-hidden="true"><i style={{ width: `${Math.round(p.exposing * 100)}%` }} /></span>
        )}
      </div>
      <ConditionAlerts alerts={p.alerts} />
      <div className="sdo-hud sdo-glass sdo-hud--tl"><span style={{ color: '#ff8090' }}>{p.hudLive[0]}</span> · {p.hudLive[1]}<br />{p.hudLive[2]}</div>
      {p.hudTarget && (
        <div className="sdo-hud sdo-glass sdo-hud--bl"><span style={{ color: '#ff8090' }}>{p.hudTarget[0]}</span><br />{p.hudTarget[1]}{p.hudTarget[2] && <><br />{p.hudTarget[2]}</>}</div>
      )}
      <div className="sdo-hud sdo-glass sdo-hud--br"><span>{p.hudField[0]}</span><span className="sdo-hud__more"><br />{p.hudField[1]}</span></div>
      <p className="sdo-hud sdo-glass sdo-hud--bc sdo-caption">{p.caption}</p>

      {p.idle && (
        <div className="sdo-idle sdo-glass">
          <span className="sdo-idle__icon"><Icon name="camera" size={24} /></span>
          <p className="sdo-idle__title">{p.idle.title}</p>
          <p className="sdo-idle__text">{p.idle.text}</p>
          {p.idle.note && <p className="sdo-idle__note"><span className="sdo-led is-go" />{p.idle.note}</p>}
        </div>
      )}

      <div className="sdo-phone sdo-pbar sdo-glass">
        <div className="sdo-seg" role="group" aria-label={t.stage.train}>{trains}</div>
        <div>{toggles}</div>
      </div>
    </section>
  );
}

export default memo(ViewStage);
