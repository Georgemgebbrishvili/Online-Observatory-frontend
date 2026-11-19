// What makes the old town Tbilisi rather than any old town: the carved
// wooden balconies hung off its houses, painted brown, sky blue, green or
// white, with a little tin roof each; and the shop signs over the street in
// the Georgian script (ღვინო, ხაჭაპური, აფთიაქი…), lit after dark.
//
// They are placed once along the old town's walls (world-earth-city's
// oldTownWalls) and drawn from a pool of instances round the camera, so the
// whole old town costs four draw calls however much of it there is.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { OldWall } from '@/voyage/lib/solar-system/world-earth-city';
import { withHaze } from '@/voyage/lib/solar-system/world-earth-haze';

export interface OldTown {
  group: THREE.Group;
  update: (camera: THREE.Vector3, night: number) => void;
  dispose: () => void;
}

const STOREY = 3.7;
const WIDTHS = [3, 4.5, 6];
const BALCONY_RANGE = 230;
const SIGN_RANGE = 170;
const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
/** Old Tbilisi's balcony paints. */
const WOOD = [srgb(0.36, 0.24, 0.16), srgb(0.42, 0.62, 0.7), srgb(0.36, 0.56, 0.46), srgb(0.86, 0.84, 0.78), srgb(0.5, 0.3, 0.18), srgb(0.28, 0.42, 0.56)];
const WORDS = [
  'ღვინო', 'ხაჭაპური', 'აფთიაქი', 'პური', 'ყავა', 'სასტუმრო', 'ხინკალი', 'მარკეტი',
  'სუვენირები', 'ლუდი', 'თონე', 'ჩურჩხელა', 'WINE · ღვინო', 'CAFÉ · კაფე', 'HOSTEL · ჰოსტელი', 'ხელოსანი',
];
const SIGN_STYLES: [string, string][] = [['#1f3d2b', '#e2c46a'], ['#5c1a16', '#f6ead2'], ['#16223f', '#f4f4f2'], ['#111111', '#ff9a3c']];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** One balcony of width w, its floor at y = 0 against the wall, sticking out along +z. Vertex colour: white is paint. */
function balconyGeometry(w: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, shade = 1, rx = 0) => {
    const g = new THREE.BoxGeometry(sx, sy, sz).toNonIndexed();
    if (rx) g.rotateX(rx);
    g.translate(x, y, z);
    g.deleteAttribute('uv');
    const n = g.attributes.position.count;
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(shade), 3));
    parts.push(g);
  };
  const D = 1.05;
  box(w, 0.14, D, 0, 0, D / 2, 0.8);
  // The carved apron under the floor, and the rails.
  box(w, 0.26, 0.04, 0, -0.16, D, 0.9);
  box(w, 0.06, 0.08, 0, 0.95, D);
  box(w, 0.05, 0.05, 0, 0.14, D);
  for (const s of [-1, 1]) {
    box(0.06, 0.06, D, s * (w / 2 - 0.03), 0.95, D / 2);
    box(0.05, 0.05, D, s * (w / 2 - 0.03), 0.14, D / 2);
  }
  // Balusters, close set, the way the carved ones are.
  const n = Math.round(w / 0.2);
  for (let i = 0; i <= n; i++) box(0.035, 0.78, 0.035, -w / 2 + (i / n) * w, 0.55, D, 0.92);
  // Posts up to the little roof, a lattice frieze under it, and the roof itself, sloping off the wall.
  const posts = Math.max(2, Math.round(w / 2) + 1);
  for (let i = 0; i < posts; i++) box(0.08, 2.55, 0.08, -w / 2 + 0.05 + (i / (posts - 1)) * (w - 0.1), 1.28, D - 0.02);
  box(w, 0.2, 0.04, 0, 2.38, D, 0.85);
  box(w + 0.3, 0.05, D + 0.35, 0, 2.66, (D + 0.35) / 2 - 0.05, 0.5, -0.16);
  const g = mergeGeometries(parts)!;
  for (const p of parts) p.dispose();
  g.computeVertexNormals();
  return g;
}

