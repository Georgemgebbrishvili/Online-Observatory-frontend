import type { HTMLAttributes } from "react";

export type StatusTone = "cyan" | "success" | "warning" | "danger" | "neutral";

type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  label: string;
  tone?: StatusTone;
};

export function StatusIndicator({
  className = "",
  label,
  tone = "neutral",
  ...props
}: StatusIndicatorProps) {
  return (
    <span className={`status-indicator status-${tone} ${className}`} {...props}>
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
