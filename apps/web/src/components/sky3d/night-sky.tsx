"use client";

import type { SolarSystemBody } from "@darkview/contracts";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  SITE,
  SKY_BODIES,
  bodies,
  bodyState,
  events,
  fixedAltAz,
  nextRise,
  skyPath,
  skyState,
  starsAtDate,
  type BodyState,
  type Site,
  type SkyBodyName,
  type Vec3,
} from "@/features/sky3d/astro";
import { clampView, type View } from "@/features/sky3d/projection";
import { dayMonth } from "@/features/cards/dates";
import type { Locale } from "@/i18n/config";
import { constellationKa, nightSkyCopy, starKa } from "@/i18n/resources/night-sky";
import { SHOWPIECES } from "@/lib/observatory-sim/showpieces";
import { BRIGHT_STARS } from "@/lib/observatory-sim/stars";
import { TELESCOPE_TARGET_BY_ID } from "@/lib/observatory-sim/telescope-targets";

import type { Constellation, PathOverlay, SkyRenderer, SkyThing, Toggles } from "./renderer";

/** A platform target, for the panel's booking link. */
export type Bookable = {
  slug: string;
  body: SolarSystemBody | null;
  raHours: number | null;
  decDeg: number | null;
};

const SPEEDS = [1, 60, 600, 3600] as const;
const TOGGLES_KEY = "stellar-sky-toggles";
const DEFAULT_TOGGLES: Toggles = {
  lines: true,
  names: true,
  planets: true,
  path: true,
  altaz: false,
  equatorial: false,
  milkyway: true,
  atmosphere: true,
  ground: false,
};
const DEG = Math.PI / 180;

function readToggles(): Toggles {
  try {
    const stored = JSON.parse(localStorage.getItem(TOGGLES_KEY) ?? "null");
    return stored ? { ...DEFAULT_TOGGLES, ...stored } : DEFAULT_TOGGLES;
  } catch {
    return DEFAULT_TOGGLES;
  }
}

function saveToggles(toggles: Toggles) {
  try {
    localStorage.setItem(TOGGLES_KEY, JSON.stringify(toggles));
  } catch {
    // A private window or blocked storage: the choice lasts this visit.
  }
}

/** Great-circle separation of two J2000 positions, degrees. */
function separation(ra1: number, dec1: number, ra2: number, dec2: number) {
  const cos =
    Math.sin(dec1 * DEG) * Math.sin(dec2 * DEG) +
    Math.cos(dec1 * DEG) * Math.cos(dec2 * DEG) * Math.cos((ra1 - ra2) * 15 * DEG);
  return Math.acos(Math.min(1, cos)) / DEG;
}

/** The brightest catalogue star within 3′ of a J2000 place, as RA and Dec; null if none. */
function catalogueStar(stars: Float32Array, raHours: number, decDeg: number) {
  const ra = raHours * 15 * DEG;
  const dec = decDeg * DEG;
  const [x, y, z] = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  const near = Math.cos(0.05 * DEG);
  // Sorted brightest first: the first one close enough is the star.
  for (let i = 0; i < stars.length; i += 5) {
    if (stars[i] * x + stars[i + 1] * y + stars[i + 2] * z < near) continue;
    return { raHours: ((Math.atan2(stars[i + 1], stars[i]) / DEG / 15) + 24) % 24, decDeg: Math.asin(stars[i + 2]) / DEG };
  }
  return null;
}

function clock(at: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone }).format(at);
}

function raText(hours: number) {
  // Tenths of a minute first, so 5h 59.96m reads 6h 00.0m and never 5h 60.0m.
  const tenths = Math.round((((hours % 24) + 24) % 24) * 600) % 14_400;
  return `${Math.floor(tenths / 600)}h ${((tenths % 600) / 10).toFixed(1).padStart(4, "0")}m`;
}

function decText(deg: number) {
  // Whole arcminutes first, so 45° 59.9′ reads 46° 00′ and never 45° 60′.
  const minutes = Math.round(Math.abs(deg) * 60);
  return `${deg < 0 ? "−" : "+"}${Math.floor(minutes / 60)}° ${String(minutes % 60).padStart(2, "0")}′`;
}

/** What an object's key points at, for the astronomy: a body, or a fixed J2000 place. */
type Target = { body: SkyBodyName } | { raHours: number; decDeg: number };

type Picked = {
  key: string;
  name: string;
  type: keyof (typeof nightSkyCopy)["en"]["types"];
  magnitude: number | null;
  alt: number;
  az: number;
  raHours: number;
  decDeg: number;
  /** "J2000" for fixed objects, "date" for bodies. */
  epoch: "J2000" | "date";
  lit: number | null;
  slug: string | null;
};

/** Apparent alt/az of a target at an instant. */
function whereAt(target: Target, at: Date, site: Site) {
  return "body" in target ? bodyState(target.body, at, site) : fixedAltAz(target.raHours, target.decDeg, at, site);
}

const noSubscription = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const observatoryZone = () => "Asia/Tbilisi";

/**
 * The Night Sky (ADR-085): a full-screen 3D sky with a time bar, search, a panel for what
 * is tapped, and toggles. The three.js scene is imported in the browser only; without
 * WebGL the page keeps the list of what is up.
 */
