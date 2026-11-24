"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";

import { ButtonLink } from "@/components/ui/button";
import type { StorySky } from "@/features/sky/story-sky";
import { fill } from "@/features/operator/format";
import type { HomepageDictionary } from "@/types/homepage";

import type { SkyLabels, SkyMotion } from "./story-sky-canvas";

export type StoryTime = { label: string; href: string; price: string };
export type StorySlide = {
  id: string;
  name: string;
  kind: string;
  note: string;
  image: string;
  time: string;
  high: string;
  book: { href: string; label: string };
};
export type StoryNightStep = {
  /** Minutes after dark falls. */
  at: number;
  aim: string;
  title: string;
  text: string;
  book: { href: string; label: string } | null;
};
/** The feed's two drawings of one object: a raw sub and the settled stack (public/sky/feed). */
export type StoryFeedImages = { raw: string; settled: string };

export type HomeStoryProps = {
  copy: HomepageDictionary["story"];
  hero: HomepageDictionary["hero"];
  links: { book: string; watch: string; sky: string; observatory: string; pricing: string };
  /** What the hero's camera is on: tonight's best planet, or Saturn when none is up. */
  target: {
    id: string;
    name: string;
    feed: StoryFeedImages;
    exposure: string;
    gain: number;
    stack: number;
    /** The aim step's line when tonight names it: its best time and height. Null for the stand-in. */
    line: string | null;
  };
  /** The open times on the hero's booking step. */
  booking: { night: string; times: StoryTime[] } | null;
  sky: StorySky | null;
  skyLabels: SkyLabels;
  /** Minutes after dark when the hero's sky is drawn: its target at its best. */
  heroMinute: number;
  slides: StorySlide[];
  night: {
    steps: StoryNightStep[];
    /** Minutes of the day, on the observatory's clock, when dark falls; and how long it lasts. */
    startMinute: number;
    minutes: number;
    from: string;
    to: string;
    /** Stretches of open times, as percent along the dark. */
    open: { from: number; to: number }[];
    directions: readonly string[];
  } | null;
  session: {
    lengths: { minutes: number; label: string; price: string }[];
    perMinute: string | null;
    night: string;
    cloud: string;
  };
  faq: HomepageDictionary["more"]["faq"];
  scope: { lede: string; facts: { label: string; value: string }[] };
  brandName: string;
};

const hhmm = (minutes: number) => {
  const m = ((Math.floor(minutes / 10) * 10) % 1440 + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Runs once the page has nothing better to do, so the scenes never hold up its first paint. */
const whenIdle = (run: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(run, 200);
  return () => clearTimeout(id);
};

/** The sky is redrawn at most this often while it twinkles. */
const SKY_FPS = 20;

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d={back ? "M10 3 5 8l5 5" : "m6 3 5 5-5 5"} />
    </svg>
  );
}

/** One of the showpiece row's two arrows. */
export function StoryStep({
  back = false,
  label,
  disabled,
  onClick,
  className,
}: {
  back?: boolean;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={className ? `hs-step ${className}` : "hs-step"} aria-label={label} disabled={disabled} onClick={onClick}>
      <Chevron back={back} />
    </button>
  );
}

/** One headline line inside a mask, so it can slide in and out of view. */
const Mask = ({ children, accent = false }: { children: ReactNode; accent?: boolean }) => (
  <span className="hs-m">
    <span className={accent ? "hs-accent" : undefined}>{children}</span>
  </span>
);

/** A section heading in two lines, the second one quieter. */
function Title({ id, title, em, level = 2 }: { id?: string; title: string; em: string; level?: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id} className="hs-title">
      {title} <em>{em}</em>
    </Tag>
  );
}

/** The session on the cream ticket stock (ADR-075), as the booking board prints it. */
export function StoryTicket({
  brandName,
  copy,
  night,
  target,
  length,
  price,
}: {
  brandName: string;
  copy: HomepageDictionary["story"]["session"]["ticket"];
  night: string;
  target: string;
  length: string;
  price: string | null;
}) {
  return (
    <div className="hs-ticket">
      <div className="hs-ticket-head">
        <b>{brandName}</b>
        <span>{copy.admit}</span>
      </div>
      <dl>
        <div>
          <dt>{copy.night}</dt>
          <dd>{night}</dd>
        </div>
        <div>
          <dt>{copy.target}</dt>
          <dd>{target}</dd>
        </div>
        <div>
          <dt>{copy.length}</dt>
          <dd>{length}</dd>
        </div>
      </dl>
      {price && (
        <div className="hs-ticket-foot">
          <span>{copy.price}</span>
          <b>{price}</b>
        </div>
      )}
    </div>
  );
}

/** The horizon at the foot of the hero (ADR-088): a planet's limb, lit from behind. */
export function StoryHorizon() {
  return (
    <div className="hs-horizon" aria-hidden="true">
      <i />
    </div>
  );
}

