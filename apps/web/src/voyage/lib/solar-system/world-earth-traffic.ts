// Traffic on Tbilisi's streets (world-earth-roads). Cars keep to the right,
// take a turning at a junction, slow for the bend, keep a gap to the car in
// front, and stop for the pilot, the pilot's car and anyone in the road —
// and lean on the horn if made to wait. Rammed, a car is knocked aside and
// sits there a moment. They appear out of sight round the crew and go again
// once the crew has left them behind.
//
// Any of them can be taken: the driver gets out and runs (world-earth), and
// the car goes on as the pilot's. A car the pilot leaves stands parked where
// it was left until the crew is far away.
//
// Four bodies (world-earth-carshape) — a hatchback, a saloon, the yellow
// marshrutka and a patrol car — each one instanced mesh with its lamps in a
// second, so the whole of the traffic is eight draw calls.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ROAD } from '@/voyage/lib/solar-system/world-earth-data';
import type { RoadGraph } from '@/voyage/lib/solar-system/world-earth-roads';
import { mergedCar, type CarKind } from '@/voyage/lib/solar-system/world-earth-carshape';
import { withHaze } from '@/voyage/lib/solar-system/world-earth-haze';
import type { Mover } from '@/voyage/lib/solar-system/world-earth-people';

export interface TrafficCar {
  x: number; z: number; y: number; yaw: number; speed: number;
  kind: CarKind; colour: THREE.Color; health: number; parked: boolean;
}

export interface TrafficHandle {
  group: THREE.Group;
  /** Cars near a point, moving and parked, as circles; each carries its `id`. */
  movers: (x: number, z: number, r: number, out: Mover[]) => Mover[];
  /** The car nearest a point within `r` going no faster than `maxSpeed`, or −1. */
  nearest: (x: number, z: number, r: number, maxSpeed: number) => number;
  info: (id: number) => TrafficCar | null;
  /** Off the street and into the pilot's hands: the car is gone from the traffic. */
  take: (id: number) => TrafficCar | null;
  /** Leave a car standing here; its id, or −1 when there is no room. */
  park: (x: number, z: number, yaw: number, kind: CarKind, colour: THREE.Color, health: number) => number;
  /** A knock: the car is pushed aside by this much and stops a while. */
  shove: (id: number, dx: number, dz: number) => void;
  /** Called with where a horn sounded. */
  onHonk: ((x: number, z: number) => void) | null;
  update: (dt: number, crewX: number, crewZ: number, obstacles: Mover[], night: number, floorAt: (x: number, z: number) => number) => void;
  dispose: () => void;
}

const CARS = 30;
const PARKED = 6;
const NEAR = 650;
const PARK_KEEP = 900;
const KINDS: CarKind[] = ['hatch', 'saloon', 'van', 'police'];
const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
const PAINT = [srgb(0.92, 0.92, 0.9), srgb(0.08, 0.08, 0.09), srgb(0.6, 0.62, 0.64), srgb(0.55, 0.08, 0.08), srgb(0.14, 0.22, 0.4), srgb(0.78, 0.76, 0.7), srgb(0.2, 0.2, 0.22), srgb(0.3, 0.36, 0.3)];
const MARSHRUTKA = srgb(0.95, 0.72, 0.1);
const hash = (n: number) => { const s = Math.sin(n * 91.3 + 17.1) * 43758.5453; return s - Math.floor(s); };

interface Car extends TrafficCar {
  active: boolean; edge: number; s: number;
  /** Knocked aside: an offset from the lane that eases back, and seconds stood still. */
  ox: number; oz: number; wait: number;
  /** Seconds held up behind something that will not move, and until the horn may go again. */
  held: number; hornAt: number;
}

