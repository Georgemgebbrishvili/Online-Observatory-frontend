import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/i18n/config";
import type { HomepageDictionary } from "@/types/homepage";

type HomeClosingProps = {
  content: HomepageDictionary["closing"];
  cta: string;
  locale: Locale;
};

/**
 * ADR-100: the homepage's last word. One line over a planet's lit edge rising from the
 * foot of the card, the booking button, and a gift for someone else.
 */
export function HomeClosing({ content, cta, locale }: HomeClosingProps) {
  return (
    <section className="home-band home-closing" aria-labelledby="home-closing-title">
      <Container>
        <div className="home-closing-card">
          <span className="home-closing-limb" aria-hidden="true" />
          <h2 id="home-closing-title">{content.title}</h2>
          <p>{content.lede}</p>
          <div className="home-closing-actions">
            <ButtonLink href={`/${locale}/app/book`} size="large">
              {cta}
            </ButtonLink>
            <ButtonLink href={`/${locale}/gift`} variant="secondary" size="large">
              {content.gift}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
