// The bodies of the colony's people and machines, built from primitives
// so they cost nothing to load: a rolling utility droid, the gold
// quartermaster on long legs, three humanoid outfits (the smuggler's long
// coat and goggles, a guild hunter's sealed helmet and rifle, a colonist's
// pressure suit) and the scav drone that hangs over the dunes on its rotors.
// Each rig animates itself from what its brain is doing.

import * as THREE from 'three';
import type { BodyKind } from '@/voyage/lib/solar-system/npc-cast';
import type { Mode } from '@/voyage/lib/solar-system/npc-brain';

export interface PoseInput {
  t: number;
  dt: number;
  speed: number;
  mode: Mode;
  /** Aiming at something: the arms come up. */
  aiming: boolean;
  /** 0…1, a flash when hit. */
  hurt: number;
  /** 0…1 after going down: lies down, then fades back as it gets up. */
  downness: number;
}

export interface Rig {
  root: THREE.Group;
  /** Hit sphere: centre height and radius. */
  height: number;
  radius: number;
  /** Where bolts leave from (world space read each shot). */
  muzzle: THREE.Object3D;
  /** The light of the eyes or visor: its colour follows the mood. */
  eye: THREE.MeshBasicMaterial;
  /** Hover height over the ground (the scav), 0 for anything on its feet. */
  hover: number;
  animate: (p: PoseInput) => void;
  dispose: () => void;
}

