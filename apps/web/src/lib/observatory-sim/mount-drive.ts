/**
 * The mount as the NexStar SE manual describes it (ADR-054 §2).
 *
 * Two DC servo axes with encoders, driven either by hand at one of the hand control's
 * nine rates or by a GoTo that runs both axes at rate 9 and comes in on its final leg
 * from the GoTo-approach side. Each axis has gear play that a reversal must cross,
 * which anti-backlash compensation winds through. The altitude axis stops at its slew
 * limits; the azimuth axis, with cordwrap on, never crosses the home line.
 *
 * Tracking holds a point on the sky: the equatorial position the tube is on. A hand
 * slew moves that point when the key is released, so the object stays where it is on
 * the sky and nothing follows the screen. Lunar and solar rates follow their bodies.
 *
 * The motor encoders report where the motors are, not where the tube points: the worm
 * gears' periodic error, the slow drift of an imperfect alignment and the tube's ringing
 * after the axes stop all move the image without moving the readout. They come out as
 * the snapshot's `imageOffset`, which only the camera sees.
 *
 * Nothing here sleeps or sets a timer. `step(nowMs)` advances the axes to the clock,
 * and a GoTo is a plan evaluated against the clock, so a test can run a 150° slew in
 * one call and the browser can run it over thirty seconds, identically.
 */

import { HC_RATES, MAX_SLEW_DEG_S, SIDEREAL_DEG_S } from './instrument';
import type { AltAz } from './safety';
import { altAzToRaDec, raDecToAltAz, type Equatorial } from './sky-field';

export type Axis = 'alt' | 'az';
export type TrackingMode = 'off' | 'sidereal' | 'lunar' | 'solar';
export type TrackedBody = 'moon' | 'sun';

export { HC_RATES, MAX_SLEW_DEG_S, SIDEREAL_DEG_S };

export function rateDegPerSec(rate: number): number {
  return (HC_RATES.find((r) => r.rate === rate) ?? HC_RATES[HC_RATES.length - 1]).degPerSec;
}

/**
 * The hand control's Scope Setup, with the manual's defaults: anti-backlash 0–99 on
 * each axis, slew limits 0–90° in altitude, GoTo approach positive, cordwrap off in
 * Alt-Az. The console lets the user change every one.
 */
export type MountSettings = {
  backlashAlt: number;
  backlashAz: number;
  slewAltMin: number;
  slewAltMax: number;
  approachAlt: 1 | -1;
  approachAz: 1 | -1;
  cordwrap: boolean;
};

export const DEFAULT_SETTINGS: MountSettings = {
  backlashAlt: 20,
  backlashAz: 20,
  slewAltMin: 0,
  slewAltMax: 90,
  approachAlt: 1,
  approachAz: 1,
  cordwrap: false,
};

/**
 * Gear play on each axis, degrees. The SE's spur-gear drives have several arcminutes
 * of it; these are the figures that make the first move after a reversal visibly late
 * at rate 5 and invisible at rate 9, which is how the mount behaves.
 */
export const GEAR_PLAY_DEG: Record<Axis, number> = { alt: 0.05, az: 0.08 };

/** Spin-up and spin-down of the servos at full rate, seconds. */
export const SPIN_UP_S = 0.4;
export const SPIN_DOWN_S = 1.2;
/** Mechanical settle after the axes stop, seconds (the platform agent's figure). */
export const SETTLE_S = 1.5;
/** The GoTo's final leg: how far out it starts, and the rate it comes in at (rate 7). */
export const APPROACH_DEG = 0.25;
export const APPROACH_DEG_S = 1;

/* --- what the encoders do not see ---------------------------------------- */

/**
 * The drive's tracking error. The SE's worm gears carry a periodic error of several to
 * a dozen arcseconds over one turn of the worm, and an alt-az alignment that is a few
 * arcminutes out lets the field creep by a few arcseconds a minute.
 */
