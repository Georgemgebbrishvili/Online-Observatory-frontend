import type { ReactNode } from "react";

import { LiveIndicator } from "@/components/observatory/live-indicator";
import type { LiveStatus } from "@/features/missions/live";

type LiveFeedProps = {
  status: LiveStatus;
  /** The signed MJPEG URL from MISSION_STREAM, or null before one is offered. */
  stream: { url: string; simulated: boolean; alt: string } | null;
  /** What stands in the stream's place before one exists: the target preview. */
  preview: ReactNode;
  title: string;
  description: string;
  labels: { simulated: string; live: string; timeLeft: string };
  /** `MissionSession.expiresAt` minus now, once a session is held. */
  timeLeft: { text: string; iso: string } | null;
  action?: ReactNode;
  onStreamError?: () => void;
};

const busy: readonly LiveStatus[] = ["starting", "connecting", "reconnecting"];

/**
 * The room's feed (ADR-027 §6, ADR-011). Once a stream exists it shows the stream and
 * nothing else; before that, the preview. A simulated stream is badged as such and never
 * carries the LIVE dot, which is for a real camera only (Brand v2.0 §08 rule 04).
 */
export function LiveFeed({
  action,
  description,
  labels,
  onStreamError,
  preview,
  status,
  stream,
  timeLeft,
  title,
}: LiveFeedProps) {
  const alert = status === "error" || status === "refused";
  return (
    <div
      className="live-feed"
      data-live-status={status}
      data-live-busy={busy.includes(status) ? "true" : undefined}
    >
      {stream ? (
        <div className="live-feed-stage">
          {/* multipart/x-mixed-replace: an <img> is the whole player (ADR-011). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.url}
            alt={stream.alt}
            onError={onStreamError}
            data-live-stream=""
          />
          <span className="live-feed-badge">
            {stream.simulated ? (
              <span className="capture-simulated">{labels.simulated}</span>
            ) : (
              <LiveIndicator active label={labels.live} />
            )}
          </span>
        </div>
      ) : (
        preview
      )}
      <div className="live-feed-status">
        <div role={alert ? "alert" : "status"}>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
        {timeLeft && (
          <p className="live-feed-time">
            {labels.timeLeft}{" "}
            <time className="data" dateTime={timeLeft.iso}>
              {timeLeft.text}
            </time>
          </p>
        )}
        {action && <div className="live-feed-action">{action}</div>}
      </div>
    </div>
  );
}
