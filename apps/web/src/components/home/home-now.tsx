import Link from "next/link";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import type { ObservatoryPanelResult } from "@/features/home/read";
import { fill } from "@/features/operator/format";
import type { PricingFacts } from "@/features/pricing/read";
import { formatWindow, primaryReason, targetName } from "@/features/targets/present";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { statusCopy } from "@/i18n/resources/status";
import { targetCopy } from "@/i18n/resources/targets";
import type { HomepageDictionary } from "@/types/homepage";

type HomeNowProps = {
  content: Pick<HomepageDictionary, "tonight" | "live" | "telescope" | "pricing">;
  locale: Locale;
  tonight: TonightResult;
  panel: ObservatoryPanelResult;
  pricing: PricingFacts;
};

/** How many of tonight's targets the card lists; the rest are a tap away. */
const tonightShown = 3;

/** One card: a small kicker with an optional link beside it, a short title, its body. */
function Card({
  area,
  children,
  id,
  kicker,
  more,
  title,
}: {
  area: string;
  id: string;
  kicker: string;
  title: string;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <article className={`home-card home-card-${area}`} aria-labelledby={id}>
      <header className="home-card-head">
        <p className="kicker">{kicker}</p>
        {more && (
          <Link className="home-card-more" href={more.href}>
            {more.label} <span aria-hidden="true">›</span>
          </Link>
        )}
      </header>
      <h3 id={id} className="home-card-title">
        {title}
      </h3>
      {children}
    </article>
  );
}

/**
 * Under the steps, four small cards in one grid: what is up tonight, the observatory
 * right now, the telescope, and the price. Every value is the platform's; a card whose
 * data cannot be read says so in one line.
 */
export function HomeNow({ content, locale, panel, pricing, tonight }: HomeNowProps) {
  const targets = targetCopy[locale];
  const words = statusCopy[locale];
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;
  const { live } = content;

  return (
    <div className="home-now">
      <Card
        area="tonight"
        id="home-tonight-title"
        kicker={content.tonight.kicker}
        title={content.tonight.title}
        more={{ href: `/${locale}/app/missions`, label: content.tonight.all }}
      >
        {tonight.kind !== "ok" ? (
          <p className="home-card-note">{content.tonight.unavailable}</p>
        ) : tonight.items.length === 0 ? (
          <p className="home-card-note">{content.tonight.empty}</p>
        ) : (
          <ol className="home-tonight-list">
            {tonight.items.slice(0, tonightShown).map(({ target, visibility }) => {
              const reason = primaryReason(visibility);
              return (
                <li key={target.id}>
                  <Link
                    href={`/${locale}/app/missions/${target.slug}`}
                    data-observable={visibility.observable || undefined}
                  >
                    <span className="home-dot" aria-hidden="true" />
                    <span className="home-tonight-name">
                      {targetName(target, locale)}
                      <small>
                        {visibility.observable
                          ? targets.types[target.type]
                          : reason
                            ? targets.reasons[reason]
                            : targets.types[target.type]}
                      </small>
                    </span>
                    <span className="home-tonight-when">
                      {formatWindow(
                        visibility,
                        tonight.observatory.timezone,
                        locale,
                        targets.window,
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <Card
        area="live"
        id="home-live-title"
        kicker={live.kicker}
        title={live.title}
        more={{ href: `/${locale}/status`, label: live.fullStatus }}
      >
        {panel.kind !== "ok" ? (
          <p className="home-card-note">{live.unavailable}</p>
        ) : (
          <>
            <dl className="home-facts">
              <div data-tone={panel.status.link === "ONLINE" ? "good" : "bad"}>
                <dt>{words.now.link}</dt>
                <dd>
                  <span className="home-dot" aria-hidden="true" />
                  {words.link[panel.status.link]}
                </dd>
              </div>
              <div data-tone={panel.status.weather.status === "CLEAR" ? "good" : "quiet"}>
                <dt>{words.now.weather}</dt>
                <dd>
                  <span className="home-dot" aria-hidden="true" />
                  {words.weather[panel.status.weather.status]}
                </dd>
              </div>
              <div data-tone={panel.status.weather.holdActive ? "bad" : "good"}>
                <dt>{words.now.hold}</dt>
                <dd>
                  <span className="home-dot" aria-hidden="true" />
                  {panel.status.weather.holdActive
                    ? words.now.holdActive
                    : words.now.holdInactive}
                </dd>
              </div>
            </dl>
            {panel.status.missionInProgress && (
              <Link className="home-live-now" href={`/${locale}/tonight`}>
                <span className="home-live-pulse" aria-hidden="true" />
                {/* A target name only while its owner has opted in (ADR-007). */}
                <span>
                  {panel.status.currentTargetName
                    ? fill(live.observing, { name: panel.status.currentTargetName })
                    : live.inProgress}
                </span>
                <b>
                  {live.watch} <span aria-hidden="true">›</span>
                </b>
              </Link>
            )}
          </>
        )}
      </Card>

      <Card
        area="telescope"
        id="home-telescope-title"
        kicker={content.telescope.kicker}
        title={content.telescope.title}
        more={{ href: `/${locale}/observatory`, label: content.telescope.more }}
      >
        <dl className="home-specs">
          {telescope && (
            <>
              <div>
                <dt>{content.telescope.aperture}</dt>
                <dd>
                  {telescope.apertureMm} <small>{content.telescope.millimetres}</small>
                </dd>
              </div>
              <div>
                <dt>{content.telescope.focalLength}</dt>
                <dd>
                  {telescope.focalLengthMm} <small>{content.telescope.millimetres}</small>
                </dd>
              </div>
              <div>
                <dt>{content.telescope.focalRatio}</dt>
                <dd>{`f/${Math.round(telescope.focalLengthMm / telescope.apertureMm)}`}</dd>
              </div>
            </>
          )}
          <div>
            <dt>{content.telescope.camera}</dt>
            <dd>{content.telescope.cameraValue}</dd>
          </div>
        </dl>
      </Card>

      <Card
        area="pricing"
        id="home-pricing-title"
        kicker={content.pricing.kicker}
        title={content.pricing.title}
        more={{ href: `/${locale}/pricing`, label: content.pricing.all }}
      >
        <div className="home-price">
          {pricing.slot ? (
            <p>
              <strong>{fill(content.pricing.from, { price: pricing.slot.price })}</strong>
              <span>
                {fill(content.pricing.session, {
                  minutes: String(pricing.slot.durationMinutes),
                })}
                {pricing.openThisWeek > 0 &&
                  ` · ${fill(content.pricing.open, { count: String(pricing.openThisWeek) })}`}
              </span>
            </p>
          ) : (
            <p className="home-card-note">{content.pricing.none}</p>
          )}
          <ButtonLink
            href={`/${locale}/app/book`}
            size="small"
            className="home-price-cta"
          >
            {content.pricing.reserve}
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
