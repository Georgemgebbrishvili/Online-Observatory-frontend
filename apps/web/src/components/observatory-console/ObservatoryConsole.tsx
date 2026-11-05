'use client';

import { Body, Equator, Observer } from 'astronomy-engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { cloudOpacity, dewOnOptics, humidityAt, seeingAt } from '@/lib/observatory-sim/atmosphere';
import { EXPOSURES_S, GAIN, ROI_BY_ID, STACK_SIZES, exposureLabel, type RoiPreset } from '@/lib/observatory-sim/camera';
import { captureEntries, withPngText } from '@/lib/observatory-sim/capture-meta';
import { getSunAltitude, getTonightDarkWindow } from '@/lib/observatory-sim/dark-window';
import { acquisitionStateAt, planAcquisition, PLATE_SOLVE_MS, type Acquisition } from '@/lib/observatory-sim/mission';
import { NexStarMount, SE_TRACKING_ERROR, alignmentError, type Axis, type MountSettings, type MountSnapshot, type TrackingMode, type TrackedBody } from '@/lib/observatory-sim/mount-drive';
import { DEFAULT_SEEING_ARCSEC, TRAIN_BY_ID, edgeIllumination, effectiveFocalLength, fieldOfView, fieldRotationDegPerHour, obstructionRatio, resolvingPowerArcsec, type OpticalTrainId } from '@/lib/observatory-sim/optics';
import { LIMITS, angularSeparation, evaluateSafety, sunPosition, type AltAz } from '@/lib/observatory-sim/safety';
import { SESSION_MINUTES, STATIONS as SIM_STATIONS, type Station } from '@/lib/observatory-sim/sim-stations';
import { airmass, hourAngle, localSiderealHours } from '@/lib/observatory-sim/site-time';
import { moonInSky, nearestObject, skyObjectsNear, tangentOffsetDeg } from '@/lib/observatory-sim/sky-field';
import { SHOWPIECES, SHOWPIECE_BY_ID, aimPosition } from '@/lib/observatory-sim/showpieces';
import { TELESCOPE_TARGET_BY_ID, gradeTargets, manualTarget, parseDec, parseRa, targetPosition, targetTitle, type TelescopeTarget } from '@/lib/observatory-sim/telescope-targets';
import { consoleCopy } from './copy';
import { CaptureDialog, RefusedDialog, SheetDialog, displayName, type Frame, type Refusal } from './dialogs';
import LiveView, { type MountSample } from './LiveView';
import { MountSettingsPanel } from './panels';
import { PlatformConsole, type PlatformMission } from './platform-console';
import { plateFor } from './plates';
import { ConsoleShell, decShort, degText, duration, lstText, raShort, type Action, type HubKind, type HubTarget } from './shell';
import { altitudePath, bestOf, clock, nightSpan, settleSkyClock, skyNow, tonightSky } from './sky';
import SkyDome from './sky-dome';

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
type Modal = 'refused' | 'capture' | 'mount' | null;

