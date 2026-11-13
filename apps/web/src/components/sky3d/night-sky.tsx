"use client";

import type { SolarSystemBody } from "@darkview/contracts";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  AU_KM,
  SITE,
  SKY_BODIES,
  bodies,
  bodyState,
  constellationAt,
  constellationOfBody,
  FIGURES_URL,
  STARS_URL,
  declinationAt,
  decodeCatalogue,
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
import { aimAt, clampView, directionAt, zoomAbout, type View } from "@/features/sky3d/projection";
import { dayMonth } from "@/features/cards/dates";
import type { Locale } from "@/i18n/config";
import { constellationKa, nightSkyCopy, starKa } from "@/i18n/resources/night-sky";
import { SHOWPIECES } from "@/lib/observatory-sim/showpieces";
import { BRIGHT_STARS } from "@/lib/observatory-sim/stars";
import { TELESCOPE_TARGET_BY_ID } from "@/lib/observatory-sim/telescope-targets";

import type { Constellation, DsoShape, PathOverlay, SkyRenderer, SkyThing, Toggles } from "./renderer";
import { SkyIcon } from "./sky-icons";

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
  dso: true,
  path: true,
  altaz: false,
  equatorial: false,
  milkyway: true,
  atmosphere: true,
  ground: false,
};
/** The dock's switches, in order. `ground` is the landscape: lit while the ground is solid. */
const TOOLS: (keyof Toggles)[] = ["lines", "names", "dso", "atmosphere", "ground", "altaz", "equatorial", "milkyway", "path"];
const DEG = Math.PI / 180;
/** Half the time slider's reach either side of the present, minutes. */
const SCRUB = 720;

type Loaded = [typeof import("./renderer"), ArrayBuffer, Constellation[]];
let loading: Promise<Loaded> | null = null;
/**
 * The renderer's code, the stars and the figures, all at once. Started as soon as this
 * module runs in the browser -- before the page has hydrated -- so the three arrive
 * together instead of one after another; a failed load is tried again on the next mount.
 */
function load() {
  loading ??= Promise.all([
    import("./renderer"),
    fetch(STARS_URL).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`stars ${r.status}`)))),
    fetch(FIGURES_URL).then((r) => (r.ok ? (r.json() as Promise<Constellation[]>) : Promise.reject(new Error(`figures ${r.status}`)))),
  ]).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}
if (typeof window !== "undefined") void load().catch(() => {});

/** A Messier object as scripts/build-sky-data.mjs writes it. */
type Messier = {
  id: string;
  ngc: string | null;
  name: string | null;
  kind: DsoShape;
  mag: number;
  size: [number, number];
  ra: number;
  dec: number;
};

/** The objects with a small picture for the panel's head (public/sky/targets/icons). */
const PICTURED = new Set(["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "m31", "m42", "m57", "sirius", "arcturus"]);

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

function clock(at: Date, timeZone: string, seconds = false) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds && { second: "2-digit" }),
    hourCycle: "h23",
    timeZone,
  }).format(at);
}

