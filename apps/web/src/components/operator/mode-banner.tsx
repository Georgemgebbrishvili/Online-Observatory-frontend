"use client";

import type { OperatorCopy } from "@/i18n/resources/operator";

import { liveState, useOperatorConsole } from "./console-provider";

// ObservatoryMode: any interface fed by the simulator must say so, unmistakably.
export function ModeBanner({ copy }: { copy: OperatorCopy["mode"] }) {
  const { reading } = useOperatorConsole();
  const mode = liveState(reading)?.telemetry.mode;
  const text = mode ? copy[mode] : copy.unknown;

  return (
    <div
      className={`operator-mode operator-mode-${(mode ?? "unknown").toLowerCase()}`}
      role="status"
    >
      <strong>{text.banner}</strong>
      <span>{text.detail}</span>
    </div>
  );
}
