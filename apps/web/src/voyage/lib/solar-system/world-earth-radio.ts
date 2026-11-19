// The car radio: three stations, every note of them written here and played
// by Web Audio as it goes — nothing recorded, nobody else's music.
//
//   0  Mtatsminda Lo-Fi — slow seventh chords on an electric piano, a soft
//      kit, a round bass.
//   1  Kartuli Voices — three voices over a drone, moving in fourths and
//      fifths and leaning on seconds at the cadence, in the manner of the
//      old part-songs, with a plucked lute under them.
//   2  Orbit 101.3 — night-drive synths: a pumping bass, an arpeggio, a
//      four-on-the-floor kit.
//
// Notes are scheduled a fifth of a second ahead from the frame loop; a
// paused game suspends the context, so the music stops where it is.

export const STATIONS = ['lofi', 'voices', 'orbit'] as const;
export type StationId = (typeof STATIONS)[number];

export interface CarRadio {
  /** −1 is off. */
  station: number;
  set: (station: number) => void;
  update: () => void;
  dispose: () => void;
}

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

interface Station { bpm: number; bars: number; step: (ctx: AudioContext, out: AudioNode, bar: number, s: number, at: number, beat: number) => void }

/** A note with an attack and an exponential fall: the building block of every voice here. */
function tone(ctx: AudioContext, out: AudioNode, type: OscillatorType, f: number, at: number, len: number, level: number, attack = 0.005, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.value = f; o.detune.value = detune;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  o.connect(g).connect(out);
  o.onended = () => { o.disconnect(); g.disconnect(); };
  o.start(at); o.stop(at + len + 0.02);
}

let noiseBuf: AudioBuffer | null = null;
function noise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function hiss(ctx: AudioContext, out: AudioNode, at: number, len: number, level: number, type: BiquadFilterType, f: number, q = 0.8) {
  const src = ctx.createBufferSource(); src.buffer = noise(ctx);
  const flt = ctx.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(flt).connect(g).connect(out);
  src.onended = () => { src.disconnect(); flt.disconnect(); g.disconnect(); };
  src.start(at, Math.random() * 0.5); src.stop(at + len + 0.02);
}

function kick(ctx: AudioContext, out: AudioNode, at: number, level: number) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(130, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.14);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.32);
  o.connect(g).connect(out);
  o.onended = () => { o.disconnect(); g.disconnect(); };
  o.start(at); o.stop(at + 0.35);
}

/** A voice that sings "ah": a buzzing source through two formant filters, swelling in. */
function sung(ctx: AudioContext, out: AudioNode, f: number, at: number, len: number, level: number) {
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
  // A singer's vibrato, coming in after the note has settled.
  const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
  const depth = ctx.createGain(); depth.gain.setValueAtTime(0, at); depth.gain.linearRampToValueAtTime(f * 0.012, at + len * 0.5);
  vib.connect(depth).connect(o.frequency);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.25);
  g.gain.setValueAtTime(level, at + len - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 720; f1.Q.value = 6;
  const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1150; f2.Q.value = 7;
  o.connect(f1).connect(g); o.connect(f2).connect(g);
  g.connect(out);
  o.onended = () => { o.disconnect(); vib.disconnect(); depth.disconnect(); f1.disconnect(); f2.disconnect(); g.disconnect(); };
  o.start(at); vib.start(at); o.stop(at + len + 0.05); vib.stop(at + len + 0.05);
}

// ── Mtatsminda Lo-Fi: Fmaj7 – Em7 – Dm7 – Cmaj7, swung a little. ──
const LOFI_CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
const LOFI_TUNE = [72, -1, 69, 67, -1, 64, -1, -1, 71, -1, 67, 64, -1, 62, -1, -1, 69, -1, 65, 64, -1, 62, 60, -1, 67, -1, 64, -1, 62, -1, -1, -1];
const lofi: Station = {
  bpm: 76, bars: 4,
  step(ctx, out, bar, s, at, beat) {
    const ch = LOFI_CHORDS[bar % 4];
    if (s === 0 || s === 10) for (const n of ch) { tone(ctx, out, 'sine', midi(n), at, beat * 3.2, 0.05, 0.02); tone(ctx, out, 'triangle', midi(n + 12), at, beat * 1.4, 0.012, 0.01, 4); }
    if (s === 0 || s === 6 || s === 8) tone(ctx, out, 'triangle', midi(ch[0] - 12), at, beat * 0.9, 0.16, 0.01);
    if (s === 0 || s === 7 || s === 10) kick(ctx, out, at, 0.32);
    if (s === 4 || s === 12) hiss(ctx, out, at, 0.18, 0.09, 'bandpass', 1800, 0.7);
    if (s % 2 === 0) hiss(ctx, out, at + (s % 4 === 2 ? beat * 0.06 : 0), 0.05, 0.025, 'highpass', 7000);
    const note = LOFI_TUNE[(bar % 2) * 16 + s];
    if (note > 0 && bar % 8 >= 4) tone(ctx, out, 'sine', midi(note), at, beat * 0.9, 0.045, 0.01);
  },
};

