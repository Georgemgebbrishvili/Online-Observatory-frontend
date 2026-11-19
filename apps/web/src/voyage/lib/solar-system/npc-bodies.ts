// The bodies of the colony's people and machines, built from primitives
// so they cost nothing to load: a rolling utility droid, the gold
// quartermaster on long legs, three humanoid outfits (the smuggler's long
// coat and goggles, a guild hunter's sealed helmet and rifle, a colonist's
// pressure suit) and the scav drone that hangs over the dunes on its rotors.
// Each rig animates itself from what its brain is doing.

import * as THREE from 'three';
import type { BodyKind } from '@/voyage/lib/solar-system/npc-cast';
import type { Mode } from '@/voyage/lib/solar-system/npc-brain';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
  /** A job or a greeting being done with the hands. */
  gesture?: 'work' | 'chat' | 'scan' | 'wave' | 'celebrate' | 'salvage' | null;
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
/** Polished: lacquer over metal or paint, so the world's sky shows in it. */
const lacquer = (color: number, metal = 0.6, rough = 0.28) => new THREE.MeshPhysicalMaterial({ color, metalness: metal, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.12 });
/** A visor: dark, mirror-smooth, faintly gold, as real ones are. */
const visorGlass = () => new THREE.MeshPhysicalMaterial({ color: 0x2a2416, metalness: 0.95, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 });

