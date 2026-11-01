import { SkyReveal } from "@/components/home/sky-reveal";
import { ButtonLink } from "@/components/ui/button";
import type { ObservatoryPanelResult } from "@/features/home/read";
import type { Locale } from "@/i18n/config";
import { statusCopy } from "@/i18n/resources/status";
import type { HomepageDictionary } from "@/types/homepage";

type SkyHeroProps = {
  content: HomepageDictionary["hero"];
  locale: Locale;
  /** The observatory right now; left out where it cannot be read. */
  panel?: ObservatoryPanelResult;
  /** The homepage's h1; an h2 where the hero is shown inside another page. */
  headingLevel?: 1 | 2;
};

/**
 * The homepage hero (ADR-076): the drawn sky behind, the headline, one filled button to
 * book and one to watch, and the observatory's state in two chips under them.
 */
export function SkyHero({ content, headingLevel = 1, locale, panel }: SkyHeroProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const titleId = headingLevel === 1 ? "home-title" : "ds-home-title";
  const words = statusCopy[locale];
  return (
    <section className="sky-hero" aria-labelledby={titleId}>
      <SkyReveal
        locale={locale}
        names={content.plates}
        kinds={content.kinds}
        copy={content.sky}
      />
      <div className="sky-hero-copy">
        <Heading id={titleId} className="sky-hero-title">
          <span>{content.headline}</span> <em>{content.sunset}</em>
        </Heading>
        <p className="sky-hero-lede">{content.lede}</p>
        <div className="sky-hero-actions">
          <ButtonLink href={`/${locale}/app/book`} size="large">
            {content.cta}
          </ButtonLink>
          <ButtonLink href={`/${locale}/tonight`} size="large" variant="secondary">
            {content.watch}
          </ButtonLink>
        </div>
        {panel?.kind === "ok" && (
          <ul className="sky-hero-status" aria-label={content.statusLabel}>
            <li data-tone={panel.status.link === "ONLINE" ? "good" : "bad"}>
              <span className="home-dot" aria-hidden="true" />
              {words.link[panel.status.link]}
            </li>
            <li data-tone={panel.status.weather.status === "CLEAR" ? "good" : "quiet"}>
              <span className="home-dot" aria-hidden="true" />
              {words.weather[panel.status.weather.status]}
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}
