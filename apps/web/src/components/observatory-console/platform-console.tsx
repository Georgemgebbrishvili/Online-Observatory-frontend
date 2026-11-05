'use client';

import type { ImagingProfile, Mission } from '@darkview/contracts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { stepOf } from '@/features/missions/room';
import { EXPOSURES_S, STACK_SIZES } from '@/lib/observatory-sim/camera';
import { DEFAULT_SEEING_ARCSEC, TRAIN_BY_ID, effectiveFocalLength, fieldOfView, type OpticalTrainId } from '@/lib/observatory-sim/optics';
import { STATIONS as SIM_STATIONS, type Station } from '@/lib/observatory-sim/sim-stations';
import { consoleCopy } from './copy';
import { CaptureDialog, type Frame } from './dialogs';
import { usePlatformDriver } from './platform-driver';
import { localSiderealHours } from '@/lib/observatory-sim/site-time';
import { ConsoleShell, degText, hms, lstText, type Action } from './shell';
import { clock, tonightSky } from './sky';

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
  caption: string;
};

const NODE_ID = 'tbilisi-01';
const NIGHT_KEY = 'stellar.observatory.night';

/**
 * The console on the real instrument (ADR-054 §6): the same shell, driven by the
 * platform. The feed is the platform's stream; the pad sends bounded nudges; Centre is
 * RECENTER; Capture is CAPTURE; the session's end is ABORT. The target is the booked
 * one, the train the mission's, and the mount's own settings are the operator's.
 */
