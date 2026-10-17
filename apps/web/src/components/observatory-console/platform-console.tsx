'use client';

import type { ImagingProfile, Mission, MissionState } from '@darkview/contracts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { stepOf } from '@/features/missions/room';
import { EXPOSURES_S, STACK_SIZES } from '@/lib/observatory-sim/camera';
import { getTonightDarkWindow } from '@/lib/observatory-sim/dark-window';
import { DEFAULT_SEEING_ARCSEC, TRAIN_BY_ID, effectiveFocalLength, fieldOfView, type OpticalTrainId } from '@/lib/observatory-sim/optics';
import { STATIONS as SIM_STATIONS, skyStateAt, type Station } from '@/lib/observatory-sim/sim-stations';
import { consoleCopy } from './copy';
import { CaptureDialog, type Frame } from './dialogs';
import type { StationRow } from './panels';
import { usePlatformDriver } from './platform-driver';
import { ConsoleShell, degText, hms, type Action, type ConsoleLink } from './shell';
import { clock } from './sky';

/** The caller's active mission, as the page read it: enough to drive it and to name what it is on. */
export type PlatformMission = {
  mission: Mission;
  targetName: string;
  imagingProfile: ImagingProfile | null;
  opticalConfig: OpticalTrainId | null;
};

type Props = {
  locale: Locale;
  observatoryName: string;
  nodeCloud: number | null;
  simulated: boolean;
  mission: PlatformMission;
  brandLabel: string;
  links: ConsoleLink[];
  language: ConsoleLink & { hrefLang: string };
  account: ConsoleLink;
  caption: string;
};

const NODE_ID = 'tbilisi-01';
const NIGHT_KEY = 'stellar.observatory.night';
const pad2 = (n: number) => String(n).padStart(2, '0');

/** The mission's state as the console's five steps: the platform runs steps two to four itself. */
function stepFor(state: MissionState, session: boolean): number {
  const s = stepOf(state);
  if (s === null) return session ? 4 : 0;
  if (s === 0) return session ? 1 : 0;
  return Math.min(4, s);
}

/**
 * The console on the real instrument (ADR-054 §6): the same shell, driven by the
 * platform. The feed is the platform's stream; the pad sends bounded nudges; Centre is
 * RECENTER; Capture is CAPTURE; the session's end is ABORT. The target is the booked
 * one, the train the mission's, and the mount's own settings are the operator's.
 */
