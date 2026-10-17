'use client';

import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import { BrandLockup } from '@/components/brand/brand-lockup';
import type { Station } from '@/lib/observatory-sim/sim-stations';
import type { ConsoleCopy } from './copy';
import { CopyProvider } from './copy-context';
import { SheetDialog, type Frame } from './dialogs';
import Icon from './icons';
import { Camera, FrameThumbs, Frames, HandControl, Pointing, QuickStart, Session, StationList, Telescopes, type CameraProps, type HandProps, type PointingProps, type StationRow } from './panels';
import ViewStage, { type ViewStageProps } from './ViewStage';

export type ConsoleLink = { label: string; href: string; current?: boolean };

export type Action = { label: string; run: () => void; disabled?: boolean; icon?: 'camera' };

/** Everything the console draws, decided by whichever instrument drives it. */
export type ShellProps = {
  t: ConsoleCopy;
  mounted: boolean;
  night: boolean;
  onNight: () => void;
  simulated: boolean;
  observatoryName: string;
  brandLabel: string;
  links: ConsoleLink[];
  language: ConsoleLink & { hrefLang: string };
  account: ConsoleLink;
  clocks: { utc: string; local: string; site: string; dark: readonly [string, string] };
  quick: { name: string | null; plate: string | null; onStart: () => void } | null;
  stations: { rows: StationRow[]; selectedId: string; onPick: (s: Station) => void; sky: [string, string][]; selected: Station; skyState: 'night' | 'twilight' | 'day' };
  session: { elapsed: string; connected: boolean; onEnd: () => void; label: string; note?: string | null };
  stage: Omit<ViewStageProps, 'viewRef'> & { viewRef: RefObject<HTMLDivElement | null> };
  flow: {
    steps: Array<[string, string]>;
    step: number;
    hint: string;
    primary: Action;
    secondary: Action[];
    goStep: (i: number) => void;
    total: string;
  };
  pointing: PointingProps;
  camera: CameraProps;
  hand: HandProps;
  frames: Frame[];
  onOpenFrame: (f: Frame) => void;
  onAddFrame: (() => void) | null;
  phone: { tracking: string; seeing: string };
  /** The phone's sheets: the station list and the hand control, which the desk shows in place. */
  sheets: { stations: boolean; hand: boolean; onClose: () => void; onOpenStations: () => void; onOpenHand: () => void };
  modals: ReactNode;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export function ConsoleShell(p: ShellProps) {
  const { t } = p;
  const actionButtons = (
    <div className="sdo-act__btns">
      {p.flow.secondary.map((b) => (
        <button key={b.label} className="sdo-sec" type="button" onClick={b.run} disabled={b.disabled}>{b.label}</button>
      ))}
      <button className="sdo-btn sdo-btn--primary sdo-btn--xl" type="button" onClick={p.flow.primary.run} disabled={p.flow.primary.disabled}>
        {p.flow.primary.label}<span className="sdo-kbd" aria-hidden="true">↵</span>
      </button>
    </div>
  );

  return (
    <CopyProvider value={t}>
    <div className={`sdo${p.night ? ' is-night' : ''}`} aria-busy={p.mounted ? undefined : true}>
      <div className="sdo-atmo" aria-hidden="true">
        <div className="sdo-atmo__glow" />
        <div className="sdo-atmo__aurora sdo-atmo__aurora--a" />
        <div className="sdo-atmo__aurora sdo-atmo__aurora--b" />
        <div className="sdo-atmo__aurora sdo-atmo__aurora--c" />
        <div className="sdo-atmo__dots" />
        <div className="sdo-atmo__ring" />
        <div className="sdo-atmo__ring sdo-atmo__ring--b" />
      </div>

      <header className="sdo-head">
        <Link href={p.links[0]?.href.replace(/\/observatory$/, '') ?? '/'} className="sdo-head__mark" aria-label={p.brandLabel}>
          <BrandLockup ariaLabel={p.brandLabel} />
        </Link>
        <nav className="sd-bar__links" aria-label={p.brandLabel}>
          {p.links.map((l) => (
            <Link key={l.href} href={l.href} className="sd-navlink" aria-current={l.current ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="sdo-head__right">
          <div className="sdo-clocks">
            <span><span className="sdo-lbl">{t.utc}</span><b>{p.clocks.utc}</b></span>
            <span><span className="sdo-lbl">{p.clocks.site}</span><b>{p.clocks.local}</b></span>
            <span><span className="sdo-lbl">{p.clocks.dark[0]}</span><b>{p.clocks.dark[1]}</b></span>
          </div>
          {p.simulated ? (
            <span className="sdo-pill sdo-pill--sim" title={p.observatoryName}><span className="sdo-led" />{t.simulated}<span className="sdo-pill__long">&nbsp;· {t.simulatedLong}</span></span>
          ) : (
            <span className="sdo-pill sdo-pill--live" title={p.observatoryName}><span className="sdo-led" />{t.live}<span className="sdo-pill__long">&nbsp;· {p.observatoryName}</span></span>
          )}
          <button className={`sdo-ib${p.night ? ' is-on' : ''}`} type="button" onClick={p.onNight} aria-pressed={p.night} aria-label={t.nightMode} title={t.nightMode}><Icon name="moon" /></button>
          <Link href={p.language.href} className="sdo-sec" hrefLang={p.language.hrefLang} lang={p.language.hrefLang}>{p.language.label}</Link>
          <Link href={p.account.href} className="sdo-btn">{p.account.label}</Link>
        </div>
      </header>

      <div className="sdo-phone">
        <div className="sdo-phead">
          <p className="sdo-phead__t">{t.observatory}</p>
          <div>
            {p.simulated ? (
              <span className="sdo-pill sdo-pill--sim"><span className="sdo-led" />{t.simulated}</span>
            ) : (
              <span className="sdo-pill sdo-pill--live"><span className="sdo-led" />{t.live}</span>
            )}
            <button className={`sdo-ib${p.night ? ' is-on' : ''}`} type="button" onClick={p.onNight} aria-pressed={p.night} aria-label={t.nightMode}><Icon name="moon" /></button>
            <Link href={p.account.href} className="sdo-ib" aria-label={p.account.label}><Icon name="user" /></Link>
          </div>
        </div>
        <button className="sdo-panel sdo-pstation" type="button" onClick={() => p.sheets.onOpenStations()} aria-haspopup="dialog">
          <span>
            <span className={`sdo-led${p.stations.skyState === 'night' ? ' is-go' : p.stations.skyState === 'twilight' ? ' is-hold' : ''}`} />
            <span>
              <b>{p.stations.selected.name} · {p.stations.selected.site.split(',')[0]}</b>
              <small>{p.stations.sky.map(([k, v]) => (k === t.skyLabel ? v : `${k} ${v}`)).join(' · ')}</small>
            </span>
          </span>
          <Icon name="down" />
        </button>
      </div>

      <main id="main-content" className="sdo-grid">
        <h1 className="sdo-sr">{t.observatory} — {p.observatoryName}</h1>
        <div className="sdo-col sdo-desk">
          {p.quick && <QuickStart name={p.quick.name} plate={p.quick.plate} onStart={p.quick.onStart} />}
          <Telescopes rows={p.stations.rows} selectedId={p.stations.selectedId} onPick={p.stations.onPick} sky={p.stations.sky} />
          <Session elapsed={p.session.elapsed} connected={p.session.connected} onEnd={p.session.onEnd} label={p.session.label} note={p.session.note} />
        </div>

        <div className="sdo-col sdo-col--center">
          <ViewStage {...p.stage} />
          <section className="sdo-panel sdo-flowbar" aria-label={t.steps.label}>
            <ol className="sdo-flow">
              {p.flow.steps.map(([name, time], i) => (
                <li key={name}>
                  <button type="button" className={`sdo-fs${i < p.flow.step ? ' is-done' : i === p.flow.step ? ' is-now' : ''}`} onClick={() => p.flow.goStep(i)} disabled={i >= p.flow.step} aria-current={i === p.flow.step ? 'step' : undefined}>
                    <span className="sdo-fs__dot">{i < p.flow.step ? <Icon name="check" size={14} /> : `0${i + 1}`}</span>
                    <span className="sdo-fs__nm">{name}</span>
                    <span className="sdo-fs__tm">{time}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="sdo-hr" style={{ margin: 0 }} />
            <div className="sdo-act">
              <div className="sdo-act__hint">
                <span className="sdo-lbl">{t.steps.of(p.flow.step + 1, 5)}</span>
                <p>{p.flow.hint}</p>
              </div>
              {actionButtons}
            </div>
          </section>

          <div className="sdo-phone">
            <div className="sdo-pprog" aria-hidden="true">
              {p.flow.steps.map(([n], i) => <span key={n} className={i < p.flow.step ? 'is-done' : i === p.flow.step ? 'is-now' : ''} />)}
            </div>
            <div className="sdo-pstep"><span>{t.steps.of(p.flow.step + 1, 5)} · {p.flow.steps[p.flow.step][0]}</span><span>{p.flow.total}</span></div>
            <p className="sdo-phint">{p.flow.hint}</p>
            {p.flow.secondary.length > 0 && (
              <div className="sdo-row" style={{ padding: '10px 16px 0' }}>
                {p.flow.secondary.map((b) => (
                  <button key={b.label} className="sdo-sec" type="button" onClick={b.run} disabled={b.disabled}>{b.label}</button>
                ))}
              </div>
            )}
            <div className="sdo-pstats">
              <div className="sdo-stat"><span className="sdo-lbl">{t.phone.tracking}</span><span className="sdo-v sdo-v--sm">{p.phone.tracking}</span></div>
              <div className="sdo-stat"><span className="sdo-lbl">{t.phone.seeing}</span><span className="sdo-v sdo-v--sm">{p.phone.seeing}</span></div>
              <div className="sdo-stat"><span className="sdo-lbl">{t.phone.frames}</span><span className="sdo-v sdo-v--sm">{p.frames.length}</span><span className="sdo-mono" style={{ fontSize: 11, color: 'var(--o-ink-3)' }}>{t.phone.thisSession}</span></div>
            </div>
            <div className="sdo-pcap">
              <div className="sdo-pcap__head"><span className="sdo-lbl">{t.frames.captured}</span></div>
              <div className="sdo-pcap__grid">
                <FrameThumbs frames={p.frames} onOpen={p.onOpenFrame} />
                <button type="button" className="sdo-pcap__add" aria-label={t.frames.add} disabled={!p.onAddFrame} onClick={() => p.onAddFrame?.()}>
                  <Icon name="plus" size={20} />
                </button>
              </div>
            </div>
            <div className="sdo-pdock">
              <button className="sdo-btn" type="button" aria-label={t.hand.button} onClick={() => p.sheets.onOpenHand()}><Icon name="target" size={22} /></button>
              <button className="sdo-btn sdo-btn--primary sdo-btn--xl" type="button" onClick={p.flow.primary.run} disabled={p.flow.primary.disabled}>
                {p.flow.primary.icon === 'camera' && <Icon name="camera" size={18} />}{p.flow.primary.label}
              </button>
            </div>
          </div>
        </div>

        <div className="sdo-col sdo-desk">
          <Pointing {...p.pointing} />
          <Camera {...p.camera} />
          <HandControl {...p.hand} />
          <Frames frames={p.frames} onOpen={p.onOpenFrame} />
        </div>
      </main>
      {p.sheets.stations && (
        <SheetDialog night={p.night} title={t.telescopes.title} onClose={p.sheets.onClose}>
          <StationList rows={p.stations.rows} selectedId={p.stations.selectedId} onPick={p.stations.onPick} />
          <p className="sdo-note" style={{ padding: 0 }}>{t.telescopes.oneOpen}</p>
        </SheetDialog>
      )}
      {p.sheets.hand && (
        <SheetDialog night={p.night} title={t.hand.title} onClose={p.sheets.onClose}>
          <HandControl {...p.hand} />
        </SheetDialog>
      )}
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
