// Many small meshes that never move cost a draw call each (and another in
// the shadow pass). Baking merges every static mesh under a root into one
// mesh per material — positions carried into the root's frame — so a town of
// two hundred parts draws in a few dozen calls. Anything that moves or is
// animated is kept out by putting it (or a parent) in `keep`.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** What every merged geometry carries; anything else is dropped so the merge lines up. */
const ATTRS = ['position', 'normal', 'uv'] as const;

function normalised(g: THREE.BufferGeometry, m: THREE.Matrix4): THREE.BufferGeometry {
  const out = (g.index ? g.toNonIndexed() : g.clone());
  for (const name of Object.keys(out.attributes)) if (!(ATTRS as readonly string[]).includes(name) && name !== 'color') out.deleteAttribute(name);
  if (!out.attributes.uv) out.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((out.attributes.position.count) * 2), 2));
  if (!out.attributes.normal) out.computeVertexNormals();
  out.applyMatrix4(m);
  out.clearGroups();
  return out;
}

/** Merge the static meshes under `root` by material (and by whether they cast a shadow). Returns how many meshes went in. */
export function bakeStatic(root: THREE.Object3D, keep: Iterable<THREE.Object3D> = []): number {
  const kept = new Set(keep);
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<string, { material: THREE.Material; cast: boolean; parts: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }>();
  const isKept = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (kept.has(p) || p.userData.dynamic) return true; return false; };
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || Array.isArray(mesh.material) || isKept(mesh)) return;
    const key = `${mesh.material.uuid}:${mesh.castShadow ? 1 : 0}`;
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { material: mesh.material, cast: mesh.castShadow, parts: [], meshes: [] }));
    b.parts.push(normalised(mesh.geometry, new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld)));
    b.meshes.push(mesh);
  });
  let n = 0;
  for (const b of buckets.values()) {
    if (b.meshes.length < 2) { for (const g of b.parts) g.dispose(); continue; }
    const merged = mergeGeometries(b.parts, false);
    for (const g of b.parts) g.dispose();
    if (!merged) continue;
    for (const m of b.meshes) m.removeFromParent();
    const one = new THREE.Mesh(merged, b.material);
    one.castShadow = b.cast;
    one.receiveShadow = true;
    one.name = 'baked';
    root.add(one);
    n += b.meshes.length;
  }
  return n;
}
