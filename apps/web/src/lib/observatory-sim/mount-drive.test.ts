import { describe, expect, it } from 'vitest';
import { HC_RATES, SIDEREAL_DEG_S } from './instrument';
import {
  DEFAULT_SETTINGS,
  GEAR_PLAY_DEG,
  NexStarMount,
  SETTLE_S,
  SE_TRACKING_ERROR,
  periodicErrorArcsec,
  ringAmplitudeArcsec,
  settleRing,
  trackingErrorArcsec,
  alignmentError,
  landingError,
  legSeconds,
  planGoto,
  rateDegPerSec,
  type Sky,
} from './mount-drive';
import { altAzToRaDec, raDecToAltAz } from './sky-field';

/** Tbilisi, with sidereal time running at its real rate from an arbitrary epoch. */
const LAT = 41.7151;
const sky: Sky = {
  latDeg: LAT,
  lstHoursAt: (ms) => (((ms / 3_600_000) * 1.0027379) % 24 + 24) % 24,
  bodyAt: (body, ms) => (body === 'moon' ? { raHours: ((ms / 3_600_000) * 0.0366) % 24, decDeg: 10 } : { raHours: 0, decDeg: 0 }),
};

function run(mount: NexStarMount, fromMs: number, toMs: number, stepMs = 50) {
  let last = mount.step(fromMs);
  for (let t = fromMs + stepMs; t <= toMs; t += stepMs) last = mount.step(t);
  return last;
}

describe('the hand control rates', () => {
  it("are the manual's nine: .5x, 1x, 4x, 8x, 16x, 64x sidereal, then 1, 3 and 5°/s", () => {
    expect(HC_RATES.map((r) => r.label)).toEqual(['0.5×', '1×', '4×', '8×', '16×', '64×', '1°/s', '3°/s', '5°/s']);
    expect(rateDegPerSec(1)).toBeCloseTo(0.5 * SIDEREAL_DEG_S, 9);
    expect(rateDegPerSec(6)).toBeCloseTo(64 * SIDEREAL_DEG_S, 9);
    expect(rateDegPerSec(9)).toBe(5);
  });
});

describe('a GoTo plan', () => {
  it('runs both axes at rate 9, comes in on the approach side at rate 7, and settles', () => {
    const plan = planGoto({ altitude: 0, azimuth: 0 }, { altitude: 60, azimuth: 180 }, DEFAULT_SETTINGS, 0);
    // Azimuth is the longer axis: 180° less the approach leg at 5°/s, plus the ramps, plus 0.25° at 1°/s.
    expect(plan.axesS).toBeGreaterThan(36);
    expect(plan.axesS).toBeLessThan(39);
    expect(plan.totalS).toBeCloseTo(plan.axesS + SETTLE_S, 6);
    expect(plan.az.at(-1)?.rate).toBe(1);
    expect(plan.az.at(-1)!.to - plan.az.at(-1)!.from).toBeCloseTo(0.25, 6);
    expect(plan.to).toEqual({ altitude: 60, azimuth: 180 });
    expect(plan.longWay).toBe(false);
  });

  it('takes the short way round by default, and the long way with cordwrap on', () => {
    const short = planGoto({ altitude: 40, azimuth: 350 }, { altitude: 40, azimuth: 10 }, DEFAULT_SETTINGS, 0);
    expect(short.longWay).toBe(false);
    expect(short.axesS).toBeLessThan(8);
    const wrapped = planGoto({ altitude: 40, azimuth: 350 }, { altitude: 40, azimuth: 10 }, { ...DEFAULT_SETTINGS, cordwrap: true }, 0);
    expect(wrapped.longWay).toBe(true);
    expect(wrapped.axesS).toBeGreaterThan(65);
    expect(wrapped.to.azimuth).toBeCloseTo(10, 6);
  });

  it('clamps the destination to the slew limits', () => {
    const plan = planGoto({ altitude: 30, azimuth: 0 }, { altitude: 88, azimuth: 0 }, { ...DEFAULT_SETTINGS, slewAltMax: 80 }, 0);
    expect(plan.to.altitude).toBe(80);
  });

  it('spends longer on a leg at a slower rate', () => {
    expect(legSeconds(10, 5)).toBeLessThan(legSeconds(10, 1));
    expect(legSeconds(0, 5)).toBe(0);
  });
});

