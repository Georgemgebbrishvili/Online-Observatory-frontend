"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { brand } from "@/brand";
import { homeFonts } from "@/components/home/fonts";
import { planets, type PlanetId } from "@/features/targets/homepage-data";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const clip = (planet: PlanetId) => `/planets/${planet}.mp4`;
const still = (planet: PlanetId) => `/planets/${planet}-still.webp`;
const cutout = (planet: PlanetId) => `/planets/${planet}-cutout.webp`;

type PlanetHeroProps = {
  content: Dictionary["home"]["hero"];
  navigation: Dictionary["navigation"];
  locale: Locale;
  /** The id of the section the scroll control leads to. */
  nextId: string;
  /** On /design-system: a fixed height, and an h2 rather than the page's h1. */
  contained?: boolean;
};

/**
 * The homepage hero (ADR-029). One planet is featured: its clip is the backdrop and its
 * name the headline. The other two sit in the side slots; pressing one features it.
 * Every cut-out is present in both slots and only its visibility changes, so a swap
 * never paints the previous planet while a 2048px file downloads.
 */
export function PlanetHero({
  contained = false,
  content,
  locale,
  navigation,
  nextId,
}: PlanetHeroProps) {
  const [featured, setFeatured] = useState<PlanetId>(planets[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [entrance, setEntrance] = useState<"anim" | "play" | "done">("anim");
  const videos = useRef(new Map<PlanetId, HTMLVideoElement>());
  const navrow = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const [left, right] = planets.filter((planet) => planet !== featured);
  const Title = contained ? "h2" : "h1";
  const alternateLocale = locale === "en" ? "ka" : "en";
  const publicNavigation = navigation.public;

  function warm(planet: PlanetId) {
    const video = videos.current.get(planet);
    if (video && !video.getAttribute("src")) {
      video.preload = "auto";
      video.src = clip(planet);
      video.load();
    }
  }

  // The featured clip plays; the others pause. A clip's first use fetches it.
  useEffect(() => {
    for (const [planet, video] of videos.current) {
      if (planet === featured) {
        if (!video.getAttribute("src")) video.src = clip(planet);
        video.muted = true;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [featured]);

  // After first paint, pull the remaining clips down while the page is idle.
  useEffect(() => {
    const warmAll = () => planets.forEach(warm);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warmAll, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warmAll, 2500);
    return () => clearTimeout(id);
  }, []);

  // The entrance runs once, after the fonts, then its classes are removed.
  useEffect(() => {
    let cancelled = false;
    let done: ReturnType<typeof setTimeout> | undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const guard = new Promise((resolve) => setTimeout(resolve, 500));
    // Reduced motion never sees the hidden state (the CSS is motion-gated); drop the classes.
    const ready = reduced
      ? Promise.resolve()
      : Promise.race([document.fonts.ready, guard]);
    ready.then(() => {
      if (reduced) {
        if (!cancelled) setEntrance("done");
        return;
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (cancelled) return;
          setEntrance("play");
          done = setTimeout(() => setEntrance("done"), 2150);
        }),
      );
    });
    return () => {
      cancelled = true;
      clearTimeout(done);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(event: MouseEvent) {
      if (!navrow.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        burger.current?.focus();
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function slot(side: "l" | "r", planet: PlanetId) {
    return (
      <button
        className={`planet planet-${side}`}
        type="button"
        data-slot={side}
        data-planet={planet}
        aria-label={content.showPlanet.replace("{planet}", content.planets[planet].name)}
        onClick={() => setFeatured(planet)}
        onPointerEnter={() => warm(planet)}
        onFocus={() => warm(planet)}
      >
        {planets.map((image) => (
          // 2048px cut-outs, all present in both slots: next/image would re-request per swap.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image}
            data-planet={image}
            className={image === planet ? "is-shown" : undefined}
            alt=""
            src={cutout(image)}
          />
        ))}
      </button>
    );
  }

  const links = [
    { label: publicNavigation.explore, href: `/${locale}#tonight`, current: true },
    { label: publicNavigation.live, href: `/${locale}#live` },
    { label: publicNavigation.observatory, href: `/${locale}/observatory` },
    { label: publicNavigation.pricing, href: `/${locale}/pricing` },
    { label: publicNavigation.about, href: `/${locale}#about` },
  ];

  return (
    <div
      className={[
        "planet-hero",
        homeFonts,
        entrance !== "done" && "anim",
        entrance === "play" && "play",
      ]
        .filter(Boolean)
        .join(" ")}
      data-contained={contained || undefined}
    >
      <noscript>
        <style>{`.planet-hero.anim .ent-line,.planet-hero.anim .rule span,.planet-hero.anim .navbar::after{transform:none!important}.planet-hero.anim .logo,.planet-hero.anim .links a,.planet-hero.anim .lede,.planet-hero.anim .label,.planet-hero.anim .cta a,.planet-hero.anim .caption,.planet-hero.anim .sky{opacity:1!important}`}</style>
      </noscript>
      <div className="sky" style={{ backgroundImage: `url(${still(featured)})` }}>
        {planets.map((planet, index) => (
          <video
            key={planet}
            ref={(element) => {
              if (element) videos.current.set(planet, element);
              else videos.current.delete(planet);
            }}
            data-planet={planet}
            className={planet === featured ? "is-active" : undefined}
            src={index === 0 ? clip(planet) : undefined}
            poster={still(planet)}
            autoPlay={index === 0}
            preload={index === 0 ? "auto" : "none"}
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="ui">
        <header className="navbar">
          <div className="navrow" ref={navrow} data-open={menuOpen ? "true" : "false"}>
            <Link
              className="logo"
              href={`/${locale}`}
              aria-label={navigation.brandAriaLabel}
            >
              {locale === "ka" ? brand.ka.nominative : brand.en.name}
              <i> {navigation.brandEndorsement}</i>
            </Link>
            <nav
              className="links"
              id="planet-hero-nav"
              aria-label={publicNavigation.ariaLabel}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
              }}
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.current ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`/${alternateLocale}`}
                hrefLang={alternateLocale}
                lang={alternateLocale}
                aria-label={`${navigation.language}: ${navigation.languageName}`}
              >
                {navigation.languageName}
              </a>
              <a href={`/${locale}/sign-in`}>{publicNavigation.signIn}</a>
              <a className="enroll" href={`/${locale}#tonight`}>
                {publicNavigation.startExploring}
              </a>
            </nav>
            <button
              ref={burger}
              className="burger"
              type="button"
              aria-label={menuOpen ? publicNavigation.closeMenu : publicNavigation.menu}
              aria-expanded={menuOpen}
              aria-controls="planet-hero-nav"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((open) => !open);
              }}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        <div className="copy">
          <div className="col kicker">
            <span className="ent-mask">
              <span className="ent-line">{content.eyebrow}</span>
            </span>
          </div>
          <Title className="col title">
            <span className="ent-mask">
              <span className="ent-line">{content.planets[featured].name}</span>
            </span>
          </Title>
          <div className="col rule">
            <span />
          </div>
          <p className="col lede">
            {content.planets[featured].lede[0]} <br />
            {content.planets[featured].lede[1]}
          </p>
          <div className="col cta">
            {slot("l", left)}
            {slot("r", right)}
            <a href={`/${locale}/app/book`}>{content.cta}</a>
            <span className="label label-l" aria-hidden="true">
              {content.planets[left].name}
            </span>
            <span className="label label-r" aria-hidden="true">
              {content.planets[right].name}
            </span>
          </div>
        </div>
      </div>

      <button
        className="scroll"
        type="button"
        aria-label={content.nextSection}
        onClick={() =>
          document.getElementById(nextId)?.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          })
        }
      >
        <svg viewBox="0 0 26 33" fill="none" aria-hidden="true">
          <path
            d="M13 1.5 V31.5 M1.9 20.4 L13 31.5 L24.1 20.4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </button>
      <p className="caption">{content.illustration}</p>
    </div>
  );
}
