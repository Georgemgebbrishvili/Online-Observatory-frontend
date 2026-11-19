// Street life in Tbilisi: what happens between the landmarks.
//
//  - Any car on the street can be taken: the driver gets out and runs, and if
//    anyone saw it, the police want a word. A patrol car taken is two stars
//    whoever saw it. The pilot's own car, left behind, stands parked.
//  - Knocking people down, or ramming a patrol car, raises the stars too.
//    The police come (world-earth-police); out of their sight long enough the
//    pilot gets away, cornered the pilot is busted, fined, and set down by
//    the pad.
//  - Driving with a clean record, people at the kerb wave for a ride: stop
//    beside them, take them where they ask, and they pay the meter and tip
//    for a quick, smooth ride.
//  - A GPS finds the way along the streets to a fare, or to anywhere picked
//    on the map; the car radio has three stations.
//
// The rules themselves are in world-earth-rules, where they are tested.

import * as THREE from 'three';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { Interactable } from '@/voyage/lib/solar-system/moon-interactions';
import type { CarHandle } from '@/voyage/lib/solar-system/world-earth-car';
import type { CityAmbience } from '@/voyage/lib/solar-system/world-earth-audio';
import { ROAD, type EarthData } from '@/voyage/lib/solar-system/world-earth-data';
import type { Mover, PeopleHandle } from '@/voyage/lib/solar-system/world-earth-people';
import { POLICE_ID, type PoliceHandle } from '@/voyage/lib/solar-system/world-earth-police';
import { makeCarRadio, STATIONS } from '@/voyage/lib/solar-system/world-earth-radio';
import { ROAD_REACH, routeDistance, type RoadGraph } from '@/voyage/lib/solar-system/world-earth-roads';
import { commit, fareFor, farePay, fineFor, newWanted, tickWanted, type Crime, type Fare } from '@/voyage/lib/solar-system/world-earth-rules';
import type { TrafficHandle } from '@/voyage/lib/solar-system/world-earth-traffic';

export interface Place { id: string; x: number; z: number }

export type CityNote =
  | 'wanted' | 'lost' | 'busted' | 'jacked' | 'hail' | 'pickedUp' | 'fareDone' | 'fareLate' | 'fareLeft' | 'fareScared' | 'arrived' | 'wrecked';

export interface CityState {
  cash: number;
  fares: number;
  stars: number;
  /** 0 … 1 while getting away (the stars blink). */
  evade: number;
  /** 0 … 1 while cornered. */
  bust: number;
  /** Seconds of the BUSTED card left on the glass. */
  busted: number;
  /** −1 off; a STATIONS index. */
  radio: number;
  radioSerial: number;
  fare: null | { stage: 'pickup' | 'ride'; dest: string; timeLeft: number; base: number; remaining: number };
  note: { key: CityNote; n: number; m: number; serial: number };
  /** The GPS: points along the streets, x z pairs, and a count that changes with them. */
  route: Float32Array | null;
  routeSerial: number;
  target: { x: number; z: number; kind: 'waypoint' | 'pickup' | 'dropoff' } | null;
  waypoint: { x: number; z: number } | null;
  /** Patrol cars about, x z pairs. */
  police: number[];
  /** The pilot's last car, when not in it. */
  parked: { x: number; z: number } | null;
  /** 0 … 1 of the car's health while at the wheel, −1 on foot. */
  carHealth: number;
  /** Where the pilot is, and the car's heading while at the wheel (NaN on foot). */
  px: number; pz: number; yaw: number;
  /** A passer-by's greeting: which line, and a count that changes with each. */
  say: { line: number; serial: number };
}

export interface CityMap {
  roads: { cls: number; pts: Float32Array }[];
  water: Float32Array[];
  places: Place[];
  reach: number;
}

export interface StreetDeps {
  data: EarthData;
  graph: RoadGraph;
  traffic: TrafficHandle;
  people: PeopleHandle;
  police: PoliceHandle;
  car: CarHandle;
  ambience: CityAmbience;
  places: Place[];
  /** Where the pilot is set down after an arrest. */
  release: { x: number; z: number };
  blocked: (x: number, z: number) => boolean;
  floorAt: (x: number, z: number) => number;
  driving: () => boolean;
  /** Into the car (it is already where it should be). */
  enter: () => void;
  /** Out of the car, by its door. */
  exit: () => void;
}

