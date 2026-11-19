// Rocks round the ship. The belt in the system view is a haze of points;
// flying through it, it is boulders — tumbling, lit by the Sun, some small as
// a car, some many times the hull — drifting past on their own slow orbits.
// The field is a box that travels with the ship and wraps (a rock that falls
// behind comes round again far ahead), so it never ends, and how full it is
// follows where the ship is: thick in the main belt, a scatter elsewhere,
// nothing inside a world. Fly into one and the shields take it; shoot one
// and it breaks into sparks and gravel, and sometimes there is salvage.

import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FLIGHT_UNIT } from '@/voyage/lib/solar-system/player-ship';

const U = FLIGHT_UNIT;
const H = 0.044 * U;
/** Half the side of the box round the ship, scene units. */
const BOX = 260 * H;
/** The main belt between these distances from the Sun, scene units (log scale: 2.1–3.3 AU). */
const BELT_IN = 1.36;
const BELT_OUT = 1.72;
const HULL_R = 1.3 * H;

export interface AsteroidHit { at: THREE.Vector3; size: number }

export interface FlightAsteroidsHandle {
  group: THREE.Group;
  /** Every frame in flight: drift, tumble, wrap round the ship, thin out near worlds, and test the hull. */
  update: (dt: number, ship: { position: THREE.Vector3; velocity?: THREE.Vector3 } | null, sun: THREE.Vector3, bodies: readonly { position: THREE.Vector3; radius: number }[]) => void;
  /** A bolt from `from` to `to`: true when it hit a rock (the rock takes it). */
  bolt: (from: THREE.Vector3, to: THREE.Vector3) => AsteroidHit | null;
  /** Rocks within this distance of the ship, for the glass. */
  near: number;
  dispose: () => void;
}

export interface AsteroidOptions {
  lite: boolean;
  /** The ship ran into one: damage by how hard. */
  onImpact: (damage: number, at: THREE.Vector3) => void;
  /** A rock broke up (shot): sparks there, and maybe salvage. */
  onBreak: (at: THREE.Vector3, size: number) => void;
}

/** A lumpy rock: an icosphere pushed in and out by lobes, a few craters and
 *  fine grit, smooth-shaded, with the hollows darkened (vertex colour) so the
 *  form reads in hard sunlight. */
