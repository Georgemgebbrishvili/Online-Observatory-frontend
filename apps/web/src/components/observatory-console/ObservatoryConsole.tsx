'use client';

import { Body, Equator, Observer } from 'astronomy-engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { cloudOpacity, dewOnOptics, humidityAt, seeingAt } from '@/lib/observatory-sim/atmosphere';
import { EXPOSURES_S, GAIN, ROI_BY_ID, STACK_SIZES, exposureLabel, type RoiPreset } from '@/lib/observatory-sim/camera';
import { captureEntries, withPngText } from '@/lib/observatory-sim/capture-meta';
import { getSunAltitude, getTonightDarkWindow } from '@/lib/observatory-sim/dark-window';
import { acquisitionStateAt, planAcquisition, PLATE_SOLVE_MS, type Acquisition } from '@/lib/observatory-sim/mission';
import { NexStarMount, SE_TRACKING_ERROR, alignmentError, planGoto, type Axis, type MountSettings, type MountSnapshot, type TrackingMode, type TrackedBody } from '@/lib/observatory-sim/mount-drive';
import { DEFAULT_SEEING_ARCSEC, TRAIN_BY_ID, edgeIllumination, effectiveFocalLength, fieldOfView, fieldRotationDegPerHour, obstructionRatio, resolvingPowerArcsec, type OpticalTrainId } from '@/lib/observatory-sim/optics';
import { LIMITS, angularSeparation, evaluateSafety, sunPosition, type AltAz } from '@/lib/observatory-sim/safety';
import { SESSION_MINUTES, STATIONS as SIM_STATIONS, skyStateAt, type Station } from '@/lib/observatory-sim/sim-stations';
import { airmass, hourAngle, localSiderealHours } from '@/lib/observatory-sim/site-time';
import { moonInSky, nearestObject, skyObjectsNear, tangentOffsetDeg } from '@/lib/observatory-sim/sky-field';
import { TELESCOPE_TARGET_BY_ID, targetPosition, targetTitle, type TelescopeTarget } from '@/lib/observatory-sim/telescope-targets';
import { consoleCopy } from './copy';
import { CaptureDialog, RefusedDialog, SheetDialog, TargetsDialog, displayName, type Frame, type Refusal } from './dialogs';
import LiveView, { type MountSample } from './LiveView';
import { MountSettingsPanel, type StationRow } from './panels';
import { PlatformConsole, type PlatformMission } from './platform-console';
import { plateFor } from './plates';
import { ConsoleShell, decShort, degText, duration, hms, raShort, type Action } from './shell';
import { altitudePath, bestOf, clock, nightSpan, settleSkyClock, skyNow } from './sky';

/** What the quick start points at: tonight's best target from the platform's catalogue, as the sky model knows it. */
export type TonightTarget = { name: string; targetId: string } | null;


export type ObservatoryConsoleProps = {
  locale: Locale;
  tonight: TonightTarget;
  /** The platform's cloud forecast for the night, percent. */
  nodeCloud: number | null;
  /** The platform's name for the instrument: the open station carries it. */
  observatoryName: string;
  /** The platform's mode. Everything the console draws is the sky model's; the badge says so unless the instrument is REAL. */
  simulated: boolean;
  /** The caller's active mission, when the real instrument is theirs to drive (ADR-054 §6). */
  mission: PlatformMission | null;
  /** The caption every drawn frame carries (ADR-052). */
  caption: string;
};

type RunState = 'todo' | 'running' | 'done';
type Modal = 'targets' | 'refused' | 'capture' | 'stations' | 'hand' | 'details' | 'mount' | null;

const CONNECT_MS = 2_000;
/** The alignment field: a mid-sky patch the mount solves and syncs on, as an auto-align does. */
const ALIGN_FIELD: AltAz = { altitude: 60, azimuth: 180 };
const OBJECT_RADIUS_DEG = 1.5;
const TICK_MS = 250;
const NIGHT_KEY = 'stellar.observatory.night';
const NODE_ID = 'tbilisi-01';
const AUTOFOCUS_MS = 6_000;

/**
 * The one station is the platform's observatory (ADR-053 §6, amended 2026-10-17): the
 * source listed four stations still to come, which this product has no plan behind.
 */
function stationsFor(observatoryName: string): Station[] {
  return SIM_STATIONS.filter((s) => s.id === NODE_ID).map((s) => ({ ...s, name: observatoryName, site: 'Tbilisi' }));
}

