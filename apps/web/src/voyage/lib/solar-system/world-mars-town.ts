// Dusthaven: the town that grew up west of Mars Base. One street running
// north from the cargo field, prefab modules either side with their windows
// lit and their names in neon, The Red Dune cantina at the crossing, market
// stalls under striped awnings, crates, street lamps, cable runs overhead,
// and at the north end a shuttle pad where a short-hop shuttle comes and
// goes on its own timetable. The people are in world-npcs (MARS_TOWN_CAST).

import * as THREE from 'three';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { PointOfInterest } from '@/voyage/lib/solar-system/moon-base';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';

/** The street's line: from the south end to the north, at this x. */
export const TOWN = { x: -92, z0: -2, z1: 74, pad: { x: -92, z: 96 } };

export interface MarsTown {
  group: THREE.Group;
  colliders: Collider[];
  pois: PointOfInterest[];
  /** Where the town's people stand and walk: stall fronts, doors, the street. */
  spots: Record<string, { x: number; z: number }>;
  update: (dt: number, t: number, lights: LightPool) => void;
  /** 0 on the pad, 1 gone: for a sound or a look. */
  shuttle: () => { x: number; y: number; z: number; burning: boolean };
  dispose: () => void;
}

/** A sign's face: the name in a neon tube colour on a dark plate, with a glow round the letters. */
export function signTexture(text: string, color: string, w = 512, h = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(12,10,14,0.92)';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = color; g.lineWidth = 5; g.globalAlpha = 0.6;
  g.strokeRect(6, 6, w - 12, h - 12);
  g.globalAlpha = 1;
  g.font = `700 ${Math.floor(h * 0.52)}px "Archivo", "Arial Black", system-ui, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 24;
  g.fillStyle = color;
  g.fillText(text, w / 2, h / 2 + 2, w - 40);
  g.shadowBlur = 0;
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fillText(text, w / 2, h / 2 + 2, w - 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Stripes for an awning. */
function stripeTexture(a: string, b: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 16;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, 16); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function makeMarsTown(heightAt: (x: number, z: number) => number, lite: boolean): MarsTown {
  const group = new THREE.Group();
  group.name = 'mars-town';
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];
  const colliders: Collider[] = [];
  const pois: PointOfInterest[] = [];
  const spots: MarsTown['spots'] = {};
  const at = (x: number, z: number) => heightAt(x, z);
  const own = <T extends THREE.Material>(m: T) => { mats.push(m); return m; };
  const geo = <T extends THREE.BufferGeometry>(g: T) => { geoms.push(g); return g; };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = group) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  const shell = own(new THREE.MeshStandardMaterial({ color: 0xc9bda9, roughness: 0.75, metalness: 0.15 }));
  const shellDark = own(new THREE.MeshStandardMaterial({ color: 0x6d655c, roughness: 0.8, metalness: 0.2 }));
  const rust = own(new THREE.MeshStandardMaterial({ color: 0x8a4a2c, roughness: 0.9, metalness: 0.1 }));
  const metal = own(new THREE.MeshStandardMaterial({ color: 0x55595f, roughness: 0.45, metalness: 0.75 }));
  const windowLit = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.05, 0.55), toneMapped: false }));
  const windowCool = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 1.1, 1.5), toneMapped: false }));
  const berm = own(new THREE.MeshStandardMaterial({ color: 0x6e4a38, roughness: 1 }));
  const neonMats: THREE.MeshBasicMaterial[] = [];

  const sign = (text: string, color: string, x: number, y: number, z: number, yaw: number, w = 4.2) => {
    const tex = signTexture(text, color);
    texs.push(tex);
    const m = own(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true }));
    m.color.setScalar(1.5);
    neonMats.push(m);
    const s = add(geo(new THREE.PlaneGeometry(w, w / 4)), m, x, y, z);
    s.rotation.y = yaw;
    s.castShadow = false;
    return s;
  };

  // ── The street: a packed track, kerb lights down both sides. ──
  const streetLen = TOWN.z1 - TOWN.z0;
  const street = add(geo(new THREE.PlaneGeometry(9, streetLen, 1, 24)), own(new THREE.MeshStandardMaterial({ color: 0x5d4436, roughness: 1 })), TOWN.x, 0, (TOWN.z0 + TOWN.z1) / 2);
  street.rotation.x = -Math.PI / 2;
  {
    // Drape it on the ground.
    const pos = street.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i); const ly = pos.getY(i);
      const wx = TOWN.x + lx; const wz = (TOWN.z0 + TOWN.z1) / 2 - ly;
      pos.setZ(i, at(wx, wz) + 0.04);
    }
    street.geometry.computeVertexNormals();
    street.castShadow = false;
  }

  // ── Modules either side: name, door side, size, the colour of the light inside. ──
  const modules: { name: string; color: string; side: 1 | -1; z: number; w: number; d: number; h: number; cool?: boolean; id: string }[] = [
    { id: 'parts', name: 'PARTS & REPAIR', color: '#ffb347', side: -1, z: 6, w: 9, d: 7, h: 4.2 },
    { id: 'hydro', name: 'HYDRO MARKET', color: '#5ef08a', side: 1, z: 10, w: 8, d: 7, h: 3.8, cool: true },
    { id: 'o2bar', name: 'OXYGEN BAR', color: '#5ac8ff', side: -1, z: 22, w: 7, d: 6, h: 3.6, cool: true },
    { id: 'clinic', name: 'CLINIC', color: '#ff5a6a', side: 1, z: 28, w: 7, d: 7, h: 4 },
    { id: 'bunks', name: 'BUNKS', color: '#c9a2ff', side: -1, z: 52, w: 10, d: 8, h: 5.2 },
    { id: 'assay', name: 'ASSAY OFFICE', color: '#ffd36a', side: 1, z: 58, w: 8, d: 7, h: 4.4 },
  ];
  const off = 9.5;
  for (const m of modules) {
    const cx = TOWN.x + m.side * (off + m.d / 2);
    const cz = m.z;
    const y = at(cx, cz);
    const g = new THREE.Group();
    g.position.set(cx, y, cz);
    group.add(g);
    // A long half-buried module on a berm, the door facing the street.
    add(geo(new THREE.BoxGeometry(m.d + 1.2, 1.1, m.w + 1.2)), berm, 0, 0.3, 0, g);
    const body = add(geo(new THREE.CapsuleGeometry(m.h * 0.42, m.w - m.h * 0.84, 4, 16)), shell, 0, m.h * 0.5, 0, g);
    body.rotation.x = Math.PI / 2;
    body.scale.set(m.d / (m.h * 0.84), 1, 1);
    // Ribs, a roof tank, a vent.
    for (const dz of [-m.w * 0.32, 0, m.w * 0.32]) add(geo(new THREE.TorusGeometry(m.h * 0.43, 0.08, 6, 24, Math.PI)), shellDark, 0, m.h * 0.5, dz, g).scale.set(m.d / (m.h * 0.84), 1, 1);
    add(geo(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 12)), metal, -m.side * 0.8, m.h + 0.4, m.w * 0.25, g).rotation.z = Math.PI / 2;
    add(geo(new THREE.BoxGeometry(0.5, 1.0, 0.5)), shellDark, 0.5, m.h + 0.3, -m.w * 0.3, g);
    // Door and windows on the street side, lit.
    const face = -m.side * (m.d / 2 + 0.02);
    const door = add(geo(new THREE.PlaneGeometry(1.4, 2.3)), m.cool ? windowCool : windowLit, face, 1.35, 0, g);
    door.rotation.y = m.side > 0 ? -Math.PI / 2 : Math.PI / 2;
    door.castShadow = false;
    for (const dz of [-m.w * 0.3, m.w * 0.3]) {
      const win = add(geo(new THREE.PlaneGeometry(1.6, 0.7)), m.cool ? windowCool : windowLit, face, 2.2, dz, g);
      win.rotation.y = door.rotation.y;
      win.castShadow = false;
    }
    sign(m.name, m.color, cx + face - m.side * 0.1, y + m.h + 0.55, cz, door.rotation.y, Math.min(5.5, m.w * 0.6));
    colliders.push({ x: cx, z: cz - m.w * 0.28, r: m.d * 0.62 }, { x: cx, z: cz + m.w * 0.28, r: m.d * 0.62 });
    spots[m.id] = { x: TOWN.x + m.side * (off - 1.6), z: cz };
    pois.push({ id: `town-${m.id}`, x: cx, z: cz, r: m.d });
  }

  // ── The Red Dune: a big dome at the crossing, its sign on a mast. ──
  {
    const cx = TOWN.x - 22; const cz = 38; const y = at(cx, cz);
    add(geo(new THREE.SphereGeometry(8, lite ? 18 : 28, lite ? 10 : 16, 0, Math.PI * 2, 0, Math.PI / 2)), shell, cx, y - 0.4, cz).scale.set(1, 0.62, 1);
    add(geo(new THREE.CylinderGeometry(8.3, 8.6, 1.2, 32)), berm, cx, y, cz);
    const porch = add(geo(new THREE.BoxGeometry(4.4, 3.2, 3.6)), shellDark, cx + 8, y + 1.6, cz);
    porch.castShadow = true;
    const door = add(geo(new THREE.PlaneGeometry(2.0, 2.4)), windowLit, cx + 10.21, y + 1.3, cz);
    door.rotation.y = Math.PI / 2;
    // A ring of round windows, warm.
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const w = add(geo(new THREE.CircleGeometry(0.5, 16)), windowLit, cx + Math.cos(a) * 7.55, y + 2.3, cz + Math.sin(a) * 7.55);
      w.lookAt(cx + Math.cos(a) * 20, y + 2.3, cz + Math.sin(a) * 20);
      w.castShadow = false;
    }
    add(geo(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8)), metal, cx + 11.5, y + 3.75, cz + 3.5);
    sign('THE RED DUNE', '#ff4a3a', cx + 11.5, y + 7.2, cz + 3.5, Math.PI / 2, 5.5);
    colliders.push({ x: cx, z: cz, r: 8.4 }, { x: cx + 8, z: cz, r: 2.4 });
    spots.cantina = { x: cx + 12.4, z: cz - 1.5 };
    pois.push({ id: 'town-cantina', x: cx, z: cz, r: 10 });
  }

  // ── Market stalls along the east side: awnings, counters, goods. ──
  const awnings = [stripeTexture('#d9442a', '#efe3c4'), stripeTexture('#2a8fd0', '#efe3c4'), stripeTexture('#3ea36a', '#efe3c4')];
  texs.push(...awnings);
  const goodsMats = [0xe8a23a, 0x7dd35c, 0xd94a6a, 0x5ab0e0, 0xcdb88a].map((c) => own(new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 })));
  for (let i = 0; i < 5; i++) {
    const side = i % 2 ? 1 : -1;
    const cx = TOWN.x + side * 4.6; const cz = 34 + i * 3.6 + (side > 0 ? 1.5 : 0);
    if (Math.abs(cz - 38) < 3 && side < 0) continue;
    const y = at(cx, cz);
    const g = new THREE.Group();
    g.position.set(cx, y, cz);
    g.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(g);
    add(geo(new THREE.BoxGeometry(2.6, 0.95, 1.1)), rust, 0, 0.48, 0, g);
    for (const px of [-1.2, 1.2]) add(geo(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6)), metal, px, 1.25, -0.55, g);
    const aw = own(new THREE.MeshStandardMaterial({ map: awnings[i % 3], roughness: 0.85, side: THREE.DoubleSide }));
    const awning = add(geo(new THREE.PlaneGeometry(3.0, 1.8)), aw, 0, 2.45, -0.05, g);
    awning.rotation.x = -Math.PI / 2 + 0.35;
    // Goods on the counter.
    for (let k = 0; k < 5; k++) add(geo(new THREE.BoxGeometry(0.35, 0.3, 0.35)), goodsMats[(i + k) % goodsMats.length], -1 + k * 0.5, 1.1, 0.1 + (k % 2) * 0.15, g);
    colliders.push({ x: cx, z: cz, r: 1.5 });
    spots[`stall${i}`] = { x: TOWN.x + side * 2.6, z: cz };
  }

  // ── Crates and drums, here and there. ──
  {
    const crate = geo(new THREE.BoxGeometry(1, 1, 1));
    const drum = geo(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 12));
    const spotsC = [[-83, 2], [-84, 4.2], [-101, 16], [-100.5, 18], [-83, 46], [-101.5, 44], [-84, 66], [-99, 68]];
    spotsC.forEach(([x, z], i) => {
      const y = at(x, z);
      const m = add(i % 3 === 2 ? drum : crate, i % 3 === 2 ? rust : shellDark, x, y + 0.5, z);
      m.rotation.y = i * 0.7;
      colliders.push({ x, z, r: 0.75 });
    });
  }

  // ── Street lamps, both sides, and the cable run between them. ──
  const lamps: THREE.Vector3[] = [];
  const lampHead = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.25, 0.7), toneMapped: false }));
  for (let z = TOWN.z0 + 4; z <= TOWN.z1; z += 12) {
    for (const side of [-1, 1]) {
      const x = TOWN.x + side * 5.6; const zz = z + (side > 0 ? 6 : 0);
      const y = at(x, zz);
      add(geo(new THREE.CylinderGeometry(0.07, 0.1, 4.6, 6)), metal, x, y + 2.3, zz);
      const arm = add(geo(new THREE.BoxGeometry(1.2, 0.08, 0.08)), metal, x - side * 0.55, y + 4.5, zz);
      arm.castShadow = false;
      add(geo(new THREE.SphereGeometry(0.18, 10, 8)), lampHead, x - side * 1.1, y + 4.4, zz).castShadow = false;
      lamps.push(new THREE.Vector3(x - side * 1.1, y + 4.3, zz));
      colliders.push({ x, z: zz, r: 0.25 });
    }
  }

  // ── The gateway arch at the south end. ──
  {
    const z = TOWN.z0 - 3; const y = at(TOWN.x, z);
    for (const side of [-1, 1]) add(geo(new THREE.BoxGeometry(0.6, 6, 0.6)), shellDark, TOWN.x + side * 5, y + 3, z);
    add(geo(new THREE.BoxGeometry(10.6, 0.7, 0.7)), shellDark, TOWN.x, y + 6.2, z);
    sign('DUSTHAVEN', '#ffb347', TOWN.x, y + 7.2, z - 0.1, Math.PI, 6.5);
    sign('DUSTHAVEN', '#ffb347', TOWN.x, y + 7.2, z + 0.1, 0, 6.5);
    colliders.push({ x: TOWN.x - 5, z, r: 0.5 }, { x: TOWN.x + 5, z, r: 0.5 });
    spots.gate = { x: TOWN.x, z: z + 3 };
  }

  // ── The shuttle pad, and the shuttle that comes and goes. ──
  const pad = TOWN.pad;
  const padY = at(pad.x, pad.z);
  {
    const ring = add(geo(new THREE.CylinderGeometry(9, 9.4, 0.3, 40)), own(new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.7, metalness: 0.3 })), pad.x, padY + 0.15, pad.z);
    ring.castShadow = false;
    const mark = add(geo(new THREE.RingGeometry(5.5, 6.1, 40)), own(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.2), toneMapped: false })), pad.x, padY + 0.32, pad.z);
    mark.rotation.x = -Math.PI / 2;
    mark.castShadow = false;
    sign('SHUTTLE · PHOBOS', '#5ac8ff', pad.x - 10.5, padY + 3, pad.z, Math.PI / 2, 4.5);
    add(geo(new THREE.CylinderGeometry(0.08, 0.08, 3, 6)), metal, pad.x - 10.5, padY + 1.5, pad.z + 1.8);
    add(geo(new THREE.CylinderGeometry(0.08, 0.08, 3, 6)), metal, pad.x - 10.5, padY + 1.5, pad.z - 1.8);
    pois.push({ id: 'town-shuttlePad', x: pad.x, z: pad.z, r: 10 });
  }
  const shuttle = new THREE.Group();
  {
    const hullMat = own(new THREE.MeshPhysicalMaterial({ color: 0xe8e2d6, roughness: 0.35, metalness: 0.35, clearcoat: 0.8 }));
    const stripe = own(new THREE.MeshStandardMaterial({ color: 0xd9442a, roughness: 0.5 }));
    add(geo(new THREE.CapsuleGeometry(1.5, 5.5, 6, 18)), hullMat, 0, 2.6, 0, shuttle).rotation.x = Math.PI / 2;
    add(geo(new THREE.BoxGeometry(3.2, 0.2, 5.8)), stripe, 0, 2.6, 0, shuttle);
    add(geo(new THREE.BoxGeometry(7.5, 0.25, 2.2)), hullMat, 0, 2.1, -1.2, shuttle);
    const cockpit = add(geo(new THREE.SphereGeometry(1.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)), own(new THREE.MeshPhysicalMaterial({ color: 0x1a2430, roughness: 0.05, metalness: 0.9, clearcoat: 1 })), 0, 3.1, 3.2, shuttle);
    cockpit.scale.set(1, 0.7, 1.3);
    for (const [x, z] of [[-1.4, -2.4], [1.4, -2.4], [-1.4, 2.2], [1.4, 2.2]]) add(geo(new THREE.CylinderGeometry(0.1, 0.12, 1.4, 6)), metal, x, 0.7, z, shuttle);
    // Engine pods on the wing tips, a tail fin, and running lights.
    for (const x of [-3.6, 3.6]) {
      add(geo(new THREE.CylinderGeometry(0.55, 0.45, 3.2, 14)), hullMat, x, 2.1, -1.4, shuttle).rotation.x = Math.PI / 2;
      add(geo(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 14)), metal, x, 2.1, -3.05, shuttle).rotation.x = Math.PI / 2;
    }
    const fin = add(geo(new THREE.BoxGeometry(0.2, 2.2, 2.0)), hullMat, 0, 4.3, -3.2, shuttle);
    fin.rotation.x = -0.35;
    add(geo(new THREE.BoxGeometry(0.22, 0.5, 1.2)), stripe, 0, 5.0, -3.5, shuttle).rotation.x = -0.35;
    const red = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 0.2, 0.15), toneMapped: false }));
    const green = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 2.5, 0.6), toneMapped: false }));
    add(geo(new THREE.SphereGeometry(0.12, 8, 6)), red, -3.75, 2.1, 0.2, shuttle).castShadow = false;
    add(geo(new THREE.SphereGeometry(0.12, 8, 6)), green, 3.75, 2.1, 0.2, shuttle).castShadow = false;
  }
  const flameMat = own(new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.8, 1.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  const flames: THREE.Mesh[] = [];
  for (const x of [-3.6, 3.6]) {
    const f = add(geo(new THREE.ConeGeometry(0.45, 4, 12, 1, true)), flameMat, x, -0.1, -1.4, shuttle);
    f.rotation.x = Math.PI;
    f.castShadow = false;
    flames.push(f);
  }
  shuttle.position.set(pad.x, padY, pad.z);
  group.add(shuttle);
  colliders.push({ x: pad.x, z: pad.z, r: 4 });
  const shuttleCollider = colliders[colliders.length - 1];
  // The timetable: on the pad, spool, climb away, gone, come back down, settle. Seconds.
  const CYCLE = [['ground', 40], ['spool', 3], ['climb', 14], ['away', 35], ['descend', 16], ['settle', 2]] as const;
  const total = CYCLE.reduce((a, [, s]) => a + s, 0);
  let clock = Math.random() * total;
  const state = { x: pad.x, y: padY, z: pad.z, burning: false };

  return {
    group, colliders, pois, spots,
    update(dt, t, lights) {
      // Neon flickers now and then, the way old tubes do.
      for (let i = 0; i < neonMats.length; i++) {
        const k = Math.sin(t * 0.9 + i * 2.3) > 0.97 ? (Math.random() < 0.5 ? 0.35 : 1.5) : 1.5;
        neonMats[i].color.setScalar(k);
      }
      // The nearest few lamps light the street.
      for (let i = 0; i < lamps.length; i += 2) lights.request(lamps[i].x, lamps[i].y, lamps[i].z, 0xffb070, 5, 14, 2);
      // The shuttle's timetable.
      clock = (clock + dt) % total;
      let c = clock; let leg = 'ground'; let k = 0;
      for (const [name, s] of CYCLE) { if (c < s) { leg = name; k = c / s; break; } c -= s; }
      let h = 0; let burn = 0;
      if (leg === 'spool') { burn = k; h = 0; }
      else if (leg === 'climb') { h = 400 * k * k; burn = 1; }
      else if (leg === 'away') { h = 1e4; burn = 0; }
      else if (leg === 'descend') { const e = 1 - k; h = 400 * e * e; burn = 0.6 + 0.4 * (1 - k); }
      else if (leg === 'settle') { h = 0; burn = 1 - k; }
      shuttle.visible = leg !== 'away';
      shuttle.position.y = padY + h;
      shuttle.rotation.y = leg === 'climb' ? k * 0.6 : leg === 'descend' ? (1 - k) * -0.6 : 0;
      flameMat.opacity = burn * (0.75 + 0.25 * Math.sin(t * 40));
      for (const f of flames) f.scale.set(1, 0.6 + burn * 0.8 + Math.sin(t * 33) * 0.05, 1);
      if (burn > 0.05 && shuttle.visible) lights.request(pad.x, padY + h + 0.5, pad.z, 0xffc890, 14 * burn, 30, 2);
      shuttleCollider.r = h < 1 ? 4 : 0;
      state.y = padY + h; state.burning = burn > 0.05;
    },
    shuttle: () => state,
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
      for (const t of texs) t.dispose();
    },
  };
}
