import Link from "next/link";

import { TonightNotices } from "@/components/astronomy/tonight-notices";
import { FlightPlan } from "@/components/home/flight-plan";
import { PosterHero, type HeroStat } from "@/components/home/poster-hero";
import { TonightList } from "@/components/home/tonight-list";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import type { ObservatoryPanelResult } from "@/features/home/read";
import { privateSessionDurations } from "@/features/observatory/homepage-data";
import { homeTonightLimit } from "@/features/targets/homepage-data";
import type { TonightResult } from "@/features/targets/read";
import type { Locale } from "@/i18n/config";
import { observatoryPageCopy } from "@/i18n/resources/observatory";
import { statusCopy } from "@/i18n/resources/status";
import type { Dictionary } from "@/i18n/types";

type HomeShellProps = {
  content: Dictionary["home"];
  locale: Locale;
  tonight: TonightResult;
  panel: ObservatoryPanelResult;
};

/** A section's opening: an orange kicker, an Anton headline and a lede. */
function Heading({
  description,
  eyebrow,
  id,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="home-heading">
      <p className="kicker">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description && <p className="home-lede">{description}</p>}
    </header>
  );
}

export function HomeShell({ content, locale, panel, tonight }: HomeShellProps) {
  const words = statusCopy[locale];
  const observatoryCopy = observatoryPageCopy[locale];
  const instrument = content.instrument;
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;
  const mode =
    panel.kind === "ok"
      ? panel.status.mode
      : tonight.kind === "ok"
        ? tonight.observatory.mode
        : null;

  const stats: HeroStat[] = [];
  if (tonight.kind === "ok") {
    stats.push({
      value: String(tonight.items.filter((item) => item.visibility.observable).length),
      label: content.hero.stats.observableNow,
    });
  }
  if (telescope) {
    stats.push(
      { value: String(telescope.apertureMm), label: content.hero.stats.aperture },
      { value: String(telescope.focalLengthMm), label: content.hero.stats.focalLength },
    );
  } else {
    stats.push({ value: "1", label: content.hero.stats.telescope });
  }

  const steps = content.howItWorks.steps.map((step) => ({
    ...step,
    status: mode
      ? mode === "SIMULATED"
        ? content.howItWorks.status.simulated
        : content.howItWorks.status.real
      : undefined,
  }));

  return (
    <main id="main-content" className="public-home">
      <PosterHero content={content.hero} locale={locale} stats={stats} />

      <section className="home-band" id="about" aria-labelledby="steps-title">
        <Container>
          <Heading id="steps-title" {...content.howItWorks} />
          <FlightPlan steps={steps} />
        </Container>
      </section>

      <section className="home-band" id="tonight" aria-labelledby="tonight-title">
        <Container className="home-split">
          <div>
            <Heading id="tonight-title" {...content.tonight} />
            <p className="home-note">{content.tonight.scheduleNote}</p>
          </div>
          <div className="home-tonight-body">
            <div className="home-notices">
              <TonightNotices result={tonight} locale={locale} />
            </div>
            {tonight.kind === "ok" && tonight.items.length > 0 && (
              <>
                <TonightList
                  items={tonight.items.slice(0, homeTonightLimit)}
                  timezone={tonight.observatory.timezone}
                  locale={locale}
                  common={content.common}
                />
                <ButtonLink
                  href={`/${locale}/app/missions`}
                  variant="secondary"
                  className="home-tonight-all"
                >
                  {content.tonight.all}
                </ButtonLink>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="home-band" id="live" aria-labelledby="instrument-title">
        <Container className="home-split">
          <div>
            <Heading id="instrument-title" {...instrument} />
            <dl className="home-specs">
              {telescope && (
                <>
                  <div>
                    <dt>{instrument.telescope}</dt>
                    <dd>
                      {telescope.manufacturer} {telescope.model}
                    </dd>
                  </div>
                  <div>
                    <dt>{instrument.aperture}</dt>
                    <dd className="home-spec-number">
                      <span>{telescope.apertureMm}</span>
                      <small>{instrument.millimetres}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>{instrument.focalLength}</dt>
                    <dd className="home-spec-number">
                      <span>{telescope.focalLengthMm}</span>
                      <small>{instrument.millimetres}</small>
                    </dd>
                  </div>
                  <div>
                    <dt>{instrument.focalRatio}</dt>
                    <dd className="home-spec-number">
                      {`f/${Math.round(telescope.focalLengthMm / telescope.apertureMm)}`}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt>{instrument.camera}</dt>
                <dd>
                  {instrument.cameraValue}
                  <small>{instrument.cameraNote}</small>
                </dd>
              </div>
              <div>
                <dt>{instrument.mode}</dt>
                <dd>
                  {instrument.modeValue}
                  <small>{instrument.modeNote}</small>
                </dd>
              </div>
              <div>
                <dt>{instrument.location}</dt>
                <dd>{instrument.locationValue}</dd>
              </div>
            </dl>
          </div>

          <aside className="home-status" aria-labelledby="home-status-title">
            <header>
              <h3 id="home-status-title">{observatoryCopy.liveStatus}</h3>
              <Link href={`/${locale}/status`}>
                {observatoryCopy.fullStatus} <span aria-hidden="true">→</span>
              </Link>
            </header>
            {panel.kind === "unreachable" && (
              <StatePanel
                variant="error"
                headingLevel={3}
                {...observatoryCopy.statusUnavailable}
              />
            )}
            {panel.kind === "no-observatory" && (
              <StatePanel headingLevel={3} {...observatoryCopy.noObservatory} />
            )}
            {panel.kind === "ok" && (
              <>
                <ModeNotice
                  mode={panel.status.mode}
                  label={words.mode[panel.status.mode].banner}
                  detail={words.mode[panel.status.mode].detail}
                />
                <dl>
                  <div>
                    <dt>{words.now.link}</dt>
                    <dd>
                      <StatusIndicator
                        label={words.link[panel.status.link]}
                        tone={linkTone[panel.status.link]}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>{words.now.weather}</dt>
                    <dd>
                      <StatusIndicator
                        label={words.weather[panel.status.weather.status]}
                        tone={weatherTone[panel.status.weather.status]}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>{words.now.hold}</dt>
                    <dd>
                      <StatusIndicator
                        label={
                          panel.status.weather.holdActive
                            ? words.now.holdActive
                            : words.now.holdInactive
                        }
                        tone={panel.status.weather.holdActive ? "danger" : "success"}
                      />
                    </dd>
                  </div>
                </dl>
                {panel.status.missionInProgress && (
                  <p className="home-status-mission">
                    {/* A target name only while its owner has opted in (ADR-007). */}
                    {panel.status.currentTargetName
                      ? observatoryCopy.observingNow(panel.status.currentTargetName)
                      : observatoryCopy.missionInProgress}
                  </p>
                )}
              </>
            )}
          </aside>
        </Container>
      </section>

      <section className="home-final" id="final-cta" aria-labelledby="final-cta-title">
        <Container className="home-final-inner">
          <p className="kicker">{content.finalCta.eyebrow}</p>
          <h2 id="final-cta-title">{content.finalCta.title}</h2>
          <p className="home-lede">{content.finalCta.description}</p>
          <div className="home-final-actions">
            <ButtonLink href={`/${locale}/app/book`} size="large">
              {content.finalCta.action}
            </ButtonLink>
            <ButtonLink href="#tonight" variant="secondary" size="large">
              {content.finalCta.secondary}
            </ButtonLink>
          </div>
          <div className="home-private">
            <h3>{content.finalCta.privateTitle}</h3>
            <ul>
              {privateSessionDurations.map((duration) => (
                <li key={duration}>
                  {duration} {content.common.minutes}
                </li>
              ))}
            </ul>
            <p>{content.finalCta.privateNote}</p>
          </div>
        </Container>
      </section>
    </main>
  );
}
