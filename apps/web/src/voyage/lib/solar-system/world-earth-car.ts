// A car to get round Tbilisi in: the pilot's red hatchback parked by the pad,
// or whatever the pilot takes off the street — a saloon, the marshrutka, a
// patrol car — and the police's own patrol cars, which drive with the same
// body and the same rules. It drives like a game car rather than a
// simulation — the stick is the throttle and the wheel, the brake becomes
// reverse once it has stopped, Space is the handbrake, and it drifts when the
// rear lets go — but the ground under it is the real one: it pitches up
// Sololaki's streets, rolls over kerbs on four sprung corners, stops against
// walls, and will not go into the river. Knocks wear it down: below a third
// it smokes, and at nothing the engine is dead.

import * as THREE from 'three';
import { mergeStatic, pivot } from '@/voyage/lib/solar-system/moon-batch';
import type { Collider } from '@/voyage/lib/solar-system/moon-cosmonaut';
import { withHaze } from '@/voyage/lib/solar-system/world-earth-haze';
import { carShape, type CarKind, type CarRole, type CarSpec } from '@/voyage/lib/solar-system/world-earth-carshape';

export interface CarInput {
  /** −1 brake / reverse … 1 throttle. */
  throttle: number;
  /** −1 left … 1 right. */
  steer: number;
  handbrake: boolean;
}

export interface CarWorld {
  floorAt: (x: number, z: number) => number;
  /** Push a circle out of walls; true when it hit something. */
  pushOut: (pos: THREE.Vector3, radius: number) => boolean;
  isWater: (x: number, z: number) => boolean;
  colliders: () => Collider[];
}

export interface CarImpact { c: Collider | null; speed: number }

export interface CarHandle {
  group: THREE.Group;
  /** Smoke from under the bonnet, in world space: add it to the scene beside the car. */
  fx: THREE.Points;
  position: THREE.Vector3;
  /** Heading, rad; +z forward at 0, as the crew. */
  yaw: number;
  /** Signed speed along the heading, m/s. */
  speed: number;
  /** Sideways slide, m/s. */
  slip: number;
  /** A knock this step, 0…1: the camera's jolt. */
  bump: number;
  /** 1 new … 0 dead. */
  health: number;
  /** How much a knock is shrugged off: 1 an ordinary car, more for a patrol car's push bars. */
  toughness: number;
  kind: CarKind;
  paint: THREE.Color;
  spec: CarSpec;
  /** The light bar, on a patrol car. */
  siren: boolean;
  /** What it hit this step (walls are `c: null`), with the closing speed. */
  impacts: CarImpact[];
  /** Where the driver's door is, for getting in. */
  door: (out: THREE.Vector3) => THREE.Vector3;
  /** Another body and paint, as a different car taken off the street. */
  restyle: (kind: CarKind, paint: THREE.Color, health?: number) => void;
  /** Straight to a place, at rest or rolling. */
  place: (x: number, z: number, yaw: number, speed?: number) => void;
  update: (dt: number, input: CarInput, world: CarWorld, night: number) => void;
  present: (alpha: number) => void;
  dispose: () => void;
}

const REVERSE_TOP = 7;
const MAX_STEER = 0.62;

const srgb = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
export const PILOT_RED = srgb(0.82, 0.13, 0.12);
export const POLICE_WHITE = srgb(0.92, 0.93, 0.94);

let puffTexture: THREE.CanvasTexture | null = null;
let puffUsers = 0;
function puff(): THREE.CanvasTexture {
  if (!puffTexture) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    r.addColorStop(0, 'rgba(255,255,255,0.9)');
    r.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    puffTexture = new THREE.CanvasTexture(c);
  }
  puffUsers += 1;
  return puffTexture;
}

const SMOKE = 24;

