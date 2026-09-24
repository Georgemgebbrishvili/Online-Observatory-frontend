"use client";

import type { DeviceStatus } from "@darkview/contracts";
import type { ReactNode } from "react";

import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import {
  fill,
  formatAge,
  formatEquatorial,
  formatHorizontal,
} from "@/features/operator/format";
import type { OperatorCopy } from "@/i18n/resources/operator";

import { liveState, useOperatorConsole } from "./console-provider";

// Past this the reading is still the live link's latest, but the link is slow.
const STALE_AFTER_MS = 5000;

const healthTone: Record<DeviceStatus["health"], StatusTone> = {
  OK: "success",
  DEGRADED: "warning",
  FAULT: "danger",
  DISCONNECTED: "danger",
  NOT_CONFIGURED: "neutral",
};

/**
 * `field` names the row for tests. A dt/dd pair exposes no role that can be asked
 * for by name, and the label is localised, so without it a test has to select the
 * style class -- which then breaks the moment the row is restyled.
 */
function Row({
  children,
  field,
  label,
}: {
  children: ReactNode;
  field?: string;
  label: string;
}) {
  return (
    <div className="operator-row" data-field={field}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function TelemetryOverview({ copy }: { copy: OperatorCopy }) {
  const { now, reading } = useOperatorConsole();
  const state = liveState(reading);
  const { labels } = copy;

  if (reading.kind === "offline") {
    return (
      <StatePanel title={copy.status.offline} description={copy.status.offlineDetail} />
    );
  }
  if (reading.kind === "not-configured") {
    return (
      <StatePanel
        variant="error"
        title={copy.status.notConfigured}
        description={copy.status.notConfiguredDetail}
      />
    );
  }
  if (!state) return <p className="operator-waiting">{copy.status.waiting}</p>;

  const { telemetry, safetyEnvelope: envelope } = state;
  const age = now - Date.parse(telemetry.reportedAt);
  const yesNo = (value: boolean | null | undefined) =>
    value == null ? labels.unknown : value ? labels.yes : labels.no;
  const device = (status: DeviceStatus) => (
    <>
      <StatusIndicator
        label={copy.health[status.health]}
        tone={healthTone[status.health]}
      />
      {status.detail && <span className="operator-detail">{status.detail}</span>}
    </>
  );

  return (
    <div className="operator-overview">
      <p
        className={`operator-freshness ${reading.kind === "unreachable" || age > STALE_AFTER_MS ? "operator-tone-error" : ""}`}
        role="status"
      >
        {reading.kind === "unreachable"
          ? copy.status.unreachable
          : fill(age > STALE_AFTER_MS ? copy.status.stale : copy.status.reportedAgo, {
              age: formatAge(age),
            })}
      </p>

      <section className="surface-panel" aria-labelledby="operator-devices">
        <h2 id="operator-devices">{labels.devices}</h2>
        <dl>
          <Row label={labels.link}>
            <StatusIndicator
              label={copy.link[telemetry.link]}
              tone={
                telemetry.link === "ONLINE"
                  ? "success"
                  : telemetry.link === "DEGRADED"
                    ? "warning"
                    : "danger"
              }
            />
          </Row>
          <Row label={labels.mount}>{device(telemetry.mount)}</Row>
          <Row label={labels.camera}>{device(telemetry.camera)}</Row>
          <Row label={labels.focuser}>{device(telemetry.focuser)}</Row>
          <Row label={labels.weather}>
            {copy.weather[telemetry.weather.status]}
            {telemetry.weather.holdActive && (
              <StatusIndicator label={labels.weatherHold} tone="warning" />
            )}
          </Row>
        </dl>
      </section>

      <section className="surface-panel" aria-labelledby="operator-telemetry">
        <h2 id="operator-telemetry">{labels.telemetry}</h2>
        <dl>
          <Row label={labels.equatorial}>
            <span className="data">
              {telemetry.pointingEquatorial
                ? formatEquatorial(telemetry.pointingEquatorial)
                : labels.unknown}
            </span>
          </Row>
          <Row label={labels.horizontal}>
            <span className="data">
              {telemetry.pointingHorizontal
                ? formatHorizontal(telemetry.pointingHorizontal)
                : labels.unknown}
            </span>
          </Row>
          <Row label={labels.tracking}>{yesNo(telemetry.tracking)}</Row>
          <Row field="parked" label={labels.parked}>
            {yesNo(telemetry.parked)}
          </Row>
          <Row label={labels.slewing}>{yesNo(telemetry.slewing)}</Row>
          <Row label={labels.focuserPosition}>
            <span className="data">{telemetry.focuserPosition ?? labels.unknown}</span>
          </Row>
          <Row label={labels.temperature}>
            <span className="data">
              {telemetry.ambientTemperatureC == null
                ? labels.unknown
                : `${telemetry.ambientTemperatureC.toFixed(1)} °C`}
            </span>
          </Row>
          <Row label={labels.agentVersion}>
            <span className="data">{telemetry.agentVersion ?? labels.unknown}</span>
          </Row>
        </dl>
      </section>

      <section className="surface-panel" aria-labelledby="operator-mission">
        <h2 id="operator-mission">{labels.mission}</h2>
        <dl>
          <Row label={labels.mission}>
            <span className="data">{state.activeMissionId ?? labels.none}</span>
          </Row>
          <Row label={labels.session}>
            <span className="data">{state.activeSessionId ?? labels.none}</span>
          </Row>
          <Row label={labels.latency}>
            <span className="data">
              {state.linkLatencyMs == null
                ? labels.latencyUnmeasured
                : `${state.linkLatencyMs} ms`}
            </span>
          </Row>
          <Row label={labels.heartbeat}>
            <span className="data">
              {state.lastHeartbeatAt
                ? formatAge(now - Date.parse(state.lastHeartbeatAt))
                : labels.unknown}
            </span>
          </Row>
        </dl>
      </section>

      <section className="surface-panel" aria-labelledby="operator-envelope">
        <h2 id="operator-envelope">{labels.envelope}</h2>
        <dl>
          <Row label={labels.minAltitude}>
            <span className="data">{envelope.minAltitudeDegrees}°</span>
          </Row>
          <Row label={labels.maxAltitude}>
            {envelope.maxAltitudeDegrees == null ? (
              <StatusIndicator label={labels.maxAltitudeUnmeasured} tone="warning" />
            ) : (
              <span className="data">{envelope.maxAltitudeDegrees}°</span>
            )}
          </Row>
          <Row label={labels.sunExclusion}>
            <span className="data">{envelope.sunExclusionDegrees}°</span>
          </Row>
        </dl>
      </section>
    </div>
  );
}
