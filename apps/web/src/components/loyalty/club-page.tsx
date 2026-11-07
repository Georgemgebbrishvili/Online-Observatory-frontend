import type { LoyaltyAccount, LoyaltyScheme, LoyaltyTier } from "@darkview/contracts";
import Link from "next/link";

import { longDate } from "@/features/cards/dates";
import { clubProgress } from "@/features/loyalty/club";
import type { Locale } from "@/i18n/config";
import { loyaltyCopy } from "@/i18n/resources/loyalty";

import { ReferralShare } from "./referral-share";

function tierName(tier: LoyaltyTier, locale: Locale) {
  return locale === "ka" ? tier.nameKa : tier.nameEn;
}

/** The member card: tier, spendable balance, and the bar to the next tier (ADR-084 §2). */
export function MemberCard({
  account,
  id = "club-card",
  locale,
  scheme,
}: {
  account: LoyaltyAccount;
  /** Unique per page: /design-system shows two cards. */
  id?: string;
  locale: Locale;
  scheme: LoyaltyScheme;
}) {
  const copy = loyaltyCopy[locale].card;
  const number = new Intl.NumberFormat("en-GB");
  const progress = clubProgress(account, scheme);

  return (
    <section className="club-card" aria-labelledby={`${id}-tier`}>
      <span className="club-card-kicker">{copy.kicker}</span>
      <h2 id={`${id}-tier`} className="club-card-tier">
        {tierName(account.tier, locale)}
      </h2>
      <p className="club-card-off">{copy.off(account.tier.discountPercent)}</p>
      <p className="club-card-balance">
        <strong data-field="balance">{number.format(account.balance)}</strong>
        <span>{copy.balance}</span>
      </p>
      {progress.top ? (
        <p className="club-card-top">
          <b>{copy.top}</b> {copy.topDetail}
        </p>
      ) : (
        <div className="club-progress">
          <div
            className="club-bar"
            role="progressbar"
            aria-label={copy.progress(tierName(progress.next, locale))}
            aria-valuemin={0}
            aria-valuemax={progress.next.thresholdPoints}
            aria-valuenow={Math.min(Math.max(account.tierPoints, 0), progress.next.thresholdPoints)}
          >
            <span className="club-bar-fill" style={{ inlineSize: `${progress.fraction * 100}%` }} />
            {progress.markers.map((marker) => (
              <span
                key={marker.points}
                className={`club-bar-marker${marker.reached ? " is-reached" : ""}`}
                style={{ insetInlineStart: `${marker.at * 100}%` }}
                title={copy.marker(number.format(marker.points))}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="club-progress-text">
            <span>{copy.tierPoints(number.format(Math.max(account.tierPoints, 0)))}</span>
            <span>
              {copy.toNext(number.format(progress.remaining), tierName(progress.next, locale))}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

export function TierLadder({
  current,
  id = "club-ladder",
  locale,
  scheme,
}: {
  current: string | null;
  id?: string;
  locale: Locale;
  scheme: LoyaltyScheme;
}) {
  const copy = loyaltyCopy[locale].ladder;
  const number = new Intl.NumberFormat("en-GB");
  const tiers = [...scheme.tiers].sort((a, b) => a.thresholdPoints - b.thresholdPoints);
  return (
    <section className="surface-panel club-panel" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{copy.title}</h2>
      <ol className="club-ladder">
        {tiers.map((tier) => (
          <li
            key={tier.code}
            aria-current={tier.code === current ? "true" : undefined}
            className={tier.code === current ? "is-current" : undefined}
          >
            <strong>{tierName(tier, locale)}</strong>
            <span>
              {tier.thresholdPoints === 0
                ? copy.start
                : copy.from(number.format(tier.thresholdPoints))}
            </span>
            <span className="club-ladder-off">{copy.off(tier.discountPercent)}</span>
            {tier.code === current && <span className="club-ladder-you">{copy.current}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function HowYouEarn({ locale, scheme }: { locale: Locale; scheme: LoyaltyScheme }) {
  const copy = loyaltyCopy[locale].earn;
  const ways = [
    copy.rate(scheme.pointsPerGel),
    ...(scheme.welcomeBonusPoints > 0 ? [copy.welcome(scheme.welcomeBonusPoints)] : []),
    ...(scheme.referralBonusPoints > 0 ? [copy.referral(scheme.referralBonusPoints)] : []),
    copy.spend(scheme.pointsPerGelRedeemed),
  ];
  return (
    <section className="surface-panel club-panel" aria-labelledby="club-earn-title">
      <h2 id="club-earn-title">{copy.title}</h2>
      <ul className="club-ways">
        {ways.map((way) => (
          <li key={way}>{way}</li>
        ))}
      </ul>
      <p className="club-rules">{copy.rules}</p>
    </section>
  );
}

function History({ account, locale }: { account: LoyaltyAccount; locale: Locale }) {
  const copy = loyaltyCopy[locale];
  const number = new Intl.NumberFormat("en-GB", { signDisplay: "exceptZero" });
  return (
    <section className="surface-panel club-panel club-history" aria-labelledby="club-history-title">
      <h2 id="club-history-title">{copy.history.title}</h2>
      {account.recentEntries.length === 0 ? (
        <p className="club-empty">{copy.history.empty}</p>
      ) : (
        <ol className="club-entries">
          {account.recentEntries.map((entry) => (
            <li key={entry.id} data-kind={entry.kind}>
              <span className="club-entry-kind">{copy.kinds[entry.kind]}</span>
              <time dateTime={entry.createdAt}>
                {longDate(new Date(entry.createdAt), locale, "Asia/Tbilisi")}
              </time>
              <strong className={entry.points < 0 ? "is-spent" : "is-earned"}>
                {copy.history.points(number.format(entry.points))}
              </strong>
              {entry.bookingId && (
                <Link href={`/${locale}/app/bookings/${entry.bookingId}`}>{copy.history.booking}</Link>
              )}
              {entry.kind === "ADMIN_ADJUSTMENT" && entry.reason && (
                <span className="club-entry-reason">{entry.reason}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** /app/loyalty (ADR-084). Every number comes from the scheme and the account. */
export function ClubPage({
  account,
  locale,
  scheme,
}: {
  account: LoyaltyAccount;
  locale: Locale;
  scheme: LoyaltyScheme;
}) {
  const copy = loyaltyCopy[locale];
  return (
    <div className="club-page">
      <h1 className="visually-hidden">{copy.title}</h1>
      <div className="club-top">
        <MemberCard account={account} locale={locale} scheme={scheme} />
        <ReferralShare code={account.referralCode} locale={locale} />
      </div>
      <div className="club-columns">
        <TierLadder current={account.tier.code} locale={locale} scheme={scheme} />
        <HowYouEarn locale={locale} scheme={scheme} />
      </div>
      <History account={account} locale={locale} />
    </div>
  );
}