export function PlatformConsole({ locale, observatoryName, nodeCloud, simulated, mission, brandLabel, links, language, account, caption }: Props) {
  const t = consoleCopy[locale];
  const station = useMemo<Station>(() => ({ ...SIM_STATIONS.find((s) => s.id === NODE_ID)!, name: observatoryName, site: 'Tbilisi' }), [observatoryName]);
  const [clockMs, setClockMs] = useState<number | null>(null);
  const now = clockMs ?? 0;
  const [night, setNight] = useState(false);
  const [full, setFull] = useState(false);
  const [reticle, setReticle] = useState(true);
  const [modal, setModal] = useState<'capture' | 'stations' | 'hand' | null>(null);
  const [viewing, setViewing] = useState<Frame | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [frames] = useState<Frame[]>([]);
  const viewRef = useRef<HTMLDivElement>(null);
  const signInPath = `/${locale}/sign-in`;

  const driver = usePlatformDriver({ mission: mission.mission, imagingProfile: mission.imagingProfile, locale, signInPath, now });
  const d = driver.state;

  useEffect(() => {
    setClockMs(Date.now());
    try {
      setNight(localStorage.getItem(NIGHT_KEY) === '1');
    } catch {
      /* storage can be blocked */
    }
    const id = setInterval(() => setClockMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const setFullView = useCallback((on: boolean) => {
    setFull(on);
    if (on && !document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => undefined);
    if (!on && document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, []);
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleNight = useCallback(() => {
    setNight((v) => {
      try {
        localStorage.setItem(NIGHT_KEY, v ? '0' : '1');
      } catch {
        /* private mode */
      }
      return !v;
    });
  }, []);

  const mounted = clockMs !== null;
  const date = useMemo(() => new Date(now), [now]);
  const train = mission.opticalConfig ?? 'F10_NATIVE';
  const trainInfo = TRAIN_BY_ID.get(train)!;
  const fov = fieldOfView(station.instrument, trainInfo);
  const focal = effectiveFocalLength(station.instrument, trainInfo);
  const fRatio = focal / station.instrument.apertureMm;
  const step = stepFor(d.missionState, d.session);
  const live = d.session && d.linkOnline;
  const observing = d.missionState === 'OBSERVING';
  const ended = stepOf(d.missionState) === null || d.missionState === 'COMPLETE';
  const skyState = skyStateAt(station, date);
  const darkWin = useMemo(() => getTonightDarkWindow(station.lat, station.lon, new Date(Math.floor(now / 60_000) * 60_000), station.timezone), [station, Math.floor(now / 60_000)]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoursLeft = (label: string, ms: number) => {
    const m = Math.max(0, Math.round(ms / 60_000));
    return [label, `${Math.floor(m / 60)} h ${pad2(m % 60)} m`] as const;
  };
  const dark = !mounted ? ([t.darkLeft, '—'] as const)
    : darkWin.isCurrentlyDark && darkWin.dawnEnd ? hoursLeft(t.darkLeft, darkWin.dawnEnd.getTime() - now)
    : darkWin.duskStart && darkWin.duskStart.getTime() > now ? hoursLeft(t.darkIn, darkWin.duskStart.getTime() - now) : ([t.darkLeft, '—'] as const);
  const stationRows: StationRow[] = [{ station, dark: skyState === 'night', twilight: skyState === 'twilight', local: mounted ? clock(now, station.timezone) : '—' }];

  const commandNote = d.pending ? t.commands.relayed
    : d.outcome ? (d.outcome.outcome.kind === 'done' ? t.commands.done : d.outcome.outcome.kind === 'refused' ? t.commands.refused : d.outcome.outcome.kind === 'no-answer' ? t.commands.noAnswer : t.commands.failed)
    : null;

  const statusText = !d.session && !ended ? t.status.platform.idle
    : d.status === 'starting' ? t.status.platform.starting
    : d.status === 'connecting' ? t.status.platform.connecting
    : d.status === 'reconnecting' ? t.status.platform.reconnecting
    : d.status === 'refused' ? t.status.platform.refused
    : d.status === 'error' ? t.status.platform.error
    : ended ? t.status.platform.ended
    : !d.linkOnline ? t.status.platform.offline
    : d.missionState === 'SLEWING' ? t.status.slewing
    : d.missionState === 'VERIFYING' ? t.status.solving
    : d.missionState === 'CENTERING' ? t.status.centring
    : d.missionState === 'CAPTURING' ? t.status.stacking(0, 1)
    : observing ? t.status.tracking
    : t.status.platform.connected;

  let primary: Action;
  let secondary: Action[] = [];
  if (!d.session && !ended) {
    primary = d.status === 'starting' ? { label: t.steps.starting, run: () => undefined, disabled: true } : { label: t.steps.startSession, run: driver.start };
  } else if (ended) {
    primary = { label: t.status.platform.ended, run: () => undefined, disabled: true };
  } else if (d.offered.capture) {
    primary = { label: t.steps.captureReal, run: driver.capture, disabled: d.pending !== null, icon: 'camera' };
    secondary = [{ label: t.steps.recentre, run: driver.recentre, disabled: d.pending !== null }];
  } else {
    primary = { label: t.steps.waiting, run: () => undefined, disabled: true };
  }
  const hint = !d.session && !ended ? t.steps.hints.platform.connect : ended ? t.steps.hints.platform.stopped : observing ? t.steps.hints.platform.observing : t.steps.hints.platform.running;
  const flowSteps: Array<[string, string]> = [
    [t.steps.names[0], '—'],
    [t.steps.names[1], '—'],
    [t.steps.names[2], mission.targetName],
    [t.steps.names[3], '—'],
    [t.steps.names[4], t.steps.captureReal],
  ];

  const stop = useCallback(() => {
    if (!confirmStop) {
      setConfirmStop(true);
      return;
    }
    setConfirmStop(false);
    driver.stop();
  }, [confirmStop, driver]);

  const feed = d.feed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={d.feed.url} alt={d.feed.simulated ? t.stage.simulatedFeed : t.stage.liveFeed} onError={driver.onStreamError} />
  ) : null;
  const streamSimulated = d.feed?.simulated ?? simulated;
  const sessionLeft = d.timeLeftMs !== null ? hms(d.timeLeftMs) : '00:00:00';
  const pointing = d.pointing;

  return (
    <ConsoleShell
      t={t}
      mounted={mounted}
      night={night}
      onNight={toggleNight}
      simulated={simulated}
      observatoryName={observatoryName}
      brandLabel={brandLabel}
      links={links}
      language={language}
      account={account}
      clocks={{ utc: mounted ? clock(now, 'UTC', true) : '--:--:--', local: mounted ? clock(now, station.timezone, true) : '--:--:--', site: station.site.split(',')[0], dark }}
      quick={null}
      stations={{ rows: stationRows, selectedId: NODE_ID, onPick: () => undefined, sky: [[t.skyLabel, mounted ? t.sky[skyState] : '—'], [t.cloud, nodeCloud !== null ? `${nodeCloud}%` : '—'], [t.seeing, `${DEFAULT_SEEING_ARCSEC.toFixed(1)}″`]], selected: station, skyState }}
      session={{ elapsed: sessionLeft, connected: d.session && !ended, onEnd: stop, label: confirmStop ? t.session.confirmStop : t.session.stop, note: `${t.session.booked}: ${mission.targetName}` }}
      stage={{
        viewRef,
        feed,
        stream: true,
        train,
        onTrain: null,
        roi: 'full',
        onRoi: null,
        reticle,
        onReticle: () => setReticle((v) => !v),
        full,
        onFull: () => setFullView(!full),
        status: { text: statusText, go: live && observing, blink: d.status === 'starting' || d.status === 'connecting' || d.status === 'reconnecting' || (live && !observing && !ended) },
        exposing: null,
        hudLive: [d.feed ? (streamSimulated ? t.stage.simulatedFeed : t.stage.liveFeed) : d.session ? t.stage.noFeed : t.stage.standby, observatoryName, `${station.instrument.camera.replace(/^ZWO /, '')} · ${Math.round(focal)} MM · F/${fRatio.toFixed(1).replace(/\.0$/, '')}`],
        hudTarget: [mission.targetName, t.session.booked, null],
        hudField: [`${t.stage.fov} ${fov.widthArcmin.toFixed(1)}′ × ${fov.heightArcmin.toFixed(1)}′`, `${fov.plateScaleArcsecPx.toFixed(2)}″ / PX`],
        caption,
        idle: d.feed ? null : { title: t.observatory, text: t.idle.platform(mission.targetName), note: simulated ? t.simulated : observatoryName },
      }}
      flow={{ steps: flowSteps, step, hint, primary, secondary, goStep: () => undefined, total: mission.targetName }}
      pointing={{
        path: null,
        pointing,
        rows: [
          [t.pointing.altitude, pointing ? degText(pointing.altitude) : '—'],
          [t.pointing.azimuth, pointing ? degText(pointing.azimuth) : '—'],
          [t.pointing.bestAt, '—'],
        ],
        rms: '—',
        rmsHistory: [],
        seeing: `${DEFAULT_SEEING_ARCSEC.toFixed(1)}″`,
        seeingHistory: [],
        battery: null,
        sensor: 'IMX585',
      }}
      camera={{
        exp: Math.max(0, EXPOSURES_S.findIndex((v) => v >= 8)), subs: Math.max(0, STACK_SIZES.findIndex((v) => v >= 8)), gain: 300, total: mission.imagingProfile ?? '—', locked: false, enabled: false,
        onExp: () => undefined, onSubs: () => undefined, onGain: () => undefined, onAuto: null, refreshNote: null,
      }}
      hand={{
        rate: 1, onRate: null,
        tracking: d.tracking === false ? 'off' : 'sidereal', onTracking: null,
        focus: 0, onFocus: null, onAutofocus: null, focusing: false,
        enabled: d.offered.move && d.pending === null, onPress: driver.press, onRelease: driver.release,
        onCentre: driver.recentre, canCentre: d.offered.move && d.pending === null,
        onSync: null, synced: false,
        onStop: stop, canStop: d.offered.stop,
        onSettings: null,
        stepNote: t.hand.step(2), limitNote: null, commandNote,
      }}
      frames={frames}
      onOpenFrame={(f) => { setViewing(f); setModal('capture'); }}
      onAddFrame={d.offered.capture && d.pending === null ? driver.capture : null}
      phone={{ tracking: '—', seeing: `${DEFAULT_SEEING_ARCSEC.toFixed(1)}″` }}
      sheets={{ stations: modal === 'stations', hand: modal === 'hand', onClose: () => setModal(null), onOpenStations: () => setModal('stations'), onOpenHand: () => setModal('hand') }}
      modals={modal === 'capture' && viewing ? <CaptureDialog night={night} frame={viewing} onClose={() => setModal(null)} /> : null}
    />
  );
}