const std = (color: number, rough = 0.6, metal = 0.2, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
const glow = (color: number) => new THREE.MeshBasicMaterial({ color, toneMapped: false });

class Builder {
  geoms: THREE.BufferGeometry[] = [];
  mats: THREE.Material[] = [];
  mesh(geom: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    this.geoms.push(geom);
    if (!this.mats.includes(mat)) this.mats.push(mat);
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  pivot(parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }
  dispose() {
    for (const g of this.geoms) g.dispose();
    for (const m of this.mats) m.dispose();
  }
}

const WHITE = new THREE.Color(0xffffff);
const easeTo = (cur: number, want: number, dt: number, rate: number) => cur + (want - cur) * (1 - Math.exp(-dt * rate));

/** Arms and legs swinging in a stride, aiming, falling down — the humanoids and the tall droid share it. */
function limbs(b: {
  hips: THREE.Object3D; torso: THREE.Object3D; head: THREE.Object3D;
  arms: THREE.Object3D[]; fores: THREE.Object3D[]; legs: THREE.Object3D[]; shins: THREE.Object3D[];
  root: THREE.Group; stride: number;
}) {
  let phase = Math.random() * 10;
  let aim = 0;
  return (p: PoseInput) => {
    const moving = p.speed > 0.2;
    phase += p.dt * (1.6 + p.speed * b.stride);
    const amp = moving ? Math.min(1, p.speed / 2.2) * 0.6 : 0;
    const sw = Math.sin(phase) * amp;
    aim = easeTo(aim, p.aiming ? 1 : 0, p.dt, 8);
    for (let s = 0; s < 2; s++) {
      const sign = s === 0 ? 1 : -1;
      b.legs[s].rotation.x = sw * sign;
      b.shins[s].rotation.x = Math.max(0, -sw * sign) * 1.3;
      // Arms swing against the legs, or come up level to aim (the right hand on the grip, the left under it).
      b.arms[s].rotation.x = -sw * sign * 0.7 * (1 - aim) - aim * (s === 0 ? 1.45 : 1.3);
      b.arms[s].rotation.z = sign * 0.08 * (1 - aim) + aim * (s === 0 ? -0.05 : 0.35);
      b.fores[s].rotation.x = -0.25 - (p.mode === 'talk' ? Math.max(0, Math.sin(p.t * 3 + s * 2)) * 0.5 : 0) - aim * 0.1;
    }
    const breathe = Math.sin(p.t * 1.6 + phase * 0.1) * 0.012;
    b.torso.rotation.x = (moving ? 0.08 + p.speed * 0.02 : breathe) + (p.mode === 'flee' ? 0.25 : 0) - (p.mode === 'cover' ? -0.35 : 0);
    b.hips.position.y = b.hips.userData.y + (moving ? Math.abs(Math.cos(phase)) * 0.04 : 0) - (p.mode === 'cover' ? 0.35 : 0);
    b.head.rotation.y = Math.sin(p.t * 0.5 + phase) * (p.mode === 'idle' || p.mode === 'post' ? 0.35 : 0.1);
    // Down: a knee, then flat on the back; up again as it fades.
    b.root.rotation.x = -Math.min(1, p.downness * 1.5) * 1.45;
    b.root.position.y = 0;
  };
}

function humanoid(kind: 'smuggler' | 'hunter' | 'colonist', color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const cloth = std(color, 0.85, 0.05);
  const dark = std(0x23262b, 0.55, 0.4);
  const suit = std(kind === 'colonist' ? 0xe9e6de : kind === 'hunter' ? 0x4a5058 : 0x5b4a3a, kind === 'hunter' ? 0.45 : 0.8, kind === 'hunter' ? 0.55 : 0.05);
  const eye = glow(kind === 'hunter' ? 0xff4a2a : 0x7fe6ff);
  const eyeBase = eye.color.clone();
  const hipY = 0.98;
  const hips = B.pivot(root, 0, hipY, 0);
  hips.userData.y = hipY;
  B.mesh(new THREE.BoxGeometry(0.36, 0.2, 0.22), suit, hips, 0, 0, 0);
  const torso = B.pivot(hips, 0, 0.08, 0);
  B.mesh(new THREE.CapsuleGeometry(0.2, 0.34, 4, 10), kind === 'colonist' ? suit : cloth, torso, 0, 0.32, 0).scale.set(1.15, 1, 0.8);
  // Kit on the back: an air pack, or the hunter's power cell.
  B.mesh(new THREE.BoxGeometry(0.34, 0.42, 0.16), kind === 'colonist' ? std(0xd8d4c8, 0.6, 0.2) : dark, torso, 0, 0.36, -0.2);
  if (kind === 'hunter') {
    // Plates: chest, one heavy shoulder.
    B.mesh(new THREE.BoxGeometry(0.42, 0.26, 0.1), std(color, 0.35, 0.7), torso, 0, 0.42, 0.15);
    B.mesh(new THREE.SphereGeometry(0.15, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(color, 0.35, 0.7), torso, -0.27, 0.58, 0).scale.set(1.2, 0.8, 1.1);
  }
  if (kind === 'smuggler') {
    // The long coat, open at the front, hanging from the waist.
    const coat = B.mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.78, 12, 1, true, 0.5, Math.PI * 2 - 1.0), cloth, hips, 0, -0.38, 0);
    (coat.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    B.mesh(new THREE.TorusGeometry(0.15, 0.06, 6, 14), std(0xb8a07a, 0.9, 0), torso, 0, 0.62, 0).rotation.x = Math.PI / 2;
  }
  const head = B.pivot(torso, 0, 0.7, 0);
  if (kind === 'smuggler') {
    B.mesh(new THREE.SphereGeometry(0.13, 14, 12), std(0xa8765a, 0.7, 0), head, 0, 0.1, 0);
    B.mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), dark, head, 0, 0.13, 0.11);
    B.mesh(new THREE.BoxGeometry(0.05, 0.04, 0.02), eye, head, -0.05, 0.13, 0.145);
    B.mesh(new THREE.BoxGeometry(0.05, 0.04, 0.02), eye, head, 0.05, 0.13, 0.145);
    // Breather over the mouth and a wide hat brim.
    B.mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 8), dark, head, 0, 0.03, 0.12).rotation.x = Math.PI / 2;
    B.mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 18), cloth, head, 0, 0.21, 0);
    B.mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 14), cloth, head, 0, 0.27, 0);
  } else if (kind === 'hunter') {
    // A round sealed helmet with a single slit of light.
    B.mesh(new THREE.SphereGeometry(0.17, 16, 12), std(color, 0.3, 0.75), head, 0, 0.12, 0);
    B.mesh(new THREE.BoxGeometry(0.24, 0.035, 0.05), eye, head, 0, 0.13, 0.15);
    B.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), dark, head, 0.12, 0.25, -0.02);
  } else {
    // A colonist's bubble helmet: the face a dark glass, a lamp on the brow.
    B.mesh(new THREE.SphereGeometry(0.18, 18, 14), std(0x0d1218, 0.08, 0.6, { transparent: true, opacity: 0.85 }), head, 0, 0.12, 0.01);
    B.mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 18), suit, head, 0, 0.0, 0).rotation.x = Math.PI / 2;
    B.mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), eye, head, 0, 0.27, 0.12);
    B.mesh(new THREE.BoxGeometry(0.24, 0.05, 0.02), std(color, 0.7, 0.1), torso, 0, 0.5, 0.17);
  }
  const arms: THREE.Object3D[] = [];
  const fores: THREE.Object3D[] = [];
  const legs: THREE.Object3D[] = [];
  const shins: THREE.Object3D[] = [];
  let muzzle: THREE.Object3D = head;
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    const arm = B.pivot(torso, sign * 0.27, 0.56, 0);
    B.mesh(new THREE.CapsuleGeometry(0.065, 0.24, 3, 8), kind === 'colonist' ? suit : cloth, arm, 0, -0.16, 0);
    const fore = B.pivot(arm, 0, -0.32, 0);
    B.mesh(new THREE.CapsuleGeometry(0.058, 0.22, 3, 8), suit, fore, 0, -0.15, 0);
    B.mesh(new THREE.SphereGeometry(0.06, 8, 6), dark, fore, 0, -0.32, 0);
    arms.push(arm); fores.push(fore);
    const leg = B.pivot(hips, sign * 0.11, -0.06, 0);
    B.mesh(new THREE.CapsuleGeometry(0.085, 0.3, 3, 8), suit, leg, 0, -0.22, 0);
    const shin = B.pivot(leg, 0, -0.44, 0);
    B.mesh(new THREE.CapsuleGeometry(0.075, 0.3, 3, 8), suit, shin, 0, -0.2, 0);
    B.mesh(new THREE.BoxGeometry(0.13, 0.08, 0.26), dark, shin, 0, -0.42, 0.04);
    legs.push(leg); shins.push(shin);
  }
  // Weapons: the hunter's rifle along the right forearm, the smuggler's sidearm in the right hand.
  if (kind !== 'colonist') {
    // Held along the forearm's line: hanging, it points at the ground; raised to aim, straight ahead.
    const hand = B.pivot(fores[0], 0, -0.33, 0.05);
    const long = kind === 'hunter';
    B.mesh(new THREE.BoxGeometry(0.06, long ? 0.62 : 0.24, 0.1), dark, hand, 0, long ? -0.16 : -0.07, 0);
    if (long) B.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), std(0x111316, 0.4, 0.8), hand, 0, -0.6, 0);
    if (long) B.mesh(new THREE.BoxGeometry(0.05, 0.12, 0.12), dark, hand, 0, 0.12, 0.04);
    muzzle = B.pivot(hand, 0, long ? -0.78 : -0.22, 0);
  }
  const animate = limbs({ hips, torso, head, arms, fores, legs, shins, root, stride: 3.4 });
  return {
    root, height: 1.15, radius: 0.55, muzzle, eye, hover: 0,
    animate: (p) => { animate(p); eye.color.copy(eyeBase).lerp(WHITE, p.hurt); },
    dispose: () => B.dispose(),
  };
}

