import Link from "next/link";

import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import {
  getNetworkNodeObservatory,
  networkNodes,
  networkReviewStages,
} from "@/features/network/network";
import type { Locale } from "@/i18n/config";
import { networkPageCopy } from "@/i18n/resources/network";

type NetworkPageProps = {
  locale: Locale;
};

export function NetworkPage({ locale }: NetworkPageProps) {
  const copy = networkPageCopy[locale];
  const node = networkNodes[0];
  const observatory = getNetworkNodeObservatory(node)!;

  return (
    <main id="main-content" className="network-page">
      <section className="network-hero" aria-labelledby="network-page-title">
        <div className="network-hero-copy">
          <p>{copy.eyebrow}</p>
          <h1 id="network-page-title">{copy.title}</h1>
          <blockquote>{copy.description}</blockquote>
          <Link
            className="button button-primary button-large"
            href={`/${locale}/observatory`}
          >
            <span>{copy.observatoryLink}</span>
          </Link>
        </div>

        <div className="network-map" role="img" aria-label={copy.mapLabel}>
          <span className="network-map-grid" aria-hidden="true" />
          <span
            className="network-map-orbit network-map-orbit-outer"
            aria-hidden="true"
          />
          <span
            className="network-map-orbit network-map-orbit-inner"
            aria-hidden="true"
          />
          <span
            className="network-map-axis network-map-axis-horizontal"
            aria-hidden="true"
          />
          <span
            className="network-map-axis network-map-axis-vertical"
            aria-hidden="true"
          />
          <span className="network-map-node" aria-hidden="true">
            <i />
          </span>
          <div className="network-map-label">
            <span>41.72° N · 44.79° E</span>
            <strong>{copy.mapSite}</strong>
          </div>
        </div>
      </section>

      <section className="network-current" aria-labelledby="network-current-title">
        <header>
          <div>
            <span>01</span>
            <h2 id="network-current-title">{copy.currentNetwork}</h2>
          </div>
          <strong>{copy.oneActiveNode}</strong>
        </header>

        <article className="network-node-card">
          <div className="network-node-summary">
            <span className="network-node-index">TB / 01</span>
            <small>{copy.approved}</small>
            <h3>{observatory.name[locale]}</h3>
            <p>{observatory.location[locale]}</p>
            <ObservatoryStatus status={observatory.status} label={copy.online} />
          </div>
          <dl>
            <div>
              <dt>{copy.status}</dt>
              <dd>{copy.approved}</dd>
            </div>
            <div>
              <dt>{copy.coordinates}</dt>
              <dd>
                {observatory.coordinates.latitude}° N ·{" "}
                {observatory.coordinates.longitude}° E
              </dd>
            </div>
            <div>
              <dt>{copy.telescope}</dt>
              <dd>{node.primaryTelescope}</dd>
            </div>
            <div>
              <dt>{copy.availability}</dt>
              <dd>{copy.configuredAvailability}</dd>
            </div>
            <div>
              <dt>{copy.capabilities}</dt>
              <dd className="network-capabilities">
                {node.capabilities.map((capability) => (
                  <span key={capability}>{copy.capabilityLabels[capability]}</span>
                ))}
              </dd>
            </div>
          </dl>
        </article>
        <p className="network-no-partners">{copy.noPartners}</p>
      </section>

      <section className="network-review" aria-labelledby="network-review-title">
        <header>
          <p>{copy.reviewEyebrow}</p>
          <h2 id="network-review-title">{copy.reviewTitle}</h2>
          <span>{copy.reviewDescription}</span>
        </header>
        <ol>
          {networkReviewStages.map((stage, index) => (
            <li key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{copy.stages[stage].title}</h3>
                <p>{copy.stages[stage].description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="network-connect" aria-labelledby="network-connect-title">
        <div className="network-connect-copy">
          <p>{copy.connectEyebrow}</p>
          <h2 id="network-connect-title">{copy.connectTitle}</h2>
          <blockquote>{copy.connectDescription}</blockquote>
          <strong>{copy.connectStatus}</strong>
          <span>{copy.connectBoundary}</span>
        </div>
        <aside aria-labelledby="network-foundation-title">
          <h3 id="network-foundation-title">{copy.foundationTitle}</h3>
          <ul>
            {copy.foundationItems.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
