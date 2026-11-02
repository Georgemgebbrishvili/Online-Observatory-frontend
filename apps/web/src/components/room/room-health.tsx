import type { ImageHealth } from "@darkview/contracts";

import { waitUntil } from "@/features/missions/controls";
import { fill } from "@/features/operator/format";
import type { RoomSessionCopy } from "@/i18n/resources/room-session";

/** The words for a verdict that is not OK: what the telescope does, and why. */
export function healthWords(
  health: ImageHealth,
  copy: RoomSessionCopy["health"],
  now: number | null,
) {
  const retry = waitUntil(health.nextRetryAt, now);
  switch (health.status) {
    case "OK":
      return null;
    case "RECOVERING":
      return {
        title: health.step ? copy.steps[health.step] : copy.recovering,
        detail: health.reason ? copy.reasons[health.reason] : null,
      };
    case "WAITING":
      return {
        title: copy.waiting.title,
        detail: retry
          ? fill(copy.waiting.retry, { time: retry.text })
          : copy.waiting.detail,
      };
    case "UNRECOVERED":
      return {
        title: copy.unrecovered.title,
        detail: [
          copy.unrecovered.detail,
          retry ? fill(copy.unrecovered.retry, { time: retry.text }) : null,
        ]
          .filter(Boolean)
          .join(" "),
      };
  }
}

/**
 * The agent's verdict on its own picture (ADR-080), in plain words, under the feed. Said
 * only when it is not OK; a change is spoken, the countdown inside it is not.
 */
export function RoomHealth({
  copy,
  health,
  now,
}: {
  copy: RoomSessionCopy["health"];
  health: ImageHealth | null;
  now: number | null;
}) {
  const words = health ? healthWords(health, copy, now) : null;
  return (
    <div
      className="room-health"
      data-health={health && words ? health.status : undefined}
      role="group"
      aria-label={copy.label}
    >
      <p aria-live="polite" aria-atomic="true">
        {words && <strong>{words.title}</strong>}
      </p>
      {words?.detail && <p>{words.detail}</p>}
    </div>
  );
}