export interface Street {
  state: CityState;
  interactables: Interactable[];
  /** After each step at the wheel: what the car hit, and who. */
  afterDrive: () => void;
  /** Patrol cars, as circles for the pilot's car and the traffic. */
  policeMovers: (out: Mover[]) => Mover[];
  update: (dt: number, crew: { x: number; z: number }, night: number, obstacles: Collider[], place: (x: number, y: number, z: number) => void) => void;
  /** The walking and driving are held still (the arrest). */
  frozen: () => boolean;
  horn: (on: boolean) => void;
  radioNext: () => void;
  setWaypoint: (x: number, z: number) => void;
  clearWaypoint: () => void;
  map: () => CityMap;
  /** Development: a crime, as if seen. */
  crime: (c: Crime) => void;
  /** Development: the car the pilot drives, set down here. */
  carTo: (x: number, z: number, yaw: number) => void;
  dispose: () => void;
}

const SAVE_KEY = 'stellar_city_v1';
const START_CASH = 50;

interface Saved { cash: number; fares: number }
function load(): Saved {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<Saved>;
      if (typeof v.cash === 'number' && Number.isFinite(v.cash) && v.cash >= 0) return { cash: Math.round(v.cash), fares: Math.max(0, Math.round(v.fares ?? 0)) };
    }
  } catch { /* no storage */ }
  return { cash: START_CASH, fares: 0 };
}
function save(s: Saved) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* no storage */ }
}

