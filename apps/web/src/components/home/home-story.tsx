"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import type { StorySky } from "@/features/sky/story-sky";
import { fill } from "@/features/operator/format";
import type { HomepageDictionary } from "@/types/homepage";

import { createFeed } from "./story-feed";
import { createSky, loadCatalogue, type SkyLabels } from "./story-sky-canvas";

export type StoryTime = { label: string; href: string; price: string };
export type StorySlide = {
  id: string;
  name: string;
  word: string;
  kind: string;
  note: string;
  image: string;
  time: string;
  high: string;
  /** The object's own colour, for the light behind it. */
  glow: string;
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

export type HomeStoryProps = {
  copy: HomepageDictionary["story"];
  hero: HomepageDictionary["hero"];
  links: { book: string; watch: string; sky: string; observatory: string; pricing: string };
  /** What the hero's camera is on: tonight's best planet, or Saturn when none is up. */
  target: {
    id: string;
    name: string;
    image: string;
    exposure: string;
    gain: number;
    stack: number;
    /** The aim step's line when tonight names it: its best time and height. Null for the stand-in. */
    line: string | null;
  };
  /** Where the observatory stands, over the hero's headline. */
  place: string;
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
  ways: HomepageDictionary["more"]["ways"];
  wayBase: string;
  brandName: string;
};

const hhmm = (minutes: number) => {
  const m = ((Math.floor(minutes / 10) * 10) % 1440 + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
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

/** The story's camera feed at one depth of stack, for the design system. */
export function StoryFeedSpecimen({
  depth,
  image,
  name,
  simulated,
  illustration,
}: {
  depth: number;
  image: string;
  name: string;
  simulated: string;
  illustration: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const source = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = source.current;
    if (!canvas.current || !img) return;
    const feed = createFeed(canvas.current, img);
    const draw = () => feed.draw(depth, 0, { x: 0.5, y: 0.5, span: 0.8 });
    draw();
    img.addEventListener("load", draw);
    return () => img.removeEventListener("load", draw);
  }, [depth]);
  return (
    <figure className="hs-feed-specimen">
      <canvas ref={canvas} role="img" aria-label={`${simulated}: ${name}`} />
      {/* eslint-disable-next-line @next/next/no-img-element -- a canvas source, not a displayed image */}
      <img ref={source} className="hs-feed-source" src={image} alt="" decoding="async" />
      <span className="hs-badge">{simulated}</span>
      <figcaption>{illustration}</figcaption>
    </figure>
  );
}

/**
 * The homepage as one scroll story (ADR-087): how a session goes (pinned, five steps),
 * tonight's showpieces (pinned, sideways), one night over the observatory (pinned, a
 * clock), the session and its price (pinned), then the telescope and the sign-off. GSAP
 * ScrollTrigger drives every scene; Lenis smooths the wheel and feeds it. Reduced motion
 * gets every scene still. Every number is passed in from the almanac, the platform and
 * the observatory's record.
 */
export function HomeStory(props: HomeStoryProps) {
  const { copy, hero, links, target, place, booking, sky, skyLabels, heroMinute, slides, night, session, faq, scope, ways } = props;
  const root = useRef<HTMLElement>(null);

  // The showpieces: the one the corners describe, faded out and back in on change.
  const [ci, setCi] = useState(0);
  const [slideOut, setSlideOut] = useState(false);
  const ciRef = useRef(0);
  const ciTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showSlide = useCallback((i: number) => {
    if (i === ciRef.current) return;
    ciRef.current = i;
    setSlideOut(true);
    clearTimeout(ciTimer.current);
    ciTimer.current = setTimeout(() => {
      setCi(i);
      setSlideOut(false);
    }, 220);
  }, []);

  // The night: the step, and the clock written straight to the page.
  const [ns, setNs] = useState(0);
  const [nightOut, setNightOut] = useState(false);
  const nsRef = useRef(0);
  const nsTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clockRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const aimRef = useRef<HTMLSpanElement>(null);
  const nightCanvas = useRef<HTMLCanvasElement>(null);
  const nightSky = useRef<ReturnType<typeof createSky> | null>(null);
  const nightMin = useRef(0);
  const written = useRef({ clock: "", aim: "" });
  const setNight = useCallback(
    (min: number) => {
      if (!night) return;
      nightMin.current = min;
      const p = nightSky.current?.draw(min);
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

  const heroCanvas = useRef<HTMLCanvasElement>(null);
  const feedCanvas = useRef<HTMLCanvasElement>(null);
  const feedImage = useRef<HTMLImageElement>(null);
  const stackRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const one = (s: string) => q(s)[0] as HTMLElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const top = () => header?.offsetHeight ?? 0;

    // The name behind each showpiece fills most of the width, up to 40% of the height.
    const fitWords = () => {
      for (const w of q(".hs-word") as HTMLElement[]) {
        w.style.fontSize = "100px";
        const width = w.getBoundingClientRect().width || 1;
        w.style.fontSize = `${Math.min((100 * window.innerWidth * 0.9) / width, window.innerHeight * 0.4)}px`;
      }
    };
    fitWords();

    // The two drawn skies: the hero's, still at its target's best minute, and the night's.
    const heroSky = sky && heroCanvas.current ? createSky(heroCanvas.current, sky, [{ at: 0, aim: target.id }], skyLabels) : null;
    if (sky && night && nightCanvas.current) nightSky.current = createSky(nightCanvas.current, sky, night.steps, skyLabels);
    const stage = one(".hs-hero-sky");
    const drawHero = () => {
      const p = heroSky?.draw(heroMinute);
      if (p && stage) stage.style.transformOrigin = `${(p.x * 100).toFixed(2)}% ${(p.y * 100).toFixed(2)}%`;
    };
    drawHero();
    let alive = true;
    if (sky)
      loadCatalogue()
        .then((catalogue) => {
          if (!alive) return;
          heroSky?.setCatalogue(catalogue);
          nightSky.current?.setCatalogue(catalogue);
          drawHero();
          setNight(nightMin.current);
          el.dataset.sky = "";
        })
        .catch(() => {});

    // The camera feed: where the object sits follows the capture's window.
    const feed = feedCanvas.current && feedImage.current ? createFeed(feedCanvas.current, feedImage.current) : null;
    const hero = one(".hs-hero");
    const frame = one(".hs-capture");
    const within = (node: HTMLElement) => {
      let x = 0;
      let y = 0;
      for (let e: HTMLElement | null = node; e && e !== hero; e = e.offsetParent as HTMLElement | null) {
        x += e.offsetLeft;
        y += e.offsetTop;
      }
      return { x: x + node.clientLeft, y: y + node.clientTop, w: node.clientWidth, h: node.clientHeight };
    };
    const state = { depth: 0, on: false };
    const started = performance.now();
    const drawFeed = () => {
      if (!feed) return;
      const r = within(frame);
      const W = hero.clientWidth;
      const H = hero.clientHeight;
      feed.draw(state.depth, (performance.now() - started) / 1000, {
        x: (r.x + r.w / 2) / W,
        y: (r.y + r.h / 2) / H,
        span: (r.w * 0.82) / Math.min(W, H),
      });
      const n = Math.max(1, Math.round(Math.pow(state.depth, 2) * target.stack));
      if (stackRef.current) stackRef.current.textContent = `${n} / ${target.stack}`;
    };
    feedImage.current?.addEventListener("load", drawFeed);

    const onResize = () => {
      fitWords();
      heroSky?.resize();
      nightSky.current?.resize();
      feed?.resize();
      drawHero();
      setNight(nightMin.current);
      drawFeed();
    };
    window.addEventListener("resize", onResize);

    const still = () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      feedImage.current?.removeEventListener("load", drawFeed);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.still = "";
      state.depth = 1;
      drawFeed();
      setNight(night?.steps[1]?.at ?? 0);
      return still;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    // Snapping: a short scroll inside a stepped scene finishes the move to the next step.
    const snaps = new Set<{ st: ScrollTrigger; points: number[] }>();
    let idle: ReturnType<typeof setTimeout> | undefined;
    let dir = 1;
    let inside: ScrollTrigger | null = null;
    const settle = () => {
      for (const { st, points } of snaps) {
        if (!st.isActive) continue;
        // arriving from another scene, settle on the nearest step rather than skip the first
        const arriving = inside !== st && st.start > 0;
        inside = st;
        const p = st.progress;
        if (points.some((x) => Math.abs(x - p) < 0.003)) return;
        const nearest = points.reduce((a, x) => (Math.abs(x - p) < Math.abs(a - p) ? x : a));
        const next = arriving ? nearest : dir > 0 ? points.find((x) => x > p) : [...points].reverse().find((x) => x < p);
        if (next !== undefined)
          lenis.scrollTo(st.start + next * (st.end - st.start), { duration: 0.75, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      inside = null;
    };
    lenis.on("scroll", (l: Lenis) => {
      if (l.direction) dir = l.direction;
      clearTimeout(idle);
      idle = setTimeout(settle, 120);
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // The air moves on its own while the raw feed is on screen.
    const boil = () => {
      if (state.on && state.depth < 0.995) drawFeed();
    };
    gsap.ticker.add(boil);

    const mm = gsap.matchMedia(el);
    const pinStart = () => `top ${top()}`;

    const ctx = gsap.context(() => {
      // The hero: four quick transitions, the scroll snapping from one step to the next.
      // 1→2 the open times come up, 2→3 the telescope dives onto its target and the raw
      // feed arrives, 3→4 the stack settles, 4→5 the frame shrinks into a kept capture.
      const lns = q(".hs-ln") as HTMLElement[];
      const N = lns.length;
      const words = (i: number) => lns[i].querySelectorAll(".hs-m > span");
      const para = (i: number) => lns[i].querySelectorAll(":scope > p");
      const layer = one(".hs-hero-feed");
      const turn = one(".hs-hero-turn");
      const canvas = one(".hs-feed");
      const slots = q(".hs-slots");
      const clip = () => {
        const r = within(frame);
        return `inset(${r.y}px ${hero.clientWidth - r.x - r.w}px ${hero.clientHeight - r.y - r.h}px ${r.x}px round 6px)`;
      };
      const origin = () => {
        const r = within(frame);
        return `${r.x + r.w / 2}px ${r.y + r.h / 2}px`;
      };
      const step = one(".hs-meta-num");
      const bar = one(".hs-meta-bar i");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: pinStart,
          end: "+=200%",
          pin: true,
          refreshPriority: 4,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            const at = s.progress * tl.duration();
            const i = Math.min(N - 1, Math.round(at));
            step.textContent = `${String(i + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
            bar.style.transform = `scaleX(${0.2 + 0.8 * s.progress})`;
            state.on = at > 1.4 && at < 3.2;
          },
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
      tl.fromTo(stage, { scale: 1 }, { scale: 1.06, duration: 1 }, 0);
      if (slots.length)
        tl.fromTo(slots, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.44).to(
          slots,
          { autoAlpha: 0, y: -18, duration: 0.22, ease: "power2.in" },
          1.04,
        );
      tl.fromTo(stage, { scale: 1.06 }, { scale: 3.4, duration: 0.8, ease: "power3.in" }, 1.04)
        .fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26 }, 1.58)
        .fromTo(turn, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "power3.out" }, 1.56)
        .set(stage, { autoAlpha: 0 }, 1.9)
        .fromTo(q(".hs-hud"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 1.86)
        .fromTo(state, { depth: 0 }, { depth: 1, duration: 0.82, ease: "power1.inOut", onUpdate: drawFeed }, 2.1)
        .to(q(".hs-hud"), { autoAlpha: 0, duration: 0.2 }, 3.04)
        .fromTo(canvas, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: clip, duration: 0.5, ease: "power3.inOut" }, 3.06)
        .fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, 3.38)
        .fromTo(turn, { rotate: 0, transformOrigin: origin }, { rotate: -4, transformOrigin: origin, duration: 0.5, ease: "power3.out" }, 3.44)
        .fromTo(q(".hs-capture-note"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, 3.6)
        .to({}, { duration: 0.3 }, 4);
      snaps.add({ st: tl.scrollTrigger!, points: lns.map((_, i) => i / tl.duration()) });

      // The night, as a clock
      if (night) {
        const clock = { m: 0 };
        setNight(0);
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: one(".hs-night"), start: pinStart, end: "+=240%", pin: true, scrub: 0.8, refreshPriority: 2 },
          })
          .to(clock, { m: night.minutes, duration: 11, onUpdate: () => setNight(clock.m) }, 0)
          .to(one(".hs-night-head"), { opacity: 0, y: -20, duration: 1 }, 3.4);
      }

      // The telescope and the sign-off rise in
      gsap.from(q(".hs-scope .hs-rise"), {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: one(".hs-scope"), start: "top 75%", refreshPriority: -1 },
      });
      gsap.fromTo(
        one(".hs-closer-word"),
        { xPercent: 6 },
        { xPercent: -6, ease: "none", scrollTrigger: { trigger: one(".hs-closer"), start: "top bottom", end: "bottom top", scrub: true, refreshPriority: -1 } },
      );
      gsap.from(q(".hs-closer .hs-rise"), {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: one(".hs-closer"), start: "top 65%", refreshPriority: -1 },
      });
    }, el);

    // The showpieces sideways and the session pinned (wide screens)
    mm.add("(min-width: 768px)", () => {
      const cleanup: (() => void)[] = [];
      const track = q(".hs-track")[0] as HTMLElement | undefined;
      if (track) {
        const all = q(".hs-slide") as HTMLElement[];
        const layers = q(".hs-glow") as HTMLElement[];
        const n = all.length;
        const dist = () => track.scrollWidth - window.innerWidth;
        const ht = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: one(".hs-coll"),
            start: pinStart,
            end: () => `+=${dist() * 0.6}`,
            pin: true,
            refreshPriority: 3,
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (s) => {
              const f = s.progress * (n - 1);
              const i = Math.min(n - 1, Math.floor(f));
              const t = f - i;
              layers.forEach((l, j) => {
                l.style.opacity = j === i ? String(1 - t) : j === i + 1 ? String(t) : "0";
              });
              showSlide(Math.round(f));
            },
          },
        });
        for (const s of all) {
          const word = s.querySelector(".hs-word");
          gsap.set(word, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
          const along = { trigger: s, containerAnimation: ht, start: "left right", end: "right left", scrub: true };
          gsap.fromTo(word, { xPercent: -26 }, { xPercent: -74, ease: "none", scrollTrigger: along });
          gsap.fromTo(s.querySelector(".hs-eye"), { rotate: 8, y: 30 }, { rotate: -8, y: -20, ease: "none", scrollTrigger: { ...along } });
        }
        if (n > 1) {
          const sideways = { st: ht.scrollTrigger!, points: all.map((_, i) => i / (n - 1)) };
          snaps.add(sideways);
          cleanup.push(() => snaps.delete(sideways));
        }
        cleanup.push(() => layers.forEach((l) => l.style.removeProperty("opacity")));
      }

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: one(".hs-session"), start: pinStart, end: "+=120%", pin: true, scrub: 0.8, refreshPriority: 1 },
        })
        .from(q(".hs-session-text > *"), { y: 40, opacity: 0, stagger: 0.1, duration: 0.5 }, 0)
        .fromTo(one(".hs-ticket"), { yPercent: -104 }, { yPercent: 0, duration: 0.9, ease: "power2.out" }, 0.3)
        .from(q(".hs-ask li"), { opacity: 0, x: 20, stagger: 0.06, duration: 0.4 }, 0.8)
        .from(one(".hs-buy"), { opacity: 0, y: 20, duration: 0.4 }, 1)
        .to({}, { duration: 0.7 });

      return () => cleanup.forEach((f) => f());
    });
    mm.add("(max-width: 767.98px)", () => {
      gsap.fromTo(
        one(".hs-ticket"),
        { yPercent: -104 },
        { yPercent: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: one(".hs-printer"), start: "top 75%", once: true } },
      );
    });

    // Pinned scenes are created out of page order (the wide-screen ones last), and each
    // one's start depends on the pins above it: refresh them top to bottom
    // (refreshPriority), then the plain triggers below them.
    const refresh = () => {
      fitWords();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      drawFeed();
    };
    refresh();
    ScrollTrigger.addEventListener("refreshInit", fitWords);
    if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    // The live banner above the page arrives late and moves every scene down.
    let offset = el.offsetTop;
    const moved = new ResizeObserver(() => {
      if (el.offsetTop === offset) return;
      offset = el.offsetTop;
      refresh();
    });
    moved.observe(document.body);

    return () => {
      still();
      moved.disconnect();
      window.removeEventListener("load", refresh);
      ScrollTrigger.removeEventListener("refreshInit", fitWords);
      mm.revert();
      ctx.revert();
      gsap.ticker.remove(raf);
      gsap.ticker.remove(boil);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      clearTimeout(ciTimer.current);
      clearTimeout(nsTimer.current);
      clearTimeout(idle);
    };
  }, []);

  const s = slides[ci];
  const n = night?.steps[ns];
  const chosen = session.lengths[length];
  const steps = [{ a: hero.headline, b: hero.sunset, text: hero.lede }, ...copy.steps];

  return (
    <main id="main-content" ref={root} className="public-home hs">
      {/* ── How a session goes ───────────────────────────── */}
      <section className="home-hero hs-hero" aria-labelledby="home-title">
        <canvas ref={heroCanvas} className="hs-hero-sky" aria-hidden="true" />
        <div className="hs-hero-shade" />
        <div className="hs-hero-feed">
          <div className="hs-hero-turn">
            <canvas ref={feedCanvas} className="hs-feed" role="img" aria-label={`${copy.simulated}: ${target.name}`} />
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
        {/* The reference picture the feed is drawn from; never shown as it is. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- a canvas source, not a displayed image */}
        <img ref={feedImage} className="hs-feed-source" src={target.image} alt="" decoding="async" />
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
                  {i === 0 && place && <p className="hs-label hs-eyebrow">{place}</p>}
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
        <div className="hs-meta" aria-hidden="true">
          <span className="hs-meta-num">01 / 05</span>
          <div className="hs-meta-bar">
            <i />
          </div>
          <span className="hs-label">{copy.scroll}</span>
        </div>
      </section>

      {/* ── Tonight's showpieces ─────────────────────────── */}
      {slides.length > 0 && (
        <section className="hs-coll" aria-labelledby="home-showpieces-title">
          {slides.map((slide) => (
            <div key={slide.id} className="hs-glow" style={{ "--c": slide.glow } as CSSProperties} />
          ))}
          <div className="hs-coll-head">
            <span className="hs-label">{copy.showpieces.label}</span>
            <Title id="home-showpieces-title" title={copy.showpieces.title} em={copy.showpieces.em} />
            <Link className="hs-more" href={links.sky}>
              {copy.showpieces.all} <Arrow />
            </Link>
          </div>
          <div className="hs-track">
            {slides.map((slide) => (
              <article key={slide.id} className="hs-slide" style={{ "--c": slide.glow } as CSSProperties}>
                <div className="hs-word" aria-hidden="true">
                  {slide.word}
                </div>
                <figure className="hs-eye">
                  {/* eslint-disable-next-line @next/next/no-img-element -- plates on black, sized by the eyepiece */}
                  <img src={slide.image} alt={slide.name} decoding="async" />
                </figure>
                <div className="hs-slide-info">
                  <span className="hs-label">
                    {slide.kind} · {copy.showpieces.best} {slide.time}
                  </span>
                  <h3>{slide.name}</h3>
                  <p>{slide.note}</p>
                  <Link className="hs-more" href={slide.book.href}>
                    {slide.book.label} <Arrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className={`hs-corner hs-tr hs-sw${slideOut ? " hs-out" : ""}`} aria-hidden="true">
            <span className="hs-label">{copy.showpieces.best}</span>
            <div className="hs-big">{s.time}</div>
            <span className="hs-data">{s.high}</span>
          </div>
          <div className={`hs-corner hs-bl hs-sw${slideOut ? " hs-out" : ""}`} aria-hidden="true">
            <span className="hs-label">{s.kind}</span>
            <b>{s.name}</b>
            <p>{s.note}</p>
          </div>
          <div className="hs-corner hs-bc" aria-hidden="true">
            {slides.map((slide, i) => (
              <i key={slide.id} className={i === ci ? "hs-on" : undefined} />
            ))}
          </div>
          <div className={`hs-corner hs-br hs-sw${slideOut ? " hs-out" : ""}`}>
            <ButtonLink href={s.book.href} tabIndex={-1} aria-hidden="true">
              {s.book.label}
            </ButtonLink>
          </div>
          <p className="hs-illustration">{hero.illustration}</p>
        </section>
      )}

      {/* ── One night over the observatory ───────────────── */}
      {night && n && (
        <section className="hs-night" aria-labelledby="home-night-title">
          <canvas ref={nightCanvas} className="hs-night-sky" role="img" aria-label={copy.night.label} />
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
          <div className="hs-session-text">
            <span className="hs-label">{copy.session.label}</span>
            <Title id="home-session-title" title={copy.session.title} em={copy.session.em} />
            <p>{session.cloud}</p>
          </div>
          <div className="hs-buy hs-glass">
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
          <div className="hs-printer">
            <StoryTicket
              brandName={props.brandName}
              copy={copy.session.ticket}
              night={session.night}
              target={target.line ? target.name : copy.session.ticket.choice}
              length={chosen?.label ?? "15 – 240"}
              price={chosen?.price ?? null}
            />
          </div>
          <div className="hs-ask-wrap">
            <h3 className="hs-label">{faq.title}</h3>
            <ul className="hs-ask">
              {faq.items.map((item, i) => (
                <li key={item.q} className={asked === i ? "hs-on" : undefined}>
                  <button type="button" aria-expanded={asked === i} aria-controls={`hs-ask-${i}`} onClick={() => setAsked(i)}>
                    <i />
                    {item.q}
                  </button>
                  <div className="hs-acc" id={`hs-ask-${i}`}>
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── The telescope ────────────────────────────────── */}
      <section className="hs-scope" aria-labelledby="home-scope-title">
        <div className="hs-lines" aria-hidden="true" />
        <div className="hs-scope-in">
          <div>
            <span className="hs-label hs-rise">{copy.scope.label}</span>
            <div className="hs-rise">
              <Title id="home-scope-title" title={copy.scope.title} em={copy.scope.em} />
            </div>
            <p className="hs-lead hs-rise">{scope.lede}</p>
            <dl className="hs-rise">
              {scope.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="hs-acts hs-rise">
              <ButtonLink href={links.observatory}>{copy.scope.see}</ButtonLink>
              <ButtonLink href={links.sky} variant="secondary">
                {copy.scope.sky}
              </ButtonLink>
            </div>
          </div>
          <figure className="hs-moon hs-rise">
            {/* eslint-disable-next-line @next/next/no-img-element -- one fixed size, already webp */}
            <img src="/sky/moon-lro.webp" alt={copy.scope.moon} width={1000} height={1250} decoding="async" />
            <figcaption>{copy.scope.photo}</figcaption>
          </figure>
        </div>
      </section>

      {/* ── Sign-off ─────────────────────────────────────── */}
      <section className="hs-closer" aria-labelledby="home-closer-title">
        <div className="hs-closer-word" aria-hidden="true">
          {props.brandName}
        </div>
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
        <ul className="hs-ways" aria-label={ways.title}>
          {ways.items.map((item) => (
            <li key={item.href} className="hs-rise">
              <Link className="hs-way hs-glass" href={`${props.wayBase}/${item.href}`}>
                <b>{item.title}</b>
                <span>{item.text}</span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
        <p className="hs-credits">{copy.closer.credits}</p>
      </section>
    </main>
  );
}