export type TrackingErrorModel = {
  /** Peak periodic error on each axis, arcseconds, and the worm's period, seconds. */
  peArcsec: { alt: number; az: number };
  wormPeriodS: number;
  /** The alignment's slow drift, arcseconds per minute, in a seeded direction. */
  driftArcsecPerMin: number;
  seed: number;
};

export const SE_TRACKING_ERROR: TrackingErrorModel = { peArcsec: { alt: 9, az: 15 }, wormPeriodS: 470, driftArcsecPerMin: 3, seed: 1 };

/** The worm's periodic error at an absolute time, arcseconds on each axis: a fundamental and a harmonic. */
export function periodicErrorArcsec(m: TrackingErrorModel, atS: number): { alt: number; az: number } {
  const phase = (2 * Math.PI * atS) / m.wormPeriodS + m.seed;
  return {
    alt: m.peArcsec.alt * (0.8 * Math.sin(phase) + 0.2 * Math.sin(2 * phase + 1.1)),
    az: m.peArcsec.az * (0.8 * Math.sin(phase + 0.6) + 0.2 * Math.sin(3 * phase + 0.4)),
  };
}

/**
 * Where tracking has carried the image from where it started, arcseconds: the change in
 * the periodic error since tracking began, plus the drift since then. Zero at the start,
 * so taking up tracking never jumps the image.
 */
export function trackingErrorArcsec(m: TrackingErrorModel, startS: number, nowS: number): { alt: number; az: number } {
  const a = periodicErrorArcsec(m, startS);
  const b = periodicErrorArcsec(m, nowS);
  const drift = (m.driftArcsecPerMin * Math.max(0, nowS - startS)) / 60;
  const dir = m.seed * 2.4;
  return { alt: b.alt - a.alt + drift * Math.cos(dir), az: b.az - a.az + drift * Math.sin(dir) };
}

/** The tube rings after the axes stop: about two cycles a second, dying away over a second or two. */
export const RING_HZ = 2.2;
export const RING_DECAY_S = 0.6;

/** The ringing's displacement s seconds after a stop, as a fraction of its first swing. */
export function settleRing(sinceStopS: number): number {
  if (sinceStopS < 0 || sinceStopS > 5) return 0;
  return Math.exp(-sinceStopS / RING_DECAY_S) * Math.cos(2 * Math.PI * RING_HZ * sinceStopS);
}

/** The first swing after a stop from this rate, arcseconds: a few at centring rates, twenty at rate 9. */
export function ringAmplitudeArcsec(rateDegS: number): number {
  return 3 + 18 * Math.min(1, Math.abs(rateDegS));
}

/** Longest step the integrator takes; a longer gap between frames is integrated in steps this long. */
const MAX_STEP_S = 0.1;
/** A tab left in the background must not slew across the sky on return. */
const MAX_CATCHUP_S = 2;

const DEG = Math.PI / 180;
const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;
const wrapDelta = (deg: number) => (deg > 180 ? deg - 360 : deg < -180 ? deg + 360 : deg);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* --- the site, as the mount needs it ------------------------------------ */

/** What the mount needs to turn a sky position into axis positions, supplied by the console. */
export type Sky = {
  latDeg: number;
  lstHoursAt: (ms: number) => number;
  /** Where a tracked body is, for the lunar and solar rates. */
  bodyAt: (body: TrackedBody, ms: number) => Equatorial;
};

/* --- the GoTo plan -------------------------------------------------------- */

/** One axis's travel: a cruise leg at rate 9 toward the approach point, then the approach leg. */
export type AxisLeg = { from: number; to: number; startS: number; endS: number; rate: number };

export type GotoPlan = {
  startedAtMs: number;
  from: AltAz;
  /** Where the axes come to rest: the destination as the mount believes it. */
  to: AltAz;
  alt: AxisLeg[];
  az: AxisLeg[];
  /** Seconds until the axes stop; settle follows. */
  axesS: number;
  /** Seconds until the mount reports the slew complete. */
  totalS: number;
  /** The long way round, because cordwrap forbade crossing the home line. */
  longWay: boolean;
};

