import Link from "next/link";

import { PlateFan } from "@/components/home/plate-fan";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { HomepageDictionary } from "@/types/homepage";

export type HeroStat = { value: string; label: string };

type PosterHeroProps = {
  content: HomepageDictionary["hero"];
  locale: Locale;
  /** Platform values only; a stat the platform cannot back is left out. */
  stats: readonly HeroStat[];
};

/**
 * The homepage hero in the poster language (ADR-039): an Anton headline whose second
 * line is the page's one sunset title, one orange action, a stats row, and the fan.
 */
export function PosterHero({ content, locale, stats }: PosterHeroProps) {
  return (
    <section className="poster-hero" aria-labelledby="home-title">
      <Container className="poster-hero-grid">
        <div className="poster-hero-copy">
          <p className="kicker">{content.kicker}</p>
          <h1 id="home-title" className="poster-hero-title">
            <span>{content.headline}</span>{" "}
            <span className="title-sunset">{content.sunset}</span>
          </h1>
          <p className="poster-hero-lede">{content.lede}</p>
          <div className="poster-hero-actions">
            <ButtonLink href={`/${locale}/app/book`} size="large">
              {content.cta}
            </ButtonLink>
            <Link className="poster-hero-link" href="#tonight">
              {content.secondary} <span aria-hidden="true">→</span>
            </Link>
          </div>
          {stats.length > 0 && (
            <div className="stats-row poster-hero-stats">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <PlateFan content={content} />
      </Container>
    </section>
  );
}
