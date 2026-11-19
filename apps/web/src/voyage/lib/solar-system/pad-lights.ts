// The landing pad's lights. A ring of lamps round the painted circle and four
// masts with red strobes at its corners. Waiting, they breathe slowly;
// while a ship comes down they chase round and in toward the centre, the way
// an approach light leads the eye; at launch they strobe. One instanced mesh
// for the lamps, one for the strobes, each lamp's colour set per frame.

import * as THREE from 'three';
import type { LightPool } from '@/voyage/lib/solar-system/moon-lights';

export type PadMode = 'idle' | 'approach' | 'launch';

export interface PadLightsHandle {
  group: THREE.Group;
  update: (dt: number, t: number, mode: PadMode, lights: LightPool | null) => void;
  dispose: () => void;
}

export function makePadLights(cx: number, cz: number, radius: number, floorAt: (x: number, z: number) => number, lite: boolean): PadLightsHandle {
  const group = new THREE.Group();
  group.name = 'pad-lights';
  const N = lite ? 16 : 24;
  const lampGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.16, 8);
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const lamps = new THREE.InstancedMesh(lampGeo, lampMat, N);
  lamps.frustumCulled = false;
  const m4 = new THREE.Matrix4();
  const pos: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = cx + Math.cos(a) * radius; const z = cz + Math.sin(a) * radius;
    const p = new THREE.Vector3(x, floorAt(x, z) + 0.08, z);
    pos.push(p);
    m4.makeTranslation(p.x, p.y, p.z);
    lamps.setMatrixAt(i, m4);
    lamps.setColorAt(i, new THREE.Color(0));
  }
  group.add(lamps);

  // Four masts, a red strobe on each.
  const mastGeo = new THREE.CylinderGeometry(0.07, 0.1, 3.2, 6);
  mastGeo.translate(0, 1.6, 0);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.6, metalness: 0.6 });
  const strobeGeo = new THREE.SphereGeometry(0.16, 10, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const strobes = new THREE.InstancedMesh(strobeGeo, strobeMat, 4);
  strobes.frustumCulled = false;
  const tops: THREE.Vector3[] = [];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
    const x = cx + Math.cos(a) * (radius + 2.2); const z = cz + Math.sin(a) * (radius + 2.2);
    const y = floorAt(x, z);
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(x, y, z);
    mast.castShadow = true;
    group.add(mast);
    const top = new THREE.Vector3(x, y + 3.3, z);
    tops.push(top);
    m4.makeTranslation(top.x, top.y, top.z);
    strobes.setMatrixAt(i, m4);
    strobes.setColorAt(i, new THREE.Color(0));
  }
  group.add(strobes);

  const c = new THREE.Color();
  const amber = new THREE.Color(1.0, 0.62, 0.18);
  const white = new THREE.Color(1.0, 0.95, 0.85);
  let level = 0;
  return {
    group,
    update(dt, t, mode, lights) {
      level += ((mode === 'idle' ? 0.55 : 1) - level) * (1 - Math.exp(-dt * 3));
      for (let i = 0; i < N; i++) {
        let k: number;
        if (mode === 'approach') {
          // A bright pulse running round the ring, twice a second.
          const ph = ((t * 2.2 - i / N) % 1 + 1) % 1;
          k = 0.25 + 2.6 * Math.exp(-ph * 9);
          c.copy(white).lerp(amber, 0.35);
        } else if (mode === 'launch') {
          k = Math.sin(t * 22 + (i % 2) * Math.PI) > 0 ? 2.6 : 0.25;
          c.copy(white);
        } else {
          k = 0.55 + 0.25 * Math.sin(t * 1.4 + i * 0.4);
          c.copy(amber);
        }
        lamps.setColorAt(i, c.multiplyScalar(k * level));
      }
      lamps.instanceColor!.needsUpdate = true;
      // Strobes: a short double flash every 1.6 s.
      const ph = (t % 1.6) / 1.6;
      const flash = ph < 0.05 || (ph > 0.12 && ph < 0.17) ? 3.2 : 0.12;
      for (let i = 0; i < 4; i++) strobes.setColorAt(i, c.setRGB(1, 0.12, 0.08).multiplyScalar(flash));
      strobes.instanceColor!.needsUpdate = true;
      if (lights && flash > 1) for (const p of tops) lights.request(p.x, p.y, p.z, 0xff2a1a, 2.5, 9, 2);
      if (lights && mode !== 'idle') lights.request(cx, pos[0].y + 1, cz, mode === 'launch' ? 0xfff2dd : 0xffb050, 6 * level, radius * 1.8, 2);
    },
    dispose() {
      lampGeo.dispose(); lampMat.dispose(); mastGeo.dispose(); mastMat.dispose(); strobeGeo.dispose(); strobeMat.dispose();
      lamps.dispose(); strobes.dispose();
    },
  };
}