describe('the mount', () => {
  it('slews to the plan and lands off by the alignment error, then holds the sky', () => {
    const mount = new NexStarMount(sky);
    mount.model = alignmentError(7);
    mount.unpark();
    mount.setTracking('sidereal', 0);
    mount.setPointing({ altitude: 10, azimuth: 90 });
    const plan = mount.goto(() => ({ altitude: 50, azimuth: 150 }), 0);
    const landed = run(mount, 0, plan.totalS * 1000 + 100);
    const err = landingError(mount.model, plan.to);
    expect(landed.slewing).toBe(false);
    expect(Math.hypot(err.altitude, err.azimuth) * 60).toBeGreaterThan(2);
    // The axes land off by the error, and the drive tracks from that instant through
    // the settle: the tube holds the sky point it landed on, not the alt-az.
    const axesEndMs = plan.axesS * 1000;
    const touchdown = altAzToRaDec({ altitude: 50 - err.altitude, azimuth: 150 - err.azimuth }, LAT, sky.lstHoursAt(axesEndMs));
    const carried = raDecToAltAz(touchdown, LAT, sky.lstHoursAt(plan.totalS * 1000 + 100));
    expect(landed.pointing.altitude).toBeCloseTo(carried.altitude, 3);
    expect(landed.pointing.azimuth).toBeCloseTo(carried.azimuth, 3);

    // Tracking: ten minutes on, the tube still points at the same equatorial position.
    const held = mount.trackedPoint!;
    const t1 = plan.totalS * 1000 + 100;
    const later = run(mount, t1, t1 + 600_000, 200);
    const expected = raDecToAltAz(held, LAT, sky.lstHoursAt(t1 + 600_000));
    expect(later.pointing.altitude).toBeCloseTo(expected.altitude, 3);
    expect(later.pointing.azimuth).toBeCloseTo(expected.azimuth, 3);
  });

  it('sync zeroes the landing error nearby and leaves it elsewhere', () => {
    const model = alignmentError(3);
    const at = { altitude: 50, azimuth: 150 };
    model.syncs.push(at);
    const near = landingError(model, { altitude: 51, azimuth: 152 });
    const far = landingError(model, { altitude: 30, azimuth: 330 });
    expect(Math.hypot(near.altitude, near.azimuth)).toBeLessThan(0.05 * Math.hypot(model.errorAlt, model.errorAz));
    expect(Math.hypot(far.altitude, far.azimuth)).toBeCloseTo(Math.hypot(model.errorAlt, model.errorAz), 6);
  });

  it('a held key moves the sky point, and release holds the new one', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 45, azimuth: 180 });
    mount.setTracking('sidereal', 0);
    const before = mount.trackedPoint!;
    mount.press('alt', 1, 7);
    run(mount, 0, 3000);
    mount.release('alt');
    const after = run(mount, 3000, 6000);
    const held = mount.trackedPoint!;
    // Three seconds at 1°/s, less the spin-up and the gear play: about two and a half degrees up.
    expect(after.pointing.altitude).toBeGreaterThan(47);
    expect(after.pointing.altitude).toBeLessThan(48.4);
    expect(held.decDeg).not.toBeCloseTo(before.decDeg, 1);
    // And the drive holds it: the tube follows the new point, not the old.
    const later = run(mount, 6000, 300_000, 200);
    const expected = raDecToAltAz(held, LAT, sky.lstHoursAt(300_000));
    expect(later.pointing.altitude).toBeCloseTo(expected.altitude, 2);
  });

  it('moves as far at five frames a second as at sixty', () => {
    const slewAt = (stepMs: number) => {
      const mount = new NexStarMount(sky);
      mount.unpark();
      mount.setPointing({ altitude: 45, azimuth: 180 });
      mount.setTracking('off', 0);
      mount.press('alt', 1, 7);
      return run(mount, 0, 2000, stepMs).pointing.altitude;
    };
    expect(slewAt(200)).toBeCloseTo(slewAt(1000 / 60), 1);
  });

  it('crosses the gear play before the tube moves on a reversal, less the compensation', () => {
    const slow = new NexStarMount(sky);
    slow.settings = { ...DEFAULT_SETTINGS, backlashAz: 0 };
    slow.unpark();
    slow.setPointing({ altitude: 45, azimuth: 180 });
    slow.press('az', 1, 4);
    run(slow, 0, 4000);
    slow.release('az');
    run(slow, 4000, 6000);
    const start = slow.pointing.azimuth;
    slow.press('az', -1, 4);
    run(slow, 6000, 7000);
    // Rate 4 is 8× sidereal, 0.033°/s: in a second the motor has covered less than half the 0.08° of play.
    expect(slow.pointing.azimuth).toBeCloseTo(start, 4);
    run(slow, 7000, 12000);
    expect(slow.pointing.azimuth).toBeLessThan(start - 0.05);

    const compensated = new NexStarMount(sky);
    compensated.settings = { ...DEFAULT_SETTINGS, backlashAz: 99 };
    compensated.unpark();
    compensated.setPointing({ altitude: 45, azimuth: 180 });
    compensated.press('az', 1, 4);
    run(compensated, 0, 4000);
    compensated.release('az');
    run(compensated, 4000, 6000);
    const start2 = compensated.pointing.azimuth;
    compensated.press('az', -1, 4);
    run(compensated, 6000, 7000);
    expect(compensated.pointing.azimuth).toBeLessThan(start2 - 0.02);
    expect(GEAR_PLAY_DEG.az).toBeGreaterThan(GEAR_PLAY_DEG.alt);
  });

  it('stalls at the altitude limit and reports it', () => {
    const mount = new NexStarMount(sky);
    mount.settings = { ...DEFAULT_SETTINGS, slewAltMax: 80 };
    mount.unpark();
    mount.setPointing({ altitude: 79, azimuth: 100 });
    mount.press('alt', 1, 9);
    const s = run(mount, 0, 3000);
    expect(s.pointing.altitude).toBe(80);
    expect(s.atLimit).toBe('alt');
  });

  it('with cordwrap on, never crosses the home line by hand', () => {
    const mount = new NexStarMount(sky);
    mount.settings = { ...DEFAULT_SETTINGS, cordwrap: true };
    mount.unpark();
    mount.setPointing({ altitude: 40, azimuth: 358 });
    mount.press('az', 1, 9);
    const s = run(mount, 0, 3000);
    expect(s.pointing.azimuth).toBeLessThan(360);
    expect(s.pointing.azimuth).toBeGreaterThan(359.9);
    expect(s.atLimit).toBe('cordwrap');
  });

  it('a direction key during a GoTo aborts it where it is', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 10, azimuth: 0 });
    mount.goto(() => ({ altitude: 60, azimuth: 120 }), 0);
    run(mount, 0, 5000);
    expect(mount.slewing).toBe(true);
    mount.press('alt', 1, 5);
    expect(mount.slewing).toBe(false);
    const p = mount.pointing;
    expect(p.azimuth).toBeGreaterThan(10);
    expect(p.azimuth).toBeLessThan(120);
  });

  it('the lunar rate follows the Moon', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 45, azimuth: 180 });
    mount.setTracking('lunar', 0);
    const eq0 = mount.equatorialAt(0);
    run(mount, 0, 600_000, 500);
    const eq1 = mount.equatorialAt(600_000);
    // The Moon moves east: in ten minutes about 0.37 minutes of right ascension.
    expect((eq1.raHours - eq0.raHours) * 60).toBeCloseTo(0.0366 * (600_000 / 3_600_000) * 60, 1);
  });

  it('park goes home with tracking off, and reset puts the mount as the agent leaves it', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 45, azimuth: 180 });
    mount.setTracking('sidereal', 0);
    const plan = mount.park(0);
    run(mount, 0, plan.totalS * 1000 + 100);
    expect(mount.parked).toBe(true);
    expect(mount.tracking).toBe('off');
    expect(mount.pointing.altitude).toBeCloseTo(0, 2);
    expect(mount.pointing.azimuth).toBeCloseTo(0, 2);
    mount.reset();
    expect(mount.slewing).toBe(false);
    expect(mount.pointing).toEqual({ altitude: 0, azimuth: 0 });
  });
});

