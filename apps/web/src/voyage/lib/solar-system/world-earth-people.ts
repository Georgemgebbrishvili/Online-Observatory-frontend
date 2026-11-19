// The people of Tbilisi, and the crowd that comes to meet the lander.
//
// Pedestrians walk OpenStreetMap's footways, park paths and pavements near
// the crew, turn at the ends and at the junctions, step aside for the pilot
// and for cars, and are replaced out of sight as the crew moves on. When the
// lander comes down in Rike Park, the people nearby stop what they are doing,
// come across the lawn, stand round at a respectful distance, and wave and
// clap as the pilot steps out; after a while they drift back to their day.
//
// Every body is eight rigid parts, and every part of every person is one
// instanced mesh, so the whole city's people cost eight draw calls.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ROAD, type EarthData, type Pt } from '@/voyage/lib/solar-system/world-earth-data';
import { withHaze } from '@/voyage/lib/solar-system/world-earth-haze';

export interface PeopleWorld {
  floorAt: (x: number, z: number) => number;
  /** Somewhere a person cannot stand: water, inside a building. */
  blocked: (x: number, z: number) => boolean;
}

export interface Mover { x: number; z: number; vx: number; vz: number; r: number; id?: number }

export interface PeopleHandle {
  group: THREE.Group;
  /** The lander is down here: bring the crowd. */
  welcome: (x: number, z: number, faceX: number, faceZ: number) => void;
  /** 0…1: how many of the crowd are standing round cheering. */
  cheering: () => number;
  /** Where people are, for the cars and the crew to avoid. */
  colliders: (x: number, z: number, r: number, out: Mover[]) => Mover[];
  update: (dt: number, crewX: number, crewZ: number, movers: Mover[]) => void;
  /** A car moving through: anyone inside its footprint is knocked down. How many were. */
  hit: (x: number, z: number, yaw: number, speed: number, halfW: number, halfL: number) => number;
  /** Something frightening here: everyone within `r` runs from it. */
  panic: (x: number, z: number, r: number) => void;
  /** Someone who runs from here, away from (fromX, fromZ): a driver pulled out of a car. */
  fleer: (x: number, z: number, fromX: number, fromZ: number) => void;
  /** People standing within `r` who could say what they saw. */
  witnesses: (x: number, z: number, r: number) => number;
  /** Someone at the kerb with an arm up for a ride, facing (faceX, faceZ): their slot, or −1. */
  hail: (x: number, z: number, faceX: number, faceZ: number) => number;
  /** Where a slot's person is and what they are doing, or null once they have gone. */
  at: (slot: number) => { x: number; z: number; mode: string } | null;
  /** Gone from the street (into the car). */
  release: (slot: number) => void;
  /** A hailer who gives up waiting walks off. */
  dismiss: (slot: number) => void;
  /** How high the pilot is off the ground, and whether on foot: people look up at a jetpack, and greet a passer-by. */
  setPilot: (alt: number, onFoot: boolean) => void;
  /** Someone said hello to the pilot: which line. */
  onGreet: ((line: number) => void) | null;
  /** Someone getting out here and walking off, away from (fromX, fromZ). */
  alight: (x: number, z: number, fromX: number, fromZ: number) => void;
  dispose: () => void;
}

type Mode = 'walk' | 'gather' | 'cheer' | 'disperse' | 'idle' | 'down' | 'flee' | 'hail' | 'chat' | 'gawk';
/** Lines a passer-by may say to the pilot (world-earth-street shows them). */
export const GREETINGS = 6;
interface Person {
  x: number; z: number; y: number; yaw: number; speed: number; want: number;
  phase: number; mode: Mode;
  /** Following a path: which, toward which vertex, and in which direction. */
  path: number; at: number; dir: number;
  tx: number; tz: number;
  scale: number; seed: number; timer: number; wave: number; active: boolean;
  /** Knocked down: thrown at (vx, vy, vz), `lift` off the ground, `tilt` 0 standing … −π/2 flat on the back. */
  vx: number; vy: number; vz: number; lift: number; tilt: number;
  /** Stopped to talk: with whom (a slot), and until when they walk on. */
  partner: number;
  chatCool: number;
}

