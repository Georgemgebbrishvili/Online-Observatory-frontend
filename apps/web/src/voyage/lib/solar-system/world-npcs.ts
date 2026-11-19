// The colony round Mars Base, alive: PIP-7 the utility droid, KERN the
// quartermaster, Vex Marrow the smuggler, the guild hunters Rook and Sable,
// two colonists on their rounds, and the scav drones out in the dunes.
//
// Each one senses (how far the pilot is, whether anything solid is in the
// way, who shot whom), remembers (grudges, where the pilot was last seen),
// and decides through npc-brain; this file carries the decision out —
// walking round what is in the way, keeping a fighting range and
// strafing, getting behind a habitat when hurt, running when beaten,
// following the pilot, talking. Bolts fly for real and hit whatever they
// meet. Shooting the peaceful earns wanted stars, and the hunters come for
// anyone with a star until no hunter has seen them for a while; KERN can
// clear the warrant for a fee. Credits come from Kern's contract and from
// scav scrap, and go on repairs, the smuggler's tips and an overshield.

import * as THREE from 'three';
import { attitude, decide, newMind, remember, wantedFor, type Decision, type Mind, type Senses } from '@/voyage/lib/solar-system/npc-brain';
import { buildRig, type Rig } from '@/voyage/lib/solar-system/npc-bodies';
import { JOB_PAY, MARS_CAST, REPAIR_COST, SHIELD_COST, TIP_COST, WANTED_FEE, optionsFor, type CastMember, type DialogCtx } from '@/voyage/lib/solar-system/npc-cast';
import { loadNpcSave, storeNpcSave, type NpcSave } from '@/voyage/lib/solar-system/npc-memory';
import { makeNameLabel, type NameLabel } from '@/voyage/lib/multiplayer/name-label';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { Interactable } from '@/voyage/lib/solar-system/moon-interactions';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';

/** A line on the glass: who, what (a key under solarSystem.npc) and the values in it. */
export interface Bark { name: string; key: string; vars: Record<string, string | number>; hold: number; serial: number }

export interface DialogView {
  npc: string;
  name: string;
  line: string;
  vars: Record<string, string | number>;
  options: { key: string; cost: number; enabled: boolean; index: number }[];
  serial: number;
}

export interface NpcTelemetry {
  bark: Bark | null;
  dialog: DialogView | null;
  /** Suit integrity 0…100, and the overshield over it. */
  integrity: number;
  shield: number;
  wanted: number;
  credits: number;
  job: { need: number; done: number } | null;
  /** Hostiles that can see the pilot right now. */
  engaged: number;
  /** Bumped on every hit taken: the glass flashes. */
  hits: number;
  /** Bumped on every hit landed: the crosshair ticks. */
  landed: number;
  companion: boolean;
}

export interface NpcOptions {
  heightAt: (x: number, z: number) => number;
  colliders: Collider[];
  /** The gems on this world, for PIP's scan and Vex's tips. */
  gems: () => readonly { px: number; pz: number; collected: boolean }[];
  /** Name tags' second line, translated (role words, "Hostile"). */
  tag: (key: string) => string;
  lite: boolean;
  /** The suit gave out: back to the pad. */
  onBreach: () => void;
  onEvent: (kind: 'hit' | 'shot' | 'down' | 'wanted' | 'clear' | 'talk') => void;
}

export interface NpcsHandle {
  group: THREE.Group;
  telemetry: NpcTelemetry;
  interactables: Interactable[];
  colliders: Collider[];
  update: (dt: number, t: number, crew: THREE.Vector3, camera: THREE.Camera, lights: LightPool, fire: boolean) => void;
  choose: (index: number) => void;
  closeDialog: () => void;
  /** Development: what everyone is doing. */
  probe: () => Record<string, string>;
  dispose: () => void;
}

interface Npc {
  spec: CastMember;
  rig: Rig;
  label: NameLabel;
  x: number; z: number; yaw: number; speed: number;
  health: number;
  mind: Mind;
  decision: Decision;
  think: number;
  waypoint: { x: number; z: number } | null;
  route: number;
  cooldown: number;
  hitBy: 'player' | 'npc' | null;
  hitHold: number;
  hurt: number;
  downTimer: number;
  downness: number;
  alarm: number;
  strafe: number;
  strafeTimer: number;
  /** The scav or hunter this one fights, when the target is a threat. */
  threat: Npc | null;
  barked: number;
  /** A beat of wanted already charged for this victim. */
  charged: number;
  coverSpot: { x: number; z: number } | null;
  /** Going round something it got stuck on: a side point, and for how long. */
  detour: { x: number; z: number } | null;
  detourT: number;
  stuck: number;
}

interface Bolt { mesh: THREE.Mesh; pos: THREE.Vector3; vel: THREE.Vector3; life: number; from: Npc | 'player'; dmg: number }