/** Travel time for one leg at a given rate, with the servos' spin-up and spin-down. */
export function legSeconds(distanceDeg: number, rate: number): number {
  const d = Math.abs(distanceDeg);
  if (d === 0) return 0;
  const ramp = (SPIN_UP_S + SPIN_DOWN_S) / 2;
  // Below the distance the ramps alone cover, the axis never reaches the rate.
  const rampDistance = rate * ramp;
  if (d <= rampDistance) return 2 * Math.sqrt((d * ramp) / rate);
  return ramp + d / rate;
}

/** Position along a leg at s seconds, with the same profile legSeconds integrates. */
function legPosition(leg: AxisLeg, s: number): number {
  const T = leg.endS - leg.startS;
  const d = leg.to - leg.from;
  if (T <= 0 || s >= leg.endS) return leg.to;
  if (s <= leg.startS) return leg.from;
  const t = (s - leg.startS) / T;
  // Smooth-step velocity: zero at both ends, the integral of which is the eased position.
  const eased = t * t * (3 - 2 * t);
  return leg.from + d * eased;
}

/**
 * Plan a GoTo from `from` to `to`. Both axes run at rate 9 to a point short of the
 * destination on the approach side, then come in at rate 7. The slew takes as long as
 * its slower axis, plus the settle. With cordwrap on, an azimuth path across the home
 * line is replaced by the long way round.
 */
export function planGoto(from: AltAz, to: AltAz, settings: MountSettings, startedAtMs: number, pace = 1): GotoPlan {
  const altTo = clamp(to.altitude, settings.slewAltMin, settings.slewAltMax);
  let dAz = wrapDelta(to.azimuth - from.azimuth);
  let longWay = false;
  if (settings.cordwrap) {
    // The home line sits at azimuth 0: crossing it would wrap the cables.
    const crosses = dAz > 0 ? from.azimuth + dAz >= 360 : from.azimuth + dAz < 0;
    if (crosses) {
      dAz = dAz > 0 ? dAz - 360 : dAz + 360;
      longWay = true;
    }
  }
  const legsFor = (start: number, delta: number, approach: 1 | -1): AxisLeg[] => {
    if (Math.abs(delta) < 1e-6) return [];
    const end = start + delta;
    // Approach: the final leg must travel in the approach direction. Come in from the
    // far side when the direct path would arrive against it.
    const preEnd = end - approach * APPROACH_DEG;
    const cruise = preEnd - start;
    const legs: AxisLeg[] = [];
    let cursor = 0;
    if (Math.abs(cruise) > 1e-6) {
      const T = legSeconds(cruise, MAX_SLEW_DEG_S) / pace;
      legs.push({ from: start, to: preEnd, startS: cursor, endS: cursor + T, rate: MAX_SLEW_DEG_S });
      cursor += T;
    }
    const T = legSeconds(APPROACH_DEG, APPROACH_DEG_S) / pace;
    legs.push({ from: preEnd, to: end, startS: cursor, endS: cursor + T, rate: APPROACH_DEG_S });
    return legs;
  };
  const alt = legsFor(from.altitude, altTo - from.altitude, settings.approachAlt);
  const az = legsFor(from.azimuth, dAz, settings.approachAz);
  const axesS = Math.max(alt.at(-1)?.endS ?? 0, az.at(-1)?.endS ?? 0);
  return {
    startedAtMs,
    from,
    to: { altitude: altTo, azimuth: wrap360(from.azimuth + dAz) },
    alt,
    az,
    axesS,
    totalS: axesS + SETTLE_S / pace,
    longWay,
  };
}

/** The axes' positions s seconds into the plan, azimuth unwrapped. */
export function gotoPositionAt(plan: GotoPlan, s: number): { altitude: number; azimuth: number; altRate: number; azRate: number } {
  const at = (legs: AxisLeg[], start: number) => {
    const leg = legs.find((l) => s < l.endS) ?? legs.at(-1);
    if (!leg) return { pos: start, rate: 0 };
    const pos = legPosition(leg, s);
    const ahead = legPosition(leg, s + 0.05);
    return { pos, rate: (ahead - pos) / 0.05 };
  };
  const a = at(plan.alt, plan.from.altitude);
  const z = at(plan.az, plan.from.azimuth);
  return { altitude: a.pos, azimuth: z.pos, altRate: a.rate, azRate: z.rate };
}

