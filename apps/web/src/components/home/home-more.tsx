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

/** A chapter's head, as Skychaser sets them: the red kicker, the Anton title. */
function Head({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <header className="home-chapter-head">
      <p className="kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}

/**
 * ADR-075: the homepage's chapters under its cards — how booking goes and what it
 * costs, the other ways in, questions, and a last call. Every price is the platform's;
 * the price list is left out when it cannot be read.
 */
export function HomeMore({ content, locale, pricing }: HomeMoreProps) {
  const board = boardCopy[locale];

  return (
    <>
      <section className="home-band home-chapter" aria-labelledby="home-book-title">
        <Container>
          <div className="home-book">
            <div>
              <Head
                id="home-book-title"
                kicker={content.book.kicker}
                title={content.book.title}
              />
              <ol className="home-book-steps">
                {content.book.steps.map((step, index) => (
                  <li key={step.title}>
                    <span className="home-book-no" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <b>{step.title}</b>
                      {step.text}
                    </span>
                  </li>
                ))}
              </ol>
              <ButtonLink href={`/${locale}/app/book`} variant="primary" size="large">
                {content.book.cta}
              </ButtonLink>
            </div>
            {pricing.slot && (
              <aside className="home-lengths" aria-label={content.book.lengths}>
                <p className="kicker">{content.book.lengths}</p>
                <dl>
                  {pricing.slot.lengths.map((length) => (
                    <div key={length.minutes}>
                      <dt>{board.duration(length.minutes)}</dt>
                      <dd>{length.price}</dd>
                    </div>
                  ))}
                </dl>
                <p className="home-caption">
                  {fill(content.book.perMinute, { price: pricing.slot.perMinute })}
                </p>
              </aside>
            )}
          </div>
        </Container>
      </section>

      <section className="home-band home-chapter" aria-labelledby="home-ways-title">
        <Container>
          <Head
            id="home-ways-title"
            kicker={content.ways.kicker}
            title={content.ways.title}
          />
          <ul className="home-ways">
            {content.ways.items.map((item) => (
              <li key={item.href}>
                <Link href={`/${locale}/${item.href}`}>
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

      <section className="home-band home-chapter" aria-labelledby="home-faq-title">
        <Container>
          <Head
            id="home-faq-title"
            kicker={content.faq.kicker}
            title={content.faq.title}
          />
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
          <p>{content.closer.lede}</p>
          <div className="home-closer-actions">
            <ButtonLink href={`/${locale}/app/book`} variant="primary" size="large">
              {content.closer.cta}
            </ButtonLink>
            <ButtonLink href={`/${locale}/observatory`} variant="secondary" size="large">
              {content.closer.secondary}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
