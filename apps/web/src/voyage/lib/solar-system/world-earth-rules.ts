// The rules of the street in Tbilisi, with nothing of the scene in them so
// they can be tested: what each crime costs in stars, how long it takes to
// lose the police, when they have you, and what a fare pays.

export type Crime = 'jack' | 'jackPolice' | 'hitPerson' | 'ramPolice';

export interface Wanted {
  /** 0 … 5. */
  stars: number;
  /** Seconds since a patrol last had the pilot in sight. */
  unseen: number;
  /** 0 … 1: how far along getting away is (the stars blink while it runs). */
  evade: number;
  /** 0 … 1: how close the police are to having the pilot. */
  bust: number;
  /** Seconds before another ram of a patrol car counts. */
  ramCool: number;
  /** Where the pilot was last seen (or the crime was): the police search round it. */
  lastX: number;
  lastZ: number;
}

export const MAX_STARS = 5;

export const newWanted = (): Wanted => ({ stars: 0, unseen: 0, evade: 0, bust: 0, ramCool: 0, lastX: 0, lastZ: 0 });

/** How far from where they were last seen the pilot must be before getting away can begin, m. */
export const searchRadius = (stars: number) => 70 + stars * 30;

/** Seconds out of sight (and out of the search) to lose this many stars' worth of police. */
export const evadeSeconds = (stars: number) => 7 + stars * 4;

/** Patrol cars after the pilot at this many stars. */
export const unitsFor = (stars: number) => (stars <= 0 ? 0 : stars === 1 ? 1 : stars === 2 ? 2 : stars === 3 ? 3 : 4);

/** A crime, seen or not. Returns whether the stars went up. */
export function commit(w: Wanted, crime: Crime, witnessed: boolean, x = 0, z = 0): boolean {
  if (crime === 'ramPolice') {
    if (w.ramCool > 0) return false;
    w.ramCool = 4;
  }
  // A patrol car is always missed at once; the rest only count where someone saw.
  if (!witnessed && crime !== 'jackPolice' && crime !== 'ramPolice') return false;
  const add = crime === 'jackPolice' ? 2 : 1;
  const before = w.stars;
  w.stars = Math.min(MAX_STARS, w.stars + add);
  w.unseen = 0; w.evade = 0;
  w.lastX = x; w.lastZ = z;
  return w.stars > before;
}

export interface WantedSense {
  /** A patrol car has the pilot in sight. */
  seen: boolean;
  /** A patrol car stands within arm's reach of the pilot, and the pilot is not getting away. */
  cornered: boolean;
  /** Where the pilot is. */
  x: number;
  z: number;
}

/** One step. Returns 'cleared' when the police give up, 'busted' when they have the pilot. */
export function tickWanted(w: Wanted, dt: number, sense: WantedSense): 'cleared' | 'busted' | null {
  w.ramCool = Math.max(0, w.ramCool - dt);
  if (w.stars <= 0) { w.unseen = 0; w.evade = 0; w.bust = 0; return null; }
  // Seen, the search moves to them; inside the search, the clock does not run.
  const searched = Math.hypot(sense.x - w.lastX, sense.z - w.lastZ) < searchRadius(w.stars);
  if (sense.seen) { w.unseen = 0; w.evade = 0; w.lastX = sense.x; w.lastZ = sense.z; }
  else if (searched) { w.unseen = 0; w.evade = 0; }
  else { w.unseen += dt; w.evade = Math.min(1, w.unseen / evadeSeconds(w.stars)); }
  // Cornered, the arrest takes a couple of seconds; break away and it falls back faster.
  w.bust = sense.cornered ? Math.min(1, w.bust + dt / 2.4) : Math.max(0, w.bust - dt / 1.2);
  if (w.bust >= 1) { Object.assign(w, newWanted()); return 'busted'; }
  if (w.evade >= 1) { Object.assign(w, newWanted()); return 'cleared'; }
  return null;
}

/** What getting caught costs: a fine of a fifth of what the pilot has, at least 20 ₾ when there is that much. */
export const fineFor = (cash: number) => Math.min(cash, Math.max(20, Math.round(cash * 0.2)));

export interface Fare {
  /** Metres along the streets to the drop-off when the passenger got in. */
  distance: number;
  /** Seconds allowed. */
  allowed: number;
  /** The meter's price, ₾. */
  base: number;
}

/** A fare for a ride this long: a flag fall and so much a kilometre, with time for traffic. */
export function fareFor(distance: number): Fare {
  return { distance, allowed: Math.round(30 + distance / 8.5), base: Math.round(6 + distance * 0.011) };
}

/** What the passenger pays at the end: the meter, a tip for being quick, less for every knock they felt. */
export function farePay(f: Fare, timeLeft: number, knocks: number): { pay: number; tip: number } {
  if (timeLeft <= 0) return { pay: Math.max(1, Math.round(f.base * 0.5)), tip: 0 };
  const quick = Math.min(1, timeLeft / f.allowed);
  const tip = Math.max(0, Math.round(f.base * quick * 0.6 - knocks * 2));
  return { pay: f.base, tip };
}
