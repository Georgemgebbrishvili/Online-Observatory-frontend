import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatePanel } from "@/components/ui/state-panel";
import { Ballot, plateOf } from "@/components/vote/ballot";
import { TonightSkyChart } from "@/components/vote/tonight-sky-chart";
import { localDate } from "@/features/booking/read";
import { readTonight } from "@/features/targets/read";
import { targetVisual } from "@/features/targets/present";
import { addDays, nightWindow, voteCandidates, weekOf } from "@/features/vote/sky";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { targetCopy } from "@/i18n/resources/targets";
import { voteCopy } from "@/i18n/resources/vote";
import { localizedMetadata } from "@/lib/seo";
import "@/styles/pages.css";
import "@/styles/vote.css";

type VoteRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: VoteRouteProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = voteCopy[locale];
  return localizedMetadata({
    locale,
    path: "vote",
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

/** The clock, read once per request outside the render (react-hooks/purity). */
function readClock() {
  return new Date();
}

/**
 * /vote (ADR-053 §8): the week's ballot, the leading target, the night's sky chart, on
 * the platform's catalogue. The tally waits on the platform (docs/platform-requests/
 * weekly-vote.md): until then the ballot stands with no counts and says so.
 */
export default async function VoteRoute({ params }: VoteRouteProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, tonight] = await Promise.all([getDictionary(locale), readTonight(locale)]);
  const copy = voteCopy[locale];
  const words = targetCopy[locale];
  const now = readClock();
  const intl = locale === "ka" ? "ka-GE" : "en-GB";

  let body;
  if (tonight.kind !== "ok") {
    body = (
      <section className="vote-section">
        <StatePanel
          variant={tonight.kind === "unreachable" ? "error" : "empty"}
          headingLevel={2}
          {...(tonight.kind === "unreachable" ? words.unreachable : words.noObservatory)}
        />
      </section>
    );
  } else {
    const timezone = tonight.observatory.timezone;
    const window = nightWindow(now);
    const candidates = voteCandidates(tonight.items, window, locale);
    const night = localDate(Date.parse(window.dusk), timezone);
    const week = weekOf(night);
    const dateOf = (date: string, options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(intl, { timeZone: "UTC", ...options }).format(
        new Date(`${date}T00:00:00Z`),
      );
    const clock = (iso: string) =>
      new Intl.DateTimeFormat(intl, {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date(iso));
    const end = addDays(week, 6);
    const weekLabel =
      week.slice(5, 7) === end.slice(5, 7)
        ? `${dateOf(week, { day: "numeric" })}–${dateOf(end, { day: "numeric", month: "long" })}`
        : `${dateOf(week, { day: "numeric", month: "long" })} – ${dateOf(end, { day: "numeric", month: "long" })}`;
    const cast = candidates.reduce((sum, c) => sum + c.votes, 0);
    // Before the decision the page leads with what would win now: most votes, else highest.
    const lead =
      candidates.reduce<(typeof candidates)[number] | null>(
        (best, c) => (!best || c.votes > best.votes ? c : best),
        null,
      ) ?? null;
    const plate = lead ? plateOf(lead.target.solarSystemBody) : null;
    const lockDay = dateOf(end, { weekday: "long" });

    body = (
      <>
        <section className="vote-section vote-block" aria-labelledby="vote-chapter-title">
          <header className="vote-chapter">
            <h2 id="vote-chapter-title">{copy.chapter(weekLabel)}</h2>
            <span className="vote-chapter-rule" aria-hidden="true" />
            <span className="vote-chapter-aside">{copy.cast(cast)}</span>
          </header>
          {candidates.length === 0 ? (
            <p className="vote-note">{copy.none}</p>
          ) : (
            <Ballot
              candidates={candidates}
              timezone={timezone}
              locale={locale}
              copy={copy.ballot}
              open={false}
            />
          )}
        </section>

        <section className="vote-poster" aria-labelledby="vote-poster-title">
          <div className="vote-poster-grid">
            <div className="vote-poster-copy">
              <p className="kicker">
                {lead ? (cast ? copy.poster.leading : copy.poster.highest) : copy.title}
              </p>
              <h2 id="vote-poster-title" className="vote-lead-title">
                {lead ? lead.name : copy.poster.quiet}
              </h2>
              <p className="vote-poster-sub">
                {lead ? copy.poster.lockOn(lockDay) : copy.poster.nothing}
              </p>
            </div>
            {lead && (
              <dl className="vote-facts">
                <div>
                  <dt>{copy.facts.highest}</dt>
                  <dd>{Math.round(lead.altitudeDeg)}°</dd>
                </div>
                <div>
                  <dt>{copy.facts.at}</dt>
                  <dd>{clock(lead.at)}</dd>
                </div>
                {cast > 0 && (
                  <div>
                    <dt>{copy.facts.votes}</dt>
                    <dd>{copy.facts.of(lead.votes, cast)}</dd>
                  </div>
                )}
              </dl>
            )}
            {lead && (
              <figure className={`vote-poster-object vote-card-${targetVisual(lead.target)}`}>
                <Link
                  href={`/${locale}/app/missions/${lead.target.slug}`}
                  className="vote-poster-photo"
                  aria-label={copy.ballot.targetPage(lead.name)}
                >
                  {plate && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={plate} alt="" />
                  )}
                </Link>
                <figcaption>{copy.poster.illustration}</figcaption>
              </figure>
            )}
          </div>
        </section>

        {candidates.length > 0 && (
          <section className="vote-section" aria-labelledby="vote-sky-title">
            <header className="vote-chapter">
              <h2 id="vote-sky-title">
                {copy.sky(dateOf(night, { day: "numeric", month: "long" }))}
              </h2>
              <span className="vote-chapter-rule" aria-hidden="true" />
              <span className="vote-chapter-aside">
                {clock(window.dusk)} – {clock(window.dawn)}
              </span>
            </header>
            <TonightSkyChart
              window={window}
              candidates={candidates}
              lead={lead?.target.id ?? null}
              timezone={timezone}
              now={now}
              locale={locale}
              copy={copy.chart}
            />
          </section>
        )}
      </>
    );
  }

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <main id="main-content" className="vote-page">
        <h1 className="sr-only">{copy.title}</h1>
        {body}
      </main>
      <SiteFooter footer={dictionary.footer} locale={locale} path="vote" />
    </div>
  );
}
