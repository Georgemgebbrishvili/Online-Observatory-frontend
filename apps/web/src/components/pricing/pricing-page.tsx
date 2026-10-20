import Link from "next/link";

import { PageGuide } from "@/components/guide/page-guide";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { pricingOfferings, type PricingOffering } from "@/features/pricing/plans";
import type { PricingFacts } from "@/features/pricing/read";
import type { Locale } from "@/i18n/config";
import { pricingPageCopy } from "@/i18n/resources/pricing";

type Copy = (typeof pricingPageCopy)[Locale];

function Check() {
  return (
    <svg className="pricing-check" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Hero({ copy, facts, locale }: { copy: Copy; facts: PricingFacts; locale: Locale }) {
  const { slot, loyalty } = facts;
  const entry = loyalty?.tiers.find((tier) => tier.thresholdPoints === 0);
  return (
    <div className="pricing-hero-main">
      <p className="kicker">{copy.hero.eyebrow}</p>
      {slot ? (
        <p className="pricing-figure">
          <strong>{slot.price}</strong>
          <span>{copy.hero.per(slot.durationMinutes)}</span>
        </p>
      ) : (
        <p className="pricing-figure">
          <strong className="pricing-figure-words">{copy.hero.fallbackPrice}</strong>
        </p>
      )}
      {slot?.memberPrice && entry && (
        <p className="pricing-member">{copy.hero.member(slot.memberPrice, entry.discountPercent)}</p>
      )}
      <p className="pricing-lede">
        {slot ? `${copy.hero.perMinute(slot.perMinute)} ${copy.hero.lede}` : copy.hero.fallbackLede}
      </p>
      <div className="pricing-actions">
        <ButtonLink href={`/${locale}/app/book`} variant="primary" size="large">
          {copy.hero.book}
        </ButtonLink>
        <ButtonLink href={`/${locale}/app/missions`} variant="secondary" size="large">
          {copy.hero.explore}
        </ButtonLink>
      </div>
      <ul className="pricing-specs">
        {copy.hero.specs.map((spec) => (
          <li key={spec}>{spec}</li>
        ))}
      </ul>
    </div>
  );
}

function Tonight({ copy, facts, locale }: { copy: Copy; facts: PricingFacts; locale: Locale }) {
  const { tonight } = facts;
  const time = tonight
    ? new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: tonight.timezone,
      })
    : null;
  return (
    <aside className="pricing-tonight" aria-labelledby="pricing-tonight-title">
      <header>
        <h2 id="pricing-tonight-title" className="plate-title">
          {tonight?.isToday === false ? copy.tonight.next : copy.tonight.title}
        </h2>
        {tonight && (
          <p>
            <time dateTime={tonight.date}>{tonight.label}</time>
          </p>
        )}
      </header>
      {!tonight || !time ? (
        <p className="pricing-tonight-note">
          {facts.reachable ? copy.tonight.none : copy.tonight.unreachable}
        </p>
      ) : (
        (
          <ul className="pricing-times">
            {tonight.slots.slice(0, 5).map((slot) => (
              <li key={slot.startAt}>
                <Link href={`/${locale}/app/book?startAt=${encodeURIComponent(slot.startAt)}`}>
                  <time dateTime={slot.startAt}>{time.format(new Date(slot.startAt))}</time>
                  <span>{slot.price}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
      <footer>
        <small>{copy.tonight.time}</small>
        {facts.openThisWeek > 0 && <small>{copy.tonight.more(facts.openThisWeek)}</small>}
        <Link className="page-link" href={`/${locale}/app/book`}>
          {copy.tonight.all} <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </aside>
  );
}

function Plan({
  copy,
  facts,
  locale,
  offering,
}: {
  copy: Copy;
  facts: PricingFacts;
  locale: Locale;
  offering: PricingOffering;
}) {
  const kind = offering.price.kind;
  const price =
    kind === "FREE"
      ? { figure: copy.free, note: null }
      : kind === "PER_SEAT"
        ? { figure: copy.seatPrice, note: copy.seatNote }
        : facts.slot
          ? { figure: facts.slot.price, note: copy.perSlot(facts.slot.durationMinutes) }
          : { figure: copy.hero.fallbackPrice, note: null };

  return (
    <li className={`pricing-plan${kind === "PER_SLOT" ? " is-featured" : ""}`} data-offering={offering.id}>
      <h3>{offering.name[locale]}</h3>
      <p className="pricing-plan-desc">{offering.description[locale]}</p>
      <p className="pricing-plan-price">
        <strong className={kind === "PER_SEAT" ? "is-words" : undefined}>{price.figure}</strong>
        {price.note && <small>{price.note}</small>}
      </p>
      <span className="plate-title">{copy.included}</span>
      <ul className="pricing-plan-features">
        {offering.features.map((feature) => (
          <li key={feature.en}>
            <Check />
            {feature[locale]}
          </li>
        ))}
      </ul>
      {offering.action && (
        <ButtonLink
          className="pricing-plan-action"
          href={`/${locale}/${offering.action.href}`}
          variant={kind === "PER_SLOT" ? "primary" : "secondary"}
        >
          {offering.action.label[locale]}
        </ButtonLink>
      )}
    </li>
  );
}

function Club({ copy, facts, locale }: { copy: Copy; facts: PricingFacts; locale: Locale }) {
  const scheme = facts.loyalty;
  if (!scheme) return null;
  const number = new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB");
  const tiers = [...scheme.tiers].sort((left, right) => left.thresholdPoints - right.thresholdPoints);
  const ways = [
    copy.earn(scheme.pointsPerGel),
    copy.redeem(scheme.pointsPerGelRedeemed),
    ...(scheme.welcomeBonusPoints > 0 ? [copy.welcome(scheme.welcomeBonusPoints)] : []),
  ];

  return (
    <section className="page-section pricing-club" aria-labelledby="pricing-club-title">
      <Container>
        <div className="pricing-club-grid">
          <header>
            <h2 id="pricing-club-title">{copy.clubTitle}</h2>
            <p>{copy.clubLede}</p>
            <ul className="pricing-ways">
              {ways.map((way) => (
                <li key={way}>
                  <Check />
                  {way}
                </li>
              ))}
            </ul>
          </header>
          <ol className="pricing-tiers">
            {tiers.map((tier) => (
              <li key={tier.code}>
                <span className="pricing-tier-off">{tier.discountPercent}%</span>
                <strong>{locale === "ka" ? tier.nameKa : tier.nameEn}</strong>
                <small>{copy.off(tier.discountPercent)}</small>
                <span className="plate-title">
                  {tier.thresholdPoints === 0
                    ? copy.tierStart
                    : copy.tierFrom(number.format(tier.thresholdPoints))}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

export function PricingPage({ facts, locale }: { facts: PricingFacts; locale: Locale }) {
  const copy = pricingPageCopy[locale];

  return (
    <main id="main-content" className="public-page pricing-page">
      <h1 id="pricing-title" className="visually-hidden">
        {copy.title}
      </h1>

      <section className="pricing-hero" aria-label={copy.title}>
        <Container>
          <div className="pricing-hero-grid">
            <Hero copy={copy} facts={facts} locale={locale} />
            <Tonight copy={copy} facts={facts} locale={locale} />
          </div>
        </Container>
      </section>

      <section className="page-section pricing-plans-section" aria-labelledby="pricing-plans-title">
        <Container>
          <h2 id="pricing-plans-title" className="pricing-section-title">
            {copy.plansTitle}
          </h2>
          <ol className="pricing-plans">
            {pricingOfferings.map((offering) => (
              <Plan key={offering.id} copy={copy} facts={facts} locale={locale} offering={offering} />
            ))}
          </ol>
          <p className="pricing-provisional">{copy.provisional}</p>
        </Container>
      </section>

      <Club copy={copy} facts={facts} locale={locale} />

      <section className="page-section pricing-later-section" aria-labelledby="pricing-later-title">
        <Container>
          <div className="pricing-later">
            <h2 id="pricing-later-title" className="plate-title">
              {copy.laterTitle}
            </h2>
            <p>{copy.later}</p>
          </div>
        </Container>
      </section>

      <PageGuide id="pricing" locale={locale} />
    </main>
  );
}