/** An apparent width: arcseconds under an arcminute, arcminutes above. */
function sizeText(degrees: number) {
  return degrees < 1 / 60 ? `${(degrees * 3600).toFixed(1)}″` : `${(degrees * 60).toFixed(1)}′`;
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
  /** The constellation it stands in, by IAU abbreviation and Latin name. */
  within: { id: string; name: string } | null;
  distanceAu: number | null;
  /** Apparent size, worded. */
  size: string | null;
  catalogue: string | null;
  about: string | null;
  picture: string | null;
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
export function NightSky({ locale, openedAt }: { locale: Locale; openedAt: number }) {
  const copy = nightSkyCopy[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const starsRef = useRef<Float32Array | null>(null);

  // Time: the simulated instant runs from an anchor at a speed, or stands still. The anchor
  // is on the wall clock, not the page's own timer, which stops while a laptop sleeps: a
  // tab left open overnight still shows this morning's sky.
  const time = useRef({ anchorSim: openedAt, anchorReal: 0, speed: 1, playing: true });
  // South, low enough that the horizon shows above the time bar.
  const viewRef = useRef<View>({ alt: 20, az: 180, fov: 75 });
  // Inertia after a drag, in degrees a millisecond, and a zoom easing toward its goal while
  // the point under the pointer stays put.
  const velocity = useRef({ alt: 0, az: 0 });
  const zoomGoal = useRef<{ fov: number; x: number; y: number } | null>(null);
  // A finger or button is down on the sky: the view is the hand's, and does not coast.
  const pressed = useRef(false);
  const fly = useRef<{ from: View; to: View; start: number; duration: number } | null>(null);
  // Following the selected object as the sky turns: after a search or a closer look.
  const track = useRef(false);
  const lookCloserRef = useRef<(key: string) => void>(() => {});
  const orientation = useRef<import("three").Quaternion | null>(null);
  const pointer = useRef<import("./pointing").Pointing | null>(null);
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
  const [messier, setMessier] = useState<Messier[]>([]);
  // What the observatory offers, for the panel's booking link: asked for once the sky is up.
  const [bookable, setBookable] = useState<Bookable[]>([]);
  // One sheet open at a time over the dock: the place, the time, or the list of what is up.
  const [open, setOpen] = useState<"place" | "time" | "list" | null>(null);
  const [full, setFull] = useState(false);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(0);
  // The simulated instant against the wall clock, minutes: where the time slider stands.
  const [offset, setOffset] = useState(0);
  // On a phone the panel is a sheet over the sky: it opens folded to its head, so the
  // object and its path show, and Details unfolds it.
  const [folded, setFolded] = useState(true);

  useEffect(() => {
    togglesRef.current = toggles;
  }, [toggles]);
  useEffect(() => {
    siteRef.current = site.site;
    pointer.current?.setDeclination(declinationAt(site.site));
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
      setOffset(Math.round((at - t.anchorReal) / 60_000));
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
    const catalogue = new Map(messier.map((object) => [object.id.toLowerCase(), object]));
    for (const showpiece of SHOWPIECES) {
      const target = TELESCOPE_TARGET_BY_ID.get(showpiece.id);
      if (!target || target.ra === undefined || target.dec === undefined || target.kind === "star") continue;
      const listed = catalogue.get(showpiece.id);
      catalogue.delete(showpiece.id);
      list.push({
        kind: "fixed",
        id: showpiece.id,
        name: `${showpiece.name[locale]}${target.catalog ? ` · ${target.catalog}` : ""}`,
        type: target.kind === "galaxy" ? "galaxy" : target.kind === "nebula" ? "nebula" : "cluster",
        raHours: target.ra,
        decDeg: target.dec,
        magnitude: listed?.mag ?? null,
        labelled: true,
        mark: {
          shape: listed?.kind ?? (target.kind === "galaxy" ? "galaxy" : target.kind === "nebula" ? "nebula" : "open"),
          major: listed?.size[0] ?? 10,
          minor: listed?.size[1] ?? 10,
        },
      });
    }
    // The rest of Messier's list: found by search, and drawn as the view narrows onto them.
    for (const object of catalogue.values()) {
      list.push({
        kind: "fixed",
        id: object.id.toLowerCase(),
        name: object.name && locale === "en" ? `${object.name} · ${object.id}` : object.id,
        type: object.kind === "galaxy" ? "galaxy" : object.kind === "nebula" ? "nebula" : "cluster",
        raHours: object.ra,
        decDeg: object.dec,
        magnitude: object.mag,
        labelled: false,
        mark: { shape: object.kind, major: object.size[0], minor: object.size[1] },
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
  }, [constellations, locale, starData, messier]);
  const messierById = useMemo(() => new Map(messier.map((object) => [object.id.toLowerCase(), object])), [messier]);

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
        performance.mark("sky:mounted");
        const [module, stars, figures] = await load();
        if (cancelled) return;
        performance.mark("sky:loaded");
        // A phone held upright sees a narrow strip of a desk's view: open it wider.
        if (window.innerWidth < 768) viewRef.current = { alt: 33, az: 180, fov: 100 };
        // Each star carried along its proper motion to the day the page opens.
        starsRef.current = starsAtDate(decodeCatalogue(stars), new Date(openedAt));
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
        await rendererRef.current.warm(viewRef.current).catch(() => {});
        if (cancelled) return;
        // The page was rendered a moment ago, or restored from a cache long after: start
        // from the visitor's own clock, unless it runs behind the server's.
        const clientNow = Date.now();
        if (clientNow > openedAt - 300_000) time.current.anchorSim = clientNow;
        time.current.anchorReal = clientNow;
        performance.mark("sky:built");
        // Development only: the view and the camera's projection, for sensor tests.
        if (process.env.NODE_ENV !== "production") {
          const renderer = rendererRef.current;
          Object.assign(window, { __sky: { view: () => viewRef.current, screenAt: (world: Vec3) => renderer.screenAt(world) } });
        }
        setPhase("ready");
      } catch {
        if (cancelled) return;
        // The list stands in for the sky, and reads the visitor's clock itself.
        setNow(new Date());
        setPhase("no-webgl");
      }
    })();
    // Messier's list never holds the first frame up.
    fetch("/sky/data/messier.json")
      .then((r) => r.json() as Promise<Messier[]>)
      .then((list) => !cancelled && setMessier(list))
      .catch(() => {});
    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [openedAt]);

  // What the observatory can be booked for matters only once something is picked: ask then,
  // once, so a visitor who only looks never loads the contract's validators.
  const askedBookable = useRef(false);
  useEffect(() => {
    if (!selected || askedBookable.current) return;
    askedBookable.current = true;
    let cancelled = false;
    // Both modules load here and only here: the API client pulls in every contract schema.
    Promise.all([import("@darkview/contracts/zod"), import("@/lib/platform/browser")])
      .then(([{ zListTargetsResponse }, { apiRequest }]) => apiRequest("/targets?limit=100", { schema: zListTargetsResponse }))
      .then(({ items }) => {
        if (cancelled) return;
        setBookable(
          items
            .filter((target) => target.enabled)
            .map((target) => ({
              slug: target.slug,
              body: target.solarSystemBody ?? null,
              raHours: target.coordinates?.raHours ?? null,
              decDeg: target.coordinates?.decDegrees ?? null,
            })),
        );
      })
      .catch(() => {
        askedBookable.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

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
    // The stage's size, kept by the observer: read in the loop it would force a layout a frame.
    let width = stage.clientWidth;
    let height = stage.clientHeight;
    const resize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      renderer.resize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    let last = 0;
    let lastSecond = 0;
    let drewFirst = false;
    const frame = (t: number) => {
      // A frame's time step, held short so a tab coming back does not lurch.
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      const v = velocity.current;
      // The flight to a searched object; else a zoom easing to its goal; and inertia.
      const flying = fly.current;
      if (flying) {
        if (flying.start < 0) flying.start = t;
        const k = Math.min(1, (t - flying.start) / flying.duration);
        // Ease in and out on a quintic, so a flight starts and lands softly.
        const e = k < 0.5 ? 16 * k ** 5 : 1 - (-2 * k + 2) ** 5 / 2;
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
      } else {
        const goal = zoomGoal.current;
        if (goal) {
          const now = viewRef.current;
          const step = reduceMotion.current ? 1 : 1 - Math.exp(-dt / 80);
          let fov = now.fov * (goal.fov / now.fov) ** step;
          const done = Math.abs(Math.log(goal.fov / fov)) < 0.003;
          if (done) fov = goal.fov;
          viewRef.current = track.current
            ? clampView({ ...now, fov })
            : zoomAbout(now, fov, goal.x, goal.y, width, height);
          if (done) zoomGoal.current = null;
        }
        // Coasting after a drag fades over about a third of a second, as a phone's lists do.
        const speed = Math.hypot(v.alt, v.az);
        if (speed > 0 && !pressed.current) {
          if (reduceMotion.current || speed * 1000 < viewRef.current.fov * 0.004) {
            velocity.current = { alt: 0, az: 0 };
          } else {
            viewRef.current = clampView({ ...viewRef.current, alt: viewRef.current.alt + v.alt * dt, az: viewRef.current.az + v.az * dt });
            const fade = Math.exp(-dt / 325);
            velocity.current = { alt: v.alt * fade, az: v.az * fade };
          }
        }
      }
      // Pointing: the filtered camera, and the alt-az it looks at for everything else.
      const aimed = pointer.current?.step(dt) ?? null;
      orientation.current = aimed;
      if (aimed) {
        const ahead = { x: 0, y: 0, z: -1 };
        // Forward (0, 0, -1) turned by the quaternion, written out.
        const { x, y, z, w } = aimed;
        ahead.x = -(2 * (x * z + w * y));
        ahead.y = -(2 * (y * z - w * x));
        ahead.z = -(1 - 2 * (x * x + y * y));
        viewRef.current = clampView({
          ...viewRef.current,
          alt: Math.asin(Math.max(-1, Math.min(1, ahead.y))) / DEG,
          az: Math.atan2(ahead.x, -ahead.z) / DEG,
        });
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
      if (!drewFirst) {
        drewFirst = true;
        performance.mark("sky:first-frame");
      }
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
      // The clock's second, as it turns; a fast clock four times a second at most.
      const second = Math.floor(date.getTime() / 1000);
      if (second !== lastSecond && t - lastClock > 240) {
        lastSecond = second;
        lastClock = t;
        setNow(date);
        setOffset(Math.round((date.getTime() - Date.now()) / 60_000));
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

  // Look around: drag, pinch, wheel, keys; a tap picks, a double tap looks closer.
  useEffect(() => {
    if (phase !== "ready") return;
    const stage = stageRef.current!;
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt = { x: 0, y: 0, t: 0 };
    let lastTap = { x: 0, y: 0, t: 0 };
    let lastMove = 0;
    // What the finger took hold of: the sky's direction under it, held under it as it moves.
    let held: Vec3 | null = null;
    // Two fingers: their spread at the start and the field then; a gesture that had two is
    // never a tap.
    let pinch: { spread: number; fov: number } | null = null;
    let multi = false;
    // The stage's box, read once a gesture: reading it on every move made the browser lay the
    // page out again mid-drag, after each frame's label changes.
    let box = stage.getBoundingClientRect();
    const measure = () => {
      box = stage.getBoundingClientRect();
    };
    const local = (event: { clientX: number; clientY: number }) => ({ x: event.clientX - box.left, y: event.clientY - box.top });
    const size = () => [box.width, box.height] as const;
    const middle = () => {
      const [a, b] = [...pointers.values()];
      return local({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 });
    };
    const spread = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const hold = (at: { x: number; y: number }) => {
      held = directionAt(viewRef.current, at.x, at.y, ...size());
    };

    const down = (event: PointerEvent) => {
      stage.setPointerCapture(event.pointerId);
      if (pointers.size === 0) measure();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pressed.current = true;
      if (pointers.size === 1) {
        downAt = { x: event.clientX, y: event.clientY, t: performance.now() };
        multi = false;
        hold(local(event));
      }
      setOpen(null);
      searchRef.current?.blur();
      velocity.current = { alt: 0, az: 0 };
      zoomGoal.current = null;
      fly.current = null;
      if (pointers.size === 2) {
        multi = true;
        pinch = { spread: spread(), fov: viewRef.current.fov };
        hold(middle());
      }
    };
    const move = (event: PointerEvent) => {
      const before = pointers.get(event.pointerId);
      if (!before) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      // While the phone points the camera, fingers only zoom.
      if (pointer.current) {
        if (pointers.size === 2 && pinch) {
          viewRef.current = clampView({ ...viewRef.current, fov: pinch.fov * (pinch.spread / Math.max(1, spread())) });
        }
        return;
      }
      // One finger turns the sky, also the one left after a pinch.
      if (pointers.size === 1 && held) {
        if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 6) track.current = false;
        if (track.current) return;
        const before = viewRef.current;
        const at = local(event);
        viewRef.current = aimAt(before, held, at.x, at.y, ...size());
        // The release speed, smoothed over the last few moves.
        const now = performance.now();
        const dt = Math.max(8, now - lastMove);
        lastMove = now;
        let dAz = viewRef.current.az - before.az;
        if (dAz > 180) dAz -= 360;
        if (dAz < -180) dAz += 360;
        const v = velocity.current;
        velocity.current = {
          alt: 0.6 * ((viewRef.current.alt - before.alt) / dt) + 0.4 * v.alt,
          az: 0.6 * (dAz / dt) + 0.4 * v.az,
        };
      } else if (pointers.size === 2 && pinch && held) {
        // Two fingers zoom by their spread and carry the sky held between them.
        const fov = clampView({ ...viewRef.current, fov: pinch.fov * (pinch.spread / Math.max(1, spread())) }).fov;
        const mid = middle();
        viewRef.current = track.current
          ? clampView({ ...viewRef.current, fov })
          : aimAt({ ...viewRef.current, fov }, held, mid.x, mid.y, ...size());
      }
    };
    const up = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinch = null;
      // One finger left of two takes hold again where it is.
      if (pointers.size === 1) {
        const [only] = [...pointers.values()];
        hold(local({ clientX: only.x, clientY: only.y }));
      }
      if (pointers.size > 0) return;
      pressed.current = false;
      // Let go after resting: no coast.
      if (multi || performance.now() - lastMove > 70) velocity.current = { alt: 0, az: 0 };
      const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      if (multi || event.type === "pointercancel" || moved >= 6 || performance.now() - downAt.t >= 500) return;
      velocity.current = { alt: 0, az: 0 };
      const at = local(event);
      const hit = rendererRef.current?.pick(at.x, at.y) ?? null;
      const now = performance.now();
      const again = now - lastTap.t < 380 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30;
      lastTap = { x: event.clientX, y: event.clientY, t: again ? 0 : now };
      if (again && (hit ?? selectedRef.current)) lookCloserRef.current(hit ?? selectedRef.current!);
      else if (again) {
        // A double tap on open sky zooms in there.
        track.current = false;
        zoomGoal.current = { fov: clampView({ ...viewRef.current, fov: viewRef.current.fov / 2.2 }).fov, ...at };
      } else {
        setSelected(hit);
        setFolded(true);
      }
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!zoomGoal.current) measure();
      fly.current = null;
      // Lines and pages to pixels; a trackpad's pinch comes as a small wheel with ctrl held.
      const delta = event.deltaY * (event.deltaMode === 1 ? 33 : event.deltaMode === 2 ? box.height : 1);
      const factor = Math.exp(Math.max(-300, Math.min(300, delta)) * (event.ctrlKey ? 0.01 : 0.0016));
      const from = zoomGoal.current?.fov ?? viewRef.current.fov;
      zoomGoal.current = { fov: clampView({ ...viewRef.current, fov: from * factor }).fov, ...local(event) };
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
    };
    const factor = ({ "+": 1 / 1.4, "=": 1 / 1.4, "-": 1.4 } as Record<string, number>)[event.key];
    if (factor) {
      event.preventDefault();
      zoom(factor);
    } else if (next[event.key]) {
      event.preventDefault();
      fly.current = null;
      if (event.key.startsWith("Arrow")) track.current = false;
      viewRef.current = clampView(next[event.key]);
    }
  };

  // The buttons and keys zoom about the middle, easing there.
  const zoom = (factor: number) => {
    fly.current = null;
    const stage = stageRef.current;
    const from = zoomGoal.current?.fov ?? viewRef.current.fov;
    zoomGoal.current = {
      fov: clampView({ ...viewRef.current, fov: from * factor }).fov,
      x: (stage?.clientWidth ?? 0) / 2,
      y: (stage?.clientHeight ?? 0) / 2,
    };
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

  // "Point at the sky": the phone's orientation drives the camera (iOS asks first). The
  // readings go to a filter (pointing.ts) that the frame loop steps.
  const togglePointing = async () => {
    if (pointing === "on") {
      setPointing("off");
      return;
    }
    const request = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (request && (await request().catch(() => "denied")) !== "granted") return setPointing("refused");
    const { Pointing } = await import("./pointing");
    const absolute = "ondeviceorientationabsolute" in window;
    const filter = new Pointing(declinationAt(siteRef.current), absolute);
    const onOrientation = (event: Event) => filter.take(event as DeviceOrientationEvent);
    const kind = absolute ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(kind, onOrientation);
    pointer.current = filter;
    track.current = false;
    fly.current = null;
    zoomGoal.current = null;
    velocity.current = { alt: 0, az: 0 };
    // A window onto the sky, as a phone held up shows it: no wider than 75°.
    if (viewRef.current.fov > 75) zoom(75 / viewRef.current.fov);
    setPointing("on");
    stopPointing.current = () => {
      window.removeEventListener(kind, onOrientation);
      pointer.current = null;
      orientation.current = null;
    };
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
            : [
                showpiece?.name.en ?? "",
                showpiece?.name.ka ?? "",
                TELESCOPE_TARGET_BY_ID.get(thing.id)?.catalog ?? "",
                thing.id,
                messierById.get(thing.id)?.name ?? "",
                messierById.get(thing.id)?.ngc ?? "",
              ];
      list.push({ key: `${thing.kind}:${thing.id}`, label: thing.name, names: names.filter(Boolean) });
    }
    return list;
  }, [things, copy, constellations, messierById]);
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

  // Before a letter is typed: the Moon, the planets and the showpieces that are well up now.
  const tenMinutes = Math.floor(now.getTime() / 600_000);
  const suggestions = useMemo(() => {
    if (!searching || query.trim()) return [];
    const at = new Date(tenMinutes * 600_000);
    const list: { key: string; label: string; alt: number }[] = [];
    for (const state of bodies(at, site.site)) {
      if (state.name !== "Sun") list.push({ key: `body:${state.name}`, label: copy.bodies[state.name], alt: state.alt });
    }
    for (const thing of things) {
      if (thing.kind !== "fixed" || thing.type === "star" || !thing.labelled) continue;
      list.push({ key: `fixed:${thing.id}`, label: thing.name, alt: fixedAltAz(thing.raHours, thing.decDeg, at, site.site).alt });
    }
    return list.filter((item) => item.alt > 8).sort((a, b) => b.alt - a.alt).slice(0, 6);
  }, [searching, query, tenMinutes, site.site, copy, things]);
  const offered = query.trim() ? results : suggestions;

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
    zoomGoal.current = null;
    velocity.current = { alt: 0, az: 0 };
    const zoomSteps = Math.abs(Math.log2(to.fov / viewRef.current.fov));
    // The frame loop stamps the start on the flight's first frame.
    fly.current = { from: viewRef.current, to, start: -1, duration: Math.min(2400, 900 + 200 * zoomSteps) };
  };

  const goTo = (key: string) => {
    const where = locate(key, simDate());
    setQuery("");
    setOpen(null);
    searchRef.current?.blur();
    if (!where) return setSearchNote(copy.search.none);
    setSelected(key);
    setFolded(true);
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
        within: constellationOfBody(state.name, now, site.site),
        distanceAu: state.distanceAu,
        size: sizeText(state.radiusDeg * 2),
        catalogue: null,
        about: copy.about[state.name],
        picture: `/sky/targets/icons/${id.toLowerCase()}.png`,
      };
    }
    let ra: number;
    let dec: number;
    let name: string;
    let type: Picked["type"];
    let magnitude: number | null;
    let size: string | null = null;
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
        if (thing.mark) size = thing.mark.major === thing.mark.minor ? `${thing.mark.major}′` : `${thing.mark.major}′ × ${thing.mark.minor}′`;
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
      within: type === "constellation" ? null : constellationAt(ra, dec),
      distanceAu: null,
      size,
      catalogue: messierById.get(id)?.ngc ?? null,
      about: null,
      picture: PICTURED.has(id) ? `/sky/targets/icons/${id}.png` : null,
    };
    // `now` ticks four times a second; the panel follows it.
  }, [selected, now, states, things, bookable, copy, site.site, starData, messierById]);

  // Rise, transit and set are searches: once per object and ten minutes of sky time.
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
    if (open !== "list" && phase !== "no-webgl") return [];
    const list: { key: string; label: string; target: Target }[] = SKY_BODIES.filter((name) => name !== "Sun").map((name) => ({
      key: `body:${name}`,
      label: copy.bodies[name],
      target: { body: name },
    }));
    for (const thing of things) {
      if (thing.kind === "fixed" && thing.type !== "star" && thing.labelled) {
        list.push({ key: `fixed:${thing.id}`, label: thing.name, target: { raHours: thing.raHours, decDeg: thing.decDeg } });
      }
    }
    return list;
  }, [open, phase, copy, things]);
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
  const scrub = (minutes: number) => setSimTime(Date.now() + minutes * 60_000, { playing: time.current.playing });
  const sheet = (name: "place" | "time" | "list") => setOpen((current) => (current === name ? null : name));

  // Full screen on a desk: the browser's own where it allows, the page's otherwise.
  const toggleFull = () => {
    const next = !full;
    setFull(next);
    if (next) void document.documentElement.requestFullscreen?.().catch(() => {});
    else if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };
  useEffect(() => {
    const left = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("fullscreenchange", left);
    return () => document.removeEventListener("fullscreenchange", left);
  }, []);

  const figures = (value: number, digits: number) => {
    const text = value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    return locale === "ka" ? text.replaceAll(",", " ") : text;
  };
  const distanceText = (au: number) =>
    au < 0.01
      ? copy.panel.km(figures(Math.round((au * AU_KM) / 100) * 100, 0))
      : `${copy.panel.au(figures(au, 2))} · ${copy.panel.millionKm(figures((au * AU_KM) / 1e6, au < 2 ? 1 : 0))}`;
  const constellationName = (within: { id: string; name: string }) =>
    locale === "ka" ? (constellationKa[within.id] ?? within.name) : within.name;
  const toNow = () => {
    setSimTime(Date.now(), { speed: 1, playing: true });
    setSpeed(1);
    setPlaying(true);
  };

  return (
    <div
      className="sky"
      data-sky-state={sky}
      data-phase={phase}
      data-full={full}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if (open) setOpen(null);
        else if (full) toggleFull();
      }}
    >
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

      {/* The top bar: the way back, the search, and the view's own switch. */}
      <div className="sky-head">
        <div className="sky-top">
          <Link className="sky-round sky-back" href={`/${locale}`} aria-label={copy.back} title={copy.back}>
            <SkyIcon name="back" />
          </Link>
          <div className="sky-search" role="search">
            <SkyIcon name="search" />
            <label className="visually-hidden" htmlFor="sky-search-input">
              {copy.search.label}
            </label>
            <input
              id="sky-search-input"
              ref={searchRef}
              className="sky-input"
              type="search"
              value={query}
              placeholder={copy.search.placeholder}
              autoComplete="off"
              enterKeyHint="search"
              role="combobox"
              aria-expanded={searching && offered.length > 0}
              aria-controls="sky-search-results"
              aria-activedescendant={searching && offered[active] ? `sky-result-${active}` : undefined}
              onFocus={() => {
                setSearching(true);
                setOpen(null);
              }}
              onBlur={() => setSearching(false)}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
                setSearchNote(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  if (offered.length) setActive((active + (event.key === "ArrowDown" ? 1 : offered.length - 1)) % offered.length);
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  const choice = offered[active] ?? offered[0];
                  if (choice) goTo(choice.key);
                  else if (query.trim()) setSearchNote(copy.search.none);
                } else if (event.key === "Escape") {
                  event.currentTarget.blur();
                }
              }}
            />
            {query && (
              <button
                type="button"
                className="sky-search-clear"
                aria-label={copy.search.clear}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setSearchNote(null);
                }}
              >
                <SkyIcon name="clear" />
              </button>
            )}
            {searching && offered.length > 0 && (
              // The pointer never takes the focus from the field, so a press lands as a click.
              <ul
                id="sky-search-results"
                className="sky-results"
                role="listbox"
                aria-label={copy.search.label}
                onPointerDown={(event) => event.preventDefault()}
              >
                {!query.trim() && (
                  <li className="sky-results-title" role="presentation">
                    {copy.search.suggested}
                  </li>
                )}
                {offered.map((item, index) => {
                  const where = positionNow(item.key);
                  return (
                    <li key={item.key} id={`sky-result-${index}`} role="option" aria-selected={index === active}>
                      <button type="button" tabIndex={-1} onClick={() => goTo(item.key)}>
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
              <p className="sky-note sky-search-note" role="status">
                {searchNote}
              </p>
            )}
          </div>
          {phase === "ready" && (
            <button
              type="button"
              className="sky-round sky-point"
              aria-pressed={pointing === "on"}
              aria-label={pointing === "on" ? copy.view.stopPointing : copy.view.point}
              title={pointing === "on" ? copy.view.stopPointing : copy.view.point}
              onClick={() => void togglePointing()}
            >
              <SkyIcon name="point" />
            </button>
          )}
          <button
            type="button"
            className="sky-round sky-full"
            aria-pressed={full}
            aria-label={full ? copy.exitFullscreen : copy.fullscreen}
            title={full ? copy.exitFullscreen : copy.fullscreen}
            onClick={toggleFull}
          >
            <SkyIcon name={full ? "unfull" : "full"} />
          </button>
        </div>
        {/* Close up, what is drawn is a disc or a plate: an illustration (CLAUDE.md). */}
        <p className="sky-computed">
          {phase !== "loading" && (
            <span className="sky-computed-time">
              {clock(now, "Asia/Tbilisi")} · {dayMonth(now, locale, "Asia/Tbilisi")}
            </span>
          )}
          <span className="sky-computed-wide">{copy.computed}</span>
          <span className="sky-computed-close">{copy.panel.illustration}</span>
        </p>
        {pointing === "refused" && <p className="sky-note sky-head-note">{copy.view.pointRefused}</p>}
      </div>

      <div className="sky-zoom">
        <button type="button" className="sky-round" aria-label={copy.view.zoomIn} title={copy.view.zoomIn} onClick={() => zoom(1 / 1.4)}>
          <SkyIcon name="plus" />
        </button>
        <button type="button" className="sky-round" aria-label={copy.view.zoomOut} title={copy.view.zoomOut} onClick={() => zoom(1.4)}>
          <SkyIcon name="minus" />
        </button>
      </div>

      {/* The dock: where, what is drawn, and when. Its sheets open above it, one at a time. */}
      <div className="sky-foot">
        <div className="sky-dock">
          <button
            type="button"
            className="sky-pill sky-dock-place"
            aria-expanded={open === "place"}
            aria-label={`${copy.place}: ${site.mine ? copy.yours : copy.site}`}
            onClick={() => sheet("place")}
          >
            <SkyIcon name="pin" />
            <span className="sky-dock-text">{site.mine ? copy.yoursShort : copy.siteShort}</span>
          </button>
          <div className="sky-tools" role="toolbar" aria-label={copy.toggles.label}>
            <button
              type="button"
              className="sky-tool"
              aria-expanded={open === "list"}
              aria-label={copy.listTitle}
              title={copy.listTitle}
              onClick={() => sheet("list")}
            >
              <SkyIcon name="list" />
            </button>
            <span className="sky-tools-rule" aria-hidden="true" />
            {TOOLS.map((key) => (
              <button
                key={key}
                type="button"
                className="sky-tool"
                aria-pressed={key === "ground" ? !toggles.ground : toggles[key]}
                aria-label={copy.toggles[key]}
                title={copy.toggles[key]}
                onClick={() => changeToggle(key)}
              >
                <SkyIcon name={key} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="sky-pill sky-dock-clock"
            aria-expanded={open === "time"}
            aria-label={copy.time.open}
            onClick={() => sheet("time")}
          >
            <SkyIcon name="clock" />
            {/* The clock shows once the browser has set it, never the server's instant. */}
            <span className="sky-dock-time">{phase === "loading" ? " " : clock(now, "Asia/Tbilisi", true)}</span>
            <span className="sky-dock-date">{phase === "loading" ? " " : dayMonth(now, locale, "Asia/Tbilisi")}</span>
          </button>
        </div>

        {open === "place" && (
          <div className="sky-sheet sky-sheet-place">
            <p className="sky-sheet-title">{site.mine ? copy.yours : copy.site}</p>
            {site.mine ? (
              <button type="button" className="sky-chip" onClick={() => setSite({ site: SITE, mine: false })}>
                {copy.site}
              </button>
            ) : (
              <button type="button" className="sky-chip" onClick={useMyLocation} disabled={locating === "asking"}>
                {locating === "asking" ? copy.locating : copy.useLocation}
              </button>
            )}
            {locating === "refused" && <p className="sky-note">{copy.locationRefused}</p>}
            <p className="sky-note">{copy.locationNote}</p>
          </div>
        )}

        {open === "time" && (
          <div className="sky-sheet sky-sheet-time sky-time" role="group" aria-label={copy.time.label}>
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
            </div>
            <input
              className="sky-scrub"
              type="range"
              min={-SCRUB}
              max={SCRUB}
              step={10}
              value={Math.max(-SCRUB, Math.min(SCRUB, offset))}
              aria-label={copy.time.scrub}
              onChange={(event) => scrub(Number(event.target.value))}
            />
            <div className="sky-scrub-scale" aria-hidden="true">
              <span>−12 {copy.time.hourOn.replace(/^\+1\s*/, "")}</span>
              <span>{copy.time.now}</span>
              <span>+12 {copy.time.hourOn.replace(/^\+1\s*/, "")}</span>
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
                className="sky-chip sky-playpause"
                aria-pressed={!playing}
                aria-label={playing ? copy.time.pause : copy.time.play}
                onClick={() => {
                  const next = !playing;
                  setSimTime(simDate().getTime(), { playing: next });
                  setPlaying(next);
                }}
              >
                <SkyIcon name={playing ? "pause" : "play"} />
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
        )}

        {(open === "list" || phase === "no-webgl") && (
          <div className="sky-sheet sky-sheet-list sky-list">
            <h2 className="sky-list-title">{phase === "no-webgl" ? copy.noWebgl : copy.upNow}</h2>
            {above.length === 0 ? (
              <p>{copy.upNowEmpty}</p>
            ) : (
              <ul className="sky-roster">
                {above.map((item) => (
                  <li key={item.key}>
                    <button type="button" onClick={() => goTo(item.key)}>
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
                        <button type="button" onClick={() => goTo(item.key)}>
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
          </div>
        )}
      </div>

      {picked && (
        <aside className="sky-panel" aria-labelledby="sky-panel-title" data-picked={picked.key} data-folded={folded}>
          <header>
            {picked.picture && (
              // eslint-disable-next-line @next/next/no-img-element -- a 96 px icon from this site's own public folder
              <img className="sky-panel-picture" src={picked.picture} alt="" width={48} height={48} decoding="async" />
            )}
            <div className="sky-panel-name">
              <h2 id="sky-panel-title">{picked.name}</h2>
              <p className="sky-kind">
                {copy.types[picked.type]}
                {picked.within && picked.type !== "sun" ? ` · ${copy.panel.within(constellationName(picked.within))}` : ""}
              </p>
            </div>
            <button type="button" className="sky-round sky-panel-close" aria-label={copy.panel.close} onClick={() => setSelected(null)}>
              <SkyIcon name="close" />
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
          {picked.about && <p className="sky-about">{picked.about}</p>}
          <dl>
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
            {picked.distanceAu !== null && (
              <div>
                <dt>{copy.panel.distance}</dt>
                <dd>{distanceText(picked.distanceAu)}</dd>
              </div>
            )}
            {picked.size && (
              <div>
                <dt>{copy.panel.size}</dt>
                <dd>{picked.size}</dd>
              </div>
            )}
            {picked.catalogue && (
              <div>
                <dt>{copy.panel.catalogue}</dt>
                <dd>{picked.catalogue}</dd>
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
