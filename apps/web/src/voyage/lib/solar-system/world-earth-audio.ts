// Tbilisi out loud, after the silence of the other worlds: the city's low
// traffic hum, the Mtkvari when you are near it, swifts and sparrows by day,
// crickets after dark, and wind that picks up on the walls of Narikala.
// Synthesised in Web Audio, nothing sampled; started on the first gesture.

import { onSoundChange, soundLevel } from '@/voyage/lib/solar-system/sound-prefs';
import { closeAudio, holdAudio } from '@/voyage/lib/solar-system/audio-lifecycle';

const MASTER_GAIN = 0.16;

export interface CityAmbience {
  start: () => void;
  /** `river` is metres to the water; `height` how far above the valley floor the listener is, m. */
  update: (dt: number, night: number, river: number, height: number) => void;
  /** The pilot's car: speed in m/s, or −1 on foot. */
  engine: (speed: number) => void;
  /** A crowd clapping and cheering, 0 none … 1 all of them. */
  cheer: (k: number) => void;
  /** The pilot's horn, held. */
  horn: (on: boolean) => void;
  /** Patrol sirens, 0 none … 1 right behind. */
  siren: (level: number) => void;
  /** Somebody else's horn, so many metres off. */
  honk: (distance: number) => void;
  /** A crash, 0 a knock … 1 a smash. */
  crash: (k: number) => void;
  /** The context and the bus for the car radio, once sound has started. */
  out: () => { ctx: AudioContext; bus: AudioNode } | null;
  dispose: () => void;
}