function ballDroid(color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const shell = std(color, 0.35, 0.3);
  const trim = std(0xe07a22, 0.5, 0.3);
  const grey = std(0x8a9099, 0.4, 0.6);
  const eye = glow(0x6cf0ff);
  const R = 0.38;
  const ball = B.pivot(root, 0, R, 0);
  B.mesh(new THREE.SphereGeometry(R, 24, 18), shell, ball);
  // Painted rings and hatches that show the ball turning.
  for (const [rx, rz] of [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]]) {
    const ringM = B.mesh(new THREE.TorusGeometry(R * 1.002, 0.025, 6, 32), trim, ball);
    ringM.rotation.set(rx, 0, rz);
  }
  for (let i = 0; i < 4; i++) {
    const h = B.mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 14), grey, ball);
    const a = (i / 4) * Math.PI * 2;
    h.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
    h.lookAt(0, 0, 0);
    h.rotateX(Math.PI / 2);
  }
  // The dome rides on top and looks where it likes.
  const dome = B.pivot(root, 0, R * 2 + 0.02, 0);
  B.mesh(new THREE.SphereGeometry(0.22, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), shell, dome);
  B.mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.05, 18), trim, dome, 0, -0.01, 0);
  B.mesh(new THREE.SphereGeometry(0.06, 12, 10), std(0x101418, 0.1, 0.8), dome, 0, 0.1, 0.17);
  B.mesh(new THREE.SphereGeometry(0.035, 10, 8), eye, dome, 0, 0.1, 0.205);
  B.mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 5), grey, dome, -0.1, 0.27, -0.04);
  const muzzle = B.pivot(dome, 0.12, 0.08, 0.16);
  B.mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), grey, muzzle, 0, 0, -0.04).rotation.x = Math.PI / 2;
  let roll = 0;
  return {
    root, height: 0.55, radius: 0.5, muzzle, eye, hover: 0,
    animate(p) {
      roll += (p.speed * p.dt) / R;
      ball.rotation.x = roll;
      dome.rotation.x = Math.sin(p.t * 2) * 0.05 - (p.mode === 'down' ? 0.5 : 0);
      dome.rotation.y = p.aiming ? 0 : Math.sin(p.t * 0.7) * 0.6;
      dome.position.y = R * 2 + 0.02 + (p.mode === 'talk' ? Math.abs(Math.sin(p.t * 6)) * 0.03 : 0);
      root.rotation.z = p.downness * 0.6;
      eye.color.set(p.mode === 'attack' ? 0xff6a3a : 0x6cf0ff).lerp(WHITE, p.hurt);
    },
    dispose: () => B.dispose(),
  };
}