class Builder {
  geoms: THREE.BufferGeometry[] = [];
  mats: THREE.Material[] = [];
  mesh(geom: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    this.geoms.push(geom);
    if (!this.mats.includes(mat)) this.mats.push(mat);
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
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
  let work = 0; let wave = 0; let chat = 0;
  return (p: PoseInput) => {
    b.hips.rotation.z = 0;
    b.head.rotation.x = 0;
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
    // Gestures, eased in and out so nothing snaps.
    const gw = (want: boolean) => (want ? 1 : 0);
    work = easeTo(work, gw(p.gesture === 'work'), p.dt, 4);
    wave = easeTo(wave, gw(p.gesture === 'wave'), p.dt, 6);
    chat = easeTo(chat, gw(p.gesture === 'chat'), p.dt, 4);
    if (work > 0.01) {
      // Down on one knee at the job: reaching in, a tool going up and down.
      // Front thigh level and its shin straight down to the boot; the back knee
      // on the ground, its shin flat behind; the hips down to suit.
      const L = THREE.MathUtils.lerp;
      b.hips.position.y -= 0.47 * work;
      b.torso.rotation.x = L(b.torso.rotation.x, 0.32, work);
      b.legs[0].rotation.x = L(b.legs[0].rotation.x, -1.45, work); b.shins[0].rotation.x = L(b.shins[0].rotation.x, 1.45, work);
      b.legs[1].rotation.x = L(b.legs[1].rotation.x, 0.12, work); b.shins[1].rotation.x = L(b.shins[1].rotation.x, 1.5, work);
      b.arms[0].rotation.x = THREE.MathUtils.lerp(b.arms[0].rotation.x, -0.9 + Math.sin(p.t * 7) * 0.35, work);
      b.arms[1].rotation.x = THREE.MathUtils.lerp(b.arms[1].rotation.x, -0.7, work);
      b.fores[0].rotation.x = THREE.MathUtils.lerp(b.fores[0].rotation.x, -0.6 - Math.max(0, Math.sin(p.t * 7)) * 0.5, work);
      b.head.rotation.x = 0.35 * work;
    }
    if (wave > 0.01) {
      // The right arm up and swinging over the head.
      b.arms[0].rotation.x = THREE.MathUtils.lerp(b.arms[0].rotation.x, -2.75, wave);
      b.arms[0].rotation.z = THREE.MathUtils.lerp(b.arms[0].rotation.z, -0.25 + Math.sin(p.t * 9) * 0.38, wave);
      b.fores[0].rotation.x = THREE.MathUtils.lerp(b.fores[0].rotation.x, -0.35, wave);
    }
    if (chat > 0.01) {
      // Weight on one leg, hands going as they talk, a nod now and then.
      b.hips.rotation.z = Math.sin(p.t * 0.6) * 0.05 * chat;
      b.fores[0].rotation.x -= Math.max(0, Math.sin(p.t * 2.6)) * 0.6 * chat;
      b.fores[1].rotation.x -= Math.max(0, Math.sin(p.t * 2.1 + 1.5)) * 0.4 * chat;
      b.head.rotation.x = Math.sin(p.t * 1.7) * 0.12 * chat;
    }
    // Down: a knee, then flat on the back; up again as it fades.
    b.root.rotation.x = -Math.min(1, p.downness * 1.5) * 1.45;
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
  // A belt with a buckle, and for the colonist a chest control box with lit keys.
  B.mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 20), dark, hips, 0, 0.06, 0).rotation.x = Math.PI / 2;
  B.mesh(new THREE.BoxGeometry(0.08, 0.06, 0.03), lacquer(0x9a8f7a, 0.9, 0.3), hips, 0, 0.06, 0.2);
  if (kind === 'colonist') {
    B.mesh(new THREE.BoxGeometry(0.2, 0.12, 0.06), std(0x5a5f66, 0.5, 0.5), torso, 0, 0.3, 0.19);
    const keys = [glow(0x3ee6a0), glow(0xffb340), glow(0x5ac8ff)];
    keys.forEach((k, i) => B.mesh(new THREE.BoxGeometry(0.03, 0.025, 0.01), k, torso, -0.05 + i * 0.05, 0.31, 0.225));
  }
  if (kind === 'hunter') {
    // Plates: chest, one heavy shoulder.
    const plate = lacquer(color, 0.75, 0.25);
    B.mesh(new THREE.BoxGeometry(0.42, 0.26, 0.1), plate, torso, 0, 0.42, 0.15);
    B.mesh(new THREE.SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), plate, torso, -0.27, 0.58, 0).scale.set(1.2, 0.8, 1.1);
    // Ammunition cells across the chest, lit.
    for (let i = 0; i < 3; i++) B.mesh(new THREE.BoxGeometry(0.06, 0.08, 0.03), i === 1 ? eye : dark, torso, -0.1 + i * 0.1, 0.33, 0.205);
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
    B.mesh(new THREE.SphereGeometry(0.17, 20, 16), lacquer(color, 0.75, 0.22), head, 0, 0.12, 0);
    B.mesh(new THREE.BoxGeometry(0.3, 0.07, 0.07), lacquer(0x1a1c20, 0.8, 0.3), head, 0, 0.13, 0.13);
    B.mesh(new THREE.BoxGeometry(0.24, 0.035, 0.05), eye, head, 0, 0.13, 0.15);
    B.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), dark, head, 0.12, 0.25, -0.02);
  } else {
    // A colonist's bubble helmet: the face a dark glass, a lamp on the brow.
    B.mesh(new THREE.SphereGeometry(0.18, 20, 16), visorGlass(), head, 0, 0.12, 0.01);
    // The shell behind the visor, and a lamp on each side.
    B.mesh(new THREE.SphereGeometry(0.185, 20, 16, Math.PI * 0.6, Math.PI * 0.8), suit, head, 0, 0.12, 0).rotation.y = Math.PI;
    B.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), eye, head, 0.17, 0.16, 0.04).rotation.z = Math.PI / 2;
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
    B.mesh(new THREE.SphereGeometry(0.06, 10, 8), dark, fore, 0, -0.32, 0);
    B.mesh(new THREE.TorusGeometry(0.062, 0.018, 6, 14), kind === 'hunter' ? lacquer(color, 0.75, 0.25) : dark, fore, 0, -0.25, 0).rotation.x = Math.PI / 2;
    arms.push(arm); fores.push(fore);
    const leg = B.pivot(hips, sign * 0.11, -0.06, 0);
    B.mesh(new THREE.CapsuleGeometry(0.085, 0.3, 3, 8), suit, leg, 0, -0.22, 0);
    const shin = B.pivot(leg, 0, -0.44, 0);
    B.mesh(new THREE.CapsuleGeometry(0.075, 0.3, 3, 8), suit, shin, 0, -0.2, 0);
    B.mesh(new THREE.BoxGeometry(0.13, 0.08, 0.26), dark, shin, 0, -0.42, 0.04);
    B.mesh(new THREE.BoxGeometry(0.14, 0.03, 0.28), std(0x15171a, 0.9, 0.1), shin, 0, -0.465, 0.04);
    B.mesh(new THREE.SphereGeometry(0.075, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), kind === 'hunter' ? lacquer(color, 0.75, 0.25) : dark, shin, 0, 0.0, 0.05).rotation.x = Math.PI / 2;
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
  const shell = lacquer(color, 0.15, 0.35);
  const trim = lacquer(0xe07a22, 0.2, 0.4);
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
  let cheer = 0;
  return {
    root, height: 0.55, radius: 0.5, muzzle, eye, hover: 0,
    animate(p) {
      roll += (p.speed * p.dt) / R;
      ball.rotation.x = roll;
      // A happy spin and a hop.
      cheer = easeTo(cheer, p.gesture === 'celebrate' ? 1 : 0, p.dt, 6);
      const hop = Math.abs(Math.sin(p.t * 11)) * 0.18 * cheer;
      ball.position.y = R + hop;
      dome.rotation.x = Math.sin(p.t * 2) * 0.05 - (p.mode === 'down' ? 0.5 : 0);
      dome.rotation.y = p.aiming ? 0 : Math.sin(p.t * 0.7) * 0.6 + cheer * p.t * 9;
      dome.position.y = R * 2 + 0.02 + hop + (p.mode === 'talk' ? Math.abs(Math.sin(p.t * 6)) * 0.03 : 0);
      root.rotation.z = p.downness * 0.6;
      eye.color.set(p.mode === 'attack' ? 0xff6a3a : 0x6cf0ff).lerp(WHITE, p.hurt);
    },
    dispose: () => B.dispose(),
  };
}