export function makeStreet(d: StreetDeps): Street {
  const { traffic, people, police, car, ambience, graph } = d;
  const saved = load();
  const wanted = newWanted();
  const state: CityState = {
    cash: saved.cash, fares: saved.fares, stars: 0, evade: 0, bust: 0, busted: 0, radio: -1, radioSerial: 0, fare: null,
    note: { key: 'wanted', n: 0, m: 0, serial: 0 }, route: null, routeSerial: 0, target: null, waypoint: null, police: [], parked: null, carHealth: -1,
    px: 0, pz: 0, yaw: NaN, say: { line: 0, serial: 0 },
  };
  people.onGreet = (line) => { state.say = { line, serial: state.say.serial + 1 }; };
  const persist = () => save({ cash: state.cash, fares: state.fares });
  const note = (key: CityNote, n = 0, m = 0) => { state.note = { key, n, m, serial: state.note.serial + 1 }; };
  const radio = makeCarRadio(ambience.out);
  /** The station the radio comes back on with. */
  let tuned = 0;
  const crew = { x: 0, z: 0 };
  let takeId = -1;
  const tmp = new THREE.Vector3();
  const policeAt: number[] = [];

  const policeNear = (x: number, z: number, r: number) => {
    police.positions(policeAt);
    for (let i = 0; i < policeAt.length; i += 2) if (Math.hypot(policeAt[i] - x, policeAt[i + 1] - z) < r) return true;
    return false;
  };
  const crime = (c: Crime, witnessed: boolean, x: number, z: number) => {
    const before = wanted.stars;
    if (commit(wanted, c, witnessed, x, z) && wanted.stars !== before) note('wanted', wanted.stars);
    people.panic(x, z, c === 'hitPerson' ? 35 : 22);
  };

  // ── Fares. ──
  interface Ride { stage: 'pickup' | 'ride'; slot: number; dest: Place; drop: { x: number; z: number }; fare: Fare; timeLeft: number; knocks: number; age: number; hailX: number; hailZ: number }
  let ride: Ride | null = null;
  let hailCool = 14;
  const ring: number[] = [];
  const endRide = (key: CityNote | null, n = 0, m = 0) => {
    if (ride?.stage === 'ride') {
      car.door(tmp);
      people.alight(tmp.x, tmp.z, car.position.x, car.position.z);
    } else if (ride) {
      people.dismiss(ride.slot);
    }
    ride = null;
    state.fare = null;
    hailCool = 25 + Math.random() * 20;
    if (key) note(key, n, m);
  };
  /** Someone at a kerb 50–140 m off, ahead of the car if possible, wanting to go somewhere 350 m – 2.2 km away. */
  const offerFare = () => {
    const fx = Math.sin(car.yaw); const fz = Math.cos(car.yaw);
    graph.within(car.position.x, car.position.z, 50, 140, ring);
    for (let tries = 0; tries < 40 && ring.length; tries++) {
      const n = graph.nodes[ring[Math.floor(Math.random() * ring.length)]];
      if (!n.out.length) continue;
      const dx = n.x - car.position.x; const dz = n.z - car.position.z;
      const dist = Math.hypot(dx, dz);
      if (tries < 25 && (dx * fx + dz * fz) / dist < 0.3) continue;
      // The kerb: off to the right of one of the streets through the node.
      const e = graph.edges[n.out[0]];
      const B = graph.nodes[e.b];
      const L = Math.hypot(B.x - n.x, B.z - n.z) || 1;
      const side = e.lane + 3.2;
      const kx = n.x - ((B.z - n.z) / L) * side; const kz = n.z + ((B.x - n.x) / L) * side;
      if (d.blocked(kx, kz)) continue;
      const options = d.places.filter((p) => { const k = Math.hypot(p.x - kx, p.z - kz); return k > 350 && k < 2200; });
      if (!options.length) continue;
      const dest = options[Math.floor(Math.random() * options.length)];
      const r = graph.route(n.x, n.z, dest.x, dest.z);
      if (!r || r.length < 300) continue;
      // The drop-off is where the streets come nearest the place.
      const drop = { x: r.pts[r.pts.length - 2], z: r.pts[r.pts.length - 1] };
      if (Math.hypot(drop.x - dest.x, drop.z - dest.z) > 160) continue;
      const slot = people.hail(kx, kz, n.x, n.z);
      if (slot < 0) return;
      ride = { stage: 'pickup', slot, dest, drop, fare: fareFor(r.length), timeLeft: 0, knocks: 0, age: 0, hailX: kx, hailZ: kz };
      note('hail');
      return;
    }
    hailCool = 6;
  };
  const updateRide = (dt: number) => {
    const driving = d.driving();
    if (!ride) {
      if (driving && wanted.stars === 0 && state.busted <= 0) {
        hailCool -= dt;
        if (hailCool <= 0) offerFare();
      }
      state.fare = null;
      return;
    }
    ride.age += dt;
    const speed = Math.abs(car.speed);
    if (ride.stage === 'pickup') {
      const p = people.at(ride.slot);
      // Gone (frightened off, walked on), forgotten, or left far behind: the offer lapses.
      if (!p || p.mode !== 'hail' || ride.age > 75 || Math.hypot(p.x - crew.x, p.z - crew.z) > 320) { endRide(null); return; }
      if (wanted.stars > 0) { endRide(null); return; }
      if (driving && Math.hypot(p.x - car.position.x, p.z - car.position.z) < car.spec.width / 2 + 5 && speed < 2.5) {
        people.release(ride.slot);
        ride.stage = 'ride';
        ride.timeLeft = ride.fare.allowed;
        note('pickedUp');
      }
    } else {
      ride.timeLeft -= dt;
      if (!driving) { endRide('fareLeft'); return; }
      if (wanted.stars > 0) { endRide('fareScared'); return; }
      if (Math.hypot(ride.drop.x - car.position.x, ride.drop.z - car.position.z) < 18 && speed < 2.5) {
        const { pay, tip } = farePay(ride.fare, ride.timeLeft, ride.knocks);
        state.cash += pay + tip;
        state.fares += 1;
        persist();
        const late = ride.timeLeft <= 0;
        endRide(late ? 'fareLate' : 'fareDone', pay, tip);
        return;
      }
    }
    if (ride) {
      state.fare = {
        stage: ride.stage, dest: ride.dest.id, timeLeft: Math.max(0, ride.timeLeft), base: ride.fare.base,
        remaining: state.route && state.target ? routeLeft : Math.hypot((ride.stage === 'pickup' ? ride.hailX : ride.drop.x) - crew.x, (ride.stage === 'pickup' ? ride.hailZ : ride.drop.z) - crew.z),
      };
    }
  };

  // ── The GPS. ──
  let routeFor = { x: NaN, z: NaN };
  let replan = 0;
  let routeLength = 0;
  let routeLeft = 0;
  const updateRoute = (dt: number) => {
    let target: CityState['target'] = null;
    if (ride) target = ride.stage === 'pickup' ? { x: ride.hailX, z: ride.hailZ, kind: 'pickup' } : { x: ride.drop.x, z: ride.drop.z, kind: 'dropoff' };
    else if (state.waypoint) target = { x: state.waypoint.x, z: state.waypoint.z, kind: 'waypoint' };
    state.target = target;
    if (state.waypoint && !ride && Math.hypot(state.waypoint.x - crew.x, state.waypoint.z - crew.z) < 25) {
      state.waypoint = null; state.target = null;
      note('arrived');
    }
    const t = state.target;
    if (!t || Math.hypot(t.x - crew.x, t.z - crew.z) < 30) {
      if (state.route) { state.route = null; state.routeSerial += 1; }
      routeFor = { x: NaN, z: NaN };
      return;
    }
    replan -= dt;
    const moved = Math.hypot(t.x - routeFor.x, t.z - routeFor.z) > 10 || Number.isNaN(routeFor.x);
    let off = 0;
    if (state.route) {
      const rd = routeDistance(state.route, crew.x, crew.z);
      off = rd.off;
      routeLeft = Math.max(0, routeLength - rd.along) + Math.hypot(t.x - state.route[state.route.length - 2], t.z - state.route[state.route.length - 1]);
    }
    if (moved || (replan <= 0 && (off > 22 || !state.route))) {
      replan = 1.5;
      routeFor = { x: t.x, z: t.z };
      const r = graph.route(crew.x, crew.z, t.x, t.z);
      state.route = r ? r.pts : null;
      routeLength = r ? r.length : 0;
      routeLeft = routeLength;
      state.routeSerial += 1;
    }
  };

  // ── The arrest. ──
  let sentBack = false;
  const busted = (place: (x: number, y: number, z: number) => void) => {
    if (!sentBack && state.busted <= 2.2) {
      sentBack = true;
      if (d.driving()) d.exit();
      const { x, z } = d.release;
      place(x, d.floorAt(x, z), z);
    }
  };

  const target = { x: 0, z: 0, vx: 0, vz: 0, driving: false, speed: 0 };
  let lastHealth = car.health;
  const take = (id: number) => {
    const c = traffic.take(id);
    if (!c) return;
    // The car being left is parked where it stands, to be come back to.
    traffic.park(car.position.x, car.position.z, car.yaw, car.kind, car.paint, car.health);
    car.restyle(c.kind, c.colour, c.health);
    car.place(c.x, c.z, c.yaw);
    lastHealth = car.health;
    d.enter();
    if (!c.parked) {
      // The driver is pulled out of their door and runs.
      car.door(tmp);
      people.fleer(tmp.x, tmp.z, car.position.x, car.position.z);
      const witnessed = people.witnesses(c.x, c.z, 25) > 0 || policeNear(c.x, c.z, 90);
      crime(c.kind === 'police' ? 'jackPolice' : 'jack', witnessed, c.x, c.z);
      if (wanted.stars === 0) note('jacked');
    }
    ambience.crash(0.05);
  };

  const street: Street = {
    state,
    interactables: [{
      id: 'takeCar', priority: 2, mode: 'foot',
      where: () => {
        takeId = traffic.nearest(crew.x, crew.z, 3.4, 6);
        const c = takeId >= 0 ? traffic.info(takeId) : null;
        return c ? { x: c.x, z: c.z, r: 4.6 } : null;
      },
      kind: () => 'tap',
      label: () => {
        const c = takeId >= 0 ? traffic.info(takeId) : null;
        return !c ? 'drive' : c.parked ? 'drive' : c.kind === 'police' ? 'jackPolice' : 'jack';
      },
      use: () => { if (takeId >= 0 && state.busted <= 0) take(takeId); },
    }],
    afterDrive() {
      const speed = car.speed;
      if (lastHealth > 0 && car.health <= 0) note('wrecked');
      lastHealth = car.health;
      for (const imp of car.impacts) {
        const m = imp.c as (Mover | null);
        if (imp.speed > 4) ambience.crash(Math.min(1, imp.speed / 16));
        if (ride?.stage === 'ride' && imp.speed > 5) ride.knocks += 1;
        if (!m || m.id === undefined) continue;
        if (m.id >= POLICE_ID) {
          if (imp.speed > 5) crime('ramPolice', true, m.x, m.z);
        } else if (imp.speed > 3) {
          const dx = m.x - car.position.x; const dz = m.z - car.position.z;
          const L = Math.hypot(dx, dz) || 1;
          const push = Math.min(2.2, imp.speed * 0.16);
          traffic.shove(m.id, (dx / L) * push, (dz / L) * push);
        }
      }
      const hit = people.hit(car.position.x, car.position.z, car.yaw, speed, car.spec.width / 2, car.spec.length / 2);
      if (hit > 0) {
        ambience.crash(0.3);
        crime('hitPerson', true, car.position.x, car.position.z);
        if (ride?.stage === 'ride') ride.knocks += 4;
      }
    },
    policeMovers: (out) => police.movers(out),
    update(dt, at, night, obstacles, place) {
      crew.x = at.x; crew.z = at.z;
      const driving = d.driving();
      // ── The police. ──
      target.x = crew.x; target.z = crew.z;
      target.driving = driving;
      target.vx = driving ? Math.sin(car.yaw) * car.speed : 0; target.vz = driving ? Math.cos(car.yaw) * car.speed : 0;
      target.speed = driving ? Math.abs(car.speed) : 0;
      const sense = police.update(dt, target, wanted.stars, night, obstacles);
      if (state.busted > 0) {
        state.busted = Math.max(0, state.busted - dt);
        busted(place);
      } else {
        const result = tickWanted(wanted, dt, { seen: sense.seen, cornered: sense.cornered, x: crew.x, z: crew.z });
        if (result === 'cleared') { police.standDown(crew.x, crew.z); note('lost'); }
        else if (result === 'busted') {
          police.standDown(crew.x, crew.z);
          const fine = Math.min(state.cash, fineFor(state.cash));
          state.cash -= fine;
          persist();
          state.busted = 4.5;
          sentBack = false;
          if (ride) endRide(null);
          note('busted', fine);
        }
      }
      state.stars = wanted.stars; state.evade = wanted.evade; state.bust = wanted.bust;
      ambience.siren(wanted.stars > 0 && Number.isFinite(sense.nearest) ? Math.max(0, 1 - sense.nearest / 240) : 0);
      police.positions(state.police);

      // ── The car, the fare, the way. ──
      state.carHealth = driving ? car.health : -1;
      state.px = crew.x; state.pz = crew.z; state.yaw = driving ? car.yaw : NaN;
      state.parked = driving ? null : { x: car.position.x, z: car.position.z };
      updateRide(dt);
      updateRoute(dt);
      // The radio plays while at the wheel.
      const want = driving && state.busted <= 0 ? tuned : -1;
      if (radio.station !== want) { radio.set(want); state.radio = want; state.radioSerial += 1; }
      radio.update();
      if (!driving) ambience.horn(false);
    },
    frozen: () => state.busted > 2.2,
    horn(on) { ambience.horn(on && d.driving()); },
    radioNext() {
      tuned = tuned + 1 >= STATIONS.length ? -1 : tuned + 1;
      if (d.driving()) { radio.set(tuned); state.radio = tuned; state.radioSerial += 1; }
    },
    // Set from the map, while the world is held still: the way is found at once, so the map can show it.
    setWaypoint(x, z) { state.waypoint = { x, z }; updateRoute(0); },
    clearWaypoint() { state.waypoint = null; updateRoute(0); },
    map() {
      const roads: CityMap['roads'] = [];
      for (const r of d.data.roads) {
        if (r.tunnel || r.cls > ROAD.pedestrian || r.pts.length < 2) continue;
        if (!r.pts.some(([x, z]) => Math.hypot(x, z) < ROAD_REACH)) continue;
        const pts = new Float32Array(r.pts.length * 2);
        r.pts.forEach(([x, z], i) => { pts[i * 2] = x; pts[i * 2 + 1] = z; });
        roads.push({ cls: r.cls, pts });
      }
      const water: Float32Array[] = [];
      for (const w of d.data.water) for (const ring of w.rings) {
        if (ring.inner || ring.pts.length < 3) continue;
        const pts = new Float32Array(ring.pts.length * 2);
        ring.pts.forEach(([x, z], i) => { pts[i * 2] = x; pts[i * 2 + 1] = z; });
        water.push(pts);
      }
      return { roads, water, places: d.places, reach: ROAD_REACH };
    },
    crime: (c) => crime(c, true, crew.x, crew.z),
    carTo: (x, z, yaw) => car.place(x, z, yaw),
    dispose() { radio.dispose(); },
  };
  return street;
}