function tallDroid(color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const gold = std(color, 0.3, 0.85);
  const joint = std(0x2a2d33, 0.5, 0.6);
  const eye = glow(0xffd36a);
  const hipY = 1.18;
  const hips = B.pivot(root, 0, hipY, 0);
  hips.userData.y = hipY;
  B.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 10), joint, hips);
  const torso = B.pivot(hips, 0, 0.08, 0);
  B.mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.55, 8), gold, torso, 0, 0.3, 0);
  B.mesh(new THREE.BoxGeometry(0.2, 0.14, 0.04), glow(0x3fd0a0), torso, 0, 0.35, 0.21);
  const head = B.pivot(torso, 0, 0.66, 0);
  B.mesh(new THREE.BoxGeometry(0.22, 0.26, 0.24), gold, head, 0, 0.12, 0);
  B.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), eye, head, -0.055, 0.15, 0.125).rotation.x = Math.PI / 2;
  B.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), eye, head, 0.055, 0.15, 0.125).rotation.x = Math.PI / 2;
  B.mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), joint, head, 0, 0.05, 0.125);
  const arms: THREE.Object3D[] = [];
  const fores: THREE.Object3D[] = [];
  const legs: THREE.Object3D[] = [];
  const shins: THREE.Object3D[] = [];
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    const arm = B.pivot(torso, sign * 0.29, 0.52, 0);
    B.mesh(new THREE.SphereGeometry(0.06, 8, 6), joint, arm);
    B.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 6), gold, arm, 0, -0.2, 0);
    const fore = B.pivot(arm, 0, -0.4, 0);
    B.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 6), gold, fore, 0, -0.18, 0);
    B.mesh(new THREE.BoxGeometry(0.07, 0.1, 0.05), joint, fore, 0, -0.38, 0);
    arms.push(arm); fores.push(fore);
    const leg = B.pivot(hips, sign * 0.1, -0.04, 0);
    B.mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.55, 6), gold, leg, 0, -0.3, 0);
    const shin = B.pivot(leg, 0, -0.58, 0);
    B.mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.52, 6), gold, shin, 0, -0.28, 0);
    B.mesh(new THREE.BoxGeometry(0.1, 0.04, 0.2), joint, shin, 0, -0.56, 0.03);
    legs.push(leg); shins.push(shin);
  }
  const animate = limbs({ hips, torso, head, arms, fores, legs, shins, root, stride: 2.6 });
  return {
    root, height: 1.4, radius: 0.5, muzzle: head, eye, hover: 0,
    animate: (p) => { animate(p); eye.color.set(0xffd36a).lerp(WHITE, p.hurt); },
    dispose: () => B.dispose(),
  };
}