/* --- the pointing model ------------------------------------------------- */

/**
 * Where a GoTo lands against where the object is: the alignment's error. A few
 * arcminutes after a good SkyAlign. Sync on a centred object zeroes it nearby and
 * fades with distance, as the manual says Sync improves pointing "in that area of
 * the sky".
 */
export type PointingModel = { errorAlt: number; errorAz: number; syncs: AltAz[] };

export function landingError(model: PointingModel, at: AltAz): AltAz {
  let trust = 0;
  for (const s of model.syncs) {
    const sep = Math.hypot(wrapDelta(s.azimuth - at.azimuth) * Math.cos(at.altitude * DEG), s.altitude - at.altitude);
    trust = Math.max(trust, Math.exp(-((sep / 20) ** 2)));
  }
  return { altitude: model.errorAlt * (1 - trust), azimuth: model.errorAz * (1 - trust) };
}

/** A fresh alignment's error, from a seed so a session always lands the same way. */
export function alignmentError(seed: number): PointingModel {
  const r1 = Math.sin(seed * 12.9898) * 43758.5453;
  const r2 = Math.sin(seed * 78.233) * 12345.6789;
  const u1 = r1 - Math.floor(r1);
  const u2 = r2 - Math.floor(r2);
  // Between two and six arcminutes on each axis, either sign.
  return {
    errorAlt: ((u1 < 0.5 ? -1 : 1) * (2 + Math.abs(u1 - 0.5) * 8)) / 60,
    errorAz: ((u2 < 0.5 ? -1 : 1) * (2 + Math.abs(u2 - 0.5) * 8)) / 60,
    syncs: [],
  };
}

/* --- the mount ---------------------------------------------------------- */

type AxisState = {
  /** Commanded hand-control rate, signed, degrees per second. */
  cmd: number;
  /** Actual motor rate after the servo's ramp. */
  vel: number;
  /** Where the motor sits inside the gear play, from -play/2 to +play/2. */
  play: number;
  /** The fastest the axis has turned since it last stood still: what it rings from. */
  peak: number;
};

export type AxisRates = { alt: number; az: number };

export type MountSnapshot = {
  pointing: AltAz;
  /** Signed rates of the tube on each axis, degrees per second (tracking included). */
  rates: AxisRates;
  slewing: boolean;
  settling: boolean;
  tracking: TrackingMode;
  parked: boolean;
  /** An axis against its stop or the cordwrap line. */
  atLimit: Axis | 'cordwrap' | null;
  /** The instant the pointing is for. */
  atMs: number;
  /**
   * Where the image sits from `pointing`, degrees on each axis: tracking error and the
   * tube's ringing after a stop. The camera sees it; the encoders do not.
   */
  imageOffset: { alt: number; az: number };
};

export class NexStarMount {
  private alt = 0;
  private azUnwrapped = 0;
  private axes: Record<Axis, AxisState> = { alt: { cmd: 0, vel: 0, play: 0, peak: 0 }, az: { cmd: 0, vel: 0, play: 0, peak: 0 } };
  private lastMs: number | null = null;
  private plan: GotoPlan | null = null;
  private settleUntilMs = 0;
  private trackingMode: TrackingMode = 'off';
  /** The sky position the tracking drive holds, and the body offset it rides for lunar/solar. */
  private trackPoint: Equatorial | null = null;
  private trackBodyBasis: { body: TrackedBody; at: Equatorial } | null = null;
  private atLimit: MountSnapshot['atLimit'] = null;
  /** When the drive last took up tracking from a standstill. */
  private trackedSinceMs: number | null = null;
  /** The last stop's ringing: when, and its first swing on each axis, arcseconds. */
  private ring: { atMs: number; alt: number; az: number } | null = null;
  /** The plan whose stop has already rung. */
  private rungPlan: GotoPlan | null = null;
  parked = true;
  settings: MountSettings = { ...DEFAULT_SETTINGS };
  /** Above one, every GoTo runs this much faster than the mount: for tests only (`?turbo`). */
  pace = 1;
  model: PointingModel = { errorAlt: 0, errorAz: 0, syncs: [] };
  /** The drive's tracking error; null tracks perfectly, as the tests assume. */
  trackingError: TrackingErrorModel | null = null;

