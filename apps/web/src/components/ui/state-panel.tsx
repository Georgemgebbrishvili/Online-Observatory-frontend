import type { ReactNode } from "react";

type StatePanelProps = {
  title: string;
  description: string;
  action?: ReactNode;
  variant?: "empty" | "error";
};

export function StatePanel({
  action,
  description,
  title,
  variant = "empty",
}: StatePanelProps) {
  return (
    <div
      className={`state-panel state-panel-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="state-symbol" aria-hidden="true">
        {variant === "error" ? "!" : "○"}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}