export function makeCar(x: number, z: number, yaw: number, floorAt: (x: number, z: number) => number, lite: boolean, kind: CarKind = 'hatch', paintColour: THREE.Color = PILOT_RED): CarHandle {
  const group = new THREE.Group();
  group.name = 'car';
  const materials: THREE.Material[] = [];
  const own = <M extends THREE.Material>(m: M, key: string) => { materials.push(withHaze(m, `car-${key}`)); return m; };
  const paint = own(new THREE.MeshPhysicalMaterial({ color: paintColour.clone(), roughness: 0.32, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.08 }), 'paint');
  const head = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(1, 0.95, 0.85), emissiveIntensity: 0.2, roughness: 0.2 });
  const tail = new THREE.MeshStandardMaterial({ color: srgb(0.5, 0.02, 0.02), emissive: new THREE.Color(1, 0.05, 0.03), emissiveIntensity: 0.3, roughness: 0.3 });
  // The light bar's lenses are matte: lit or not, they read as red and blue, never as the sky's reflection.
  const sirenR = new THREE.MeshStandardMaterial({ color: srgb(0.35, 0.02, 0.02), emissive: new THREE.Color(1, 0.06, 0.04), emissiveIntensity: 0.25, roughness: 0.75, metalness: 0, envMapIntensity: 0.2 });
  const sirenB = new THREE.MeshStandardMaterial({ color: srgb(0.02, 0.05, 0.35), emissive: new THREE.Color(0.08, 0.25, 1), emissiveIntensity: 0.25, roughness: 0.75, metalness: 0, envMapIntensity: 0.2 });
  materials.push(head, tail, sirenR, sirenB);
  const roleMat: Record<CarRole, THREE.Material> = {
    paint,
    glass: own(new THREE.MeshStandardMaterial({ color: srgb(0.05, 0.07, 0.09), roughness: 0.05, metalness: 0.8 }), 'glass'),
    trim: own(new THREE.MeshStandardMaterial({ color: srgb(0.06, 0.06, 0.07), roughness: 0.7 }), 'black'),
    chrome: own(new THREE.MeshStandardMaterial({ color: srgb(0.8, 0.8, 0.82), roughness: 0.2, metalness: 1 }), 'chrome'),
    plate: own(new THREE.MeshStandardMaterial({ color: srgb(0.92, 0.92, 0.9), roughness: 0.6 }), 'plate'),
    livery: own(new THREE.MeshStandardMaterial({ color: srgb(0.06, 0.2, 0.62), roughness: 0.4, metalness: 0.3 }), 'livery'),
    head, tail, sirenR, sirenB,
  };
  const tyre = own(new THREE.MeshStandardMaterial({ color: srgb(0.05, 0.05, 0.05), roughness: 0.95 }), 'tyre');

  // The body is rebuilt on a restyle; everything it owns is listed here.
  let body = pivot(new THREE.Group());
  let geometries: THREE.BufferGeometry[] = [];
  let wheels: { steer: THREE.Object3D; spin: THREE.Object3D; front: boolean }[] = [];
  let spec = carShape(kind, lite).spec;
  const build = (k: CarKind) => {
    for (const g of geometries) g.dispose();
    geometries = [];
    group.remove(body);
    body = pivot(new THREE.Group());
    group.add(body);
    const shape = carShape(k, lite);
    spec = shape.spec;
    for (const p of shape.parts) {
      geometries.push(p.geometry);
      const o = new THREE.Mesh(p.geometry, roleMat[p.role]);
      const lit = p.role === 'head' || p.role === 'tail' || p.role === 'sirenR' || p.role === 'sirenB' || p.role === 'glass' || p.role === 'plate';
      o.castShadow = !lit; o.receiveShadow = true;
      body.add(o);
    }
    const R = spec.wheelR;
    const tyreGeom = new THREE.CylinderGeometry(R, R, 0.21, lite ? 12 : 18).rotateZ(Math.PI / 2);
    const rimGeom = new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.22, lite ? 8 : 12).rotateZ(Math.PI / 2);
    geometries.push(tyreGeom, rimGeom);
    wheels = shape.wheels.map((w) => {
      const steer = pivot(new THREE.Group());
      steer.position.set(w.x, R, w.z);
      body.add(steer);
      const spin = pivot(new THREE.Group());
      steer.add(spin);
      const t = new THREE.Mesh(tyreGeom, tyre); t.castShadow = true; spin.add(t);
      spin.add(new THREE.Mesh(rimGeom, roleMat.chrome));
      return { steer, spin, front: w.front };
    });
    const merged = mergeStatic(group, { minCaster: 0.05 });
    geometries.push(...merged.geometries);
  };
  build(kind);

  // ── Smoke: a small pool of puffs in world space. ──
  const smokePos = new Float32Array(SMOKE * 3);
  const smokeAge = new Float32Array(SMOKE).fill(1);
  const smokeVel = new Float32Array(SMOKE * 3);
  const smokeGeom = new THREE.BufferGeometry();
  smokeGeom.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.PointsMaterial({ map: puff(), size: 1.6, transparent: true, depthWrite: false, color: 0x8a8a8a, opacity: 0.55, sizeAttenuation: true });
  const fx = new THREE.Points(smokeGeom, smokeMat);
  fx.name = 'car-smoke';
  fx.frustumCulled = false;
  fx.visible = false;
  let smokeNext = 0;
  let smokeT = 0;

  const position = new THREE.Vector3(x, floorAt(x, z), z);
  const prev = position.clone();
  let prevYaw = yaw;
  let vLat = 0;
  let yawRate = 0;
  let steerAngle = 0;
  let spinAngle = 0;
  let heaveVel = 0;
  let lastGround = position.y;
  let pitch = 0; let roll = 0;
  let flash = 0;
  const impacts: CarImpact[] = [];
  const wear = (closing: number) => {
    if (closing < 5) return;
    handle.health = Math.max(0, handle.health - Math.min(0.28, (closing - 5) * 0.014) / handle.toughness);
  };
  const handle: CarHandle = {
    group, fx, position, yaw, speed: 0, slip: 0, bump: 0, health: 1, toughness: 1, kind, paint: paintColour.clone(), spec, siren: false, impacts,
    door(out) {
      const side = handle.spec.width / 2 + 0.75;
      return out.set(position.x + Math.cos(handle.yaw) * side, position.y, position.z - Math.sin(handle.yaw) * side);
    },
    restyle(k, colour, health = 1) {
      if (k !== handle.kind) { build(k); handle.kind = k; handle.spec = spec; }
      paint.color.copy(colour);
      handle.paint.copy(colour);
      handle.health = health;
      handle.siren = false;
    },
    place(px, pz, pyaw, speed = 0) {
      position.set(px, floorAt(px, pz), pz);
      prev.copy(position);
      handle.yaw = pyaw; prevYaw = pyaw;
      handle.speed = speed; vLat = 0; yawRate = 0; heaveVel = 0; lastGround = position.y;
      handle.present(1);
    },
    update(dt, input, world, night) {
      prev.copy(position); prevYaw = handle.yaw;
      handle.bump = 0;
      impacts.length = 0;
      const S = handle.spec;
      const v = handle.speed;
      const dead = handle.health <= 0;
      // A tired engine pulls less.
      const pull = S.accel * (dead ? 0 : 0.55 + 0.45 * Math.min(1, handle.health * 2));
      // ── Longitudinal: throttle, brake-then-reverse, rolling drag, the hill. ──
      let accel = 0;
      if (input.throttle > 0.05) {
        accel = v < -0.3 ? 12 * input.throttle : pull * input.throttle * (1 - Math.max(0, v) / S.top);
      } else if (input.throttle < -0.05) {
        accel = v > 0.3 ? 12 * input.throttle : (dead ? 0 : 4.5) * input.throttle * (1 - Math.max(0, -v) / REVERSE_TOP);
      }
      if (Math.abs(input.throttle) <= 0.05 || (dead && input.throttle > 0)) {
        accel = -Math.sign(v) * Math.min(Math.abs(v) / dt, 1.4 + Math.abs(v) * 0.04);
      }
      if (input.handbrake) accel -= Math.sign(v) * Math.min(Math.abs(v) / dt, 6);
      const fwdX = Math.sin(handle.yaw); const fwdZ = Math.cos(handle.yaw);
      const reach = S.wheelbase / 2;
      const hAhead = world.floorAt(position.x + fwdX * reach, position.z + fwdZ * reach);
      const hBehind = world.floorAt(position.x - fwdX * reach, position.z - fwdZ * reach);
      const grade = (hAhead - hBehind) / (reach * 2);
      accel -= 9.81 * grade / Math.sqrt(1 + grade * grade);
      handle.speed = THREE.MathUtils.clamp(v + accel * dt, -REVERSE_TOP, S.top);

      // ── Steering: less lock at speed; the rear lets go on the handbrake. ──
      const lock = MAX_STEER / (1 + Math.abs(handle.speed) / 14);
      steerAngle += (input.steer * lock - steerAngle) * (1 - Math.exp(-dt * 8));
      const wantRate = (handle.speed * Math.tan(-steerAngle)) / S.wheelbase;
      const grip = input.handbrake ? S.grip * 0.36 : S.grip;
      const rateCap = grip / Math.max(3, Math.abs(handle.speed));
      yawRate += (THREE.MathUtils.clamp(wantRate, -rateCap - (input.handbrake ? 1.4 : 0), rateCap + (input.handbrake ? 1.4 : 0)) - yawRate) * (1 - Math.exp(-dt * (input.handbrake ? 4 : 10)));
      handle.yaw += yawRate * dt;
      // What the tyres could not take out of the turn becomes a slide.
      vLat += (wantRate - yawRate) * handle.speed * dt * (input.handbrake ? 0.6 : 0.25);
      vLat *= Math.exp(-dt * (input.handbrake ? 1.2 : 6));
      handle.slip = vLat;

      // The car's own right, facing +z at zero yaw, is −x.
      const rightX = -Math.cos(handle.yaw); const rightZ = Math.sin(handle.yaw);
      position.x += (Math.sin(handle.yaw) * handle.speed + rightX * vLat) * dt;
      position.z += (Math.cos(handle.yaw) * handle.speed + rightZ * vLat) * dt;

      // ── What it runs into. ──
      if (world.pushOut(position, S.hull)) {
        const closing = Math.abs(handle.speed);
        handle.bump = Math.min(1, closing / 12);
        impacts.push({ c: null, speed: closing });
        wear(closing);
        handle.speed *= -0.25;
        vLat *= 0.3;
      }
      for (const c of world.colliders()) {
        const dx = position.x - c.x; const dz = position.z - c.z;
        const d = Math.hypot(dx, dz); const min = c.r + S.hull;
        if (d < min && d > 1e-3) {
          position.x = c.x + dx / d * min; position.z = c.z + dz / d * min;
          // How fast the two were closing, along the line between them.
          const mv = c as Collider & { vx?: number; vz?: number };
          const rvx = Math.sin(handle.yaw) * handle.speed - (mv.vx ?? 0);
          const rvz = Math.cos(handle.yaw) * handle.speed - (mv.vz ?? 0);
          const closing = Math.max(0, -(rvx * dx + rvz * dz) / d);
          handle.bump = Math.max(handle.bump, Math.min(1, closing / 12));
          impacts.push({ c, speed: closing });
          wear(closing);
          handle.speed *= 0.4;
        }
      }
      if (world.isWater(position.x + fwdX * 2, position.z + fwdZ * 2) || world.isWater(position.x, position.z)) {
        position.x = prev.x; position.z = prev.z;
        handle.speed = 0; vLat = 0;
      }

      // ── Four corners on the ground, a sprung body over them. ──
      const cy = Math.cos(handle.yaw); const sy = Math.sin(handle.yaw);
      const T = S.track / 2;
      const corner = (lx: number, lz: number) => world.floorAt(position.x + lx * cy + lz * sy, position.z - lx * sy + lz * cy);
      const fl = corner(-T, reach); const fr = corner(T, reach);
      const rl = corner(-T, -reach); const rr = corner(T, -reach);
      const ground = (fl + fr + rl + rr) / 4;
      const wantPitch = Math.atan2((fl + fr) / 2 - (rl + rr) / 2, S.wheelbase) - accel * 0.004;
      const wantRoll = Math.atan2((fl + rl) / 2 - (fr + rr) / 2, S.track) + yawRate * handle.speed * 0.004;
      pitch += (wantPitch - pitch) * (1 - Math.exp(-dt * 9));
      roll += (wantRoll - roll) * (1 - Math.exp(-dt * 9));
      // A kerb: the ground under the wheels rose sharply since the last step.
      const gap = ground - lastGround;
      lastGround = ground;
      if (gap > 0.25) handle.bump = Math.max(handle.bump, Math.min(1, gap * 2));
      heaveVel += ((ground - position.y) * 140 - heaveVel * 14) * dt;
      position.y += heaveVel * dt;
      if (position.y < ground - 0.05) { position.y = ground - 0.05; heaveVel = Math.max(0, heaveVel); }

      spinAngle += (handle.speed / S.wheelR) * dt;
      for (const w of wheels) {
        w.spin.rotation.x = spinAngle;
        if (w.front) w.steer.rotation.y = -steerAngle;
      }
      const lamps = dead ? 0 : 1;
      head.emissiveIntensity = (0.2 + night * 2.6) * lamps;
      tail.emissiveIntensity = (0.3 + night * 1.2 + (input.throttle < -0.05 && handle.speed > 0.3 ? 2.5 : 0)) * lamps;
      // The light bar: red and blue in turn, a double flash each.
      flash += dt;
      const on = handle.siren && !dead;
      const phase = (flash * 2.2) % 1;
      const blink = (p: number) => (Math.sin(p * Math.PI * 2 * 4) > 0 ? 1 : 0);
      sirenR.emissiveIntensity = on && phase < 0.5 ? 6 * blink(phase) : 0.25;
      sirenB.emissiveIntensity = on && phase >= 0.5 ? 7 * blink(phase) : 0.25;

      // ── Smoke from the bonnet when it is hurt. ──
      const hurt = handle.health < 0.34;
      smokeT -= dt;
      if (hurt && smokeT <= 0) {
        smokeT = handle.health <= 0 ? 0.05 : handle.health < 0.15 ? 0.09 : 0.18;
        const i = smokeNext; smokeNext = (smokeNext + 1) % SMOKE;
        const nose = handle.spec.length * 0.36;
        smokePos[i * 3] = position.x + fwdX * nose + (Math.random() - 0.5) * 0.4;
        smokePos[i * 3 + 1] = position.y + 1.0;
        smokePos[i * 3 + 2] = position.z + fwdZ * nose + (Math.random() - 0.5) * 0.4;
        smokeVel[i * 3] = (Math.random() - 0.5) * 0.5; smokeVel[i * 3 + 1] = 1.1 + Math.random() * 0.6; smokeVel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        smokeAge[i] = 0;
      }
      let live = false;
      for (let i = 0; i < SMOKE; i++) {
        if (smokeAge[i] >= 1) { smokePos[i * 3 + 1] = -1e4; continue; }
        live = true;
        smokeAge[i] += dt / 2.2;
        smokePos[i * 3] += smokeVel[i * 3] * dt; smokePos[i * 3 + 1] += smokeVel[i * 3 + 1] * dt; smokePos[i * 3 + 2] += smokeVel[i * 3 + 2] * dt;
      }
      fx.visible = live;
      if (live) {
        smokeGeom.attributes.position.needsUpdate = true;
        smokeMat.color.setScalar(handle.health <= 0 ? 0.12 : handle.health < 0.15 ? 0.3 : 0.55);
      }
    },
    present(alpha) {
      group.position.lerpVectors(prev, position, alpha);
      group.rotation.set(0, 0, 0);
      group.rotateY(prevYaw + (handle.yaw - prevYaw) * alpha);
      body.rotation.set(-pitch, 0, roll);
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      smokeGeom.dispose(); smokeMat.dispose();
      puffUsers -= 1;
      if (puffUsers <= 0 && puffTexture) { puffTexture.dispose(); puffTexture = null; puffUsers = 0; }
    },
  };
  handle.present(1);
  return handle;
}