  constructor(private readonly sky: Sky) {}

  get pointing(): AltAz {
    return { altitude: this.alt, azimuth: wrap360(this.azUnwrapped) };
  }

  get slewing(): boolean {
    return this.plan !== null;
  }

  get tracking(): TrackingMode {
    return this.trackingMode;
  }

  get trackedPoint(): Equatorial | null {
    return this.trackPoint;
  }

  /** Where the tube is pointed on the sky right now, equatorial of date. */
  equatorialAt(ms: number): Equatorial {
    return altAzToRaDec(this.pointing, this.sky.latDeg, this.sky.lstHoursAt(ms));
  }

  /** Back to the state the agent leaves it in: parked at home, tracking off, no alignment. */
  reset() {
    this.plan = null;
    this.settleUntilMs = 0;
    for (const axis of ['alt', 'az'] as const) this.axes[axis] = { cmd: 0, vel: 0, play: 0, peak: 0 };
    this.trackingMode = 'off';
    this.trackPoint = null;
    this.trackBodyBasis = null;
    this.trackedSinceMs = null;
    this.ring = null;
    this.rungPlan = null;
    this.parked = true;
    this.model = { errorAlt: 0, errorAz: 0, syncs: [] };
    this.alt = 0;
    this.azUnwrapped = 0;
  }

  /** Put the tube somewhere, as a fresh connection finds it. */
  setPointing(p: AltAz) {
    this.alt = clamp(p.altitude, this.settings.slewAltMin, this.settings.slewAltMax);
    this.azUnwrapped = wrap360(p.azimuth);
  }

  /* --- the hand control ------------------------------------------------ */

  press(axis: Axis, direction: 1 | -1, rate: number) {
    if (this.plan) this.abortSlew();
    const a = this.axes[axis];
    const next = direction * rateDegPerSec(rate);
    // Anti-backlash: on a reversal the hand control rewinds the motor through part of
    // the play at once, by the compensation set. The rest is crossed at the slew rate.
    if (Math.sign(next) !== Math.sign(a.vel) && Math.sign(next) !== 0) {
      const comp = (axis === 'alt' ? this.settings.backlashAlt : this.settings.backlashAz) / 99;
      const edge = (direction * GEAR_PLAY_DEG[axis]) / 2;
      a.play += (edge - a.play) * comp;
    }
    a.cmd = next;
  }

  release(axis: Axis) {
    this.axes[axis].cmd = 0;
  }

  releaseAll() {
    this.axes.alt.cmd = 0;
    this.axes.az.cmd = 0;
  }

  /** Emergency stop: every motor dead now, no spin-down, the GoTo abandoned. */
  halt() {
    const { alt, az } = this.axes;
    if (alt.vel !== 0 || az.vel !== 0) {
      // A dead stop from speed rings harder than a ramped one.
      const swing = (v: number) => (v === 0 ? 0 : Math.sign(v) * ringAmplitudeArcsec(Math.abs(v)) * 1.4);
      this.ring = { atMs: this.lastMs ?? 0, alt: swing(alt.vel), az: swing(az.vel) };
    }
    this.plan = null;
    this.settleUntilMs = 0;
    for (const axis of ['alt', 'az'] as const) {
      this.axes[axis].cmd = 0;
      this.axes[axis].vel = 0;
      this.axes[axis].peak = 0;
    }
    this.retrack(this.lastMs ?? 0);
  }

