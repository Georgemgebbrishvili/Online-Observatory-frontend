import Link from "next/link";

import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import { ButtonLink } from "@/components/ui/button";
import {
  missionOperations,
  observatories,
  observatorySafetyChecks,
} from "@/features/observatory/observatories";
import type { Locale } from "@/i18n/config";
import { observatoryPageCopy } from "@/i18n/resources/observatory";

type ObservatoryPageProps = {
  locale: Locale;
};

export function ObservatoryPage({ locale }: ObservatoryPageProps) {
  const copy = observatoryPageCopy[locale];
  const observatory = observatories[0];

  return (
    <main id="main-content" className="observatory-page">
      <section className="observatory-page-hero" aria-labelledby="observatory-page-title">
        <div className="observatory-page-hero-copy">
          <p>{copy.eyebrow}</p>
          <h1 id="observatory-page-title">{observatory.name[locale]}</h1>
          <strong>{observatory.location[locale]}</strong>
          <blockquote>{copy.statement}</blockquote>
          <ButtonLink href={`/${locale}/app/missions`} size="large">
            {copy.explore}
          </ButtonLink>
        </div>
        <div className="observatory-telescope-visual" aria-hidden="true">
          <div className="observatory-visual-grid" />
          <span className="observatory-telescope-tube" />
          <span className="observatory-telescope-corrector" />
          <span className="observatory-telescope-arm" />
          <span className="observatory-telescope-base" />
          <i className="observatory-visual-axis" />
          <small>{copy.visualPath}</small>
        </div>
      </section>

      <section
        className="observatory-status-panel"
        aria-labelledby="observatory-status-title"
      >
        <header>
          <div>
            <span>01</span>
            <h2 id="observatory-status-title">{copy.status}</h2>
          </div>
          <ObservatoryStatus status={observatory.status} label={copy.online} />
        </header>
        <div className="observatory-status-content">
          <div>
            <strong>{copy.statusMode}</strong>
            <p>{copy.statusExplanation}</p>
          </div>
          <dl>
            <div>
              <dt>{copy.localControl}</dt>
              <dd>{copy.localControlValue}</dd>
            </div>
            <div>
              <dt>{copy.readiness}</dt>
              <dd>{copy.readinessValue}</dd>
            </div>
            <div>
              <dt>{copy.coordinates}</dt>
              <dd>
                {observatory.coordinates.latitude}° {copy.north} ·{" "}
                {observatory.coordinates.longitude}° {copy.east}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="observatory-equipment"
        aria-label={`${copy.telescope} · ${copy.camera}`}
      >
        <article>
          <header>
            <div>
              <span>02</span>
              <h2>{copy.telescope}</h2>
            </div>
            <small>{copy.expected}</small>
          </header>
          <div className="equipment-name">
            <p>{observatory.telescope.manufacturer}</p>
            <h3>{observatory.telescope.model}</h3>
          </div>
          <dl>
            <div>
              <dt>{copy.opticalDesign}</dt>
              <dd>{observatory.telescope.type[locale]}</dd>
            </div>
            <div>
              <dt>{copy.aperture}</dt>
              <dd>{observatory.telescope.aperture}</dd>
            </div>
            <div>
              <dt>{copy.focalLength}</dt>
              <dd>{observatory.telescope.focalLength}</dd>
            </div>
            <div>
              <dt>{copy.mount}</dt>
              <dd>{observatory.telescope.mount[locale]}</dd>
            </div>
          </dl>
        </article>

        <article>
          <header>
            <div>
              <span>03</span>
              <h2>{copy.camera}</h2>
            </div>
            <small>{copy.configurable}</small>
          </header>
          <div className="equipment-name equipment-name-camera">
            <span aria-hidden="true" />
            <h3>{observatory.camera.type[locale]}</h3>
            <p>{copy.pendingCamera}</p>
          </div>
          <dl>
            <div>
              <dt>{copy.manufacturer}</dt>
              <dd>{observatory.camera.manufacturer ?? "—"}</dd>
            </div>
            <div>
              <dt>{copy.model}</dt>
              <dd>{observatory.camera.model ?? "—"}</dd>
            </div>
            <div>
              <dt>{copy.cooling}</dt>
              <dd>{observatory.camera.cooling[locale]}</dd>
            </div>
            <div>
              <dt>{copy.connection}</dt>
              <dd>{observatory.camera.connection[locale]}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="observatory-mission-path" aria-labelledby="mission-path-title">
        <header>
          <span>04</span>
          <div>
            <h2 id="mission-path-title">{copy.missionTitle}</h2>
            <p>{copy.missionDescription}</p>
          </div>
        </header>
        <ol>
          {missionOperations.map((operation, index) => (
            <li key={operation.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{operation.label[locale]}</strong>
              {index < missionOperations.length - 1 && <i aria-hidden="true">→</i>}
            </li>
          ))}
        </ol>
      </section>

      <section className="observatory-safety" aria-labelledby="observatory-safety-title">
        <header>
          <span>05</span>
          <h2 id="observatory-safety-title">{copy.safety}</h2>
          <p>{copy.safetyDescription}</p>
        </header>
        <ol>
          {observatorySafetyChecks.map((check, index) => (
            <li key={check.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{check.title[locale]}</h3>
                <p>{check.description[locale]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="observatory-network"
        aria-labelledby="observatory-network-title"
      >
        <header>
          <span>06</span>
          <div>
            <h2 id="observatory-network-title">{copy.futureNetwork}</h2>
            <p>{copy.futureDescription}</p>
          </div>
        </header>
        <div className="observatory-network-track">
          {observatories.map((site) => (
            <article key={site.id}>
              <span className="observatory-network-node" aria-hidden="true" />
              <div>
                <small>{copy.activeSite}</small>
                <h3>{site.name[locale]}</h3>
                <p>{site.location[locale]}</p>
              </div>
              <ObservatoryStatus status={site.status} label={copy.online} />
            </article>
          ))}
          <p>{copy.noPartners}</p>
        </div>
        <Link
          className="button button-secondary button-large"
          href={`/${locale}/network`}
        >
          <span>{copy.networkFoundation}</span>
        </Link>
        <Link className="observatory-back-link" href={`/${locale}`}>
          <span aria-hidden="true">←</span> DARKVIEW
        </Link>
      </section>
    </main>
  );
}
