import type { StepStatus } from "@/features/missions/room";

import { PanelHead } from "./panel-head";

type MissionStepsProps = {
  /** The heading's id; unique on the page. */
  id?: string;
  title: string;
  names: readonly string[];
  statuses: readonly StepStatus[];
  /** "Step 3 of 5", already filled. */
  position: string;
  /** The current step's sub-label. */
  now: string;
  stopped: string;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

/**
 * The room's five steps (ADR-027 §4), as the console's tracker: numbered circles joined
 * by a line, done steps checked, the current one ringed. A failure or hold stops the
 * flow at the step reached and is named there, never as a step of its own.
 */
export function MissionSteps({
  id = "mission-steps-title",
  names,
  now,
  position,
  statuses,
  stopped,
  title,
}: MissionStepsProps) {
  return (
    <section className="mission-steps" aria-labelledby={id}>
      <PanelHead id={id} icon="progress" title={title} meta={position} />
      <ol>
        {names.map((name, index) => {
          const status = statuses[index] ?? "pending";
          return (
            <li
              key={name}
              data-status={status}
              aria-current={
                status === "current" || status === "stopped" ? "step" : undefined
              }
            >
              <span className="mission-step-dot" aria-hidden="true">
                {status === "done" ? <CheckIcon /> : `0${index + 1}`}
              </span>
              <span className="mission-step-name">{name}</span>
              {status === "current" && <span className="mission-step-note">{now}</span>}
              {status === "stopped" && (
                <span className="mission-step-note">{stopped}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