export function makeTraffic(graph: RoadGraph, lite: boolean): TrafficHandle {
  const group = new THREE.Group();
  group.name = 'earth-traffic';
  const { nodes, edges } = graph;

  // ── Bodies. ──
  const merge = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs, false);
  const shapes = KINDS.map((k) => mergedCar(k, lite, merge));
  const bodyMat = withHaze(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.45 }), 'traffic');
  const lampMat = new THREE.MeshBasicMaterial({ vertexColors: true, color: 0x111111 });
  const total = CARS + PARKED;
  const bodies = shapes.map((k) => {
    const m = new THREE.InstancedMesh(k.body, bodyMat, total);
    m.castShadow = !lite; m.receiveShadow = true; m.count = 0;
    m.boundingSphere = new THREE.Sphere();
    group.add(m);
    return m;
  });
  const lamps = shapes.map((k) => {
    const m = new THREE.InstancedMesh(k.lamps, lampMat, total);
    m.count = 0;
    m.boundingSphere = new THREE.Sphere();
    group.add(m);
    return m;
  });

  const fresh = (i: number): Car => {
    const kind: CarKind = hash(i) < 0.12 ? 'van' : hash(i) < 0.5 ? 'saloon' : 'hatch';
    return {
      active: false, edge: 0, s: 0, speed: 0, kind, health: 1, parked: false,
      colour: kind === 'van' ? MARSHRUTKA.clone() : PAINT[Math.floor(hash(i + 5) * PAINT.length)].clone(),
      x: 0, z: 0, y: 0, yaw: 0, ox: 0, oz: 0, wait: 0, held: 0, hornAt: 0,
    };
  };
  const cars: Car[] = Array.from({ length: CARS }, (_, i) => fresh(i));
  const parked: Car[] = Array.from({ length: PARKED }, () => ({ ...fresh(0), parked: true }));
  const all = (id: number): Car | null => (id >= 0 && id < CARS ? cars[id] : id >= CARS && id < total ? parked[id - CARS] : null);
  let spawned = 0;

  const limit = (cls: number) => (cls <= ROAD.primary ? 15 : cls <= ROAD.tertiary ? 12 : cls === ROAD.residential ? 8 : 5);
  const pose = (c: Car, dt: number) => {
    const e = edges[c.edge];
    const A = nodes[e.a]; const B = nodes[e.b];
    const t = Math.min(1, c.s / (e.len || 1));
    const dx = (B.x - A.x) / (e.len || 1); const dz = (B.z - A.z) / (e.len || 1);
    // Keep right: the car's right, facing along the edge, is (−dz, dx).
    c.x = A.x + (B.x - A.x) * t - dz * e.lane + c.ox;
    c.z = A.z + (B.z - A.z) * t + dx * e.lane + c.oz;
    const want = Math.atan2(dx, dz);
    let d = want - c.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    // Fresh off a spawn the nose snaps to the road; on the move it comes round at a fixed rate in time, not frames.
    c.yaw += d * (dt < 0 ? 1 : 1 - Math.exp(-dt * 17));
  };
  const spawn = (c: Car, i: number, cx: number, cz: number) => {
    for (let tries = 0; tries < 12; tries++) {
      const edge = Math.floor(Math.random() * edges.length);
      const A = nodes[edges[edge].a];
      const d = Math.hypot(A.x - cx, A.z - cz);
      if (d < 120 || d > 520) continue;
      // A new car each time, in a new colour.
      Object.assign(c, fresh(i * 7 + (spawned++) * 13));
      c.edge = edge; c.s = 0; c.speed = limit(edges[edge].cls) * 0.7; c.active = true;
      const e = edges[edge];
      c.yaw = Math.atan2(nodes[e.b].x - A.x, nodes[e.b].z - A.z);
      pose(c, -1);
      return;
    }
  };
  const next = (c: Car) => {
    const e = edges[c.edge];
    const options = nodes[e.b].out.filter((o) => edges[o].b !== e.a);
    const pool = options.length ? options : nodes[e.b].out;
    if (!pool.length) { c.active = false; return; }
    // Mostly straight on, sometimes a turning.
    const dx = nodes[e.b].x - nodes[e.a].x; const dz = nodes[e.b].z - nodes[e.a].z;
    let best = pool[0]; let bestScore = -Infinity;
    for (const o of pool) {
      const f = edges[o];
      const fx = nodes[f.b].x - nodes[f.a].x; const fz = nodes[f.b].z - nodes[f.a].z;
      const straight = (dx * fx + dz * fz) / ((Math.hypot(dx, dz) * Math.hypot(fx, fz)) || 1);
      const score = straight + Math.random() * 1.1;
      if (score > bestScore) { bestScore = score; best = o; }
    }
    c.s -= e.len;
    c.edge = best;
  };
  const info = (c: Car): TrafficCar => ({ x: c.x, z: c.z, y: c.y, yaw: c.yaw, speed: c.speed, kind: c.kind, colour: c.colour.clone(), health: c.health, parked: c.parked });

  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const p = new THREE.Vector3(); const one = new THREE.Vector3(1, 1, 1);
  const up = new THREE.Vector3(0, 1, 0);
  // One circle per car, written in place: a query hands back the same objects every frame.
  const moverPool: Mover[] = Array.from({ length: total }, (_, i) => ({ x: 0, z: 0, vx: 0, vz: 0, r: 1.9, id: i }));
  const radius = (c: Car) => (c.kind === 'van' ? 2.4 : c.kind === 'hatch' ? 1.9 : 2.1);
  let clock = 0;
  const handle: TrafficHandle = {
    group,
    onHonk: null,
    movers(x, z, r, out) {
      out.length = 0;
      for (let i = 0; i < total; i++) {
        const c = all(i)!;
        if (!c.active || Math.abs(c.x - x) > r || Math.abs(c.z - z) > r) continue;
        const m = moverPool[i];
        m.x = c.x; m.z = c.z; m.vx = Math.sin(c.yaw) * c.speed; m.vz = Math.cos(c.yaw) * c.speed; m.r = radius(c);
        out.push(m);
      }
      return out;
    },
    nearest(x, z, r, maxSpeed) {
      let best = -1; let bd = r;
      for (let i = 0; i < total; i++) {
        const c = all(i)!;
        if (!c.active || Math.abs(c.speed) > maxSpeed) continue;
        const d = Math.hypot(c.x - x, c.z - z) - radius(c) * 0.6;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    },
    info: (id) => { const c = all(id); return c && c.active ? info(c) : null; },
    take(id) {
      const c = all(id);
      if (!c || !c.active) return null;
      const out = info(c);
      c.active = false;
      return out;
    },
    park(x, z, yaw, kind, colour, health) {
      // The oldest-placed slot goes if every one is taken.
      let slot = parked.findIndex((c) => !c.active);
      if (slot < 0) slot = 0;
      const c = parked[slot];
      Object.assign(c, { active: true, parked: true, x, z, yaw, speed: 0, kind, health, ox: 0, oz: 0, wait: 0 });
      c.colour.copy(colour);
      // Keep the slots in placing order, so slot 0 is always the oldest.
      parked.splice(slot, 1);
      parked.push(c);
      return CARS + PARKED - 1;
    },
    shove(id, dx, dz) {
      const c = all(id);
      if (!c || !c.active) return;
      if (c.parked) { c.x += dx; c.z += dz; return; }
      c.ox += dx; c.oz += dz;
      c.speed = 0;
      c.wait = 2.5 + Math.random() * 1.5;
      if (clock > c.hornAt) { c.hornAt = clock + 4; handle.onHonk?.(c.x, c.z); }
    },
    update(dt, cx, cz, obstacles, night, floorAt) {
      if (!edges.length) return;
      clock += dt;
      const counts = [0, 0, 0, 0];
      const draw = (c: Car) => {
        const v = KINDS.indexOf(c.kind);
        const k = counts[v]++;
        q.setFromAxisAngle(up, c.yaw);
        m4.compose(p.set(c.x, c.y, c.z), q, one);
        bodies[v].setMatrixAt(k, m4);
        bodies[v].setColorAt(k, c.colour);
        lamps[v].setMatrixAt(k, m4);
      };
      for (const c of parked) {
        if (!c.active) continue;
        if (Math.hypot(c.x - cx, c.z - cz) > PARK_KEEP) { c.active = false; continue; }
        c.y = floorAt(c.x, c.z);
        draw(c);
      }
      for (let i = 0; i < CARS; i++) {
        const c = cars[i];
        if (!c.active) { spawn(c, i, cx, cz); if (!c.active) continue; }
        if (Math.hypot(c.x - cx, c.z - cz) > NEAR) { c.active = false; continue; }
        const e = edges[c.edge];
        let target = limit(e.cls);
        // Slow for the bend at the end of this stretch.
        const remain = e.len - c.s;
        if (remain < 18) target = Math.min(target, 5 + remain * 0.4);
        const fx = Math.sin(c.yaw); const fz = Math.cos(c.yaw);
        const gap = (x: number, z: number, r: number) => {
          const dx = x - c.x; const dz = z - c.z;
          const along = dx * fx + dz * fz;
          const across = Math.abs(dx * fz - dz * fx);
          return along > 0 && across < 1.8 + r ? along - r : Infinity;
        };
        let clear = Infinity;
        for (const o of cars) if (o !== c && o.active) clear = Math.min(clear, gap(o.x, o.z, 2.2));
        for (const o of parked) if (o.active) clear = Math.min(clear, gap(o.x, o.z, 2.2));
        let blocker = Infinity;
        for (const o of obstacles) blocker = Math.min(blocker, gap(o.x, o.z, o.r));
        clear = Math.min(clear, blocker);
        // A gap of two seconds, and a full stop short of anything in the road.
        if (clear < 4) target = 0;
        else if (clear < 4 + c.speed * 2) target = Math.min(target, (clear - 4) / 2);
        // Knocked: stand a moment, and ease back into the lane.
        if (c.wait > 0) { c.wait -= dt; target = 0; }
        const ease = 1 - Math.exp(-dt * 0.7);
        c.ox -= c.ox * ease; c.oz -= c.oz * ease;
        const accel = target > c.speed ? 2.2 : 6.5;
        c.speed += Math.max(-accel * dt, Math.min(accel * dt, target - c.speed));
        // Held up by the pilot, or by the pilot's car, for long enough: the horn.
        if (blocker < 8 && c.speed < 0.5 && c.wait <= 0) c.held += dt; else c.held = Math.max(0, c.held - dt * 2);
        if (c.held > 2.5 && clock > c.hornAt) { c.hornAt = clock + 5 + Math.random() * 4; handle.onHonk?.(c.x, c.z); }
        c.s += c.speed * dt;
        while (c.active && c.s >= edges[c.edge].len) next(c);
        if (!c.active) continue;
        pose(c, dt);
        c.y = floorAt(c.x, c.z);
        draw(c);
      }
      // Every live car is within NEAR of the crew, parked ones within PARK_KEEP: one sphere there bounds the mesh.
      for (let v = 0; v < KINDS.length; v++) {
        bodies[v].boundingSphere!.set(p.set(cx, floorAt(cx, cz), cz), PARK_KEEP + 8);
        lamps[v].boundingSphere!.copy(bodies[v].boundingSphere!);
        bodies[v].count = counts[v]; lamps[v].count = counts[v];
        bodies[v].instanceMatrix.needsUpdate = true; lamps[v].instanceMatrix.needsUpdate = true;
        const colours = bodies[v].instanceColor;
        if (colours) colours.needsUpdate = true;
      }
      // Lamps are dark by day and burn at night.
      lampMat.color.setScalar(0.07 + night * 2.2);
    },
    dispose() {
      for (const k of shapes) { k.body.dispose(); k.lamps.dispose(); }
      for (const m of [...bodies, ...lamps]) m.dispose();
      bodyMat.dispose(); lampMat.dispose();
    },
  };
  return handle;
}