// ── Kartuli Voices: D drone; the top and middle voices in fourths and fifths, a second at each cadence. ──
const VOICES_TOP = [74, 76, 77, 76, 74, 72, 74, 76];
const VOICES_MID = [69, 69, 72, 71, 69, 67, 69, 74];
const PLUCK = [62, 69, 74, 69, 65, 69, 72, 69];
const voices: Station = {
  bpm: 66, bars: 8,
  step(ctx, out, bar, s, at, beat) {
    const b = bar % 8;
    if (s === 0) {
      if (b % 4 === 0) { sung(ctx, out, midi(50), at, beat * 16, 0.05); sung(ctx, out, midi(57), at, beat * 16, 0.03); }
      sung(ctx, out, midi(VOICES_MID[b]), at, beat * 4, 0.04);
    }
    if (s === 0 || s === 8) sung(ctx, out, midi(VOICES_TOP[b] + (s === 8 && b % 2 === 1 ? -2 : 0)), at, beat * 2, 0.035);
    if (s % 2 === 0) tone(ctx, out, 'triangle', midi(PLUCK[(s / 2 + b) % 8]), at, beat * 0.7, 0.05, 0.002);
    if (s === 0 && b % 2 === 0) hiss(ctx, out, at, 0.3, 0.04, 'lowpass', 300, 1);
  },
};

// ── Orbit 101.3: Am – F – C – G, pumping bass, a sixteenth arpeggio. ──
const ORBIT_ROOTS = [45, 41, 48, 43];
const ORBIT_ARP = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]];
const orbit: Station = {
  bpm: 108, bars: 4,
  step(ctx, out, bar, s, at, beat) {
    const k = bar % 4;
    if (s % 4 === 0) kick(ctx, out, at, 0.36);
    if (s === 4 || s === 12) hiss(ctx, out, at, 0.26, 0.1, 'bandpass', 1500, 0.6);
    if (s % 2 === 1) hiss(ctx, out, at, 0.04, 0.03, 'highpass', 8000);
    if (s % 2 === 0) tone(ctx, out, 'sawtooth', midi(ORBIT_ROOTS[k] - 12 + (s % 4 === 2 ? 12 : 0)), at, beat * 0.45, 0.06, 0.005);
    tone(ctx, out, 'square', midi(ORBIT_ARP[k][s % 4] + 12), at, beat * 0.22, 0.016, 0.003);
    if (s === 0) for (const n of ORBIT_ARP[k]) tone(ctx, out, 'sawtooth', midi(n), at, beat * 4, 0.012, 0.3, 7);
  },
};

const PROGRAMS: Station[] = [lofi, voices, orbit];

export function makeCarRadio(out: () => { ctx: AudioContext; bus: AudioNode } | null): CarRadio {
  let ctx: AudioContext | null = null;
  let speaker: GainNode | null = null;
  let tune: BiquadFilterNode | null = null;
  let next = 0;
  let stepN = 0;
  const radio: CarRadio = {
    station: -1,
    set(station) {
      radio.station = station;
      const o = out();
      if (!o) return;
      if (!ctx) {
        ctx = o.ctx;
        // The car's speakers: a little bass lift and the top rolled off.
        tune = ctx.createBiquadFilter(); tune.type = 'lowpass'; tune.frequency.value = 6500;
        speaker = ctx.createGain(); speaker.gain.value = 0;
        tune.connect(speaker).connect(o.bus);
      }
      const now = ctx.currentTime;
      speaker!.gain.cancelScheduledValues(now);
      speaker!.gain.setTargetAtTime(station >= 0 ? 1.6 : 0, now, station >= 0 ? 0.08 : 0.15);
      // Between stations, a moment of static.
      if (station >= 0) hiss(ctx, tune!, now, 0.22, 0.12, 'bandpass', 2500, 0.4);
      next = now + 0.25; stepN = 0;
    },
    update() {
      // Turned on before there was sound: tuned in now that there is.
      if (!ctx && radio.station >= 0 && out()) radio.set(radio.station);
      if (!ctx || !tune || radio.station < 0) return;
      const st = PROGRAMS[radio.station];
      const beat = 60 / st.bpm;
      const sixteenth = beat / 4;
      // Fallen behind (a pause, a slow frame): pick up from now rather than play the backlog.
      if (next < ctx.currentTime - 0.1) next = ctx.currentTime + 0.05;
      while (next < ctx.currentTime + 0.2) {
        const s = stepN % 16;
        const bar = Math.floor(stepN / 16);
        // A touch of swing on the off sixteenths, for the slow ones.
        const swing = st === orbit || s % 2 === 0 ? 0 : sixteenth * 0.12;
        st.step(ctx, tune, bar, s, next + swing, beat);
        next += sixteenth;
        stepN += 1;
      }
    },
    dispose() {
      speaker?.disconnect(); tune?.disconnect();
      ctx = null;
    },
  };
  return radio;
}