export function makeCityAmbience(): CityAmbience {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let hum: GainNode | null = null;
  let water: GainNode | null = null;
  let wind: GainNode | null = null;
  let windFilter: BiquadFilterNode | null = null;
  let noise: AudioBuffer | null = null;
  let chirpT = 1.5;
  let cricketT = 0.4;
  let gust = 0;
  let motor: { osc: OscillatorNode; sub: OscillatorNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  let clapK = 0;
  let clapT = 0;
  let hornV: { a: OscillatorNode; b: OscillatorNode; gain: GainNode } | null = null;
  let sirenV: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;
  let lastCrash = -1;
  // Suspended, not just silent, while the page is hidden or the game paused.
  const hold = holdAudio(() => ctx);
  const unsubscribe = onSoundChange((_on, level) => {
    if (master && ctx) master.gain.setTargetAtTime(level * MASTER_GAIN, ctx.currentTime, 0.05);
    hold.apply();
  });
  const loop = (c: AudioContext, type: BiquadFilterType, f: number, q: number, level: number, out: AudioNode) => {
    const src = c.createBufferSource();
    src.buffer = noise; src.loop = true;
    src.playbackRate.value = 0.5 + Math.random() * 0.2;
    const flt = c.createBiquadFilter();
    flt.type = type; flt.frequency.value = f; flt.Q.value = q;
    const g = c.createGain();
    g.gain.value = level;
    src.connect(flt).connect(g).connect(out);
    src.start();
    return { g, flt };
  };
  return {
    start() {
      try {
        if (!ctx) {
          ctx = new AudioContext();
          master = ctx.createGain();
          master.gain.value = soundLevel() * MASTER_GAIN;
          master.connect(ctx.destination);
          noise = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
          const d = noise.getChannelData(0);
          // Brownian: most of the energy low, like distance does to traffic.
          let last = 0;
          for (let i = 0; i < d.length; i++) { last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02; d[i] = last * 3.5; }
          hum = loop(ctx, 'lowpass', 180, 0.5, 0.6, master).g;
          water = loop(ctx, 'bandpass', 900, 0.4, 0, master).g;
          const w = loop(ctx, 'bandpass', 420, 1.2, 0, master);
          wind = w.g; windFilter = w.flt;
        }
        hold.apply();
      } catch { /* no audio */ }
    },
    update(dt, night, river, height) {
      if (!ctx || !master || !hum || !water || !wind || !windFilter) return;
      const now = ctx.currentTime;
      // The city is loudest down in it and in the evening.
      hum.gain.setTargetAtTime(0.5 * Math.max(0.25, 1 - height / 250) * (0.8 + night * 0.25), now, 0.5);
      water.gain.setTargetAtTime(Math.max(0, 1 - river / 60) * 0.35, now, 0.4);
      gust += dt;
      const g = Math.max(0, Math.min(1, (height - 30) / 120)) * (0.5 + 0.5 * Math.sin(gust * 0.37) * Math.sin(gust * 0.11));
      wind.gain.setTargetAtTime(g * 0.5, now, 0.6);
      windFilter.frequency.setTargetAtTime(300 + g * 500, now, 0.6);
      const c = ctx; const m = master;
      if (night < 0.5) {
        chirpT -= dt;
        if (chirpT <= 0) {
          chirpT = 0.6 + Math.random() * 3.2;
          const t0 = now + Math.random() * 0.05;
          const notes = 2 + Math.floor(Math.random() * 4);
          for (let k = 0; k < notes; k++) {
            const o = c.createOscillator();
            o.type = 'sine';
            const f = 3200 + Math.random() * 2200;
            const at = t0 + k * (0.07 + Math.random() * 0.05);
            o.frequency.setValueAtTime(f, at);
            o.frequency.exponentialRampToValueAtTime(f * (0.75 + Math.random() * 0.5), at + 0.06);
            const e = c.createGain();
            e.gain.setValueAtTime(0.0001, at);
            e.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.05 * (1 - night * 2)), at + 0.01);
            e.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
            o.connect(e).connect(m);
            o.onended = () => { o.disconnect(); e.disconnect(); };
            o.start(at); o.stop(at + 0.09);
          }
        }
      }
      if (night > 0.4) {
        cricketT -= dt;
        if (cricketT <= 0) {
          cricketT = 0.35 + Math.random() * 0.5;
          const at = now + 0.01;
          const o = c.createOscillator();
          o.type = 'square';
          o.frequency.value = 4400 + Math.random() * 300;
          const e = c.createGain();
          e.gain.setValueAtTime(0.0001, at);
          for (let k = 0; k < 4; k++) {
            e.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.012 * night), at + k * 0.035 + 0.008);
            e.gain.exponentialRampToValueAtTime(0.0001, at + k * 0.035 + 0.03);
          }
          const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
          o.connect(hp).connect(e).connect(m);
          o.onended = () => { o.disconnect(); hp.disconnect(); e.disconnect(); };
          o.start(at); o.stop(at + 0.16);
        }
      }
    },
    engine(speed) {
      if (!ctx || !master) return;
      if (!motor && speed >= 0) {
        try {
          const osc = ctx.createOscillator(); osc.type = 'sawtooth';
          const sub = ctx.createOscillator(); sub.type = 'square';
          const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
          const gain = ctx.createGain(); gain.gain.value = 0;
          const subGain = ctx.createGain(); subGain.gain.value = 0.35;
          osc.connect(filter); sub.connect(subGain).connect(filter); filter.connect(gain).connect(master);
          osc.start(); sub.start();
          motor = { osc, sub, filter, gain };
        } catch { motor = null; }
      }
      if (!motor) return;
      const now = ctx.currentTime;
      // A small four-cylinder: idle near 800 rpm, a gear change every so often.
      const on = speed >= 0;
      const gearSpan = 7;
      const inGear = on ? (speed % gearSpan) / gearSpan : 0;
      const rpm = on ? 800 + inGear * 3200 + Math.min(speed, 34) * 25 : 0;
      motor.osc.frequency.setTargetAtTime(rpm / 30, now, 0.08);
      motor.sub.frequency.setTargetAtTime(rpm / 60, now, 0.08);
      motor.filter.frequency.setTargetAtTime(300 + rpm * 0.25, now, 0.1);
      motor.gain.gain.setTargetAtTime(on ? 0.06 + Math.min(1, speed / 25) * 0.08 : 0, now, 0.15);
    },
    cheer(k) {
      if (!ctx || !master || !noise) return;
      clapK += (k - clapK) * 0.05;
      if (clapK < 0.02) return;
      const c = ctx; const m = master; const buf = noise;
      clapT -= 1 / 60;
      while (clapT <= 0) {
        clapT += 0.02 + Math.random() * 0.05 / clapK;
        // One clap: a short burst of bright noise, a little random in level and colour.
        const at = c.currentTime + Math.random() * 0.03;
        const src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = 2.5 + Math.random();
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 1600; bp.Q.value = 0.9;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.12 * clapK * (0.4 + Math.random() * 0.6), at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
        src.connect(bp).connect(g).connect(m);
        src.onended = () => { src.disconnect(); bp.disconnect(); g.disconnect(); };
        src.start(at, Math.random() * 2); src.stop(at + 0.07);
      }
    },
    horn(on) {
      if (!ctx || !master) return;
      if (!hornV && on) {
        try {
          const a = ctx.createOscillator(); a.type = 'square'; a.frequency.value = 415;
          const b = ctx.createOscillator(); b.type = 'square'; b.frequency.value = 523;
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
          const gain = ctx.createGain(); gain.gain.value = 0;
          a.connect(lp); b.connect(lp); lp.connect(gain).connect(master);
          a.start(); b.start();
          hornV = { a, b, gain };
        } catch { hornV = null; }
      }
      hornV?.gain.gain.setTargetAtTime(on ? 0.22 : 0, ctx.currentTime, on ? 0.01 : 0.03);
    },
    siren(level) {
      if (!ctx || !master) return;
      if (!sirenV && level > 0) {
        try {
          const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 950;
          // The wail: the pitch swept up and down by a slow oscillator.
          const lfo = ctx.createOscillator(); lfo.type = 'triangle'; lfo.frequency.value = 0.45;
          const depth = ctx.createGain(); depth.gain.value = 330;
          lfo.connect(depth).connect(osc.frequency);
          const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
          const gain = ctx.createGain(); gain.gain.value = 0;
          osc.connect(lp).connect(gain).connect(master);
          osc.start(); lfo.start();
          sirenV = { osc, lfo, gain };
        } catch { sirenV = null; }
      }
      sirenV?.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.12, ctx.currentTime, 0.25);
    },
    honk(distance) {
      if (!ctx || !master) return;
      const k = Math.max(0, 1 - distance / 160);
      if (k <= 0.02) return;
      const at = ctx.currentTime + 0.01;
      const len = 0.25 + Math.random() * 0.35;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.13 * k * k, at + 0.02);
      g.gain.setValueAtTime(0.13 * k * k, at + len);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.06);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900 + k * 1400;
      lp.connect(g).connect(master);
      const f = 340 + Math.random() * 160;
      for (const m of [1, 1.26]) {
        const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f * m;
        o.connect(lp);
        o.onended = () => { o.disconnect(); };
        o.start(at); o.stop(at + len + 0.1);
      }
      setTimeout(() => { lp.disconnect(); g.disconnect(); }, (len + 0.4) * 1000);
    },
    crash(k) {
      if (!ctx || !master || !noise) return;
      // One crash at a time: a run of contacts in a single knock is one sound.
      if (ctx.currentTime - lastCrash < 0.25) return;
      lastCrash = ctx.currentTime;
      const at = ctx.currentTime + 0.005;
      const v = Math.max(0.05, Math.min(1, k));
      const src = ctx.createBufferSource(); src.buffer = noise; src.playbackRate.value = 3;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 + v * 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5 * v, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.25 + v * 0.35);
      src.connect(lp).connect(g).connect(master);
      src.onended = () => { src.disconnect(); lp.disconnect(); g.disconnect(); };
      src.start(at, Math.random() * 2); src.stop(at + 0.7);
      const thump = ctx.createOscillator(); thump.type = 'sine';
      thump.frequency.setValueAtTime(110, at); thump.frequency.exponentialRampToValueAtTime(40, at + 0.2);
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.0001, at);
      tg.gain.exponentialRampToValueAtTime(0.6 * v, at + 0.01);
      tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
      thump.connect(tg).connect(master);
      thump.onended = () => { thump.disconnect(); tg.disconnect(); };
      thump.start(at); thump.stop(at + 0.3);
    },
    out: () => (ctx && master ? { ctx, bus: master } : null),
    dispose() {
      unsubscribe();
      hold.dispose();
      closeAudio(ctx);
      ctx = null;
    },
  };
}
