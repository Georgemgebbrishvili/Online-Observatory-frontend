// How the people and machines round Mars Base make up their minds. Pure:
// no three, no clock — the world hands each one what it can sense, and the
// brain says what it wants to do. Every option is scored (utility AI), the
// one already under way gets a little extra so nobody flickers between two,
// and the scores come from who they are (faction, nerve, temper) and what
// they remember (a grudge, where the pilot was last seen, the pilot's
// standing with their faction and the bounty on the pilot's head).

export type Faction = 'crew' | 'trader' | 'hunter' | 'scav';
export type Role = 'companion' | 'vendor' | 'patrol' | 'raider' | 'colonist';
export type Mode = 'idle' | 'wander' | 'patrol' | 'post' | 'follow' | 'talk' | 'alert' | 'investigate' | 'attack' | 'cover' | 'flee' | 'down';

export interface Persona {
  faction: Faction;
  role: Role;
  /** 0…1: stands its ground under fire (high) or runs (low). */
  nerve: number;
  /** 0…1: how quick to draw. */
  temper: number;
  /** Metres it can see the pilot from. */
  sight: number;
}

/** What the pilot has done that the factions keep account of (npc-memory). */
export interface Standing {
  /** −1…1 per faction. */
  rep: Record<Exclude<Faction, 'scav'>, number>;
  /** 0…5 stars: shooting the peaceful raises it; the hunters come for anyone with one. */
  wanted: number;
  /** The droid signed on as a companion. */
  recruited: boolean;
}

export interface Senses {
  /** Metres to the pilot. */
  playerDist: number;
  /** In sight range and nothing solid between. */
  playerVisible: boolean;
  /** Hit in the last moment, by whom. */
  hitBy: 'player' | 'npc' | null;
  /** 0…1. */
  health: number;
  /** A friend nearby raised the alarm about the pilot. */
  allyAlarm: boolean;
  /** The nearest hostile machine and how far (companions and colonists watch for them). */
  threatDist: number;
  /** The pilot is talking to this one. */
  talking: boolean;
}

export interface Mind {
  mode: Mode;
  /** 0…1: built by being shot at, by a bounty, by an insult; ebbs with time. */
  grudge: number;
  /** 0…1: heard or half-saw something; makes it go and look. */
  suspicion: number;
  /** Seconds since the pilot was last seen (Infinity: never). */
  lastSeenAgo: number;
}

export type Target = 'player' | 'threat' | null;
export interface Decision { mode: Mode; target: Target }

export const newMind = (mode: Mode = 'idle'): Mind => ({ mode, grudge: 0, suspicion: 0, lastSeenAgo: Infinity });

/** How a faction stands toward the pilot, −1 (on sight) … 1 (friend). */
export function attitude(p: Persona, s: Standing, mind: Mind): number {
  if (p.faction === 'scav') return -1;
  // A droid signed on sticks with its pilot, warrant or not, unless the pilot turns on it.
  if (p.role === 'companion' && s.recruited) return Math.max(-1, 1 - mind.grudge * 2.2);
  let a = s.rep[p.faction];
  // The hunters work for whoever pays: a bounty makes the pilot the job.
  if (p.faction === 'hunter' && s.wanted > 0) a -= 0.35 + s.wanted * 0.2;
  // The colony's own look the other way for one star, not for more.
  if (p.faction === 'crew' && s.wanted >= 3) a -= 0.4;
  return Math.max(-1, Math.min(1, a - mind.grudge * 1.4));
}

const BASE: Record<Role, Mode> = { companion: 'idle', vendor: 'post', patrol: 'patrol', raider: 'wander', colonist: 'wander' };

/** What this one does next. `standing` is the pilot's; `mind` is updated in place by `remember`. */
export function decide(p: Persona, mind: Mind, sense: Senses, standing: Standing): Decision {
  if (sense.health <= 0) return { mode: 'down', target: null };
  const att = attitude(p, standing, mind);
  const hostile = att <= -0.3;
  const armed = p.faction === 'hunter' || p.faction === 'scav' || (p.role === 'companion' && standing.recruited);
  const scores: [Mode, Target, number][] = [];
  const add = (m: Mode, t: Target, s: number) => scores.push([m, t, s + (m === mind.mode ? 0.08 : 0)]);

  if (sense.talking && !hostile) add('talk', 'player', 1.2);

  // Fear: hurt and losing, or unarmed and shot at.
  const breaking = sense.health < 0.3 * (1.3 - p.nerve);
  if (breaking) add('flee', sense.hitBy === 'npc' ? 'threat' : 'player', 1.1);
  if (!armed && (sense.hitBy || (hostile && sense.playerVisible && sense.playerDist < 25))) add('flee', 'player', 0.7 + (1 - p.nerve) * 0.2);
  if (!armed && sense.threatDist < 30) add('flee', 'threat', 0.75);

  if (armed) {
    if (hostile && sense.playerVisible && sense.playerDist < p.sight) add('attack', 'player', 0.6 + p.temper * 0.3);
    // Shot at and hurting: get behind something first, then fight.
    if (hostile && sense.hitBy === 'player' && sense.health < 0.65) add('cover', 'player', 0.75 + (1 - p.nerve) * 0.3 + Math.min(0.2, 0.65 - sense.health));
    // Machines on the colony: the hunters and the droid deal with them.
    if (p.faction !== 'scav' && sense.threatDist < (p.role === 'companion' ? 28 : 40)) add('attack', 'threat', 0.72);
    if (hostile && !sense.playerVisible && mind.lastSeenAgo < 25) add('investigate', 'player', 0.55);
  }
  if (sense.allyAlarm && !hostile && p.faction === 'hunter') add('alert', 'player', 0.45);
  if (hostile && sense.allyAlarm && !sense.playerVisible) add('investigate', 'player', 0.5);
  if (mind.suspicion > 0.35 && !sense.playerVisible) add('investigate', 'player', 0.35 + mind.suspicion * 0.2);

  if (p.role === 'companion' && standing.recruited) add('follow', 'player', 0.4);
  // Friendly folk turn to look at a pilot walking up.
  if (!hostile && sense.playerVisible && sense.playerDist < 9 && p.role !== 'raider') add('idle', 'player', 0.3);
  add(BASE[p.role], null, 0.2);

  scores.sort((a, b) => b[2] - a[2]);
  return { mode: scores[0][0], target: scores[0][1] };
}

/** Memory between thinks: grudges ebb, suspicion fades, sightings age. */
export function remember(mind: Mind, sense: Senses, dt: number): void {
  if (sense.playerVisible) mind.lastSeenAgo = 0;
  else mind.lastSeenAgo += dt;
  if (sense.hitBy === 'player') mind.grudge = Math.min(1, mind.grudge + 0.45);
  if (sense.allyAlarm) mind.suspicion = Math.min(1, mind.suspicion + dt * 0.8);
  // A grudge lasts about a minute and a half; suspicion half a minute.
  mind.grudge = Math.max(0, mind.grudge - dt / 90);
  mind.suspicion = Math.max(0, mind.suspicion - dt / 30);
}

/** Wanted stars for an attack on someone peaceful: a colonist or a trader costs more than a hunter who drew first. */
export function wantedFor(victim: Faction, victimWasHostile: boolean, down: boolean): number {
  if (victim === 'scav' || victimWasHostile) return 0;
  return (victim === 'hunter' ? 1 : 1.5) + (down ? 1 : 0);
}
