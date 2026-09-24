import Image from "next/image";
import Link from "next/link";

import { LiveIndicator } from "@/components/observatory/live-indicator";
import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import { getHomeDashboard } from "@/features/home/dashboard";
import type { MissionTarget } from "@/features/missions/targets";
import type { Locale } from "@/i18n/config";
import { authenticatedHomeCopy } from "@/i18n/resources/authenticated-home";
import { missionBrowserCopy } from "@/i18n/resources/missions";

type AuthenticatedHomeProps = {
  locale: Locale;
};

function targetName(target: MissionTarget, locale: Locale) {
  return locale === "ka" ? target.georgianName : target.commonName;
}

export function AuthenticatedHome({ locale }: AuthenticatedHomeProps) {
  const dashboard = getHomeDashboard();
  const copy = authenticatedHomeCopy[locale];
  const tonightName = targetName(dashboard.tonight, locale);

  return (
    <div className="authenticated-home">
      <header className="home-dashboard-header">
        <div>
          <p className="home-dashboard-kicker">STELLAR · {copy.location}</p>
          <h1>{copy.greeting(dashboard.profile.firstName[locale])}</h1>
        </div>
        <p>{copy.introduction}</p>
      </header>

      <div className="home-dashboard-grid">
        <section className="home-tonight" aria-labelledby="home-tonight-title">
          <Image
            src="/captures/saturn-dv-0001.svg"
            alt=""
            fill
            preload
            sizes="(min-width: 1200px) 60vw, 100vw"
            unoptimized
          />
          <span className="home-tonight-shade" aria-hidden="true" />
          <span className="home-tonight-orbit" aria-hidden="true" />
          <div className="home-tonight-copy">
            <div className="home-section-label">
              <span>{copy.tonight}</span>
              <strong>{copy.excellent}</strong>
            </div>
            <h2 id="home-tonight-title">{copy.recommendation(tonightName)}</h2>
            <p>{copy.recommendationDescription}</p>
            <dl>
              <div>
                <dt>{copy.bestWindow}</dt>
                <dd>{dashboard.tonight.currentVisibility.window}</dd>
              </div>
              <div>
                <dt>{copy.altitude}</dt>
                <dd>{dashboard.tonight.currentVisibility.altitude}°</dd>
              </div>
            </dl>
            <div className="home-tonight-actions">
              <Link
                className="button button-primary button-large"
                href={`/${locale}/app/missions/${dashboard.tonight.slug}`}
              >
                <span>{copy.observe(tonightName)}</span>
              </Link>
              <Link className="home-text-link" href={`/${locale}/app/missions`}>
                {copy.exploreTonight} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <aside className="home-observatory" aria-labelledby="home-observatory-title">
          <div className="home-observatory-optics" aria-hidden="true">
            <span />
            <span />
            <i />
          </div>
          <div className="home-section-label">
            <h2 id="home-observatory-title" className="home-label-heading">
              {copy.observatory}
            </h2>
            <ObservatoryStatus status="ONLINE" label={copy.online} />
          </div>
          <div className="home-observatory-copy">
            <h3>{dashboard.observatory.name[locale]}</h3>
            <p>{copy.clear}</p>
          </div>
          <dl>
            <div>
              <dt>{copy.locationLabel}</dt>
              <dd>{copy.coordinates}</dd>
            </div>
            <div>
              <dt>{copy.telescope}</dt>
              <dd>{copy.telescopeValue}</dd>
            </div>
          </dl>
        </aside>

        {dashboard.liveObservation && (
          <section className="home-live" aria-labelledby="home-live-title">
            <div className="home-live-visual" aria-hidden="true">
              <span />
              <i />
              <b />
            </div>
            <div className="home-live-copy">
              <div className="home-section-label">
                <h2 id="home-live-title" className="home-label-heading">
                  {copy.liveNow}
                </h2>
                <LiveIndicator active={false} label={copy.liveBadge} />
              </div>
              <p>{copy.publicObservation}</p>
              <h3>{dashboard.liveObservation.target[locale]}</h3>
              <dl>
                <div>
                  <dt>{copy.by}</dt>
                  <dd>{dashboard.liveObservation.missionOwner}</dd>
                </div>
                <div>
                  <dt>{copy.viewers}</dt>
                  <dd>{dashboard.liveObservation.viewerCount}</dd>
                </div>
              </dl>
              <Link
                className="button button-secondary"
                href={`/${locale}/app/missions/${dashboard.liveObservation.missionId}/watch`}
              >
                <span>{copy.watchLive}</span>
              </Link>
            </div>
          </section>
        )}

        <section className="home-upcoming" aria-labelledby="home-upcoming-title">
          <div className="home-section-label">
            <h2 id="home-upcoming-title" className="home-label-heading">
              {copy.upcoming}
            </h2>
            <small>{copy.simulated}</small>
          </div>
          <div className="home-upcoming-list">
            {dashboard.upcomingMissions.map((mission, index) => (
              <article key={mission.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>{mission.schedule[locale]}</p>
                  <h3>{targetName(mission.target, locale)}</h3>
                  <small>
                    {copy.scheduled} · {mission.target.preferredObservationDuration}{" "}
                    {copy.minutes}
                  </small>
                </div>
                <Link
                  href={`/${locale}/app/missions/${mission.targetSlug}`}
                  aria-label={`${copy.viewMission}: ${targetName(mission.target, locale)}`}
                >
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="home-explore" aria-labelledby="home-explore-title">
        <header>
          <div>
            <span>03</span>
            <h2 id="home-explore-title">{copy.continueExploring}</h2>
          </div>
          <p>{copy.continueDescription}</p>
        </header>
        <div className="home-explore-grid">
          {dashboard.continueExploring.map((target) => (
            <article key={target.id} className="home-explore-card">
              <Link
                className={`mission-target-visual mission-target-visual-${target.imagePreset}`}
                href={`/${locale}/app/missions/${target.slug}`}
                aria-label={`${copy.discover}: ${targetName(target, locale)}`}
              >
                <i />
                <b />
              </Link>
              <div>
                <p>
                  {target.catalogId} · {missionBrowserCopy[locale].types[target.type]}
                </p>
                <h3>{targetName(target, locale)}</h3>
                <span>
                  {target.currentVisibility.window} · {target.currentVisibility.altitude}°
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="home-collection-progress"
        aria-labelledby="home-collection-title"
      >
        <div className="home-collection-intro">
          <span>04</span>
          <h2 id="home-collection-title">{copy.collection}</h2>
          <p>{copy.collectionDescription}</p>
          <Link className="home-text-link" href={`/${locale}/app/collection`}>
            {copy.openCollection} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <dl className="home-collection-counts">
          <div>
            <dd>{dashboard.collection.observationsCompleted}</dd>
            <dt>{copy.observations}</dt>
          </div>
          <div>
            <dd>{dashboard.collection.uniqueObjects}</dd>
            <dt>{copy.unique}</dt>
          </div>
        </dl>
        <div className="home-recent-captures">
          <span>{copy.recent}</span>
          <div>
            {dashboard.collection.recentCaptures.map((capture) => (
              <Link
                key={capture.id}
                href={`/${locale}/app/collection/${capture.id}`}
                aria-label={capture.target[locale]}
              >
                <Image src={capture.thumbnailUrl} alt="" fill sizes="8rem" unoptimized />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
