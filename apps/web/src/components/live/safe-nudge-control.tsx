"use client";

import { useState } from "react";

import {
  createSafeNudgeRequest,
  type NudgeDirection,
  type SafeNudgeRequest,
} from "@/features/live/nudge";
import type { Locale } from "@/i18n/config";
import { safeNudgeCopy } from "@/i18n/resources/live";

type SafeNudgeControlProps = {
  locale: Locale;
};

const directionGlyph: Record<NudgeDirection, string> = {
  UP: "↑",
  RIGHT: "→",
  DOWN: "↓",
  LEFT: "←",
};

export function SafeNudgeControl({ locale }: SafeNudgeControlProps) {
  const [lastRequest, setLastRequest] = useState<SafeNudgeRequest | null>(null);
  const copy = safeNudgeCopy[locale];

  function requestNudge(direction: NudgeDirection) {
    setLastRequest(createSafeNudgeRequest(direction));
  }

  return (
    <section className="safe-nudge" aria-labelledby="safe-nudge-title">
      <div className="safe-nudge-copy">
        <span>{copy.title}</span>
        <h2 id="safe-nudge-title">{copy.description}</h2>
        <p>{copy.disclosure}</p>
      </div>
      <div className="safe-nudge-pad" aria-label={copy.title}>
        {(["UP", "LEFT", "RIGHT", "DOWN"] as const).map((direction) => (
          <button
            key={direction}
            className={`safe-nudge-${direction.toLowerCase()}`}
            type="button"
            aria-label={copy.directions[direction]}
            onClick={() => requestNudge(direction)}
          >
            {directionGlyph[direction]}
          </button>
        ))}
        <span aria-hidden="true" />
      </div>
      {lastRequest && (
        <p className="safe-nudge-feedback" role="status">
          <strong>{copy.queued}</strong>
          <span>
            {lastRequest.direction} · {lastRequest.arcseconds}″
          </span>
        </p>
      )}
    </section>
  );
}
