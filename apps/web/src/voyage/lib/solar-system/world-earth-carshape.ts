// The cars of Tbilisi, shape only: a hatchback, a saloon, the yellow
// marshrutka and a patrol car. Each is a side silhouette extruded across the
// car, with glass, bumpers, lamps and plates set on it, every part tagged with
// what it is made of. The pilot's car and the police give each role its own
// material; the traffic merges them into one mesh with the roles in the
// vertex colours. Nose along +z, wheels on the ground at y = 0.

import * as THREE from 'three';

export type CarKind = 'hatch' | 'saloon' | 'van' | 'police';
export type CarRole = 'paint' | 'glass' | 'trim' | 'chrome' | 'plate' | 'livery' | 'head' | 'tail' | 'sirenR' | 'sirenB';

export interface CarSpec {
  length: number;
  width: number;
  wheelbase: number;
  track: number;
  wheelR: number;
  /** The circle the car is to everything it runs into. */
  hull: number;
  /** Flat out, m/s; pull, m/s²; how quick the steering is. */
  top: number;
  accel: number;
  grip: number;
}

export const CAR_SPECS: Record<CarKind, CarSpec> = {
  hatch: { length: 3.9, width: 1.76, wheelbase: 2.45, track: 1.44, wheelR: 0.31, hull: 1.9, top: 34, accel: 7.5, grip: 9 },
  saloon: { length: 4.6, width: 1.8, wheelbase: 2.75, track: 1.5, wheelR: 0.33, hull: 2.1, top: 38, accel: 7.8, grip: 9.5 },
  van: { length: 5.4, width: 2.0, wheelbase: 3.3, track: 1.66, wheelR: 0.36, hull: 2.5, top: 27, accel: 5.2, grip: 7 },
  police: { length: 4.6, width: 1.8, wheelbase: 2.75, track: 1.5, wheelR: 0.33, hull: 2.1, top: 44, accel: 9.5, grip: 10.5 },
};

/** The side silhouette, nose at +x, height up, with the two wheel arches cut into the sill. */
const PROFILES: Record<'hatch' | 'saloon' | 'van', [number, number][]> = {
  hatch: [[-1.9, 0.32], [-1.95, 0.62], [-1.88, 0.86], [-1.62, 0.98], [-1.5, 1.36], [-0.25, 1.46], [0.55, 1.4], [1.18, 0.98], [1.82, 0.84], [1.96, 0.62], [1.92, 0.34]],
  saloon: [[-2.27, 0.34], [-2.32, 0.62], [-2.24, 0.86], [-1.62, 0.95], [-1.12, 1.36], [0.2, 1.44], [0.62, 1.38], [1.2, 0.98], [2.15, 0.82], [2.3, 0.6], [2.27, 0.34]],
  van: [[-2.68, 0.4], [-2.72, 2.3], [-2.6, 2.42], [1.55, 2.42], [1.95, 2.0], [2.42, 1.3], [2.66, 1.12], [2.72, 0.55], [2.68, 0.4]],
};

/** Where the glass is: the windscreen and rear window (centre height, along, width, height, tilt) and the side lights. */
const GLASS: Record<'hatch' | 'saloon' | 'van', { front: [number, number, number, number, number]; rear: [number, number, number, number, number]; side: [number, number, number][] }> = {
  hatch: { front: [1.2, 0.87, 1.46, 0.62, -0.95], rear: [1.18, -1.58, 1.4, 0.44, 0.3], side: [[1.05, 1.2, 0.12], [0.7, 1.2, -1.0]] },
  saloon: { front: [1.18, 0.92, 1.5, 0.62, -0.92], rear: [1.16, -1.38, 1.44, 0.5, 0.75], side: [[1.0, 1.18, 0.38], [0.9, 1.18, -0.6]] },
  van: { front: [1.68, 2.1, 1.84, 0.8, -0.62], rear: [1.85, -2.73, 1.6, 0.6, 0], side: [[0.8, 1.85, 1.5], [3.6, 1.85, -0.75]] },
};