function tallDroid(color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const gold = lacquer(color, 0.9, 0.22);
  const joint = std(0x2a2d33, 0.5, 0.6);
  const eye = glow(0xffd36a);
  const hipY = 1.18;
  const hips = B.pivot(root, 0, hipY, 0);
  hips.userData.y = hipY;
  B.mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.16, 10), joint, hips);
  const torso = B.pivot(hips, 0, 0.08, 0);
  B.mesh(new THREE.CylinderGeometry(0.24, 0.16, 0.55, 8), gold, torso, 0, 0.3, 0);
  B.mesh(new THREE.BoxGeometry(0.2, 0.14, 0.04), glow(0x3fd0a0), torso, 0, 0.35, 0.21);
  // Ribbed waist, a collar and a chest plate.
  for (let i = 0; i < 3; i++) B.mesh(new THREE.TorusGeometry(0.13 - i * 0.005, 0.02, 6, 18), joint, torso, 0, 0.02 + i * 0.045, 0).rotation.x = Math.PI / 2;
  B.mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.06, 12), joint, torso, 0, 0.6, 0);
  B.mesh(new THREE.BoxGeometry(0.3, 0.2, 0.03), gold, torso, 0, 0.47, 0.19);
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
  B.mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 5), rust, body, -0.1, 0.32, -0.05);
  const beacon = glow(0xff3020);
  const tip = B.mesh(new THREE.SphereGeometry(0.03, 8, 6), beacon, body, -0.1, 0.49, -0.05);
  tip.userData.dynamic = true;
  let bob = Math.random() * 10;
  let dig = 0;
  return {
    root, height: 0, radius: 0.6, muzzle, eye, hover: 1.7,
    animate(p) {
      bob += p.dt;
      dig = easeTo(dig, p.gesture === 'salvage' ? 1 : 0, p.dt, 2);
      body.position.y = Math.sin(bob * 2.1) * 0.12 * (1 - dig * 0.7) - p.downness * 1.6 - dig * 1.05;
      body.rotation.z = Math.sin(bob * 1.3) * 0.08 + p.downness * 0.9;
      body.rotation.x = Math.min(0.3, p.speed * 0.05) + (p.aiming ? 0.15 : 0);
      for (const r of rotors) {
        if (r.userData.claw) r.rotation.x = Math.sin(bob * (3 + dig * 9) + r.position.x * 9) * (0.3 + dig * 0.35);
        else r.rotation.y += p.dt * (p.mode === 'down' ? 0 : 40);
      }
      eye.color.set(p.mode === 'attack' ? 0xff2010 : 0xff8a30).lerp(WHITE, p.hurt);
      tip.visible = p.mode !== 'down' && (bob % 1.2) < 0.15;
    },
    dispose: () => B.dispose(),
  };
}

/** A trader of the Lantern Market: tall and light-boned, a long neck and a crest, legs that bend
 *  back at the ankle, and bands of light down the body that pulse as they talk. */