  /* --- GoTo ------------------------------------------------------------ */

  /**
   * Slew to where `target` will be when the axes arrive. The destination is the mount's
   * belief; the tube lands off by the pointing model's error there.
   */
  goto(target: (ms: number) => AltAz, nowMs: number): GotoPlan {
    this.parked = false;
    const first = planGoto(this.pointing, target(nowMs), this.settings, nowMs, this.pace);
    const arrival = target(nowMs + first.axesS * 1000);
    const plan = planGoto(this.pointing, arrival, this.settings, nowMs, this.pace);
    this.plan = plan;
    this.settleUntilMs = nowMs + plan.totalS * 1000;
    this.axes.alt.cmd = 0;
    this.axes.az.cmd = 0;
    this.trackPoint = null;
    return plan;
  }

  get currentPlan(): GotoPlan | null {
    return this.plan;
  }

  abortSlew() {
    this.plan = null;
    this.settleUntilMs = 0;
    this.retrack(this.lastMs ?? 0);
  }

  /** Home: tube level, pointing north, as the hibernate and alignment position. */
  park(nowMs: number): GotoPlan {
    this.trackingMode = 'off';
    this.trackPoint = null;
    const plan = this.goto(() => ({ altitude: 0, azimuth: 0 }), nowMs);
    this.parked = true;
    return plan;
  }

  unpark() {
    this.parked = false;
  }

  /* --- tracking ---------------------------------------------------------- */

  setTracking(mode: TrackingMode, nowMs: number) {
    this.trackingMode = mode;
    // Mid-GoTo the drive takes up tracking where the axes land, not where the tube is
    // passing now: holding a point mid-slew would leave the target off centre.
    if (this.plan) return;
    // The tube's position is the one the last step computed: hold the sky point it is on
    // at that instant. A caller's clock that lags the steps would otherwise hold a point
    // the sky has already turned past, and the drive would track off target.
    this.retrack(this.lastMs ?? nowMs);
  }

  /** Make the tube's present sky position the one the drive holds. */
  /** Where the GoTo has the tube at `nowMs`, with the alignment's error. */
  private land(nowMs: number) {
    const plan = this.plan!;
    const s = (nowMs - plan.startedAtMs) / 1000;
    const p = gotoPositionAt(plan, s);
    // The alignment's error is between where the mount believes it is and where it
    // is; it grows in over the slew, since the model's error differs across the sky.
    const err = landingError(this.model, plan.to);
    const grown = plan.axesS > 0 ? clamp(s / plan.axesS, 0, 1) : 1;
    this.alt = clamp(p.altitude - err.altitude * grown, this.settings.slewAltMin, this.settings.slewAltMax);
    this.azUnwrapped = p.azimuth - err.azimuth * grown;
  }

  private retrack(nowMs: number) {
    if (this.trackingMode === 'off' || this.parked) {
      this.trackPoint = null;
      this.trackBodyBasis = null;
      this.trackedSinceMs = null;
      return;
    }
    this.trackPoint = this.equatorialAt(nowMs);
    this.trackedSinceMs = nowMs;
    const body: TrackedBody | null = this.trackingMode === 'lunar' ? 'moon' : this.trackingMode === 'solar' ? 'sun' : null;
    this.trackBodyBasis = body ? { body, at: this.sky.bodyAt(body, nowMs) } : null;
  }

  /** The tracked point now: fixed for sidereal, riding the body for lunar and solar. */
  private trackedAt(nowMs: number): Equatorial | null {
    if (!this.trackPoint) return null;
    if (!this.trackBodyBasis) return this.trackPoint;
    const now = this.sky.bodyAt(this.trackBodyBasis.body, nowMs);
    return {
      raHours: this.trackPoint.raHours + wrapDelta((now.raHours - this.trackBodyBasis.at.raHours) * 15) / 15,
      decDeg: this.trackPoint.decDeg + (now.decDeg - this.trackBodyBasis.at.decDeg),
    };
  }

  /* --- sync -------------------------------------------------------------- */

