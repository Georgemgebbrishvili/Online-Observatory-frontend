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
 * The homepage hero as the Skychaser site sets its own (ADR-052 §7): the sky behind, a
 * centred Anton headline whose last words are red, the lede, and one filled button.
 */
export function SkyHero({ content, headingLevel = 1, locale }: SkyHeroProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const titleId = headingLevel === 1 ? "home-title" : "ds-home-title";
  return (
    <section className="sky-hero" aria-labelledby={titleId}>
      <SkyReveal locale={locale} names={content.plates} copy={content.sky} />
      <div className="sky-hero-copy">
        <Heading id={titleId} className="sky-hero-title">
          <span>{content.headline}</span> <em>{content.sunset}</em>
        </Heading>
        <p className="sky-hero-lede">{content.lede}</p>
        <ButtonLink href={`/${locale}/app/book`} size="large">
          {content.cta}
        </ButtonLink>
      </div>
    </section>
  );
}
