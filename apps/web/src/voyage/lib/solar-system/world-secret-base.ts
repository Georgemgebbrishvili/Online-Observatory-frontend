// A secret base: on Mars, Mercury and Venus someone dug a hall into a hill a
// long walk (or a short flight) from the pad and told nobody. From outside it
// is a low rocky mound like any other, with a concrete portal and a blast
// door in its face. The suit picks up a faint signal on the way; at the door,
// holding the key opens it; inside, under the rock, the lights are still on:
// a holo table turning the world, racks of machines, crates, something
// parked, and a terminal with the logs, which the pilot can download.
//
// Found bases are remembered on the device (stellar_secret_bases_v1).

import * as THREE from 'three';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { PointOfInterest } from '@/voyage/lib/solar-system/moon-base';
import type { Interactable } from '@/voyage/lib/solar-system/moon-interactions';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';

export type SecretEvent = 'signal' | 'opened' | 'found';

export interface SecretBase {
  group: THREE.Group;
  colliders: Collider[];
  pois: PointOfInterest[];
  interactables: Interactable[];
  update: (dt: number, t: number, crew: THREE.Vector3, lights: LightPool) => void;
  onEvent: ((kind: SecretEvent) => void) | null;
  dispose: () => void;
}

const W = 14;
const D = 20;
const H = 6;
const DOOR = 7;
const DOOR_H = 4.6;
const SAVE_KEY = 'stellar_secret_bases_v1';

export function secretFound(world: string): boolean {
  try { return !!JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}')[world]; } catch { return false; }
}
function markFound(world: string) {
  try {
    const all = JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') as Record<string, string>;
    all[world] = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(all));
  } catch { /* private mode */ }
}

/** Each world's base has its own colour of light and its own thing parked inside. */
const LOOK: Record<string, { light: number; holo: number; rock: number; parked: 'rover' | 'lander' | 'probe' }> = {
  mars: { light: 0xffb36b, holo: 0xff6a3d, rock: 0x6a4433, parked: 'rover' },
  mercury: { light: 0xbfd8ff, holo: 0x7fd1ff, rock: 0x4a443e, parked: 'lander' },
  venus: { light: 0xffd08a, holo: 0xffb347, rock: 0x3a302a, parked: 'probe' },
};