/** The signboards' words, four by four, drawn once (and again when the Georgian face has loaded). */
function signAtlas(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const draw = () => {
    const g = c.getContext('2d');
    if (!g) return;
    for (let i = 0; i < 16; i++) {
      const x = (i % 4) * 512; const y = Math.floor(i / 4) * 128;
      const [bg, ink] = SIGN_STYLES[i % SIGN_STYLES.length];
      g.fillStyle = bg; g.fillRect(x, y, 512, 128);
      g.strokeStyle = ink; g.lineWidth = 5; g.strokeRect(x + 9, y + 9, 494, 110);
      g.fillStyle = ink;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const word = WORDS[i];
      let size = 64;
      g.font = `700 ${size}px "Noto Sans Georgian", "FiraGO", "BPG Nino Mtavruli", system-ui, sans-serif`;
      while (g.measureText(word).width > 450 && size > 24) { size -= 4; g.font = `700 ${size}px "Noto Sans Georgian", "FiraGO", system-ui, sans-serif`; }
      g.fillText(word, x + 256, y + 68);
    }
    tex.needsUpdate = true;
  };
  draw();
  // The page's Georgian face may still be on its way: draw again once it is in.
  if (typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(draw).catch(() => undefined);
  return tex;
}

interface Spot { x: number; y: number; z: number; yaw: number; kind: number; look: number }

export function makeOldTown(walls: OldWall[], heightAt: (x: number, z: number) => number, lite: boolean): OldTown {
  const group = new THREE.Group();
  group.name = 'earth-oldtown';

  // ── Where they go: along the walls, a balcony on some storeys, a sign over some ground floors. ──
  const balconies: Spot[] = [];
  const signs: Spot[] = [];
  walls.forEach((w, i) => {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az);
    const mx = (w.ax + w.bx) / 2; const mz = (w.az + w.bz) / 2;
    const yaw = Math.atan2(w.nx, w.nz);
    // The street's level in front of the wall, not the house's lowest corner.
    const street = heightAt(mx + w.nx * 2, mz + w.nz * 2);
    if (w.seed < 0.6) {
      const kind = len >= 8 ? 2 : len >= 6 ? 1 : 0;
      const floors = Math.floor((w.top - street) / STOREY);
      for (let k = 1; k < floors; k++) {
        if (hash(i * 13 + k) > 0.62) continue;
        balconies.push({ x: mx, y: street + k * STOREY + 0.05, z: mz, yaw, kind, look: Math.floor(hash(i * 7 + 1) * WOOD.length) });
      }
    }
    if (w.seed > 0.62 && len >= 5 && w.top - street > 5) {
      signs.push({ x: mx + w.nx * 0.08, y: street + 3.05, z: mz + w.nz * 0.08, yaw, kind: Math.floor(hash(i * 3 + 2) * 16), look: Math.min(3.2, len * 0.45) });
    }
  });
  const grid = (list: Spot[]) => {
    const g = new Map<number, number[]>();
    list.forEach((s, i) => {
      const k = (Math.floor(s.x / 100) + 512) * 1024 + Math.floor(s.z / 100) + 512;
      let l = g.get(k); if (!l) g.set(k, (l = [])); l.push(i);
    });
    return g;
  };
  const balconyGrid = grid(balconies);
  const signGrid = grid(signs);

  // ── Balconies: one instanced mesh a width. ──
  const cap = lite ? 160 : 420;
  const balconyMat = withHaze(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0 }), 'balcony');
  const geoms = WIDTHS.map(balconyGeometry);
  const balconyMeshes = geoms.map((g) => {
    const m = new THREE.InstancedMesh(g, balconyMat, cap);
    m.count = 0; m.castShadow = !lite; m.receiveShadow = true;
    m.boundingSphere = new THREE.Sphere();
    group.add(m);
    return m;
  });
  const woodColours = WOOD.map((c) => c.clone());

  // ── Signs: one instanced plane, each showing its cell of the atlas. ──
  const signCap = lite ? 60 : 160;
  const atlas = signAtlas();
  const signMat = withHaze(new THREE.MeshBasicMaterial({ map: atlas, color: 0xe6e6e6 }), 'signboard', false, (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aCell;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = vMapUv * vec2(0.25, 0.25) + aCell;');
  });
  const signGeom = new THREE.PlaneGeometry(1, 0.25);
  const cells = new Float32Array(signCap * 2);
  signGeom.setAttribute('aCell', new THREE.InstancedBufferAttribute(cells, 2));
  const signMesh = new THREE.InstancedMesh(signGeom, signMat, signCap);
  signMesh.count = 0;
  signMesh.boundingSphere = new THREE.Sphere();
  group.add(signMesh);

  const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const p = new THREE.Vector3(); const s = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const near: { i: number; d: number }[] = [];
  /** The spots of a list within range of the camera, nearest first, at most `max`. */
  const gather = (list: Spot[], g: Map<number, number[]>, cam: THREE.Vector3, range: number, max: number) => {
    near.length = 0;
    const r = Math.ceil(range / 100);
    const ci = Math.floor(cam.x / 100); const cj = Math.floor(cam.z / 100);
    for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) {
      const l = g.get((ci + a + 512) * 1024 + cj + b + 512);
      if (!l) continue;
      for (const i of l) {
        const d = Math.hypot(list[i].x - cam.x, list[i].z - cam.z);
        if (d < range) near.push({ i, d });
      }
    }
    near.sort((x, y) => x.d - y.d);
    if (near.length > max) near.length = max;
    return near;
  };
  const last = new THREE.Vector3(Infinity, 0, 0);
  let lastNight = -1;
  return {
    group,
    update(cam, night) {
      // Signs are lit after dark (bright enough to bloom); by day they are painted boards.
      if (Math.abs(night - lastNight) > 0.02) { lastNight = night; signMat.color.setScalar(0.88 + night * 0.9); }
      // The pools follow the camera every dozen metres.
      if (Math.hypot(cam.x - last.x, cam.z - last.z) < 12) return;
      last.copy(cam);
      const counts = [0, 0, 0];
      for (const { i } of gather(balconies, balconyGrid, cam, BALCONY_RANGE, cap * 3)) {
        const b = balconies[i];
        if (counts[b.kind] >= cap) continue;
        q.setFromAxisAngle(up, b.yaw);
        m4.compose(p.set(b.x, b.y, b.z), q, s.set(1, 1, 1));
        const k = counts[b.kind]++;
        balconyMeshes[b.kind].setMatrixAt(k, m4);
        balconyMeshes[b.kind].setColorAt(k, woodColours[b.look]);
      }
      balconyMeshes.forEach((m, k) => {
        m.count = counts[k];
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
        m.boundingSphere!.set(p.set(cam.x, cam.y, cam.z), BALCONY_RANGE + 20);
      });
      let n = 0;
      for (const { i } of gather(signs, signGrid, cam, SIGN_RANGE, signCap)) {
        const sg = signs[i];
        q.setFromAxisAngle(up, sg.yaw);
        m4.compose(p.set(sg.x, sg.y, sg.z), q, s.set(sg.look, sg.look, 1));
        signMesh.setMatrixAt(n, m4);
        cells[n * 2] = (sg.kind % 4) * 0.25; cells[n * 2 + 1] = 0.75 - Math.floor(sg.kind / 4) * 0.25;
        n += 1;
      }
      signMesh.count = n;
      signMesh.instanceMatrix.needsUpdate = true;
      (signGeom.attributes.aCell as THREE.InstancedBufferAttribute).needsUpdate = true;
      signMesh.boundingSphere!.set(p.set(cam.x, cam.y, cam.z), SIGN_RANGE + 20);
    },
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of balconyMeshes) m.dispose();
      balconyMat.dispose();
      signGeom.dispose(); signMat.dispose(); atlas.dispose(); signMesh.dispose();
    },
  };
}
