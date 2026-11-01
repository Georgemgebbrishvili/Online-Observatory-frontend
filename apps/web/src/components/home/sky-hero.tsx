import { SkyReveal } from "@/components/home/sky-reveal";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { HomepageDictionary } from "@/types/homepage";

type SkyHeroProps = {
  content: HomepageDictionary["hero"];
  locale: Locale;
  /** The homepage's h1; an h2 where the hero is shown inside another page. */
  headingLevel?: 1 | 2;
};

/**
 * The homepage hero (ADR-076): the drawn sky behind, the headline, one filled button to
 * book and one to watch.
 */
export function SkyHero({ content, headingLevel = 1, locale }: SkyHeroProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const titleId = headingLevel === 1 ? "home-title" : "ds-home-title";
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
          <ButtonLink href={`/${locale}/app/book`}>
            {content.cta}
          </ButtonLink>
          <ButtonLink href={`/${locale}/tonight`} variant="secondary">
            {content.watch}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