export function makeSecretBase(world: string, site: { x: number; z: number }, pad: { x: number; z: number }, heightAt: (x: number, z: number) => number, lite: boolean): SecretBase {
  const look = LOOK[world] ?? LOOK.mars;
  const group = new THREE.Group();
  group.name = 'secret-base';
  const y0 = heightAt(site.x, site.z);
  group.position.set(site.x, y0, site.z);
  // The door faces the way the pilot comes from: the pad.
  const yaw = Math.atan2(pad.x - site.x, pad.z - site.z);
  group.rotation.y = yaw;
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const own = <M extends THREE.Material>(m: M) => { mats.push(m); return m; };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = group, shadow = true) => {
    geoms.push(g);
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = shadow; o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const concrete = own(new THREE.MeshStandardMaterial({ color: 0x8c877e, roughness: 0.92 }));
  const metal = own(new THREE.MeshStandardMaterial({ color: 0x4d535a, roughness: 0.45, metalness: 0.7 }));
  const darkMetal = own(new THREE.MeshStandardMaterial({ color: 0x24282d, roughness: 0.55, metalness: 0.6 }));
  const rock = own(new THREE.MeshStandardMaterial({ color: look.rock, roughness: 0.96, flatShading: true }));
  const hazard = own(new THREE.MeshStandardMaterial({ color: 0xd9a21b, roughness: 0.6 }));
  const screen = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(look.holo).multiplyScalar(1.6), toneMapped: false }));
  const led = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0x46ff9a).multiplyScalar(1.4), toneMapped: false }));
  const lampRed = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.1, 0.06).multiplyScalar(2), toneMapped: false }));
  const holoMat = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(look.holo).multiplyScalar(1.3), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }));

  // ── The hall: floor, walls, roof. ──
  add(new THREE.BoxGeometry(W, 0.2, D), darkMetal, 0, 0.1, 0, group, false);
  add(new THREE.BoxGeometry(0.5, H, D), concrete, -W / 2, H / 2, 0);
  add(new THREE.BoxGeometry(0.5, H, D), concrete, W / 2, H / 2, 0);
  add(new THREE.BoxGeometry(W, H, 0.5), concrete, 0, H / 2, -D / 2);
  const side = (W - DOOR) / 2;
  add(new THREE.BoxGeometry(side, H, 0.6), concrete, -(DOOR / 2 + side / 2), H / 2, D / 2);
  add(new THREE.BoxGeometry(side, H, 0.6), concrete, DOOR / 2 + side / 2, H / 2, D / 2);
  add(new THREE.BoxGeometry(DOOR, H - DOOR_H, 0.6), concrete, 0, DOOR_H + (H - DOOR_H) / 2, D / 2);
  add(new THREE.BoxGeometry(W + 1, 0.5, D + 1), concrete, 0, H + 0.25, 0);
  // The portal: a heavier frame round the door, hazard bands on its jambs, a lamp over it.
  add(new THREE.BoxGeometry(DOOR + 2.4, 0.9, 1.2), concrete, 0, DOOR_H + 0.45, D / 2 + 0.5);
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(1.2, DOOR_H, 1.2), concrete, s * (DOOR / 2 + 0.6), DOOR_H / 2, D / 2 + 0.5);
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(1.22, 0.3, 1.22), k % 2 ? darkMetal : hazard, s * (DOOR / 2 + 0.6), 0.5 + k * 0.6, D / 2 + 0.5, group, false);
  }
  const lamp = add(new THREE.SphereGeometry(0.22, 12, 8), lampRed, 0, DOOR_H + 1.1, D / 2 + 1.12, group, false);

  // ── The hill over it: a low rocky mound behind the portal, so from outside it is just ground. ──
  const moundGeo = new THREE.IcosahedronGeometry(1, lite ? 2 : 3);
  const pos = moundGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i); const y = pos.getY(i); const z = pos.getZ(i);
    const n = 1 + 0.12 * Math.sin(x * 5.1 + z * 3.3) + 0.08 * Math.sin(y * 7.7 + x * 2.2);
    pos.setXYZ(i, x * n, y * n, z * n);
  }
  moundGeo.computeVertexNormals();
  const mound = add(moundGeo, rock, 0, -2, -1.5);
  mound.scale.set(W / 2 + 7, H + 5, D / 2 + 1.5);
  // Rubble heaped over the front of the roof, so only the portal's face shows.
  const brow = new THREE.DodecahedronGeometry(1, 0);
  geoms.push(brow);
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(brow, rock);
    b.position.set(-W / 2 - 0.5 + i * ((W + 1) / 6), H + 0.6 + (i % 2) * 0.4, D / 2 - 2.2 - (i % 3) * 0.6);
    b.scale.set(2.1 + (i % 3) * 0.4, 1.1 + (i % 2) * 0.4, 2.4);
    b.rotation.set(i * 0.7, i * 1.3, i * 0.2);
    b.castShadow = true; b.receiveShadow = true;
    group.add(b);
  }
  // Boulders heaped at the mound's foot either side of the portal.
  for (let i = 0; i < 9; i++) {
    const b = add(new THREE.DodecahedronGeometry(0.8 + (i % 3) * 0.5, 0), rock, (i < 5 ? -1 : 1) * (DOOR / 2 + 2.6 + (i % 5) * 1.3), 0.4, D / 2 - 0.5 - (i % 3) * 1.5);
    b.rotation.set(i, i * 1.7, i * 0.4);
  }

  // ── The door: two leaves that slide apart. ──
  const leaves: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const leaf = add(new THREE.BoxGeometry(DOOR / 2, DOOR_H, 0.35), metal, s * DOOR / 4, DOOR_H / 2, D / 2 + 0.1);
    // A hazard chevron down its leading edge.
    add(new THREE.BoxGeometry(0.25, DOOR_H - 0.2, 0.37), hazard, -s * (DOOR / 4 - 0.15), 0, 0, leaf, false);
    leaves.push(leaf);
  }

  // ── Inside: the holo table, racks, crates, something parked, the terminal. ──
  add(new THREE.CylinderGeometry(1.5, 1.7, 1, 20), darkMetal, 0, 0.6, -2);
  add(new THREE.CylinderGeometry(1.35, 1.35, 0.05, 32), screen, 0, 1.13, -2, group, false);
  const holo = add(new THREE.SphereGeometry(0.85, 24, 16), holoMat, 0, 2.3, -2, group, false);
  const ring = add(new THREE.TorusGeometry(1.2, 0.02, 6, 48), holoMat, 0, 2.3, -2, group, false);
  ring.rotation.x = Math.PI / 2.3;
  for (let i = 0; i < 4; i++) {
    const rx = -W / 2 + 1.2; const rz = -D / 2 + 3 + i * 2.2;
    add(new THREE.BoxGeometry(1, 2.6, 1.6), darkMetal, rx, 1.4, rz);
    for (let k = 0; k < 5; k++) add(new THREE.BoxGeometry(0.02, 0.06, 1.2), k % 2 ? led : screen, rx + 0.51, 0.6 + k * 0.45, rz, group, false);
  }
  for (let i = 0; i < 6; i++) {
    const c = add(new THREE.BoxGeometry(1.4, 1.1 + (i % 2) * 0.5, 1.4), i % 3 ? metal : hazard, W / 2 - 1.6 - (i % 2) * 1.5, 0.75 + (i % 2) * 0.25, -D / 2 + 2 + Math.floor(i / 2) * 1.7);
    c.rotation.y = i * 0.3;
  }
  // The back wall's big screen.
  add(new THREE.PlaneGeometry(6, 2.6), screen, 0, 3.4, -D / 2 + 0.3, group, false);
  // Something parked by the right wall.
  const parked = new THREE.Group();
  parked.position.set(W / 2 - 3.6, 0.2, 4);
  group.add(parked);
  if (look.parked === 'rover') {
    add(new THREE.BoxGeometry(2.2, 1.1, 3.6), metal, 0, 1.2, 0, parked);
    add(new THREE.BoxGeometry(1.6, 0.8, 1.4), darkMetal, 0, 2.1, -0.6, parked);
    for (const sx of [-1, 1]) for (const sz of [-1.2, 1.2]) add(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14).rotateZ(Math.PI / 2), darkMetal, sx * 1.2, 0.55, sz, parked);
  } else if (look.parked === 'lander') {
    add(new THREE.CylinderGeometry(1.4, 1.8, 2.4, 16), metal, 0, 2.2, 0, parked);
    add(new THREE.ConeGeometry(1.4, 1.2, 16), darkMetal, 0, 4, 0, parked);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      const leg = add(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), metal, Math.cos(a) * 1.7, 1, Math.sin(a) * 1.7, parked);
      leg.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4);
    }
  } else {
    add(new THREE.SphereGeometry(1.3, 16, 12), metal, 0, 1.6, 0, parked);
    add(new THREE.TorusGeometry(1.5, 0.18, 8, 24).rotateX(Math.PI / 2), darkMetal, 0, 1.6, 0, parked);
    add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), metal, 0, 3.4, 0, parked);
  }
  // The terminal, by the holo table.
  const term = { x: -2.6, z: 1.2 };
  add(new THREE.BoxGeometry(1.4, 1.1, 0.7), darkMetal, term.x, 0.65, term.z);
  const termScreen = add(new THREE.PlaneGeometry(1.1, 0.6), screen, term.x, 1.45, term.z - 0.05, group, false);
  termScreen.rotation.x = -0.35;

  // ── Solid: the walls as chains of circles, the door's own chain while it is shut. ──
  const toWorld = (lx: number, lz: number) => ({
    x: site.x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
    z: site.z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
  });
  const colliders: Collider[] = [];
  const chain = (ax: number, az: number, bx: number, bz: number, out: Collider[]) => {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.1));
    for (let k = 0; k <= n; k++) { const w = toWorld(ax + (bx - ax) * (k / n), az + (bz - az) * (k / n)); out.push({ x: w.x, z: w.z, r: 0.7 }); }
  };
  chain(-W / 2, -D / 2, W / 2, -D / 2, colliders);
  chain(-W / 2, -D / 2, -W / 2, D / 2, colliders);
  chain(W / 2, -D / 2, W / 2, D / 2, colliders);
  chain(-W / 2, D / 2, -DOOR / 2 - 0.4, D / 2, colliders);
  chain(DOOR / 2 + 0.4, D / 2, W / 2, D / 2, colliders);
  const doorChain: Collider[] = [];
  chain(-DOOR / 2, D / 2, DOOR / 2, D / 2, doorChain);
  colliders.push(...doorChain);
  const tbl = toWorld(0, -2); colliders.push({ x: tbl.x, z: tbl.z, r: 1.7 });
  const pk = toWorld(W / 2 - 3.6, 4); colliders.push({ x: pk.x, z: pk.z, r: 1.9 });
  // The mound's flanks either side of the portal, so nobody walks into the hill.
  for (const s of [-1, 1]) chain(s * (W / 2 + 0.4), D / 2 - 1, s * (W / 2 + 5), -D / 2, colliders);

  const door = toWorld(0, D / 2 + 2.2);
  const termW = toWorld(term.x, term.z + 1.2);
  const centre = toWorld(0, 0);
  // Named on the glass from close by; it also keeps the world's loose rocks off the site.
  const pois: PointOfInterest[] = [{ id: 'secretBase', x: centre.x, z: centre.z, r: 26 }];
  let open = 0;
  let opening = false;
  let doorWork = 0;
  let logWork = 0;
  let found = secretFound(world);
  let signalT = 0;
  const handle: SecretBase = {
    group, colliders, pois, onEvent: null,
    interactables: [
      {
        id: 'secretDoor', priority: 2, mode: 'foot',
        where: () => (opening ? null : { x: door.x, z: door.z, r: 3.4 }),
        kind: () => 'hold', label: () => 'secretDoor',
        progress: () => doorWork,
        use: (dt) => {
          doorWork = Math.min(1, doorWork + dt / 1.6);
          if (doorWork >= 1 && !opening) { opening = true; handle.onEvent?.('opened'); }
        },
      },
      {
        id: 'secretLogs', priority: 2, mode: 'foot',
        where: () => (opening && open > 0.6 ? { x: termW.x, z: termW.z, r: 2.4 } : null),
        kind: () => 'hold', label: () => 'secretLogs',
        progress: () => logWork,
        use: (dt) => {
          if (logWork >= 1) return;
          logWork = Math.min(1, logWork + dt / 2.6);
          if (logWork >= 1) { found = true; markFound(world); handle.onEvent?.('found'); }
        },
      },
    ],
    update(dt, t, crew, lights) {
      // The door: a slow slide, and its chain out of the way once open.
      if (opening && open < 1) {
        open = Math.min(1, open + dt / 2.2);
        const e = open * open * (3 - 2 * open);
        leaves[0].position.x = -DOOR / 4 - e * (DOOR / 2 + 0.2);
        leaves[1].position.x = DOOR / 4 + e * (DOOR / 2 + 0.2);
        if (open > 0.5) for (const c of doorChain) c.r = 0;
      }
      lamp.visible = opening ? true : Math.sin(t * 5) > 0;
      lampRed.color.setRGB(opening ? 0.1 : 2, opening ? 1.6 : 0.2, opening ? 0.3 : 0.12);
      holo.rotation.y = t * 0.35;
      ring.rotation.z = t * 0.6;
      holoMat.opacity = 0.45 + 0.12 * Math.sin(t * 2.1);
      const d = Math.hypot(crew.x - centre.x, crew.z - centre.z);
      // The suit's ear on the way: a faint signal now and then until it is found.
      if (!found && d < 170) {
        signalT -= dt;
        if (signalT <= 0) { signalT = d < 60 ? 14 : 24; handle.onEvent?.('signal'); }
      }
      // Lights on inside, once there is someone near enough to see them.
      if (d < 70) {
        const k = opening ? 1 : 0.35;
        for (const [lx, lz] of [[0, -6], [0, 4]] as const) {
          const w = toWorld(lx, lz);
          lights.request(w.x, y0 + H - 0.6, w.z, look.light, 6 * k, 18, 2);
        }
        const h = toWorld(0, -2);
        lights.request(h.x, y0 + 2.3, h.z, look.holo, 3 * k, 10, 2);
      }
    },
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
    },
  };
  return handle;
}