function alien(color: number): Rig {
  const B = new Builder();
  const root = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(0x2a2236), 0.6), roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 1, sheenColor: new THREE.Color(color) });
  const bands = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6), toneMapped: false });
  const robe = std(0x2d2238, 0.85, 0.05);
  const eye = glow(0xffffff);
  const hipY = 1.25;
  const hips = B.pivot(root, 0, hipY, 0);
  hips.userData.y = hipY;
  B.mesh(new THREE.SphereGeometry(0.16, 12, 10), skin, hips).scale.set(1.2, 0.8, 0.9);
  // A wrap round the waist, hanging in strips.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    B.mesh(new THREE.BoxGeometry(0.1, 0.5, 0.02), robe, hips, Math.cos(a) * 0.17, -0.25, Math.sin(a) * 0.15).rotation.y = -a;
  }
  const torso = B.pivot(hips, 0, 0.1, 0);
  B.mesh(new THREE.CapsuleGeometry(0.13, 0.5, 4, 12), skin, torso, 0, 0.36, 0).scale.set(1.1, 1, 0.75);
  for (let i = 0; i < 4; i++) B.mesh(new THREE.TorusGeometry(0.13, 0.012, 4, 18), bands, torso, 0, 0.18 + i * 0.12, 0).rotation.x = Math.PI / 2;
  const neck = B.pivot(torso, 0, 0.72, 0.02);
  B.mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.32, 8), skin, neck, 0, 0.16, 0);
  const head = B.pivot(neck, 0, 0.34, 0.02);
  B.mesh(new THREE.SphereGeometry(0.12, 14, 12), skin, head, 0, 0.04, 0.05).scale.set(0.85, 1.05, 1.35);
  // The crest, lit along its edge.
  B.mesh(new THREE.ConeGeometry(0.05, 0.36, 6), skin, head, 0, 0.18, -0.08).rotation.x = -0.9;
  B.mesh(new THREE.BoxGeometry(0.012, 0.3, 0.012), bands, head, 0, 0.2, -0.1).rotation.x = -0.9;
  for (const x of [-0.05, 0.05]) B.mesh(new THREE.SphereGeometry(0.022, 8, 6), eye, head, x, 0.06, 0.19);
  const arms: THREE.Object3D[] = []; const fores: THREE.Object3D[] = []; const legs: THREE.Object3D[] = []; const shins: THREE.Object3D[] = [];
  for (let s = 0; s < 2; s++) {
    const sign = s === 0 ? 1 : -1;
    const arm = B.pivot(torso, sign * 0.17, 0.62, 0);
    B.mesh(new THREE.CapsuleGeometry(0.035, 0.36, 3, 8), skin, arm, 0, -0.21, 0);
    const fore = B.pivot(arm, 0, -0.44, 0);
    B.mesh(new THREE.CapsuleGeometry(0.03, 0.34, 3, 8), skin, fore, 0, -0.2, 0);
    for (let f = 0; f < 3; f++) B.mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.12, 4), skin, fore, (f - 1) * 0.02, -0.43, 0.01);
    arms.push(arm); fores.push(fore);
    const leg = B.pivot(hips, sign * 0.1, -0.05, 0);
    // Thigh angled forward, the long "shin" (the foot bones) back, then a toe on the ground: digitigrade.
    const thigh = B.mesh(new THREE.CapsuleGeometry(0.06, 0.38, 3, 8), skin, leg, 0, -0.2, 0.06);
    thigh.rotation.x = -0.35;
    const shin = B.pivot(leg, 0, -0.44, 0.13);
    const sh = B.mesh(new THREE.CapsuleGeometry(0.045, 0.4, 3, 8), skin, shin, 0, -0.22, -0.1);
    sh.rotation.x = 0.5;
    B.mesh(new THREE.ConeGeometry(0.05, 0.22, 6), skin, shin, 0, -0.45, -0.1).rotation.x = Math.PI / 2;
    legs.push(leg); shins.push(shin);
  }
  const animate = limbs({ hips, torso, head, arms, fores, legs, shins, root, stride: 2.4 });
  let pulse = Math.random() * 10;
  const bandBase = bands.color.clone();
  return {
    root, height: 1.6, radius: 0.5, muzzle: head, eye, hover: 0,
    animate(p) {
      animate(p);
      neck.rotation.x = Math.sin(p.t * 0.7 + pulse) * 0.08 + (p.mode === 'talk' ? 0.15 : 0);
      // Bands roll with light faster when they talk, as the villagers' do.
      pulse += p.dt * (p.mode === 'talk' || p.gesture === 'chat' ? 4 : 1.2);
      bands.color.copy(bandBase).multiplyScalar(0.7 + 0.5 * Math.max(0, Math.sin(pulse * 2)));
      eye.color.setScalar(1).lerp(new THREE.Color(1, 0.4, 0.3), p.hurt);
    },
    dispose: () => { B.dispose(); skin.dispose(); bands.dispose(); },
  };
}

