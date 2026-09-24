"use client";

import type { Target } from "@darkview/contracts";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { updateTarget } from "@/features/operator/api";
import { fill, formatEquatorial } from "@/features/operator/format";
import { describe } from "@/features/operator/use-paged-list";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";

/**
 * Enabling or disabling a target changes what every customer can book, so the row
 * reflects the platform's answer rather than an optimistic local flip.
 */
export function TargetCatalogue({
  copy,
  locale,
  targets: initial,
}: {
  copy: OperatorCopy;
  locale: Locale;
  targets: readonly Target[];
}) {
  const text = copy.targets;
  const [targets, setTargets] = useState<readonly Target[]>(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function toggle(target: Target) {
    const name = locale === "ka" ? target.nameKa : target.nameEn;
    setPendingId(target.id);
    setMessage(null);
    try {
      const updated = await updateTarget(target.id, { enabled: !target.enabled });
      setTargets((previous) =>
        previous.map((candidate) => (candidate.id === updated.id ? updated : candidate)),
      );
      setMessage({
        ok: true,
        text: fill(updated.enabled ? text.enabledNow : text.disabledNow, {
          target: name,
        }),
      });
    } catch (cause) {
      setMessage({
        ok: false,
        text: fill(text.saveFailed, { target: name, message: describe(cause) }),
      });
    } finally {
      setPendingId(null);
    }
  }

  if (targets.length === 0) {
    return <StatePanel description={text.emptyDetail} title={text.empty} />;
  }

  return (
    <section className="surface-panel operator-list" aria-labelledby="operator-targets">
      <header>
        <h2 id="operator-targets">{text.title}</h2>
        <p>{text.detail}</p>
      </header>

      {message && (
        <p
          className={message.ok ? undefined : "operator-tone-error"}
          role={message.ok ? "status" : "alert"}
        >
          {message.text}
        </p>
      )}

      <div className="operator-table-scroll">
        <table className="operator-table">
          <thead>
            <tr>
              <th scope="col">{text.name}</th>
              <th scope="col">{text.catalog}</th>
              <th scope="col">{text.position}</th>
              <th scope="col">{text.minAltitude}</th>
              <th scope="col">{text.duration}</th>
              <th scope="col">{text.enabled}</th>
              <th scope="col">
                <span className="visually-hidden">{text.enable}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target.id}>
                <th scope="row">{locale === "ka" ? target.nameKa : target.nameEn}</th>
                <td className="data">{target.catalogId ?? copy.table.none}</td>
                <td className="data">
                  {target.coordinates
                    ? formatEquatorial(target.coordinates)
                    : `${text.ephemeris} · ${target.solarSystemBody ?? ""}`.trim()}
                </td>
                <td className="data">{target.minAltitudeDegrees}°</td>
                <td className="data">{target.expectedMissionMinutes}</td>
                <td>
                  <StatusIndicator
                    label={target.enabled ? copy.labels.yes : copy.labels.no}
                    tone={target.enabled ? "success" : "neutral"}
                  />
                </td>
                <td>
                  <Button
                    disabled={pendingId === target.id}
                    loading={pendingId === target.id}
                    onClick={() => toggle(target)}
                    size="small"
                    variant={target.enabled ? "danger" : "secondary"}
                  >
                    {target.enabled ? text.disable : text.enable}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
