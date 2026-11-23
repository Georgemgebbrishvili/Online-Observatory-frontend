import Link from "next/link";

type HomeStepsProps = {
  steps: readonly { title: string; description: string; href: string }[];
};

/**
 * How a session works (ADR-086): four glass tiles in a row, numbered, each opening the
 * page where that step happens.
 */
export function HomeSteps({ steps }: HomeStepsProps) {
  return (
    <ol className="home-steps">
      {steps.map((step, index) => (
        <li key={step.title}>
          <Link className="home-tile home-step" href={step.href}>
            <span className="home-step-no">{String(index + 1).padStart(2, "0")}</span>
            <b>{step.title}</b>
            <span>{step.description}</span>
            <span className="home-step-go" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