describe('what the encoders do not see', () => {
  const arcsec = (o: { alt: number; az: number }) => Math.hypot(o.alt, o.az) * 3600;

  it('a perfect drive by default: tracking moves the image nowhere', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 45, azimuth: 180 });
    mount.setTracking('sidereal', 0);
    const later = run(mount, 0, 120_000, 500);
    expect(arcsec(later.imageOffset)).toBe(0);
  });

  it('the worm repeats its periodic error each turn, and tracking error starts from zero', () => {
    const m = SE_TRACKING_ERROR;
    const a = periodicErrorArcsec(m, 100);
    const b = periodicErrorArcsec(m, 100 + m.wormPeriodS);
    expect(a.alt).toBeCloseTo(b.alt, 6);
    expect(a.az).toBeCloseTo(b.az, 6);
    expect(Math.abs(a.az)).toBeLessThanOrEqual(m.peArcsec.az);
    const start = trackingErrorArcsec(m, 500, 500);
    expect(Math.hypot(start.alt, start.az)).toBe(0);
    // One worm turn later only the drift is left: three arcseconds a minute.
    const turn = trackingErrorArcsec(m, 500, 500 + m.wormPeriodS);
    expect(Math.hypot(turn.alt, turn.az)).toBeCloseTo((m.driftArcsecPerMin * m.wormPeriodS) / 60, 3);
  });

  it('with the SE model the image wanders by arcseconds while the readout holds the sky', () => {
    const perfect = new NexStarMount(sky);
    const real = new NexStarMount(sky);
    real.trackingError = SE_TRACKING_ERROR;
    for (const m of [perfect, real]) {
      m.unpark();
      m.setPointing({ altitude: 45, azimuth: 180 });
      m.setTracking('sidereal', 0);
    }
    const a = run(perfect, 0, 240_000, 500);
    const b = run(real, 0, 240_000, 500);
    expect(b.pointing.altitude).toBeCloseTo(a.pointing.altitude, 9);
    expect(b.pointing.azimuth).toBeCloseTo(a.pointing.azimuth, 9);
    expect(arcsec(b.imageOffset)).toBeGreaterThan(2);
    expect(arcsec(b.imageOffset)).toBeLessThan(60);
  });

  it('the tube rings after a GoTo stops, and has settled before the slew reports complete', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 20, azimuth: 100 });
    const plan = mount.goto(() => ({ altitude: 50, azimuth: 140 }), 0);
    const axesEnd = plan.axesS * 1000;
    run(mount, 0, axesEnd + 40);
    const ringing = arcsec(mount.imageOffsetAt(axesEnd + 40));
    expect(ringing).toBeGreaterThan(3);
    expect(arcsec(mount.imageOffsetAt(axesEnd + 4000))).toBeLessThan(0.05 * ringing);
    expect(Math.abs(settleRing(SETTLE_S))).toBeLessThan(0.1);
  });

  it('a stop from rate 9 rings harder than a stop from a centring rate', () => {
    expect(ringAmplitudeArcsec(5)).toBeGreaterThan(ringAmplitudeArcsec(rateDegPerSec(5)) * 4);
    const swingAfter = (rate: number) => {
      const mount = new NexStarMount(sky);
      mount.unpark();
      mount.setPointing({ altitude: 40, azimuth: 100 });
      mount.press('az', 1, rate);
      run(mount, 0, 3000);
      mount.release('az');
      let peak = 0;
      for (let t = 3000; t <= 6000; t += 20) {
        mount.step(t);
        peak = Math.max(peak, arcsec(mount.imageOffsetAt(t)));
      }
      return peak;
    };
    expect(swingAfter(9)).toBeGreaterThan(swingAfter(4) * 2);
  });
});

