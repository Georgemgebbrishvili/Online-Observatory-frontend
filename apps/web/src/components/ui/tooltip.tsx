"use client";

import { useId, type ReactNode } from "react";

type TooltipProps = {
  children: ReactNode;
  content: string;
};

export function Tooltip({ children, content }: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className="tooltip-anchor" aria-describedby={tooltipId} tabIndex={0}>
      {children}
      <span className="tooltip" id={tooltipId} role="tooltip">
        {content}
      </span>
    </span>
  );
}
