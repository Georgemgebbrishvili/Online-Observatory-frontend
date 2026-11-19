// The Lantern Market, west of the village on Proxima b. The people of the
// terminator trade under caps that grow like mushrooms and are stalls: a
// ring of them round a pool of light, each hung with lanterns that breathe in
// slow colours, their wares heaped on curved counters — glow-moss, spiral
// shells, star-charts scratched in stone, bundled reeds. A tall lantern tree
// in the middle turns the whole place into a lamp under the red sun. The
// traders themselves are in world-npcs (alienMarketCast).

import * as THREE from 'three';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import type { PointOfInterest } from '@/voyage/lib/solar-system/moon-base';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';

export const MARKET = { x: -40, z: 40, r: 14 };

export interface AlienMarket {
  group: THREE.Group;
  colliders: Collider[];
  pois: PointOfInterest[];
  /** Where each trader stands: in front of their stall, facing in. */
  spots: { x: number; z: number }[];
  update: (dt: number, t: number, lights: LightPool) => void;
  dispose: () => void;
}

const HUES = [0x3ee6d8, 0xff5ad6, 0xffb340, 0xa2ff5a, 0x9a6cff, 0x5ac8ff];

export function makeAlienMarket(heightAt: (x: number, z: number) => number, lite: boolean): AlienMarket {
  const group = new THREE.Group();
  group.name = 'alien-market';
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const colliders: Collider[] = [];
  const pois: PointOfInterest[] = [{ id: 'market', x: MARKET.x, z: MARKET.z, r: MARKET.r + 4 }];
  const spots: AlienMarket['spots'] = [];
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
  const stem = own(new THREE.MeshStandardMaterial({ color: 0x6b5a7a, roughness: 0.8 }));
  const capUnder = own(new THREE.MeshStandardMaterial({ color: 0x3a2a4a, roughness: 0.9, side: THREE.DoubleSide }));
  const counter = own(new THREE.MeshStandardMaterial({ color: 0x8a6a8e, roughness: 0.6, metalness: 0.05 }));
  const lanterns: { mat: THREE.MeshBasicMaterial; base: THREE.Color; hue: number; phase: number; mesh: THREE.Mesh; at: THREE.Vector3 | null }[] = [];
  const lantern = (hue: number, x: number, y: number, z: number, size = 0.22, parent: THREE.Object3D = group) => {
    const base = new THREE.Color(hue).multiplyScalar(2.2);
    const m = own(new THREE.MeshBasicMaterial({ color: base.clone(), toneMapped: false }));
    const mesh = add(geo(new THREE.SphereGeometry(size, 12, 10)), m, x, y, z, parent);
    mesh.castShadow = false;
    lanterns.push({ mat: m, base, hue, phase: Math.random() * 10, mesh, at: null });
  };

  const N = lite ? 5 : 6;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.3;
    const sx = MARKET.x + Math.cos(a) * MARKET.r; const sz = MARKET.z + Math.sin(a) * MARKET.r;
    const y = heightAt(sx, sz);
    const hue = HUES[i % HUES.length];
    const g = new THREE.Group();
    g.position.set(sx, y, sz);
    g.rotation.y = Math.atan2(MARKET.x - sx, MARKET.z - sz);
    group.add(g);
    // A bent stem and a wide cap that is the roof.
    const st = add(geo(new THREE.CylinderGeometry(0.35, 0.6, 4.6, 10)), stem, 0, 2.3, -1.2, g);
    st.rotation.x = 0.12;
    const capMat = own(new THREE.MeshStandardMaterial({ color: new THREE.Color(hue).lerp(new THREE.Color(0x3a2a4a), 0.55), roughness: 0.55, emissive: new THREE.Color(hue), emissiveIntensity: 0.18 }));
    const cap = add(geo(new THREE.SphereGeometry(3.2, lite ? 16 : 24, 10, 0, Math.PI * 2, 0, Math.PI / 2.6)), capMat, 0, 3.4, -0.6, g);
    cap.scale.set(1, 0.55, 1);
    add(geo(new THREE.CircleGeometry(3.0, 24)), capUnder, 0, 3.42, -0.6, g).rotation.x = Math.PI / 2;
    // The counter, curved, and goods on it.
    add(geo(new THREE.TorusGeometry(1.6, 0.35, 8, 20, Math.PI)), counter, 0, 0.8, -0.6, g).rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) {
      const ga = Math.PI * (0.1 + k * 0.2);
      const gx = Math.cos(ga) * 1.6; const gz = -0.6 + Math.sin(ga) * 1.6;
      const kind = (i + k) % 3;
      if (kind === 0) lantern(HUES[(i + k) % HUES.length], gx, 1.25, gz, 0.15, g); // a jar of glow-moss
      else if (kind === 1) add(geo(new THREE.TorusKnotGeometry(0.12, 0.05, 32, 6)), counter, gx, 1.3, gz, g).scale.setScalar(1.2); // a spiral shell
      else add(geo(new THREE.BoxGeometry(0.4, 0.06, 0.3)), stem, gx, 1.18, gz, g); // a star chart in stone
    }
    // Lanterns hanging round the rim of the cap.
    for (let k = 0; k < (lite ? 3 : 5); k++) {
      const la = (k / 5) * Math.PI * 2;
      const lx = sx + Math.cos(la + g.rotation.y) * 2.6; const lz = sz + Math.sin(la + g.rotation.y) * 2.6;
      lantern(HUES[(i + k + 1) % HUES.length], lx, y + 2.7, lz);
    }
    colliders.push({ x: sx, z: sz, r: 2.0 });
    // The trader stands just inside the ring, in front of the counter.
    const fx = MARKET.x + Math.cos(a) * (MARKET.r - 3.2); const fz = MARKET.z + Math.sin(a) * (MARKET.r - 3.2);
    spots.push({ x: fx, z: fz });
  }

  // The lantern tree at the centre.
  {
    const y = heightAt(MARKET.x, MARKET.z);
    add(geo(new THREE.CylinderGeometry(0.5, 0.9, 7, 12)), stem, MARKET.x, y + 3.5, MARKET.z);
    for (let b = 0; b < 7; b++) {
      const a = (b / 7) * Math.PI * 2;
      const len = 2.6 + (b % 3) * 0.6;
      const branch = add(geo(new THREE.CylinderGeometry(0.08, 0.18, len, 6)), stem, MARKET.x + Math.cos(a) * len * 0.4, y + 6 + (b % 2) * 0.6, MARKET.z + Math.sin(a) * len * 0.4);
      branch.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
      lantern(HUES[b % HUES.length], MARKET.x + Math.cos(a) * len * 0.85, y + 6.6 + (b % 2) * 0.6, MARKET.z + Math.sin(a) * len * 0.85, 0.3);
    }
    colliders.push({ x: MARKET.x, z: MARKET.z, r: 1.2 });
  }

  return {
    group, colliders, pois, spots,
    update(dt, t, lights) {
      // Each lantern breathes slowly through its colour, and a few light the ground.
      for (let i = 0; i < lanterns.length; i++) {
        const l = lanterns[i];
        const k = 0.65 + 0.35 * Math.sin(t * 0.8 + l.phase);
        l.mat.color.copy(l.base).multiplyScalar(k);
        if (i % 6 === 0) {
          if (!l.at) { l.mesh.updateWorldMatrix(true, false); l.at = l.mesh.getWorldPosition(new THREE.Vector3()); }
          lights.request(l.at.x, l.at.y, l.at.z, l.hue, 2.5 * k, 9, 2);
        }
      }
    },
    dispose() {
      for (const g of geoms) g.dispose();
      for (const m of mats) m.dispose();
    },
  };
}