/**
 * The simulated camera feed (ADR-104): a raw sub under the settled stack, sensor grain over
 * both. `--depth` on the frame runs from 0, one raw sub, to 1, the stack settled; only
 * opacity changes with it. Always badged Simulated where it is shown.
 */
export function StoryFeed({
  images,
  label,
  depth,
  className,
  ref,
}: {
  images: StoryFeedImages;
  label: string;
  depth?: number;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      className={className ? `hs-feed ${className}` : "hs-feed"}
      role="img"
      aria-label={label}
      style={depth === undefined ? undefined : ({ "--depth": depth } as CSSProperties)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- two layers of one small drawing, cross-faded */}
      <img className="hs-feed-raw" src={images.raw} alt="" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element -- two layers of one small drawing, cross-faded */}
      <img className="hs-feed-settled" src={images.settled} alt="" decoding="async" />
      <i className="hs-feed-grain" />
    </div>
  );
}

/** The story's camera feed at one depth of stack, for the design system. */
export function StoryFeedSpecimen({
  depth,
  images,
  name,
  simulated,
  illustration,
}: {
  depth: number;
  images: StoryFeedImages;
  name: string;
  simulated: string;
  illustration: string;
}) {
  return (
    <figure className="hs-feed-specimen">
      <StoryFeed images={images} label={`${simulated}: ${name}`} depth={depth} />
      <span className="hs-badge">{simulated}</span>
      <figcaption>{illustration}</figcaption>
    </figure>
  );
}

/** The eyepiece's graduated ring, drawn as vectors so it stays sharp at any size. */
export function EyepieceRing() {
  return (
    <svg className="hs-ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="49" pathLength={360} className="hs-ring-minor" />
      <circle cx="50" cy="50" r="49" pathLength={360} className="hs-ring-major" />
    </svg>
  );
}

/** A showpiece in its eyepiece: the plate, the ring, the halo from the key light. */
export function StoryEyepiece({ image, name }: { image: string; name: string }) {
  return (
    <figure className="hs-eye">
      <Image src={image} alt={name} fill sizes="(max-width: 47.999rem) 78vw, 34rem" />
      <EyepieceRing />
    </figure>
  );
}

/**
 * The homepage as one scroll story (ADR-087, refined by ADR-104): how a session goes
 * (pinned, five steps), tonight's showpieces (a row to swipe), one night over the
 * observatory (pinned, a clock), the session and its price, then the telescope and the
 * sign-off. One drawn sky, a fixed canvas behind the two pinned scenes. GSAP, ScrollTrigger
 * and the sky's code load once the page is idle; Lenis smooths the wheel on a fine pointer
 * only. Reduced motion gets every scene still. Every number is passed in from the
 * almanac, the platform and the observatory's record.
 */