describe('taking up tracking', () => {
  it('holds the sky point the tube is on, even when the caller’s clock lags the steps', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 45, azimuth: 180 });
    mount.setTracking('sidereal', 0);
    run(mount, 0, 10_000);
    const onSky = mount.equatorialAt(10_000);
    // A tick that read the clock 600 ms before the last step.
    mount.setTracking('sidereal', 9_400);
    const held = mount.trackedPoint!;
    expect(Math.abs(held.raHours - onSky.raHours) * 15 * 3600).toBeLessThan(0.5);
    expect(Math.abs(held.decDeg - onSky.decDeg) * 3600).toBeLessThan(0.5);
  });
});

describe('tracking chosen during a GoTo', () => {
  it('takes up tracking where the axes land, not where the tube was when it was chosen', () => {
    const mount = new NexStarMount(sky);
    mount.unpark();
    mount.setPointing({ altitude: 30, azimuth: 100 });
    mount.setTracking('sidereal', 0);
    const target = (ms: number) => raDecToAltAz({ raHours: 3, decDeg: 30 }, LAT, sky.lstHoursAt(ms));
    const plan = mount.goto(target, 0);
    run(mount, 0, plan.axesS * 500);
    // The console re-asserts sidereal halfway through the slew.
    mount.setTracking('sidereal', plan.axesS * 500);
    const end = plan.totalS * 1000 + 2000;
    const landed = run(mount, plan.axesS * 500, end);
    const want = target(end);
    expect(Math.abs(landed.pointing.altitude - want.altitude) * 60).toBeLessThan(0.05);
    expect(Math.abs(landed.pointing.azimuth - want.azimuth) * 60 * Math.cos((want.altitude * Math.PI) / 180)).toBeLessThan(0.05);
  });
});
