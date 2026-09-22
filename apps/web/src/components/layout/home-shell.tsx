import { CollectionFrame } from "@/components/astronomy/collection-frame";
import { OpticalRing } from "@/components/astronomy/optical-ring";
import { TargetCard } from "@/components/astronomy/target-card";
import { SectionHeading } from "@/components/layout/section-heading";
import { HeroObservatoryVisual } from "@/components/observatory/hero-observatory-visual";
import { LiveIndicator } from "@/components/observatory/live-indicator";
import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  liveObservatorySnapshot,
  observatoryNodes,
  privateSessionDurations,
} from "@/features/observatory/homepage-data";
import { collectionFrames, homepageTargets } from "@/features/targets/homepage-data";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
};

export function HomeShell({ content }: HomeShellProps) {
  return (
    <main id="main-content" className="public-home">
      <section className="home-hero" aria-labelledby="home-title">
        <Container className="home-hero-grid">
          <div className="home-hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true" />
              {content.hero.eyebrow}
            </p>
            <h1 id="home-title">{content.hero.title}</h1>
            <p>{content.hero.description}</p>
            <div className="home-hero-actions">
              <ButtonLink href="#tonight" size="large">
                {content.hero.primaryCta}
              </ButtonLink>
              <ButtonLink href="#live" size="large" variant="secondary">
                {content.hero.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <HeroObservatoryVisual content={content.hero} demoLabel={content.demoLabel} />
        </Container>
      </section>

      <section
        className="home-section live-section"
        id="live"
        aria-labelledby="live-title"
      >
        <Container>
          <SectionHeading {...content.live} id="live-title" />
          <div className="live-console">
            <header>
              <div>
                <span>{content.demoLabel}</span>
                <h3>{content.live.observatoryName}</h3>
              </div>
              <div className="live-console-state">
                <LiveIndicator active={false} label={content.common.liveLabel} />
                <ObservatoryStatus
                  status={liveObservatorySnapshot.status}
                  label={content.common.observatoryOnline}
                />
              </div>
            </header>
            <div className="live-console-grid">
              <div className="live-target-orbit" aria-hidden="true">
                <OpticalRing size="large" active />
                <span className="saturn-mark">
                  <i />
                </span>
              </div>
              <dl>
                <div>
                  <dt>{content.common.currentTarget}</dt>
                  <dd>{content.live.targetName}</dd>
                </div>
                <div>
                  <dt>{content.common.currentMission}</dt>
                  <dd>{content.live.currentMission}</dd>
                </div>
                <div>
                  <dt>{content.common.telescope}</dt>
                  <dd>{content.live.telescopeState}</dd>
                </div>
                <div>
                  <dt>{content.common.approximateViewers}</dt>
                  <dd>~{liveObservatorySnapshot.viewerCount}</dd>
                </div>
              </dl>
            </div>
            <footer>
              <span>{content.demoLabel}</span>
              <ButtonLink href="#live" variant="secondary">
                {content.common.watchLive}
              </ButtonLink>
            </footer>
          </div>
        </Container>
      </section>

      <section
        className="home-section tonight-section"
        id="tonight"
        aria-labelledby="tonight-title"
      >
        <Container>
          <SectionHeading {...content.tonight} id="tonight-title" />
          <p className="section-data-note">{content.tonight.scheduleNote}</p>
          <div className="target-grid">
            {homepageTargets.map((target) => (
              <TargetCard
                key={target.id}
                target={target}
                content={content.tonight.targets[target.id]}
                common={content.common}
              />
            ))}
          </div>
        </Container>
      </section>

      <section
        className="home-section process-section"
        id="about"
        aria-labelledby="process-title"
      >
        <Container>
          <SectionHeading {...content.howItWorks} id="process-title" />
          <ol className="process-list">
            {content.howItWorks.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section
        className="home-section real-observatory-section"
        id="observatory"
        aria-labelledby="observatory-title"
      >
        <Container>
          <SectionHeading {...content.realObservatory} id="observatory-title" />
          <div className="observatory-feature">
            <div className="observatory-blueprint" aria-hidden="true">
              <span className="blueprint-dome" />
              <span className="blueprint-base" />
              <span className="blueprint-axis" />
              <OpticalRing size="medium" />
            </div>
            <div className="observatory-details">
              <p>{content.realObservatory.statement}</p>
              <dl>
                <div>
                  <dt>{content.realObservatory.locationLabel}</dt>
                  <dd>{content.realObservatory.location}</dd>
                </div>
                <div>
                  <dt>{content.realObservatory.cameraLabel}</dt>
                  <dd>{content.realObservatory.camera}</dd>
                </div>
                <div>
                  <dt>{content.realObservatory.operationLabel}</dt>
                  <dd>{content.realObservatory.operation}</dd>
                </div>
                <div>
                  <dt>{content.realObservatory.telescopeLabel}</dt>
                  <dd>{content.realObservatory.telescope}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="home-section collection-section"
        id="collection"
        aria-labelledby="collection-title"
      >
        <Container>
          <SectionHeading {...content.collection} id="collection-title" />
          <div className="collection-statement">
            <p>{content.collection.statement}</p>
            <span>{content.collection.disclaimer}</span>
          </div>
          <div className="collection-grid">
            {collectionFrames.map((frame) => (
              <CollectionFrame
                key={frame.id}
                id={frame.id}
                visual={frame.visual}
                name={content.collection.frames[frame.id].name}
                catalog={content.collection.frames[frame.id].catalog}
                demoLabel={content.demoLabel}
              />
            ))}
          </div>
        </Container>
      </section>

      <section
        className="home-section network-section"
        id="network"
        aria-labelledby="network-title"
      >
        <Container>
          <SectionHeading {...content.network} id="network-title" />
          <div className="network-track">
            {observatoryNodes.map((node) => (
              <article key={node.id} className="network-node">
                <div className="network-node-mark" aria-hidden="true">
                  <span />
                </div>
                <div>
                  <span>{content.demoLabel}</span>
                  <h3>{content.network.observatoryName}</h3>
                  <p>{content.network.location}</p>
                </div>
                <div>
                  <ObservatoryStatus status="ONLINE" label={content.network.active} />
                  <p>{content.network.descriptionLine}</p>
                </div>
              </article>
            ))}
            <p className="network-future-note">{content.network.futureNote}</p>
          </div>
        </Container>
      </section>

      <section
        className="home-section private-section"
        id="private-observatory"
        aria-labelledby="private-title"
      >
        <Container>
          <SectionHeading {...content.privateObservatory} id="private-title" />
          <div className="session-list">
            {privateSessionDurations.map((duration) => (
              <article key={duration} className="session-option">
                <span>{content.privateObservatory.sessionLabel}</span>
                <strong>
                  {duration} {content.common.minutes}
                </strong>
                <p>{content.privateObservatory.sessionDescription}</p>
                <small>{content.privateObservatory.availability}</small>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="final-cta" id="final-cta" aria-labelledby="final-cta-title">
        <Container>
          <p>{content.finalCta.eyebrow}</p>
          <h2 id="final-cta-title">{content.finalCta.title}</h2>
          <span>{content.finalCta.description}</span>
          <ButtonLink href="#tonight" size="large">
            {content.finalCta.action}
          </ButtonLink>
        </Container>
      </section>
    </main>
  );
}
