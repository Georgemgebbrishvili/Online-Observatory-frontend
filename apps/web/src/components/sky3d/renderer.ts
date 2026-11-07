/**
 * The Night Sky's three.js scene (ADR-085). Loaded only by night-sky.tsx, in the browser.
 * Stars and constellation lines are J2000 unit vectors uploaded once; each frame one
 * EQJ->HOR matrix turns them, and the shader adds astronomy-engine's refraction (the same
 * sum as `horizontal()` in features/sky3d/astro.ts). Labels are DOM, placed with
 * `screenOf`, so they stay sharp and readable at any pixel ratio.
 */
import { MakeTime, Rotation_EQD_HOR } from "astronomy-engine";
import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Matrix3,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Points,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";

import {
  SATURN_POLE,
  bodies,
  colourOfBv,
  horizonMatrix,
  horizontal,
  limitingMagnitude,
  observerOf,
  skyBrightness,
  worldOf,
  type BodyState,
  type Site,
  type SkyBodyName,
  type Vec3,
} from "@/features/sky3d/astro";
import { screenOf, type View } from "@/features/sky3d/projection";
import { nightSkyArt } from "@/styles/tokens";

export type Toggles = {
  lines: boolean;
  names: boolean;
  planets: boolean;
  altaz: boolean;
  equatorial: boolean;
  milkyway: boolean;
  atmosphere: boolean;
  ground: boolean;
};

export type Constellation = { id: string; name: string; label: Vec3; lines: number[][] };

/** Something on the sky that can be labelled, searched and tapped. */
export type SkyThing =
  | { kind: "body"; id: SkyBodyName; name: string }
  | {
      kind: "fixed";
      id: string;
      name: string;
      type: "star" | "galaxy" | "nebula" | "cluster";
      raHours: number;
      decDeg: number;
      magnitude: number | null;
      /** Labelled even when not picked (named stars, showpieces). */
      labelled: boolean;
    }
  | { kind: "constellation"; id: string; name: string; label: Vec3 };

export type Frame = {
  date: Date;
  site: Site;
  view: View;
  toggles: Toggles;
  compass: { N: string; E: string; S: string; W: string };
  selected: string | null;
};

const D = { sky: 0.97, milky: 0.98, lines: 0.965, bodies: 0.94, ground: 0.9, back: 5 } as const;
const DEG = Math.PI / 180;

const REFRACT = /* glsl */ `
  uniform mat3 uEqjHor;
  float refr(float alt) {
    if (alt < -90.0 || alt > 90.0) return 0.0;
    float hd = max(alt, -1.0);
    float r = (1.02 / tan(radians(hd + 10.3 / (hd + 5.11)))) / 60.0;
    if (alt < -1.0) r *= (alt + 90.0) / 89.0;
    return r;
  }
  // J2000 unit vector -> world (x east, y up, z south), apparent (refracted).
  vec3 toWorld(vec3 j) {
    vec3 h = uEqjHor * j;
    float alt = degrees(asin(clamp(h.z, -1.0, 1.0)));
    float a2 = radians(alt + refr(alt));
    vec2 flat2 = h.xy;
    float len = length(flat2);
    vec2 dir = len > 1e-9 ? flat2 / len : vec2(1.0, 0.0);
    vec3 h2 = vec3(dir * cos(a2), sin(a2));
    return vec3(-h2.y, h2.z, -h2.x);
  }
`;

function starMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uEqjHor: { value: new Matrix3() },
      uLimit: { value: 6.5 },
      uScale: { value: 1 },
      uBelow: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${REFRACT}
      attribute float mag;
      attribute vec3 tint;
      uniform float uLimit;
      uniform float uScale;
      uniform float uBelow;
      varying vec3 vTint;
      varying float vAlpha;
      void main() {
        vec3 w = toWorld(position);
        float d = uLimit - mag;
        vAlpha = clamp(d, 0.0, 1.0) * ((w.y < 0.0 && uBelow < 0.5) ? 0.0 : 1.0);
        vTint = tint;
        gl_PointSize = vAlpha <= 0.0 ? 0.0 : clamp(1.6 + 0.9 * d, 1.6, 14.0) * uScale;
        gl_Position = projectionMatrix * viewMatrix * vec4(w * ${D.sky.toFixed(3)}, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vTint;
      varying float vAlpha;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(p, p);
        if (r2 > 1.0) discard;
        float core = exp(-r2 * 4.0);
        gl_FragColor = vec4(vTint * core, core * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

function lineMaterial(colour: string) {
  return new ShaderMaterial({
    uniforms: { uEqjHor: { value: new Matrix3() }, uColour: { value: new Color(colour) }, uAlpha: { value: 0.5 } },
    vertexShader: /* glsl */ `
      ${REFRACT}
      void main() { gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(position) * ${D.lines.toFixed(3)}, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColour;
      uniform float uAlpha;
      void main() { gl_FragColor = vec4(uColour, uAlpha); }
    `,
    transparent: true,
    depthWrite: false,
  });
}

function milkyMaterial() {
  return new ShaderMaterial({
    uniforms: { uEqjHor: { value: new Matrix3() }, uMap: { value: null }, uAlpha: { value: 0.5 } },
    vertexShader: /* glsl */ `
      ${REFRACT}
      varying vec3 vJ;
      void main() { vJ = position; gl_Position = projectionMatrix * viewMatrix * vec4(toWorld(position) * ${D.milky.toFixed(3)}, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uAlpha;
      varying vec3 vJ;
      void main() {
        vec3 j = normalize(vJ);
        vec2 uv = vec2(atan(j.y, j.x) / 6.2831853 + 0.5, asin(clamp(j.z, -1.0, 1.0)) / 3.1415927 + 0.5);
        float v = texture2D(uMap, uv).r;
        gl_FragColor = vec4(vec3(0.78, 0.82, 0.92) * v, v * uAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: BackSide,
  });
}

function atmosphereMaterial() {
  return new ShaderMaterial({
    uniforms: {
      uSun: { value: new Vector3(0, -1, 0) },
      uBright: { value: 0 },
      uOn: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun;
      uniform float uBright;
      uniform float uOn;
      varying vec3 vDir;
      void main() {
        if (uOn < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        float up = clamp(vDir.y, 0.0, 1.0);
        vec3 night = mix(vec3(0.020, 0.028, 0.055), vec3(0.008, 0.010, 0.022), up);
        vec3 day = mix(vec3(0.62, 0.74, 0.90), vec3(0.20, 0.42, 0.78), pow(up, 0.6));
        vec3 sky = mix(night, day, uBright);
        float sunUp = clamp(uSun.y * 4.0 + 0.6, 0.0, 1.0);
        float glow = pow(max(dot(vDir, normalize(uSun)), 0.0), 8.0);
        vec3 dusk = vec3(0.95, 0.45, 0.22) * glow * (1.0 - abs(uSun.y) * 3.0) * (1.0 - up);
        gl_FragColor = vec4(sky + max(dusk, 0.0) * sunUp + vec3(1.0, 0.95, 0.85) * pow(glow, 6.0) * uBright, 1.0);
      }
    `,
    side: BackSide,
    depthWrite: false,
  });
}

/** Points along a polyline, as segment pairs. */
function segments(polyline: number[], into: number[]) {
  for (let i = 0; i + 5 < polyline.length; i += 3) into.push(...polyline.slice(i, i + 6));
}

function circle(build: (t: number) => Vec3, steps = 96) {
  const out: number[] = [];
  for (let i = 0; i < steps; i++) out.push(...build((i / steps) * 2 * Math.PI), ...build(((i + 1) / steps) * 2 * Math.PI));
  return out;
}

/** A grid on the unit sphere: circles of latitude and meridians, in its own frame. */
function grid(latStep: number, lonStep: number) {
  const pts: number[] = [];
  for (let lat = -90 + latStep; lat < 90; lat += latStep) {
    const c = Math.cos(lat * DEG);
    const s = Math.sin(lat * DEG);
    pts.push(...circle((t) => [c * Math.cos(t), c * Math.sin(t), s]));
  }
  for (let lon = 0; lon < 360; lon += lonStep) {
    const cl = Math.cos(lon * DEG);
    const sl = Math.sin(lon * DEG);
    for (let i = 0; i < 48; i++) {
      const a = -90 + (i * 180) / 48;
      const b = -90 + ((i + 1) * 180) / 48;
      pts.push(Math.cos(a * DEG) * cl, Math.cos(a * DEG) * sl, Math.sin(a * DEG));
      pts.push(Math.cos(b * DEG) * cl, Math.cos(b * DEG) * sl, Math.sin(b * DEG));
    }
  }
  return pts;
}

const BODY_COLOUR: Record<SkyBodyName, string> = {
  Sun: nightSkyArt.sun,
  Moon: nightSkyArt.moon,
  Mercury: nightSkyArt.mercury,
  Venus: nightSkyArt.venus,
  Mars: nightSkyArt.mars,
  Jupiter: nightSkyArt.jupiter,
  Saturn: nightSkyArt.saturn,
  Uranus: nightSkyArt.uranus,
  Neptune: nightSkyArt.neptune,
};

export class SkyRenderer {
  readonly renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(60, 1, 0.01, 20);
  private stars: Points;
  private starData: Float32Array;
  private lines: LineSegments;
  private milky: Mesh;
  private atmosphere: Mesh;
  private ground: Mesh;
  private altaz: LineSegments;
  private equatorial: LineSegments;
  private sunLight = new DirectionalLight(0xffffff, 2.4);
  private bodyMeshes = new Map<SkyBodyName, Mesh>();
  private ring: Mesh;
  private labels = new Map<string, HTMLSpanElement>();
  private matrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  private states: BodyState[] = [];
  private width = 1;
  private height = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    private labelLayer: HTMLElement,
    starData: Float32Array,
    private constellations: Constellation[],
    private things: SkyThing[],
  ) {
    this.starData = starData;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.camera.up.set(0, 1, 0);

    // Background: the atmosphere, or black.
    this.atmosphere = new Mesh(new SphereGeometry(D.back, 48, 24), atmosphereMaterial());
    this.atmosphere.renderOrder = -10;
    this.scene.add(this.atmosphere);

    // The Milky Way, sampled from its equirectangular texture by J2000 direction.
    const milkyMaterialInstance = milkyMaterial();
    this.milky = new Mesh(new IcosahedronGeometry(1, 6), milkyMaterialInstance);
    this.milky.renderOrder = -5;
    this.milky.frustumCulled = false;
    new TextureLoader().load("/sky/data/milkyway.webp", (texture) => {
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      milkyMaterialInstance.uniforms.uMap.value = texture;
    });
    this.scene.add(this.milky);

    // Stars: one draw.
    const count = starData.length / 5;
    const position = new Float32Array(count * 3);
    const mag = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      position.set(starData.subarray(i * 5, i * 5 + 3), i * 3);
      mag[i] = starData[i * 5 + 3];
      tint.set(colourOfBv(starData[i * 5 + 4]), i * 3);
    }
    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(position, 3));
    starGeometry.setAttribute("mag", new BufferAttribute(mag, 1));
    starGeometry.setAttribute("tint", new BufferAttribute(tint, 3));
    this.stars = new Points(starGeometry, starMaterial());
    this.stars.frustumCulled = false;
    this.stars.renderOrder = 2;
    this.scene.add(this.stars);

    // Constellation figures.
    const linePoints: number[] = [];
    for (const figure of constellations) for (const polyline of figure.lines) segments(polyline, linePoints);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", new BufferAttribute(new Float32Array(linePoints), 3));
    this.lines = new LineSegments(lineGeometry, lineMaterial(nightSkyArt.figures));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 1;
    this.scene.add(this.lines);

    // Grids. Alt-az is drawn in the world frame directly (z up in its own frame -> y up).
    const altazPoints = grid(10, 15);
    for (let i = 0; i < altazPoints.length; i += 3) {
      const [x, y, z] = altazPoints.slice(i, i + 3);
      altazPoints[i] = y;
      altazPoints[i + 1] = z;
      altazPoints[i + 2] = -x;
    }
    const altazGeometry = new BufferGeometry();
    altazGeometry.setAttribute("position", new BufferAttribute(new Float32Array(altazPoints.map((v) => v * D.lines)), 3));
    this.altaz = new LineSegments(altazGeometry, new LineBasicMaterial({ color: nightSkyArt.altazGrid, transparent: true, opacity: 0.45, depthWrite: false }));
    this.altaz.frustumCulled = false;
    this.scene.add(this.altaz);
    const eqGeometry = new BufferGeometry();
    eqGeometry.setAttribute("position", new BufferAttribute(new Float32Array(grid(10, 15)), 3));
    this.equatorial = new LineSegments(eqGeometry, lineMaterial(nightSkyArt.equatorialGrid));
    this.equatorial.frustumCulled = false;
    this.scene.add(this.equatorial);

    // The ground: the lower hemisphere, opaque unless seen through.
    this.ground = new Mesh(
      new SphereGeometry(D.ground, 64, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      new MeshBasicMaterial({ color: nightSkyArt.ground, side: DoubleSide, transparent: true, opacity: 1 }),
    );
    this.ground.renderOrder = 5;
    this.scene.add(this.ground);
    const horizonLine = new LineSegments(
      (() => {
        const g = new BufferGeometry();
        g.setAttribute(
          "position",
          new BufferAttribute(new Float32Array(circle((t) => [Math.sin(t) * D.ground, 0, -Math.cos(t) * D.ground], 180)), 3),
        );
        return g;
      })(),
      new LineBasicMaterial({ color: nightSkyArt.horizon }),
    );
    horizonLine.renderOrder = 6;
    this.scene.add(horizonLine);

    // Bodies: lit spheres, so the Moon and the inner planets show their phase.
    this.scene.add(new AmbientLight(0xffffff, 0.06));
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
    const sphere = new SphereGeometry(1, 48, 24);
    for (const name of Object.keys(BODY_COLOUR) as SkyBodyName[]) {
      const material =
        name === "Sun"
          ? new MeshBasicMaterial({ color: BODY_COLOUR.Sun })
          : new MeshLambertMaterial({ color: BODY_COLOUR[name] });
      const mesh = new Mesh(sphere, material);
      mesh.renderOrder = 3;
      this.bodyMeshes.set(name, mesh);
      this.scene.add(mesh);
    }
    this.ring = new Mesh(
      new RingGeometry(1.24, 2.27, 96),
      new MeshLambertMaterial({ color: nightSkyArt.ring, side: DoubleSide, transparent: true, opacity: 0.85 }),
    );
    this.ring.renderOrder = 4;
    this.bodyMeshes.get("Saturn")!.add(this.ring);

    for (const label of ["N", "E", "S", "W"]) this.label(`compass:${label}`, "sky-label sky-compass");
  }

  private label(id: string, className: string) {
    let span = this.labels.get(id);
    if (!span) {
      span = document.createElement("span");
      span.className = className;
      span.dataset.id = id;
      this.labelLayer.appendChild(span);
      this.labels.set(id, span);
    }
    return span;
  }

  private place(id: string, className: string, text: string, world: Vec3 | null) {
    const span = this.label(id, className);
    const point = world ? screenOf(world, this.view, this.width, this.height) : null;
    if (!point || point.x < -40 || point.y < -20 || point.x > this.width + 40 || point.y > this.height + 20) {
      span.hidden = true;
      return;
    }
    span.hidden = false;
    if (span.textContent !== text) span.textContent = text;
    span.style.transform = `translate(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px)`;
  }

  private view: View = { alt: 25, az: 180, fov: 70 };

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  /** The apparent world direction of a J2000 vector this frame. */
  worldOfJ2000(vec: Vec3): Vec3 {
    return worldOf(horizontal(vec, this.matrix));
  }

  bodyStates() {
    return this.states;
  }

  /** Draws one frame. `orientation` overrides the alt-az camera (phone pointing). */
  render(frame: Frame, orientation?: Quaternion | null) {
    const { date, site, view, toggles } = frame;
    this.view = view;
    this.matrix = horizonMatrix(date, site);
    this.states = bodies(date, site);
    const sun = this.states[0];
    const moon = this.states[1];
    const bright = toggles.atmosphere ? skyBrightness(sun.alt, moon) : 0;
    const limit = toggles.atmosphere ? limitingMagnitude(bright) : 6.5;
    const zoomGain = Math.max(0, Math.log2(60 / view.fov));
    const effectiveLimit = Math.min(8, limit + 1.1 * zoomGain);

    // Camera.
    this.camera.fov = view.fov;
    this.camera.updateProjectionMatrix();
    if (orientation) {
      this.camera.quaternion.copy(orientation);
    } else {
      const forward = worldOf(view);
      this.camera.lookAt(new Vector3(...forward));
    }
    this.camera.updateMatrixWorld();

    const m3 = new Matrix3().fromArray(this.matrix);
    (this.stars.material as ShaderMaterial).uniforms.uEqjHor.value.copy(m3);
    (this.stars.material as ShaderMaterial).uniforms.uLimit.value = effectiveLimit;
    (this.stars.material as ShaderMaterial).uniforms.uScale.value =
      this.renderer.getPixelRatio() * Math.min(2.2, 0.85 + 0.25 * zoomGain);
    (this.stars.material as ShaderMaterial).uniforms.uBelow.value = toggles.ground ? 1 : 0;

    const lines = this.lines.material as ShaderMaterial;
    lines.uniforms.uEqjHor.value.copy(m3);
    lines.uniforms.uAlpha.value = 0.55 * (1 - bright * 0.8);
    this.lines.visible = toggles.lines;

    const milky = this.milky.material as ShaderMaterial;
    milky.uniforms.uEqjHor.value.copy(m3);
    milky.uniforms.uAlpha.value = 0.55 * Math.max(0, 1 - bright * 4);
    this.milky.visible = toggles.milkyway;

    // The equatorial grid is the equator of date: its own EQD -> HOR rotation.
    const { rot } = Rotation_EQD_HOR(MakeTime(date), observerOf(site));
    const eq = this.equatorial.material as ShaderMaterial;
    eq.uniforms.uEqjHor.value.fromArray([...rot[0], ...rot[1], ...rot[2]]);
    eq.uniforms.uAlpha.value = 0.4;
    this.equatorial.visible = toggles.equatorial;
    this.altaz.visible = toggles.altaz;

    const atmosphere = this.atmosphere.material as ShaderMaterial;
    atmosphere.uniforms.uSun.value.set(...worldOf(sun));
    atmosphere.uniforms.uBright.value = bright;
    atmosphere.uniforms.uOn.value = toggles.atmosphere ? 1 : 0;

    (this.ground.material as MeshBasicMaterial).opacity = toggles.ground ? 0.25 : 1;
    (this.ground.material as MeshBasicMaterial).color.set(toggles.atmosphere ? new Color(nightSkyArt.ground).lerp(new Color(nightSkyArt.groundDay), bright) : nightSkyArt.ground);

    // Bodies: true size or a readable disc, whichever is larger.
    const degPerPx = view.fov / this.height;
    const sunWorld = worldOf(sun);
    this.sunLight.position.set(...sunWorld);
    this.sunLight.target.position.set(0, 0, 0);
    for (const state of this.states) {
      const mesh = this.bodyMeshes.get(state.name)!;
      const minPx = state.name === "Sun" || state.name === "Moon" ? 12 : Math.max(4, Math.min(11, 8 - 1.2 * state.magnitude));
      const radiusDeg = Math.max(state.radiusDeg, (minPx / 2) * degPerPx);
      const world = worldOf(state);
      mesh.position.set(...world).multiplyScalar(D.bodies);
      mesh.scale.setScalar(D.bodies * Math.tan(radiusDeg * DEG));
      mesh.visible = toggles.ground || state.alt > -radiusDeg - 0.5;
      if (state.name === "Saturn") {
        const pole = new Vector3(...this.worldOfJ2000(SATURN_POLE));
        this.ring.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), pole));
      }
      this.place(
        `body:${state.name}`,
        `sky-label sky-label-body${frame.selected === `body:${state.name}` ? " is-selected" : ""}`,
        this.names.get(`body:${state.name}`) ?? state.name,
        toggles.planets || frame.selected === `body:${state.name}` ? offset(world, radiusDeg) : null,
      );
    }

    // Labels: constellations, named stars and showpieces, the compass.
    for (const thing of this.things) {
      const key = `${thing.kind}:${thing.id}`;
      if (thing.kind === "constellation") {
        this.place(key, "sky-label sky-label-constellation", thing.name, toggles.names ? this.visible(this.worldOfJ2000(thing.label), toggles) : null);
      } else if (thing.kind === "fixed") {
        const selected = frame.selected === key;
        const show =
          selected ||
          (thing.labelled && (thing.type !== "star" ? view.fov <= 75 : (thing.magnitude ?? 9) <= Math.min(effectiveLimit, 1.6 + 1.2 * zoomGain)));
        this.place(
          key,
          `sky-label ${thing.type === "star" ? "sky-label-star" : "sky-label-showpiece"}${selected ? " is-selected" : ""}`,
          thing.name,
          show ? this.visible(this.worldOfJ2000(unit(thing.raHours, thing.decDeg)), toggles) : null,
        );
      }
    }
    const compass = frame.compass;
    this.place("compass:N", "sky-label sky-compass", compass.N, [0, 0.01, -1]);
    this.place("compass:E", "sky-label sky-compass", compass.E, [1, 0.01, 0]);
    this.place("compass:S", "sky-label sky-compass", compass.S, [0, 0.01, 1]);
    this.place("compass:W", "sky-label sky-compass", compass.W, [-1, 0.01, 0]);

    this.renderer.render(this.scene, this.camera);
    return { bright, sun, moon };
  }

  private names = new Map<string, string>();
  setNames(names: Map<string, string>) {
    this.names = names;
  }

  /** Replaces the labelled, pickable things; labels of things no longer listed go. */
  setThings(things: SkyThing[]) {
    const keep = new Set(things.map((thing) => `${thing.kind}:${thing.id}`));
    for (const [id, span] of this.labels) {
      if ((id.startsWith("fixed:") || id.startsWith("constellation:")) && !keep.has(id)) {
        span.remove();
        this.labels.delete(id);
      }
    }
    this.things = things;
  }

  private visible(world: Vec3, toggles: Toggles) {
    return world[1] < -0.005 && !toggles.ground ? null : world;
  }

  /** The nearest pickable thing within `radius` px of a point, else null. */
  pick(x: number, y: number, radius = 28): string | null {
    let best: { id: string; d: number } | null = null;
    const consider = (id: string, world: Vec3 | null, bias = 0) => {
      if (!world) return;
      const point = screenOf(world, this.view, this.width, this.height);
      if (!point) return;
      const d = Math.hypot(point.x - x, point.y - y) + bias;
      if (d <= radius && (!best || d < best.d)) best = { id, d };
    };
    for (const state of this.states) consider(`body:${state.name}`, worldOf(state), -6);
    for (const thing of this.things) {
      if (thing.kind === "fixed") consider(`fixed:${thing.id}`, this.worldOfJ2000(unit(thing.raHours, thing.decDeg)), thing.type === "star" ? 0 : -4);
    }
    if (best) return (best as { id: string }).id;
    // Any catalogue star, by its index.
    const count = this.starData.length / 5;
    for (let i = 0; i < count; i++) {
      if (this.starData[i * 5 + 3] > 6) break; // sorted brightest first
      consider(`star:${i}`, this.worldOfJ2000([this.starData[i * 5], this.starData[i * 5 + 1], this.starData[i * 5 + 2]]), 2);
    }
    if (best) return (best as { id: string }).id;
    for (const thing of this.things) {
      if (thing.kind === "constellation") consider(`constellation:${thing.id}`, this.worldOfJ2000(thing.label), 8);
    }
    return best ? (best as { id: string }).id : null;
  }

  dispose() {
    this.renderer.dispose();
    for (const span of this.labels.values()) span.remove();
    this.labels.clear();
  }
}

function unit(raHours: number, decDeg: number): Vec3 {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}

/** A label sits just below its body's disc. */
function offset(world: Vec3, radiusDeg: number): Vec3 {
  const lift = Math.tan((radiusDeg + 0.4) * DEG);
  return [world[0], world[1] - lift, world[2]];
}