export interface CarShape {
  spec: CarSpec;
  parts: { role: CarRole; geometry: THREE.BufferGeometry }[];
  /** Wheel centres, car-local: x across, z along. */
  wheels: { x: number; z: number; front: boolean }[];
}

export function carShape(kind: CarKind, lite: boolean): CarShape {
  const spec = CAR_SPECS[kind];
  const form = kind === 'police' ? 'saloon' : kind;
  const L = spec.length; const W = spec.width;
  const parts: CarShape['parts'] = [];
  const put = (role: CarRole, g: THREE.BufferGeometry) => { parts.push({ role, geometry: g }); return g; };
  const box = (role: CarRole, w: number, h: number, d: number, x: number, y: number, z: number) =>
    put(role, new THREE.BoxGeometry(w, h, d).translate(x, y, z));

  // ── The shell. ──
  const pts = PROFILES[form];
  const archAt = spec.wheelbase / 2;
  const archR = spec.wheelR + 0.09;
  const sill = pts[0][1];
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [px, py] of pts.slice(1)) s.lineTo(px, py);
  s.lineTo(archAt + archR, sill);
  s.absarc(archAt, sill, archR, 0, Math.PI, false);
  s.lineTo(-archAt + archR, sill);
  s.absarc(-archAt, sill, archR, 0, Math.PI, false);
  s.lineTo(pts[0][0], pts[0][1]);
  const depth = W - 0.14;
  const shell = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: lite ? 1 : 3, curveSegments: lite ? 6 : 10 });
  shell.translate(0, 0, -depth / 2);
  shell.rotateY(-Math.PI / 2);
  put('paint', shell);

  // ── Glass, just proud of the shell. ──
  const gl = GLASS[form];
  const pane = (w: number, h: number, x: number, y: number, z: number, rx: number, ry: number) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateX(rx); g.rotateY(ry); g.translate(x, y, z);
    put('glass', g);
  };
  pane(gl.front[2], gl.front[3], 0, gl.front[0], gl.front[1], gl.front[4], 0);
  pane(gl.rear[2], gl.rear[3], 0, gl.rear[0], gl.rear[1], gl.rear[4], Math.PI);
  for (const side of [-1, 1]) {
    for (const [len, y, z] of gl.side) pane(len, form === 'van' ? 0.55 : 0.36, side * (W / 2 + 0.015), y, z, 0, side * Math.PI / 2);
    // Mirrors, and a chrome line along the waist.
    box('trim', 0.1, 0.07, 0.2, side * (W / 2 + 0.07), form === 'van' ? 1.7 : 1.02, form === 'van' ? 2.0 : L * 0.19);
    if (form !== 'van') box('chrome', 0.02, 0.02, L * 0.84, side * (W / 2 + 0.02), 0.62, 0);
  }

  // ── Bumpers, grille, lamps, plates. ──
  const front = L / 2; const back = -L / 2;
  box('trim', W - 0.06, 0.22, 0.16, 0, 0.38, front + 0.02);
  box('trim', W - 0.06, 0.22, 0.16, 0, 0.4, back - 0.02);
  box('trim', W * 0.5, 0.14, 0.05, 0, form === 'van' ? 0.9 : 0.62, front + 0.04);
  const lampY = form === 'van' ? 1.0 : 0.74;
  for (const side of [-1, 1]) {
    box('head', 0.34, 0.13, 0.06, side * (W / 2 - 0.3), lampY, front + 0.03);
    box('tail', 0.26, form === 'van' ? 0.4 : 0.14, 0.06, side * (W / 2 - 0.24), form === 'van' ? 1.3 : 0.86, back - 0.03);
  }
  box('plate', 0.52, 0.11, 0.02, 0, 0.44, front + 0.11);
  box('plate', 0.52, 0.11, 0.02, 0, form === 'van' ? 0.62 : 0.64, back - 0.06);

  if (kind === 'van') {
    // The marshrutka's route board behind the windscreen, and a roof rail.
    box('plate', 1.1, 0.2, 0.03, 0, 2.3, 1.62);
    for (const side of [-1, 1]) box('trim', 0.05, 0.05, 3.8, side * 0.8, 2.47, -0.4);
  }
  if (kind === 'police') {
    // A blue band along the doors, and the light bar on the roof.
    for (const side of [-1, 1]) box('livery', 0.02, 0.2, L * 0.7, side * (W / 2 + 0.03), 0.78, 0.05);
    box('livery', W * 0.94, 0.12, 0.04, 0, 0.62, front + 0.05);
    box('trim', 1.15, 0.08, 0.3, 0, 1.49, 0.05);
    box('sirenR', 0.5, 0.11, 0.26, -0.29, 1.58, 0.05);
    box('sirenB', 0.5, 0.11, 0.26, 0.29, 1.58, 0.05);
  }

  const wheels = [
    { x: -spec.track / 2, z: archAt, front: true }, { x: spec.track / 2, z: archAt, front: true },
    { x: -spec.track / 2, z: -archAt, front: false }, { x: spec.track / 2, z: -archAt, front: false },
  ];
  return { spec, parts, wheels };
}

