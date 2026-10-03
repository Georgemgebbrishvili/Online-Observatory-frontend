import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { pricingOfferings, type PricingOffering } from "@/features/pricing/plans";
import type { Locale } from "@/i18n/config";
import { pricingPageCopy } from "@/i18n/resources/pricing";

function Offering({
  index,
  locale,
  offering,
}: {
  index: number;
  locale: Locale;
  offering: PricingOffering;
}) {
  const copy = pricingPageCopy[locale];
  const free = offering.price.kind === "FREE";

  return (
    <li className="pricing-row" data-offering={offering.id}>
      <span className="pricing-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="pricing-name">
        <h3>{offering.name[locale]}</h3>
        <p>{offering.description[locale]}</p>
      </div>
      <div className="pricing-price">
        <strong className={free ? "pricing-free" : undefined}>
          {free ? copy.free : copy.perSlot}
        </strong>
        {!free && <small>{copy.perSlotNote}</small>}
      </div>
      <div className="pricing-features">
        <span className="plate-title">{copy.included}</span>
        <ul>
          {offering.features.map((feature) => (
            <li key={feature.en}>{feature[locale]}</li>
          ))}
        </ul>
      </div>
      <ButtonLink
        className="pricing-action"
        href={`/${locale}/${offering.action.href}`}
        variant={free ? "secondary" : "primary"}
      >
        {offering.action.label[locale]}
      </ButtonLink>
    </li>
  );
}

export function PricingPage({ locale }: { locale: Locale }) {
  const copy = pricingPageCopy[locale];

  return (
    <main id="main-content" className="public-page pricing-page">
      <section className="page-hero" aria-labelledby="pricing-title">
        <Container>
          <p className="kicker">{copy.eyebrow}</p>
          <h1 id="pricing-title">{copy.title}</h1>
          <p className="page-lede">{copy.introduction}</p>
        </Container>
      </section>

      <section className="page-section" aria-labelledby="pricing-offerings-title">
        <Container>
          <h2 id="pricing-offerings-title" className="visually-hidden">
            {copy.offerings}
          </h2>
          <ol className="pricing-rows">
            {pricingOfferings.map((offering, index) => (
              <Offering
                key={offering.id}
                index={index}
                locale={locale}
                offering={offering}
              />
            ))}
          </ol>
          <p className="pricing-provisional">{copy.provisional}</p>

          <aside className="pricing-later" aria-labelledby="pricing-later-title">
            <h2 id="pricing-later-title" className="plate-title">
              {copy.laterTitle}
            </h2>
            <p>{copy.later}</p>
          </aside>
        </Container>
      </section>
    </main>
  );
}
