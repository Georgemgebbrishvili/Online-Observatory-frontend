'use client';

import { memo } from 'react';
import type { Axis } from '@/lib/observatory-sim/mount-drive';
import type { AltAz } from '@/lib/observatory-sim/safety';
import type { Station } from '@/lib/observatory-sim/sim-stations';
import { Dial, Spark } from './charts';
import type { Frame } from './dialogs';
import Icon from './icons';
import { useCopy } from './copy-context';
import { plateArt } from './plates';
import type { PathPoint } from './sky';

function QuickStartBase({ name, plate, onStart }: { name: string | null; plate: string | null; onStart: () => void }) {
  const t = useCopy();
  return (
    <section className="sdo-panel sdo-quick" aria-labelledby="sdo-quick-t">
      {plate && (
        <span className="sdo-quick__planet" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={plateArt(plate)} alt="" />
        </span>
      )}
      <div className="sdo-ph"><h2 className="sdo-ph__t"><Icon name="bolt" size={15} />{t.quick.title}</h2></div>
      <div className="sdo-quick__body">
        <p id="sdo-quick-t" className="sdo-quick__title">{t.quick.observe(name)}</p>
        <p className="sdo-quick__text">{t.quick.text(name)}</p>
        <button className="sdo-btn sdo-btn--primary" type="button" onClick={onStart} disabled={!name} style={{ width: '100%' }}>
          <Icon name="play" size={16} />{t.quick.start(name)}<span className="sdo-kbd">S</span>
        </button>
      </div>
    </section>
  );
}

export type StationRow = { station: Station; dark: boolean; twilight: boolean; local: string };

function StationListBase({ rows, selectedId, onPick }: { rows: StationRow[]; selectedId: string | null; onPick: (s: Station) => void }) {
  const t = useCopy();
  return (
    <div className="sdo-scopes__list">
      {rows.map(({ station: s, dark, twilight, local }) =>
        s.soon ? (
          <div key={s.id} className={`sdo-stn is-soon${s.soonNote ? ' is-next' : ''}`} aria-disabled="true">
            <span className="sdo-led" aria-hidden="true" />
            <span className="sdo-stn__name">
              <b>{s.name}</b>
              <span className="sdo-stn__soon">{s.soonNote ?? t.telescopes.comingSoon}</span>
            </span>
          </div>
        ) : (
        <button key={s.id} type="button" className={`sdo-stn${s.id === selectedId ? ' is-on' : ''}`} aria-pressed={s.id === selectedId} onClick={() => onPick(s)}>
          <span className={`sdo-led${dark ? ' is-go' : twilight ? ' is-hold' : ''}`} aria-label={dark ? t.telescopes.darkNow : twilight ? t.telescopes.twilight : t.telescopes.daylight} />
          <span className="sdo-stn__name">
            <b>{s.name}</b>
            <span>{s.site}</span>
          </span>
          <span className="sdo-stn__meta">
            <span>{local}</span>
            <span className="sdo-badge">B{s.bortle}</span>
          </span>
        </button>
        ),
      )}
    </div>
  );
}