export function NightSky({
  bookable,
  locale,
  openedAt,
}: {
  bookable: Bookable[];
  locale: Locale;
  openedAt: number;
}) {
  const copy = nightSkyCopy[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const starsRef = useRef<Float32Array | null>(null);

  // Time: the simulated instant runs from an anchor at a speed, or stands still. The anchor
  // is on the wall clock, not the page's own timer, which stops while a laptop sleeps: a
  // tab left open overnight still shows this morning's sky.
  const time = useRef({ anchorSim: openedAt, anchorReal: 0, speed: 1, playing: true });
  // South, low enough that the horizon shows above the time bar.
  const viewRef = useRef<View>({ alt: 16, az: 180, fov: 75 });
  const velocity = useRef({ alt: 0, az: 0 });
  const fly = useRef<{ from: View; to: View; start: number; duration: number } | null>(null);
  // Following the selected object as the sky turns: after a search or a closer look.
  const track = useRef(false);
  const lookCloserRef = useRef<(key: string) => void>(() => {});
  const orientation = useRef<import("three").Quaternion | null>(null);
  const reduceMotion = useRef(false);

  const [phase, setPhase] = useState<"loading" | "ready" | "no-webgl">("loading");
  const [now, setNow] = useState(() => new Date(openedAt));
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [playing, setPlaying] = useState(true);
  const [toggles, setToggles] = useState<Toggles>(DEFAULT_TOGGLES);
  const togglesRef = useRef(toggles);
  const [site, setSite] = useState<{ site: Site; mine: boolean }>({ site: SITE, mine: false });
  const siteRef = useRef(site.site);
  const [locating, setLocating] = useState<"idle" | "asking" | "refused">("idle");
  const [pointing, setPointing] = useState<"off" | "on" | "refused">("off");
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  // The catalogue, for the panel of a tapped star; the renderer keeps its own copy.
  const [starData, setStarData] = useState<Float32Array | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const listRef = useRef<HTMLDetailsElement>(null);
  // On a phone the panel is a sheet over the sky; for a closer look it folds to its head.
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    togglesRef.current = toggles;
  }, [toggles]);
  useEffect(() => {
    siteRef.current = site.site;
  }, [site]);
  useEffect(() => {
    selectedRef.current = selected;
    if (!selected) track.current = false;
  }, [selected]);

  const simDate = useCallback(() => {
    const t = time.current;
    return new Date(t.playing ? t.anchorSim + (Date.now() - t.anchorReal) * t.speed : t.anchorSim);
  }, []);
  const setSimTime = useCallback(
    (at: number, next?: { speed?: number; playing?: boolean }) => {
      const t = time.current;
      t.anchorSim = at;
      t.anchorReal = Date.now();
      if (next?.speed !== undefined) t.speed = next.speed;
      if (next?.playing !== undefined) t.playing = next.playing;
      setNow(new Date(at));
    },
    [],
  );

  // Everything that can be named: bodies, bright stars, showpieces, constellations.
  const things = useMemo<SkyThing[]>(() => {
    const list: SkyThing[] = [];
    for (const star of BRIGHT_STARS) {
      // The named star is the catalogue's own, where its proper motion has taken it.
      const at = starData ? catalogueStar(starData, star.ra, star.dec) : null;
      list.push({
        kind: "fixed",
        id: star.id,
        name: locale === "ka" ? (starKa[star.id] ?? star.name) : star.name,
        type: "star",
        raHours: at?.raHours ?? star.ra,
        decDeg: at?.decDeg ?? star.dec,
        magnitude: star.mag,
        labelled: true,
      });
    }
    for (const showpiece of SHOWPIECES) {
      const target = TELESCOPE_TARGET_BY_ID.get(showpiece.id);
      if (!target || target.ra === undefined || target.dec === undefined || target.kind === "star") continue;
      list.push({
        kind: "fixed",
        id: showpiece.id,
        name: `${showpiece.name[locale]}${target.catalog ? ` · ${target.catalog}` : ""}`,
        type: target.kind === "galaxy" ? "galaxy" : target.kind === "nebula" ? "nebula" : "cluster",
        raHours: target.ra,
        decDeg: target.dec,
        magnitude: null,
        labelled: true,
      });
    }
    const seen = new Set<string>();
    for (const figure of constellations) {
      if (seen.has(figure.id)) continue;
      seen.add(figure.id);
      list.push({
        kind: "constellation",
        id: figure.id,
        name: locale === "ka" ? (constellationKa[figure.id] ?? figure.name) : figure.id === "Ser" ? "Serpens" : figure.name,
        label: figure.label,
      });
    }
    return list;
  }, [constellations, locale, starData]);

  const bodyName = useCallback((name: SkyBodyName) => copy.bodies[name], [copy]);

  // Load the data and the renderer; fall back to the list without WebGL.
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    time.current.anchorReal = Date.now();
    const stored = readToggles();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only storage, read once on mount
    setToggles(stored);
    let cancelled = false;
    (async () => {
      try {
        const probe = document.createElement("canvas");
        if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) throw new Error("no webgl");
        const [module, stars, figures] = await Promise.all([
          import("./renderer"),
          fetch("/sky/data/stars.bin").then((r) => r.arrayBuffer()),
          fetch("/sky/data/constellations.json").then((r) => r.json() as Promise<Constellation[]>),
        ]);
        if (cancelled) return;
        // Each star carried along its proper motion to the day the page opens.
        starsRef.current = starsAtDate(new Float32Array(stars), new Date(openedAt));
        setStarData(starsRef.current);
        setConstellations(figures);
        rendererRef.current = new module.SkyRenderer(
          canvasRef.current!,
          labelsRef.current!,
          overlayRef.current!,
          starsRef.current,
          figures,
          [],
        );
        rendererRef.current.setMotion(!reduceMotion.current);
        // The page was rendered a moment ago, or restored from a cache long after: start
        // from the visitor's own clock, unless it runs behind the server's.
        const clientNow = Date.now();
        if (clientNow > openedAt - 300_000) time.current.anchorSim = clientNow;
        time.current.anchorReal = clientNow;
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("no-webgl");
      }
    })();
    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [openedAt]);

  // The renderer learns the named things and their names once the figures are in.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || phase !== "ready") return;
    renderer.setThings(things);
    renderer.setNames(
      new Map([
        ...(Object.keys(copy.bodies) as SkyBodyName[]).map((name) => [`body:${name}`, bodyName(name)] as const),
        ...Object.entries(copy.moons).map(([name, label]) => [`moon:${name}`, label] as const),
      ]),
    );
  }, [things, phase, copy, bodyName]);

  // The frame loop, paused while the tab is hidden.
  useEffect(() => {
    if (phase !== "ready") return;
    const stage = stageRef.current!;
    const renderer = rendererRef.current!;
    let raf = 0;
    let lastClock = 0;
    let close = "";
    const resize = () => renderer.resize(stage.clientWidth, stage.clientHeight);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    const frame = (t: number) => {
      // Inertia, and the flight to a searched object.
      const flying = fly.current;
      if (flying) {
        if (flying.start < 0) flying.start = t;
        const k = Math.min(1, (t - flying.start) / flying.duration);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        const { from, to } = flying;
        let dAz = to.az - from.az;
        if (dAz > 180) dAz -= 360;
        if (dAz < -180) dAz += 360;
        // The field changes by a ratio, so a flight from the whole sky to a planet's disc
        // zooms evenly instead of all at the end.
        viewRef.current = clampView({
          alt: from.alt + (to.alt - from.alt) * e,
          az: from.az + dAz * e,
          fov: from.fov * (to.fov / from.fov) ** e,
        });
        if (k >= 1) fly.current = null;
      } else if (!reduceMotion.current && (Math.abs(velocity.current.alt) > 0.001 || Math.abs(velocity.current.az) > 0.001)) {
        viewRef.current = clampView({
          ...viewRef.current,
          alt: viewRef.current.alt + velocity.current.alt,
          az: viewRef.current.az + velocity.current.az,
        });
        velocity.current.alt *= 0.92;
        velocity.current.az *= 0.92;
      }
      const date = simDate();
      const following = track.current && !flying;
      const drawn = renderer.render(
        {
          date,
          site: siteRef.current,
          view: viewRef.current,
          toggles: togglesRef.current,
          compass: copy.compass,
          selected: selectedRef.current,
          track: following,
        },
        orientation.current,
      );
      if (following) viewRef.current = drawn.view;
      // In flight, aim at where the object is now, not where it was at take-off.
      if (flying && track.current && drawn.target && drawn.target.alt > -1) {
        flying.to = clampView({ ...flying.to, alt: drawn.target.alt, az: drawn.target.az });
      }
      // Close enough for a disc or a plate: say on the sky that it is an illustration.
      const isClose = String(drawn.view.fov < 3);
      if (isClose !== close) {
        close = isClose;
        if (stage.parentElement) stage.parentElement.dataset.close = isClose;
      }
      if (t - lastClock > 250) {
        lastClock = t;
        setNow(date);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [phase, simDate, copy]);

  // Look around: drag, pinch, wheel, keys; a tap picks.
  useEffect(() => {
    if (phase !== "ready") return;
    const stage = stageRef.current!;
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt = { x: 0, y: 0, t: 0 };
    let lastTap = { x: 0, y: 0, t: 0 };
    let pinch = 0;
    const perPx = () => viewRef.current.fov / stage.clientHeight;

    const down = (event: PointerEvent) => {
      stage.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      downAt = { x: event.clientX, y: event.clientY, t: performance.now() };
      velocity.current = { alt: 0, az: 0 };
      fly.current = null;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId);
      if (!last || orientation.current) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) {
        const k = perPx();
        if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 6) track.current = false;
        velocity.current = { alt: dy * k, az: -dx * k };
        viewRef.current = clampView({ ...viewRef.current, alt: viewRef.current.alt + dy * k, az: viewRef.current.az - dx * k });
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) viewRef.current = clampView({ ...viewRef.current, fov: viewRef.current.fov * (pinch / distance) });
        pinch = distance;
      }
    };
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = 0;
      const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      if (moved < 6 && performance.now() - downAt.t < 500) {
        velocity.current = { alt: 0, az: 0 };
        const rect = stage.getBoundingClientRect();
        const hit = rendererRef.current?.pick(event.clientX - rect.left, event.clientY - rect.top) ?? null;
        const now = performance.now();
        const again = now - lastTap.t < 380 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30;
        lastTap = { x: event.clientX, y: event.clientY, t: again ? 0 : now };
        if (again && (hit ?? selectedRef.current)) lookCloserRef.current(hit ?? selectedRef.current!);
        else {
          setSelected(hit);
          setFolded(false);
        }
      }
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      viewRef.current = clampView({ ...viewRef.current, fov: viewRef.current.fov * Math.exp(event.deltaY * 0.0012) });
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("wheel", wheel);
    };
  }, [phase]);

  const onKey = (event: React.KeyboardEvent) => {
    const step = 5 * (viewRef.current.fov / 60);
    const v = viewRef.current;
    const next: Record<string, View> = {
      ArrowLeft: { ...v, az: v.az - step },
      ArrowRight: { ...v, az: v.az + step },
      ArrowUp: { ...v, alt: v.alt + step },
      ArrowDown: { ...v, alt: v.alt - step },
      "+": { ...v, fov: v.fov / 1.25 },
      "=": { ...v, fov: v.fov / 1.25 },
      "-": { ...v, fov: v.fov * 1.25 },
    };
    if (next[event.key]) {
      event.preventDefault();
      fly.current = null;
      if (event.key.startsWith("Arrow")) track.current = false;
      viewRef.current = clampView(next[event.key]);
    }
  };

  const zoom = (factor: number) => {
    fly.current = null;
    viewRef.current = clampView({ ...viewRef.current, fov: viewRef.current.fov * factor });
  };

  const changeToggle = (key: keyof Toggles) => {
    setToggles((current) => {
      const next = { ...current, [key]: !current[key] };
      saveToggles(next);
      return next;
    });
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return setLocating("refused");
    setLocating("asking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSite({
          site: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            height: position.coords.altitude ?? 0,
          },
          mine: true,
        });
        setLocating("idle");
      },
      () => setLocating("refused"),
      { timeout: 15_000, maximumAge: 600_000 },
    );
  };

  // "Point at the sky": the phone's orientation drives the camera (iOS asks first).
  const togglePointing = async () => {
    if (pointing === "on") {
      orientation.current = null;
      setPointing("off");
      return;
    }
    const request = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (request && (await request().catch(() => "denied")) !== "granted") return setPointing("refused");
    const { Euler, Quaternion, Vector3 } = await import("three");
    const euler = new Euler();
    const screenTurn = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    const zee = new Vector3(0, 0, 1);
    const onOrientation = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      if (event.beta === null || event.gamma === null) return;
      // Compass-true yaw: iOS gives a heading, Android's absolute event an alpha.
      const alpha = event.webkitCompassHeading !== undefined ? 360 - event.webkitCompassHeading : (event.alpha ?? 0);
      euler.set(event.beta * DEG, alpha * DEG, -event.gamma * DEG, "YXZ");
      const q = new Quaternion().setFromEuler(euler).multiply(screenTurn);
      const turn = (screen.orientation?.angle ?? 0) * DEG;
      q.multiply(new Quaternion().setFromAxisAngle(zee, -turn));
      orientation.current = q;
      const forward = new Vector3(0, 0, -1).applyQuaternion(q);
      viewRef.current = clampView({
        ...viewRef.current,
        alt: Math.asin(Math.max(-1, Math.min(1, forward.y))) / DEG,
        az: Math.atan2(forward.x, -forward.z) / DEG,
      });
    };
    const kind = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(kind, onOrientation as EventListener);
    setPointing("on");
    const stop = () => {
      window.removeEventListener(kind, onOrientation as EventListener);
      orientation.current = null;
    };
    stopPointing.current = stop;
  };
  const stopPointing = useRef<() => void>(() => {});
  useEffect(() => {
    if (pointing !== "on") stopPointing.current();
  }, [pointing]);

  // What is up now, for the list (and the whole page without WebGL).
  const states = useMemo(() => bodies(now, site.site), [now, site.site]);
  const sun = states[0];
  const sky = skyState(sun.alt);

  // Search: every name an object goes by, in both languages.
  const searchable = useMemo(() => {
    const list: { key: string; label: string; names: string[] }[] = [];
    for (const name of Object.keys(copy.bodies) as SkyBodyName[]) {
      list.push({ key: `body:${name}`, label: copy.bodies[name], names: [nightSkyCopy.en.bodies[name], nightSkyCopy.ka.bodies[name]] });
    }
    for (const thing of things) {
      if (thing.kind === "body") continue;
      const showpiece = SHOWPIECES.find((s) => s.id === thing.id);
      const names =
        thing.kind === "constellation"
          ? [thing.name, thing.id, constellations.find((c) => c.id === thing.id)?.name ?? "", constellationKa[thing.id] ?? ""]
          : thing.type === "star"
            ? [BRIGHT_STARS.find((s) => s.id === thing.id)?.name ?? "", starKa[thing.id] ?? ""]
            : [showpiece?.name.en ?? "", showpiece?.name.ka ?? "", TELESCOPE_TARGET_BY_ID.get(thing.id)?.catalog ?? "", thing.id];
      list.push({ key: `${thing.kind}:${thing.id}`, label: thing.name, names: names.filter(Boolean) });
    }
    return list;
  }, [things, copy, constellations]);
  // An exact name first, then a name that starts with the query, then any match.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const rank = (names: string[]) => {
      const lower = names.map((n) => n.toLowerCase());
      if (lower.includes(q)) return 0;
      if (lower.some((n) => n.startsWith(q))) return 1;
      return lower.some((n) => n.includes(q)) ? 2 : 3;
    };
    return searchable
      .map((item) => ({ item, rank: rank(item.names) }))
      .filter((entry) => entry.rank < 3)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 8)
      .map((entry) => entry.item);
  }, [query, searchable]);

  // Where a key points, this instant.
  const locate = useCallback(
    (key: string, at: Date): { alt: number; az: number } | null => {
      const [kind, id] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
      if (kind === "body") return bodies(at, siteRef.current).find((state) => state.name === id) ?? null;
      if (kind === "fixed") {
        const thing = things.find((t) => t.kind === "fixed" && t.id === id);
        return thing && thing.kind === "fixed" ? fixedAltAz(thing.raHours, thing.decDeg, at, siteRef.current) : null;
      }
      if (kind === "constellation") {
        const thing = things.find((t) => t.kind === "constellation" && t.id === id);
        if (!thing || thing.kind !== "constellation") return null;
        const [x, y, z] = thing.label;
        return fixedAltAz(((Math.atan2(y, x) / DEG / 15) + 24) % 24, Math.asin(z) / DEG, at, siteRef.current);
      }
      if (kind === "star" && starsRef.current) {
        const i = Number(id) * 5;
        const [x, y, z] = starsRef.current.subarray(i, i + 3);
        return fixedAltAz(((Math.atan2(y, x) / DEG / 15) + 24) % 24, Math.asin(z) / DEG, at, siteRef.current);
      }
      return null;
    },
    [things],
  );

  const flyTo = (to: View) => {
    orientation.current = null;
    if (pointing === "on") setPointing("off");
    if (reduceMotion.current) {
      fly.current = null;
      viewRef.current = to;
      return;
    }
    const zoomSteps = Math.abs(Math.log2(to.fov / viewRef.current.fov));
    // The frame loop stamps the start on the flight's first frame.
    fly.current = { from: viewRef.current, to, start: -1, duration: Math.min(2400, 900 + 200 * zoomSteps) };
  };

  const goTo = (key: string) => {
    const where = locate(key, simDate());
    setQuery("");
    if (!where) return setSearchNote(copy.search.none);
    setSelected(key);
    setFolded(false);
    setSearchNote(where.alt < 0 ? copy.search.below : null);
    const fov = key.startsWith("constellation:") ? 60 : key.startsWith("body:") ? 25 : 30;
    track.current = where.alt > 0 && !key.startsWith("constellation:");
    flyTo(clampView({ alt: Math.max(where.alt, 5), az: where.az, fov }));
  };

  // Close enough to see it: a planet's disc, a plate, a double split. The view then follows it.
  const lookCloser = (key: string) => {
    const renderer = rendererRef.current;
    const where = locate(key, simDate());
    if (!renderer || !where) return;
    setSelected(key);
    if (where.alt < 0 && !togglesRef.current.ground) return setSearchNote(copy.search.below);
    setSearchNote(null);
    setFolded(true);
    track.current = !key.startsWith("constellation:");
    flyTo(clampView({ alt: where.alt, az: where.az, fov: renderer.fitFov(key) }));
  };
  useEffect(() => {
    lookCloserRef.current = lookCloser;
  });

  // A pick from the list flies there and folds the list away, so the panel shows.
  const pickFromList = (key: string) => {
    if (phase === "ready" && listRef.current) listRef.current.open = false;
    goTo(key);
  };

  const wholeSky = () => {
    track.current = false;
    flyTo(clampView({ alt: Math.min(Math.max(viewRef.current.alt, 20), 60), az: viewRef.current.az, fov: 70 }));
  };

  const direction = (az: number) => copy.points[Math.round(az / 45) % 8];

  // What a key is, for the astronomy: a body, or a fixed J2000 place (a constellation has none).
  const targetOf = useCallback(
    (key: string): Target | null => {
      const [kind, id] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
      if (kind === "body") return { body: id as SkyBodyName };
      if (kind === "fixed") {
        const thing = things.find((t) => t.kind === "fixed" && t.id === id);
        return thing && thing.kind === "fixed" ? { raHours: thing.raHours, decDeg: thing.decDeg } : null;
      }
      if (kind === "star" && starData) {
        const [x, y, z] = starData.subarray(Number(id) * 5, Number(id) * 5 + 3);
        return { raHours: ((Math.atan2(y, x) / DEG / 15) + 24) % 24, decDeg: Math.asin(z) / DEG };
      }
      return null;
    },
    [things, starData],
  );

  // The panel's facts for the selected thing.
  const picked = useMemo<Picked | null>(() => {
    if (!selected) return null;
    const kind = selected.slice(0, selected.indexOf(":"));
    const id = selected.slice(selected.indexOf(":") + 1);
    if (kind === "body") {
      const state = states.find((s) => s.name === id) as BodyState;
      const slug = bookable.find((target) => target.body === id.toUpperCase())?.slug ?? null;
      return {
        key: selected,
        name: copy.bodies[state.name],
        type: state.name === "Sun" ? "sun" : state.name === "Moon" ? "moon" : "planet",
        magnitude: state.magnitude,
        alt: state.alt,
        az: state.az,
        raHours: state.raHours,
        decDeg: state.decDeg,
        epoch: "date",
        lit: state.name === "Sun" ? null : Math.round(state.litFraction * 100),
        slug,
      };
    }
    let ra: number;
    let dec: number;
    let name: string;
    let type: Picked["type"];
    let magnitude: number | null;
    if (kind === "star" && starData) {
      const i = Number(id) * 5;
      const [x, y, z, v] = starData.subarray(i, i + 4);
      ra = ((Math.atan2(y, x) / DEG / 15) + 24) % 24;
      dec = Math.asin(z) / DEG;
      name = copy.types.star;
      type = "star";
      magnitude = Math.round(v * 100) / 100;
    } else {
      const thing = things.find((t) => `${t.kind}:${t.id}` === selected);
      if (!thing || thing.kind === "body") return null;
      if (thing.kind === "constellation") {
        const [x, y, z] = thing.label;
        ra = ((Math.atan2(y, x) / DEG / 15) + 24) % 24;
        dec = Math.asin(z) / DEG;
        name = thing.name;
        type = "constellation";
        magnitude = null;
      } else {
        ra = thing.raHours;
        dec = thing.decDeg;
        name = thing.name;
        type = thing.type;
        magnitude = thing.magnitude;
      }
    }
    const where = fixedAltAz(ra, dec, now, site.site);
    const slug =
      type === "constellation"
        ? null
        : (bookable.find(
            (target) =>
              target.raHours !== null &&
              target.decDeg !== null &&
              separation(target.raHours, target.decDeg, ra, dec) < 0.3,
          )?.slug ?? null);
    return {
      key: selected,
      name,
      type,
      magnitude,
      alt: where.alt,
      az: where.az,
      raHours: ra,
      decDeg: dec,
      epoch: "J2000",
      lit: null,
      slug,
    };
    // `now` ticks four times a second; the panel follows it.
  }, [selected, now, states, things, bookable, copy, site.site, starData]);

  // Rise, transit and set are searches: once per object and ten minutes of sky time.
  const tenMinutes = Math.floor(now.getTime() / 600_000);
  const pickedType = picked?.type;
  const pickedRa = picked?.raHours;
  const pickedDec = picked?.decDeg;
  const pickedEvents = useMemo(() => {
    if (!selected || pickedType === undefined || pickedType === "constellation") return null;
    const from = new Date(tenMinutes * 600_000);
    if (selected.startsWith("body:")) return events({ body: selected.slice(5) as SkyBodyName }, from, site.site);
    return events({ raHours: pickedRa!, decDeg: pickedDec! }, from, site.site);
    // RA/Dec of a fixed object never change; a body's are searched by astronomy-engine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pickedType, tenMinutes, site.site]);

  // Where a key's object stands at the page's instant, for a search result's up or down.
  const positionNow = (key: string) => {
    const target = targetOf(key);
    if (target) return whereAt(target, now, site.site);
    const thing = things.find((t) => `${t.kind}:${t.id}` === key);
    if (!thing || thing.kind !== "constellation") return null;
    const [x, y, z] = thing.label;
    return fixedAltAz(((Math.atan2(y, x) / DEG / 15) + 24) % 24, Math.asin(z) / DEG, now, site.site);
  };

  // The selected object's path across today's sky: twelve hours either side of now, in
  // ten-minute steps that land on the whole hours, with its rise, highest and set marked.
  const pathTarget = useMemo(() => (selected ? targetOf(selected) : null), [selected, targetOf]);
  const pathOverlay = useMemo<PathOverlay | null>(() => {
    if (!pathTarget) return null;
    const centre = tenMinutes * 600_000;
    const points = skyPath(pathTarget, new Date(centre - 12 * 3_600_000), 24, 10, site.site);
    const marks: PathOverlay["marks"] = [];
    if (pickedEvents) {
      const named = [
        [copy.panel.rise, pickedEvents.rise],
        [copy.panel.transit, pickedEvents.transit],
        [copy.panel.set, pickedEvents.set],
      ] as const;
      for (const [name, at] of named) {
        if (!at) continue;
        const where = whereAt(pathTarget, at, site.site);
        const height = name === copy.panel.transit ? ` · ${where.alt.toFixed(0)}°` : "";
        marks.push({ alt: where.alt, az: where.az, label: `${name} ${clock(at, "Asia/Tbilisi")}${height}` });
      }
    }
    return { points, marks, hourLabel: (at: number) => clock(new Date(at), "Asia/Tbilisi") };
  }, [pathTarget, pickedEvents, tenMinutes, site.site, copy]);
  useEffect(() => {
    rendererRef.current?.setPath(pathOverlay);
  }, [pathOverlay, phase]);

  // The list: the Moon, the planets and the showpieces, up first by height, then the rest
  // with their next rise (searched once per hour of sky time, and only while it is open).
  const roster = useMemo(() => {
    if (!listOpen && phase !== "no-webgl") return [];
    const list: { key: string; label: string; target: Target }[] = SKY_BODIES.filter((name) => name !== "Sun").map((name) => ({
      key: `body:${name}`,
      label: copy.bodies[name],
      target: { body: name },
    }));
    for (const thing of things) {
      if (thing.kind === "fixed" && thing.type !== "star") {
        list.push({ key: `fixed:${thing.id}`, label: thing.name, target: { raHours: thing.raHours, decDeg: thing.decDeg } });
      }
    }
    return list;
  }, [listOpen, phase, copy, things]);
  const hourOfSky = Math.floor(now.getTime() / 3_600_000);
  const rises = useMemo(
    () => new Map(roster.map((item) => [item.key, nextRise(item.target, new Date(hourOfSky * 3_600_000), site.site)])),
    [roster, hourOfSky, site.site],
  );
  const placed = roster.map((item) => ({ ...item, where: whereAt(item.target, now, site.site) }));
  const above = placed.filter((item) => item.where.alt > 0).sort((a, b) => b.where.alt - a.where.alt);
  const belowList = placed.filter((item) => item.where.alt <= 0);

  // The visitor's zone, read only in the browser: the server renders in its own (UTC on
  // Vercel), so the first render says Tbilisi on both sides and hydrates clean.
  const zone = useSyncExternalStore(noSubscription, browserZone, observatoryZone);
  const timeLabel = (at: Date | null) =>
    at ? `${dayMonth(at, locale, "Asia/Tbilisi")}, ${clock(at, "Asia/Tbilisi")}` : copy.panel.never;

  const shift = (ms: number) => setSimTime(simDate().getTime() + ms, { playing: time.current.playing });
  const toNow = () => {
    setSimTime(Date.now(), { speed: 1, playing: true });
    setSpeed(1);
    setPlaying(true);
  };

  return (
    <div className="sky" data-sky-state={sky}>
      <div
        className="sky-stage"
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-label={`${copy.view.canvas}. ${copy.view.help}`}
        aria-roledescription="sky"
        onKeyDown={onKey}
      >
        <canvas ref={canvasRef} className="sky-canvas" aria-hidden="true" />
        <canvas ref={overlayRef} className="sky-overlay" aria-hidden="true" />
        <div ref={labelsRef} className="sky-labels" aria-hidden="true" />
        {phase === "loading" && (
          <p className="sky-loading" role="status">
            {copy.loading}
          </p>
        )}
      </div>

      {/* The top controls and the side ones stack in flow, so a row that wraps (Georgian,
          a narrow phone) pushes the next down instead of running into it. */}
      <div className="sky-head">
        <div className="sky-top">
          <div className="sky-search" role="search">
            <label className="visually-hidden" htmlFor="sky-search-input">
              {copy.search.label}
            </label>
            <input
              id="sky-search-input"
              className="sky-input"
              type="search"
              value={query}
              placeholder={copy.search.placeholder}
              autoComplete="off"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="sky-search-results"
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchNote(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (results[0]) goTo(results[0].key);
                  else if (query.trim()) setSearchNote(copy.search.none);
                }
              }}
            />
            {results.length > 0 && (
              <ul id="sky-search-results" className="sky-results" role="listbox" aria-label={copy.search.label}>
                {results.map((item) => {
                  const where = positionNow(item.key);
                  return (
                    <li key={item.key} role="option" aria-selected={false}>
                      <button type="button" onClick={() => goTo(item.key)}>
                        <span>{item.label}</span>
                        {where && (
                          <span className={`sky-status ${where.alt > 0 ? "is-up" : "is-down"}`}>
                            {where.alt > 0 ? copy.status.upShort(Math.round(where.alt)) : copy.status.downShort}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {searchNote && (
              <p className="sky-note" role="status">
                {searchNote}
              </p>
            )}
          </div>
          <div className="sky-place">
            <span>{site.mine ? copy.yours : copy.site}</span>
            {!site.mine && (
              <button type="button" className="sky-chip" onClick={useMyLocation} disabled={locating === "asking"}>
                {locating === "asking" ? copy.locating : copy.useLocation}
              </button>
            )}
            {locating === "refused" && <span className="sky-note">{copy.locationRefused}</span>}
            {site.mine && <span className="sky-note">{copy.locationNote}</span>}
          </div>
        </div>

        <div className="sky-side">
          <details className="sky-toggles">
            <summary>{copy.toggles.label}</summary>
            <fieldset>
              <legend className="visually-hidden">{copy.toggles.label}</legend>
              {(Object.keys(DEFAULT_TOGGLES) as (keyof Toggles)[]).map((key) => (
                <label key={key} className="sky-toggle">
                  <input type="checkbox" checked={toggles[key]} onChange={() => changeToggle(key)} />
                  <span>{copy.toggles[key]}</span>
                </label>
              ))}
            </fieldset>
          </details>
          <div className="sky-zoom">
            <button type="button" className="sky-chip" aria-label={copy.view.zoomIn} onClick={() => zoom(1 / 1.4)}>
              +
            </button>
            <button type="button" className="sky-chip" aria-label={copy.view.zoomOut} onClick={() => zoom(1.4)}>
              −
            </button>
          </div>
          {phase === "ready" && (
            <button type="button" className="sky-chip sky-point" aria-pressed={pointing === "on"} onClick={() => void togglePointing()}>
              {pointing === "on" ? copy.view.stopPointing : copy.view.point}
            </button>
          )}
          {pointing === "refused" && <p className="sky-note">{copy.view.pointRefused}</p>}
        </div>
      </div>

      {/* The time bar, and the list button above it however tall the bar grows. */}
      <div className="sky-foot">
        <div className="sky-time" role="group" aria-label={copy.time.label}>
          <div className="sky-clock">
            <span>
              <b>{clock(now, "Asia/Tbilisi")}</b> {copy.time.tbilisi} · {dayMonth(now, locale, "Asia/Tbilisi")}
            </span>
            {zone !== "Asia/Tbilisi" && (
              <span>
                <b>{clock(now, zone)}</b> {copy.time.yourZone}
              </span>
            )}
            <span className="sky-state">{copy.state[sky]}</span>
            {/* Close up, what is drawn is a disc or a plate: an illustration (CLAUDE.md). */}
            <span className="sky-computed sky-computed-wide">{copy.computed}</span>
            <span className="sky-computed sky-computed-close">{copy.panel.illustration}</span>
          </div>
          <div className="sky-steps">
            <button type="button" className="sky-chip" aria-label={copy.time.dayBackLabel} onClick={() => shift(-86_400_000)}>
              {copy.time.dayBack}
            </button>
            <button type="button" className="sky-chip" aria-label={copy.time.hourBackLabel} onClick={() => shift(-3_600_000)}>
              {copy.time.hourBack}
            </button>
            <button
              type="button"
              className="sky-chip"
              aria-pressed={!playing}
              onClick={() => {
                const next = !playing;
                setSimTime(simDate().getTime(), { playing: next });
                setPlaying(next);
              }}
            >
              {playing ? copy.time.pause : copy.time.play}
            </button>
            <button type="button" className="sky-chip sky-now" onClick={toNow}>
              {copy.time.now}
            </button>
            <button type="button" className="sky-chip" aria-label={copy.time.hourOnLabel} onClick={() => shift(3_600_000)}>
              {copy.time.hourOn}
            </button>
            <button type="button" className="sky-chip" aria-label={copy.time.dayOnLabel} onClick={() => shift(86_400_000)}>
              {copy.time.dayOn}
            </button>
          </div>
          <div className="sky-speed" role="radiogroup" aria-label={copy.time.speed}>
            {SPEEDS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={speed === value}
                className="sky-chip"
                onClick={() => {
                  setSimTime(simDate().getTime(), { speed: value, playing: true });
                  setSpeed(value);
                  setPlaying(true);
                }}
              >
                ×{value}
              </button>
            ))}
          </div>
        </div>
        <details
          ref={listRef}
          className="sky-list"
          open={phase === "no-webgl" || undefined}
          onToggle={(event) => setListOpen(event.currentTarget.open)}
        >
          <summary>{phase === "no-webgl" ? copy.noWebgl : copy.listTitle}</summary>
          <h2 className="sky-list-title">{copy.upNow}</h2>
          {above.length === 0 ? (
            <p>{copy.upNowEmpty}</p>
          ) : (
            <ul className="sky-roster">
              {above.map((item) => (
                <li key={item.key}>
                  <button type="button" onClick={() => pickFromList(item.key)}>
                    <span className="sky-status is-up">{item.label}</span>
                    <span>{copy.status.high(Math.round(item.where.alt), direction(item.where.az))}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {belowList.length > 0 && (
            <>
              <h2 className="sky-list-title">{copy.belowNow}</h2>
              <ul className="sky-roster">
                {belowList.map((item) => {
                  const rise = rises.get(item.key);
                  return (
                    <li key={item.key}>
                      <button type="button" onClick={() => pickFromList(item.key)}>
                        <span className="sky-status is-down">{item.label}</span>
                        <span>{rise ? copy.status.rises(clock(rise, "Asia/Tbilisi")) : copy.status.never}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <p className="sky-credits">{copy.credits}</p>
        </details>
      </div>

      {picked && (
        <aside className="sky-panel" aria-labelledby="sky-panel-title" data-picked={picked.key} data-folded={folded}>
          <header>
            <h2 id="sky-panel-title">{picked.name}</h2>
            <button type="button" className="sky-chip" onClick={() => setSelected(null)}>
              {copy.panel.close}
            </button>
          </header>
          <p className={`sky-status sky-status-line ${picked.alt > 0 ? "is-up" : "is-down"}`}>
            {picked.alt > 0
              ? `${copy.status.up} · ${copy.status.high(Math.round(picked.alt), direction(picked.az))}${
                  pickedEvents && !pickedEvents.set && picked.type !== "constellation" ? ` · ${copy.status.always}` : ""
                }`
              : `${copy.status.down}${
                  picked.type === "constellation"
                    ? ""
                    : ` · ${pickedEvents?.rise ? copy.status.rises(timeLabel(pickedEvents.rise)) : copy.status.never}`
                }`}
          </p>
          {phase === "ready" && (
            <div className="sky-look">
              {picked.type !== "constellation" && (picked.alt > 0 || toggles.ground) && (
                <button type="button" className="sky-chip sky-closer" onClick={() => lookCloser(picked.key)}>
                  {copy.panel.closer}
                </button>
              )}
              <button type="button" className="sky-chip" onClick={wholeSky}>
                {copy.panel.wide}
              </button>
              <button type="button" className="sky-chip sky-unfold" aria-expanded={!folded} onClick={() => setFolded(!folded)}>
                {copy.panel.details}
              </button>
            </div>
          )}
          <dl>
            <div>
              <dt>{copy.panel.type}</dt>
              <dd>{copy.types[picked.type]}</dd>
            </div>
            {picked.magnitude !== null && (
              <div>
                <dt>{copy.panel.magnitude}</dt>
                <dd>{picked.magnitude.toFixed(1).replace("-", "−")}</dd>
              </div>
            )}
            {picked.lit !== null && (
              <div>
                <dt>{copy.panel.phase}</dt>
                <dd>{copy.panel.lit(picked.lit)}</dd>
              </div>
            )}
            <div>
              <dt>{copy.panel.altitude}</dt>
              <dd>{picked.alt.toFixed(1).replace("-", "−")}°</dd>
            </div>
            <div>
              <dt>{copy.panel.azimuth}</dt>
              <dd>{picked.az.toFixed(1)}°</dd>
            </div>
            <div>
              <dt>
                {copy.panel.ra} ({picked.epoch === "J2000" ? "J2000" : copy.panel.ofDate})
              </dt>
              <dd>{raText(picked.raHours)}</dd>
            </div>
            <div>
              <dt>{copy.panel.dec}</dt>
              <dd>{decText(picked.decDeg)}</dd>
            </div>
            {pickedEvents && (
              <>
                <div>
                  <dt>{copy.panel.rise}</dt>
                  <dd>{timeLabel(pickedEvents.rise)}</dd>
                </div>
                <div>
                  <dt>{copy.panel.transit}</dt>
                  <dd>{timeLabel(pickedEvents.transit)}</dd>
                </div>
                <div>
                  <dt>{copy.panel.set}</dt>
                  <dd>{timeLabel(pickedEvents.set)}</dd>
                </div>
              </>
            )}
          </dl>
          {picked.slug && (
            <div className="sky-observe">
              <p>{copy.panel.observeNote}</p>
              <Link className="button button-primary button-medium" href={`/${locale}/app/book?target=${encodeURIComponent(picked.slug)}`}>
                <span>{copy.panel.observe}</span>
              </Link>
            </div>
          )}
          {picked.type !== "star" && picked.type !== "constellation" && <p className="sky-caption">{copy.panel.illustration}</p>}
        </aside>
      )}

    </div>
  );
}

export type { Vec3 };
