import Link from "next/link";

import {
  getPricingOffering,
  isOfferingEnabled,
  pricingConfiguration,
  type PricingOffering,
} from "@/features/pricing/plans";
import type { Locale } from "@/i18n/config";
import { pricingPageCopy } from "@/i18n/resources/pricing";

type PricingPageProps = {
  locale: Locale;
};

function availabilityLabel(offering: PricingOffering, locale: Locale) {
  const copy = pricingPageCopy[locale];

  if (!isOfferingEnabled(offering)) {
    return copy.future;
  }

  return offering.availability === "AVAILABLE" ? copy.available : copy.concept;
}

function priceLabel(offering: PricingOffering, locale: Locale) {
  return offering.price.kind === "FREE"
    ? pricingPageCopy[locale].free
    : pricingPageCopy[locale].configuredLater;
}

function OfferingCard({
  locale,
  offering,
  index,
}: {
  locale: Locale;
  offering: PricingOffering;
  index: number;
}) {
  const copy = pricingPageCopy[locale];
  const enabled = isOfferingEnabled(offering);

  return (
    <article
      className={`pricing-offering pricing-offering-${offering.id}`}
      data-feature-enabled={enabled}
    >
      <header>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <small>{availabilityLabel(offering, locale)}</small>
      </header>
      <div className="pricing-offering-name">
        <h2>{offering.name[locale]}</h2>
        <strong>{priceLabel(offering, locale)}</strong>
        <p>{offering.description[locale]}</p>
      </div>
      <div className="pricing-offering-features">
        <span>{copy.included}</span>
        <ul>
          {offering.features.map((feature) => (
            <li key={feature.en}>
              <span aria-hidden="true">✓</span>
              {feature[locale]}
            </li>
          ))}
        </ul>
      </div>
      {offering.id === "observer" && (
        <Link className="button button-primary" href={`/${locale}/app/missions`}>
          <span>{copy.explore}</span>
        </Link>
      )}
    </article>
  );
}

export function PricingPage({ locale }: PricingPageProps) {
  const copy = pricingPageCopy[locale];
  const standardOfferings = pricingConfiguration.offerings.filter(
    (offering) => offering.id !== "private-observatory",
  );
  const privateOffering = getPricingOffering("private-observatory")!;

  return (
    <main id="main-content" className="pricing-page">
      <section className="pricing-hero" aria-labelledby="pricing-title">
        <p>{copy.eyebrow}</p>
        <h1 id="pricing-title">{copy.title}</h1>
        <div>
          <p>{copy.introduction}</p>
          <span className="pricing-orbit" aria-hidden="true">
            <i />
          </span>
        </div>
      </section>

      <aside className="pricing-notice" aria-labelledby="pricing-notice-title">
        <span>{copy.noticeMarker}</span>
        <div>
          <h2 id="pricing-notice-title">{copy.noticeTitle}</h2>
          <p>{copy.notice}</p>
        </div>
        <strong>{copy.noPayment}</strong>
      </aside>

      <section className="pricing-offering-grid" aria-label={copy.title}>
        {standardOfferings.map((offering, index) => (
          <OfferingCard
            key={offering.id}
            offering={offering}
            index={index}
            locale={locale}
          />
        ))}
      </section>

      <section className="pricing-private" aria-labelledby="private-pricing-title">
        <header>
          <div>
            <span>04</span>
            <p>{copy.privateLabel}</p>
          </div>
          <small>{availabilityLabel(privateOffering, locale)}</small>
        </header>
        <div className="pricing-private-intro">
          <div>
            <h2 id="private-pricing-title">{privateOffering.name[locale]}</h2>
            <strong>{priceLabel(privateOffering, locale)}</strong>
          </div>
          <p>{privateOffering.description[locale]}</p>
        </div>
        <div className="pricing-session-grid">
          {privateOffering.sessionDurations?.map((duration, index) => (
            <article key={duration}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{duration}</strong>
              <p>{copy.minutes}</p>
              <small>{copy.perSession}</small>
            </article>
          ))}
        </div>
        <div className="pricing-private-footer">
          <p>
            <span aria-hidden="true">✓</span>
            {privateOffering.features[0][locale]}
          </p>
          <small>{copy.sessionNote}</small>
        </div>
      </section>

      <section className="pricing-configuration" aria-labelledby="pricing-config-title">
        <div>
          <span>{copy.configurationMarker}</span>
          <h2 id="pricing-config-title">{copy.configuration}</h2>
          <p>{copy.configurationDescription}</p>
        </div>
        <dl>
          <div>
            <dt>{copy.version}</dt>
            <dd>{pricingConfiguration.version}</dd>
          </div>
          <div>
            <dt>{copy.currency}</dt>
            <dd>{pricingConfiguration.currency ?? copy.currencyPending}</dd>
          </div>
          <div>
            <dt>{copy.paymentStatus}</dt>
            <dd>{copy.paymentDisabled}</dd>
          </div>
        </dl>
      </section>

      <Link className="pricing-back" href={`/${locale}`}>
        <span aria-hidden="true">←</span> {copy.back}
      </Link>
    </main>
  );
}
