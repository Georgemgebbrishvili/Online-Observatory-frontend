// Where the objective in hand is, in the world: a tall column of light the
// crew can find from across the plain, a ring on the ground at its foot and
// a chevron bobbing over it. Drawn over nothing and lit by nothing, in the
// HUD's own amber, so it reads as guidance rather than as part of the base.
// It fades as the crew walks into it, so the thing to use stays in view.
//
// Each frame it also says where that place is on the screen, for the tag
// the HUD pins over it (distance, and an edge arrow when it is off the glass).

import * as THREE from 'three';

/** Where the marker is on the screen: 0…1 from the left and the top. */
export interface MarkerScreen {
  on: boolean;
  x: number;
  y: number;
  /** In front of the camera and inside the frame. */
  inFrame: boolean;
  /** Metres from the crew, on the ground. */
  distance: number;
}

export interface ObjectiveMarker {
  group: THREE.Group;
  screen: MarkerScreen;
  /** `at` null hides it. `crew` is where the crew is; the camera has already moved this frame. */
  update: (dt: number, at: { x: number; z: number } | null, crew: THREE.Vector3, heightAt: (x: number, z: number) => number, camera: THREE.Camera) => void;
  dispose: () => void;
}

const COLOR = new THREE.Color(0xffb347);
const COLUMN_H = 70;
/** Inside this, the marker is gone; past FULL it is at full strength, m. */
const NEAR = 2.2;
const FULL = 7;

const COLUMN_VERT = /* glsl */ `
  varying float vH; varying float vFacing;
  void main() {
    vH = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }`;

const COLUMN_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
  varying float vH; varying float vFacing;
  void main() {
    // Bright at the foot, gone at the top; soft at the sides; a slow pulse
    // climbing it so it reads as alive from far off.
    float fade = pow(1.0 - vH, 1.6);
    float core = pow(vFacing, 1.5);
    float pulse = 0.8 + 0.2 * sin(vH * 40.0 - uTime * 3.0);
    gl_FragColor = vec4(uColor * 1.6, fade * core * pulse * uOpacity);
  }`;

export function makeObjectiveMarker(): ObjectiveMarker {
  const group = new THREE.Group();
  group.name = 'objective-marker';
  group.visible = false;

  const columnGeo = new THREE.CylinderGeometry(0.5, 0.5, COLUMN_H, 24, 1, true);
  columnGeo.translate(0, COLUMN_H / 2, 0);
  const columnMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: COLOR.clone() }, uOpacity: { value: 0 }, uTime: { value: 0 } },
    vertexShader: COLUMN_VERT, fragmentShader: COLUMN_FRAG,
    // Drawn over what stands in front of it, the way a waypoint is: the place
    // is often inside a hull or behind a habitat.
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  });
  const column = new THREE.Mesh(columnGeo, columnMat);
  column.renderOrder = 20;
  column.frustumCulled = false;
  group.add(column);

  const ringGeo = new THREE.RingGeometry(0.85, 1.1, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: COLOR, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.06;
  ring.renderOrder = 20;
  group.add(ring);

  const chevronGeo = new THREE.ConeGeometry(0.32, 0.55, 4);
  chevronGeo.rotateX(Math.PI);
  const chevronMat = new THREE.MeshBasicMaterial({ color: COLOR, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false });
  const chevron = new THREE.Mesh(chevronGeo, chevronMat);
  chevron.renderOrder = 21;
  group.add(chevron);

  const screen: MarkerScreen = { on: false, x: 0.5, y: 0.5, inFrame: false, distance: -1 };
  const tip = new THREE.Vector3();
  let t = 0;
  let k = 0;

  return {
    group,
    screen,
    update(dt, at, crew, heightAt, camera) {
      t += dt;
      if (!at) {
        k = Math.max(0, k - dt * 4);
      } else {
        const d = Math.hypot(at.x - crew.x, at.z - crew.z);
        const want = THREE.MathUtils.smoothstep(d, NEAR, FULL);
        k += (want - k) * (1 - Math.exp(-dt * 6));
        group.position.set(at.x, heightAt(at.x, at.z), at.z);
        // Wider far off, so a column across the plain is more than a hair.
        const wide = THREE.MathUtils.clamp(d / 60, 1, 4);
        column.scale.set(wide, 1, wide);
        screen.distance = d;
      }
      group.visible = k > 0.01;
      columnMat.uniforms.uOpacity.value = 0.4 * k;
      columnMat.uniforms.uTime.value = t;
      const beat = 0.5 + 0.5 * Math.sin(t * 3);
      ringMat.opacity = (0.45 + 0.35 * beat) * k;
      ring.scale.setScalar(1 + 0.15 * beat);
      chevronMat.opacity = 0.95 * k;
      chevron.position.y = 2.7 + Math.sin(t * 2.2) * 0.18;
      chevron.rotation.y = t * 1.4;

      screen.on = !!at;
      if (!at) { screen.inFrame = false; return; }
      tip.set(group.position.x, group.position.y + 2.2, group.position.z).project(camera);
      // Behind the camera the projection mirrors: flip it so the edge arrow points the right way.
      const behind = tip.z > 1;
      if (behind) { tip.x = -tip.x; tip.y = -tip.y; }
      screen.inFrame = !behind && Math.abs(tip.x) <= 1 && Math.abs(tip.y) <= 1;
      screen.x = tip.x * 0.5 + 0.5;
      screen.y = 0.5 - tip.y * 0.5;
    },
    dispose() {
      columnGeo.dispose(); columnMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
      chevronGeo.dispose(); chevronMat.dispose();
      group.removeFromParent();
    },
  };
}
