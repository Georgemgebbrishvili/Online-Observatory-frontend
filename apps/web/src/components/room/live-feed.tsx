import type { ReactNode } from "react";

import { LiveIndicator } from "@/components/observatory/live-indicator";
import type { LiveStatus } from "@/features/missions/live";
import type { FeedPlates } from "@/features/missions/room";

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
  /** The instrument and the target, in small plates at the well's corners. */
  plates?: FeedPlates | null;
  /** The step tracker, at the head of the panel under the well. */
  steps?: ReactNode;
  /** The one action, at the right of the status line. */
  action?: ReactNode;
  onStreamError?: () => void;
};

const busy: readonly LiveStatus[] = ["starting", "connecting", "reconnecting"];

/**
 * The room's feed (ADR-027 §6, ADR-011, ADR-039): the picture as a deep well, with the
 * instrument's and target's plates in its corners and nothing over the picture itself;
 * then the step tracker, the status line and the one action. Once a stream exists the
 * well shows the stream and nothing else; before that, the preview. A simulated stream
 * is badged as such and never carries the LIVE dot, which is a real camera's only.
 */
export function LiveFeed({
  action,
  description,
  labels,
  onStreamError,
  plates,
  preview,
  status,
  steps,
  stream,
  timeLeft,
  title,
}: LiveFeedProps) {
  const alert = status === "error" || status === "refused";
  const instrument = plates?.instrument;
  const subject = plates?.subject;
  return (
    <div
      className="live-feed"
      data-live-status={status}
      data-live-busy={busy.includes(status) ? "true" : undefined}
    >
      <div className="live-feed-well">
        <div className="live-feed-view">
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
          {(instrument || subject || timeLeft) && (
            <div className="live-feed-plates">
              {instrument && (
                <p className="live-feed-plate live-feed-plate-instrument">
                  {instrument.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              )}
              {subject && (
                <p className="live-feed-plate live-feed-plate-subject">
                  <span>{subject.name}</span>
                  {subject.coordinates && (
                    <span className="live-feed-plate-data">{subject.coordinates}</span>
                  )}
                </p>
              )}
              {timeLeft && (
                <p className="live-feed-plate live-feed-time">
                  {labels.timeLeft}{" "}
                  <time className="data" dateTime={timeLeft.iso}>
                    {timeLeft.text}
                  </time>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="live-feed-flow">
        {steps}
        <div className="live-feed-status">
          <div role={alert ? "alert" : "status"}>
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
          {action && <div className="live-feed-action">{action}</div>}
        </div>
      </div>
    </div>
  );
}
