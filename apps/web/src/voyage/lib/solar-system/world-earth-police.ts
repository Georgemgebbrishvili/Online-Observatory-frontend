// Tbilisi's patrol police. While the pilot is wanted, patrol cars come in
// from out of sight — one at a star, up to four — with the light bar going.
// Far off they drive the streets (the road graph's shortest way to the
// pilot, worked out again every couple of seconds); with the pilot in sight
// they go straight for them, and from three stars they ram. A patrol that
// sticks against a wall backs off and tries again. When the pilot gets away,
// or is caught, they switch off and drive on, and are gone once out of sight.
//
// Each patrol car is the same car the pilot drives (world-earth-car), steered
// by a small controller, so they skid, climb and crash by the same rules.

import * as THREE from 'three';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import { makeCar, POLICE_WHITE, type CarHandle, type CarInput, type CarWorld } from '@/voyage/lib/solar-system/world-earth-car';
import { routeDistance, type RoadGraph } from '@/voyage/lib/solar-system/world-earth-roads';
import type { Mover } from '@/voyage/lib/solar-system/world-earth-people';
import { unitsFor } from '@/voyage/lib/solar-system/world-earth-rules';

/** Mover ids at and above this are patrol cars. */
export const POLICE_ID = 1000;
const UNITS = 4;
const SIGHT = 75;
const STEP = 1 / 60;

export interface PoliceWorld {
  graph: RoadGraph;
  car: Omit<CarWorld, 'colliders'>;
  /** No building between the two points. */
  lineClear: (ax: number, az: number, bx: number, bz: number) => boolean;
}

export interface PoliceTarget {
  x: number; z: number; vx: number; vz: number;
  /** At the wheel (a car to box in) or on foot (someone to stop beside). */
  driving: boolean;
  speed: number;
}

export interface PoliceSense { seen: boolean; cornered: boolean; nearest: number; units: number }

export interface PoliceHandle {
  group: THREE.Group;
  /** The patrol cars as circles, ids from POLICE_ID. */
  movers: (out: Mover[]) => Mover[];
  update: (dt: number, target: PoliceTarget, stars: number, night: number, obstacles: Collider[]) => PoliceSense;
  /** Lights off, and on their way, away from the pilot at (x, z). */
  standDown: (x: number, z: number) => void;
  /** Where the active patrol cars are: x, z pairs. */
  positions: (out: number[]) => number[];
  dispose: () => void;
}

interface Unit {
  car: CarHandle;
  active: boolean;
  leaving: boolean;
  route: Float32Array | null;
  replan: number;
  stuck: number;
  reverse: number;
  reverseSteer: number;
  idle: number;
  sees: boolean;
  /** Seconds since this one last saw the pilot. */
  lost: number;
}