const CONNECT_MS = 2_000;
/** The alignment field: a mid-sky patch the mount solves and syncs on, as an auto-align does. */
const ALIGN_FIELD: AltAz = { altitude: 60, azimuth: 180 };
const OBJECT_RADIUS_DEG = 1.5;
const TICK_MS = 250;
const NIGHT_KEY = 'stellar.observatory.night';
const NODE_ID = 'tbilisi-01';
const AUTOFOCUS_MS = 6_000;
/** The live stack's cadence at planetary exposures: what the view can align and average. */
const LIVE_FRAME_S = 0.06;
/** Raw video first, the air's boil and all, before the live stack starts. */
const LIVE_DELAY_MS = 4_000;
/** The AUX focuser's position at best focus, as the hub read it off the real motor; a step of the model's focus is 25 of its steps. */
const FOCUS_HOME = 24_672;
const FOCUS_STEP = 25;

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
const hubKind = (t: TelescopeTarget): HubKind => (t.kind === 'planet' || t.kind === 'moon' || t.kind === 'star' ? t.kind : 'deep');
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

  const [station, setStation] = useState<Station | null>(null);
  const [connectedAtMs, setConnectedAtMs] = useState(0);
  const [park, setPark] = useState<RunState>('todo');
  const [parkEndsAtMs, setParkEndsAtMs] = useState(0);
  const [cal, setCal] = useState<RunState>('todo');
  const [calEndsAtMs, setCalEndsAtMs] = useState(0);
  const [auto, setAuto] = useState<TelescopeTarget | null>(null);
  const [alignNext, setAlignNext] = useState(false);
  /** The target the Autopilot will find: tonight's best until the user picks another. */
  const [picked, setPicked] = useState<string | null>(tonight ? resolveTarget(tonight.targetId)?.id ?? null : null);
  const [points, setPoints] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [afCurve, setAfCurve] = useState<number[]>([]);
  const [custom, setCustom] = useState<TelescopeTarget[]>([]);
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
  /** The live stack that runs once on target: the view settles from the air's ripple to a clean frame. */
  const [live, setLive] = useState<{ startsAtMs: number } | null>(null);
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
  const selected = STATIONS[0];
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
  const targetNow = useMemo(() => (station && target ? aimPosition(target, station, date) : null), [station, target, date]);
  const targetFn = useCallback((tg: TelescopeTarget, st: Station) => (ms: number) => aimPosition(tg, st, skyDate(ms)), [skyDate]);

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
  // The live view aligns and averages the frames as they arrive; at planetary rates it keeps up at about 25 a second.
  const liveDone = live ? Math.max(0, Math.min(subsGoal, Math.floor((now - live.startsAtMs) / (Math.max(exp, LIVE_FRAME_S) * 1000)))) : 0;
  const settled = live !== null && liveDone >= subsGoal;
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
    setLive(null);
    setFrames([]);
    setSynced(false);
    setPoints([]);
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
    setStation(s);
    setConnectedAtMs(Date.now());
  }, [disconnect, mount, tracking]);

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
    // A showpiece brings its own camera: the train that frames it and the subs that suit it.
    const recipe = SHOWPIECE_BY_ID.get(next.id)?.recipe;
    if (recipe) {
      setTrain(recipe.train);
      setRoiId(recipe.roi);
      setExpIx(indexOf(EXPOSURES_S, recipe.exposureS));
      setGain(recipe.gain);
      setSubsIx(indexOf(STACK_SIZES, recipe.stack));
    }
    setTarget(next);
    setStack(null);
    setLive(null);
    setModal(null);
    setSynced(false);
    setAcquisition(planAcquisition({ targetId: next.id, targetName: targetTitle(next), plan, warm: true, pace: mount.pace }));
  }, [station, mount, targetFn]);

  const cancelGoto = useCallback(() => {
    mount.abortSlew();
    setAcquisition(null);
  }, [mount]);

  /** One press from anywhere: connect and align first when the session has not, then the GoTo. */
  const observe = useCallback((tg: TelescopeTarget) => {
    setModal(null);
    setPicked(tg.id);
    const at = new Date(skyNow());
    const verdict = evaluateSafety(node, targetPosition(tg, node, at), at);
    if (!verdict.ok) {
      setRefusal({ target: tg, reason: verdict.reason });
      setModal('refused');
      return;
    }
    if (station?.id === NODE_ID && cal === 'done') {
      pointAt(tg);
      return;
    }
    if (station?.id === NODE_ID) {
      setAuto(tg);
      return;
    }
    connect(STATIONS[0]);
    setAuto(tg);
  }, [node, station, cal, connect, pointAt, STATIONS]);

  // A new exposure, gain, train or focus starts the live stack again, as capture software does.
  useEffect(() => {
    setLive((l) => (l ? { startsAtMs: Date.now() } : l));
  }, [expIx, gain, train, roiId, focus, subsIx]);

  const press = useCallback((axis: Axis, dir: 1 | -1) => {
    if (acquisitionRef.current && acquisitionStateAt(acquisitionRef.current, Date.now()).state !== 'OBSERVING') {
      acquisitionRef.current = null;
      setAcquisition(null);
    }
    setLive(null);
    mount.press(axis, dir, rate);
  }, [mount, rate]);
  const release = useCallback((axis: Axis) => mount.release(axis), [mount]);


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
    if ((auto || alignNext) && station && !connecting && cal === 'todo') {
      align();
      setAlignNext(false);
    }
    if (park === 'running' && now >= parkEndsAtMs) setPark('done');
    if (cal === 'running' && now >= calEndsAtMs) {
      mount.model = alignmentError(connectedAtMs);
      setCal('done');
      if (station) setPoints((ps) => [...ps, `${t.hub.autopilot.pipe[0]} · ${clock(skyNow(), station.timezone)}`]);
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
        setPoints((ps) => [...ps, `${shortName(target)} · ${clock(skyNow(), station.timezone)}`].slice(-8));
        stepMount();
        mount.sync();
        mount.goto(targetFn(target, station), Date.now());
      }
      if (st.state === 'OBSERVING' && observingRef.current !== acquisition) {
        observingRef.current = acquisition;
        setTracking((mode) => (target.kind === 'moon' ? 'lunar' : mode === 'off' || mode === 'lunar' || mode === 'solar' ? 'sidereal' : mode));
        mount.setTracking(target.kind === 'moon' ? 'lunar' : 'sidereal', Date.now());
        setLive({ startsAtMs: Date.now() + LIVE_DELAY_MS });
      }
    }
    if (autofocus) {
      const tt = Math.min(1, (now - autofocus.startedAtMs) / AUTOFOCUS_MS);
      // A V-curve: out one way, back through focus, out the other, then to the minimum.
      const sweep = tt < 0.35 ? autofocus.from + (6 - autofocus.from) * (tt / 0.35) : tt < 0.75 ? 6 - 12 * ((tt - 0.35) / 0.4) : -6 + 6 * ((tt - 0.75) / 0.25);
      setFocus(Math.round(sweep));
      setAfCurve((c) => [...c, sweep]);
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

  /* --- the autopilot ---------------------------------------------------- */

  const pickedTarget = picked ? resolveTarget(picked) ?? custom.find((c) => c.id === picked) ?? null : null;
  const addCustom = useCallback((raText: string, decText: string) => {
    const ra = parseRa(raText);
    const dec = parseDec(decText);
    if (ra === null || dec === null) return false;
    const tg = manualTarget(ra, dec);
    setCustom((c) => [...c.filter((x) => x.id !== tg.id), tg]);
    setPicked(tg.id);
    return true;
  }, []);
  const expLabel = exposureLabel(exp);
  const expTotal = `${subsGoal} × ${expLabel} · ${duration(subsGoal * exp)}`;

  /** Where am I?: connect if need be, then the solve-and-sync on a field. */
  const whereAmI = useCallback(() => {
    if (!station) {
      connect(STATIONS[0]);
      setAlignNext(true);
      return;
    }
    setAcquisition(null);
    align();
  }, [station, connect, STATIONS, align]);

  const stopAll = useCallback(() => {
    mount.halt();
    setAcquisition(null);
    setAuto(null);
    setStack(null);
    setLive(null);
  }, [mount]);

  const busy = connecting || cal === 'running' || park === 'running';
  let primary: Action;
  // Until the console has hydrated a press would be lost: the button waits for it.
  if (clockMs === null) primary = { label: t.hub.autopilot.go, run: () => undefined, disabled: true };
  else if (busy) primary = { label: t.hub.autopilot.busy, run: () => undefined, disabled: true };
  else if (inGoto) primary = { label: t.hub.autopilot.cancel, run: cancelGoto };
  else if (onTarget && target && pickedTarget?.id === target.id) primary = { label: t.hub.autopilot.recentre, run: () => pointAt(target) };
  else primary = pickedTarget ? { label: t.hub.autopilot.go, run: () => observe(pickedTarget) } : { label: t.hub.autopilot.pick, run: () => undefined, disabled: true };

  const pipeNow = connecting || cal === 'running' ? 0 : gotoState === 'slewing' ? 1 : gotoState === 'solving' ? 2 : gotoState === 'centring' ? 3 : -1;
  const pipeDone = onTarget ? 5 : gotoState === 'centring' ? 3 : gotoState === 'solving' ? 2 : gotoState === 'slewing' ? 1 : cal === 'done' ? 1 : 0;

  const captureAction: Action = stacking
    ? { label: t.steps.stopStack, run: () => setStack(null) }
    // The capture takes the live stack over where it stands: a settled stack is kept at once.
    : { label: t.steps.capture(subsGoal, expLabel), run: () => setStack({ startsAtMs: live?.startsAtMs ?? Date.now() }), disabled: step !== 4, icon: 'camera' };

  /* --- the keyboard ---------------------------------------------------- */

  const keysRef = useRef({ padEnabled, station, modal, full, press, release, setFullView, primary });
  keysRef.current = { padEnabled, station, modal, full, press, release, setFullView, primary };
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
  // Every target the sky model knows, graded once a minute: up and safe first, highest first.
  const graded = useMemo(() => (clockMs === null ? [] : gradeTargets(node, new Date(minute * 60_000))), [minute, node, clockMs === null]); // eslint-disable-line react-hooks/exhaustive-deps
  const hubTargets = useMemo<HubTarget[]>(() => graded
    .map(({ target: tg, position, visible }) => ({ id: tg.id, name: shortName(tg), sub: tg.catalog && tg.catalog !== shortName(tg) ? tg.catalog : t.targets.kinds[tg.kind], kind: hubKind(tg), altitude: position.altitude, up: visible }))
    .concat(custom.map((tg) => {
      const position = targetPosition(tg, node, new Date(minute * 60_000));
      return { id: tg.id, name: tg.name, sub: t.hub.targets.filters.custom, kind: 'star' as const, altitude: position.altitude, up: position.altitude > 0, custom: true };
    }))
    .sort((x, y) => Number(y.up) - Number(x.up) || y.altitude - x.altitude), [graded, custom, node, minute, t]);
  const bestTargets = useMemo(() => {
    const show = new Set(SHOWPIECES.map((sp) => sp.id));
    return hubTargets.filter((h) => h.up && show.has(h.id)).slice(0, 3);
  }, [hubTargets]);
  const tonightAt = useMemo(() => (clockMs === null ? null : tonightSky(node, new Date(minute * 60_000))), [minute, node, clockMs === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const mounted = clockMs !== null;
  const hoursLeft = (label: string, ms: number) => {
    const m = Math.max(0, Math.round(ms / 60_000));
    return [label, `${Math.floor(m / 60)} h ${pad2(m % 60)} m`] as const;
  };

  const longWay = acquisition?.plan.longWay ?? false;
  const statusText = !station ? t.status.standby
    : connecting ? t.status.connecting
    : stacking ? t.status.stacking(subsDone, subsGoal)
    : live && !settled && onTarget ? t.status.liveStack(liveDone, subsGoal)
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
      ? { title: t.observatory, text: t.idle.text(pickedTarget ? shortName(pickedTarget) : null), note: simulated ? t.simulated : observatoryName }
      : { title: t.idle.ready, text: pickedTarget ? t.idle.pointTo(shortName(pickedTarget)) : t.idle.chooseRisen };
  const battery = station ? Math.max(5, 100 - Math.floor(((now - connectedAtMs) / 60_000) * 0.3)) : null;
  const stationName = (station ?? selected).name;
  // The field the view actually shows: the whole frame, or what the phone's crop leaves.
  const fovText = `${t.stage.fov} ${(fov.widthArcmin * (cameraOn ? shown.w : 1)).toFixed(1)}′ × ${(fov.heightArcmin * (cameraOn ? shown.h : 1)).toFixed(1)}′`;
  const scaleText = `${fov.plateScaleArcsecPx.toFixed(2)}″ / PX · ${t.stage.framesHud} ${frames.length}`;
  const opticsLine = `${Math.round(focal)} MM · F/${fRatio.toFixed(1).replace(/\.0$/, '')}`;
  const rmsNow = onTarget && tracking !== 'off' ? `${history.rms[history.rms.length - 1]?.toFixed(1) ?? '0.6'}″` : '—';
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
      subs={stacking ? Math.max(1, subsDone) : live ? Math.max(1, liveDone) : 1}
      registerOn={target?.kind === 'planet' && exp < 0.1 ? targetNow : null}
      gain={gain}
      onExposure={onExposure}
      onHistogram={onHistogram}
    />
  ) : null;

  // The Autopilot's own record of what the telescope did, as the hub keeps it.
  const tz = selected.timezone;
  useEffect(() => {
    if (clockMs === null || !station) return;
    setLog((l) => [...l, `${clock(skyNow(), tz, true)}  ${statusText}`].slice(-60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusText, station]);

  const offArcmin = (() => {
    if (!onTarget || !snap || !station || !target) return null;
    const d = tangentOffsetDeg(snap.pointing, targetPosition(target, station, skyDate(snap.atMs)));
    return Math.hypot(d.x * 60, d.y * 60);
  })();
  const pickedPos = pickedTarget && mounted ? targetPosition(pickedTarget, node, date) : null;
  const recipe = pickedTarget ? SHOWPIECE_BY_ID.get(pickedTarget.id)?.recipe : undefined;
  const focusPos = FOCUS_HOME + focus * FOCUS_STEP;
  const fps = exp < 1 ? Math.min(30, Math.round(1 / Math.max(exp, 1 / 30))) : null;
  const lcdState = !station ? 'Off' : connecting ? 'Connecting' : cal === 'running' ? 'Aligning' : park === 'running' ? 'Parking'
    : gotoState === 'slewing' ? 'Slewing' : gotoState === 'solving' ? 'Solving' : gotoState === 'centring' ? 'Centring'
    : onTarget && target ? shortName(target) : t.hub.hc.ready;
  const lcd: [string, string] = [
    `${t.hub.hc.brand} ${lcdState}`,
    station ? `Az${pointing.azimuth.toFixed(1)} Alt${pointing.altitude >= 0 ? '+' : '-'}${Math.abs(pointing.altitude).toFixed(1)}` : '',
  ];
  const dayChip = !mounted ? '' : darkWin.isCurrentlyDark && darkWin.dawnEnd
    ? t.hub.tonight.darkNow(hoursLeft('', darkWin.dawnEnd.getTime() - skyMs)[1])
    : darkWin.duskStart && darkWin.duskStart.getTime() > skyMs ? t.hub.tonight.darkIn(hoursLeft('', darkWin.duskStart.getTime() - skyMs)[1]) : t.hub.tonight.daytime;
  const at = (ms: number | null) => (ms === null ? '—' : clock(ms, tz));
  const bar = tonightAt && tonightAt.sunset !== null && tonightAt.sunrise !== null && tonightAt.duskStart !== null && tonightAt.dawnEnd !== null
    ? (() => {
        const start = tonightAt.sunset - 3_600_000;
        const len = tonightAt.sunrise + 3_600_000 - start;
        const f = (ms: number) => Math.min(1, Math.max(0, (ms - start) / len));
        return { dark: [f(tonightAt.duskStart), f(tonightAt.dawnEnd)] as [number, number], now: f(skyMs) };
      })()
    : null;

  const modals = (
    <>
      {modal === 'refused' && refusal && (
        <RefusedDialog night={night} station={station ?? node} refusal={refusal} onChoose={closeModal} onClose={closeModal} />
      )}
      {modal === 'capture' && viewing && <CaptureDialog night={night} frame={viewing} onClose={closeModal} />}
      {modal === 'mount' && (
        <SheetDialog night={night} title={t.mount.title} onClose={closeModal}>
          <MountSettingsPanel settings={settingsNow} onChange={changeSettings} />
        </SheetDialog>
      )}
    </>
  );

  const setup = (
    <div className="oh-pane--cols">
      <div>
        <h3 className="oh-h3" style={{ marginTop: 0 }}>{t.hub.setup.telescope}</h3>
        <dl className="oh-kv">
          {([
            [t.details.optics, selected.instrument.optics],
            [t.details.aperture, `${selected.instrument.apertureMm} mm`],
            [t.details.focalLength, `${selected.instrument.focalLengthMm} mm`],
            [t.details.resolution, `${resolvingPowerArcsec(selected.instrument).toFixed(2)}″`],
            [t.details.mount, selected.instrument.mount],
            [t.details.camera, t.details.cameraKind],
            [t.details.sensor, `${fieldOfView(selected.instrument).widthPx} × ${fieldOfView(selected.instrument).heightPx} · ${selected.instrument.pixelSizeUm} µm`],
          ] as const).map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>
      <div>
        <h3 className="oh-h3" style={{ marginTop: 0 }}>{t.hub.setup.site}</h3>
        <dl className="oh-kv">
          {([
            [t.details.site, selected.site],
            [t.details.elevation, `${selected.elevationM} m`],
            [t.details.sky, t.details.bortle(selected.bortle)],
            [t.cloud, nodeCloud !== null ? `${nodeCloud}%` : '—'],
            [t.seeing, `${seeing.toFixed(1)}″`],
            [t.details.session, t.details.hours(SESSION_MINUTES / 60)],
          ] as const).map(([k, v]) => (
            <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <button type="button" className="oh-btn" style={{ width: '100%' }} onClick={() => setModal('mount')}>{t.hub.setup.mountSettings}</button>
      </div>
    </div>
  );

  return (
    <ConsoleShell
      t={t}
      mounted={mounted}
      night={night}
      onNight={toggleNight}
      simulated={simulated}
      observatoryName={observatoryName}
      clock={{ local: mounted ? clock(skyMs, tz, true) : '--:--:--', lst: mounted ? lstText(localSiderealHours(node.lon, date)) : '--' }}
      devices={[
        { key: 'mount', label: t.hub.devices.mount, text: !station ? t.hub.devices.offline : park === 'running' || (park === 'done' && cal !== 'done') ? t.hub.devices.parked : inGoto ? t.hub.devices.slewing : cal === 'done' ? t.hub.devices.aligned : t.hub.devices.online, on: !!station && !connecting },
        { key: 'camera', label: t.hub.devices.camera, text: !cameraOn ? t.hub.devices.offline : fps !== null ? t.hub.devices.fps(fps) : expLabel, on: cameraOn },
        { key: 'focuser', label: t.hub.devices.focuser, text: station ? t.hub.devices.pos(focusPos) : t.hub.devices.offline, on: !!station && !connecting },
      ]}
      onPark={station && park !== 'running' ? parkHome : null}
      onStopAll={station ? stopAll : null}
      tonight={{
        chip: dayChip,
        rows: tonightAt ? [
          [t.hub.tonight.sunset, at(tonightAt.sunset)],
          [t.hub.tonight.sunrise, at(tonightAt.sunrise)],
          [t.hub.tonight.darkFrom, at(tonightAt.duskStart)],
          [t.hub.tonight.darkUntil, at(tonightAt.dawnEnd)],
          [t.hub.tonight.moon, `${tonightAt.moonPercent}% · ${tonightAt.moonWaxing ? t.hub.tonight.waxing : t.hub.tonight.waning}`],
          [t.hub.tonight.moonRiseSet, `${at(tonightAt.moonRise)} / ${at(tonightAt.moonSet)}`],
        ] : [],
        bar,
      }}
      targets={{ list: hubTargets, best: bestTargets, up: hubTargets.filter((h) => h.up).length, selectedId: picked, onSelect: setPicked, onCustom: addCustom, locked: false }}
      dome={mounted ? <SkyDome locale={locale} station={station ?? node} minuteMs={minute * 60_000} pointing={station ? pointing : null} targetId={target?.id ?? null} onPick={observe} /> : null}
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
      rails={{
        onAutoExp: target ? autoCamera : null,
        onFocus: cameraOn ? () => { setAfCurve([]); setAutofocus({ startedAtMs: Date.now(), from: focus }); } : null,
        focusing: autofocus !== null,
        onPng: cameraOn && target && !stacking ? () => void capture(1, Date.now()) : null,
      }}
      autopilot={{
        name: pickedTarget ? shortName(pickedTarget) : null,
        sub: pickedTarget ? t.targets.kinds[pickedTarget.kind] : null,
        plate: pickedTarget ? plateFor(pickedTarget.id) : null,
        rows: pickedPos ? [
          [t.pointing.altitude, degText(pickedPos.altitude)],
          [t.pointing.ra, raShort(pickedPos.raHours)],
          [t.pointing.dec, decShort(pickedPos.decDeg)],
        ] : [],
        go: primary,
        busy: busy || inGoto,
        pipe: { now: pipeNow, done: pipeDone },
        readout: [
          [t.hub.autopilot.offTarget, offArcmin === null ? '—' : `${offArcmin.toFixed(1)}′`],
          [t.hub.autopilot.pass, gotoState === 'solving' ? '1' : gotoState === 'centring' || onTarget ? '2' : '—'],
          [t.hub.autopilot.solveTime, pipeDone >= 3 ? `${(PLATE_SOLVE_MS / mount.pace / 1000).toFixed(1)} s` : '—'],
        ],
        log,
        links: [
          { label: t.hub.autopilot.whereAmI, run: whereAmI, disabled: busy || inGoto },
          { label: t.hub.autopilot.gotoOnly, run: () => pickedTarget && pointAt(pickedTarget), disabled: cal !== 'done' || !pickedTarget || inGoto },
          { label: t.hub.autopilot.sync, run: sync, disabled: cal !== 'done' || inGoto },
        ],
        after: [...(recipe ? [t.hub.autopilot.autoCamera] : []), t.hub.autopilot.keepCentred],
        note: target && targetNow && targetNow.altitude <= 0 ? t.steps.hints.belowHorizon : null,
      }}
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
        stats: [
          [t.hub.camera.size, `${roi.widthPx}×${roi.heightPx}`],
          [t.hub.camera.depth, exp < 0.1 ? '8-bit' : '16-bit'],
          [t.hub.camera.rate, !cameraOn ? '—' : fps !== null ? `${fps} fps` : `1/${expLabel}`],
          [t.hub.camera.exposure, expLabel],
          [t.hub.camera.gain, String(gain)],
          [t.hub.camera.sensor, `${((fieldOfView(instrument).widthPx * fieldOfView(instrument).heightPx) / 1e6).toFixed(1)} MP`],
        ],
        capture: captureAction,
        progress: stacking
          ? { title: t.hub.camera.running(subsDone, subsGoal), count: `${subsDone} / ${subsGoal}`, frac: subsDone / subsGoal }
          : live && onTarget
            ? { title: settled ? t.status.tracking : t.status.liveStack(liveDone, subsGoal), count: `${liveDone} / ${subsGoal}`, frac: liveDone / subsGoal }
            : { title: t.hub.camera.idle, count: '', frac: 0 },
      }}
      hand={{
        rate, onRate: (v) => setRate(Math.max(1, Math.min(9, v))),
        tracking, onTracking: (m) => setTracking(m),
        onCentre: () => target && pointAt(target), canCentre: onTarget && !stacking,
        onSync: cal === 'done' && !inGoto && !!station ? sync : null, synced,
        onStop: stopAll, canStop: !!station && (inGoto || stacking || (snap?.rates.alt !== 0 || snap?.rates.az !== 0)),
        onSettings: () => setModal('mount'),
        stepNote: null, limitNote, commandNote: null,
      }}
      hc={{
        lcd,
        enabled: padEnabled, onPress: press, onRelease: release,
        rate, onRate: (v) => setRate(Math.max(1, Math.min(9, v))),
        onAlign: busy || inGoto ? null : whereAmI,
        onEnter: primary.disabled ? null : primary.run,
        onBack: stopAll,
        onMenu: () => setModal('mount'),
        identify: near ? near.object.name : target ? shortName(target) : t.hub.hc.noObject,
        info: pickedTarget && pickedPos ? `${shortName(pickedTarget)} ${pickedPos.altitude.toFixed(0)}deg` : t.hub.hc.noObject,
      }}
      align={{
        done: [!!station, cal === 'done', synced, points.length > 1].filter(Boolean).length,
        points,
        onWhere: busy || inGoto ? null : whereAmI,
        onSync: cal === 'done' && !inGoto && !!station ? sync : null,
        onClear: cal === 'done' && !inGoto ? () => { setPoints([]); setSynced(false); setAcquisition(null); setCal('todo'); } : null,
      }}
      focuser={{
        rows: [
          [t.hub.focuser.position, station ? String(focusPos) : '—'],
          [t.hub.focuser.offset, focus === 0 ? '0' : `${focus > 0 ? '+' : '−'}${Math.abs(focus * FOCUS_STEP)}`],
          [t.hub.focuser.state, autofocus ? t.hub.focuser.moving : t.hub.focuser.idle],
        ],
        onIn: station ? () => setFocus((f) => Math.max(-12, f - 1)) : null,
        onOut: station ? () => setFocus((f) => Math.min(12, f + 1)) : null,
        onRun: cameraOn ? () => { setAfCurve([]); setAutofocus({ startedAtMs: Date.now(), from: focus }); } : null,
        running: autofocus !== null,
        curve: afCurve,
      }}
      setup={setup}
      log={log}
      frames={frames}
      onOpenFrame={(f) => { setViewing(f); setModal('capture'); }}
      modals={modals}
    />
  );
}