  /** The object is centred: tell the mount so. Pointing improves in this part of the sky. */
  sync() {
    this.model.syncs.push(this.pointing);
    if (this.model.syncs.length > 6) this.model.syncs.shift();
  }

  /* --- the clock --------------------------------------------------------- */

  /** Advance the axes to `nowMs`. */
  step(nowMs: number): MountSnapshot {
    if (this.lastMs === null) this.lastMs = nowMs;
    // The axes integrate in short steps over all the time since the last call, so a
    // slow frame rate slows nothing; a stalled tab catches up at most this far.
    const elapsed = clamp((nowMs - this.lastMs) / 1000, 0, MAX_CATCHUP_S);
    this.lastMs = nowMs;
    this.atLimit = null;
    let altRate = 0;
    let azRate = 0;

    if (this.plan) {
      const axesEndMs = this.plan.startedAtMs + this.plan.axesS * 1000;
      if (nowMs >= axesEndMs && this.rungPlan !== this.plan) {
        // The axes come in on the approach leg and stop: the tube rings along it.
        this.rungPlan = this.plan;
        const swing = (legs: AxisLeg[]) => {
          const last = legs.at(-1);
          return last ? Math.sign(last.to - last.from) * ringAmplitudeArcsec(last.rate) * 0.6 : 0;
        };
        this.ring = { atMs: axesEndMs, alt: swing(this.plan.alt), az: swing(this.plan.az) };
      }
      if (nowMs >= axesEndMs && this.trackingMode !== 'off' && !this.parked) {
        // The axes have stopped: the drive tracks from where they landed, through the
        // settle, so the object stays where it landed in the field.
        if (!this.trackPoint) {
          this.land(axesEndMs);
          this.retrack(axesEndMs);
        }
        const held = raDecToAltAz(this.trackedAt(nowMs)!, this.sky.latDeg, this.sky.lstHoursAt(nowMs));
        this.alt = held.altitude;
        this.azUnwrapped += wrapDelta(held.azimuth - wrap360(this.azUnwrapped));
      } else {
        this.land(nowMs);
        const p = gotoPositionAt(this.plan, (nowMs - this.plan.startedAtMs) / 1000);
        altRate = p.altRate;
        azRate = p.azRate;
      }
      if (nowMs >= this.settleUntilMs) {
        this.plan = null;
        this.retrack(nowMs);
      }
      return this.snapshot(altRate, azRate, nowMs);
    }

    // Tracking: the drive follows the held sky point on any axis the hand is not on.
    const tracked = this.trackedAt(nowMs);
    const follow = tracked ? raDecToAltAz(tracked, this.sky.latDeg, this.sky.lstHoursAt(nowMs)) : null;

    const handBefore = { alt: this.axes.alt.cmd !== 0 || this.axes.alt.vel !== 0, az: this.axes.az.cmd !== 0 || this.axes.az.vel !== 0 };
    let remaining = elapsed;
    do {
      const dt = Math.min(remaining, MAX_STEP_S);
      remaining -= dt;
      for (const axis of ['alt', 'az'] as const) {
        const a = this.axes[axis];
        const before = axis === 'alt' ? this.alt : this.azUnwrapped;
        const was = a.vel;
        a.vel = ramp(a.vel, a.cmd, dt);
        a.peak = Math.max(a.peak, Math.abs(a.vel));
        if (was !== 0 && a.vel === 0) {
          const swing = Math.sign(was) * ringAmplitudeArcsec(a.peak);
          a.peak = 0;
          this.ring = { atMs: nowMs - remaining * 1000, alt: axis === 'alt' ? swing : 0, az: axis === 'az' ? swing : 0 };
        }
        let moved = 0;
        if (a.vel !== 0) {
          // The motor turns; the tube moves only once the motor is against the play's edge.
          const edge = (Math.sign(a.vel) * GEAR_PLAY_DEG[axis]) / 2;
          const travel = a.vel * dt;
          const slack = edge - a.play;
          if (Math.sign(slack) === Math.sign(travel) && Math.abs(slack) >= Math.abs(travel)) {
            a.play += travel;
          } else {
            const beyond = Math.sign(slack) === Math.sign(travel) ? travel - slack : travel;
            a.play = edge;
            moved = beyond;
          }
        } else if (follow && !handBefore[axis]) {
          // The drive follows the held point. An axis the hand just left waits for the
          // retrack below, or it would snap back to the point it was slewed away from.
          const want = axis === 'alt' ? follow.altitude : this.azUnwrapped + wrapDelta(follow.azimuth - wrap360(this.azUnwrapped));
          moved = want - before;
        }
        let after = before + moved;
        if (axis === 'alt') {
          if (after < this.settings.slewAltMin || after > this.settings.slewAltMax) {
            after = clamp(after, this.settings.slewAltMin, this.settings.slewAltMax);
            a.vel = 0;
            this.atLimit = 'alt';
          }
          this.alt = after;
        } else {
          if (this.settings.cordwrap && (after < 0 || after >= 360)) {
            after = clamp(after, 0, 359.999);
            a.vel = 0;
            this.atLimit = 'cordwrap';
          }
          this.azUnwrapped = after;
        }
        if (axis === 'alt') altRate = dt > 0 ? (after - before) / dt : 0;
        else azRate = dt > 0 ? (after - before) / dt : 0;
      }
    } while (remaining > 1e-9);

    // A hand slew over on both axes: the tube's new sky position is the one the drive holds.
    const handNow = this.axes.alt.cmd !== 0 || this.axes.alt.vel !== 0 || this.axes.az.cmd !== 0 || this.axes.az.vel !== 0;
    if (!handNow && (handBefore.alt || handBefore.az || (!this.trackPoint && this.trackingMode !== 'off' && !this.parked))) {
      this.retrack(nowMs);
    }

    return this.snapshot(altRate, azRate, nowMs);
  }

