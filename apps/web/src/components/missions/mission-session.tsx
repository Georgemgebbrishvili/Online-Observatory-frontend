"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { missionFailureStates, missionStates } from "@/features/missions/domain";
import {
  advanceMissionSimulator,
  availableSimulatorFailures,
  createDevelopmentSession,
  injectSimulatorFailure,
  type DevelopmentMissionDefinition,
} from "@/features/missions/simulator";
import type { MissionTarget } from "@/features/missions/targets";
import type { Locale } from "@/i18n/config";
import { missionSessionCopy } from "@/i18n/resources/missions";

type MissionSessionProps = {
  definition: DevelopmentMissionDefinition;
  locale: Locale;
  target: MissionTarget;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 8.2 2.8 2.7 6.2-6.1" />
    </svg>
  );
}

function formatEventTime(value: string) {
  return value.slice(11, 16);
}

export function MissionSessionView({ definition, locale, target }: MissionSessionProps) {
  const [session, setSession] = useState(() => createDevelopmentSession(definition));
  const [autoRun, setAutoRun] = useState(false);
  const copy = missionSessionCopy[locale];
  const state = session.mission.state;
  const targetName = locale === "ka" ? target.georgianName : target.commonName;
  const stateCopy = copy.states[state];
  const presentation = {
    title: stateCopy.title.replace("{target}", targetName),
    description: stateCopy.description.replace("{target}", targetName),
    event: stateCopy.event.replace("{target}", targetName),
  };
  const currentStep = missionStates.indexOf(state as (typeof missionStates)[number]);
  const lastNominalState = [...session.events]
    .reverse()
    .find((event) =>
      missionStates.includes(event.state as (typeof missionStates)[number]),
    )?.state;
  const progressStep = Math.max(
    0,
    currentStep >= 0
      ? currentStep
      : missionStates.indexOf(lastNominalState as (typeof missionStates)[number]),
  );
  const failureOptions = availableSimulatorFailures(state);
  const isTerminal =
    state === "COMPLETE" ||
    missionFailureStates.includes(state as (typeof missionFailureStates)[number]);
  const isAutoRunning = autoRun && !isTerminal;

  useEffect(() => {
    if (!isAutoRunning) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSession((current) => advanceMissionSimulator(current, new Date().toISOString()));
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isAutoRunning, state]);

  function resetSimulator() {
    setAutoRun(false);
    setSession(createDevelopmentSession(definition));
  }

  function injectFailure(failure: string) {
    if (!failure) return;
    setAutoRun(false);
    setSession((current) =>
      injectSimulatorFailure(
        current,
        failure as (typeof missionFailureStates)[number],
        new Date().toISOString(),
      ),
    );
  }

  return (
    <article className="session-page">
      <header className="session-topbar">
        <Link href={`/${locale}/app/missions/${target.slug}`}>
          <span aria-hidden="true">←</span> {copy.back}
        </Link>
        <div className="simulator-identity" role="status">
          <strong>{copy.simulatorLabel}</strong>
          <span>{copy.simulatorNote}</span>
        </div>
      </header>

      <div className="session-layout">
        <section className="session-stage" aria-labelledby="session-state-title">
          <div className="session-mission-meta">
            <span>
              {copy.mission} · {session.mission.id}
            </span>
            <strong>{targetName}</strong>
          </div>

          <div
            key={state}
            className="session-state-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            {state === "OBSERVING" && (
              <span className="session-live-label">{copy.live}</span>
            )}
            <h1 id="session-state-title">{presentation.title}</h1>
            <p>{presentation.description}</p>
          </div>

          {state === "PREPARING" && (
            <ul className="session-checks">
              {copy.checks.map((check) => (
                <li key={check}>
                  <CheckIcon />
                  {check.replace("{target}", targetName)}
                </li>
              ))}
            </ul>
          )}

          <div
            className="session-optics"
            data-state={state}
            data-progress={progressStep}
            role="img"
            aria-label={`${copy.progress}: ${presentation.title}`}
          >
            <span className="session-optical-grid" aria-hidden="true" />
            <span className="session-ring session-ring-outer" aria-hidden="true" />
            <span className="session-ring session-ring-middle" aria-hidden="true" />
            <span className="session-ring session-ring-inner" aria-hidden="true" />
            <span
              className="session-alignment-axis session-axis-horizontal"
              aria-hidden="true"
            />
            <span
              className="session-alignment-axis session-axis-vertical"
              aria-hidden="true"
            />
            <span className="session-target-point" aria-hidden="true">
              <i />
            </span>
            <span className="session-optics-state">{presentation.title}</span>
            <span className="session-simulator-watermark">{copy.simulatorLabel}</span>
          </div>

          <ol className="session-progress" aria-label={copy.progress}>
            {missionStates.map((missionState, index) => (
              <li
                key={missionState}
                data-complete={index < progressStep || undefined}
                data-current={missionState === state || undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <small>{copy.states[missionState].short}</small>
              </li>
            ))}
          </ol>
        </section>

        <aside className="session-sidebar">
          <section
            className="simulator-controls"
            aria-labelledby="simulator-controls-title"
          >
            <div>
              <span>{copy.simulatorLabel}</span>
              <h2 id="simulator-controls-title">{copy.simulatorControls}</h2>
            </div>
            <div className="simulator-actions">
              <button
                className="button button-primary button-medium"
                type="button"
                disabled={isTerminal}
                onClick={() =>
                  setSession((current) =>
                    advanceMissionSimulator(current, new Date().toISOString()),
                  )
                }
              >
                <span>{copy.advance}</span>
              </button>
              <button
                className="button button-secondary button-medium"
                type="button"
                disabled={isTerminal}
                aria-pressed={isAutoRunning}
                onClick={() => setAutoRun((running) => !running)}
              >
                <span>{isAutoRunning ? copy.pause : copy.run}</span>
              </button>
              <button
                className="button button-ghost button-medium"
                type="button"
                onClick={resetSimulator}
              >
                <span>{copy.reset}</span>
              </button>
            </div>
            <label className="simulator-failure-control">
              <span>{copy.injectFailure}</span>
              <select
                value=""
                disabled={failureOptions.length === 0}
                onChange={(event) => injectFailure(event.target.value)}
              >
                <option value="">{copy.selectFailure}</option>
                {failureOptions.map((failure) => (
                  <option key={failure} value={failure}>
                    {copy.states[failure].title.replace("{target}", targetName)}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="mission-event-panel" aria-labelledby="event-history-title">
            <header>
              <h2 id="event-history-title">{copy.eventHistory}</h2>
              <p>{copy.eventDescription}</p>
            </header>
            <ol>
              {[...session.events].reverse().map((event, index) => (
                <li key={event.id} data-current={index === 0 || undefined}>
                  <span className="event-history-marker" aria-hidden="true" />
                  <div>
                    <time dateTime={event.occurredAt}>
                      {formatEventTime(event.occurredAt)}
                    </time>
                    <strong>
                      {copy.states[event.state].event.replace("{target}", targetName)}
                    </strong>
                    <small>
                      {copy.simulatorSource} ·{" "}
                      {copy.states[event.state].title.replace("{target}", targetName)}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </article>
  );
}
