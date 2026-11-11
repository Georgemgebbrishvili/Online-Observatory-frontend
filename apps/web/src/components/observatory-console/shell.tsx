'use client';

import { memo, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ROIS } from '@/lib/observatory-sim/camera';
import { TRAINS } from '@/lib/observatory-sim/optics';
import type { ConsoleCopy } from './copy';
import { CopyProvider } from './copy-context';
import type { Frame } from './dialogs';
import ExposurePanel, { type ExposurePanelProps } from './exposure-panel';
import FocusDial, { type FocusDialProps } from './focus-dial';
import Icon, { type IconName } from './icons';
import { FrameThumbs, HandControl, Pointing, type HandProps, type PointingProps } from './panels';
import { plateArt } from './plates';
import SlewPad, { type SlewPadProps } from './slew-pad';
import type { AfMethod, AfState } from './use-auto';
import ViewStage, { type ViewLook, type ViewStageProps } from './ViewStage';

export type Action = { label: string; run: () => void; disabled?: boolean; icon?: 'camera' };

export type DeviceRow = { key: 'mount' | 'camera' | 'focuser'; label: string; text: string; on: boolean };
export type HubKind = 'planet' | 'moon' | 'star' | 'deep';
export type HubTarget = {
  id: string;
  name: string;
  sub: string;
  kind: HubKind;
  altitude: number;
  up: boolean;
  /** Typed in by RA and Dec on the Custom tab. */
  custom?: boolean;
  /** Its other names, for the search: the English one under a Georgian name. */
  alias?: string;
};
type Filter = 'planet' | 'star' | 'deep' | 'custom' | 'all';
type MoreTab = 'mount' | 'align' | 'focus' | 'setup' | 'log';
type PhoneTab = 'track' | 'move' | 'camera' | 'targets' | 'more';