function TelescopesBase({ rows, selectedId, onPick, sky }: { rows: StationRow[]; selectedId: string | null; onPick: (s: Station) => void; sky: [string, string][] }) {
  const t = useCopy();
  return (
    <section className="sdo-panel sdo-scopes" aria-labelledby="sdo-scopes-t">
      <div className="sdo-ph">
        <h2 id="sdo-scopes-t" className="sdo-ph__t"><Icon name="signal" size={15} />{t.telescopes.title}</h2>
        <span className="sdo-ph__id">{t.telescopes.live}</span>
      </div>
      <StationList rows={rows} selectedId={selectedId} onPick={onPick} />
      <div className="sdo-hr" style={{ marginTop: 8 }} />
      <div className="sdo-skyrow">
        {sky.map(([k, v]) => (
          <div key={k}>
            <span className="sdo-lbl">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function SessionBase({ elapsed, connected, onEnd }: { elapsed: string; connected: boolean; onEnd: () => void }) {
  const t = useCopy();
  return (
    <section className="sdo-panel" aria-labelledby="sdo-session-t">
      <div className="sdo-ph">
        <h2 id="sdo-session-t" className="sdo-ph__t">{t.session.title}</h2>
        <span className="sdo-ph__id">{elapsed}</span>
      </div>
      <div className="sdo-session__row">
        <button className="sdo-btn sdo-btn--danger" type="button" onClick={onEnd} disabled={!connected}>
          <Icon name="park" size={14} />{t.session.parkEnd}
        </button>
      </div>
    </section>
  );
}

function PointingBase({ path, pointing, rows, rms, rmsHistory, seeing, seeingHistory, battery, sensor }: {
  path: PathPoint[] | null; pointing: AltAz | null; rows: [string, string][]; rms: string; rmsHistory: number[];
  seeing: string; seeingHistory: number[]; battery: number | null; sensor: string;
}) {
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
          <Spark values={rmsHistory} color="#e2b85a" lo={0} hi={1.4} />
        </div>
        <div className="sdo-stat">
          <div className="sdo-stat__row"><span className="sdo-lbl">{t.seeing}</span><span className="sdo-v sdo-v--sm">{seeing}</span></div>
          <Spark values={seeingHistory} color="#f0785a" lo={1} hi={5} />
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

function CameraBase({ exp, subs, gain, total, locked, onExp, onSubs, onGain }: {
  exp: number; subs: number; gain: number; total: string; locked: boolean; onExp: (v: number) => void; onSubs: (v: number) => void; onGain: (v: number) => void;
}) {
  const t = useCopy();
  return (
    <section className="sdo-panel" aria-labelledby="sdo-cam-t">
      <div className="sdo-ph">
        <h2 id="sdo-cam-t" className="sdo-ph__t"><Icon name="camera" size={15} />{t.camera.title}</h2>
        <span className="sdo-ph__id">{total}</span>
      </div>
      <div className="sdo-cam">
        <div className="sdo-cam__row">
          <span className="sdo-lbl">{t.camera.exposure}</span>
          <Stepper label={t.camera.exposure} value={`${exp} s`} onDown={() => onExp(exp / 2)} onUp={() => onExp(exp * 2)} min={locked || exp <= 1} max={locked || exp >= 64} />
        </div>
        <div className="sdo-cam__row">
          <span className="sdo-lbl">{t.camera.frames}</span>
          <Stepper label={t.camera.frames} value={String(subs)} onDown={() => onSubs(subs - 1)} onUp={() => onSubs(subs + 1)} min={locked || subs <= 1} max={locked || subs >= 64} />
        </div>
        <div className="sdo-cam__gain">
          <div className="sdo-cam__row">
            <label className="sdo-lbl" htmlFor="sdo-gain">{t.camera.gain}</label>
            <span className="sdo-mono" style={{ fontSize: 12 }}>{gain}</span>
          </div>
          <input id="sdo-gain" className="sdo-range" type="range" min={0} max={400} step={10} value={gain} disabled={locked}
            style={{ ['--fill' as string]: `${(gain / 400) * 100}%` }} onChange={(e) => onGain(Number(e.target.value))} />
        </div>
      </div>
    </section>
  );
}

function PadButton({ axis, dir, icon, label, enabled, onPress, onRelease }: {
  axis: Axis; dir: 1 | -1; icon: 'up' | 'down' | 'left' | 'right'; label: string; enabled: boolean;
  onPress: (a: Axis, d: 1 | -1) => void; onRelease: (a: Axis) => void;
}) {
  return (
    <button type="button" className="sdo-padb" aria-label={label} disabled={!enabled}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPress(axis, dir); }}
      onPointerUp={() => onRelease(axis)} onPointerCancel={() => onRelease(axis)} onLostPointerCapture={() => onRelease(axis)}>
      <Icon name={icon} />
    </button>
  );
}

function HandControlBase({ rate, onRate, tracking, onTracking, onFocus, focus, enabled, onPress, onRelease, onCentre, canCentre }: {
  rate: number; onRate: (v: number) => void; tracking: boolean; onTracking: (v: boolean) => void; focus: number; onFocus: (d: number) => void;
  enabled: boolean; onPress: (a: Axis, d: 1 | -1) => void; onRelease: (a: Axis) => void; onCentre: () => void; canCentre: boolean;
}) {
  const t = useCopy();
  return (
    <section className="sdo-panel" aria-labelledby="sdo-hand-t">
      <div className="sdo-ph">
        <h2 id="sdo-hand-t" className="sdo-ph__t"><Icon name="target" size={15} />{t.hand.title}</h2>
        <span className="sdo-ph__id">{t.hand.rate(rate)}</span>
      </div>
      <div className="sdo-hand">
        <div className="sdo-pad">
          <span />
          <PadButton axis="alt" dir={1} icon="up" label={t.hand.up} enabled={enabled} onPress={onPress} onRelease={onRelease} />
          <span />
          <PadButton axis="az" dir={-1} icon="left" label={t.hand.west} enabled={enabled} onPress={onPress} onRelease={onRelease} />
          <button type="button" className="sdo-padb sdo-padb--c" onClick={onCentre} disabled={!canCentre} aria-label={t.hand.recentre}>{t.hand.centre}</button>
          <PadButton axis="az" dir={1} icon="right" label={t.hand.east} enabled={enabled} onPress={onPress} onRelease={onRelease} />
          <span />
          <PadButton axis="alt" dir={-1} icon="down" label={t.hand.down} enabled={enabled} onPress={onPress} onRelease={onRelease} />
          <span />
        </div>
        <div className="sdo-hand__side">
          <div className="is-col">
            <span className="sdo-lbl">{t.hand.slewRate}</span>
            <Stepper label={t.hand.slewRate} value={String(rate)} onDown={() => onRate(rate - 1)} onUp={() => onRate(rate + 1)} min={rate <= 1} max={rate >= 9} />
          </div>
          <div>
            <span className="sdo-lbl" id="sdo-track-l">{t.hand.tracking}</span>
            <button type="button" className={`sdo-tg${tracking ? ' is-on' : ''}`} role="switch" aria-checked={tracking} aria-labelledby="sdo-track-l" onClick={() => onTracking(!tracking)} />
          </div>
          <div>
            <span className="sdo-lbl">{t.hand.focus}{focus !== 0 ? ` ${focus > 0 ? '+' : '−'}${Math.abs(focus)}` : ''}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="sdo-ib sdo-ib--sm" type="button" aria-label={t.hand.focusIn} onClick={() => onFocus(-1)}><Icon name="minus" size={14} /></button>
              <button className="sdo-ib sdo-ib--sm" type="button" aria-label={t.hand.focusOut} onClick={() => onFocus(1)}><Icon name="plus" size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
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

function FramesBase({ frames, onOpen }: { frames: Frame[]; onOpen: (f: Frame) => void }) {
  const t = useCopy();
  return (
    <section className="sdo-panel sdo-frames" aria-labelledby="sdo-frames-t">
      <div className="sdo-ph">
        <h2 id="sdo-frames-t" className="sdo-ph__t">{t.frames.title}</h2>
        <span className="sdo-ph__id">{t.frames.thisSession(frames.length)}</span>
      </div>
      <div className="sdo-frames__grid">
        {frames.length ? <FrameThumbs frames={frames} onOpen={onOpen} /> : <p>{t.frames.empty}</p>}
      </div>
    </section>
  );
}

export const QuickStart = memo(QuickStartBase);
export const StationList = memo(StationListBase);
export const Telescopes = memo(TelescopesBase);
export const Session = memo(SessionBase);
export const Pointing = memo(PointingBase);
export const Camera = memo(CameraBase);
export const HandControl = memo(HandControlBase);
export const FrameThumbs = memo(FrameThumbsBase);
export const Frames = memo(FramesBase);