const RUN = 4.2;
const WALK = 1.6;
const BOLT_SPEED = 70;
const BOLT_LIFE = 1.1;
const PLAYER_COOLDOWN = 0.22;
const PLAYER_DMG = 22;
const REGEN_DELAY = 5;
const REGEN_RATE = 7;
const WANTED_DECAY = 40;
const LABEL_RANGE = 26;
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const wrap = (a: number) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate);
/** Compass point from (x0,z0) toward (x1,z1): north is −z in the base's frame. */
const compass = (dx: number, dz: number) => COMPASS[(Math.round(((Math.atan2(dx, -dz) * 180) / Math.PI + 360) / 45) % 8)];

/** The colony's sounds: a blaster zap per shot, a crack per hit, a low thud when something goes down. */
function makeSfx() {
  let ctx: AudioContext | null = null;
  const ac = () => {
    if (!ctx) { try { ctx = new AudioContext(); } catch { return null; } }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  };
  const tone = (f0: number, f1: number, dur: number, type: OscillatorType, gain: number) => {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  };
  return {
    zap: (near: number) => tone(1500, 180, 0.16, 'sawtooth', 0.05 * near),
    hit: () => tone(420, 60, 0.12, 'square', 0.06),
    down: () => tone(120, 30, 0.6, 'triangle', 0.12),
    dispose: () => { void ctx?.close(); },
  };
}