function skinRig(root: THREE.Object3D): void {
  root.updateMatrixWorld(true);
  const bones: THREE.Object3D[] = [];
  root.traverse((o) => { if (!(o as THREE.Mesh).isMesh) bones.push(o); });
  const boneOf = new Map(bones.map((b, i) => [b, i]));
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<string, { material: THREE.Material; parts: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.dynamic || Array.isArray(mesh.material) || !mesh.parent) return;
    const bone = boneOf.get(mesh.parent);
    if (bone === undefined) return;
    const g = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone());
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
    g.clearGroups();
    const n = g.attributes.position.count;
    const idx = new Uint16Array(n * 4); const wt = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { idx[i * 4] = bone; wt[i * 4] = 1; }
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4));
    g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(wt, 4));
    const key = mesh.material.uuid;
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { material: mesh.material, parts: [], meshes: [] }));
    b.parts.push(g);
    b.meshes.push(mesh);
  });
  // Bones are the pivots themselves: the skeleton reads their world matrices, so the animation
  // that turns them keeps working unchanged.
  const skeleton = new THREE.Skeleton(bones as THREE.Bone[]);
  for (const b of buckets.values()) {
    // A material whose parts carry colours: every part needs them, or the merge cannot line up.
    const withColor = b.parts.some((g) => g.attributes.color);
    if (withColor) for (const g of b.parts) if (!g.attributes.color) g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
    const merged = mergeGeometries(b.parts, false);
    for (const g of b.parts) g.dispose();
    if (!merged) continue;
    for (const m of b.meshes) m.removeFromParent();
    const sm = new THREE.SkinnedMesh(merged, b.material);
    sm.name = 'baked';
    sm.castShadow = true;
    sm.receiveShadow = true;
    sm.frustumCulled = false;
    root.add(sm);
    sm.bind(skeleton, new THREE.Matrix4());
  }
}

/** Each joint's pieces merged by material: a figure of forty parts draws in a dozen calls. The
 *  joints themselves stay separate (they are what the animation turns). */
function bakeRig(rig: Rig): Rig {
  // Parts whose surfaces differ only in colour share one material, the colour carried in the
  // vertices; then each joint is one opaque draw (plus anything that glows or is see-through).
  const shared = new Map<string, THREE.MeshPhysicalMaterial>();
  rig.root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.dynamic || Array.isArray(mesh.material)) return;
    const m = mesh.material as THREE.MeshPhysicalMaterial;
    if (!(m as THREE.MeshStandardMaterial).isMeshStandardMaterial || m.transparent) return;
    const phys = !!m.isMeshPhysicalMaterial;
    // Three finishes are enough at this size: matte cloth and suit, satin metal, and lacquer or
    // glass; colour rides in the vertices.
    const glossy = phys && (m.clearcoat > 0.3 || m.metalness > 0.85);
    const finish = glossy ? 'gloss' : m.metalness > 0.35 ? 'metal' : 'matte';
    const key = `${finish}|${m.side}|${m.emissive.getHex() ? m.emissive.getHexString() : ''}|${phys && m.sheen > 0 ? 'sheen' : ''}`;
    let s = shared.get(key);
    if (!s) {
      s = new THREE.MeshPhysicalMaterial({
        vertexColors: true, side: m.side,
        roughness: finish === 'gloss' ? 0.18 : finish === 'metal' ? 0.4 : 0.75,
        metalness: finish === 'gloss' ? 0.6 : finish === 'metal' ? 0.65 : 0.1,
        clearcoat: finish === 'gloss' ? 1 : 0, clearcoatRoughness: 0.1,
        sheen: phys ? m.sheen : 0, sheenColor: phys ? m.sheenColor : undefined,
        emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, envMapIntensity: finish === 'gloss' ? 1.4 : 1,
      });
      shared.set(key, s);
    }
    const g = mesh.geometry;
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = m.color.r; col[i * 3 + 1] = m.color.g; col[i * 3 + 2] = m.color.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    mesh.material = s;
  });
  // Then the whole figure becomes one skinned mesh per material: every joint a bone (the pivots
  // the animation already turns), every part weighted fully to the joint it hangs from. The
  // figure draws in two or three calls, not one per part.
  skinRig(rig.root);
  const dispose = rig.dispose;
  rig.dispose = () => { rig.root.traverse((o) => { if (o.name === 'baked') (o as THREE.Mesh).geometry.dispose(); }); for (const s of shared.values()) s.dispose(); dispose(); };
  return rig;
}

export function buildRig(kind: BodyKind, color: number): Rig {
  return bakeRig(rawRig(kind, color));
}

function rawRig(kind: BodyKind, color: number): Rig {
  if (kind === 'alien') return alien(color);
  if (kind === 'ballDroid') return ballDroid(color);
  if (kind === 'tallDroid') return tallDroid(color);
  if (kind === 'scav') return scav(color);
  return humanoid(kind, color);
}
