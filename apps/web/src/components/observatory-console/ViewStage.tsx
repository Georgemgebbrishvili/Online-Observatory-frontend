"use client";

import { memo, type ReactNode, type RefObject } from "react";
import type { RoiPreset } from "@/lib/observatory-sim/camera";
import type { OpticalTrainId } from "@/lib/observatory-sim/optics";
import { useCopy } from "./copy-context";
import Icon from "./icons";

function Reticle() {
  return (
    <svg
      className="sdo-overlay"
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g fill="none">
        <path
          d="M450 40v160M450 400v160M120 300h200M580 300h200"
          stroke="rgba(230, 237, 255, .3)"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="450"
          cy="300"
          r="60"
          stroke="rgba(230, 237, 255, .4)"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

function Grid() {
  return (
    <svg
      className="sdo-overlay"
      viewBox="0 0 900 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M150 0v600M300 0v600M450 0v600M600 0v600M750 0v600M0 150h900M0 300h900M0 450h900"
        stroke="rgba(230, 237, 255, .16)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export type ViewLook = { grid: boolean; invert: boolean; mirror: boolean; flip: boolean };

export type ViewStageProps = {
  look: ViewLook;
  /** The hub's tools over the picture: view toggles down the left, optics across the top. */
  overlay?: ReactNode;
  viewRef: RefObject<HTMLDivElement | null>;
  /** The camera's picture: the sky model's canvas, or the platform's stream. */
  feed: ReactNode | null;
  /** The feed is a stream: it keeps its own aspect and is never drawn over. */
  stream: boolean;
  train: OpticalTrainId;
  onTrain: ((t: OpticalTrainId) => void) | null;
  roi: RoiPreset["id"];
  onRoi: ((r: RoiPreset["id"]) => void) | null;
  reticle: boolean;
  onReticle: () => void;
  full: boolean;
  onFull: () => void;
  status: { text: string; go: boolean; blink: boolean };
  /** The running exposure, 0–1, under the status pill; null at video rate or off. */
  exposing: number | null;
  /** What the field is going through: below the horizon, cloud, dew. A warning is red. */
  alerts: Array<{ text: string; warn: boolean }>;
  hudLive: [string, string, string];
  hudTarget: [string, string, string | null] | null;
  hudField: [string, string];
  /** Under the frame, always: what is drawn here is an illustration (ADR-052). */
  caption: string;
  idle: { title: string; text: string; note?: string } | null;
};

/** What the field is going through, over the picture: a warning is red, a passing condition is not. */
export function ConditionAlerts({ alerts }: { alerts: ViewStageProps["alerts"] }) {
  const t = useCopy();
  if (alerts.length === 0) return null;
  return (
    <ul className="sdo-alerts" aria-label={t.stage.conditions}>
      {alerts.map((a) => (
        <li key={a.text} className={`sdo-pill sdo-glass${a.warn ? " is-warn" : ""}`}>
          <span className={`sdo-led ${a.warn ? "is-warn" : "is-hold"}`} />
          {a.text}
        </li>
      ))}
    </ul>
  );
}

function ViewStage(p: ViewStageProps) {
  const look = p.look;
  const transform =
    `${look.mirror ? "scaleX(-1) " : ""}${look.flip ? "scaleY(-1)" : ""}`.trim();
  return (
    <div className={`sdo-view${p.full ? " is-full" : ""}${p.status.go ? " is-go" : ""}`}>
      <div className="sdo-view__sky" aria-hidden="true" />
      <div
        className={`sdo-view__feed${p.stream ? " is-stream" : ""}`}
        ref={p.viewRef}
        style={{
          transform: transform || undefined,
          filter: look.invert ? "invert(1)" : undefined,
        }}
      >
        {p.feed}
      </div>
      {p.reticle && p.feed && <Reticle />}
      {look.grid && p.feed && <Grid />}
      <span className="oh-frame-c oh-tl" aria-hidden="true" />
      <span className="oh-frame-c oh-tr" aria-hidden="true" />
      <span className="oh-frame-c oh-bl" aria-hidden="true" />
      <span className="oh-frame-c oh-br" aria-hidden="true" />
      <div className="sdo-vignette" />

      <div className="sdo-status" role="status">
        <span className={`sdo-pill sdo-glass${p.status.go ? " is-go" : ""}`}>
          <span
            className={`sdo-led ${p.status.go ? "is-go" : "is-hold"}${p.status.blink ? " sdo-blink" : ""}`}
          />
          {p.status.text}
        </span>
        {p.exposing !== null && (
          <span className="sdo-expose" aria-hidden="true">
            <i style={{ width: `${Math.round(p.exposing * 100)}%` }} />
          </span>
        )}
      </div>
      <ConditionAlerts alerts={p.alerts} />
      <div className="sdo-hud sdo-glass sdo-hud--tl">
        <span className="oh-livetag">{p.hudLive[0]}</span> · {p.hudLive[1]}
        <br />
        {p.hudLive[2]}
      </div>
      {p.hudTarget && (
        <div className="sdo-hud sdo-glass sdo-hud--bl">
          <span className="oh-livetag">{p.hudTarget[0]}</span>
          <br />
          {p.hudTarget[1]}
          {p.hudTarget[2] && (
            <>
              <br />
              {p.hudTarget[2]}
            </>
          )}
        </div>
      )}
      <div className="sdo-hud sdo-glass sdo-hud--br">
        <span>{p.hudField[0]}</span>
        <span className="sdo-hud__more">
          <br />
          {p.hudField[1]}
        </span>
      </div>
      <p className="sdo-hud sdo-glass sdo-hud--bc sdo-caption">{p.caption}</p>

      {p.overlay}
      {p.idle && (
        <div className="sdo-idle sdo-glass">
          <span className="sdo-idle__icon">
            <Icon name="camera" size={24} />
          </span>
          <p className="sdo-idle__title">{p.idle.title}</p>
          <p className="sdo-idle__text">{p.idle.text}</p>
          {p.idle.note && (
            <p className="sdo-idle__note">
              <span className="sdo-led is-go" />
              {p.idle.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ViewStage);
