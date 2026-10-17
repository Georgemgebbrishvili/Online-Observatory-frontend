/**
 * The mission machine.
 *
 * An acquisition — everything between "go to that" and "you are looking at it" — is
 * planned as a deterministic timeline the moment the command is accepted, from the
 * mount's own GoTo plan (ADR-054 §2): the slew takes as long as the axes take, then
 * the plate solve, then a centring move. `acquisitionStateAt` is pure: the same
 * instant always yields the same state, on the server and in the browser, in a test
 * at 1000× or on a roof in real time.
 */

import type { GotoPlan } from './mount-drive';
import type { AltAz } from './safety';

export type MissionState =
  | 'REQUESTED'
  | 'SCHEDULED'
  | 'PREPARING'
  | 'SLEWING'
  | 'VERIFYING'
  | 'CENTERING'
  | 'OBSERVING'
  | 'CAPTURING'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'WEATHER_HOLD'
  | 'NOT_VISIBLE'
  | 'HARDWARE_ERROR'
  | 'CANCELLED'
  | 'FAILED';

export const TERMINAL_STATES: readonly MissionState[] = ['COMPLETE', 'CANCELLED', 'FAILED'] as const;

export type MissionPhase = {
  state: MissionState;
  startsAtMs: number;
  endsAtMs: number;
  /** What the instrument is doing, in the words the mission log will show. */
  detail: string;
};

export type Acquisition = {
  targetId: string;
  from: AltAz;
  to: AltAz;
  startedAtMs: number;
  phases: MissionPhase[];
  /** When the instrument is on target and the view is live. */
  settledAtMs: number;
  /** The mount's plan for the slew: the cordwrap's long way round is its. */
  plan: GotoPlan;
};

/** Unparking the mount and waking the camera, before the first slew of a session. */
export const PREPARE_MS = 6_000;
/** A plate solve on the mini-PC: ASTAP on a 585 frame takes a few seconds. */
export const PLATE_SOLVE_MS = 4_000;
/** The centring move: a short slew of the residual, then a second solve to confirm it. */
export const CENTER_MS = 5_000;

export function planAcquisition(input: {
  targetId: string;
  targetName: string;
  plan: GotoPlan;
  /** Skip the unpark when the instrument is already awake and on sky. */
  warm?: boolean;
  /** Above one, the solve and the centring run this much faster: for tests only. */
  pace?: number;
}): Acquisition {
  const { targetId, targetName, plan, warm = false, pace = 1 } = input;
  const startedAtMs = plan.startedAtMs;
  const durations: Array<[MissionState, number, string]> = [
    ...(warm ? [] : ([['PREPARING', PREPARE_MS, 'Unparking mount, waking camera']] as Array<[MissionState, number, string]>)),
    ['SLEWING', plan.totalS * 1000, plan.longWay ? `Slewing to ${targetName}, the long way round` : `Slewing to ${targetName}`],
    ['VERIFYING', PLATE_SOLVE_MS / pace, 'Plate-solving the field'],
    ['CENTERING', CENTER_MS / pace, `Centring ${targetName}`],
  ];

  let cursor = startedAtMs;
  const phases: MissionPhase[] = durations.map(([state, ms, detail]) => {
    const phase = { state, startsAtMs: cursor, endsAtMs: cursor + ms, detail };
    cursor += ms;
    return phase;
  });
  phases.push({ state: 'OBSERVING', startsAtMs: cursor, endsAtMs: Number.POSITIVE_INFINITY, detail: `On target — ${targetName}` });

  return { targetId, from: plan.from, to: plan.to, startedAtMs, phases, settledAtMs: cursor, plan };
}

export type AcquisitionStatus = {
  state: MissionState;
  detail: string;
  /** 0–1 through the current phase. 1 once observing. */
  progress: number;
  /** Milliseconds until the view is live. 0 once it is. */
  msToSettled: number;
};

export function acquisitionStateAt(acq: Acquisition, nowMs: number): AcquisitionStatus {
  const phase =
    acq.phases.find((p) => nowMs >= p.startsAtMs && nowMs < p.endsAtMs) ??
    (nowMs < acq.startedAtMs ? acq.phases[0] : acq.phases[acq.phases.length - 1]);
  const span = phase.endsAtMs - phase.startsAtMs;
  const progress = Number.isFinite(span) ? Math.min(1, Math.max(0, (nowMs - phase.startsAtMs) / span)) : 1;
  return { state: phase.state, detail: phase.detail, progress, msToSettled: Math.max(0, acq.settledAtMs - nowMs) };
}
