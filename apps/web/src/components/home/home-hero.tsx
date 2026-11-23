import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { observatories } from "@/features/observatory/observatories";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { SkyBody, SkyObject, TonightSky } from "@/features/sky/tonight-sky";
import type { Locale } from "@/i18n/config";
import { skyTonightCopy } from "@/i18n/resources/sky-tonight";
import type { HomepageDictionary } from "@/types/homepage";

/** The drawn plates a planet can be shown with; every one is an illustration. */
const plates: Partial<Record<SkyBody, string>> = {
  Saturn: "/sky/saturn.webp",
  Jupiter: "/sky/jupiter.webp",
  Mars: "/sky/mars.webp",
  Venus: "/sky/venus.webp",
  Moon: "/sky/moon-terminator.webp",
};

type HomeHeroProps = {
  content: HomepageDictionary["hero"];
  /** The step texts, reused on the panels. */
  steps: HomepageDictionary["howItWorks"]["steps"];
  price: HomepageDictionary["more"]["price"];
  navigation: { live: string; sky: string };
  locale: Locale;
  pricing: PricingFacts;
  sky: TonightSky | null;
  timezone: string;
  /** The homepage's h1; an h2 where the hero is shown inside another page. */
  headingLevel?: 1 | 2;
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

function Panel({ href, head, children }: { href: string; head: ReactNode; children: ReactNode }) {
  return (
    <Link className="home-tile hero-panel" href={href}>
      <span className="hero-panel-head">{head}</span>
      {children}
      <span className="hero-panel-go">
        <Arrow />
      </span>
    </Link>
  );
}

/**
 * The homepage hero (ADR-086): the headline and the two buttons, tonight's best placed
 * planet drawn large with its almanac beside it, three facts down the side, and four
 * panels that open the booking board, the live view, the prices and the night sky.
 * Every number is the almanac's, the platform's or the observatory record's.
 */
export function HomeHero({ content, steps, price, navigation, locale, pricing, sky, timezone, headingLevel = 1 }: HomeHeroProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const titleId = headingLevel === 1 ? "home-title" : "ds-home-title";
  const copy = skyTonightCopy[locale];
  const clock = new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  });

  // The planet to draw: the brightest with a plate that climbs well tonight, else any.
  const drawn: SkyObject | undefined =
    sky?.objects.find((o) => plates[o.body] && o.altitude >= 20) ?? sky?.objects.find((o) => plates[o.body]);
  const body: SkyBody = drawn?.body ?? "Saturn";

  const telescope = observatories[0]?.telescope;
  const firstSlot = pricing.tonight?.slots[0];
  const up = sky?.objects ?? [];

  return (
    <section className="home-hero" aria-labelledby={titleId}>
      <div className="home-hero-stage">
        <div className="home-hero-lead">
          <Heading id={titleId} className="home-hero-title">
            <span>{content.headline}</span> <em>{content.sunset}</em>
          </Heading>
          <p className="home-hero-lede">{content.lede}</p>
          <div className="home-hero-actions">
            <ButtonLink href={`/${locale}/app/book`}>{content.cta}</ButtonLink>
            <ButtonLink href={`/${locale}/tonight`} variant="secondary">
              {content.watch}
            </ButtonLink>
          </div>
        </div>

        <figure className="home-hero-planet">
          <div className="home-hero-field" aria-hidden="true">
            <svg className="home-hero-orbit" viewBox="0 0 400 400">
              <ellipse cx="200" cy="200" rx="196" ry="70" transform="rotate(-18 200 200)" />
              <circle className="home-hero-moon" cx="384" cy="148" r="3.5" />
            </svg>
            <Image src={plates[body] ?? "/sky/saturn.webp"} alt="" width={414} height={414} loading="eager" fetchPriority="high" sizes="(min-width: 64rem) 20rem, 70vw" />
          </div>
          <Link className="home-hero-tag" href={`/${locale}/sky`}>
            <span className="home-hero-tag-kicker">{content.panels.tonight}</span>
            <b>{copy.names[body]}</b>
            {drawn && (
              <dl>
                <div>
                  <dt>{copy.stat.best}</dt>
                  <dd>{clock.format(drawn.best)}</dd>
                </div>
                <div>
                  <dt>{copy.stat.high}</dt>
                  <dd>{Math.round(drawn.altitude)}°</dd>
                </div>
                <div>
                  <dt>{copy.stat.look}</dt>
                  <dd>{copy.compass[drawn.direction]}</dd>
                </div>
              </dl>
            )}
          </Link>
          <figcaption className="home-hero-caption">{content.illustration}</figcaption>
        </figure>

        <dl className="home-hero-rail">
          {telescope && (
            <div>
              <dt>{content.rail.aperture}</dt>
              <dd>{telescope.aperture}</dd>
            </div>
          )}
          {pricing.slot && (
            <div>
              <dt>{content.rail.perMinute}</dt>
              <dd>{pricing.slot.perMinute}</dd>
            </div>
          )}
          {pricing.reachable && (
            <div>
              <dt>{content.rail.openWeek}</dt>
              <dd>{pricing.openThisWeek}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="home-hero-panels">
        <Panel
          href={firstSlot ? `/${locale}/app/book?startAt=${encodeURIComponent(firstSlot.startAt)}` : `/${locale}/app/book`}
          head={<span>{content.panels.tonight}</span>}
        >
          <span className="hero-panel-foot">
            <b className="hero-panel-big">{firstSlot ? clock.format(Date.parse(firstSlot.startAt)) : content.cta}</b>
            <span>{firstSlot ? firstSlot.price : content.panels.noTimes}</span>
          </span>
        </Panel>

        <Panel
          href={`/${locale}/tonight`}
          head={<span>{navigation.live}</span>}
        >
          <span className="hero-panel-eyepiece" aria-hidden="true" />
          <span className="hero-panel-foot">
            <b>{content.watch}</b>
            <span>{steps[2]?.description}</span>
          </span>
        </Panel>

        <Panel
          href={`/${locale}/pricing`}
          head={<span>{price.title}</span>}
        >
          <span className="hero-panel-foot">
            {pricing.slot ? (
              <>
                <b className="hero-panel-big">{pricing.slot.perMinute}</b>
                <span>{content.rail.perMinute}</span>
              </>
            ) : (
              <b>{price.title}</b>
            )}
            <span className="hero-panel-note">{price.cloud}</span>
          </span>
        </Panel>

        <Panel
          href={`/${locale}/sky`}
          head={<span>{navigation.sky}</span>}
        >
          <span className="hero-panel-orbs" aria-hidden="true">
            {up.slice(0, 5).map((o) => (
              <i key={o.body} className="night-orb" data-body={o.body} />
            ))}
          </span>
          <span className="hero-panel-foot">
            <b>{up.length > 0 ? fill(content.panels.upTonight, { count: String(up.length) }) : navigation.sky}</b>
            {up.length > 0 && <span>{up.slice(0, 3).map((o) => copy.names[o.body]).join(" · ")}</span>}
          </span>
        </Panel>
      </div>
    </section>
  );
}
