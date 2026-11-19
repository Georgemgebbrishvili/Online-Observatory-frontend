// Stellar Station's concourse: the hub in low Earth orbit that a ship docked
// alongside can board. A round deck open to space (spin gravity, suits on),
// railed at the edge; the station's spin ring arching overhead with its
// windows lit and spokes to the hub; and round the deck the places people
// come here for — Dock Control, the Exchange, the Observation Lounge and the
// crew bunks — each a module with a wide window and its name in light. Solar
// wings stand out past the rail, and four hundred kilometres down, Earth
// turns under it all (the deck's sea, world-profiles STATION).

import * as THREE from 'three';
import type { Kit } from '@/voyage/lib/solar-system/moon-kit';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { PointOfInterest } from '@/voyage/lib/solar-system/moon-base';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';
import { signTexture } from '@/voyage/lib/solar-system/world-mars-town';

export interface Station {
  group: THREE.Group;
  colliders: Collider[];
  pois: PointOfInterest[];
  spots: Record<string, { x: number; z: number }>;
  update: (dt: number, t: number, lights: LightPool) => void;
  dispose: () => void;
}

export function makeStation(kit: Kit, radius: number, lite: boolean): Station {
  const group = new THREE.Group();
  group.name = 'stellar-station';
  const M = kit.mat;
  const colliders: Collider[] = [];
  const pois: PointOfInterest[] = [];
  const spots: Station['spots'] = {};
  const owned: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];
  const own = <T extends THREE.Material>(m: T) => { owned.push(m); return m; };
  const R = radius;
  const seg = kit.seg(72);

  // ── The deck: slab, hazard band, railing and its lamps. ──
  kit.mesh(group, new THREE.CylinderGeometry(R, R * 0.96, 1.1, seg), M.deck, 0, -0.55, 0).receiveShadow = true;
  kit.mesh(group, new THREE.CylinderGeometry(R + 0.04, R + 0.04, 0.5, seg, 1, true), M.hazard, 0, -0.3, 0).castShadow = false;
  // Walkway rings painted on the deck.
  for (const r of [12, 24]) {
    const ring = kit.mesh(group, new THREE.RingGeometry(r - 0.15, r + 0.15, seg), own(new THREE.MeshStandardMaterial({ color: 0x5ac8ff, emissive: 0x2a8fd0, emissiveIntensity: 0.6 })), 0, 0.02, 0);
    ring.rotation.x = -Math.PI / 2;
    ring.castShadow = false;
  }
  const railR = R - 0.6;
  const posts = Math.round((Math.PI * 2 * railR) / 3);
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2;
    kit.cyl(group, 0.05, 0.06, 1.15, M.steel, Math.cos(a) * railR, 0.575, Math.sin(a) * railR, 6).castShadow = false;
  }
  for (const y of [1.12, 0.58]) {
    const rail = kit.mesh(group, new THREE.TorusGeometry(railR, y > 1 ? 0.055 : 0.04, 6, kit.seg(128)), M.alu, 0, y, 0);
    rail.rotation.x = Math.PI / 2;
    rail.castShadow = false;
  }
  const lampMat = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.4, 2.0), toneMapped: false }));
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    kit.mesh(group, new THREE.SphereGeometry(0.1, 8, 6), lampMat, Math.cos(a) * railR, 1.25, Math.sin(a) * railR).castShadow = false;
  }
  // Underneath: beams, a ring truss, and the docking keel.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    kit.strut(group, Math.cos(a) * 5, -1.4, Math.sin(a) * 5, Math.cos(a) * (R - 3), -1.3, Math.sin(a) * (R - 3), 0.32, M.steel);
  }
  kit.mesh(group, new THREE.TorusGeometry(R * 0.62, 0.35, 6, kit.seg(64)), M.steel, 0, -1.4, 0).rotation.x = Math.PI / 2;
  const keel = kit.mesh(group, new THREE.CylinderGeometry(7, 3, 14, kit.seg(24)), M.anodised, 0, -8.5, 0);
  keel.castShadow = true;

  // The pad at the centre: a painted ring and a cross.
  {
    const paint = own(new THREE.MeshStandardMaterial({ color: 0xf2c94c, roughness: 0.6 }));
    const ring = kit.mesh(group, new THREE.RingGeometry(10.2, 10.8, seg), paint, 0, 0.03, 0);
    ring.rotation.x = -Math.PI / 2;
    ring.castShadow = false;
    for (const rot of [0, Math.PI / 2]) {
      const bar = kit.mesh(group, new THREE.PlaneGeometry(8, 0.6), paint, 0, 0.031, 0);
      bar.rotation.set(-Math.PI / 2, 0, rot);
      bar.castShadow = false;
    }
  }

  // ── The spin ring overhead: a great wheel to the north, standing up, with
  // its band of windows lit and spokes to a hub above the deck. ──
  const hub = new THREE.Vector3(0, 46, -62);
  const ringR = 70;
  const wheel = new THREE.Group();
  wheel.position.copy(hub);
  wheel.rotation.x = 0.28;
  group.add(wheel);
  const hull = own(new THREE.MeshStandardMaterial({ color: 0xd8d6d0, roughness: 0.5, metalness: 0.45 }));
  kit.mesh(wheel, new THREE.TorusGeometry(ringR, 6.5, lite ? 10 : 16, lite ? 80 : 140), hull);
  const windowsMat = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.2, 0.8), toneMapped: false }));
  // The windows: a lit band on the inside face of the wheel, instanced.
  const nWin = lite ? 90 : 180;
  const winGeo = new THREE.BoxGeometry(2.6, 1.0, 0.2);
  kit.geometries.push(winGeo);
  const win = new THREE.InstancedMesh(winGeo, windowsMat, nWin);
  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const p = new THREE.Vector3(); const sc = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < nWin; i++) {
    const a = (i / nWin) * Math.PI * 2;
    const lit = Math.sin(i * 12.9898) * 43758.5453 % 1;
    p.set(Math.cos(a) * (ringR - 6.4), Math.sin(a) * (ringR - 6.4), 0);
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a + Math.PI / 2);
    sc.setScalar(Math.abs(lit) > 0.25 ? 1 : 0);
    win.setMatrixAt(i, m4.compose(p, q, sc));
  }
  win.frustumCulled = false;
  wheel.add(win);
  // Spokes and the hub.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    kit.strut(wheel, 0, 0, 0, Math.cos(a) * (ringR - 6), Math.sin(a) * (ringR - 6), 0, 1.6, M.alu);
  }
  kit.cylZ(wheel, 10, 26, hull, 0, 0, 0, kit.seg(32));
  kit.cylZ(wheel, 7, 30, M.anodised, 0, 0, 0, kit.seg(32));
  // The station's name on the hub, facing the deck.
  {
    const tex = signTexture('STELLAR STATION', '#5ac8ff', 1024, 192);
    texs.push(tex);
    const m = own(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }));
    m.color.setScalar(1.4);
    const sign = kit.mesh(wheel, new THREE.PlaneGeometry(26, 26 * 192 / 1024), m, 0, -12, 13.2);
    sign.castShadow = false;
  }

  // ── The places round the deck: a module each, a wide window on Earth, a sign. ──
  const places: { id: string; name: string; color: string; deg: number; w: number }[] = [
    { id: 'dock', name: 'DOCK CONTROL', color: '#5ac8ff', deg: 200, w: 9 },
    { id: 'exchange', name: 'EXCHANGE', color: '#ffd36a', deg: 250, w: 9 },
    { id: 'lounge', name: 'OBSERVATION LOUNGE', color: '#c9a2ff', deg: 300, w: 11 },
    { id: 'bunks', name: 'CREW BUNKS', color: '#5ef08a', deg: 340, w: 8 },
  ];
  const glass = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.9, 1.3), toneMapped: false, transparent: true, opacity: 0.85 }));
  for (const pl of places) {
    const a = (pl.deg * Math.PI) / 180;
    const r = R - 7;
    const cx = Math.cos(a) * r; const cz = Math.sin(a) * r;
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    // Facing the centre.
    g.rotation.y = Math.atan2(-cx, -cz);
    group.add(g);
    kit.rbox(g, pl.w, 4.2, 6, 0.6, hull, 0, 2.1, 0);
    kit.box(g, pl.w + 0.4, 0.4, 6.4, M.anodised, 0, 4.3, 0);
    const w = kit.mesh(g, new THREE.PlaneGeometry(pl.w - 2.4, 1.8), glass, 0, 2.2, 3.02);
    w.castShadow = false;
    const door = kit.mesh(g, new THREE.PlaneGeometry(1.4, 2.4), own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.3, 0.9), toneMapped: false })), pl.w / 2 - 1.2, 1.2, 3.03);
    door.castShadow = false;
    const tex = signTexture(pl.name, pl.color);
    texs.push(tex);
    const sm = own(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }));
    sm.color.setScalar(1.4);
    const sign = kit.mesh(g, new THREE.PlaneGeometry(Math.min(6, pl.w * 0.7), Math.min(6, pl.w * 0.7) / 4), sm, 0, 5.2, 3.0);
    sign.castShadow = false;
    colliders.push({ x: cx, z: cz, r: Math.max(pl.w, 6) * 0.55 });
    pois.push({ id: pl.id, x: cx, z: cz, r: pl.w * 0.7 });
    const fr = r - 5;
    spots[pl.id] = { x: Math.cos(a) * fr, z: Math.sin(a) * fr };
  }

  // ── Solar wings past the rail, east and west, and antennas. ──
  for (const side of [-1, 1]) {
    const wingG = new THREE.Group();
    wingG.position.set(side * (R + 18), 4, 6);
    group.add(wingG);
    kit.strut(group, side * (R - 1), 1.0, 6, side * (R + 4), 4, 6, 0.4, M.alu);
    for (let k = 0; k < 4; k++) {
      const panel = kit.box(wingG, 7.5, 0.12, 14, M.solar, side * (k - 1.5) * 8, 0, 0);
      panel.rotation.z = side * 0.06;
    }
    kit.box(wingG, 32, 0.3, 0.3, M.alu, 0, 0, 0);
  }
  for (const [x, z, h] of [[-22, 30, 10], [26, 26, 7]] as const) {
    kit.cyl(group, 0.12, 0.18, h, M.alu, x, h / 2, z, 8);
    const dish = kit.mesh(group, new THREE.SphereGeometry(1.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3), M.silver, x, h + 0.4, z);
    dish.rotation.x = -0.9;
    colliders.push({ x, z, r: 0.5 });
  }
  pois.push({ id: 'railing', x: 0, z: R - 3, r: 5 });
  spots.walkA = { x: -14, z: 8 };
  spots.walkB = { x: 14, z: -8 };

  let blink = 0;
  return {
    group, colliders, pois, spots,
    update(dt, t, lights) {
      // The wheel turns: one turn a minute, the spin that makes the gravity in it.
      wheel.rotation.z += dt * ((Math.PI * 2) / 60);
      blink += dt;
      lampMat.color.setRGB(0.6, 1.4, 2.0).multiplyScalar(blink % 2 < 0.12 ? 1.8 : 0.8);
      for (const id of ['dock', 'exchange', 'lounge']) {
        const s = spots[id];
        lights.request(s.x, 2.5, s.z, 0xcfe8ff, 3.5, 12, 2);
      }
    },
    dispose() {
      for (const m of owned) m.dispose();
      for (const x of texs) x.dispose();
      win.dispose();
    },
  };
}
