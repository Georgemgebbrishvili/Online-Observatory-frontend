// Lightning in the clouds. On Venus it lights the murk overhead; on the
// giants it flickers deep in the cloud sea under the deck, kilometres down,
// a bloom that comes and goes two or three times in a second. Each flash
// lifts the sky light for a moment, and its thunder arrives as long after as
// the distance says.

import * as THREE from 'three';

export interface LightningHandle {
  group: THREE.Group;
  update: (dt: number, at: THREE.Vector3, hemi: THREE.HemisphereLight, thunder: (k: number) => void) => void;
  dispose: () => void;
}

function flashTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.2, 'rgba(225,235,255,0.6)');
  grad.addColorStop(0.55, 'rgba(170,190,255,0.18)');
  grad.addColorStop(1, 'rgba(150,170,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** `below`: the flashes are down in a cloud sea (the giants); otherwise up in an overcast (Venus). */
export function makeLightning(opts: { below: boolean; tint?: number }): LightningHandle {
  const group = new THREE.Group();
  group.name = 'lightning';
  const tex = flashTexture();
  const mat = new THREE.SpriteMaterial({ map: tex, color: opts.tint ?? 0xdfe6ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  sprite.visible = false;
  group.add(sprite);
  let next = 2 + Math.random() * 4;
  let age = -1;
  let strokes: number[] = [];
  let baseHemi = -1;
  const thunders: { at: number; k: number }[] = [];
  let clock = 0;
  return {
    group,
    update(dt, at, hemi, thunder) {
      clock += dt;
      if (baseHemi < 0) baseHemi = hemi.intensity;
      next -= dt;
      if (next <= 0 && age < 0) {
        next = 2.5 + Math.random() * 7;
        age = 0;
        // Two to four return strokes in under half a second.
        strokes = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, i) => i * (0.07 + Math.random() * 0.1));
        const a = Math.random() * Math.PI * 2;
        const d = 350 + Math.random() * 1400;
        const y = opts.below ? -(60 + Math.random() * 320) : 500 + Math.random() * 600;
        sprite.position.set(at.x + Math.cos(a) * d, at.y + y, at.z + Math.sin(a) * d);
        sprite.scale.setScalar(260 + Math.random() * 420);
        sprite.visible = true;
        thunders.push({ at: clock + d / 340, k: Math.max(0.15, 1 - d / 1800) });
      }
      let k = 0;
      if (age >= 0) {
        age += dt;
        for (const s0 of strokes) { const x = age - s0; if (x >= 0) k = Math.max(k, Math.exp(-x * 26)); }
        if (age > (strokes[strokes.length - 1] ?? 0) + 0.4) { age = -1; sprite.visible = false; k = 0; }
      }
      mat.opacity = k;
      hemi.intensity = baseHemi * (1 + k * 0.9);
      while (thunders.length && thunders[0].at <= clock) thunder(thunders.shift()!.k);
    },
    dispose() { tex.dispose(); mat.dispose(); },
  };
}