const wrap = (a: number) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export function makePolice(world: PoliceWorld, lite: boolean): PoliceHandle {
  const group = new THREE.Group();
  group.name = 'earth-police';
  const units: Unit[] = [];
  for (let i = 0; i < UNITS; i++) {
    const car = makeCar(0, 0, 0, world.car.floorAt, lite, 'police', POLICE_WHITE);
    car.group.name = 'police-car';
    car.toughness = 3.5;
    car.group.visible = false;
    group.add(car.group, car.fx);
    units.push({ car, active: false, leaving: false, route: null, replan: 0, stuck: 0, reverse: 0, reverseSteer: 0, idle: 0, sees: false, lost: 0 });
  }
  const moverPool: Mover[] = units.map((_, i) => ({ x: 0, z: 0, vx: 0, vz: 0, r: 2.1, id: POLICE_ID + i }));
  const hits: Collider[] = [];
  const carWorld: CarWorld = { ...world.car, colliders: () => hits };
  const input: CarInput = { throttle: 0, steer: 0, handbrake: false };
  let spawnCool = 0;
  let sightT = 0;
  const aim = { x: 0, z: 0 };
  const ring: number[] = [];

  /** A road node 150–280 m from the pilot, out of their sight if one can be found. */
  const spawn = (u: Unit, t: PoliceTarget) => {
    const { nodes } = world.graph;
    world.graph.within(t.x, t.z, 150, 280, ring);
    let pick = -1;
    for (let tries = 0; tries < 30 && ring.length; tries++) {
      const n = ring[Math.floor(Math.random() * ring.length)];
      const N = nodes[n];
      pick = n;
      if (!world.lineClear(N.x, N.z, t.x, t.z)) break;
    }
    if (pick < 0) return false;
    const N = nodes[pick];
    u.car.restyle('police', POLICE_WHITE);
    u.car.place(N.x, N.z, Math.atan2(t.x - N.x, t.z - N.z), 8);
    u.car.siren = true;
    u.car.group.visible = true;
    Object.assign(u, { active: true, leaving: false, route: null, replan: 0, stuck: 0, reverse: 0, idle: 0, sees: false, lost: 0 });
    return true;
  };

  /** A point to drive at, ahead along the route. */
  const along = (route: Float32Array, x: number, z: number, ahead: number) => {
    const { along: at } = routeDistance(route, x, z);
    let run = 0;
    for (let i = 0; i + 3 < route.length; i += 2) {
      const L = Math.hypot(route[i + 2] - route[i], route[i + 3] - route[i + 1]);
      if (run + L >= at + ahead) {
        const k = (at + ahead - run) / (L || 1);
        aim.x = route[i] + (route[i + 2] - route[i]) * k; aim.z = route[i + 1] + (route[i + 3] - route[i + 1]) * k;
        return aim;
      }
      run += L;
    }
    aim.x = route[route.length - 2]; aim.z = route[route.length - 1];
    return aim;
  };

  const drive = (u: Unit, i: number, dt: number, t: PoliceTarget, stars: number, obstacles: Collider[]) => {
    const c = u.car;
    const d = Math.hypot(t.x - c.position.x, t.z - c.position.z);
    // ── Where to go. ──
    let tx: number; let tz: number;
    if (u.leaving) {
      // On their way: on along the road they are on.
      tx = c.position.x + Math.sin(c.yaw) * 40; tz = c.position.z + Math.cos(c.yaw) * 40;
      if (u.route) { const a = along(u.route, c.position.x, c.position.z, 16); tx = a.x; tz = a.z; }
    } else if (u.sees && d < 60) {
      // In sight: straight for them, a little ahead of where they are going.
      const lead = Math.min(1.2, d / 25);
      tx = t.x + t.vx * lead; tz = t.z + t.vz * lead;
    } else if (u.route) {
      const a = along(u.route, c.position.x, c.position.z, 16);
      tx = a.x; tz = a.z;
    } else {
      tx = t.x; tz = t.z;
    }
    const want = Math.atan2(tx - c.position.x, tz - c.position.z);
    const err = wrap(want - c.yaw);
    // ── How fast. ──
    const top = u.leaving ? 11 : 20 + stars * 3.2;
    let throttle = 1;
    if (c.speed > top) throttle = -0.3;
    // Brake into a sharp turn.
    if (Math.abs(err) > 1.1 && c.speed > 9) throttle = -0.7;
    let handbrake = Math.abs(err) > 1.6 && c.speed > 7;
    if (!u.leaving) {
      if (!t.driving && d < 11) {
        // Someone on foot: pull up beside them.
        throttle = c.speed > 0.5 ? -Math.min(1, c.speed / 4) : 0;
        handbrake = false;
      } else if (t.driving && d < 9 && t.speed < 3) {
        // A stopped car: box it in and hold (from three stars they ram it while it moves).
        throttle = c.speed > 0.5 ? -1 : 0;
      }
    }
    let steer = THREE.MathUtils.clamp(-err * 2.2, -1, 1);
    // Backing up: reverse with the wheel the other way, out of whatever it hit.
    if (u.reverse > 0) {
      u.reverse -= dt;
      throttle = -1; steer = u.reverseSteer; handbrake = false;
    } else if (throttle > 0.4 && Math.abs(c.speed) < 1.2) {
      u.stuck += dt;
      if (u.stuck > 1.2) { u.stuck = 0; u.reverse = 1.1 + Math.random() * 0.6; u.reverseSteer = err > 0 ? 1 : -1; u.idle += 1.2; }
    } else {
      u.stuck = Math.max(0, u.stuck - dt);
      if (Math.abs(c.speed) > 4) u.idle = Math.max(0, u.idle - dt * 0.5);
    }
    input.throttle = throttle; input.steer = steer; input.handbrake = handbrake;
    // ── What it can hit: the pilot, the traffic and people, and the other patrols. ──
    hits.length = 0;
    for (const o of obstacles) if (Math.abs(o.x - c.position.x) < 12 && Math.abs(o.z - c.position.z) < 12) hits.push(o);
    for (let k = 0; k < units.length; k++) if (k !== i && units[k].active) hits.push(moverPool[k]);
    c.update(dt, input, carWorld, nightNow);
  };

  let nightNow = 0;
  const standDown = (px: number, pz: number) => {
    for (const u of units) {
      if (!u.active || u.leaving) continue;
      u.leaving = true;
      u.car.siren = false;
      u.lost = 0;
      // Somewhere well away to head for.
      const { nodes } = world.graph;
      world.graph.within(u.car.position.x, u.car.position.z, 400, 900, ring);
      for (let tries = 0; tries < 20 && ring.length; tries++) {
        const n = nodes[ring[Math.floor(Math.random() * ring.length)]];
        if (Math.hypot(n.x - u.car.position.x, n.z - u.car.position.z) < 400) continue;
        // Somewhere on the far side of them from the pilot.
        if ((n.x - u.car.position.x) * (u.car.position.x - px) + (n.z - u.car.position.z) * (u.car.position.z - pz) < 0) continue;
        u.route = world.graph.route(u.car.position.x, u.car.position.z, n.x, n.z)?.pts ?? null;
        if (u.route) break;
      }
    }
  };

  return {
    group,
    movers(out) {
      out.length = 0;
      units.forEach((u, i) => {
        if (!u.active) return;
        const m = moverPool[i];
        const c = u.car;
        m.x = c.position.x; m.z = c.position.z; m.vx = Math.sin(c.yaw) * c.speed; m.vz = Math.cos(c.yaw) * c.speed;
        out.push(m);
      });
      return out;
    },
    positions(out) {
      out.length = 0;
      for (const u of units) if (u.active) out.push(u.car.position.x, u.car.position.z);
      return out;
    },
    standDown,
    update(dt, t, stars, night, obstacles) {
      nightNow = night;
      const want = unitsFor(stars);
      let pursuing = 0;
      for (const u of units) if (u.active && !u.leaving) pursuing += 1;
      spawnCool -= dt;
      if (pursuing < want && spawnCool <= 0) {
        const free = units.find((u) => !u.active);
        if (free && spawn(free, t)) spawnCool = 2.5;
        else spawnCool = 0.5;
      }
      // Sight is checked five times a second.
      sightT -= dt;
      const look = sightT <= 0;
      if (look) sightT = 0.2;
      let seen = false; let cornered = false; let nearest = Infinity;
      for (let i = 0; i < units.length; i++) {
        const u = units[i];
        if (!u.active) continue;
        const c = u.car;
        const d = Math.hypot(t.x - c.position.x, t.z - c.position.z);
        if (u.leaving) {
          u.lost += dt;
          if ((d > 160 && u.lost > 4) || u.lost > 40) { u.active = false; c.group.visible = false; c.fx.visible = false; continue; }
        } else {
          if (look) u.sees = d < 22 || (d < SIGHT && world.lineClear(c.position.x, c.position.z, t.x, t.z));
          if (u.sees) { seen = true; u.lost = 0; } else u.lost += dt;
          nearest = Math.min(nearest, d);
          if (d < (t.driving ? 10 : 9) && Math.abs(c.speed) < 4 && t.speed < 2.2) cornered = true;
          // Smashed up: out of the chase, the wreck left where it stands (another is sent).
          if (c.health <= 0) { u.leaving = true; c.siren = false; u.route = null; }
          u.replan -= dt;
          if (u.replan <= 0 && !(u.sees && d < 60)) {
            u.replan = 2 + Math.random();
            u.route = world.graph.route(c.position.x, c.position.z, t.x, t.z)?.pts ?? null;
          }
          // Hopelessly stuck, or left far behind out of sight: brought round again.
          if ((u.idle > 9 || (d > 420 && !u.sees)) && d > 90) { u.active = false; c.group.visible = false; c.fx.visible = false; continue; }
        }
        let left = Math.min(dt, 0.1);
        while (left > 1e-4) {
          const h = Math.min(STEP, left);
          drive(u, i, h, t, stars, obstacles);
          left -= h;
        }
        c.present(1);
      }
      if (stars <= 0) standDown(t.x, t.z);
      let units_ = 0;
      for (const u of units) if (u.active && !u.leaving) units_ += 1;
      return { seen, cornered, nearest, units: units_ };
    },
    dispose() {
      for (const u of units) u.car.dispose();
    },
  };
}