const PEDESTRIANS = 60;
const CROWD = 18;
const NEAR = 380;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
const SHIRTS = [srgb(0.12, 0.14, 0.18), srgb(0.85, 0.85, 0.82), srgb(0.55, 0.12, 0.14), srgb(0.2, 0.32, 0.5), srgb(0.38, 0.42, 0.3), srgb(0.72, 0.6, 0.42), srgb(0.3, 0.3, 0.32), srgb(0.62, 0.3, 0.38)];
const PANTS = [srgb(0.1, 0.12, 0.2), srgb(0.14, 0.14, 0.15), srgb(0.32, 0.3, 0.26), srgb(0.2, 0.28, 0.42)];
const SKIN = [srgb(0.87, 0.7, 0.58), srgb(0.78, 0.6, 0.47), srgb(0.68, 0.5, 0.38)];
const HAIR = [srgb(0.08, 0.06, 0.05), srgb(0.2, 0.14, 0.1), srgb(0.35, 0.33, 0.32), srgb(0.05, 0.05, 0.05)];

export function makePeople(data: EarthData, world: PeopleWorld, lite: boolean): PeopleHandle {
  const group = new THREE.Group();
  group.name = 'earth-people';

  // ── Where people walk: footways and park paths, and the pavements of the smaller streets. ──
  const paths: Pt[][] = [];
  const ends = new Map<string, { path: number; at: number }[]>();
  const key = (p: Pt) => `${Math.round(p[0] / 1.5)},${Math.round(p[1] / 1.5)}`;
  for (const r of data.roads) {
    if (r.tunnel || r.pts.length < 2 || r.cls < ROAD.residential) continue;
    if (!r.pts.some(([x, z]) => Math.hypot(x, z) < 1700)) continue;
    // A street's pavement runs a little to its side.
    const side = r.cls <= ROAD.service ? r.width / 2 + 1.4 : 0;
    const pts: Pt[] = r.pts.map(([x, z], k) => {
      if (!side) return [x, z];
      const a = r.pts[Math.max(0, k - 1)]; const b = r.pts[Math.min(r.pts.length - 1, k + 1)];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [x - ((b[1] - a[1]) / l) * side, z + ((b[0] - a[0]) / l) * side];
    });
    const idx = paths.length;
    paths.push(pts);
    for (const at of [0, pts.length - 1]) {
      const k = key(r.pts[at]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k)!.push({ path: idx, at });
    }
  }

  // ── The body: eight parts, each a unit shape hung from its joint. ──
  const geoms = {
    torso: new RoundedBoxGeometry(0.36, 0.56, 0.21, 2, 0.06).translate(0, 0.28, 0),
    hips: new RoundedBoxGeometry(0.34, 0.2, 0.2, 2, 0.05).translate(0, -0.02, 0),
    head: new THREE.SphereGeometry(0.105, 10, 8).scale(0.9, 1.1, 1).translate(0, 0.12, 0),
    hair: new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(0.93, 1, 1.02).translate(0, 0.135, -0.008),
    legL: new RoundedBoxGeometry(0.13, 0.86, 0.14, 2, 0.05).translate(0, -0.43, 0),
    legR: new RoundedBoxGeometry(0.13, 0.86, 0.14, 2, 0.05).translate(0, -0.43, 0),
    armL: new RoundedBoxGeometry(0.085, 0.62, 0.09, 2, 0.035).translate(0, -0.31, 0),
    armR: new RoundedBoxGeometry(0.085, 0.62, 0.09, 2, 0.035).translate(0, -0.31, 0),
  };
  const total = PEDESTRIANS + CROWD;
  const material = withHaze(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 }), 'people');
  const part = (g: THREE.BufferGeometry) => {
    const m = new THREE.InstancedMesh(g, material, total);
    m.castShadow = !lite; m.receiveShadow = true;
    m.boundingSphere = new THREE.Sphere();
    m.count = 0;
    group.add(m);
    return m;
  };
  const mesh = {
    torso: part(geoms.torso), hips: part(geoms.hips), head: part(geoms.head), hair: part(geoms.hair),
    legL: part(geoms.legL), legR: part(geoms.legR), armL: part(geoms.armL), armR: part(geoms.armR),
  };
  const meshes = [mesh.torso, mesh.hips, mesh.head, mesh.hair, mesh.legL, mesh.legR, mesh.armL, mesh.armR];

  const people: Person[] = [];
  const fresh = (i: number): Person => ({
    x: 0, z: 0, y: 0, yaw: 0, speed: 0, want: 1.2 + hash(i) * 0.4, phase: hash(i + 3) * 6, mode: 'idle',
    path: -1, at: 0, dir: 1, tx: 0, tz: 0, scale: 0.92 + hash(i + 7) * 0.16, seed: i, timer: 0, wave: 0, active: false,
    vx: 0, vy: 0, vz: 0, lift: 0, tilt: 0, partner: -1, chatCool: 5 + hash(i + 51) * 20,
  });
  for (let i = 0; i < total; i++) people.push(fresh(i));
  /** Each person's clothes, skin and hair; written into whichever instance slot they occupy this frame. */
  const looks = people.map((_, i) => ({
    shirt: SHIRTS[Math.floor(hash(i * 3.1) * SHIRTS.length)],
    pants: PANTS[Math.floor(hash(i * 5.7) * PANTS.length)],
    skin: SKIN[Math.floor(hash(i * 7.3) * SKIN.length)],
    hair: HAIR[Math.floor(hash(i * 9.9) * HAIR.length)],
  }));
  const dress = (slot: number, i: number) => {
    const l = looks[i];
    mesh.torso.setColorAt(slot, l.shirt); mesh.armL.setColorAt(slot, l.shirt); mesh.armR.setColorAt(slot, l.shirt);
    mesh.hips.setColorAt(slot, l.pants); mesh.legL.setColorAt(slot, l.pants); mesh.legR.setColorAt(slot, l.pants);
    mesh.head.setColorAt(slot, l.skin); mesh.hair.setColorAt(slot, l.hair);
  };
  for (let i = 0; i < total; i++) dress(i, i);

  /** Put a pedestrian somewhere out of the way on a path, 90–350 m from the crew. */
  const place = (p: Person, cx: number, cz: number) => {
    for (let tries = 0; tries < 20; tries++) {
      const path = Math.floor(Math.random() * paths.length);
      const pts = paths[path];
      if (!pts) return false;
      const at = Math.floor(Math.random() * pts.length);
      const [x, z] = pts[at];
      const d = Math.hypot(x - cx, z - cz);
      if (d < 90 || d > 350 || world.blocked(x, z)) continue;
      p.x = x; p.z = z; p.path = path; p.dir = Math.random() < 0.5 ? 1 : -1;
      p.at = Math.max(0, Math.min(pts.length - 1, at + p.dir));
      p.mode = 'walk'; p.active = true; p.speed = p.want;
      return true;
    }
    return false;
  };

  let crowd = { x: 0, z: 0, faceX: 0, faceZ: 0, t: -1 };
  let pilotAlt = 0;
  let pilotOnFoot = true;
  let greetCool = 6;
  /** A pedestrian slot for someone the story needs here: one not in use, or the furthest walker. */
  const enlist = (x: number, z: number): Person | null => {
    let slot = -1; let far = -1;
    for (let i = 0; i < PEDESTRIANS; i++) {
      const p = people[i];
      if (!p.active) { slot = i; break; }
      const d = Math.hypot(p.x - x, p.z - z);
      if (p.mode === 'walk' && d > far) { far = d; slot = i; }
    }
    if (slot < 0) return null;
    const p = people[slot];
    Object.assign(p, { x, z, y: world.floorAt(x, z), active: true, timer: 0, lift: 0, tilt: 0, vx: 0, vy: 0, vz: 0, wave: 0 });
    return p;
  };
  const moverPool: Mover[] = people.map(() => ({ x: 0, z: 0, vx: 0, vz: 0, r: 0.35 }));
  const tmpM = new THREE.Matrix4(); const root = new THREE.Matrix4(); const joint = new THREE.Matrix4();
  const q = new THREE.Quaternion(); const qTilt = new THREE.Quaternion(); const xAxis = new THREE.Vector3(1, 0, 0); const e = new THREE.Euler(); const v = new THREE.Vector3(); const one = new THREE.Vector3(1, 1, 1);
  const set = (m: THREE.InstancedMesh, n: number, ox: number, oy: number, oz: number, rx: number, ry: number, rz: number) => {
    joint.compose(v.set(ox, oy, oz), q.setFromEuler(e.set(rx, ry, rz)), one);
    tmpM.multiplyMatrices(root, joint);
    m.setMatrixAt(n, tmpM);
  };

  const handle: PeopleHandle = {
    group,
    welcome(x, z, faceX, faceZ) {
      crowd = { x, z, faceX, faceZ, t: 0 };
      // Everyone in the crowd starts across the park and hurries over.
      for (let i = 0; i < CROWD; i++) {
        const p = people[PEDESTRIANS + i];
        const a = (i / CROWD) * Math.PI * 2 + hash(i + 11) * 0.4;
        const r = 22 + hash(i + 13) * 24;
        let sx = x + Math.cos(a) * r; let sz = z + Math.sin(a) * r;
        for (let k = 0; k < 6 && world.blocked(sx, sz); k++) { sx = x + Math.cos(a) * (r - 8 * (k + 1)); sz = z + Math.sin(a) * (r - 8 * (k + 1)); }
        // Their places: a ring at a respectful distance, open toward the hatch.
        const slot = Math.atan2(faceZ - z, faceX - x) + Math.PI * 0.35 + (i / CROWD) * Math.PI * 1.3;
        const ring = 10 + (i % 3) * 1.6 + hash(i + 17) * 1.2;
        p.x = sx; p.z = sz; p.tx = x + Math.cos(slot) * ring; p.tz = z + Math.sin(slot) * ring;
        p.mode = 'gather'; p.active = true; p.speed = 0; p.want = 2.3 + hash(i + 19) * 0.8; p.timer = 0;
        p.wave = hash(i + 23) < 0.5 ? 1 : 2;
      }
    },
    cheering() {
      let n = 0;
      for (let i = 0; i < CROWD; i++) if (people[PEDESTRIANS + i].mode === 'cheer') n += 1;
      return n / CROWD;
    },
    colliders(x, z, r, out) {
      out.length = 0;
      for (let i = 0; i < people.length; i++) {
        const p = people[i];
        if (!p.active) continue;
        if (Math.abs(p.x - x) > r || Math.abs(p.z - z) > r) continue;
        const m = moverPool[i];
        m.x = p.x; m.z = p.z; m.vx = Math.sin(p.yaw) * p.speed; m.vz = Math.cos(p.yaw) * p.speed;
        out.push(m);
      }
      return out;
    },
    update(dt, cx, cz, movers) {
      if (crowd.t >= 0) crowd.t += dt;
      greetCool -= dt;
      let n = 0;
      const poseRange = lite ? 180 : 280;
      for (let i = 0; i < total; i++) {
        const p = people[i];
        const inCrowd = i >= PEDESTRIANS;
        if (!p.active) {
          if (!inCrowd && paths.length) place(p, cx, cz);
          if (!p.active) continue;
        }
        const dCrew = Math.hypot(p.x - cx, p.z - cz);
        if (!inCrowd && dCrew > NEAR + 60 && p.mode !== 'down') { p.active = false; continue; }

        let moving = 0;
        if (p.mode === 'down') {
          // ── Knocked down: thrown, on the ground a while, up again, and away. ──
          p.timer += dt;
          if (p.lift > 0 || p.vy > 0) {
            p.vy -= 9.81 * dt;
            p.lift = Math.max(0, p.lift + p.vy * dt);
            if (p.lift === 0) p.vy = 0;
          }
          const drag = Math.exp(-dt * (p.lift > 0 ? 0.3 : 5));
          p.vx *= drag; p.vz *= drag;
          const nx = p.x + p.vx * dt; const nz = p.z + p.vz * dt;
          if (world.blocked(nx, nz)) { p.vx *= -0.3; p.vz *= -0.3; } else { p.x = nx; p.z = nz; }
          p.y = world.floorAt(p.x, p.z);
          const t = p.timer;
          p.tilt = t < 0.45 ? (-Math.PI / 2) * (t / 0.45) : t < 3.6 ? -Math.PI / 2 : t < 4.4 ? (-Math.PI / 2) * (1 - (t - 3.6) / 0.8) : 0;
          p.speed = 0;
          if (t >= 4.4) { p.mode = 'flee'; p.timer = 0; p.tilt = 0; p.lift = 0; }
        } else {
          // ── Where they want to go. ──
          let gx = 0; let gz = 0; let speedWant = p.want;
          if (p.mode === 'walk' || p.mode === 'disperse') {
          const pts = paths[p.path];
          if (p.mode === 'disperse' || !pts) {
            // Wander off away from what scattered them (the lander, a crash) until out of the scene.
            gx = p.x - p.tx; gz = p.z - p.tz;
            p.timer += dt;
            if (p.timer > 40 || dCrew > NEAR) p.active = false;
          } else {
            const [tx, tz] = pts[p.at];
            gx = tx - p.x; gz = tz - p.z;
            if (Math.hypot(gx, gz) < 1.2) {
              const next = p.at + p.dir;
              if (next < 0 || next >= pts.length) {
                // At a junction, take another path about half the time; otherwise turn back.
                const options = (ends.get(key(pts[p.at])) ?? []).filter((o) => o.path !== p.path);
                if (options.length && Math.random() < 0.6) {
                  const o = options[Math.floor(Math.random() * options.length)];
                  p.path = o.path; p.dir = o.at === 0 ? 1 : -1; p.at = o.at + p.dir;
                  if (p.at < 0 || p.at >= paths[p.path].length) { p.dir = -p.dir; p.at = o.at; }
                } else {
                  p.dir = -p.dir; p.at = Math.max(0, Math.min(pts.length - 1, p.at + p.dir));
                }
              } else {
                p.at = next;
              }
            }
            // Some stop a moment to look.
            if (dCrew < 14 && hash(p.seed + 31) < 0.4) { speedWant = 0; gx = cx - p.x; gz = cz - p.z; }
            // A pilot flying over the street on a jetpack: people stop and point.
            if (pilotAlt > 4 && dCrew < 45 + pilotAlt * 0.5 && hash(p.seed + 77) < 0.7) { p.mode = 'gawk'; p.timer = 0; }
            // Two who meet on the pavement sometimes stop for a word.
            p.chatCool -= dt;
            if (p.chatCool <= 0 && p.mode === 'walk') {
              p.chatCool = 3;
              for (let j = 0; j < PEDESTRIANS; j++) {
                const o = people[j];
                if (o === p || !o.active || o.mode !== 'walk' || o.chatCool > 0) continue;
                if (Math.abs(o.x - p.x) > 2.4 || Math.abs(o.z - p.z) > 2.4) continue;
                if (hash(p.seed * 3.7 + j + crowd.t) < 0.35) {
                  const len = 6 + hash(p.seed + j) * 6;
                  p.mode = 'chat'; p.partner = j; p.timer = len;
                  o.mode = 'chat'; o.partner = i; o.timer = len;
                }
                p.chatCool = 25 + hash(p.seed + 9) * 25; o.chatCool = 25 + hash(o.seed + 9) * 25;
                break;
              }
            }
            // A passer-by greets a pilot on foot.
            if (pilotOnFoot && dCrew < 3.5 && greetCool <= 0 && hash(p.seed + 13) < 0.5) {
              greetCool = 14 + hash(p.seed + crowd.t) * 12;
              gx = cx - p.x; gz = cz - p.z;
              handle.onGreet?.(Math.floor(hash(p.seed * 1.7 + greetCool) * GREETINGS));
            }
          }
        } else if (p.mode === 'flee') {
            // Running from what frightened them, then off out of the scene.
            gx = p.x - p.tx; gz = p.z - p.tz;
            speedWant = 4.3 + hash(p.seed + 41) * 0.8;
            p.timer += dt;
            if (p.timer > 9) { p.mode = 'disperse'; p.timer = 0; }
          } else if (p.mode === 'chat') {
            // Facing each other, talking with their hands, until one of them walks on.
            speedWant = 0;
            const o = people[p.partner];
            if (o && o.active && o.mode === 'chat') { gx = o.x - p.x; gz = o.z - p.z; }
            p.timer -= dt;
            if (p.timer <= 0 || !o || !o.active || o.mode !== 'chat') { p.mode = 'walk'; p.partner = -1; }
          } else if (p.mode === 'gawk') {
            // Looking up at the pilot overhead, one arm pointing.
            speedWant = 0;
            gx = cx - p.x; gz = cz - p.z;
            p.timer += dt;
            if (p.timer > 6 || pilotAlt < 2 || dCrew > 70) { p.mode = 'walk'; p.timer = 0; }
          } else if (p.mode === 'hail') {
            // At the kerb, facing the road, arm up.
            speedWant = 0;
            gx = p.tx - p.x; gz = p.tz - p.z;
            p.timer += dt;
          } else if (p.mode === 'gather') {
            gx = p.tx - p.x; gz = p.tz - p.z;
            if (Math.hypot(gx, gz) < 0.6) { p.mode = 'cheer'; p.timer = 0; }
          } else if (p.mode === 'cheer') {
            speedWant = 0;
            // Face the pilot once they are out; the hatch before that.
            gx = (dCrew < 60 ? cx : crowd.faceX) - p.x; gz = (dCrew < 60 ? cz : crowd.faceZ) - p.z;
            p.timer += dt;
            // Keep a respectful distance from the pilot.
            if (dCrew < 3.2) { speedWant = 1.1; gx = p.x - cx; gz = p.z - cz; }
            if (crowd.t > 75 || (crowd.t > 25 && Math.hypot(cx - crowd.x, cz - crowd.z) > 55)) {
              if (hash(p.seed * 1.3 + crowd.t * 977) < dt * 0.6) { p.mode = 'disperse'; p.timer = 0; p.wave = 0; p.tx = crowd.x; p.tz = crowd.z; }
            }
          }
          const gl = Math.hypot(gx, gz);
          if (gl > 1e-3) {
            const want = Math.atan2(gx, gz);
            let d = want - p.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
            p.yaw += d * (1 - Math.exp(-dt * (p.mode === 'flee' ? 9 : 6)));
          }
          if (p.mode === 'cheer' && dCrew >= 3.2) speedWant = 0;
          // ── Out of the way of whatever is moving at them: the pilot, cars. ──
          let ax = 0; let az = 0;
          for (const m of movers) {
            const dx = p.x - m.x; const dz = p.z - m.z;
            const d = Math.hypot(dx, dz);
            const sp = Math.hypot(m.vx, m.vz);
            // A car coming fast is seen late, and jumped from no quicker than a person can.
            const fast = sp > 3;
            const reach = m.r + 0.6 + sp * (fast ? 0.18 : 0.35);
            if (d < reach && d > 1e-3) {
              const push = (reach - d) / reach;
              const k = fast ? 2.6 : 6;
              ax += (dx / d) * push * k; az += (dz / d) * push * k;
            }
          }
          p.speed += (speedWant - p.speed) * (1 - Math.exp(-dt * (p.mode === 'flee' ? 5 : 3)));
          let nx = p.x + Math.sin(p.yaw) * p.speed * dt + ax * dt;
          let nz = p.z + Math.cos(p.yaw) * p.speed * dt + az * dt;
          if (world.blocked(nx, nz)) {
            nx = p.x; nz = p.z;
            if (p.mode === 'walk') p.dir = -p.dir;
            // A runner turns along the wall rather than into it.
            else if (p.mode === 'flee' || p.mode === 'disperse') p.yaw += (hash(p.seed + p.timer) < 0.5 ? 1 : -1) * 1.1;
          }
          p.x = nx; p.z = nz;
          p.y = world.floorAt(p.x, p.z);
          moving = Math.min(1, (p.speed + Math.hypot(ax, az) * 0.3) / 1.2);
          p.phase += dt * (p.speed * (p.speed > 2.5 ? 2.6 : 3.6) + Math.hypot(ax, az) * 2);
        }

        if (dCrew > poseRange) continue;
        // ── Pose. ──
        const s = p.scale;
        // Down, the body turns over backwards about the feet, and lies a hand's breadth up (its own depth).
        q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, p.yaw);
        if (p.tilt !== 0) q.multiply(qTilt.setFromAxisAngle(xAxis, p.tilt));
        root.compose(v.set(p.x, p.y + p.lift + (p.tilt < -0.2 ? 0.11 * (-p.tilt / (Math.PI / 2)) : 0), p.z), q, one.set(s, s, s));
        one.set(1, 1, 1);
        const running = p.mode === 'flee' ? 1 : 0;
        const stride = Math.sin(p.phase) * (0.55 + running * 0.25) * moving;
        const bob = Math.abs(Math.cos(p.phase)) * (0.035 + running * 0.03) * moving;
        const hipY = 0.92 + bob;
        const hailing = p.mode === 'hail';
        const cheer = p.mode === 'cheer' || hailing ? 1 : 0;
        const t = p.timer;
        const down = p.mode === 'down';
        set(mesh.hips, n, 0, hipY, 0, 0, 0, 0);
        set(mesh.torso, n, 0, hipY + 0.06, 0, 0.05 * moving + running * 0.22, Math.sin(p.phase) * 0.08 * moving, 0);
        const lookUp = p.mode === 'gawk' ? -0.5 : running * 0.1;
        set(mesh.head, n, 0, hipY + 0.66, 0, lookUp, 0, 0);
        set(mesh.hair, n, 0, hipY + 0.66, 0, lookUp, 0, 0);
        if (down) {
          // Sprawled: legs apart, arms flung out.
          set(mesh.legL, n, -0.085, hipY, 0, 0.15, 0, -0.25);
          set(mesh.legR, n, 0.085, hipY, 0, -0.1, 0, 0.22);
          set(mesh.armR, n, 0.22, hipY + 0.58, 0, -0.3, 0, 1.9);
          set(mesh.armL, n, -0.22, hipY + 0.58, 0, 0.2, 0, -1.7);
        } else {
          set(mesh.legL, n, -0.085, hipY, 0, stride, 0, 0);
          set(mesh.legR, n, 0.085, hipY, 0, -stride, 0, 0);
          if (p.mode === 'gawk') {
            // Pointing up at the sky, head back.
            set(mesh.armR, n, 0.22, hipY + 0.58, 0, -2.5, 0, 0.1);
            set(mesh.armL, n, -0.22, hipY + 0.58, 0, 0.05, 0, -0.08);
          } else if (p.mode === 'chat') {
            // Talking with the hands: one forearm's worth of gesture, now and then.
            const g = Math.max(0, Math.sin(t * 2.3 + p.seed * 5)) * 0.7;
            set(mesh.armR, n, 0.22, hipY + 0.58, 0, -0.4 - g, 0, 0.12);
            set(mesh.armL, n, -0.22, hipY + 0.58, 0, -0.15 * g, 0, -0.1);
          } else if (cheer && (p.wave === 1 || hailing)) {
            // Waving: the right arm up and swinging from the elbow's worth of shoulder.
            set(mesh.armR, n, 0.22, hipY + 0.58, 0, 0, 0, 2.6 + Math.sin(t * 7 + p.seed) * 0.35);
            set(mesh.armL, n, -0.22, hipY + 0.58, 0, 0.05, 0, -0.08);
          } else if (cheer) {
            // Clapping: both hands out in front, meeting and parting.
            const clap = Math.abs(Math.sin(t * 9 + p.seed)) * 0.28;
            set(mesh.armR, n, 0.22, hipY + 0.58, 0, -1.25, 0, -0.35 + clap);
            set(mesh.armL, n, -0.22, hipY + 0.58, 0, -1.25, 0, 0.35 - clap);
          } else {
            // Running, the arms pump hard and bent forward.
            set(mesh.armR, n, 0.22, hipY + 0.58, 0, stride * (0.8 + running * 0.6) - running * 0.5, 0, 0.08);
            set(mesh.armL, n, -0.22, hipY + 0.58, 0, -stride * (0.8 + running * 0.6) - running * 0.5, 0, -0.08);
          }
        }
        // Visible people are packed to the front of the instance buffers.
        dress(n, i);
        n += 1;
      }
      // Only people within the pose range are drawn: a sphere that wide round the crew bounds them all.
      const reach = poseRange + 4;
      for (const m of meshes) {
        m.boundingSphere!.set(v.set(cx, world.floorAt(cx, cz), cz), reach);
        m.count = n;
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
    },
    hit(x, z, yaw, speed, halfW, halfL) {
      if (Math.abs(speed) < 2.5) return 0;
      const fx = Math.sin(yaw); const fz = Math.cos(yaw);
      let count = 0;
      for (const p of people) {
        if (!p.active || p.mode === 'down') continue;
        const dx = p.x - x; const dz = p.z - z;
        if (Math.abs(dx) > halfL + 1 || Math.abs(dz) > halfL + 1) continue;
        const along = dx * fx + dz * fz;
        const across = dx * fz - dz * fx;
        if (Math.abs(along) > halfL + 0.3 || Math.abs(across) > halfW + 0.3) continue;
        // Thrown along the car's way and off to the side they stood on.
        const k = Math.min(1, Math.abs(speed) / 14);
        const side = Math.sign(across) || 1;
        const sv = speed * 0.75;
        p.vx = fx * sv + fz * side * (1.5 + k * 3);
        p.vz = fz * sv - fx * side * (1.5 + k * 3);
        p.vy = 2 + k * 3.5;
        p.lift = 0.05;
        p.mode = 'down'; p.timer = 0; p.speed = 0;
        p.yaw = Math.atan2(-fx, -fz) + (Math.random() - 0.5) * 0.8;
        p.tx = x; p.tz = z;
        count += 1;
      }
      return count;
    },
    panic(x, z, r) {
      for (const p of people) {
        if (!p.active || p.mode === 'down' || p.mode === 'flee') continue;
        if (Math.hypot(p.x - x, p.z - z) > r) continue;
        p.mode = 'flee'; p.timer = hash(p.seed + 3.3) * 2; p.tx = x; p.tz = z; p.wave = 0;
      }
    },
    fleer(x, z, fromX, fromZ) {
      const p = enlist(x, z);
      if (!p) return;
      p.mode = 'flee'; p.speed = 1.5; p.tx = fromX; p.tz = fromZ;
      p.yaw = Math.atan2(x - fromX, z - fromZ);
    },
    hail(x, z, faceX, faceZ) {
      const p = enlist(x, z);
      if (!p) return -1;
      p.mode = 'hail'; p.speed = 0; p.tx = faceX; p.tz = faceZ; p.wave = 1;
      p.yaw = Math.atan2(faceX - x, faceZ - z);
      return people.indexOf(p);
    },
    at(slot) {
      const p = people[slot];
      return p && p.active ? { x: p.x, z: p.z, mode: p.mode } : null;
    },
    setPilot(alt, onFoot) { pilotAlt = alt; pilotOnFoot = onFoot; },
    onGreet: null,
    dismiss(slot) {
      const p = people[slot];
      if (p && p.active && p.mode === 'hail') { p.mode = 'disperse'; p.timer = 0; p.wave = 0; }
    },
    release(slot) {
      const p = people[slot];
      if (p) { p.active = false; p.mode = 'idle'; }
    },
    alight(x, z, fromX, fromZ) {
      const p = enlist(x, z);
      if (!p) return;
      p.mode = 'disperse'; p.speed = 0.6; p.tx = fromX; p.tz = fromZ;
      p.yaw = Math.atan2(x - fromX, z - fromZ);
    },
    witnesses(x, z, r) {
      let k = 0;
      for (const p of people) if (p.active && p.mode !== 'down' && Math.hypot(p.x - x, p.z - z) < r) k += 1;
      return k;
    },
    dispose() {
      for (const g of Object.values(geoms)) g.dispose();
      for (const m of meshes) m.dispose();
      material.dispose();
    },
  };
  return handle;
}
