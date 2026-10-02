import type { ReactNode } from "react";

export type FlightStep = {
  title: string;
  description: string;
  /** Where the step stands today; omitted when the observatory's mode is unknown. */
  status?: string;
};

// Line drawings of the instrument at each step. No reticle, no crosshair (ADR-039).
const icons: ReactNode[] = [
  <>
    <rect x="8" y="11" width="32" height="28" rx="3" />
    <path d="M8 19h32M16 7v8M32 7v8" />
    <path d="M18 29l4 4 8-8" />
  </>,
  <>
    <path d="M10 22l22-9 3 7-22 9z" />
    <path d="M32 13l3-1.3 3 7-3 1.3" />
    <path d="M22 25.5l-6 14M22 25.5l6 14M22 25.5V40" />
  </>,
  <>
    <rect x="6" y="10" width="36" height="24" rx="3" />
    <path d="M18 40h12M24 34v6" />
    <circle cx="24" cy="22" r="5" />
  </>,
  <>
    <rect x="9" y="7" width="30" height="34" rx="2" />
    <rect x="14" y="12" width="20" height="16" />
    <path d="M14 34h12" />
  </>,
];

/** How a session works, in four steps set side by side between hairlines (ADR-039). */
export function FlightPlan({ steps }: { steps: readonly FlightStep[] }) {
  return (
    <ol className="flight-plan">
      {steps.map((step, index) => (
        <li key={step.title} className="flight-plan-step">
          <span className="flight-plan-icon" aria-hidden="true">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icons[index % icons.length]}
            </svg>
          </span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          {step.status && <span className="flight-plan-status">{step.status}</span>}
        </li>
      ))}
    </ol>
  );
}
