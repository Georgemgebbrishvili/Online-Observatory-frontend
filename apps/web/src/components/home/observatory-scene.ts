import * as THREE from "three";

import { observatoryArt as art, palette, withAlpha } from "@/styles/tokens";

/**
 * The observatory at the foot of the homepage sky, in 3D (ADR-057). Metres throughout.
 *
 * A painted dome with a parallel-sided slit, its shutter run back over the top, on a
 * plaster drum and a concrete plinth, on a moonlit hill. Inside, a NexStar 8SE as the
 * observatory has it: the orange Schmidt–Cassegrain tube, its black cells, the coated
 * corrector with the secondary's holder at its centre, a star diagonal and eyepiece, a
 * red-dot finder, on a single fork arm over a pier.
 *
 * The mount is alt-azimuth, and moves like one: each axis accelerates and brakes within
 * its limits and settles with the slight give of a fork arm. The dome turns with it,
 * keeping the slit on the tube.
 */

// The building.
const DOME_R = 1.55;
const DRUM_R = 1.5;
const PLINTH_H = 0.28;
const DRUM_H = 1.9;
const DRUM_TOP = PLINTH_H + DRUM_H;
const DOME_Y = DRUM_TOP + 0.06;
const SLIT_HALF = 0.6;
const FLOOR_Y = 1.0;
// The telescope: an 8SE's proportions (203 mm aperture, 432 mm tube), enlarged, on a pier
// tall enough that its front stands out of the slit, so its aim reads from afar.
const OTA_R = 0.36;
const OTA_L = 1.45;
const PIVOT_Y = DOME_Y + 1.08;
const ARM_H = 0.9;
const ARM_X = OTA_R + 0.13;
// How far the tube leans out of the picture plane, toward the viewer, as it points: a
// little when it points up, more as it points aside, so the slit, which follows the
// tube, keeps facing us enough to show it.
const LEAN_UP = (12 * Math.PI) / 180;
const LEAN_ASIDE = (30 * Math.PI) / 180;
const MIN_ALT = (2 * Math.PI) / 180;
// A fork-mounted tube's diagonal meets the base short of the zenith.
const MAX_ALT = (84 * Math.PI) / 180;

const colour = (hex: string) => new THREE.Color(hex);

