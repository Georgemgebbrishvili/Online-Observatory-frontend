import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import type { Locale } from "@/i18n/config";
import { boardCopy } from "@/i18n/resources/board";
import type { HomepageDictionary } from "@/types/homepage";

type HomeMoreProps = {
  content: HomepageDictionary["more"];
  locale: Locale;
  pricing: PricingFacts;
};

/**
 * ADR-076: the homepage under its first sections — what a session costs, the other ways
 * in, questions, and a last call. Every price is the platform's; the price section is
 * left out when it cannot be read.
 */
export function HomeMore({ content, locale, pricing }: HomeMoreProps) {
  const board = boardCopy[locale];

  return (
    <>
      {pricing.slot && (
        <section className="home-band" aria-labelledby="home-price-title">
          <Container>
            <header className="home-head">
              <h2 id="home-price-title">{content.price.title}</h2>
              <p>{fill(content.price.perMinute, { price: pricing.slot.perMinute })}</p>
            </header>
            <ul className="home-prices">
              {pricing.slot.lengths.map((length) => (
                <li key={length.minutes}>
                  <Link
                    className="home-tile home-price"
                    href={`/${locale}/app/book?length=${length.minutes}`}
                  >
                    <span>{board.duration(length.minutes)}</span>
                    <b>{length.price}</b>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="home-guarantee">{content.price.cloud}</p>
          </Container>
        </section>
      )}

      <section className="home-band" aria-labelledby="home-ways-title">
        <Container>
          <header className="home-head">
            <h2 id="home-ways-title">{content.ways.title}</h2>
          </header>
          <ul className="home-ways">
            {content.ways.items.map((item) => (
              <li key={item.href}>
                <Link
                  className="home-tile"
                  href={`/${locale}/${item.href}`}
                  data-way={item.href}
                >
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                  <span className="home-ways-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="home-band" aria-labelledby="home-faq-title">
        <Container>
          <header className="home-head">
            <h2 id="home-faq-title">{content.faq.title}</h2>
          </header>
          <div className="home-faq">
            {content.faq.items.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-band home-closer" aria-labelledby="home-closer-title">
        <Container>
          <h2 id="home-closer-title">
            {content.closer.title} <span>{content.closer.sunset}</span>
          </h2>
          <div className="home-closer-actions">
            <ButtonLink href={`/${locale}/app/book`}>{content.closer.cta}</ButtonLink>
            <ButtonLink href={`/${locale}/observatory`} variant="secondary">
              {content.closer.secondary}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
