import Link from "next/link";
import type { CSSProperties } from "react";

import { TonightNotices } from "@/components/astronomy/tonight-notices";
import { CountUp } from "@/components/home/count-up";
import { MagneticLink } from "@/components/home/magnetic-link";
import { RevealRoot } from "@/components/home/reveal";
import { TargetRail } from "@/components/home/target-rail";
import { ModeNotice } from "@/components/observatory/mode-notice";
import { linkTone, weatherTone } from "@/components/status/status-page";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import type { ObservatoryPanelResult } from "@/features/home/read";
import { privateSessionDurations } from "@/features/observatory/homepage-data";
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

/** A section's opening: kicker, a title that rises out of its mask, and a lede. */
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
      <p className="home-kicker" data-reveal="rise">
        {eyebrow}
      </p>
      <h2 id={id} className="home-display" data-reveal="mask">
        <span>{title}</span>
      </h2>
      {description && (
        <p className="home-lede" data-reveal="rise">
          {description}
        </p>
      )}
    </header>
  );
}

export function HomeShell({ content, locale, panel, tonight }: HomeShellProps) {
  const words = statusCopy[locale];
  const observatoryCopy = observatoryPageCopy[locale];
  const instrument = content.instrument;
  const telescope = panel.kind === "ok" ? panel.observatory.telescope : null;

  return (
    <RevealRoot className="public-home">
      <section className="home-band home-steps" id="about" aria-labelledby="steps-title">
        <Container>
          <Heading id="steps-title" {...content.howItWorks} />
          <ol className="home-step-list">
            {content.howItWorks.steps.map((step, index) => (
              <li
                key={step.title}
                data-reveal="rise"
                style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
              >
                <span className="home-step-rule" aria-hidden="true" />
                <span className="home-numeral" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section
        className="home-band home-tonight"
        id="tonight"
        aria-labelledby="tonight-title"
      >
        <Container>
          <Heading id="tonight-title" {...content.tonight} />
          <div className="home-tonight-notices">
            <TonightNotices result={tonight} locale={locale} />
          </div>
        </Container>
        {tonight.kind === "ok" && tonight.items.length > 0 && (
          <div data-reveal="rise">
            <TargetRail
              items={tonight.items}
              timezone={tonight.observatory.timezone}
              locale={locale}
              common={content.common}
              copy={content.tonight}
            />
          </div>
        )}
        <Container>
          <p className="home-note">{content.tonight.scheduleNote}</p>
        </Container>
      </section>

      <section
        className="home-band home-instrument"
        id="live"
        aria-labelledby="instrument-title"
      >
        <Container className="home-instrument-grid">
          <div>
            <Heading id="instrument-title" {...instrument} />
            <dl className="home-stats">
              {telescope && (
                <>
                  <div data-reveal="rise">
                    <dt>{instrument.aperture}</dt>
                    <dd>
                      <CountUp value={telescope.apertureMm} />
                      <small>{instrument.millimetres}</small>
                    </dd>
                  </div>
                  <div
                    data-reveal="rise"
                    style={{ "--reveal-delay": "100ms" } as CSSProperties}
                  >
                    <dt>{instrument.focalLength}</dt>
                    <dd>
                      <CountUp value={telescope.focalLengthMm} />
                      <small>{instrument.millimetres}</small>
                    </dd>
                  </div>
                  <div
                    data-reveal="rise"
                    style={{ "--reveal-delay": "200ms" } as CSSProperties}
                  >
                    <dt>{instrument.focalRatio}</dt>
                    <dd>
                      <CountUp
                        prefix="f/"
                        value={telescope.focalLengthMm / telescope.apertureMm}
                      />
                    </dd>
                  </div>
                </>
              )}
              <div
                data-reveal="rise"
                style={{ "--reveal-delay": "300ms" } as CSSProperties}
              >
                <dt>{instrument.camera}</dt>
                <dd className="home-stat-text">
                  {instrument.cameraValue}
                  <small>{instrument.cameraNote}</small>
                </dd>
              </div>
            </dl>
            {telescope && (
              <p className="home-note">
                {telescope.manufacturer} {telescope.model}
              </p>
            )}
          </div>

          <aside
            className="home-status"
            aria-labelledby="home-status-title"
            data-reveal="rise"
          >
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
        <div className="home-final-sky" aria-hidden="true" />
        <Container className="home-final-inner">
          <p className="home-kicker" data-reveal="rise">
            {content.finalCta.eyebrow}
          </p>
          <h2 id="final-cta-title" className="home-display" data-reveal="mask">
            <span>{content.finalCta.title}</span>
          </h2>
          <p className="home-lede" data-reveal="rise">
            {content.finalCta.description}
          </p>
          <div className="home-final-actions" data-reveal="rise">
            <MagneticLink className="home-pill" href={`/${locale}/app/book`}>
              {content.finalCta.action}
            </MagneticLink>
            <MagneticLink className="home-pill home-pill-quiet" href="#tonight">
              {content.finalCta.secondary}
            </MagneticLink>
          </div>
          <div className="home-private" data-reveal="rise">
            <strong>{content.finalCta.privateTitle}</strong>
            <ul>
              {privateSessionDurations.map((duration) => (
                <li key={duration}>
                  {duration} {content.common.minutes}
                </li>
              ))}
            </ul>
            <p>{content.finalCta.privateNote}</p>
          </div>
          <p className="home-final-caption">{content.hero.illustration}</p>
        </Container>
      </section>
    </RevealRoot>
  );
}