/** Everything the console draws, decided by whichever instrument drives it: the Observatory Hub's cockpit (ADR-083). */
export type ShellProps = {
  t: ConsoleCopy;
  mounted: boolean;
  night: boolean;
  onNight: () => void;
  simulated: boolean;
  observatoryName: string;
  clock: { local: string; lst: string };
  devices: DeviceRow[];
  onPark: (() => void) | null;
  onStopAll: (() => void) | null;
  /** Daytime observing: the sky as it is now rather than tonight's. Null where the platform decides. */
  daytime: { on: boolean; onToggle: () => void } | null;
  tonight: { rows: [string, string][]; chip: string; bar: { dark: [number, number]; now: number } | null };
  targets: {
    list: HubTarget[];
    best: HubTarget[];
    up: number;
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Adds a target by RA and Dec text; false when either does not parse. Null: not offered. */
    onCustom: ((ra: string, dec: string) => boolean) | null;
    locked: boolean;
  };
  /** Tonight's sky with the showpieces, each one press from the live view. */
  dome: ReactNode;
  stage: Omit<ViewStageProps, 'viewRef' | 'look' | 'overlay'> & { viewRef: RefObject<HTMLDivElement | null> };
  tools: { onAutoExp: (() => void) | null; aeRunning: boolean; onFocus: (() => void) | null; focusing: boolean; onPng: (() => void) | null };
  autopilot: {
    name: string | null;
    sub: string | null;
    plate: string | null;
    rows: [string, string][];
    go: Action;
    busy: boolean;
    /** The step under way, 0–4, or -1; the steps before `done` are done. */
    pipe: { now: number; done: number };
    readout: [string, string][];
    log: string[];
    links: Action[];
    after: Array<{ label: string; on: boolean; onToggle: (() => void) | null }>;
    note: string | null;
  };
  slew: SlewPadProps;
  focuser: FocusDialProps & {
    af: { state: AfState; run: (m: AfMethod) => void; stop: () => void } | null;
    rows: [string, string][];
  };
  exposure: ExposurePanelProps;
  capture: { action: Action | null; progress: { title: string; count: string; frac: number }; stats: [string, string][]; total: string };
  pointing: PointingProps;
  hand: HandProps;
  align: { done: number; points: string[]; onWhere: (() => void) | null; onSync: (() => void) | null; onClear: (() => void) | null };
  setup: ReactNode;
  log: string[];
  frames: Frame[];
  onOpenFrame: (f: Frame) => void;
  modals: ReactNode;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const PLANET_TINT: Record<string, string> = { mercury: '#b9b3a8', venus: '#f3e3b4', mars: '#e0764a', jupiter: '#e6c79c', saturn: '#e9d39a', uranus: '#9fe0e6', neptune: '#6f8cff' };

/** The hub's drawn target icons, in natural colours. */
function KindIcon({ kind, id, size = 30 }: { kind: HubKind; id: string; size?: number }) {
  if (kind === 'planet') {
    const c = PLANET_TINT[id] ?? '#e6c79c';
    return (
      <svg className="oh-pic" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
        <defs><radialGradient id={`pg-${id}`} cx="35%" cy="32%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".35" stopColor={c} /><stop offset="1" stopColor="#1a1a22" /></radialGradient></defs>
        <circle cx="17" cy="17" r="9" fill={`url(#pg-${id})`} />
        {id === 'saturn' && <ellipse cx="17" cy="17" rx="15" ry="4.4" transform="rotate(-18 17 17)" fill="none" stroke="#d9c48c" strokeWidth="1.6" />}
      </svg>
    );
  }
  if (kind === 'moon') {
    return (
      <svg className="oh-pic" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="10" fill="#d8d9de" />
        <circle cx="13" cy="14" r="2" fill="#b5b7bf" /><circle cx="20" cy="20" r="2.6" fill="#b5b7bf" /><circle cx="21" cy="12" r="1.3" fill="#b5b7bf" />
      </svg>
    );
  }
  if (kind === 'star') {
    return (
      <svg className="oh-pic" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
        <path d="M17 4c1 8 5 12 13 13-8 1-12 5-13 13-1-8-5-12-13-13 8-1 12-5 13-13z" fill="#f4f7ff" />
      </svg>
    );
  }
  return (
    <svg className="oh-pic" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <defs><radialGradient id={`dg-${id}`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset=".25" stopColor="#c9b6ff" stopOpacity=".7" /><stop offset="1" stopColor="#5b6cff" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="17" cy="17" rx="14" ry="7" transform="rotate(-28 17 17)" fill={`url(#dg-${id})`} />
    </svg>
  );
}

function Card({ icon, title, chip, chipOk, className, children, tab, label }: { icon: IconName; title: string; chip?: string | null; chipOk?: boolean; className?: string; children: ReactNode; tab: PhoneTab; label?: string }) {
  return (
    <section className={`oh-card${className ? ` ${className}` : ''}`} aria-label={label ?? title} data-tab={tab}>
      <h2 className="oh-h2">
        <span className="oh-hi"><Icon name={icon} size={16} /></span>
        <span>{title}</span>
        {chip && <small className={chipOk === undefined ? undefined : `oh-chipst${chipOk ? ' is-ok' : ''}`}>{chip}</small>}
      </h2>
      {children}
    </section>
  );
}

const Targets = memo(function Targets({ t, p }: { t: ConsoleCopy; p: ShellProps['targets'] }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('planet');
  const [ra, setRa] = useState('');
  const [dec, setDec] = useState('');
  const [bad, setBad] = useState(false);
  const query = q.trim().toLowerCase();
  const rows = p.list.filter((x) =>
    query
      ? `${x.name} ${x.sub} ${x.alias ?? ''}`.toLowerCase().includes(query)
      : filter === 'all' || (filter === 'custom' ? !!x.custom : !x.custom && (filter === 'planet' ? x.kind === 'planet' || x.kind === 'moon' : x.kind === filter)),
  );
  const filters: Filter[] = p.onCustom ? ['planet', 'star', 'deep', 'custom', 'all'] : ['planet', 'star', 'deep', 'all'];
  return (
    <Card icon="rings" title={t.hub.targets.title} chip={t.hub.targets.up(p.up)} className="oh-tgcard" tab="targets">
      {p.best.length > 0 && (
        <div className="oh-best" aria-label={t.hub.targets.best} role="group">
          {p.best.map((b) => (
            <button key={b.id} type="button" className={b.id === p.selectedId ? 'is-on' : ''} aria-pressed={b.id === p.selectedId} disabled={p.locked} onClick={() => p.onSelect(b.id)}>
              <KindIcon kind={b.kind} id={b.id} size={36} />
              <span>{b.name}</span>
              <small>{Math.round(b.altitude)}°</small>
            </button>
          ))}
        </div>
      )}
      <input className="oh-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.hub.targets.search} aria-label={t.hub.targets.search} disabled={p.locked} />
      <div className="oh-tabs" role="group" aria-label={t.hub.targets.title}>
        {filters.map((f) => (
          <button key={f} type="button" className={!query && filter === f ? 'is-on' : ''} aria-pressed={!query && filter === f} onClick={() => { setQ(''); setFilter(f); }}>{t.hub.targets.filters[f]}</button>
        ))}
      </div>
      {filter === 'custom' && !query && p.onCustom && (
        <form className="oh-custom" aria-label={t.hub.targets.customForm} onSubmit={(e) => { e.preventDefault(); setBad(!p.onCustom?.(ra, dec)); }}>
          <label className="oh-field">{t.hub.targets.ra}<input className="oh-search" value={ra} onChange={(e) => setRa(e.target.value)} placeholder="19:30:43" aria-invalid={bad || undefined} /></label>
          <label className="oh-field">{t.hub.targets.dec}<input className="oh-search" value={dec} onChange={(e) => setDec(e.target.value)} placeholder="+27:57:35" aria-invalid={bad || undefined} /></label>
          <button type="submit" className="oh-btn">{t.hub.targets.add}</button>
          {bad && <p className="oh-hint" role="alert">{t.hub.targets.invalid}</p>}
        </form>
      )}
      <div className="oh-list">
        {rows.length === 0 && filter !== 'custom' && <p className="oh-hint">{t.hub.targets.none}</p>}
        {rows.map((r) => (
          <button key={r.id} type="button" className={`oh-row${r.id === p.selectedId ? ' is-sel' : ''}${r.up ? '' : ' is-below'}`} aria-pressed={r.id === p.selectedId} disabled={p.locked} onClick={() => p.onSelect(r.id)}>
            <KindIcon kind={r.kind} id={r.id} />
            <span className="oh-row__nm">{r.name}<em>{r.sub}</em></span>
            <span className="oh-row__meta">{r.altitude > 0 ? `${Math.round(r.altitude)}°` : t.hub.targets.below}</span>
          </button>
        ))}
      </div>
    </Card>
  );
});

function ToolButton({ icon, label, on, onClick, disabled }: { icon: IconName; label: string; on?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={on ? 'is-on' : ''} aria-pressed={on} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
      <Icon name={icon} size={18} />
    </button>
  );
}

/** The autofocus run as the hub charts it: every sample, the fitted curve, the best position. */
function AfChart({ af, t }: { af: AfState; t: ConsoleCopy }) {
  if (af.points.length < 2) return <p className="oh-hint">{t.hub.focuser.chartEmpty}</p>;
  const xs = [...af.points.map((p) => p.x), ...(af.fit?.line.map((l) => l[0]) ?? [])];
  const ys = [...af.points.map((p) => p.y), ...(af.fit?.line.map((l) => l[1]) ?? [])];
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const X = (x: number) => 8 + ((x - x0) / Math.max(1, x1 - x0)) * 284;
  const Y = (y: number) => 92 - ((y - y0) / Math.max(1e-6, y1 - y0)) * 82;
  return (
    <svg className="oh-chart" viewBox="0 0 300 100" role="img" aria-label={t.hub.focuser.curve}>
      {af.fit && <polyline fill="none" className="oh-chart__fit" points={af.fit.line.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')} />}
      {af.fit && <line x1={X(af.fit.best)} x2={X(af.fit.best)} y1="4" y2="96" className="oh-chart__best" />}
      {af.points.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={p.pass === 2 ? 3.2 : 2.4} className={p.pass === 2 ? 'oh-chart__fine' : 'oh-chart__pt'} />)}
    </svg>
  );
}

export function ConsoleShell(p: ShellProps) {
  const { t } = p;
  const root = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState<MoreTab>('mount');
  const [phone, setPhone] = useState<PhoneTab>('track');
  const [look, setLook] = useState<ViewLook>({ grid: false, invert: false, mirror: false, flip: false });
  const ap = p.autopilot;
  const af = p.focuser.af;

  // One screen: the console fills the window below the site's header.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const place = () => el.style.setProperty('--oh-top', `${Math.max(0, el.getBoundingClientRect().top + window.scrollY)}px`);
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, []);

  const overlay = (
    <>
      <div className="oh-vtools" role="toolbar" aria-label={t.hub.view}>
        <ToolButton icon="target" label={t.hub.reticle} on={p.stage.reticle} onClick={p.stage.onReticle} />
        <ToolButton icon="grid" label={t.hub.grid} on={look.grid} onClick={() => setLook((l) => ({ ...l, grid: !l.grid }))} />
        <ToolButton icon="moon" label={t.hub.invert} on={look.invert} onClick={() => setLook((l) => ({ ...l, invert: !l.invert }))} />
        <ToolButton icon="left" label={t.hub.mirror} on={look.mirror} onClick={() => setLook((l) => ({ ...l, mirror: !l.mirror }))} />
        <ToolButton icon="up" label={t.hub.flip} on={look.flip} onClick={() => setLook((l) => ({ ...l, flip: !l.flip }))} />
        <span className="oh-vtools__sep" />
        <ToolButton icon="sun" label={t.hub.autoExp} on={p.tools.aeRunning} onClick={() => p.tools.onAutoExp?.()} disabled={!p.tools.onAutoExp} />
        <ToolButton icon="focuser" label={t.hub.focusRun} on={p.tools.focusing} onClick={() => p.tools.onFocus?.()} disabled={!p.tools.onFocus} />
        <ToolButton icon="download" label={t.hub.png} onClick={() => p.tools.onPng?.()} disabled={!p.tools.onPng} />
        <ToolButton icon="expand" label={t.hub.full} on={p.stage.full} onClick={p.stage.onFull} />
      </div>
      <div className="oh-otools">
        <div className="oh-seg" role="group" aria-label={t.stage.train}>
          {TRAINS.map((tr) => (
            <button key={tr.id} type="button" className={p.stage.train === tr.id ? 'is-on' : ''} aria-pressed={p.stage.train === tr.id} title={tr.label} disabled={!p.stage.onTrain} onClick={() => p.stage.onTrain?.(tr.id)}>{tr.short}</button>
          ))}
        </div>
        <div className="oh-seg" role="group" aria-label={t.stage.roi}>
          {ROIS.map((r) => (
            <button key={r.id} type="button" className={p.stage.roi === r.id ? 'is-on' : ''} aria-pressed={p.stage.roi === r.id} title={r.label} disabled={!p.stage.onRoi} onClick={() => p.stage.onRoi?.(r.id)}>{r.id === 'full' ? 'Full' : r.id}</button>
          ))}
        </div>
      </div>
    </>
  );

  const afResult = af && af.state.status === 'done' && af.state.best !== null
    ? t.hub.focuser.result(af.state.best, af.state.used === 'hfr' ? 'HFR' : t.hub.focuser.contrast, af.state.before, af.state.after)
    : af && af.state.running ? t.hub.focuser.running(af.state.status === 'fine' ? 2 : 1, af.state.points.length)
    : af && af.state.status === 'failed' ? t.hub.focuser.failed
    : null;

  return (
    <CopyProvider value={t}>
    <div ref={root} className={`sdo oh${p.night ? ' is-night' : ''}`} data-tab={phone} aria-busy={p.mounted ? undefined : true}>
      <div className="oh-head">
        <div className="oh-brand">
          <span className="oh-logo" aria-hidden="true">
            <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="9" fill="url(#oh-lg)" stroke="none" /><ellipse cx="20" cy="20" rx="18" ry="6.5" transform="rotate(-18 20 20)" fill="none" stroke="currentColor" strokeWidth="2" /><defs><radialGradient id="oh-lg" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#e8eeff" /><stop offset="1" stopColor="#3b6ef6" /></radialGradient></defs></svg>
          </span>
          <span className="oh-bt"><b>{p.observatoryName}</b><small>{t.hub.brand}</small></span>
        </div>
        {p.simulated ? <span className="oh-badge" title={t.simulatedLong}>{t.simulated}</span> : <span className="oh-badge is-live">{t.live}</span>}
        {p.devices.map((d) => (
          <div key={d.key} className={`oh-dev oh-dev--${d.key}`}>
            <span className="oh-di"><Icon name={d.key === 'mount' ? 'mount' : d.key === 'camera' ? 'camera' : 'focuser'} size={16} /><span className={`oh-dot${d.on ? ' is-on' : ''}`} /></span>
            <div><b>{d.label}</b><small>{d.text}</small></div>
          </div>
        ))}
        <div className="oh-sp" />
        <div className="oh-clock sdo-mono">{p.clock.local}<small>{t.hub.lst} {p.clock.lst}</small></div>
        {p.daytime && (
          <button className={`oh-hbtn oh-tog${p.daytime.on ? ' is-on' : ''}`} type="button" onClick={p.daytime.onToggle} aria-pressed={p.daytime.on} aria-label={t.hub.daytime} title={t.hub.daytimeHint}>
            <Icon name="sun" size={17} /><span className="oh-hbtn__t">{t.hub.daytime}</span><i className="oh-sw" />
          </button>
        )}
        <button className={`oh-hbtn oh-tog${p.night ? ' is-on' : ''}`} type="button" onClick={p.onNight} aria-pressed={p.night} aria-label={t.nightMode} title={t.nightMode}>
          <Icon name="moon" size={17} /><span className="oh-hbtn__t">{t.hub.night}</span><i className="oh-sw" />
        </button>
        <button className="oh-hbtn" type="button" onClick={() => p.onPark?.()} disabled={!p.onPark} aria-label={t.hub.park}><Icon name="parkP" size={17} /><span className="oh-hbtn__t">{t.hub.park}</span></button>
        <button className="oh-estop" type="button" onClick={() => p.onStopAll?.()} disabled={!p.onStopAll}><i />{t.hub.stopAll}</button>
      </div>

      <main id="main-content" className="oh-main">
        <h1 className="sdo-sr">{t.observatory} — {p.observatoryName}</h1>
        <section className="oh-stage" aria-label={t.stage.aria}>
          <ViewStage {...p.stage} look={look} overlay={overlay} />
        </section>

        <nav className="oh-mtabs" aria-label={t.hub.controls}>
          {(['track', 'move', 'camera', 'targets', 'more'] as const).map((v) => (
            <button key={v} type="button" className={phone === v ? 'is-on' : ''} aria-pressed={phone === v} onClick={() => setPhone(v)}>
              <Icon name={v === 'track' ? 'bolt' : v === 'move' ? 'mount' : v === 'camera' ? 'camera' : v === 'targets' ? 'rings' : 'sliders'} size={18} />
              <span>{t.hub.phoneTabs[v]}</span>
            </button>
          ))}
        </nav>

        <div className="oh-rest">
          <div className="oh-left">
            <Targets t={t} p={p.targets} />
            <Card icon="moon" title={t.hub.tonight.title} chip={p.tonight.chip} className="oh-tncard" tab="more">
              <div className="oh-tn">
                {p.tonight.rows.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
              </div>
              {p.tonight.bar && (
                <div className="oh-darkbar" aria-hidden="true">
                  <i style={{ left: 0, width: `${p.tonight.bar.dark[0] * 100}%` }} />
                  <i style={{ left: `${p.tonight.bar.dark[1] * 100}%`, right: 0 }} />
                  <b style={{ left: `calc(${p.tonight.bar.now * 100}% - 4px)` }} />
                </div>
              )}
            </Card>
            {p.dome && <div className="oh-skycard" data-tab="more">{p.dome}</div>}
          </div>

          <div className="oh-dock">
            <div className="oh-move" data-tab="move">
              <section className="oh-card oh-slewcard" aria-label={t.hub.slew}>
                <h2 className="oh-h3">{t.hub.slew}</h2>
                <SlewPad {...p.slew} />
              </section>
              <section className="oh-card oh-focuscard" aria-label={t.hub.focuser.title}>
                <h2 className="oh-h3">{t.hub.focuser.title}</h2>
                <FocusDial {...p.focuser} />
                {af && (
                  <div className="oh-af">
                    <button type="button" className={`oh-af__run${af.state.running ? ' is-on' : ''}`} onClick={() => (af.state.running ? af.stop() : af.run(af.state.method))} disabled={!p.focuser.enabled && !af.state.running}>
                      <Icon name="focuser" size={15} />{af.state.running ? t.hub.focuser.stop : t.hub.focuser.run}
                    </button>
                    {afResult && <p className="oh-af__res" role="status">{afResult}</p>}
                  </div>
                )}
              </section>
            </div>
            <ExposurePanel {...p.exposure} />
          </div>

          <div className="oh-right">
            <Card icon="bolt" title={t.hub.autopilot.title} chip={ap.sub} chipOk={ap.pipe.done >= 5} className="oh-apcard" tab="track">
              <div className="oh-selrow">
                {ap.plate && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="oh-selpic" src={plateArt(ap.plate)} alt="" />
                )}
                <div>
                  <div className="oh-big">{ap.name ?? t.hub.autopilot.pick}</div>
                  {ap.rows.length > 0 && <div className="oh-kvline sdo-mono">{ap.rows.map(([k, v]) => `${k} ${v}`).join(' · ')}</div>}
                </div>
              </div>
              <button className={`oh-go${ap.busy ? ' is-busy' : ''}`} type="button" onClick={ap.go.run} disabled={ap.go.disabled}>
                <Icon name="target" size={18} /><span>{ap.go.label}</span><span className="sdo-kbd" aria-hidden="true">↵</span>
              </button>
              <ol className="oh-pipe" aria-label={t.hub.autopilot.title}>
                {t.hub.autopilot.pipe.map((s, i) => (
                  <li key={s} className={i < ap.pipe.done ? 'is-done' : i === ap.pipe.now ? 'is-now' : ''} aria-current={i === ap.pipe.now ? 'step' : undefined}>{s}</li>
                ))}
              </ol>
              <div className="oh-readout">
                {ap.readout.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
              </div>
              {ap.note && <p className="oh-apnote">{ap.note}</p>}
              {ap.links.length > 0 && (
                <div className="oh-linkbtns">
                  {ap.links.map((l) => <button key={l.label} type="button" className="oh-btn" onClick={l.run} disabled={l.disabled}>{l.label}</button>)}
                </div>
              )}
              {ap.after.length > 0 && (
                <div className="oh-after" role="group" aria-label={t.hub.autopilot.after}>
                  <span className="oh-h3">{t.hub.autopilot.after}</span>
                  {ap.after.map((a) => (
                    <label key={a.label} className="oh-pill"><input type="checkbox" checked={a.on} disabled={!a.onToggle} onChange={() => a.onToggle?.()} />{a.label}</label>
                  ))}
                </div>
              )}
              {ap.log.length > 0 && <div className="oh-aplog sdo-mono" aria-live="polite">{ap.log.slice(-3).map((l, i) => <div key={i}>{l}</div>)}</div>}
            </Card>

            <Card icon="camera" title={t.hub.capture} chip={p.capture.total} chipOk={p.capture.progress.frac > 0} className="oh-capcard" tab="camera">
              <div className="oh-cstats">
                {p.capture.stats.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
              </div>
              <div className="oh-prog">
                <div className="oh-prog__t"><b>{p.capture.progress.title}</b><span className="sdo-mono">{p.capture.progress.count}</span></div>
                <div className="oh-bar"><i style={{ width: `${Math.round(p.capture.progress.frac * 100)}%` }} /></div>
              </div>
              {p.capture.action && (
                <button type="button" className="oh-btn oh-btn--rec" onClick={p.capture.action.run} disabled={p.capture.action.disabled}>
                  <Icon name="camera" size={16} /> {p.capture.action.label}
                </button>
              )}
              <div className="oh-film">
                {p.frames.length ? <FrameThumbs frames={p.frames.slice(0, 8)} onOpen={p.onOpenFrame} /> : <span className="oh-empty">{t.hub.camera.noFrames}</span>}
              </div>
            </Card>

            <section className="oh-card oh-more" aria-label={t.hub.controls} data-tab="more">
              <div className="oh-tabs" role="tablist" aria-label={t.hub.controls}>
                {(['mount', 'align', 'focus', 'setup', 'log'] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={more === k} className={more === k ? 'is-on' : ''} onClick={() => setMore(k)}>{t.hub.tabs[k]}</button>
                ))}
              </div>
              {more === 'mount' && <div role="tabpanel"><HandControl {...p.hand} /></div>}
              {more === 'align' && (
                <div role="tabpanel">
                  <ol className="oh-steps">
                    {t.hub.align.steps.map((s, i) => <li key={s} className={i < p.align.done ? 'is-done' : ''}>{s}</li>)}
                  </ol>
                  <h3 className="oh-h3">{t.hub.align.points}</h3>
                  <div className="oh-chips">
                    {p.align.points.length ? p.align.points.map((c) => <span key={c} className="oh-chip">{c}</span>) : <span className="oh-hint">{t.hub.align.none}</span>}
                  </div>
                  <div className="oh-btns">
                    <button type="button" className="oh-btn oh-btn--pri" onClick={() => p.align.onWhere?.()} disabled={!p.align.onWhere}>{t.hub.autopilot.whereAmI}</button>
                    <button type="button" className="oh-btn" onClick={() => p.align.onSync?.()} disabled={!p.align.onSync}>{t.hub.autopilot.sync}</button>
                    <button type="button" className="oh-btn oh-btn--ghost" onClick={() => p.align.onClear?.()} disabled={!p.align.onClear}>{t.hub.align.clear}</button>
                  </div>
                </div>
              )}
              {more === 'focus' && (
                <div role="tabpanel" aria-label={t.hub.focuser.curve}>
                  <div className="oh-metric">
                    {p.focuser.rows.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
                  </div>
                  {af && (
                    <>
                      <div className="oh-tabs" role="group" aria-label={t.hub.focuser.method}>
                        {(['auto', 'hfr', 'contrast'] as const).map((m) => (
                          <button key={m} type="button" className={af.state.method === m ? 'is-on' : ''} aria-pressed={af.state.method === m} onClick={() => af.run(m)} disabled={!p.focuser.enabled || af.state.running}>{t.hub.focuser.methods[m]}</button>
                        ))}
                      </div>
                      <AfChart af={af.state} t={t} />
                      {afResult && <p className="oh-hint">{afResult}{af.state.fit ? ` · R² ${af.state.fit.r2.toFixed(3)}` : ''}</p>}
                    </>
                  )}
                </div>
              )}
              {more === 'setup' && <div role="tabpanel">{p.setup}</div>}
              {more === 'log' && (
                <div role="tabpanel" className="oh-notes sdo-mono">
                  {p.log.length ? p.log.map((l, i) => <div key={i}>{l}</div>) : <span className="oh-hint">{t.hub.log.empty}</span>}
                </div>
              )}
            </section>

            <div className="oh-pointing" data-tab="more"><Pointing {...p.pointing} /></div>
          </div>
        </div>
      </main>
      {p.modals}
    </div>
    </CopyProvider>
  );
}

export const hms = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};
export const degText = (v: number, width = 1) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(width)}°`;
export const raShort = (h: number) => `${pad2(Math.floor(h))}H ${pad2(Math.floor((h % 1) * 60))}M`;
export const decShort = (d: number) => `${d < 0 ? '−' : '+'}${pad2(Math.floor(Math.abs(d)))}° ${pad2(Math.floor((Math.abs(d) % 1) * 60))}′`;
export const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} M ${pad2(Math.round(s % 60))} S` : s >= 1 ? `${Math.round(s)} S` : `${(s * 1000).toFixed(0)} MS`);
export const lstText = (hours: number) => `${pad2(Math.floor(hours))}h${pad2(Math.floor((hours % 1) * 60))}m`;