  /** Where the image sits from the encoders' pointing at `nowMs`, degrees. */
  imageOffsetAt(nowMs: number): { alt: number; az: number } {
    let alt = 0;
    let az = 0;
    if (this.trackingError && this.trackPoint && this.trackedSinceMs !== null && !this.plan) {
      const e = trackingErrorArcsec(this.trackingError, this.trackedSinceMs / 1000, nowMs / 1000);
      alt += e.alt;
      az += e.az;
    }
    if (this.ring) {
      // `?turbo` shortens the settle; the ringing dies away as much faster with it.
      const k = settleRing(((nowMs - this.ring.atMs) / 1000) * this.pace);
      alt += this.ring.alt * k;
      az += this.ring.az * k;
    }
    return { alt: alt / 3600, az: az / 3600 };
  }

  private snapshot(altRate: number, azRate: number, nowMs: number): MountSnapshot {
    return {
      imageOffset: this.imageOffsetAt(nowMs),
      pointing: this.pointing,
      rates: { alt: altRate, az: azRate },
      slewing: this.plan !== null && nowMs < this.plan.startedAtMs + this.plan.axesS * 1000,
      settling: this.plan !== null && nowMs >= this.plan.startedAtMs + this.plan.axesS * 1000,
      tracking: this.trackingMode,
      parked: this.parked,
      atLimit: this.atLimit,
      atMs: nowMs,
    };
  }
}

/**
 * Move an axis rate toward what is commanded with the servo's own acceleration.
 * Speeding up is quick; slowing down — including reversing, which passes through
 * zero — takes the longer spin-down.
 */
function ramp(actual: number, commanded: number, dt: number): number {
  if (actual === commanded) return actual;
  const speedingUp = Math.sign(commanded) === Math.sign(actual) && Math.abs(commanded) > Math.abs(actual);
  const accel = MAX_SLEW_DEG_S / (speedingUp ? SPIN_UP_S : SPIN_DOWN_S);
  const delta = accel * dt;
  if (Math.abs(commanded - actual) <= delta) return commanded;
  return actual + Math.sign(commanded - actual) * delta;
}