/** A soft round light, for window glows and the lamp: white, tinted by its material. */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, withAlpha(palette.white, 1));
  r.addColorStop(0.25, withAlpha(palette.white, 0.45));
  r.addColorStop(1, withAlpha(palette.white, 0));
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Grain for plaster and concrete, as a bump map. */
function grainTexture(seed: number) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < size * size; i++) {
    const v = 150 + rnd() * 70 + (rnd() < 0.02 ? -60 : 0);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/**
 * A sphere's upper half, keeping only the quads `keep` accepts: the dome less its slit,
 * or the shutter alone. Fine enough that the cut edges read straight.
 */
function hemisphere(
  radius: number,
  keep: (x: number, y: number, z: number) => boolean,
  lonSeg = 320,
  latSeg = 64,
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const at = (i: number, j: number) => {
    const lat = (i / latSeg) * (Math.PI / 2);
    const lon = (j / lonSeg) * Math.PI * 2;
    return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  };
  for (let i = 0; i <= latSeg; i++) {
    for (let j = 0; j <= lonSeg; j++) {
      const [x, y, z] = at(i, j);
      positions.push(x * radius, y * radius, z * radius);
      normals.push(x, y, z);
      uvs.push(j / lonSeg, i / latSeg);
    }
  }
  const index: number[] = [];
  const row = lonSeg + 1;
  for (let i = 0; i < latSeg; i++) {
    for (let j = 0; j < lonSeg; j++) {
      const [x, y, z] = at(i + 0.5, j + 0.5);
      if (!keep(x * radius, y * radius, z * radius)) continue;
      const a = i * row + j;
      const b = (i + 1) * row + j;
      const c = i * row + j + 1;
      const d = (i + 1) * row + j + 1;
      index.push(a, c, b, c, d, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  return geometry;
}

const inSlit = (x: number, z: number, margin = 0) =>
  Math.abs(x) < SLIT_HALF + margin && z > -0.2 * DOME_R;

function tube(points: THREE.Vector3[], radius: number) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    Math.max(8, points.length * 3),
    radius,
    10,
    false,
  );
}

/** The hill the observatory stands on: its crest under the plinth, falling away. */
function hillHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  const fall = r < 2.6 ? 0 : -Math.pow(r - 2.6, 1.22) * 0.11;
  const n =
    Math.sin(x * 0.21 + z * 0.13) * 0.35 +
    Math.sin(x * 0.05 - z * 0.09) * 1.1 +
    Math.sin(x * 0.67 + z * 0.41) * 0.08;
  return fall + n * Math.min(1, Math.max(0, (r - 2.4) / 8));
}

/** One axis of the mount: a damped spring toward its goal, held to a speed and a pull. */
type Axis = {
  pos: number;
  vel: number;
  goal: number;
  maxV: number;
  maxA: number;
  wrap: boolean;
};

function stepAxis(axis: Axis, dt: number) {
  let err = axis.goal - axis.pos;
  if (axis.wrap) err = Math.atan2(Math.sin(err), Math.cos(err));
  // ω and ζ: a firm slew that stops with a whisper of overshoot.
  const omega = 10;
  const zeta = 0.8;
  let acc = omega * omega * err - 2 * zeta * omega * axis.vel;
  acc = Math.max(-axis.maxA, Math.min(axis.maxA, acc));
  axis.vel = Math.max(-axis.maxV, Math.min(axis.maxV, axis.vel + acc * dt));
  axis.pos += axis.vel * dt;
  return Math.abs(err) > 1e-4 || Math.abs(axis.vel) > 1e-4;
}

export type ObservatoryScene = {
  /** Lay the scene out for the hero's size and the building's height on screen, in px. */
  resize: (width: number, height: number, buildingPx: number, footPx: number) => void;
  /** Point the telescope at a spot in the hero, in its pixels. */
  aim: (x: number, y: number) => void;
  dispose: () => void;
};

/** Hands the main thread back to the browser between the steps of building the scene. */
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Builds the scene in short steps, then its shaders off the main thread: no step holds
 * the page for long. Rejects where there is no GPU.
 */
export async function createObservatoryScene(
  canvas: HTMLCanvasElement,
  options: { reduced: boolean },
): Promise<ObservatoryScene> {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  // Without a GPU (a software rasteriser) the scene would hold the page's main thread for
  // seconds a frame: draw nothing, as where WebGL is missing.
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|software|basic render/i.test(name)) {
    renderer.dispose();
    throw new Error("No GPU for the observatory scene.");
  }
  renderer.setClearColor(palette.black, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Only the fixed building casts shadows, so the map is drawn once per layout, not per frame.
  renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(colour(palette.canvas), 60, 520);
  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 900);

  // Reflections: a night sky with the Moon in it and the city's red glow low behind.
  const env = new THREE.Scene();
  const skyGeo = new THREE.SphereGeometry(50, 48, 24);
  const skyColours: number[] = [];
  const pos = skyGeo.getAttribute("position");
  const high = colour(art.skyHigh);
  const low = colour(art.skyLow);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, pos.getY(i) / 50);
    const c = low.clone().lerp(high, Math.pow(t, 0.6));
    skyColours.push(c.r, c.g, c.b);
  }
  skyGeo.setAttribute("color", new THREE.Float32BufferAttribute(skyColours, 3));
  env.add(
    new THREE.Mesh(
      skyGeo,
      new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }),
    ),
  );
  const moonDisc = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 24, 12),
    new THREE.MeshBasicMaterial({ color: colour(art.moonlight) }),
  );
  moonDisc.position.set(-22, 30, 26);
  env.add(moonDisc);
  const cityGlow = new THREE.Mesh(
    new THREE.SphereGeometry(9, 24, 12),
    new THREE.MeshBasicMaterial({ color: colour(palette.red).multiplyScalar(0.35) }),
  );
  cityGlow.position.set(30, -2, -38);
  env.add(cityGlow);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(env, 0.03).texture;
  scene.environment = envMap;

  // Light: the Moon, the night's fill, the city's red on the far side, the red lamp
  // inside the dome, and the warm door lamp.
  const moon = new THREE.DirectionalLight(colour(art.moonlight), 2.1);
  moon.position.set(-9, 13, 11);
  moon.target.position.set(0, 1.6, 0);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -7;
  moon.shadow.camera.right = 7;
  moon.shadow.camera.top = 7;
  moon.shadow.camera.bottom = -7;
  moon.shadow.camera.near = 1;
  moon.shadow.camera.far = 40;
  moon.shadow.bias = -0.0004;
  moon.shadow.normalBias = 0.02;
  scene.add(moon, moon.target);
  scene.add(new THREE.HemisphereLight(colour(art.skyHigh), colour(art.ground), 1.1));
  const rim = new THREE.DirectionalLight(colour(palette.red), 1.3);
  rim.position.set(8, 3.5, -9);
  scene.add(rim);
  const inside = new THREE.PointLight(colour(art.interiorRed), 0.8, 3.4, 2);
  inside.position.set(0, DOME_Y + 0.5, -0.4);
  scene.add(inside);

  const glow = glowTexture();
  const glowSprite = (hex: string, size: number, strength: number) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glow,
        color: colour(hex),
        transparent: true,
        opacity: strength,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    s.scale.set(size, size, 1);
    return s;
  };

  // Materials.
  const plasterBump = grainTexture(7);
  plasterBump.repeat.set(10, 3);
  const concreteBump = grainTexture(19);
  concreteBump.repeat.set(12, 1);
  const plaster = new THREE.MeshStandardMaterial({
    color: colour(art.plaster),
    roughness: 0.93,
    bumpMap: plasterBump,
    bumpScale: 0.6,
  });
  const concrete = new THREE.MeshStandardMaterial({
    color: colour(art.concrete),
    roughness: 0.96,
    bumpMap: concreteBump,
    bumpScale: 0.9,
  });
  const domePaint = new THREE.MeshPhysicalMaterial({
    color: colour(art.domePaint),
    roughness: 0.3,
    metalness: 0.12,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.3,
  });
  const domeInside = new THREE.MeshStandardMaterial({
    color: colour(art.domeInside),
    roughness: 0.85,
    side: THREE.BackSide,
  });
  const rail = new THREE.MeshStandardMaterial({
    color: colour(art.rail),
    metalness: 0.85,
    roughness: 0.32,
  });
  const ota = new THREE.MeshPhysicalMaterial({
    color: colour(art.otaOrange),
    metalness: 0.3,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
  });
  const cell = new THREE.MeshPhysicalMaterial({
    color: colour(art.otaCell),
    metalness: 0.35,
    roughness: 0.42,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  });
  const corrector = new THREE.MeshPhysicalMaterial({
    color: colour(art.corrector),
    metalness: 0.1,
    roughness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1.8,
    iridescence: 0.75,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [260, 420],
    sheen: 0.4,
    sheenColor: colour(art.coating),
    emissive: colour(art.coating),
    emissiveIntensity: 0.22,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: colour(art.chrome),
    metalness: 1,
    roughness: 0.18,
  });
  const fork = new THREE.MeshPhysicalMaterial({
    color: colour(art.fork),
    metalness: 0.45,
    roughness: 0.5,
    clearcoat: 0.35,
  });
  const blackMetal = new THREE.MeshStandardMaterial({
    color: colour(art.mountBlack),
    metalness: 0.5,
    roughness: 0.45,
  });
  const pierMetal = new THREE.MeshStandardMaterial({
    color: colour(art.pier),
    metalness: 0.6,
    roughness: 0.5,
  });
  const wood = new THREE.MeshStandardMaterial({
    color: colour(art.wood),
    roughness: 0.72,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: colour(art.woodFrame),
    roughness: 0.85,
    bumpMap: plasterBump,
    bumpScale: 0.4,
  });
  const windowFrame = new THREE.MeshStandardMaterial({
    color: colour(art.windowFrame),
    roughness: 0.8,
  });
  const windowGlass = new THREE.MeshStandardMaterial({
    color: colour(art.windowGlass),
    emissive: colour(art.windowGlass),
    emissiveIntensity: 0.85,
    roughness: 0.4,
  });

  const shadowed = <T extends THREE.Object3D>(o: T) => {
    o.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return o;
  };

  await pause();

  // The hill.
  const groundGeo = new THREE.PlaneGeometry(420, 420, 150, 150);
  groundGeo.rotateX(-Math.PI / 2);
  const gp = groundGeo.getAttribute("position");
  const groundColours: number[] = [];
  const dark = colour(art.ground);
  const lit = colour(art.groundLit);
  const c = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i);
    const z = gp.getZ(i);
    gp.setY(i, hillHeight(x, z));
    const t = 0.5 + 0.5 * Math.sin(x * 1.7 + Math.cos(z * 1.3) * 2);
    c.copy(dark).lerp(lit, t * 0.6 * Math.max(0, 1 - Math.hypot(x, z) / 40));
    groundColours.push(c.r, c.g, c.b);
  }
  groundGeo.setAttribute("color", new THREE.Float32BufferAttribute(groundColours, 3));
  groundGeo.computeVertexNormals();
  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  );
  ground.receiveShadow = true;
  scene.add(ground);

  // The mountains round Tbilisi, two ranges deep, and the city's lights below them.
  const ridge = (z: number, base: number, amp: number, seed: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-700, base - 80);
    for (let x = -700; x <= 700; x += 6) {
      const h =
        Math.sin(x * 0.011 + seed) * amp +
        Math.sin(x * 0.027 + seed * 2.1) * amp * 0.45 +
        Math.sin(x * 0.071 + seed * 0.7) * amp * 0.12;
      shape.lineTo(x, base + h);
    }
    shape.lineTo(700, base - 80);
    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshStandardMaterial({ color: colour(art.ridge), roughness: 1 }),
    );
    mesh.position.z = z;
    scene.add(mesh);
  };
  ridge(-420, -34, 9, 1.3);
  ridge(-300, -40, 6, 4.1);
  const cityCount = 900;
  const city: number[] = [];
  let seed = 31;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < cityCount; i++) {
    const x = (rnd() - 0.5) * 520;
    const z = -200 - rnd() * 90;
    city.push(x, -46 + rnd() * 6 + Math.sin(x * 0.02) * 2, z);
  }
  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute("position", new THREE.Float32BufferAttribute(city, 3));
  scene.add(
    new THREE.Points(
      cityGeo,
      new THREE.PointsMaterial({
        color: colour(palette.amber),
        size: 2.6,
        sizeAttenuation: false,
        map: glow,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    ),
  );

  await pause();

  // The building.
  const building = new THREE.Group();
  scene.add(building);
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.86, 1.96, PLINTH_H, 160),
    concrete,
  );
  plinth.position.y = PLINTH_H / 2;
  building.add(plinth);
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(DRUM_R, DRUM_R, DRUM_H, 192, 1, true),
    plaster,
  );
  drum.position.y = PLINTH_H + DRUM_H / 2;
  building.add(drum);
  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(DRUM_R + 0.025, DRUM_R + 0.025, 0.2, 192, 1, true),
    concrete,
  );
  skirt.position.y = PLINTH_H + 0.1;
  building.add(skirt);
  // The lip the dome rides on, and the floor inside.
  const lip = new THREE.Mesh(
    new THREE.CylinderGeometry(DOME_R + 0.08, DOME_R + 0.08, 0.13, 192, 1, true),
    domePaint,
  );
  lip.position.y = DRUM_TOP + 0.005;
  building.add(lip);
  const under = new THREE.Mesh(
    new THREE.RingGeometry(DRUM_R, DOME_R + 0.08, 192),
    concrete,
  );
  under.rotation.x = Math.PI / 2;
  under.position.y = DRUM_TOP - 0.06;
  building.add(under);
  const deck = new THREE.Mesh(new THREE.CircleGeometry(DRUM_R - 0.03, 96), domeInside);
  deck.rotation.x = Math.PI / 2;
  deck.position.y = FLOOR_Y;
  building.add(deck);

  // The door, its arch, its lamp and step, a little left of the front.
  const door = new THREE.Group();
  const doorAngle = -0.42;
  door.position.set(Math.sin(doorAngle) * DRUM_R, PLINTH_H, Math.cos(doorAngle) * DRUM_R);
  door.rotation.y = doorAngle;
  const arch = (width: number, height: number) => {
    const s = new THREE.Shape();
    const w = width / 2;
    s.moveTo(-w, 0);
    s.lineTo(-w, height - w);
    s.absarc(0, height - w, w, Math.PI, 0, true);
    s.lineTo(w, 0);
    s.closePath();
    return s;
  };
  const surround = new THREE.Mesh(
    new THREE.ExtrudeGeometry(arch(0.86, 1.42), {
      depth: 0.07,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
      bevelSegments: 2,
    }),
    stone,
  );
  door.add(surround);
  const leaf = new THREE.Mesh(
    new THREE.ExtrudeGeometry(arch(0.64, 1.3), {
      depth: 0.05,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      bevelSegments: 1,
    }),
    wood,
  );
  leaf.position.z = 0.05;
  door.add(leaf);
  for (const x of [-0.16, 0, 0.16]) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.008, 1.0, 0.01), cell);
    plank.position.set(x, 0.55, 0.112);
    door.add(plank);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), chrome);
  knob.position.set(0.21, 0.62, 0.13);
  door.add(knob);
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.42), concrete);
  step.position.set(0, -PLINTH_H + 0.06 + 0.14, 0.35);
  door.add(step);
  const lampBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.09), blackMetal);
  lampBox.position.set(0, 1.62, 0.12);
  door.add(lampBox);
  const bulb = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.1, 0.02),
    new THREE.MeshStandardMaterial({
      color: colour(art.lamp),
      emissive: colour(art.lamp),
      emissiveIntensity: 1.6,
    }),
  );
  bulb.position.set(0, 1.62, 0.17);
  door.add(bulb);
  const lampGlow = glowSprite(art.lamp, 0.55, 0.22);
  lampGlow.position.set(0, 1.62, 0.22);
  door.add(lampGlow);
  const lampLight = new THREE.PointLight(colour(art.lamp), 0.75, 2.6, 2);
  lampLight.position.set(0, 1.55, 0.45);
  door.add(lampLight);
  building.add(door);

  // Two windows, lit from inside.
  for (const [angle, y] of [
    [0.38, 1.05],
    [0.98, 1.05],
  ] as const) {
    const w = new THREE.Group();
    w.position.set(Math.sin(angle) * DRUM_R, PLINTH_H + y, Math.cos(angle) * DRUM_R);
    w.rotation.y = angle;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.06), windowFrame);
    w.add(frame);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.02), windowGlass);
    pane.position.z = 0.03;
    w.add(pane);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.44, 0.01), windowFrame);
    bar.position.z = 0.045;
    w.add(bar);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.12), stone);
    sill.position.set(0, -0.3, 0.04);
    w.add(sill);
    const g = glowSprite(art.windowGlass, 0.6, 0.14);
    g.position.z = 0.12;
    w.add(g);
    building.add(w);
  }
  shadowed(building);

  await pause();

  // The dome: its shell less the slit, the inside, rails along the slit, ribs, the base
  // ring, and the shutter run back over the top.
  const dome = new THREE.Group();
  dome.position.y = DOME_Y;
  building.add(dome);
  const shell = new THREE.Mesh(
    hemisphere(DOME_R, (x, _y, z) => !inSlit(x, z)),
    domePaint,
  );
  dome.add(shell);
  const innerShell = new THREE.Mesh(
    // Dark and seen only through the slit: a coarser mesh does.
    hemisphere(DOME_R * 0.975, (x, _y, z) => !inSlit(x / 0.975, z / 0.975), 192, 40),
    domeInside,
  );
  dome.add(innerShell);
  const shutter = new THREE.Mesh(
    hemisphere(
      DOME_R * 1.03,
      (x, y, z) =>
        Math.abs(x) < SLIT_HALF + 0.08 && z < -0.12 * DOME_R && y > 0.42 * DOME_R,
    ),
    domePaint,
  );
  dome.add(shutter);
  for (const side of [-1, 1]) {
    const points: THREE.Vector3[] = [];
    const rho = Math.sqrt(DOME_R * DOME_R - SLIT_HALF * SLIT_HALF);
    for (let t = 0; t <= 100; t += 4) {
      const a = (t * Math.PI) / 180;
      points.push(
        new THREE.Vector3(
          side * (SLIT_HALF + 0.015),
          rho * Math.sin(a),
          rho * Math.cos(a),
        ).multiplyScalar(1.006),
      );
    }
    dome.add(new THREE.Mesh(tube(points, 0.034), rail));
  }
  for (let k = 0; k < 16; k++) {
    const lon = ((k + 0.5) * Math.PI * 2) / 16;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const lat = (i / 40) * (Math.PI / 2) * 0.86;
      const x = Math.cos(lat) * Math.sin(lon) * DOME_R;
      const z = Math.cos(lat) * Math.cos(lon) * DOME_R;
      if (inSlit(x, z, 0.07)) break;
      points.push(new THREE.Vector3(x, Math.sin(lat) * DOME_R, z).multiplyScalar(1.004));
    }
    if (points.length > 3) dome.add(new THREE.Mesh(tube(points, 0.011), domePaint));
  }
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(DOME_R + 0.015, 0.045, 14, 192),
    domePaint,
  );
  baseRing.rotation.x = Math.PI / 2;
  dome.add(baseRing);
  dome.traverse((m) => (m.receiveShadow = true));
  // Moonlight through the slit onto the telescope, turning with the dome.
  const slitLight = new THREE.SpotLight(colour(art.moonlight), 9, 9, 0.42, 0.7, 1.6);
  slitLight.position.set(0, DOME_R * 1.6, DOME_R * 2.4);
  slitLight.target.position.set(0, PIVOT_Y - DOME_Y, 0);
  dome.add(slitLight, slitLight.target);
  // The dome casts no shadow, so the Moon still finds the telescope inside: on screen it
  // reads as moonlight through the slit.

  await pause();

  // The telescope: pier, base, arm, and the tube on its altitude axis.
  const mount = new THREE.Group();
  building.add(mount);
  const turntableTop = PIVOT_Y - ARM_H;
  const pier = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.16, turntableTop - 0.14 - FLOOR_Y, 40),
    pierMetal,
  );
  pier.position.y = FLOOR_Y + (turntableTop - 0.14 - FLOOR_Y) / 2;
  mount.add(pier);
  const azimuth = new THREE.Group();
  azimuth.position.y = turntableTop;
  mount.add(azimuth);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.33, 0.14, 64),
    blackMetal,
  );
  base.position.y = -0.07;
  azimuth.add(base);
  const armShape = new THREE.Shape();
  armShape.moveTo(-0.2, 0);
  armShape.lineTo(-0.13, ARM_H - 0.06);
  armShape.absarc(0, ARM_H, 0.14, Math.PI * 1.1, -Math.PI * 0.1, true);
  armShape.lineTo(0.2, 0);
  armShape.closePath();
  const arm = new THREE.Mesh(
    new THREE.ExtrudeGeometry(armShape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 4,
      curveSegments: 24,
    }),
    fork,
  );
  arm.rotation.y = Math.PI / 2;
  arm.position.set(ARM_X - 0.065, 0, 0);
  azimuth.add(arm);
  const boss = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.2, 40),
    blackMetal,
  );
  boss.rotation.z = Math.PI / 2;
  boss.position.set(ARM_X - 0.02, ARM_H, 0);
  azimuth.add(boss);

  const altitude = new THREE.Group();
  altitude.position.y = ARM_H;
  azimuth.add(altitude);
  // The arm holds the tube near its back, as the 8SE's does, so the front reaches out.
  const optics = new THREE.Group();
  optics.position.z = 0.42;
  altitude.add(optics);
  const along = (geometry: THREE.BufferGeometry) => geometry.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(
    along(new THREE.CylinderGeometry(OTA_R, OTA_R, OTA_L * 0.74, 96, 1, true)),
    ota,
  );
  optics.add(body);
  const rearCell = new THREE.Mesh(
    along(new THREE.CylinderGeometry(OTA_R + 0.012, OTA_R * 0.84, 0.17, 96)),
    cell,
  );
  rearCell.position.z = -OTA_L * 0.37 - 0.085;
  optics.add(rearCell);
  const frontCell = new THREE.Mesh(
    along(new THREE.CylinderGeometry(OTA_R + 0.02, OTA_R + 0.012, 0.11, 96, 1, true)),
    cell,
  );
  frontCell.position.z = OTA_L * 0.37 + 0.055;
  optics.add(frontCell);
  const bezel = new THREE.Mesh(
    new THREE.RingGeometry(OTA_R * 0.9, OTA_R + 0.02, 96),
    cell,
  );
  bezel.position.z = OTA_L * 0.37 + 0.11;
  optics.add(bezel);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(OTA_R * 0.9, 96), corrector);
  glass.position.z = OTA_L * 0.37 + 0.095;
  optics.add(glass);
  const throat = new THREE.Mesh(new THREE.CircleGeometry(OTA_R * 0.9, 64), cell);
  throat.position.z = OTA_L * 0.37 + 0.06;
  throat.rotation.y = Math.PI;
  optics.add(throat);
  const secondary = new THREE.Mesh(
    along(new THREE.CylinderGeometry(OTA_R * 0.3, OTA_R * 0.3, 0.05, 64)),
    cell,
  );
  secondary.position.z = OTA_L * 0.37 + 0.12;
  optics.add(secondary);
  const secondaryRing = new THREE.Mesh(
    new THREE.TorusGeometry(OTA_R * 0.3, 0.007, 8, 64),
    chrome,
  );
  secondaryRing.position.z = OTA_L * 0.37 + 0.146;
  optics.add(secondaryRing);
  const visualBack = new THREE.Mesh(
    along(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 32)),
    cell,
  );
  visualBack.position.z = -OTA_L * 0.37 - 0.24;
  optics.add(visualBack);
  const diagonal = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), cell);
  diagonal.position.z = -OTA_L * 0.37 - 0.36;
  optics.add(diagonal);
  const eyepiece = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.055, 0.17, 32),
    chrome,
  );
  eyepiece.position.set(0, 0.15, -OTA_L * 0.37 - 0.36);
  optics.add(eyepiece);
  const eyecup = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.05, 32), cell);
  eyecup.position.set(0, 0.25, -OTA_L * 0.37 - 0.36);
  optics.add(eyecup);
  const focuser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.08, 24),
    cell,
  );
  focuser.rotation.z = Math.PI / 2;
  focuser.position.set(-OTA_R * 0.55, -OTA_R * 0.3, -OTA_L * 0.37 - 0.13);
  optics.add(focuser);
  const finder = new THREE.Group();
  finder.position.set(-0.06, OTA_R + 0.06, OTA_L * 0.18);
  const finderBody = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.2), cell);
  finder.add(finderBody);
  const finderWindow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.01), corrector);
  finderWindow.position.z = 0.105;
  finder.add(finderWindow);
  optics.add(finder);
  const dovetail = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.11, OTA_L * 0.72),
    blackMetal,
  );
  dovetail.position.set(OTA_R + 0.03, 0, 0);
  optics.add(dovetail);
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, 0.3), fork);
  clamp.position.set(ARM_X - 0.1, 0, 0.12);
  altitude.add(clamp);
  // The moving parts receive the building's shadow but cast none: the map stays still.
  mount.traverse((m) => (m.receiveShadow = true));

  // Mount and dome state. Azimuth 0 faces the viewer; the slit starts there too.
  const az: Axis = { pos: 0.2, vel: 0, goal: 0.2, maxV: 3.6, maxA: 22, wrap: true };
  const alt: Axis = { pos: 1.05, vel: 0, goal: 1.05, maxV: 2.8, maxA: 18, wrap: false };

  let width = 1;
  let height = 1;
  let raf = 0;
  let last = 0;
  let dead = false;

  function render() {
    azimuth.rotation.y = az.pos;
    altitude.rotation.x = -alt.pos;
    // The dome is slaved to the mount: the tube stands out of the slit, so it never lags.
    dome.rotation.y = az.pos;
    renderer.render(scene, camera);
  }

  function frame(now: number) {
    raf = 0;
    if (dead) return;
    const elapsed = Math.min((now - last) / 1000, 0.05);
    last = now;
    let moving = false;
    if (options.reduced) {
      az.pos = az.goal;
      alt.pos = alt.goal;
    } else {
      // Fixed small steps, so the motion is the same at any frame rate.
      const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)));
      for (let i = 0; i < steps; i++) {
        const dt = elapsed / steps;
        const a = stepAxis(az, dt);
        const b = stepAxis(alt, dt);
        moving = a || b;
      }
    }
    render();
    if (moving) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf && !dead) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  const ray = new THREE.Vector3();
  const across = new THREE.Vector3();
  const pivot = new THREE.Vector3(0, PIVOT_Y, 0);

  // Every shader, built off the main thread where the browser can, before the first frame.
  await renderer.compileAsync(scene, camera);

  return {
    resize(w, h, buildingPx, footPx) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      // 1.5x is sharp for a small building and a fraction of a retina canvas's pixels.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Distance from the building's height on screen; then height and pitch so its
      // foot stands where the layout wants it.
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const buildingM = DOME_Y + DOME_R;
      const distance = (buildingM * height) / (buildingPx * 2 * Math.tan(fov / 2));
      // A slight look down onto the dome, and the lens shifted so the horizon sits low in
      // the hero, under the words, as an architectural camera keeps its verticals.
      const pitch = THREE.MathUtils.degToRad(9);
      const horizonAt = -0.36;
      const place = (y: number) => {
        camera.position.set(0, y, distance);
        camera.lookAt(0, y - Math.tan(pitch) * distance, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        const far = new THREE.Vector3(0, y, distance - 1e5).project(camera);
        camera.projectionMatrix.elements[9] = far.y - horizonAt;
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      };
      const footY = height - footPx;
      let lo = -10;
      let hi = 40;
      for (let i = 0; i < 40; i++) {
        const y = (lo + hi) / 2;
        place(y);
        const p = new THREE.Vector3(0, 0, DRUM_R).project(camera);
        const py = (1 - (p.y + 1) / 2) * height;
        // A higher eye sees the foot lower on the screen.
        if (py > footY) hi = y;
        else lo = y;
      }
      place((lo + hi) / 2);
      renderer.shadowMap.needsUpdate = true;
      render();
    },
    aim(x, y) {
      // Every point on the eye's ray through (x, y) lands on (x, y), so a tube aimed at
      // any of them points, on screen, exactly through the spot. Of those, take the one
      // that lays the tube across the picture, leaned toward the viewer: it shows its
      // whole length, and the slit that follows it faces us.
      ray.set((x / width) * 2 - 1, -(y / height) * 2 + 1, 0.5).unproject(camera);
      ray.sub(camera.position).normalize();
      const t = across.copy(pivot).sub(camera.position).dot(ray);
      across.copy(camera.position).addScaledVector(ray, t).sub(pivot);
      const reach = across.length();
      if (reach < 1e-3) return;
      const aside = across.x / reach;
      const lean = LEAN_UP + (LEAN_ASIDE - LEAN_UP) * aside * aside;
      const dir = across.addScaledVector(ray, -reach * Math.tan(lean)).normalize();
      az.goal = Math.atan2(dir.x, dir.z);
      alt.goal = Math.max(MIN_ALT, Math.min(MAX_ALT, Math.asin(dir.y)));
      // The azimuth goal continues from where the axis is, never the long way round.
      const diff = Math.atan2(Math.sin(az.goal - az.pos), Math.cos(az.goal - az.pos));
      az.goal = az.pos + diff;
      wake();
    },
    dispose() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      envMap.dispose();
      pmrem.dispose();
      glow.dispose();
      plasterBump.dispose();
      concreteBump.dispose();
      renderer.dispose();
    },
  };
}