export function makeNpcs(opts: NpcOptions): NpcsHandle {
  const group = new THREE.Group();
  group.name = 'colony-npcs';
  const save: NpcSave = loadNpcSave();
  const sfx = makeSfx();
  const persist = () => storeNpcSave(save);
  const telemetry: NpcTelemetry = {
    bark: null, dialog: null, integrity: 100, shield: 0, wanted: save.wanted, credits: save.credits,
    job: save.job, engaged: 0, hits: 0, landed: 0, companion: save.recruited,
  };
  let barkSerial = 0;
  let dialogSerial = 0;
  let sinceHurt = 99;
  let sinceHunterSaw = 0;
  let playerCooldown = 0;
  let talkingTo: Npc | null = null;
  let node = '';
  let breachTimer = 0;
  const crewPos = new THREE.Vector3();

  const npcs: Npc[] = MARS_CAST.map((spec) => {
    const rig = buildRig(spec.body, spec.color);
    const label = makeNameLabel(0.05);
    label.sprite.visible = false;
    group.add(rig.root, label.sprite);
    const n: Npc = {
      spec, rig, label, x: spec.home.x, z: spec.home.z, yaw: Math.random() * 6, speed: 0,
      health: spec.maxHealth, mind: newMind(), decision: { mode: 'idle', target: null }, think: Math.random() * 0.3,
      waypoint: null, route: 0, cooldown: 1, hitBy: null, hitHold: 0, hurt: 0, downTimer: 0, downness: 0, alarm: 0,
      strafe: 1, strafeTimer: 0, threat: null, barked: 0, charged: 0, coverSpot: null, detour: null, detourT: 0, stuck: 0,
    };
    return n;
  });
  const colliders: Collider[] = npcs.filter((n) => n.spec.body !== 'scav').map((n) => ({ x: n.x, z: n.z, r: 0.5 }));
  const standing = () => save;
  const hostileToPlayer = (n: Npc) => attitude(n.spec.persona, save, n.mind) <= -0.3;

  // ── Bolts: a pool of glowing rods. ──
  const boltGeom = new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6);
  boltGeom.rotateX(Math.PI / 2);
  const boltMats = {
    player: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 2.2, 2.6), toneMapped: false }),
    hostile: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.8, 0.35, 0.2), toneMapped: false }),
    friend: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 2.6, 0.6), toneMapped: false }),
  };
  const bolts: Bolt[] = [];
  for (let i = 0; i < (opts.lite ? 24 : 48); i++) {
    const mesh = new THREE.Mesh(boltGeom, boltMats.player);
    mesh.visible = false;
    mesh.frustumCulled = false;
    group.add(mesh);
    bolts.push({ mesh, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: -1, from: 'player', dmg: 0 });
  }
  const fireBolt = (from: Bolt['from'], start: THREE.Vector3, dir: THREE.Vector3, dmg: number) => {
    const b = bolts.find((x) => x.life < 0);
    if (!b) return;
    b.from = from;
    b.dmg = dmg;
    b.life = 0;
    b.pos.copy(start);
    b.vel.copy(dir).normalize().multiplyScalar(BOLT_SPEED);
    b.mesh.material = from === 'player' ? boltMats.player : from.spec.persona.faction === 'scav' || hostileToPlayer(from) ? boltMats.hostile : boltMats.friend;
    b.mesh.visible = true;
    b.mesh.position.copy(start);
    b.mesh.lookAt(start.x + dir.x, start.y + dir.y, start.z + dir.z);
    const d = start.distanceTo(crewPos);
    sfx.zap(Math.max(0.15, 1 - d / 80));
  };

  // ── Speech. ──
  const bark = (n: Npc | null, key: string, vars: Record<string, string | number> = {}, hold = 3.2) => {
    telemetry.bark = { name: n ? n.spec.name : '', key, vars, hold, serial: ++barkSerial };
    if (n) n.barked = 6 + Math.random() * 6;
  };

  // ── The world's shape: what is solid, and whether anything is in the way. ──
  const solid = (x: number, z: number, pad = 0.4) => opts.colliders.some((c) => c.r > 0.6 && Math.hypot(x - c.x, z - c.z) < c.r + pad);
  const lineClear = (x0: number, z0: number, x1: number, z1: number) => {
    const dx = x1 - x0; const dz = z1 - z0;
    const len2 = dx * dx + dz * dz || 1;
    for (const c of opts.colliders) {
      if (c.r < 1.2) continue;
      const t = Math.max(0, Math.min(1, ((c.x - x0) * dx + (c.z - z0) * dz) / len2));
      if (Math.hypot(x0 + dx * t - c.x, z0 + dz * t - c.z) < c.r * 0.85) return false;
    }
    return true;
  };

  /** Steer toward a point, round anything solid: try straight on, then fan out either side. */
  const steer = (n: Npc, dt: number, tx: number, tz: number, stopAt: number, speed: number) => {
    const fx = tx; const fz = tz;
    if (Math.hypot(fx - n.x, fz - n.z) <= stopAt) { n.speed += (0 - n.speed) * ease(dt, 8); n.stuck = 0; return true; }
    // Stuck on something: head for a side point round it for a moment.
    if (n.detour) {
      n.detourT -= dt;
      if (n.detourT <= 0 || Math.hypot(n.detour.x - n.x, n.detour.z - n.z) < 1) n.detour = null;
      else { tx = n.detour.x; tz = n.detour.z; }
    }
    const dx = tx - n.x; const dz = tz - n.z;
    const d = Math.hypot(dx, dz);
    const x0 = n.x; const z0 = n.z;
    const want = Math.atan2(dx, dz);
    let heading = want;
    const look = Math.min(3, d);
    for (const off of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6]) {
      const h = want + off;
      if (!solid(n.x + Math.sin(h) * look, n.z + Math.cos(h) * look)) { heading = h; break; }
    }
    n.yaw += wrap(heading - n.yaw) * ease(dt, 6);
    n.speed += (speed - n.speed) * ease(dt, 4);
    const nx = n.x + Math.sin(n.yaw) * n.speed * dt;
    const nz = n.z + Math.cos(n.yaw) * n.speed * dt;
    if (!solid(nx, nz, 0.3)) { n.x = nx; n.z = nz; } else n.speed *= 0.5;
    // Barely moving while trying to: pick the clearer side and go round.
    n.stuck = Math.hypot(n.x - x0, n.z - z0) < speed * dt * 0.25 ? n.stuck + dt : Math.max(0, n.stuck - dt);
    if (n.stuck > 0.7 && !n.detour) {
      n.stuck = 0;
      for (const off of [1.9, -1.9, 2.5, -2.5, 1.2, -1.2]) {
        const h = want + off * (Math.random() < 0.5 ? 1 : -1);
        const px = n.x + Math.sin(h) * 6; const pz = n.z + Math.cos(h) * 6;
        if (!solid(px, pz, 0.8) && !solid(n.x + Math.sin(h) * 2, n.z + Math.cos(h) * 2, 0.4)) { n.detour = { x: px, z: pz }; n.detourT = 2.5; break; }
      }
    }
    return false;
  };
  const face = (n: Npc, dt: number, x: number, z: number) => { n.yaw += wrap(Math.atan2(x - n.x, z - n.z) - n.yaw) * ease(dt, 7); };
  const stop = (n: Npc, dt: number) => { n.speed += (0 - n.speed) * ease(dt, 8); };
  const sideStep = (n: Npc, dt: number, speed: number) => {
    const h = n.yaw + (Math.PI / 2) * n.strafe;
    const nx = n.x + Math.sin(h) * speed * dt; const nz = n.z + Math.cos(h) * speed * dt;
    if (!solid(nx, nz, 0.3)) { n.x = nx; n.z = nz; } else n.strafe *= -1;
  };

  const center = (n: Npc, out: THREE.Vector3) => out.set(n.x, opts.heightAt(n.x, n.z) + n.rig.hover + n.rig.height, n.z);
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();

  const nearestGem = (x: number, z: number) => {
    let best: { px: number; pz: number } | null = null;
    let bd = Infinity;
    for (const g of opts.gems()) {
      if (g.collected) continue;
      const d = Math.hypot(g.px - x, g.pz - z);
      if (d < bd) { bd = d; best = g; }
    }
    return best ? { dist: Math.round(bd), dir: compass(best.px - x, best.pz - z) } : null;
  };

  // ── Damage, both ways. ──
  const hurtPlayer = (dmg: number) => {
    if (breachTimer > 0) return;
    const onShield = Math.min(telemetry.shield, dmg);
    telemetry.shield -= onShield;
    telemetry.integrity = Math.max(0, telemetry.integrity - (dmg - onShield));
    sinceHurt = 0;
    telemetry.hits += 1;
    opts.onEvent('hit');
    if (telemetry.integrity <= 0) {
      // Suit breach: the colony's medics haul the pilot back to the pad, and the scrap in their pockets goes too.
      breachTimer = 3;
      save.credits = Math.floor(save.credits / 2);
      save.wanted = Math.max(0, save.wanted - 2);
      for (const n of npcs) { n.mind.grudge = 0; n.mind.lastSeenAgo = Infinity; }
      persist();
      bark(null, 'breach', {}, 5);
    }
  };
  const knockDown = (n: Npc, by: Bolt['from']) => {
    n.health = 0;
    n.downTimer = n.spec.body === 'scav' ? 75 : 35;
    sfx.down();
    opts.onEvent('down');
    if (n.spec.persona.faction === 'scav') {
      if (by === 'player') {
        save.credits += 15;
        if (save.job && save.job.done < save.job.need) {
          save.job.done += 1;
          if (save.job.done >= save.job.need) bark(npcs.find((x) => x.spec.id === 'kern') ?? null, 'kern.jobDone', { pay: JOB_PAY }, 4.5);
        }
        persist();
      }
    } else bark(n, 'bark.down');
    if (talkingTo === n) closeDialog();
  };
  const hurtNpc = (n: Npc, dmg: number, by: Bolt['from']) => {
    if (n.health <= 0) return;
    const wasHostile = n.spec.persona.faction === 'scav' || hostileToPlayer(n);
    n.health -= dmg;
    n.hurt = 1;
    n.hitBy = by === 'player' ? 'player' : 'npc';
    n.hitHold = 1.2;
    if (by === 'player') {
      telemetry.landed += 1;
      sfx.hit();
      // Shooting someone who had not drawn on you is a crime, and the colony keeps count.
      if (!wasHostile && n.charged <= 0) {
        const stars = wantedFor(n.spec.persona.faction, false, n.health <= 0);
        if (stars > 0) {
          const before = Math.ceil(save.wanted);
          save.wanted = Math.min(5, save.wanted + stars);
          if (n.spec.persona.faction !== 'hunter') save.rep[n.spec.persona.faction as 'crew' | 'trader'] = Math.max(-1, save.rep[n.spec.persona.faction as 'crew' | 'trader'] - 0.25);
          n.charged = 4;
          sinceHunterSaw = 0;
          if (Math.ceil(save.wanted) > before) opts.onEvent('wanted');
          // A crime goes out on the guild channel: every hunter knows where it happened.
          for (const o of npcs) if (o.spec.persona.faction === 'hunter' && o.health > 0) { o.alarm = 4; o.mind.lastSeenAgo = 0; }
          persist();
        }
      }
      // The victim's friends nearby hear it.
      for (const o of npcs) {
        if (o !== n && o.spec.persona.faction === n.spec.persona.faction && Math.hypot(o.x - n.x, o.z - n.z) < 45) o.alarm = 3;
      }
    }
    if (n.health <= 0) knockDown(n, by);
    else if (n.barked <= 0 && n.spec.persona.faction !== 'scav') bark(n, n.decision.mode === 'flee' ? 'bark.flee' : 'bark.hit');
  };

  // ── Talking. ──
  const ctx = (): DialogCtx => ({ save, integrity: telemetry.integrity, hostiles: npcs.filter((n) => n.health > 0 && n.spec.persona.faction === 'scav').length });
  const lineVars = () => ({
    credits: save.credits, integrity: Math.round(telemetry.integrity), fee: WANTED_FEE * Math.ceil(save.wanted), stars: Math.ceil(save.wanted),
    need: save.job?.need ?? 3, done: save.job?.done ?? 0, pay: JOB_PAY, repair: REPAIR_COST, tip: TIP_COST, shield: SHIELD_COST,
    hostiles: ctx().hostiles,
  });
  const showNode = (n: Npc, id: string) => {
    const nd = n.spec.nodes?.[id];
    if (!nd) { closeDialog(); return; }
    node = id;
    const line = nd.line === 'vex.rumorLine' ? `vex.rumor${(save.rumors - 1 + 4) % 4}` : nd.line;
    telemetry.dialog = { npc: n.spec.id, name: n.spec.name, line, vars: lineVars(), options: optionsFor(nd, ctx()), serial: ++dialogSerial };
  };
  function closeDialog() {
    talkingTo = null;
    node = '';
    telemetry.dialog = null;
  }
  const openDialog = (n: Npc) => {
    if (!n.spec.start || n.health <= 0 || hostileToPlayer(n)) return;
    talkingTo = n;
    opts.onEvent('talk');
    showNode(n, n.spec.start(ctx()));
  };
  const apply = (n: Npc, effect: string) => {
    const pay = (c: number) => { if (save.credits < c) return false; save.credits -= c; return true; };
    switch (effect) {
      case 'recruit': save.recruited = true; bark(n, 'pip.joined'); break;
      case 'dismiss': save.recruited = false; bark(n, 'pip.dismissed'); break;
      case 'scan': {
        const g = nearestGem(n.x, n.z);
        bark(n, g ? 'pip.gem' : 'pip.noGem', g ?? {}, 5);
        break;
      }
      case 'tip': {
        if (!pay(TIP_COST)) break;
        const g = nearestGem(crewPos.x, crewPos.z);
        bark(n, g ? 'vex.tipLine' : 'vex.noTip', g ?? {}, 6);
        if (!g) save.credits += TIP_COST;
        save.rep.trader = Math.min(1, save.rep.trader + 0.05);
        break;
      }
      case 'repair': if (pay(REPAIR_COST)) { telemetry.integrity = 100; bark(n, 'kern.repaired'); } break;
      case 'shield': if (pay(SHIELD_COST)) { telemetry.shield = 50; bark(n, 'vex.shielded'); save.rep.trader = Math.min(1, save.rep.trader + 0.05); } break;
      case 'startJob': save.job = { need: 3, done: 0 }; bark(n, 'kern.jobStarted', { need: 3 }); break;
      case 'turnIn':
        save.credits += JOB_PAY; save.jobsDone += 1; save.job = null;
        save.rep.crew = Math.min(1, save.rep.crew + 0.15); save.rep.hunter = Math.min(1, save.rep.hunter + 0.1);
        break;
      case 'payWanted': {
        const f = WANTED_FEE * Math.ceil(save.wanted);
        if (pay(f)) {
          save.wanted = 0;
          for (const o of npcs) if (o.spec.persona.faction === 'hunter') o.mind.grudge = 0;
          bark(n, 'kern.cleared');
          opts.onEvent('clear');
        }
        break;
      }
      case 'insult': save.rep.trader = Math.max(-1, save.rep.trader - 0.5); n.mind.grudge = 0.6; bark(n, 'vex.insulted'); break;
      case 'provoke': save.rep.hunter = Math.max(-1, save.rep.hunter - 0.3); n.mind.grudge = 1; bark(n, 'bark.provoked'); break;
      case 'work': if (!save.flags.includes(`work-${n.spec.id}`)) { save.flags.push(`work-${n.spec.id}`); save.rep.hunter = Math.min(1, save.rep.hunter + 0.05); } break;
      case 'rumor': save.rumors += 1; break;
    }
    persist();
  };
  const choose = (index: number) => {
    const n = talkingTo;
    if (!n || !node) return;
    const nd = n.spec.nodes?.[node];
    const opt = nd?.options[index];
    if (!opt) return;
    const view = telemetry.dialog?.options.find((o) => o.index === index);
    if (!view || !view.enabled) return;
    if (opt.effect) apply(n, opt.effect);
    if (opt.to && talkingTo === n && !hostileToPlayer(n)) showNode(n, opt.to);
    else closeDialog();
  };

  const interactables: Interactable[] = npcs.filter((n) => n.spec.start).map((n) => ({
    id: `npc-${n.spec.id}`, priority: 2,
    where: () => (n.health > 0 && !talkingTo && !hostileToPlayer(n) && n.decision.mode !== 'flee' ? { x: n.x, z: n.z, r: 2.6 } : null),
    kind: () => 'tap', label: () => 'talk',
    use: () => openDialog(n),
  }));

  // ── One NPC's turn. ──
  const run = (n: Npc, dt: number, t: number, crew: THREE.Vector3) => {
    const p = n.spec.persona;
    const dPlayer = Math.hypot(crew.x - n.x, crew.z - n.z);
    n.hurt = Math.max(0, n.hurt - dt * 4);
    n.hitHold = Math.max(0, n.hitHold - dt);
    if (n.hitHold <= 0) n.hitBy = null;
    n.alarm = Math.max(0, n.alarm - dt);
    n.barked -= dt;
    n.charged -= dt;
    n.cooldown -= dt;

    if (n.health <= 0) {
      n.downTimer -= dt;
      n.downness = Math.min(1, n.downness + dt * 1.5);
      stop(n, dt);
      if (n.downTimer <= 0) {
        // Back up: droids reboot, people get to their feet, a scav is replaced by another far out.
        n.health = n.spec.maxHealth;
        n.mind = newMind();
        if (p.faction === 'scav') {
          const a = Math.random() * Math.PI * 2;
          n.x = n.spec.home.x + Math.cos(a) * 20; n.z = n.spec.home.z + Math.sin(a) * 20;
        }
      }
    } else n.downness = Math.max(0, n.downness - dt * 0.8);

    // Threats: the nearest scav that is up (for everyone else), or the nearest colony body (for a scav).
    let threat: Npc | null = null;
    let threatDist = Infinity;
    for (const o of npcs) {
      if (o === n || o.health <= 0) continue;
      const enemy = p.faction === 'scav' ? o.spec.persona.faction !== 'scav' && o.spec.persona.role !== 'vendor' : o.spec.persona.faction === 'scav';
      if (!enemy) continue;
      const d = Math.hypot(o.x - n.x, o.z - n.z);
      if (d < threatDist && lineClear(n.x, n.z, o.x, o.z)) { threatDist = d; threat = o; }
    }
    n.threat = threat;
    // Sight: in range, nothing in the way, and roughly in front (or close, or already fighting).
    const ahead = Math.abs(wrap(Math.atan2(crew.x - n.x, crew.z - n.z) - n.yaw)) < 1.4;
    const visible = breachTimer <= 0 && dPlayer < p.sight && (ahead || dPlayer < 12 || n.decision.mode === 'attack' || n.mind.lastSeenAgo < 3) && lineClear(n.x, n.z, crew.x, crew.z);
    const senses: Senses = {
      playerDist: dPlayer, playerVisible: visible, hitBy: n.hitBy, health: Math.max(0, n.health / n.spec.maxHealth),
      allyAlarm: n.alarm > 0, threatDist, talking: talkingTo === n,
    };
    remember(n.mind, senses, dt);
    if (p.faction === 'hunter' && visible && save.wanted > 0) sinceHunterSaw = 0;

    n.think -= dt;
    if (n.think <= 0) {
      n.think = 0.25 + Math.random() * 0.15;
      const before = n.decision.mode;
      n.decision = decide(p, n.mind, senses, standing());
      if (before !== n.decision.mode && n.barked <= 0 && dPlayer < 45) {
        const m = n.decision.mode;
        if (m === 'attack' && n.decision.target === 'player') bark(n, p.faction === 'scav' ? 'bark.scav' : p.faction === 'hunter' && save.wanted > 0 ? 'bark.wanted' : 'bark.spot', { stars: Math.ceil(save.wanted) });
        else if (m === 'attack' && n.decision.target === 'threat' && p.role === 'companion' && threat) bark(n, 'pip.threat', { dir: compass(threat.x - n.x, threat.z - n.z) });
        else if (m === 'flee' && p.faction !== 'scav') bark(n, 'bark.flee');
        else if (m === 'cover') bark(n, 'bark.cover');
        else if (m === 'investigate' && p.faction === 'hunter') bark(n, 'bark.search');
      }
    }

    // ── Carry it out. ──
    const d = n.decision;
    const targetPos = d.target === 'threat' && threat ? { x: threat.x, z: threat.z } : { x: crew.x, z: crew.z };
    const targetDist = Math.hypot(targetPos.x - n.x, targetPos.z - n.z);
    let aiming = false;
    if (n.health > 0) switch (d.mode) {
      case 'idle':
        stop(n, dt);
        if (d.target === 'player') face(n, dt, crew.x, crew.z);
        if (p.role === 'companion' && !save.recruited && Math.hypot(n.x - n.spec.home.x, n.z - n.spec.home.z) > 3) steer(n, dt, n.spec.home.x, n.spec.home.z, 1, WALK);
        break;
      case 'post':
        if (steer(n, dt, n.spec.home.x, n.spec.home.z, 0.8, WALK) && dPlayer < 12) face(n, dt, crew.x, crew.z);
        break;
      case 'talk':
        stop(n, dt);
        face(n, dt, crew.x, crew.z);
        break;
      case 'wander':
      case 'patrol': {
        const route = n.spec.route;
        if (!n.waypoint) {
          if (route && route.length) { n.route = (n.route + 1) % route.length; n.waypoint = route[n.route]; }
          else {
            const a = Math.random() * Math.PI * 2; const r = 4 + Math.random() * (p.faction === 'scav' ? 26 : 10);
            n.waypoint = { x: n.spec.home.x + Math.cos(a) * r, z: n.spec.home.z + Math.sin(a) * r };
          }
        }
        if (steer(n, dt, n.waypoint.x, n.waypoint.z, 1.2, p.faction === 'scav' ? 2.4 : WALK)) n.waypoint = null;
        // Colonists say something to a pilot walking by.
        if (p.role === 'colonist' && dPlayer < 7 && n.barked <= 0 && telemetry.bark === null) bark(n, `chat.${n.spec.id}${Math.floor(Math.random() * 3)}`);
        break;
      }
      case 'follow': {
        // Behind the pilot's shoulder, not underfoot: keep 3–6 m, catch up running.
        if (dPlayer > 6) steer(n, dt, crew.x, crew.z, 3.5, dPlayer > 14 ? RUN * 1.3 : RUN * 0.8);
        else { stop(n, dt); face(n, dt, crew.x, crew.z); }
        if (dPlayer > 70) { n.x = crew.x - 3; n.z = crew.z - 3; }
        break;
      }
      case 'alert':
      case 'investigate': {
        const tx = d.mode === 'alert' ? crew.x : crew.x + Math.sin(t * 0.3) * 6;
        const tz = d.mode === 'alert' ? crew.z : crew.z + Math.cos(t * 0.3) * 6;
        steer(n, dt, tx, tz, 8, d.mode === 'alert' ? WALK * 1.3 : RUN * 0.7);
        break;
      }
      case 'cover': {
        // The far side of the nearest big thing from whoever is shooting.
        if (!n.coverSpot || n.think > 0.38) {
          let best: Collider | null = null; let bd = 30;
          for (const c of opts.colliders) {
            if (c.r < 1.5) continue;
            const dd = Math.hypot(c.x - n.x, c.z - n.z);
            if (dd < bd) { bd = dd; best = c; }
          }
          if (best) {
            const ax = best.x - targetPos.x; const az = best.z - targetPos.z; const al = Math.hypot(ax, az) || 1;
            n.coverSpot = { x: best.x + (ax / al) * (best.r + 1.1), z: best.z + (az / al) * (best.r + 1.1) };
          } else n.coverSpot = null;
        }
        if (n.coverSpot && !steer(n, dt, n.coverSpot.x, n.coverSpot.z, 0.8, RUN)) break;
        // In cover: peek and fire now and then.
        face(n, dt, targetPos.x, targetPos.z);
        aiming = Math.sin(t * 1.3 + n.x) > 0.3;
        break;
      }
      case 'flee': {
        const ax = n.x - targetPos.x; const az = n.z - targetPos.z; const al = Math.hypot(ax, az) || 1;
        // The colony's own run for the habitats; everyone else just away.
        const home = p.faction === 'crew' ? { x: 0, z: -46 } : null;
        if (home && Math.hypot(home.x - n.x, home.z - n.z) > 6) steer(n, dt, home.x, home.z, 4, RUN);
        else steer(n, dt, n.x + (ax / al) * 10, n.z + (az / al) * 10, 0.5, RUN);
        break;
      }
      case 'attack': {
        // Hold a range that suits the weapon, side-step to spoil the aim, face the target and shoot.
        const [lo, hi] = p.faction === 'hunter' ? [13, 24] : p.faction === 'scav' ? [5, 11] : [6, 11];
        if (targetDist > hi) steer(n, dt, targetPos.x, targetPos.z, hi - 1, RUN);
        else if (targetDist < lo) {
          const ax = n.x - targetPos.x; const az = n.z - targetPos.z; const al = Math.hypot(ax, az) || 1;
          steer(n, dt, n.x + (ax / al) * 3, n.z + (az / al) * 3, 0.2, WALK * 1.4);
        } else {
          stop(n, dt);
          n.strafeTimer -= dt;
          if (n.strafeTimer <= 0) { n.strafe = Math.random() < 0.5 ? -1 : 1; n.strafeTimer = 0.8 + Math.random() * 1.5; }
          sideStep(n, dt, p.faction === 'scav' ? 3.2 : 1.8);
        }
        face(n, dt, targetPos.x, targetPos.z);
        aiming = true;
        break;
      }
    }

    // ── Shoot. ──
    if (aiming && n.health > 0 && n.cooldown <= 0 && targetDist < 60 && lineClear(n.x, n.z, targetPos.x, targetPos.z)) {
      const facing = Math.abs(wrap(Math.atan2(targetPos.x - n.x, targetPos.z - n.z) - n.yaw)) < 0.35;
      if (facing) {
        n.rig.root.updateMatrixWorld(true);
        n.rig.muzzle.getWorldPosition(tmpA);
        if (d.target === 'threat' && threat) center(threat, tmpB);
        else tmpB.set(crew.x, crew.y + 1.1, crew.z);
        // Aim is worse at range and on the move, and better the longer they hold it.
        const spread = (p.faction === 'hunter' ? 0.035 : 0.07) * (1 + targetDist / 25);
        tmpDir.subVectors(tmpB, tmpA).normalize();
        tmpDir.x += (Math.random() - 0.5) * spread * 2;
        tmpDir.y += (Math.random() - 0.5) * spread;
        tmpDir.z += (Math.random() - 0.5) * spread * 2;
        fireBolt(n, tmpA, tmpDir, p.faction === 'hunter' ? 12 : p.faction === 'scav' ? 6 : 14);
        n.cooldown = p.faction === 'hunter' ? 0.55 + Math.random() * 0.5 : p.faction === 'scav' ? 0.35 + Math.random() * 0.3 : 0.5;
        // Short bursts, then a breath.
        if (Math.random() < 0.18) n.cooldown += 1.2;
      }
    }

    // ── Draw. ──
    const ground = opts.heightAt(n.x, n.z);
    n.rig.root.position.set(n.x, ground + n.rig.hover, n.z);
    n.rig.root.rotation.y = n.yaw;
    n.rig.animate({ t, dt, speed: n.speed, mode: n.health > 0 ? d.mode : 'down', aiming, hurt: n.hurt, downness: n.downness });
    const showTag = dPlayer < LABEL_RANGE && n.downness < 0.5;
    n.label.sprite.visible = showTag;
    if (showTag) {
      const hostile = p.faction === 'scav' || hostileToPlayer(n);
      n.label.set(n.spec.name, opts.tag(hostile ? 'hostile' : `role.${p.role === 'vendor' ? n.spec.id : p.role}`));
      n.label.sprite.position.set(n.x, ground + n.rig.hover + n.rig.height + (n.spec.body === 'ballDroid' ? 0.6 : 0.95), n.z);
      n.label.setOpacity(Math.min(1, (LABEL_RANGE - dPlayer) / 6));
    }
  };

  /** The pilot's blaster: along the camera's line, onto whoever is near that line (a little help), else straight on. */
  const playerShoot = (crew: THREE.Vector3, camera: THREE.Camera) => {
    camera.getWorldDirection(tmpDir);
    let best: Npc | null = null;
    let bestScore = Infinity;
    for (const n of npcs) {
      if (n.health <= 0) continue;
      center(n, tmpB);
      tmpA.subVectors(tmpB, camera.position);
      const along = tmpA.dot(tmpDir);
      if (along < 2 || along > 80) continue;
      const off = tmpA.clone().addScaledVector(tmpDir, -along).length();
      const cone = off / along;
      if (cone < 0.12 && cone < bestScore && lineClear(crew.x, crew.z, n.x, n.z)) { bestScore = cone; best = n; }
    }
    tmpA.set(crew.x, crew.y + 1.25, crew.z);
    if (best) tmpB.copy(center(best, tmpB));
    else tmpB.copy(camera.position).addScaledVector(tmpDir, 60);
    const dir = tmpB.sub(tmpA).normalize();
    tmpA.addScaledVector(dir, 0.6);
    fireBolt('player', tmpA, dir, PLAYER_DMG);
    opts.onEvent('shot');
  };

  const stepBolts = (dt: number, crew: THREE.Vector3, lights: LightPool) => {
    for (const b of bolts) {
      if (b.life < 0) continue;
      b.life += dt;
      const steps = 3;
      let done = b.life > BOLT_LIFE;
      for (let s = 0; s < steps && !done; s++) {
        b.pos.addScaledVector(b.vel, dt / steps);
        if (b.pos.y < opts.heightAt(b.pos.x, b.pos.z) || solid(b.pos.x, b.pos.z, -0.2)) { done = true; break; }
        if (b.from !== 'player' && b.pos.distanceTo(tmpA.set(crew.x, crew.y + 1.0, crew.z)) < 0.6) { hurtPlayer(b.dmg); done = true; break; }
        for (const n of npcs) {
          if (n === b.from || n.health <= 0) continue;
          // A bolt passes through friends of whoever fired it.
          if (b.from !== 'player' && (b.from.spec.persona.faction === 'scav') === (n.spec.persona.faction === 'scav')) continue;
          if (b.pos.distanceTo(center(n, tmpB)) < n.rig.radius + 0.15) { hurtNpc(n, b.dmg, b.from); done = true; break; }
        }
      }
      if (done) { b.life = -1; b.mesh.visible = false; continue; }
      b.mesh.position.copy(b.pos);
      if (b.life < 0.05) lights.request(b.pos.x, b.pos.y, b.pos.z, b.mesh.material === boltMats.player ? 0x66e6ff : 0xff5533, 3, 6, 2);
    }
  };

  return {
    group, telemetry, interactables, colliders,
    update(dt, t, crew, camera, lights, fire) {
      crewPos.copy(crew);
      if (breachTimer > 0) {
        breachTimer -= dt;
        if (breachTimer <= 0) { telemetry.integrity = 100; telemetry.shield = 0; opts.onBreach(); }
      }
      playerCooldown -= dt;
      if (fire && playerCooldown <= 0 && !talkingTo && breachTimer <= 0) { playerCooldown = PLAYER_COOLDOWN; playerShoot(crew, camera); }
      let engaged = 0;
      for (const n of npcs) {
        run(n, dt, t, crew);
        if (n.health > 0 && n.decision.mode === 'attack' && n.decision.target === 'player' && n.mind.lastSeenAgo < 1) engaged++;
      }
      for (let i = 0, k = 0; i < npcs.length; i++) {
        if (npcs[i].spec.body === 'scav') continue;
        colliders[k].x = npcs[i].x; colliders[k].z = npcs[i].z;
        colliders[k].r = npcs[i].health > 0 ? 0.5 : 0;
        k++;
      }
      stepBolts(dt, crew, lights);
      // A talk ends when the pilot walks off.
      if (talkingTo && Math.hypot(talkingTo.x - crew.x, talkingTo.z - crew.z) > 6) closeDialog();
      // Suit: it seals itself a little at a time once nothing has hit it for a while.
      sinceHurt += dt;
      if (sinceHurt > REGEN_DELAY && telemetry.integrity < 100 && breachTimer <= 0) telemetry.integrity = Math.min(100, telemetry.integrity + REGEN_RATE * dt);
      // The warrant cools once no hunter has seen the pilot for a while: a star at a time.
      if (save.wanted > 0) {
        sinceHunterSaw += dt;
        if (sinceHunterSaw > WANTED_DECAY) {
          sinceHunterSaw = 0;
          save.wanted = Math.max(0, Math.ceil(save.wanted) - 1);
          if (save.wanted === 0) { bark(null, 'lostThem', {}, 4); opts.onEvent('clear'); }
          persist();
        }
      }
      if (telemetry.bark) {
        telemetry.bark.hold -= dt;
        if (telemetry.bark.hold <= 0) telemetry.bark = null;
      }
      telemetry.engaged = engaged;
      telemetry.wanted = Math.ceil(save.wanted);
      telemetry.credits = save.credits;
      telemetry.job = save.job ? { ...save.job } : null;
      telemetry.companion = save.recruited;
    },
    choose,
    closeDialog,
    probe: () => Object.fromEntries(npcs.map((n) => [n.spec.id, `${n.decision.mode}${n.decision.target ? `>${n.decision.target}` : ''} hp${Math.round(n.health)} d${Math.round(Math.hypot(n.x - crewPos.x, n.z - crewPos.z))} @${n.x.toFixed(1)},${n.z.toFixed(1)}`])),
    dispose() {
      for (const n of npcs) { n.rig.dispose(); n.label.dispose(); }
      boltGeom.dispose();
      for (const m of Object.values(boltMats)) m.dispose();
      sfx.dispose();
    },
  };
}
