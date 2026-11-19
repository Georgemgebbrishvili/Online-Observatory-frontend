// Now and then, far beyond the system, a star dies. A supernova on the
// celestial sphere: a point that brightens in a couple of seconds to outshine
// everything in the sky, throws diffraction spikes, then fades over half a
// minute from blue-white through gold to a dull red, while a shell of gas
// swells round where it was and thins out. A few smaller novae flicker in
// between. Everything rides at a fixed distance from the camera, the way the
// stars do, so it sits at infinity whatever the ship does.

import * as THREE from 'three';

export interface SkyEventsHandle {
  group: THREE.Group;
  /** Every frame: keep the events on the sky round the camera, and run their light curves. */
  update: (dt: number, camera: THREE.Camera) => void;
  /** Development: set one off now. */
  trigger: () => void;
  /** Told when a supernova goes off (the glass can say so). */
  onSupernova?: (dir: THREE.Vector3) => void;
  dispose: () => void;
}

const DIST = 380;
const RISE_S = 2.2;
const FADE_S = 34;
const SHELL_S = 70;

function radialTexture(stops: [number, string][], size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, col] of stops) grad.addColorStop(at, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Four thin spikes crossing at the centre, the way a bright star looks through a telescope's vanes. */
function spikeTexture(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.translate(size / 2, size / 2);
  g.rotate(Math.PI / 4);
  for (let k = 0; k < 2; k++) {
    if (k) g.rotate(Math.PI / 2);
    const grad = g.createLinearGradient(-size / 2, 0, size / 2, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(-size / 2, -1.2, size, 2.4);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A thin bright rim with a soft inside: an expanding shell seen in projection. */
function shellTexture(size = 256): THREE.CanvasTexture {
  return radialTexture([
    [0, 'rgba(255,120,90,0.0)'], [0.55, 'rgba(255,140,110,0.05)'], [0.82, 'rgba(255,170,140,0.35)'],
    [0.9, 'rgba(160,210,255,0.55)'], [0.96, 'rgba(120,180,255,0.15)'], [1, 'rgba(120,180,255,0)'],
  ], size);
}

interface Burst {
  core: THREE.Sprite;
  halo: THREE.Sprite;
  spikes: THREE.Sprite;
  shell: THREE.Sprite;
  dir: THREE.Vector3;
  age: number;
  /** Peak angular size of the core, rad; a nova is a fraction of a supernova. */
  peak: number;
  big: boolean;
  spin: number;
}

const additive = (map: THREE.Texture) => new THREE.SpriteMaterial({
  map, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: false, fog: false,
});

/** Blue-white at the peak, through gold, to a dull red as it fades: by fraction of the fade. */
const tint = (out: THREE.Color, k: number) => {
  if (k < 0.25) out.setRGB(0.85 + k * 0.6, 0.92, 1.0);
  else if (k < 0.6) out.setRGB(1.0, 0.92 - (k - 0.25) * 0.8, 0.85 - (k - 0.25) * 1.6);
  else out.setRGB(1.0 - (k - 0.6) * 0.6, 0.64 - (k - 0.6) * 0.9, 0.29 - (k - 0.6) * 0.5);
  return out;
};

export function makeSkyEvents(lite: boolean, opts: { firstIn?: [number, number]; every?: [number, number] } = {}): SkyEventsHandle {
  const group = new THREE.Group();
  group.name = 'sky-events';
  group.renderOrder = -1;
  const coreTex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.12, 'rgba(255,255,255,0.95)'], [0.35, 'rgba(200,225,255,0.35)'], [1, 'rgba(160,200,255,0)']]);
  const haloTex = radialTexture([[0, 'rgba(255,255,255,0.35)'], [0.4, 'rgba(180,210,255,0.12)'], [1, 'rgba(140,180,255,0)']]);
  const spikesTex = spikeTexture();
  const shellTex = shellTexture();
  const bursts: Burst[] = [];
  const pool = lite ? 2 : 3;
  for (let i = 0; i < pool; i++) {
    const b: Burst = {
      core: new THREE.Sprite(additive(coreTex)), halo: new THREE.Sprite(additive(haloTex)),
      spikes: new THREE.Sprite(additive(spikesTex)), shell: new THREE.Sprite(additive(shellTex)),
      dir: new THREE.Vector3(), age: -1, peak: 0, big: false, spin: 0,
    };
    for (const s of [b.shell, b.halo, b.spikes, b.core]) { s.visible = false; s.frustumCulled = false; group.add(s); }
    bursts.push(b);
  }
  const [f0, f1] = opts.firstIn ?? [25, 60];
  const [e0, e1] = opts.every ?? [80, 190];
  let nextSuper = f0 + Math.random() * (f1 - f0);
  let nextNova = 8 + Math.random() * 20;
  const col = new THREE.Color();

  const randomDir = (out: THREE.Vector3) => {
    // Anywhere, but a little more often near the galactic band, where the stars are.
    const t = Math.random() * Math.PI * 2;
    const lat = Math.random() < 0.6 ? (Math.random() + Math.random() - 1) * 0.5 : Math.asin(Math.random() * 2 - 1);
    return out.set(Math.cos(lat) * Math.cos(t), Math.sin(lat), Math.cos(lat) * Math.sin(t)).normalize();
  };
  const start = (big: boolean) => {
    const b = bursts.find((x) => x.age < 0) ?? bursts.reduce((a, x) => (x.age > a.age ? x : a));
    b.age = 0;
    b.big = big;
    b.peak = big ? 0.03 + Math.random() * 0.015 : 0.009 + Math.random() * 0.006;
    b.spin = Math.random() * Math.PI;
    randomDir(b.dir);
    b.spikes.visible = b.halo.visible = b.core.visible = true;
    b.shell.visible = big;
    if (big) handle.onSupernova?.(b.dir.clone());
  };

  const handle: SkyEventsHandle = {
    group,
    trigger: () => start(true),
    update(dt, camera) {
      group.position.copy(camera.position);
      nextSuper -= dt;
      nextNova -= dt;
      if (nextSuper <= 0) { start(true); nextSuper = e0 + Math.random() * (e1 - e0); }
      if (nextNova <= 0) { start(false); nextNova = 20 + Math.random() * 35; }
      for (const b of bursts) {
        if (b.age < 0) continue;
        b.age += dt;
        const fade = b.big ? FADE_S : FADE_S * 0.3;
        const life = b.big ? Math.max(fade + RISE_S, SHELL_S) : fade + RISE_S;
        if (b.age > life) {
          b.age = -1;
          b.core.visible = b.halo.visible = b.spikes.visible = b.shell.visible = false;
          continue;
        }
        // The light curve: a fast rise, a short plateau, then an exponential-looking decline.
        const rise = THREE.MathUtils.smootherstep(b.age, 0, b.big ? RISE_S : RISE_S * 0.5);
        const since = Math.max(0, b.age - RISE_S * 1.2);
        const k = Math.min(1, since / fade);
        const lum = rise * Math.exp(-3.2 * k) * (1 - THREE.MathUtils.smoothstep(k, 0.85, 1));
        // A little flicker on the way up, as the shock breaks out.
        const flick = b.age < RISE_S * 1.5 ? 1 + Math.sin(b.age * 37) * 0.08 * (1 - rise) : 1;
        tint(col, k);
        const p = b.dir;
        for (const s of [b.core, b.halo, b.spikes, b.shell]) s.position.copy(p).multiplyScalar(DIST);
        const cm = b.core.material as THREE.SpriteMaterial;
        cm.color.copy(col).multiplyScalar(1.4 * lum * flick);
        b.core.scale.setScalar(b.peak * (0.35 + 0.65 * lum));
        const hm = b.halo.material as THREE.SpriteMaterial;
        hm.color.copy(col).multiplyScalar(0.9 * lum);
        b.halo.scale.setScalar(b.peak * 5.5 * (0.5 + 0.5 * lum));
        const sm = b.spikes.material as THREE.SpriteMaterial;
        sm.color.copy(col).multiplyScalar(1.1 * lum);
        sm.rotation = b.spin;
        b.spikes.scale.setScalar(b.peak * 5 * lum);
        if (b.big) {
          // The shell swells from nothing and thins as it grows.
          const sk = Math.min(1, b.age / SHELL_S);
          const shm = b.shell.material as THREE.SpriteMaterial;
          shm.color.setRGB(1, 0.85, 0.9).multiplyScalar(0.9 * THREE.MathUtils.smoothstep(b.age, 1.5, 6) * (1 - sk) ** 1.4);
          b.shell.scale.setScalar(0.004 + sk * 0.16);
          shm.rotation = b.spin * 0.5 + b.age * 0.002;
        }
      }
    },
    dispose() {
      for (const b of bursts) for (const s of [b.core, b.halo, b.spikes, b.shell]) (s.material as THREE.SpriteMaterial).dispose();
      coreTex.dispose(); haloTex.dispose(); spikesTex.dispose(); shellTex.dispose();
    },
  };
  return handle;
}