const ARROWS: Record<string, { axis: Axis; dir: 1 | -1 }> = {
  ArrowLeft: { axis: 'az', dir: -1 },
  ArrowRight: { axis: 'az', dir: 1 },
  ArrowUp: { axis: 'alt', dir: 1 },
  ArrowDown: { axis: 'alt', dir: -1 },
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
const shortName = (t: TelescopeTarget) => displayName(t).split(' · ')[0];
const indexOf = (list: readonly number[], value: number) => Math.max(0, list.findIndex((v) => v >= value));

function resolveTarget(id: string) {
  return TELESCOPE_TARGET_BY_ID.get(id) ?? TELESCOPE_TARGET_BY_ID.get(`star-${id}`) ?? null;
}

/** The camera's profile for a kind of target: planetary milliseconds, deep-sky seconds. */
function autoProfile(t: TelescopeTarget): { exp: number; subs: number; gain: number } {
  switch (t.kind) {
    case 'moon':
      return { exp: indexOf(EXPOSURES_S, 0.002), subs: indexOf(STACK_SIZES, 100), gain: 150 };
    case 'planet':
      return { exp: indexOf(EXPOSURES_S, 0.01), subs: indexOf(STACK_SIZES, 200), gain: 250 };
    case 'star':
      return { exp: indexOf(EXPOSURES_S, 1), subs: indexOf(STACK_SIZES, 8), gain: 300 };
    default:
      return { exp: indexOf(EXPOSURES_S, 8), subs: indexOf(STACK_SIZES, 8), gain: 300 };
  }
}

/**
 * The observatory console. With the platform in REAL mode and a mission of the
 * caller's, it drives the real instrument through the platform; otherwise it drives
 * the sky model's NexStar 8SE (ADR-054).
 */
export default function ObservatoryConsole(props: ObservatoryConsoleProps) {
  if (!props.simulated && props.mission) return <PlatformConsole {...props} mission={props.mission} />;
  return <SimConsole {...props} />;
}

function SimConsole({ locale, tonight, nodeCloud, observatoryName, simulated, caption }: ObservatoryConsoleProps) {
  const t = consoleCopy[locale];
  const STATIONS = useMemo(() => stationsFor(observatoryName), [observatoryName]);
  const [clockMs, setClockMs] = useState<number | null>(null);
  const now = clockMs ?? 0;
  // The sky the console draws: tonight's, while the Sun is up at the telescope.
  const [skyAheadMs, setSkyAheadMs] = useState(0);
  const skyAheadRef = useRef(0);
  skyAheadRef.current = skyAheadMs;
  const skyMs = now + skyAheadMs;

  const [selectedId, setSelectedId] = useState(NODE_ID);
  const [station, setStation] = useState<Station | null>(null);
  const [connectedAtMs, setConnectedAtMs] = useState(0);
  const [park, setPark] = useState<RunState>('todo');
  const [parkEndsAtMs, setParkEndsAtMs] = useState(0);
  const [cal, setCal] = useState<RunState>('todo');
  const [calEndsAtMs, setCalEndsAtMs] = useState(0);
  const [auto, setAuto] = useState<TelescopeTarget | null>(null);
  const [target, setTarget] = useState<TelescopeTarget | null>(null);
  const [acquisition, setAcquisition] = useState<Acquisition | null>(null);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [viewing, setViewing] = useState<Frame | null>(null);

  const [train, setTrain] = useState<OpticalTrainId>('F10_NATIVE');
  const [roiId, setRoiId] = useState<RoiPreset['id']>('full');
  const [expIx, setExpIx] = useState(indexOf(EXPOSURES_S, 8));
  const [subsIx, setSubsIx] = useState(indexOf(STACK_SIZES, 8));
  const [gain, setGain] = useState(300);
  const [rate, setRate] = useState(5);
  const [tracking, setTracking] = useState<TrackingMode>('sidereal');
  const [focus, setFocus] = useState(0);
  const [autofocus, setAutofocus] = useState<{ startedAtMs: number; from: number } | null>(null);
  const [settings, setSettings] = useState<MountSettings | null>(null);
  const [synced, setSynced] = useState(false);
  const [reticle, setReticle] = useState(true);
  const [night, setNight] = useState(false);
  const [full, setFull] = useState(false);
  const [stack, setStack] = useState<{ startsAtMs: number } | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [snap, setSnap] = useState<MountSnapshot | null>(null);
  const [exposing, setExposing] = useState<number | null>(null);
  const [history, setHistory] = useState<{ rms: number[]; seeing: number[] }>({ rms: [], seeing: [] });
  const [histogram, setHistogram] = useState<number[] | null>(null);
  /** How much of the sensor's frame the view shows, across and up: under 1 where the phone crops it to fill. */
  const [shown, setShown] = useState({ w: 1, h: 1 });

  const exp = EXPOSURES_S[expIx];
  const subsGoal = STACK_SIZES[subsIx];

  /* --- the mount ------------------------------------------------------- */

  const skyDate = useCallback((ms: number) => new Date(ms + skyAheadRef.current), []);
  const node = STATIONS[0];
  const mountRef = useRef<NexStarMount | null>(null);
  if (mountRef.current === null) {
    const observer = new Observer(node.lat, node.lon, 0);
    mountRef.current = new NexStarMount({
      latDeg: node.lat,
      lstHoursAt: (ms) => localSiderealHours(node.lon, skyDate(ms)),
      bodyAt: (body: TrackedBody, ms) => {
        const eq = Equator(body === 'moon' ? Body.Moon : Body.Sun, skyDate(ms), observer, true, true);
        return { raHours: eq.ra, decDeg: eq.dec };
      },
    });
    // The SE's worm gears and an imperfect alignment: the image wanders a few arcseconds.
    mountRef.current.trackingError = SE_TRACKING_ERROR;
  }
  const mount = mountRef.current;
  const acquisitionRef = useRef(acquisition);
  acquisitionRef.current = acquisition;
  const sampleRef = useRef<MountSample>({ pointing: { altitude: 0, azimuth: 0 }, lstHours: 0, nowMs: 0, imageOffset: { alt: 0, az: 0 }, moving: false });
  const histogramRef = useRef<number[] | null>(null);
  const offsetsRef = useRef<number[][]>([]);
  const snapRef = useRef<MountSnapshot | null>(null);
  const exposingRef = useRef<number | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const capturingRef = useRef(false);
  const centringRef = useRef<Acquisition | null>(null);
  const observingRef = useRef<Acquisition | null>(null);

  useEffect(() => {
    setSkyAheadMs(settleSkyClock(SIM_STATIONS.find((s) => s.id === NODE_ID)!));
    // `?turbo`: the same model, its GoTo and solves eight times faster. For the test suite.
    if (new URLSearchParams(window.location.search).has('turbo')) mountRef.current!.pace = 8;
    setClockMs(Date.now());
    try {
      setNight(localStorage.getItem(NIGHT_KEY) === '1');
    } catch {
      /* storage can be blocked; day mode stands */
    }
    // The mount is copied out with the clock, in the same task: set from an effect, a
    // render that cannot keep up with the tick would chain updates without end.
    const id = setInterval(() => {
      setClockMs(Date.now());
      const s = snapRef.current;
      // A still tube under a moving sky still needs a fresh instant: the target's offset is read at it.
      if (s) setSnap((prev) => (prev && s.atMs - prev.atMs < 1000 && Math.abs(prev.pointing.altitude - s.pointing.altitude) < 1e-4 && Math.abs(prev.pointing.azimuth - s.pointing.azimuth) < 1e-4 && prev.slewing === s.slewing && prev.atLimit === s.atLimit && prev.tracking === s.tracking ? prev : s));
      setExposing(exposingRef.current);
      setHistogram(histogramRef.current);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const date = useMemo(() => new Date(skyMs), [skyMs]);
  const selected = STATIONS.find((s) => s.id === selectedId) ?? STATIONS[0];
  const connecting = station !== null && now < connectedAtMs + CONNECT_MS;
  const lstHours = useMemo(() => (station ? localSiderealHours(station.lon, date) : 0), [station, date]);
  const sunAltitude = useMemo(() => (station ? getSunAltitude(station.lat, station.lon, date) : 0), [station, date]);
  const sun = useMemo(() => (station ? sunPosition(station, date) : null), [station, date]);
  const sunRef = useRef(sun);
  sunRef.current = sun;

  const trainInfo = TRAIN_BY_ID.get(train)!;
  const roi = ROI_BY_ID.get(roiId)!;
  const instrument = (station ?? selected).instrument;
  const fov = useMemo(() => fieldOfView(instrument, trainInfo, roi), [instrument, trainInfo, roi]);
  const focal = effectiveFocalLength(instrument, trainInfo);
  const fRatio = focal / instrument.apertureMm;
  // The night's seeing wanders about the site's typical figure; before a connection the panels show the typical one.
  const seeing = station ? seeingAt(DEFAULT_SEEING_ARCSEC, skyMs) : DEFAULT_SEEING_ARCSEC;

  const status = acquisition ? acquisitionStateAt(acquisition, now) : null;
  // The timeline is the plan; the mount has the last word on whether it has stopped.
  const moving = !!snap && (snap.slewing || snap.settling);
  const gotoState = !status ? 'idle' : status.state === 'SLEWING' ? 'slewing' : status.state === 'VERIFYING' ? 'solving' : status.state === 'CENTERING' || moving ? 'centring' : 'tracking';
  const onTarget = gotoState === 'tracking';
  const inGoto = gotoState === 'slewing' || gotoState === 'solving' || gotoState === 'centring';

  const pointing = snap?.pointing ?? mount.pointing;
  const targetNow = useMemo(() => (station && target ? targetPosition(target, station, date) : null), [station, target, date]);
  const targetFn = useCallback((tg: TelescopeTarget, st: Station) => (ms: number) => targetPosition(tg, st, skyDate(ms)), [skyDate]);

  const cameraOn = station !== null && !connecting && cal !== 'todo';
  const objects = useMemo(
    () => (station && cameraOn ? skyObjectsNear(station, date, pointing, OBJECT_RADIUS_DEG, lstHours) : []),
    [station, cameraOn, date, pointing, lstHours],
  );
  const moon = useMemo(() => (station ? moonInSky(station, date) : null), [station, date]);
  // The forecast's cover is the cloud the field drifts through; where it is now is the model's.
  const cloudCover = nodeCloud === null ? 0 : Math.min(1, Math.max(0, nodeCloud / 100));
  const stacking = stack !== null;
  const subsDone = stack ? Math.min(subsGoal, Math.floor((now - stack.startsAtMs) / (exp * 1000))) : 0;
  const padEnabled = cal === 'done' && park !== 'running' && !stacking && !!station;
  const timeLeftMs = station ? connectedAtMs + SESSION_MINUTES * 60_000 - now : null;
  const step = !station || connecting ? 0 : cal !== 'done' ? 1 : inGoto ? 3 : onTarget ? 4 : 2;
  const settingsNow = settings ?? mount.settings;

  /* --- the mount, once per animation frame --------------------------- */

  const stepMount = useCallback(() => {
    const nowMs = Date.now();
    const before = mount.pointing;
    let s = mount.step(nowMs);
    // The Sun exclusion: a hand slew that would carry the tube inside it stops.
    if (!s.slewing && sunRef.current && (s.rates.alt !== 0 || s.rates.az !== 0) && angularSeparation(s.pointing, sunRef.current) < LIMITS.sunAvoidanceDeg) {
      mount.setPointing(before);
      mount.halt();
      s = { ...s, pointing: mount.pointing, rates: { alt: 0, az: 0 } };
    }
    snapRef.current = s;
    sampleRef.current = { pointing: s.pointing, lstHours: localSiderealHours(node.lon, skyDate(nowMs)), nowMs, imageOffset: s.imageOffset,
      moving: s.slewing || s.settling || Math.abs(s.rates.alt) > 0.05 || Math.abs(s.rates.az) > 0.05 };
  }, [mount, node.lon, skyDate]);

  useEffect(() => {
    let handle = 0;
    let live = true;
    const loop = () => {
      if (!live) return;
      stepMount();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => {
      live = false;
      cancelAnimationFrame(handle);
    };
  }, [stepMount]);

  /* --- what of the frame the view shows -------------------------------- */

  useEffect(() => {
    const el = viewRef.current;
    if (!el || !cameraOn) return;
    const measure = () => {
      const canvas = el.querySelector('canvas');
      const { width, height } = el.getBoundingClientRect();
      let next = { w: 1, h: 1 };
      if (canvas && width > 0 && height > 0 && getComputedStyle(canvas).objectFit === 'cover') {
        // Cover scales the 16:9 frame to fill the box and crops what overflows.
        const box = width / height;
        next = box < 16 / 9 ? { w: box / (16 / 9), h: 1 } : { w: 1, h: 16 / 9 / box };
      }
      setShown((prev) => (Math.abs(prev.w - next.w) < 1e-3 && Math.abs(prev.h - next.h) < 1e-3 ? prev : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [cameraOn]);

  /* --- full view ------------------------------------------------------ */

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

  /* --- commands ------------------------------------------------------ */

  const disconnect = useCallback(() => {
    mount.reset();
    setStation(null);
    setPark('todo');
    setCal('todo');
    setAuto(null);
    setTarget(null);
    setAcquisition(null);
    setStack(null);
    setFrames([]);
    setSynced(false);
    setFullView(false);
    histogramRef.current = null;
    offsetsRef.current = [];
  }, [mount, setFullView]);

  const connect = useCallback((s: Station) => {
    disconnect();
    // The agent leaves the mount parked at home: tube level, pointing north.
    mount.reset();
    // The reset leaves the drive's tracking off; the selector still says what the user chose.
    mount.setTracking(tracking, Date.now());
    setSelectedId(s.id);
    setStation(s);
    setConnectedAtMs(Date.now());
  }, [disconnect, mount, tracking]);

  const pick = useCallback((s: Station) => {
    if (s.soon) return;
    if (station && station.id !== s.id) disconnect();
    setSelectedId(s.id);
    setModal((m) => (m === 'stations' ? null : m));
  }, [station, disconnect]);

  const parkHome = useCallback(() => {
    setAcquisition(null);
    setStack(null);
    const startedAtMs = Date.now();
    const plan = mount.park(startedAtMs);
    setParkEndsAtMs(startedAtMs + plan.totalS * 1000);
    setPark('running');
  }, [mount]);

  /** Align: leave home, slew to a field, solve it, sync. The alignment's residual error is the session's. */
  const align = useCallback(() => {
    const startedAtMs = Date.now();
    mount.unpark();
    const plan = mount.goto(() => ALIGN_FIELD, startedAtMs);
    setCalEndsAtMs(startedAtMs + plan.totalS * 1000 + PLATE_SOLVE_MS / mount.pace);
    setCal('running');
  }, [mount]);

  const pointAt = useCallback((next: TelescopeTarget) => {
    if (!station) return;
    const at = new Date(skyNow());
    const to = targetPosition(next, station, at);
    const verdict = evaluateSafety(station, to, at);
    if (!verdict.ok) {
      setRefusal({ target: next, reason: verdict.reason });
      setModal('refused');
      return;
    }
    const startedAtMs = Date.now();
    mount.unpark();
    const plan = mount.goto(targetFn(next, station), startedAtMs);
    setTarget(next);
    setStack(null);
    setModal(null);
    setSynced(false);
    setAcquisition(planAcquisition({ targetId: next.id, targetName: targetTitle(next), plan, warm: true, pace: mount.pace }));
  }, [station, mount, targetFn]);

  const cancelGoto = useCallback(() => {
    mount.abortSlew();
    setAcquisition(null);
  }, [mount]);

  const press = useCallback((axis: Axis, dir: 1 | -1) => {
    if (acquisitionRef.current && acquisitionStateAt(acquisitionRef.current, Date.now()).state !== 'OBSERVING') {
      acquisitionRef.current = null;
      setAcquisition(null);
    }
    mount.press(axis, dir, rate);
  }, [mount, rate]);
  const release = useCallback((axis: Axis) => mount.release(axis), [mount]);

  const quickStart = useCallback(() => {
    const tg = tonight ? resolveTarget(tonight.targetId) : null;
    if (!tg) return;
    setModal(null);
    if (station?.id === NODE_ID && cal === 'done') {
      pointAt(tg);
      return;
    }
    connect(STATIONS[0]);
    setAuto(tg);
  }, [tonight, station, cal, connect, pointAt, STATIONS]);

  const sync = useCallback(() => {
    mount.sync();
    setSynced(true);
  }, [mount]);

  const changeSettings = useCallback((next: MountSettings) => {
    mount.settings = next;
    setSettings(next);
  }, [mount]);

  const autoCamera = useCallback(() => {
    if (!target) return;
    const p = autoProfile(target);
    setExpIx(p.exp);
    setSubsIx(p.subs);
    setGain(p.gain);
  }, [target]);

  const capture = useCallback(async (subs: number, startedAtMs: number) => {
    const canvas = viewRef.current?.querySelector('canvas');
    if (!canvas || !target || !station || capturingRef.current) return;
    capturingRef.current = true;
    try {
      const capturedAt = Date.now();
      const provenance = simulated ? t.provenanceSimulated : station.name;
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
      if (!blob) return;
      // The file carries its own record: exposure, gain, frames and time ride in the PNG.
      const png = withPngText(new Uint8Array(await blob.arrayBuffer()), captureEntries({
        target: shortName(target), exposureSec: exp, gain, frames: subs, startedAtMs, endedAtMs: capturedAt, provenance,
      }));
      const digest = await crypto.subtle.digest('SHA-256', png);
      const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(new Blob([png], { type: 'image/png' }));
      });
      const stamp = new Date(capturedAt).toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const n = frames.length + 1;
      const frame: Frame = {
        id: `${stamp}-${n}`, n, dataUrl, filename: `stellar_${stamp}_${target.id}.png`, hash,
        targetName: shortName(target), subs, exposureSec: exp, gain, startedAt: startedAtMs, capturedAt,
        optics: `${Math.round(focal)} MM · F/${fRatio.toFixed(1).replace(/\.0$/, '')}`, scale: `${fov.plateScaleArcsecPx.toFixed(2)}″ / PX`,
        seeing: `${seeing.toFixed(1)}″`, stationName: station.name,
        provenance,
      };
      setFrames((prev) => [frame, ...prev]);
      setViewing(frame);
      setModal('capture');
    } finally {
      capturingRef.current = false;
    }
  }, [target, station, frames.length, exp, gain, focal, fRatio, fov.plateScaleArcsecPx, seeing, simulated, t]);

  // Tracking follows the selector; the Moon takes the lunar rate when it is pointed at.
  useEffect(() => {
    mount.setTracking(tracking, Date.now());
  }, [mount, tracking]);

  // Retire timed steps and run the chains, once a tick.
  useEffect(() => {
    if (clockMs === null) return;
    if (auto && station && !connecting && cal === 'todo') align();
    if (park === 'running' && now >= parkEndsAtMs) setPark('done');
    if (cal === 'running' && now >= calEndsAtMs) {
      mount.model = alignmentError(connectedAtMs);
      setCal('done');
      if (auto) {
        pointAt(auto);
        setAuto(null);
      }
    }
    if (acquisition && station && target) {
      const st = acquisitionStateAt(acquisition, now);
      if (st.state === 'CENTERING' && centringRef.current !== acquisition) {
        // The solve told the mount where it is: a sync here, then the residual move,
        // from where the tube is this instant rather than at the last frame.
        centringRef.current = acquisition;
        stepMount();
        mount.sync();
        mount.goto(targetFn(target, station), Date.now());
      }
      if (st.state === 'OBSERVING' && observingRef.current !== acquisition) {
        observingRef.current = acquisition;
        setTracking((mode) => (target.kind === 'moon' ? 'lunar' : mode === 'off' || mode === 'lunar' || mode === 'solar' ? 'sidereal' : mode));
        mount.setTracking(target.kind === 'moon' ? 'lunar' : 'sidereal', Date.now());
      }
    }
    if (autofocus) {
      const tt = Math.min(1, (now - autofocus.startedAtMs) / AUTOFOCUS_MS);
      // A V-curve: out one way, back through focus, out the other, then to the minimum.
      const sweep = tt < 0.35 ? autofocus.from + (6 - autofocus.from) * (tt / 0.35) : tt < 0.75 ? 6 - 12 * ((tt - 0.35) / 0.4) : -6 + 6 * ((tt - 0.75) / 0.25);
      setFocus(Math.round(sweep));
      if (tt >= 1) {
        setFocus(0);
        setAutofocus(null);
      }
    }
    if (stack && subsDone >= subsGoal) {
      setStack(null);
      void capture(subsGoal, stack.startsAtMs);
    }
    if (timeLeftMs !== null && timeLeftMs <= 0) disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Telemetry traces, once a second.
  const second = Math.floor(now / 1000);
  useEffect(() => {
    if (!station) return;
    // Track RMS: the scatter of the image about its mean over the last ten seconds, arcseconds.
    const off = mount.imageOffsetAt(Date.now());
    offsetsRef.current = [...offsetsRef.current, [off.alt * 3600, off.az * 3600]].slice(-10);
    const pts = offsetsRef.current;
    const mean = pts.reduce((m, p) => [m[0] + p[0] / pts.length, m[1] + p[1] / pts.length], [0, 0]);
    const rms = onTarget && tracking !== 'off' ? Math.sqrt(pts.reduce((sum, p) => sum + (p[0] - mean[0]) ** 2 + (p[1] - mean[1]) ** 2, 0) / pts.length) : 0;
    const see = seeingAt(DEFAULT_SEEING_ARCSEC, second * 1000 + skyAheadRef.current);
    setHistory((h) => ({ rms: [...h.rms, rms].slice(-28), seeing: [...h.seeing, see].slice(-28) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [second]);

  const closeModal = useCallback(() => {
    setModal(null);
    setViewing(null);
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

  /* --- the step bar ---------------------------------------------------- */

  const tonightTarget = tonight ? resolveTarget(tonight.targetId) : null;
  const stepLabel = target ? shortName(target) : 'target';
  const expLabel = exposureLabel(exp);
  const expTotal = `${subsGoal} × ${expLabel} · ${duration(subsGoal * exp)}`;
  const gotoEstimate = (to: AltAz | null) => (to ? Math.round(planGoto(pointing, to, settingsNow, 0).totalS + (PLATE_SOLVE_MS + 5_000) / 1000) : 25);
  const pointEstimate = acquisition ? Math.round((acquisition.settledAtMs - acquisition.startedAtMs) / 1000) : gotoEstimate(targetNow);
  const alignEstimate = Math.round(planGoto({ altitude: 0, azimuth: 0 }, ALIGN_FIELD, settingsNow, 0).totalS + PLATE_SOLVE_MS / 1000);

  let primary: Action;
  let secondary: Action[] = [];
  if (step === 0) {
    primary = connecting ? { label: t.steps.connecting, run: () => undefined, disabled: true } : { label: t.steps.connectTo(selected.name), run: () => connect(selected) };
    secondary = [{ label: t.steps.stationDetails, run: () => setModal('details') }];
  } else if (step === 1) {
    primary = park === 'running'
      ? { label: t.steps.parking, run: () => undefined, disabled: true }
      : cal === 'running' ? { label: t.steps.aligning, run: () => undefined, disabled: true }
      : { label: t.steps.align, run: align };
    secondary = [];
  } else if (step === 2) {
    primary = target && !acquisition ? { label: t.steps.pointTo(stepLabel), run: () => pointAt(target) } : { label: t.steps.chooseTarget, run: () => setModal('targets') };
    secondary = [
      ...(tonightTarget && tonight ? [{ label: tonight.name, run: () => pointAt(tonightTarget) }] : []),
      { label: t.steps.search, run: () => setModal('targets') },
      { label: t.steps.parkHome, run: parkHome, disabled: park === 'running' },
    ];
  } else if (step === 3) {
    primary = { label: t.steps.pointTo(stepLabel), run: () => undefined, disabled: true };
    secondary = [{ label: t.steps.cancelGoto, run: cancelGoto }];
  } else {
    primary = stacking
      ? { label: t.steps.stacking(subsDone, subsGoal), run: () => undefined, disabled: true }
      : { label: t.steps.capture(subsGoal, expLabel), run: () => setStack({ startsAtMs: Date.now() }), icon: 'camera' };
    secondary = stacking
      ? [{ label: t.steps.stopStack, run: () => setStack(null) }]
      : [{ label: t.steps.recentre, run: () => target && pointAt(target) }, { label: t.steps.changeTarget, run: () => setModal('targets') }];
  }
  const hints = [
    t.steps.hints.connect,
    t.steps.hints.align,
    t.steps.hints.target(tonight?.name ?? null),
    t.steps.hints.point(pointEstimate),
    stacking ? t.steps.hints.stacking(subsDone, subsGoal, expLabel)
      : target && targetNow && targetNow.altitude <= 0 ? t.steps.hints.belowHorizon
      : tracking !== 'off' ? t.steps.hints.tracking : t.steps.hints.drifting,
  ];
  const flowSteps: Array<[string, string]> = [
    [t.steps.names[0], `≈ ${CONNECT_MS / 1000} s`],
    [t.steps.names[1], `≈ ${alignEstimate} s`],
    [t.steps.names[2], t.steps.youPick],
    [t.steps.names[3], `≈ ${pointEstimate} s`],
    [t.steps.names[4], expTotal],
  ];
  const goStep = (i: number) => {
    if (i === 0) disconnect();
    else if (i === 1) { setAcquisition(null); setStack(null); setCal('todo'); }
    else if (i === 2) { setAcquisition(null); setStack(null); setModal('targets'); }
    else if (i === 3 && target) pointAt(target);
  };

  /* --- the keyboard ---------------------------------------------------- */

  const keysRef = useRef({ padEnabled, station, modal, full, press, release, setFullView, primary, quickStart });
  keysRef.current = { padEnabled, station, modal, full, press, release, setFullView, primary, quickStart };
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key === 'Escape' && k.full) return k.setFullView(false);
      if (k.modal || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      const arrow = ARROWS[e.key];
      if (arrow && k.station) {
        if (!k.padEnabled) return;
        e.preventDefault();
        if (!e.repeat) k.press(arrow.axis, arrow.dir);
      } else if (e.key === 'f' || e.key === 'F') {
        k.setFullView(!k.full);
      } else if (e.key === 's' || e.key === 'S') {
        k.quickStart();
      } else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) && !k.primary.disabled) {
        k.primary.run();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const arrow = ARROWS[e.key];
      if (arrow) keysRef.current.release(arrow.axis);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const sample = useCallback(() => sampleRef.current, []);
  const onExposure = useCallback((progress: number) => {
    exposingRef.current = progress;
  }, []);
  const onHistogram = useCallback((bins: number[]) => {
    histogramRef.current = bins;
  }, []);

  /* --- what the panels read -------------------------------------------- */

  const span = useMemo(() => (station ? nightSpan(station, new Date(Math.floor(skyMs / 60_000) * 60_000)) : null), [station, Math.floor(skyMs / 60_000)]); // eslint-disable-line react-hooks/exhaustive-deps
  const path = useMemo(() => (station && target && span ? altitudePath(target, station, span, 40) : null), [station, target, span]);
  const best = path ? bestOf(path) : null;
  const darkWin = useMemo(() => getTonightDarkWindow(selected.lat, selected.lon, new Date(Math.floor(skyMs / 60_000) * 60_000), selected.timezone), [selected, Math.floor(skyMs / 60_000)]); // eslint-disable-line react-hooks/exhaustive-deps

  const minute = Math.floor(skyMs / 60_000);
  const stationRows = useMemo<StationRow[]>(() => {
    const at = new Date(minute * 60_000);
    return STATIONS.map((s) => {
      const state = skyStateAt(s, at);
      return { station: s, dark: state === 'night', twilight: state === 'twilight', local: clockMs === null ? '—' : clock(at.getTime(), s.timezone) };
    });
  }, [minute, STATIONS, clockMs]);

  const mounted = clockMs !== null;
  const skyState = skyStateAt(selected, date);
  const hoursLeft = (label: string, ms: number) => {
    const m = Math.max(0, Math.round(ms / 60_000));
    return [label, `${Math.floor(m / 60)} h ${pad2(m % 60)} m`] as const;
  };
  const dark = !mounted ? ([t.darkLeft, '—'] as const)
    : darkWin.isCurrentlyDark && darkWin.dawnEnd
    ? hoursLeft(t.darkLeft, darkWin.dawnEnd.getTime() - skyMs)
    : darkWin.duskStart && darkWin.duskStart.getTime() > skyMs ? hoursLeft(t.darkIn, darkWin.duskStart.getTime() - skyMs) : ([t.darkLeft, '—'] as const);

  const longWay = acquisition?.plan.longWay ?? false;
  const statusText = !station ? t.status.standby
    : connecting ? t.status.connecting
    : stacking ? t.status.stacking(subsDone, subsGoal)
    : gotoState === 'slewing' ? (longWay ? t.status.slewingLong : t.status.slewing)
    : gotoState === 'solving' ? t.status.solving
    : gotoState === 'centring' ? t.status.centring
    : onTarget ? (tracking === 'off' ? t.status.drifting : tracking === 'lunar' ? t.status.lunar : t.status.tracking)
    : park === 'running' ? t.status.parking
    : cal === 'running' ? t.status.aligning
    : cal === 'done' ? t.status.ready
    : park === 'done' ? t.status.parked
    : t.status.connected;
  const idle = step >= 3 ? null
    : step < 2 || !cameraOn
      ? { title: t.observatory, text: t.idle.text(tonight?.name ?? null), note: simulated ? t.simulated : observatoryName }
      : { title: t.idle.ready, text: target ? t.idle.pointTo(shortName(target)) : t.idle.chooseRisen };
  const battery = station ? Math.max(5, 100 - Math.floor(((now - connectedAtMs) / 60_000) * 0.3)) : null;
  const stationName = (station ?? selected).name;
  // The field the view actually shows: the whole frame, or what the phone's crop leaves.
  const fovText = `${t.stage.fov} ${(fov.widthArcmin * (cameraOn ? shown.w : 1)).toFixed(1)}′ × ${(fov.heightArcmin * (cameraOn ? shown.h : 1)).toFixed(1)}′`;
  const scaleText = `${fov.plateScaleArcsecPx.toFixed(2)}″ / PX · ${t.stage.framesHud} ${frames.length}`;
  const opticsLine = `${Math.round(focal)} MM · F/${fRatio.toFixed(1).replace(/\.0$/, '')}`;
  const sessionTime = station ? hms(now - connectedAtMs) : '00:00:00';
  const rmsNow = onTarget && tracking !== 'off' ? `${history.rms[history.rms.length - 1]?.toFixed(1) ?? '0.6'}″` : '—';
  const skyRow: [string, string][] = [
    [t.skyLabel, mounted ? t.sky[skyState] : '—'],
    [t.cloud, selected.id === NODE_ID && nodeCloud !== null ? `${nodeCloud}%` : '—'],
    [t.seeing, `${seeing.toFixed(1)}″`],
  ];
  const quickName = tonight && tonightTarget ? tonight.name : null;

  // Where the target sits from the frame's centre, arcminutes, once the mount is on it.
  // Both at the snapshot's instant: the target moves while the tick catches up.
  const offsetText = (() => {
    if (!onTarget || !targetNow || !snap || !station || !target) return null;
    const d = tangentOffsetDeg(snap.pointing, targetPosition(target, station, skyDate(snap.atMs)));
    const dx = d.x * 60;
    const dy = d.y * 60;
    if (Math.hypot(dx, dy) < 0.1) return t.stage.centred;
    return `${t.stage.offset} ${Math.abs(dx).toFixed(1)}′ ${dx >= 0 ? 'E' : 'W'} · ${Math.abs(dy).toFixed(1)}′ ${dy >= 0 ? 'N' : 'S'}`;
  })();
  const near = !onTarget && cameraOn && !inGoto ? nearestObject(objects, pointing) : null;
  const hudTarget: [string, string, string | null] | null = target && targetNow
    ? [shortName(target), `RA ${raShort(targetNow.raHours)} · DEC ${decShort(targetNow.decDeg)}`, offsetText]
    : near
      ? [`${t.stage.near} ${near.object.name}`, `${near.separationDeg.toFixed(2)}°`, null]
      : null;
  const eqNow = useMemo(() => (station ? mount.equatorialAt(Date.now()) : null), [station, pointing, mount]); // eslint-disable-line react-hooks/exhaustive-deps
  const am = airmass(pointing.altitude);
  const rotation = station ? fieldRotationDegPerHour(station.lat, pointing.altitude, pointing.azimuth) : 0;
  // The conditions in the field: the target's height, the cloud over it, the dew on the glass.
  const targetAlt = targetNow?.altitude ?? null;
  const humidity = station ? humidityAt(skyMs, darkWin.duskStart?.getTime() ?? null, cloudCover) : null;
  const dew = station && humidity !== null ? dewOnOptics(humidity, (now - connectedAtMs) / 60_000) : 0;
  const cloudHere = cameraOn ? cloudOpacity(pointing, now, cloudCover) : 0;
  const below = cameraOn && target !== null && targetAlt !== null && targetAlt <= 0;
  const alerts: Array<{ text: string; warn: boolean }> = !cameraOn ? [] : [
    ...(below ? [{ text: t.alerts.belowHorizon, warn: true }] : []),
    ...(!below && target && targetAlt !== null && targetAlt < LIMITS.minAltitudeDeg && step >= 3 ? [{ text: t.alerts.low(LIMITS.minAltitudeDeg), warn: true }] : []),
    ...(cloudHere > 0.3 ? [{ text: t.alerts.cloud, warn: false }] : []),
    ...(dew > 0.25 && humidity !== null ? [{ text: t.alerts.dew(Math.round(humidity)), warn: false }] : []),
  ];
  const limitNote = snap?.atLimit ? (snap.atLimit === 'cordwrap' ? t.hand.atLimit.cordwrap : t.hand.atLimit.alt) : null;
  const refreshNote = cameraOn && exp >= 2 ? t.camera.refresh(expLabel) : null;

  const feed = station && cameraOn ? (
    <LiveView
      sample={sample}
      objects={objects}
      latDeg={station.lat}
      sunAltitudeDeg={sunAltitude}
      moon={moon}
      exposureSec={exp}
      fovArcmin={fov.widthArcmin}
      seeingArcsec={seeing}
      diffractionArcsec={resolvingPowerArcsec(station.instrument)}
      plateScaleArcsecPx={fov.plateScaleArcsecPx}
      apertureMm={station.instrument.apertureMm}
      obstruction={obstructionRatio(station.instrument)}
      defocus={focus}
      bortle={station.bortle}
      cloudCover={cloudCover}
      dew={dew}
      edgeIllumination={edgeIllumination(trainInfo)}
      subs={stacking ? Math.max(1, subsDone) : 1}
      gain={gain}
      onExposure={onExposure}
      onHistogram={onHistogram}
    />
  ) : null;

  const modals = (
    <>
      {modal === 'targets' && station && (
        <TargetsDialog night={night} station={station} tonightId={tonightTarget?.id ?? null} onPoint={pointAt} onClose={closeModal} />
      )}
      {modal === 'refused' && refusal && station && (
        <RefusedDialog night={night} station={station} refusal={refusal} onChoose={() => setModal('targets')} onClose={closeModal} />
      )}
      {modal === 'capture' && viewing && <CaptureDialog night={night} frame={viewing} onClose={closeModal} />}
      {modal === 'mount' && (
        <SheetDialog night={night} title={t.mount.title} onClose={closeModal}>
          <MountSettingsPanel settings={settingsNow} onChange={changeSettings} />
        </SheetDialog>
      )}
      {modal === 'details' && (
        <SheetDialog night={night} title={t.details.title(selected.name)} onClose={closeModal}>
          <dl className="sdo-dl" style={{ gridTemplateColumns: '1fr' }}>
            {([
              [t.details.site, selected.site],
              [t.details.elevation, `${selected.elevationM} m`],
              [t.details.sky, t.details.bortle(selected.bortle)],
              [t.details.optics, selected.instrument.optics],
              [t.details.aperture, `${selected.instrument.apertureMm} mm`],
              [t.details.focalLength, `${selected.instrument.focalLengthMm} mm`],
              [t.details.resolution, `${resolvingPowerArcsec(selected.instrument).toFixed(2)}″`],
              [t.details.mount, selected.instrument.mount],
              [t.details.camera, t.details.cameraKind],
              [t.details.sensor, `${fieldOfView(selected.instrument).widthPx} × ${fieldOfView(selected.instrument).heightPx} · ${selected.instrument.pixelSizeUm} µm`],
              [t.details.session, t.details.hours(SESSION_MINUTES / 60)],
            ] as const).map(([k, v]) => (
              <div key={k}><dt className="sdo-lbl">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </SheetDialog>
      )}
    </>
  );

  return (
    <ConsoleShell
      t={t}
      mounted={mounted}
      night={night}
      onNight={toggleNight}
      simulated={simulated}
      observatoryName={observatoryName}
      clocks={{ utc: mounted ? clock(skyMs, 'UTC', true) : '--:--:--', local: mounted ? clock(skyMs, selected.timezone, true) : '--:--:--', site: selected.site.split(',')[0], dark }}
      quick={{ name: quickName, plate: tonightTarget ? plateFor(tonightTarget.id) : null, onStart: quickStart }}
      stations={{ rows: stationRows, selectedId, onPick: pick, sky: skyRow, selected, skyState }}
      session={{ elapsed: sessionTime, connected: station !== null, onEnd: disconnect, label: t.session.parkEnd }}
      stage={{
        viewRef,
        feed,
        stream: false,
        train,
        onTrain: setTrain,
        roi: roiId,
        onRoi: setRoiId,
        reticle,
        onReticle: () => setReticle((v) => !v),
        full,
        onFull: () => setFullView(!full),
        status: { text: statusText, go: onTarget || stacking, blink: inGoto || connecting || park === 'running' || cal === 'running' },
        exposing: cameraOn && exp >= 0.5 && exposing !== null ? exposing : null,
        alerts,
        hudLive: [cameraOn ? (simulated ? t.stage.simulatedFeed : t.stage.liveFeed) : t.stage.standby, stationName, opticsLine],
        hudTarget,
        hudField: [fovText, scaleText],
        caption,
        idle,
      }}
      flow={{ steps: flowSteps, step, hint: hints[step], primary, secondary, goStep, total: expTotal }}
      pointing={{
        path,
        pointing: station ? pointing : null,
        rows: [
          [t.pointing.altitude, station ? degText(pointing.altitude) : '—'],
          [t.pointing.azimuth, station ? degText(pointing.azimuth) : '—'],
          [t.pointing.ra, station && eqNow ? raShort(eqNow.raHours) : '—'],
          [t.pointing.dec, station && eqNow ? decShort(eqNow.decDeg) : '—'],
          [t.pointing.hourAngle, station && eqNow ? `${hourAngle(eqNow.raHours, station.lon, date).toFixed(2)} h` : '—'],
          [t.pointing.airmass, station && am !== null ? am.toFixed(2) : '—'],
          [t.pointing.rotation, station ? `${rotation.toFixed(1)}°/h` : '—'],
          [t.pointing.bestAt, best && best.altitude > 0 && station ? clock(best.t, station.timezone) : '—'],
        ],
        rms: rmsNow,
        rmsHistory: history.rms,
        seeing: `${seeing.toFixed(1)}″`,
        seeingHistory: history.seeing,
        battery,
        sensor: `${((fieldOfView(instrument).widthPx * fieldOfView(instrument).heightPx) / 1e6).toFixed(1)} MP`,
      }}
      camera={{
        exp: expIx, subs: subsIx, gain, total: expTotal, locked: stacking, enabled: true,
        onExp: (i) => setExpIx(Math.max(0, Math.min(EXPOSURES_S.length - 1, i))),
        onSubs: (i) => setSubsIx(Math.max(0, Math.min(STACK_SIZES.length - 1, i))),
        onGain: (v) => setGain(Math.max(GAIN.min, Math.min(GAIN.max, v))),
        onAuto: target ? autoCamera : null,
        refreshNote,
        histogram: cameraOn ? histogram : null,
      }}
      hand={{
        rate, onRate: (v) => setRate(Math.max(1, Math.min(9, v))),
        tracking, onTracking: (m) => setTracking(m),
        focus, onFocus: (d) => setFocus((f) => Math.max(-12, Math.min(12, f + d))),
        onAutofocus: cameraOn ? () => setAutofocus({ startedAtMs: Date.now(), from: focus }) : null, focusing: autofocus !== null,
        enabled: padEnabled, onPress: press, onRelease: release,
        onCentre: () => target && pointAt(target), canCentre: onTarget && !stacking,
        onSync: cal === 'done' && !inGoto && !!station ? sync : null, synced,
        onStop: () => { mount.halt(); setAcquisition(null); setStack(null); }, canStop: !!station && (inGoto || stacking || (snap?.rates.alt !== 0 || snap?.rates.az !== 0)),
        onSettings: () => setModal('mount'),
        stepNote: null, limitNote, commandNote: null,
      }}
      frames={frames}
      onOpenFrame={(f) => { setViewing(f); setModal('capture'); }}
      onAddFrame={step === 4 && !stacking ? () => setStack({ startsAtMs: Date.now() }) : null}
      phone={{ tracking: rmsNow, seeing: `${seeing.toFixed(1)}″` }}
      sheets={{ stations: modal === 'stations', hand: modal === 'hand', onClose: closeModal, onOpenStations: () => setModal('stations'), onOpenHand: () => setModal('hand') }}
      modals={modals}
    />
  );
}