export function PlatformConsole({ locale, observatoryName, simulated, mission, caption }: Props) {
  const t = consoleCopy[locale];
  const station = useMemo<Station>(() => ({ ...SIM_STATIONS.find((s) => s.id === NODE_ID)!, name: observatoryName, site: 'Tbilisi' }), [observatoryName]);
  const [clockMs, setClockMs] = useState<number | null>(null);
  const now = clockMs ?? 0;
  const [night, setNight] = useState(false);
  const [full, setFull] = useState(false);
  const [reticle, setReticle] = useState(true);
  const [modal, setModal] = useState<'capture' | null>(null);
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
  const live = d.session && d.linkOnline;
  const observing = d.missionState === 'OBSERVING';
  const ended = stepOf(d.missionState) === null || d.missionState === 'COMPLETE';
  const minute = Math.floor(now / 60_000);
  const tonightAt = useMemo(() => (mounted ? tonightSky(station, new Date(minute * 60_000)) : null), [mounted, station, minute]);
  const at = (ms: number | null) => (ms === null ? '—' : clock(ms, station.timezone));
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
  if (!d.session && !ended) {
    primary = d.status === 'starting' ? { label: t.steps.starting, run: () => undefined, disabled: true } : { label: t.steps.startSession, run: driver.start };
  } else if (ended) {
    primary = { label: t.status.platform.ended, run: () => undefined, disabled: true };
  } else if (d.offered.capture) {
    primary = { label: t.hub.autopilot.recentre, run: driver.recentre, disabled: d.pending !== null };
  } else {
    primary = { label: t.steps.waiting, run: () => undefined, disabled: true };
  }
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
  const sessionLeft = d.timeLeftMs !== null ? hms(d.timeLeftMs) : null;
  const ms = d.missionState;
  const pipeNow = ms === 'PREPARING' ? 0 : ms === 'SLEWING' ? 1 : ms === 'VERIFYING' ? 2 : ms === 'CENTERING' ? 3 : -1;
  const pipeDone = observing || ms === 'CAPTURING' || ms === 'PROCESSING' ? 5 : ms === 'CENTERING' ? 3 : ms === 'VERIFYING' ? 2 : ms === 'SLEWING' ? 1 : 0;
  const pointing = d.pointing;

  return (
    <ConsoleShell
      t={t}
      mounted={mounted}
      night={night}
      onNight={toggleNight}
      simulated={simulated}
      observatoryName={observatoryName}
      clock={{ local: mounted ? clock(now, station.timezone, true) : '--:--:--', lst: mounted ? lstText(localSiderealHours(station.lon, date)) : '--' }}
      devices={[
        { key: 'mount', label: t.hub.devices.mount, text: live ? (ms === 'SLEWING' ? t.hub.devices.slewing : t.hub.devices.online) : t.hub.devices.offline, on: live },
        { key: 'camera', label: t.hub.devices.camera, text: d.feed ? t.hub.devices.online : t.hub.devices.offline, on: !!d.feed },
        { key: 'focuser', label: t.hub.devices.focuser, text: live ? t.hub.devices.online : t.hub.devices.offline, on: live },
      ]}
      onPark={null}
      onStopAll={d.offered.stop ? stop : null}
      tonight={{
        chip: sessionLeft ?? '',
        rows: tonightAt ? [
          [t.hub.tonight.sunset, at(tonightAt.sunset)],
          [t.hub.tonight.sunrise, at(tonightAt.sunrise)],
          [t.hub.tonight.darkFrom, at(tonightAt.duskStart)],
          [t.hub.tonight.darkUntil, at(tonightAt.dawnEnd)],
          [t.hub.tonight.moon, `${tonightAt.moonPercent}% · ${tonightAt.moonWaxing ? t.hub.tonight.waxing : t.hub.tonight.waning}`],
          [t.hub.tonight.moonRiseSet, `${at(tonightAt.moonRise)} / ${at(tonightAt.moonSet)}`],
        ] : [],
        bar: null,
      }}
      targets={{ list: [{ id: mission.mission.targetId, name: mission.targetName, sub: t.hub.targets.booked, kind: 'deep', altitude: pointing?.altitude ?? 0, up: true }], best: [], up: 1, selectedId: mission.mission.targetId, onSelect: () => undefined, onCustom: null, locked: true }}
      dome={null}
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
        alerts: [],
        hudLive: [d.feed ? (streamSimulated ? t.stage.simulatedFeed : t.stage.liveFeed) : d.session ? t.stage.noFeed : t.stage.standby, observatoryName, `${Math.round(focal)} MM · F/${fRatio.toFixed(1).replace(/\.0$/, '')}`],
        hudTarget: [mission.targetName, t.session.booked, null],
        hudField: [`${t.stage.fov} ${fov.widthArcmin.toFixed(1)}′ × ${fov.heightArcmin.toFixed(1)}′`, `${fov.plateScaleArcsecPx.toFixed(2)}″ / PX`],
        caption,
        idle: d.feed ? null : { title: t.observatory, text: t.idle.platform(mission.targetName), note: simulated ? t.simulated : observatoryName },
      }}
      rails={{ onAutoExp: null, onFocus: null, focusing: false, onPng: null }}
      autopilot={{
        name: mission.targetName,
        sub: t.hub.targets.booked,
        plate: null,
        rows: [],
        go: primary,
        busy: live && !observing && !ended,
        pipe: { now: pipeNow, done: pipeDone },
        readout: [[t.hub.autopilot.offTarget, '—'], [t.hub.autopilot.pass, '—'], [t.hub.autopilot.solveTime, '—']],
        log: [statusText],
        links: [],
        after: [],
        note: confirmStop ? t.session.confirmStop : t.hub.autopilot.booked,
      }}
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
        sensor: `${((fov.widthPx * fov.heightPx) / 1e6).toFixed(1)} MP`,
      }}
      camera={{
        exp: Math.max(0, EXPOSURES_S.findIndex((v) => v >= 8)), subs: Math.max(0, STACK_SIZES.findIndex((v) => v >= 8)), gain: 300, total: mission.imagingProfile ?? '—', locked: false, enabled: false,
        onExp: () => undefined, onSubs: () => undefined, onGain: () => undefined, onAuto: null, refreshNote: null, histogram: null,
        stats: [[t.hub.camera.size, `${fov.widthPx}×${fov.heightPx}`], [t.hub.camera.sensor, `${((fov.widthPx * fov.heightPx) / 1e6).toFixed(1)} MP`]],
        capture: d.offered.capture ? { label: t.steps.captureReal, run: driver.capture, disabled: d.pending !== null } : null,
        progress: { title: ms === 'CAPTURING' ? t.status.stacking(0, 1) : t.hub.camera.idle, count: '', frac: 0 },
      }}
      hand={{
        rate: 1, onRate: null,
        tracking: d.tracking === false ? 'off' : 'sidereal', onTracking: null,
        onCentre: driver.recentre, canCentre: d.offered.move && d.pending === null,
        onSync: null, synced: false,
        onStop: stop, canStop: d.offered.stop,
        onSettings: null,
        stepNote: t.hand.step(2), limitNote: null, commandNote,
      }}
      hc={{
        lcd: [`${t.hub.hc.brand} ${ms}`.slice(0, 16), pointing ? `Az${pointing.azimuth.toFixed(1)} Alt${pointing.altitude >= 0 ? '+' : '-'}${Math.abs(pointing.altitude).toFixed(1)}` : ''],
        enabled: d.offered.move && d.pending === null, onPress: driver.press, onRelease: driver.release,
        rate: 1, onRate: null,
        onAlign: null, onEnter: primary.disabled ? null : primary.run, onBack: d.offered.stop ? stop : null, onMenu: null,
        identify: mission.targetName, info: mission.targetName,
      }}
      align={{ done: live ? 2 : 0, points: [], onWhere: null, onSync: null, onClear: null }}
      focuser={{ rows: [[t.hub.focuser.state, t.hand.operatorOnly]], onIn: null, onOut: null, onRun: null, running: false, curve: [] }}
      setup={<p className="oh-hint">{t.hand.operatorOnly}</p>}
      log={[statusText]}
      frames={frames}
      onOpenFrame={(f) => { setViewing(f); setModal('capture'); }}
      modals={modal === 'capture' && viewing ? <CaptureDialog night={night} frame={viewing} onClose={() => setModal(null)} /> : null}
    />
  );
}
