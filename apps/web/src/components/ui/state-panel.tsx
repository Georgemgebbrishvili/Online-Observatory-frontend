import type { ReactNode } from "react";

type StatePanelProps = {
  title: string;
  description: string;
  action?: ReactNode;
  variant?: "empty" | "error";
  // A panel nested in a section is an h3. A panel that *is* the page — an unreachable
  // platform, an operator console with no observatory — owes the page its h1.
  headingLevel?: 1 | 2 | 3;
};

export function StatePanel({
  action,
  description,
  headingLevel = 3,
  title,
  variant = "empty",
}: StatePanelProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={`state-panel state-panel-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="state-symbol" aria-hidden="true">
        {variant === "error" ? (
          "!"
        ) : (
          // ADR-102: an empty eyepiece, its ring graduated, its target not yet in it.
          <svg viewBox="-50 -50 100 100">
            <circle r="44" />
            <circle className="state-symbol-inner" r="22" />
            {Array.from({ length: 24 }, (_, index) => (
              <line key={index} y1="-44" y2={index % 6 === 0 ? -34 : -39} transform={`rotate(${index * 15})`} />
            ))}
          </svg>
        )}
      </span>
      <Heading>{title}</Heading>
      <p>{description}</p>
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}