/** The colour each role is painted in the traffic's merged mesh (paint is white: the instance colour tints it). */
const ROLE_RGB: Record<CarRole, [number, number, number]> = {
  paint: [1, 1, 1], glass: [0.05, 0.065, 0.08], trim: [0.05, 0.05, 0.055], chrome: [0.75, 0.75, 0.76], plate: [0.95, 0.95, 0.92],
  livery: [0.08, 0.22, 0.75], head: [1, 0.95, 0.85], tail: [1, 0.08, 0.05], sirenR: [1, 0.1, 0.08], sirenB: [0.15, 0.35, 1],
};
// The light bar stays dark in the traffic's merge: only a patrol car in pursuit flashes, and it is a car of its own.
const LAMPS: ReadonlySet<CarRole> = new Set(['head', 'tail']);
const DARK_SIREN: Partial<Record<CarRole, [number, number, number]>> = { sirenR: [0.35, 0.04, 0.03], sirenB: [0.05, 0.1, 0.38] };

function painted(g: THREE.BufferGeometry, rgb: [number, number, number]): THREE.BufferGeometry {
  const out = g.index ? g.toNonIndexed() : g.clone();
  for (const name of Object.keys(out.attributes)) if (name !== 'position' && name !== 'normal') out.deleteAttribute(name);
  if (!out.attributes.normal) out.computeVertexNormals();
  const n = out.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = rgb[0]; col[i * 3 + 1] = rgb[1]; col[i * 3 + 2] = rgb[2]; }
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return out;
}

/** One body (wheels and all) and one lamp mesh, roles in the vertex colours: for instancing. */
export function mergedCar(kind: CarKind, lite: boolean, merge: (gs: THREE.BufferGeometry[]) => THREE.BufferGeometry | null): { body: THREE.BufferGeometry; lamps: THREE.BufferGeometry; spec: CarSpec } {
  const shape = carShape(kind, lite);
  const body: THREE.BufferGeometry[] = [];
  const lamps: THREE.BufferGeometry[] = [];
  for (const p of shape.parts) {
    (LAMPS.has(p.role) ? lamps : body).push(painted(p.geometry, DARK_SIREN[p.role] ?? ROLE_RGB[p.role]));
    p.geometry.dispose();
  }
  const R = shape.spec.wheelR;
  for (const w of shape.wheels) {
    const tyre = new THREE.CylinderGeometry(R, R, 0.22, lite ? 10 : 14).rotateZ(Math.PI / 2).translate(w.x, R, w.z);
    body.push(painted(tyre, [0.035, 0.035, 0.035]));
    const hub = new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.23, 8).rotateZ(Math.PI / 2).translate(w.x, R, w.z);
    body.push(painted(hub, [0.55, 0.55, 0.57]));
    tyre.dispose(); hub.dispose();
  }
  const b = merge(body)!; const l = merge(lamps)!;
  for (const g of [...body, ...lamps]) g.dispose();
  return { body: b, lamps: l, spec: shape.spec };
}