export function HomeStory(props: HomeStoryProps) {
  const { copy, hero, links, target, booking, sky, skyLabels, heroMinute, slides, night, session, faq, scope } = props;
  const root = useRef<HTMLElement>(null);
  const skyCanvas = useRef<HTMLCanvasElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLElement>(null);

  // The showpieces: which one the row rests on, for its dots.
  const [ci, setCi] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const swiped = () => setCi(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    track.addEventListener("scroll", swiped, { passive: true });
    return () => track.removeEventListener("scroll", swiped);
  }, []);
  const step = useCallback((by: number) => {
    const track = trackRef.current;
    if (!track) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: by * track.clientWidth, behavior: still ? "auto" : "smooth" });
  }, []);

  // The night: the step, and the clock written straight to the page.
  const [ns, setNs] = useState(0);
  const [nightOut, setNightOut] = useState(false);
  const nsRef = useRef(0);
  const nsTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clockRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef<HTMLSpanElement>(null);
  /** Draws the night's sky at its current minute; set once the sky's code has loaded. */
  const drawNight = useRef<((min: number) => { id: string; alt: number; az: number; slewing: boolean } | null) | null>(null);
  const nightMin = useRef(0);
  const written = useRef({ clock: "", aim: "" });
  const setNight = useCallback(
    (min: number) => {
      if (!night) return;
      nightMin.current = min;
      const p = drawNight.current?.(min);
      if (p && aimRef.current) {
        const name = skyLabels.names[p.id] ?? p.id;
        const text = p.slewing
          ? fill(copy.night.slewing, { name })
          : fill(copy.night.pointing, {
              name,
              altitude: String(Math.round(p.alt)),
              direction: night.directions[Math.round(p.az / 45) % 8],
            });
        if (text !== written.current.aim) {
          written.current.aim = text;
          aimRef.current.textContent = text;
        }
      }
      const t = hhmm(night.startMinute + min);
      if (t !== written.current.clock && clockRef.current) {
        written.current.clock = t;
        clockRef.current.textContent = t;
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${Math.min(1, min / night.minutes)})`;
      let s = 0;
      night.steps.forEach((step, i) => {
        if (min >= step.at) s = i;
      });
      if (s === nsRef.current) return;
      nsRef.current = s;
      setNightOut(true);
      clearTimeout(nsTimer.current);
      nsTimer.current = setTimeout(() => {
        setNs(s);
        setNightOut(false);
      }, 200);
    },
    [night, copy.night, skyLabels],
  );

  // The session: the length chosen, and the question open.
  const [length, setLength] = useState(Math.min(1, Math.max(0, session.lengths.length - 1)));
  const [asked, setAsked] = useState(0);

  useEffect(() => {
    const el = root.current;
    const canvas = skyCanvas.current;
    if (!el) return;
    const one = (s: string) => el.querySelector<HTMLElement>(s)!;
    const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    const hero = one(".hs-hero");
    const capture = one(".hs-capture");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanup: (() => void)[] = [];
    let alive = true;
    cleanup.push(() => {
      alive = false;
    });

    // What rises into place as it is scrolled to: the session, the telescope, the sign-off.
    if (!still && "IntersectionObserver" in window) {
      const rising = all(".hs-rise").filter((node) => node.getBoundingClientRect().top > window.innerHeight);
      const seen = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.in = "";
            seen.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
      );
      rising.forEach((node) => {
        const order = node.parentElement ? Array.from(node.parentElement.children).indexOf(node) : 0;
        node.style.setProperty("--enter-delay", `calc(var(--stagger) * ${Math.min(order, 5)})`);
        node.dataset.out = "";
        seen.observe(node);
      });
      cleanup.push(() => seen.disconnect());
    }

    // On a phone the pictures take the space above the words: the print and the feed sit
    // over the tallest headline after the first, the sky's reticle over the first. Where a
    // short screen leaves too little, the later steps drop their line of text and the open
    // times stay hidden, rather than either landing on the words.
    const fitPhone = () => {
      // Reduced motion lays the story out still, one scene under the next: nothing to fit.
      const phone = window.matchMedia("(max-width: 47.999rem)").matches && !still;
      const lns = all(".hs-ln");
      const slots = el.querySelector<HTMLElement>(".hs-slots");
      const topOf = (node: HTMLElement) => node.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      const roomUnder = () => Math.min(hero.clientHeight, ...lns.slice(1).map(topOf));
      delete hero.dataset.short;
      delete hero.dataset.tight;
      if (phone && roomUnder() < 300) hero.dataset.short = "";
      if (phone && slots && lns[1] && topOf(slots) + slots.offsetHeight + 12 > topOf(lns[1])) hero.dataset.tight = "";
      hero.style.setProperty("--cap-room", `${Math.round(roomUnder())}px`);
      if (lns[0] && canvas) canvas.style.setProperty("--sky-room", `${Math.round(topOf(lns[0]))}px`);

      // The showpieces: the eyepiece between the heading and the words under it; where a
      // short screen has no such gap it stays behind the words, dimmed.
      const coll = el.querySelector<HTMLElement>(".hs-coll");
      const head = coll?.querySelector<HTMLElement>(".hs-coll-head");
      const slide = coll?.querySelector<HTMLElement>(".hs-slide");
      if (coll && head && slide) {
        delete coll.dataset.fit;
        delete coll.dataset.dim;
        if (phone) {
          const base = slide.getBoundingClientRect().top;
          const ring = 28;
          const top = head.getBoundingClientRect().bottom - base + ring;
          const infos = Array.from(coll.querySelectorAll<HTMLElement>(".hs-slide-info"));
          const bottom = Math.min(slide.clientHeight, ...infos.map((i) => i.getBoundingClientRect().top - base)) - ring;
          const size = Math.min(bottom - top, window.innerWidth * 0.78, window.innerHeight * 0.4);
          if (size >= 160) {
            coll.dataset.fit = "";
            coll.style.setProperty("--eye-h", `${Math.round(size)}px`);
            coll.style.setProperty("--eye-top", `${Math.round(top + (bottom - top - size) / 2)}px`);
          } else coll.dataset.dim = "";
        }
      }

      // The night: on a short screen the clock card needs the heading's place.
      const nightScene = el.querySelector<HTMLElement>(".hs-night");
      const nhead = nightScene?.querySelector<HTMLElement>(".hs-night-head");
      const ncard = nightScene?.querySelector<HTMLElement>(".hs-ncard");
      if (nightScene && nhead && ncard) {
        delete nightScene.dataset.tight;
        if (phone && ncard.getBoundingClientRect().top < nhead.getBoundingClientRect().bottom + 12) nightScene.dataset.tight = "";
      }
    };
    fitPhone();

    // The feed: how far the stack has settled, and its frame count.
    const feed = feedRef.current;
    const setDepth = (depth: number) => {
      feed?.style.setProperty("--depth", depth.toFixed(3));
      const n = Math.max(1, Math.round(Math.pow(depth, 2) * target.stack));
      if (stackRef.current) stackRef.current.textContent = `${n} / ${target.stack}`;
    };

    // The one drawn sky: a fixed canvas behind the hero and the night, drawing whichever of
    // the two is in view, and nothing (paused) when neither is.
    const cam = { scale: 1, alpha: 1 };
    const sky$ = {
      mode: "none" as "none" | "hero" | "night",
      draw: null as null | ((motion?: SkyMotion) => void),
      resize: null as null | (() => void),
      origin: "50% 50%",
    };
    const applyCam = () => {
      if (!canvas) return;
      if (sky$.mode === "hero") {
        canvas.style.transform = cam.scale === 1 ? "" : `scale(${cam.scale.toFixed(4)})`;
        canvas.style.transformOrigin = sky$.origin;
        canvas.style.opacity = cam.alpha === 1 ? "" : String(cam.alpha);
      } else {
        canvas.style.transform = "";
        canvas.style.opacity = "";
      }
    };
    const started = performance.now();
    const drift = { x: 0, y: 0 };
    const paint = () => {
      if (!sky$.draw || sky$.mode === "none") return;
      sky$.draw(still ? undefined : { seconds: (performance.now() - started) / 1000, drift });
    };
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = 0;
      if (!alive || sky$.mode === "none" || document.hidden || still) return;
      if (now - last >= 1000 / SKY_FPS) {
        last = now;
        paint();
      }
      frame = window.requestAnimationFrame(loop);
    };
    const run = () => {
      if (!frame && !still && sky$.mode !== "none" && !document.hidden && sky$.draw) frame = window.requestAnimationFrame(loop);
    };
    const inView = new Map<Element, number>();
    const scenes = [hero, el.querySelector<HTMLElement>(".hs-night")].filter(Boolean) as HTMLElement[];
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) inView.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        const h = inView.get(hero) ?? 0;
        const n = scenes[1] ? (inView.get(scenes[1]) ?? 0) : 0;
        const mode = h === 0 && n === 0 ? "none" : h >= n ? "hero" : "night";
        if (mode === sky$.mode) return;
        sky$.mode = mode;
        if (canvas) canvas.dataset.mode = mode;
        applyCam();
        if (mode === "night") setNight(nightMin.current);
        else paint();
        run();
      },
      { threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] },
    );
    scenes.forEach((s) => watch.observe(s));
    cleanup.push(() => {
      watch.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    });
    const onVisible = () => run();
    document.addEventListener("visibilitychange", onVisible);
    cleanup.push(() => document.removeEventListener("visibilitychange", onVisible));
    if (fine && !still) {
      const onPointer = (event: PointerEvent) => {
        drift.x = (0.5 - event.clientX / window.innerWidth) * 12;
        drift.y = (0.5 - event.clientY / window.innerHeight) * 8;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      cleanup.push(() => window.removeEventListener("pointermove", onPointer));
    }

    // The sky's code and its stars, once idle; the stars once the sky is in view as well.
    if (sky && canvas)
      cleanup.push(
        whenIdle(() => {
          void import("./story-sky-canvas").then(({ createSky, loadCatalogue }) => {
            if (!alive) return;
            const heroSky = createSky(canvas, sky, [{ at: 0, aim: target.id }], skyLabels);
            const nightSky = night ? createSky(canvas, sky, night.steps, skyLabels) : null;
            drawNight.current = (min) => (sky$.mode === "night" && nightSky ? nightSky.draw(min, still ? undefined : { seconds: (performance.now() - started) / 1000, drift }) : null);
            sky$.draw = (motion) => {
              if (sky$.mode === "hero") {
                const p = heroSky.draw(heroMinute, motion);
                sky$.origin = `${(p.x * 100).toFixed(2)}% ${(p.y * 100).toFixed(2)}%`;
                applyCam();
              } else if (sky$.mode === "night") nightSky?.draw(nightMin.current, motion);
            };
            sky$.resize = () => {
              heroSky.resize();
              nightSky?.resize();
            };
            canvas.dataset.ready = "";
            if (sky$.mode === "night") setNight(nightMin.current);
            else paint();
            run();
            const stars = new IntersectionObserver((entries) => {
              if (!entries.some((e) => e.isIntersecting)) return;
              stars.disconnect();
              loadCatalogue()
                .then((catalogue) => {
                  if (!alive) return;
                  heroSky.setCatalogue(catalogue);
                  nightSky?.setCatalogue(catalogue);
                  if (sky$.mode === "night") setNight(nightMin.current);
                  else paint();
                })
                .catch(() => {});
            });
            scenes.forEach((s) => stars.observe(s));
            cleanup.push(() => stars.disconnect());
          });
        }),
      );

    const onResize = () => {
      fitPhone();
      sky$.resize?.();
      if (sky$.mode === "night") setNight(nightMin.current);
      else paint();
    };
    window.addEventListener("resize", onResize);
    cleanup.push(() => window.removeEventListener("resize", onResize));

    if (still) {
      el.dataset.still = "";
      setDepth(1);
      setNight(night?.steps[1]?.at ?? 0);
      return () => cleanup.forEach((f) => f());
    }

    // The scenes: GSAP and ScrollTrigger, and Lenis on a fine pointer, once the page is idle.
    cleanup.push(
      whenIdle(() => {
        void Promise.all([import("gsap"), import("gsap/ScrollTrigger"), fine ? import("lenis") : Promise.resolve(null)]).then(
          ([{ gsap }, { ScrollTrigger }, lenisModule]) => {
            if (!alive) return;
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.config({ ignoreMobileResize: true });
            const header = document.querySelector<HTMLElement>(".site-header");
            const top = () => header?.offsetHeight ?? 0;
            const pinStart = () => `top ${top()}`;
            // A phone scrolls each pinned scene through less of its own height (ADR-104).
            const phone = () => window.matchMedia("(max-width: 47.999rem)").matches;

            const lenis = lenisModule ? new lenisModule.default({ lerp: 0.09, smoothWheel: true }) : null;
            const scroller = {
              y: () => (lenis ? lenis.scroll : window.scrollY),
              to: (y: number) =>
                lenis
                  ? lenis.scrollTo(y, { duration: 0.75, easing: (t) => 1 - Math.pow(1 - t, 4) })
                  : window.scrollTo({ top: y, behavior: "smooth" }),
            };
            const raf = (time: number) => lenis?.raf(time * 1000);
            if (lenis) {
              lenis.on("scroll", ScrollTrigger.update);
              gsap.ticker.add(raf);
              gsap.ticker.lagSmoothing(0);
            }

            // Snapping: a short scroll inside the hero finishes the move to the next step.
            const snaps = new Set<{ st: ScrollTrigger; points: number[] }>();
            let idle: ReturnType<typeof setTimeout> | undefined;
            let dir = 1;
            let lastY = scroller.y();
            let inside: ScrollTrigger | null = null;
            const settle = () => {
              const y = scroller.y();
              for (const { st, points } of snaps) {
                // By position: resting on a first step sits exactly on start, where isActive is
                // false, and every short scroll snapped back to it (ADR-103).
                if (y < st.start - 2 || y > st.end + 2) continue;
                // arriving from another scene, settle on the nearest step rather than skip the first
                const arriving = inside !== st && st.start > 0;
                inside = st;
                const p = st.progress;
                if (points.some((x) => Math.abs(x - p) < 0.003)) return;
                const nearest = points.reduce((a, x) => (Math.abs(x - p) < Math.abs(a - p) ? x : a));
                const next = arriving ? nearest : dir > 0 ? points.find((x) => x > p) : [...points].reverse().find((x) => x < p);
                if (next !== undefined) scroller.to(st.start + next * (st.end - st.start));
                return;
              }
              inside = null;
            };
            const onScroll = () => {
              const y = scroller.y();
              if (y !== lastY) dir = y > lastY ? 1 : -1;
              lastY = y;
              clearTimeout(idle);
              idle = setTimeout(settle, 120);
            };
            if (lenis) lenis.on("scroll", onScroll);
            else window.addEventListener("scroll", onScroll, { passive: true });

            const ctx = gsap.context(() => {
              // The hero: four quick transitions, the scroll snapping from one step to the next.
              // 1→2 the open times come up, 2→3 the telescope dives onto its target and the raw
              // feed arrives, 3→4 the stack settles, 4→5 the frame shrinks into a kept capture.
              const lns = all(".hs-ln");
              const N = lns.length;
              const words = (i: number) => lns[i].querySelectorAll(".hs-m > span");
              const para = (i: number) => lns[i].querySelectorAll(":scope > p");
              const layer = one(".hs-hero-feed");
              const turn = one(".hs-hero-turn");
              const slots = all(".hs-slots");
              const within = (node: HTMLElement) => {
                let x = 0;
                let y = 0;
                for (let e: HTMLElement | null = node; e && e !== hero; e = e.offsetParent as HTMLElement | null) {
                  x += e.offsetLeft;
                  y += e.offsetTop;
                }
                return { x: x + node.clientLeft, y: y + node.clientTop, w: node.clientWidth, h: node.clientHeight };
              };
              const clip = () => {
                const r = within(capture);
                return `inset(${r.y}px ${hero.clientWidth - r.x - r.w}px ${hero.clientHeight - r.y - r.h}px ${r.x}px round 6px)`;
              };
              const origin = () => {
                const r = within(capture);
                return `${r.x + r.w / 2}px ${r.y + r.h / 2}px`;
              };
              const depth = { d: 0 };
              const tl = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                  trigger: hero,
                  start: pinStart,
                  end: () => (phone() ? "+=70%" : "+=120%"),
                  pin: true,
                  refreshPriority: 2,
                  scrub: 0.35,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              });
              for (let i = 0; i < N - 1; i++) {
                // explicit starts: the first step's are mid-way through its CSS rise when this runs
                const first = i === 0;
                tl.fromTo(words(i), { y: 0, yPercent: 0 }, { yPercent: -112, duration: 0.3, stagger: 0.05, ease: "power3.in", immediateRender: first }, i + 0.06)
                  .fromTo(para(i), { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.24, ease: "power2.in", immediateRender: first }, i + 0.06)
                  .fromTo(words(i + 1), { y: 0, yPercent: 112 }, { yPercent: 0, duration: 0.42, stagger: 0.07, ease: "power3.out" }, i + 0.42)
                  .fromTo(para(i + 1), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" }, i + 0.56);
              }
              tl.fromTo(cam, { scale: 1 }, { scale: 1.06, duration: 1, onUpdate: applyCam }, 0);
              if (slots.length)
                tl.fromTo(slots, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.44).to(
                  slots,
                  { autoAlpha: 0, y: -18, duration: 0.22, ease: "power2.in" },
                  1.04,
                );
              tl.fromTo(cam, { scale: 1.06 }, { scale: 3.4, duration: 0.8, ease: "power3.in", onUpdate: applyCam }, 1.04)
                .fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26 }, 1.58)
                .fromTo(turn, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "power3.out" }, 1.56)
                .fromTo(cam, { alpha: 1 }, { alpha: 0, duration: 0.02, onUpdate: applyCam }, 1.88)
                .fromTo(all(".hs-hud"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 1.86)
                .fromTo(depth, { d: 0 }, { d: 1, duration: 0.82, ease: "power1.inOut", onUpdate: () => setDepth(depth.d) }, 2.1)
                .to(all(".hs-hud"), { autoAlpha: 0, duration: 0.2 }, 3.04)
                .fromTo(feed, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: clip, duration: 0.5, ease: "power3.inOut" }, 3.06)
                .fromTo(capture, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, 3.38)
                .fromTo(turn, { rotate: 0, transformOrigin: origin }, { rotate: -4, transformOrigin: origin, duration: 0.5, ease: "power3.out" }, 3.44)
                .fromTo(all(".hs-capture-note"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, 3.6)
                .to({}, { duration: 0.3 }, 4);
              snaps.add({ st: tl.scrollTrigger!, points: lns.map((_, i) => i / tl.duration()) });

              // The night, as a clock
              if (night) {
                const clock = { m: 0 };
                setNight(0);
                gsap
                  .timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: {
                      trigger: one(".hs-night"),
                      start: pinStart,
                      end: () => (phone() ? "+=50%" : "+=100%"),
                      pin: true,
                      scrub: 0.8,
                      refreshPriority: 1,
                      invalidateOnRefresh: true,
                    },
                  })
                  .to(clock, { m: night.minutes, duration: 11, onUpdate: () => setNight(clock.m) }, 0)
                  .to(one(".hs-night-head"), { opacity: 0, y: -20, duration: 1 }, 3.4);
              }
            }, el);

            // Pinned scenes depend on the pins above them: refresh top to bottom.
            const refresh = () => {
              fitPhone();
              ScrollTrigger.sort();
              ScrollTrigger.refresh();
            };
            refresh();
            ScrollTrigger.addEventListener("refreshInit", fitPhone);
            if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
            document.fonts?.ready.then(() => alive && refresh());
            // The live banner above the page arrives late and moves every scene down.
            let offset = el.offsetTop;
            const moved = new ResizeObserver(() => {
              if (el.offsetTop === offset) return;
              offset = el.offsetTop;
              refresh();
            });
            moved.observe(document.body);

            cleanup.push(() => {
              moved.disconnect();
              window.removeEventListener("load", refresh);
              window.removeEventListener("scroll", onScroll);
              ScrollTrigger.removeEventListener("refreshInit", fitPhone);
              ctx.revert();
              if (lenis) {
                gsap.ticker.remove(raf);
                gsap.ticker.lagSmoothing(500, 33);
                lenis.destroy();
              }
              clearTimeout(idle);
            });
          },
        );
      }),
    );

    return () => {
      cleanup.forEach((f) => f());
      clearTimeout(nsTimer.current);
    };
    // Set up once: the scenes read props the server fixed for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = night?.steps[ns];
  const chosen = session.lengths[length];
  const steps = [{ a: hero.headline, b: hero.sunset, text: hero.lede }, ...copy.steps];

  return (
    <main id="main-content" ref={root} className="public-home hs">
      {/* The one drawn sky, behind the hero and the night. */}
      <canvas ref={skyCanvas} className="hs-sky" aria-hidden="true" />

      {/* ── How a session goes ───────────────────────────── */}
      <section className="home-hero hs-hero" aria-labelledby="home-title">
        <div className="hs-hero-shade" />
        <div className="hs-hero-feed">
          <div className="hs-hero-turn">
            <StoryFeed ref={feedRef} images={target.feed} label={`${copy.simulated}: ${target.name}`} />
            <div className="hs-capture">
              <div className="hs-capture-note">
                <b>{target.name}</b>
                <span>
                  {fill(copy.capture.frames, { count: String(target.stack) })} · {target.exposure}
                </span>
                <span className="hs-capture-saved">{copy.capture.saved}</span>
              </div>
            </div>
          </div>
          <dl className="hs-hud">
            <div className="hs-hud-badge">
              <dt className="visually-hidden">{copy.feed.label}</dt>
              <dd>{copy.simulated}</dd>
            </div>
            <div>
              <dt>{copy.feed.stack}</dt>
              <dd ref={stackRef}>1 / {target.stack}</dd>
            </div>
            <div>
              <dt>{copy.feed.exposure}</dt>
              <dd>{target.exposure}</dd>
            </div>
            <div>
              <dt>{copy.feed.gain}</dt>
              <dd>{target.gain}</dd>
            </div>
          </dl>
        </div>
        <StoryHorizon />
        <p className="hs-illustration">{hero.illustration}</p>

        {booking && (
          <aside className="hs-slots hs-glass" aria-label={copy.booking.tonight}>
            <span className="hs-label">{copy.booking.tonight}</span>
            <b>{booking.night}</b>
            {booking.times.length > 0 ? (
              <ul>
                {booking.times.map((time) => (
                  <li key={time.href}>
                    <Link href={time.href}>
                      <span>{time.label}</span>
                      <small>{time.price}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{copy.booking.none}</p>
            )}
            <Link className="hs-more" href={links.book}>
              {copy.booking.all} <Arrow />
            </Link>
          </aside>
        )}

        <div className="hs-hero-copy">
          <div className="hs-steps">
            {steps.map((step, i) => {
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <div key={step.a} className="hs-ln">
                  <Heading id={i === 0 ? "home-title" : undefined} className="home-hero-title hs-xl">
                    <Mask>{step.a}</Mask> <Mask accent>{step.b}</Mask>
                  </Heading>
                  <p>{i === 2 && target.line ? target.line : step.text}</p>
                </div>
              );
            })}
          </div>
          <div className="home-hero-actions hs-acts">
            <ButtonLink href={links.book}>{hero.cta}</ButtonLink>
            <ButtonLink href={links.watch} variant="secondary">
              {hero.watch}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Tonight's showpieces: a row to swipe ──────────── */}
      {slides.length > 0 && (
        <section className="hs-coll" aria-labelledby="home-showpieces-title">
          <div className="hs-coll-head">
            <span className="hs-label">{copy.showpieces.label}</span>
            <Title id="home-showpieces-title" title={copy.showpieces.title} em={copy.showpieces.em} />
            <Link className="hs-more" href={links.sky}>
              {copy.showpieces.all} <Arrow />
            </Link>
          </div>
          <div className="hs-track" ref={trackRef}>
            {slides.map((slide) => (
              <article key={slide.id} className="hs-slide" aria-label={slide.name}>
                <StoryEyepiece image={slide.image} name={slide.name} />
                <div className="hs-slide-info">
                  <span className="hs-label">
                    {slide.kind} · {copy.showpieces.best} {slide.time}
                  </span>
                  <h3>{slide.name}</h3>
                  <p>{slide.note}</p>
                  <span className="hs-data">{slide.high}</span>
                  <Link className="hs-more" href={slide.book.href}>
                    {slide.book.label} <Arrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {slides.length > 1 && (
            <div className="hs-row-nav">
              <div className="hs-dots" aria-hidden="true">
                {slides.map((slide, i) => (
                  <i key={slide.id} className={i === ci ? "hs-on" : undefined} />
                ))}
              </div>
              <StoryStep back label={copy.showpieces.previous} disabled={ci === 0} onClick={() => step(-1)} />
              <StoryStep label={copy.showpieces.next} disabled={ci === slides.length - 1} onClick={() => step(1)} />
            </div>
          )}
          <p className="hs-illustration">{hero.illustration}</p>
        </section>
      )}

      {/* ── One night over the observatory ───────────────── */}
      {night && n && (
        <section className="hs-night" aria-labelledby="home-night-title">
          <span className="visually-hidden" role="img" aria-label={copy.night.label} />
          <div className="hs-night-shade" />
          <div className="hs-night-head">
            <span className="hs-label">{copy.night.label}</span>
            <Title id="home-night-title" title={copy.night.title} em={copy.night.em} />
            <p>{copy.night.lede}</p>
          </div>
          <article className="hs-ncard hs-glass" aria-label={copy.night.zone}>
            <div className="hs-ncard-top">
              <div className="hs-clock" ref={clockRef}>
                {night.from}
              </div>
              <span className="hs-label">{copy.night.zone}</span>
            </div>
            <div className="hs-aim">
              <span className="hs-label">{copy.night.on}</span>
              <span ref={aimRef} />
            </div>
            <div className={`hs-swap${nightOut ? " hs-out" : ""}`}>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
              {n.book && (
                <ButtonLink href={n.book.href} size="small">
                  {n.book.label}
                </ButtonLink>
              )}
            </div>
            <div className="hs-tline" aria-hidden="true">
              <div className="hs-rail" />
              {night.open.map((o) => (
                <span key={o.from} className="hs-open" style={{ left: `${o.from}%`, width: `${o.to - o.from}%` }} />
              ))}
              <div className="hs-fill" ref={fillRef} />
              {night.steps.map((x) => (
                <i key={x.at} style={{ left: `${(x.at / night.minutes) * 100}%` }} />
              ))}
              <div className="hs-ends">
                <span>{night.from}</span>
                {night.open.length > 0 && <span className="hs-open-key">{copy.night.open}</span>}
                <span>{night.to}</span>
              </div>
            </div>
          </article>
          <p className="hs-illustration">{hero.illustration}</p>
        </section>
      )}

      {/* ── The session and its price ────────────────────── */}
      <section className="hs-session" aria-labelledby="home-session-title">
        <div className="hs-lines" aria-hidden="true" />
        <div className="hs-session-in">
          <div className="hs-session-text hs-rise">
            <span className="hs-label">{copy.session.label}</span>
            <Title id="home-session-title" title={copy.session.title} em={copy.session.em} />
            <p>{session.cloud}</p>
          </div>
          <div className="hs-buy hs-glass hs-rise">
            {chosen ? (
              <>
                <div className="hs-seg" role="group" aria-label={copy.session.length}>
                  {session.lengths.map((x, i) => (
                    <button key={x.minutes} type="button" aria-pressed={i === length} onClick={() => setLength(i)}>
                      {x.label}
                    </button>
                  ))}
                </div>
                <div className="hs-price">
                  <b>{chosen.price}</b>
                  {session.perMinute && <span>{fill(copy.session.perMinute, { price: session.perMinute })}</span>}
                </div>
              </>
            ) : (
              <p>{copy.session.noPrice}</p>
            )}
            <ButtonLink href={links.book}>{hero.cta}</ButtonLink>
            <Link className="hs-more" href={links.pricing}>
              {copy.session.pricing} <Arrow />
            </Link>
          </div>
          <div className="hs-printer hs-rise">
            <StoryTicket
              brandName={props.brandName}
              copy={copy.session.ticket}
              night={session.night}
              target={target.line ? target.name : copy.session.ticket.choice}
              length={chosen?.label ?? "15 – 240"}
              price={chosen?.price ?? null}
            />
          </div>
          <div className="hs-ask-wrap hs-rise">
            <h3 className="hs-label">{faq.title}</h3>
            <ul className="hs-ask">
              {faq.items.map((item, i) => (
                <li key={item.q} className={asked === i ? "hs-on" : undefined}>
                  <button type="button" aria-expanded={asked === i} aria-controls={`hs-ask-${i}`} onClick={() => setAsked(i)}>
                    <i />
                    {item.q}
                  </button>
                  <div className="hs-acc" id={`hs-ask-${i}`} hidden={asked !== i}>
                    <p>{item.a}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── The telescope, and the sign-off ──────────────── */}
      <section className="hs-closer" aria-labelledby="home-closer-title">
        <div className="hs-lines" aria-hidden="true" />
        <div className="hs-scope hs-rise">
          <div>
            <span className="hs-label">{copy.scope.label}</span>
            <Title title={copy.scope.title} em={copy.scope.em} level={3} />
            <p className="hs-lead">{scope.lede}</p>
          </div>
          <div>
            <dl>
              {scope.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="hs-scope-links">
              <Link className="hs-more" href={links.observatory}>
                {copy.scope.see} <Arrow />
              </Link>
              <Link className="hs-more" href={links.sky}>
                {copy.scope.sky} <Arrow />
              </Link>
            </div>
          </div>
        </div>
        <div className="hs-closer-call">
          <div className="hs-rise">
            <Title id="home-closer-title" title={copy.closer.title} em={copy.closer.em} />
          </div>
          <div className="hs-acts hs-rise">
            <ButtonLink href={links.book} size="large">
              {hero.cta}
            </ButtonLink>
            <ButtonLink href={links.watch} variant="secondary" size="large">
              {hero.watch}
            </ButtonLink>
          </div>
          <p className="hs-credits">{copy.closer.credits}</p>
        </div>
      </section>
    </main>
  );
}