function rockGeometry(seed: number, detail: number): THREE.BufferGeometry {
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const r = (x: number) => { const s = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const lobes = Array.from({ length: 7 }, (_, i) => ({ d: new THREE.Vector3(r(i) - 0.5, r(i + 9) - 0.5, r(i + 19) - 0.5).normalize(), a: 0.12 + r(i + 29) * 0.25 }));
  const craters = Array.from({ length: 6 }, (_, i) => ({ d: new THREE.Vector3(r(i + 41) - 0.5, r(i + 53) - 0.5, r(i + 67) - 0.5).normalize(), w: 0.12 + r(i + 71) * 0.18 }));
  const colors = new Float32Array(pos.count * 3);
  const noise = (x: number, y: number, z: number) => Math.sin(x * 5.1 + seed) * Math.sin(y * 4.3 + seed * 2) * Math.sin(z * 6.7 + seed * 3);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let k = 1;
    for (const l of lobes) k += l.a * Math.max(0, v.dot(l.d)) ** 3 - l.a * 0.35 * Math.max(0, -v.dot(l.d)) ** 4;
    // Craters: a bowl with a raised rim.
    let shade = 1;
    for (const c of craters) {
      const ang = Math.acos(THREE.MathUtils.clamp(v.dot(c.d), -1, 1));
      const x = ang / c.w;
      if (x < 1.4) { k += x < 1 ? -0.07 * (1 - x * x) : 0.03 * Math.sin((x - 1) * Math.PI / 0.4); if (x < 1) shade -= 0.25 * (1 - x); }
    }
    k += noise(v.x, v.y, v.z) * 0.05 + (r(v.x * 13 + v.y * 7 + v.z * 3) - 0.5) * 0.03;
    v.multiplyScalar(k);
    // Elongated, like most of them.
    v.x *= 1.25; v.z *= 0.85;
    pos.setXYZ(i, v.x, v.y, v.z);
    // Hollows are darker: low k reads as a recess.
    const ao = THREE.MathUtils.clamp(0.55 + (k - 0.85) * 1.6, 0.45, 1.1) * shade;
    const tintR = 0.95 + noise(v.z, v.x, v.y) * 0.08;
    colors[i * 3] = ao * tintR; colors[i * 3 + 1] = ao; colors[i * 3 + 2] = ao * (2 - tintR);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

interface Rock {
  p: THREE.Vector3;
  vel: THREE.Vector3;
  axis: THREE.Vector3;
  spin: number;
  angle: number;
  size: number;
  hp: number;
  /** Seconds before a broken rock comes back (far from the ship). */
  gone: number;
  shape: number;
}

export function makeFlightAsteroids(opts: AsteroidOptions): FlightAsteroidsHandle {
  const group = new THREE.Group();
  group.name = 'flight-asteroids';
  const SHAPES = opts.lite ? 3 : 5;
  const PER = opts.lite ? 26 : 48;
  const geoms = Array.from({ length: SHAPES }, (_, i) => rockGeometry(i * 3.7 + 1, opts.lite ? 2 : 3));
  // A faint emissive lifts the night side off pure black (light scattered off the dust round the field).
  const rockMat = (color: number, metal: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: metal, vertexColors: true, emissive: 0x15110d, emissiveIntensity: 1 });
  const mats = [rockMat(0x7a7064, 0.05), rockMat(0x8e7d6a, 0.1), rockMat(0x5a5552, 0.3)];
  const meshes = geoms.map((g, i) => {
    const m = new THREE.InstancedMesh(g, mats[i % mats.length], PER);
    m.frustumCulled = false;
    m.castShadow = false;
    m.receiveShadow = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(m);
    return m;
  });
  const rocks: Rock[] = [];
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const place = (rk: Rock, around: THREE.Vector3 | null, far: boolean) => {
    // Sizes on a steep power law: mostly boulders, now and then a mountain.
    rk.size = H * (0.35 + Math.pow(Math.random(), 4.5) * 34);
    rk.hp = Math.ceil(rk.size / (H * 3)) + 1;
    const o = around ?? new THREE.Vector3();
    do {
      rk.p.set(rand(-BOX, BOX), rand(-BOX, BOX) * 0.6, rand(-BOX, BOX)).add(o);
    } while (far && around && rk.p.distanceTo(around) < BOX * 0.6);
    rk.vel.set(rand(-1, 1), rand(-0.3, 0.3), rand(-1, 1)).multiplyScalar(H * 0.6);
    rk.axis.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
    rk.spin = rand(-0.35, 0.35) * (rk.size < H * 4 ? 2 : 0.6);
    rk.angle = rand(0, Math.PI * 2);
    rk.gone = 0;
  };
  for (let s = 0; s < SHAPES; s++) {
    for (let i = 0; i < PER; i++) {
      const rk: Rock = { p: new THREE.Vector3(), vel: new THREE.Vector3(), axis: new THREE.Vector3(1, 0, 0), spin: 0, angle: 0, size: H, hp: 1, gone: 0, shape: s };
      place(rk, null, false);
      rocks.push(rk);
    }
  }
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sc = new THREE.Vector3();
  const zero = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const seg = new THREE.Vector3();
  let origin: THREE.Vector3 | null = null;
  let density = 0;
  let hitCool = 0;

  const handle: FlightAsteroidsHandle = {
    group,
    near: 0,
    update(dt, ship, sun, bodies) {
      if (!ship) { group.visible = false; return; }
      group.visible = true;
      const sp = ship.position;
      if (!origin) { origin = sp.clone(); for (const rk of rocks) place(rk, sp, false); }
      // How full the field is here: the main belt, a scatter elsewhere.
      const r = sp.distanceTo(sun);
      const inBelt = THREE.MathUtils.smoothstep(r, BELT_IN - 0.06, BELT_IN + 0.04) * (1 - THREE.MathUtils.smoothstep(r, BELT_OUT - 0.04, BELT_OUT + 0.08));
      density += ((0.08 + 0.92 * inBelt) - density) * (1 - Math.exp(-dt * 0.5));
      hitCool -= dt;
      let near = 0;
      const perShape = new Array(SHAPES).fill(0);
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        // Only the first `density` share of each shape's rocks are out at a time.
        const live = (i % PER) < Math.round(PER * density);
        const mesh = meshes[rk.shape];
        const slot = perShape[rk.shape]++;
        if (rk.gone > 0) { rk.gone -= dt; if (rk.gone <= 0) place(rk, sp, true); }
        rk.p.addScaledVector(rk.vel, dt);
        rk.angle += rk.spin * dt;
        // Wrap round the ship: whatever falls out of the box re-enters on the far side.
        for (const ax of ['x', 'y', 'z'] as const) {
          const lim = ax === 'y' ? BOX * 0.6 : BOX;
          const d = rk.p[ax] - sp[ax];
          if (d > lim) rk.p[ax] -= lim * 2; else if (d < -lim) rk.p[ax] += lim * 2;
        }
        // Nothing inside (or skimming) a world.
        let inside = false;
        for (const b of bodies) if (rk.p.distanceTo(b.position) < b.radius * 1.6 + rk.size) { inside = true; break; }
        const shown = live && rk.gone <= 0 && !inside;
        if (shown) {
          q.setFromAxisAngle(rk.axis, rk.angle);
          sc.setScalar(rk.size);
          m4.compose(rk.p, q, sc);
          const d = rk.p.distanceTo(sp);
          if (d < 60 * H) near++;
          // The hull meets it.
          if (hitCool <= 0 && d < rk.size * 1.05 + HULL_R) {
            hitCool = 0.6;
            const rel = ship.velocity ? ship.velocity.length() / U : 1;
            opts.onImpact(Math.min(60, 6 + rel * 8 + rk.size / H), rk.p);
            if (rk.size < H * 4) { opts.onBreak(rk.p.clone(), rk.size); rk.gone = 20; }
          }
        } else m4.compose(zero, q.identity(), sc.setScalar(0));
        mesh.setMatrixAt(slot, m4);
      }
      for (const m of meshes) m.instanceMatrix.needsUpdate = true;
      handle.near = near;
    },
    bolt(from, to) {
      seg.subVectors(to, from);
      const len2 = seg.lengthSq();
      if (!group.visible) return null;
      for (let i = 0; i < rocks.length; i++) {
        const rk = rocks[i];
        if (rk.gone > 0 || (i % PER) >= Math.round(PER * density)) continue;
        tmp.subVectors(rk.p, from);
        const t = len2 > 0 ? THREE.MathUtils.clamp(tmp.dot(seg) / len2, 0, 1) : 0;
        tmp.copy(from).addScaledVector(seg, t);
        if (tmp.distanceTo(rk.p) < rk.size * 1.1) {
          rk.hp -= 1;
          const at = tmp.clone();
          if (rk.hp <= 0) { opts.onBreak(rk.p.clone(), rk.size); rk.gone = 25 + Math.random() * 20; }
          return { at, size: rk.size };
        }
      }
      return null;
    },
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
      for (const m of meshes) m.dispose();
    },
  };
  return handle;
}
