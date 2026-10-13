import { SkyReveal } from "@/components/home/sky-reveal";
import { ButtonLink } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { HomepageDictionary } from "@/types/homepage";

type SkyHeroProps = {
  content: HomepageDictionary["hero"];
  locale: Locale;
};

/**
 * The homepage hero as the Skychaser site sets its own (ADR-052 §7): the sky behind, a
 * centred Anton headline whose last words are red, the lede, and one filled button.
 */
export function SkyHero({ content, locale }: SkyHeroProps) {
  return (
    <section className="sky-hero" aria-labelledby="home-title">
      <SkyReveal locale={locale} names={content.plates} copy={content.sky} />
      <div className="sky-hero-copy">
        <h1 id="home-title" className="sky-hero-title">
          <span>{content.headline}</span> <em>{content.sunset}</em>
        </h1>
        <p className="sky-hero-lede">{content.lede}</p>
        <ButtonLink href={`/${locale}/app/book`} size="large">
          {content.cta}
        </ButtonLink>
      </div>
    </section>
  );
}
