import type { StepStatus } from "@/features/missions/room";

type MissionStepsProps = {
  /** The heading's id; unique on the page. */
  id?: string;
  title: string;
  names: readonly string[];
  statuses: readonly StepStatus[];
  /** "Step 3 of 5", already filled. */
  position: string;
  stopped: string;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

/** The room's five steps (ADR-027 §4): done, current, stopped or still ahead. */
export function MissionSteps({
  id = "mission-steps-title",
  names,
  position,
  statuses,
  stopped,
  title,
}: MissionStepsProps) {
  return (
    <section className="mission-steps" aria-labelledby={id}>
      <header>
        <h2 id={id}>{title}</h2>
        <p>{position}</p>
      </header>
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
              <span className="mission-step-dot">
                {status === "done" ? <CheckIcon /> : `0${index + 1}`}
              </span>
              <span className="mission-step-name">{name}</span>
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