function scav(color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const hull = std(color, 0.55, 0.6);
  const rust = std(0x7a4a2a, 0.9, 0.2);
  const eye = glow(0xff3020);
  const body = B.pivot(root, 0, 0, 0);
  B.mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.22, 10), hull, body);
  B.mesh(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), rust, body, 0, 0.08, 0);
  B.mesh(new THREE.SphereGeometry(0.08, 10, 8), eye, body, 0, 0, 0.36);
  const rotors: THREE.Object3D[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const arm = B.pivot(body, Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55);
    B.mesh(new THREE.TorusGeometry(0.17, 0.02, 4, 16), hull, arm).rotation.x = Math.PI / 2;
    const blade = B.pivot(arm);
    B.mesh(new THREE.BoxGeometry(0.3, 0.008, 0.04), std(0x1b1d20, 0.6, 0.3), blade);
    rotors.push(blade);
    // Claws that hang and twitch.
    const claw = B.pivot(body, Math.cos(a + 0.5) * 0.22, -0.1, Math.sin(a + 0.5) * 0.22);
    B.mesh(new THREE.CylinderGeometry(0.018, 0.01, 0.38, 5), rust, claw, 0, -0.18, 0);
    claw.userData.claw = true;
    rotors.push(claw);
  }
  const muzzle = B.pivot(body, 0, -0.05, 0.42);
  let bob = Math.random() * 10;
  return {
    root, height: 0, radius: 0.6, muzzle, eye, hover: 1.7,
    animate(p) {
      bob += p.dt;
      body.position.y = Math.sin(bob * 2.1) * 0.12 - p.downness * 1.6;
      body.rotation.z = Math.sin(bob * 1.3) * 0.08 + p.downness * 0.9;
      body.rotation.x = Math.min(0.3, p.speed * 0.05) + (p.aiming ? 0.15 : 0);
      for (const r of rotors) {
        if (r.userData.claw) r.rotation.x = Math.sin(bob * 3 + r.position.x * 9) * 0.3;
        else r.rotation.y += p.dt * (p.mode === 'down' ? 0 : 40);
      }
      eye.color.set(p.mode === 'attack' ? 0xff2010 : 0xff8a30).lerp(WHITE, p.hurt);
    },
    dispose: () => B.dispose(),
  };
}

export function buildRig(kind: BodyKind, color: number): Rig {
  if (kind === 'ballDroid') return ballDroid(color);
  if (kind === 'tallDroid') return tallDroid(color);
  if (kind === 'scav') return scav(color);
  return humanoid(kind, color);
}
