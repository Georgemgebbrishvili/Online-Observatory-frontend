"use client";

import type { Mission, MissionState } from "@darkview/contracts";
import { MissionState as missionStates } from "@darkview/contracts";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Dropdown } from "@/components/ui/dropdown";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import { Button } from "@/components/ui/button";
import { listMissions } from "@/features/operator/api";
import { fill } from "@/features/operator/format";
import { usePagedList } from "@/features/operator/use-paged-list";
import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";

import { CancelMissionDialog } from "./cancel-mission-dialog";

const ALL = "";

// A mission's state decides its tone: a hold or a failure must not read as routine.
const stateTone: Record<MissionState, StatusTone> = {
  REQUESTED: "neutral",
  SCHEDULED: "neutral",
  PREPARING: "active",
  SLEWING: "active",
  VERIFYING: "active",
  CENTERING: "active",
  OBSERVING: "active",
  CAPTURING: "active",
  PROCESSING: "active",
  COMPLETE: "success",
  WEATHER_HOLD: "warning",
  NOT_VISIBLE: "warning",
  HARDWARE_ERROR: "danger",
  CANCELLED: "neutral",
  FAILED: "danger",
};

// A mission that has already ended cannot be cancelled.
const terminal: readonly MissionState[] = ["COMPLETE", "CANCELLED", "FAILED"];

function shortId(id: string) {
  return id.slice(0, 8);
}

function moment(value: string | null | undefined, locale: Locale, fallback: string) {
  if (!value) return fallback;
  return new Date(value).toLocaleString(locale === "ka" ? "ka-GE" : "en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

export function MissionTable({ copy, locale }: { copy: OperatorCopy; locale: Locale }) {
  const [state, setState] = useState<string>(ALL);
  // One dialog for the whole table, rendered outside it: a dialog inside a cell is
  // laid out with that cell's siblings, which displaces its panel's contents.
  const [cancelling, setCancelling] = useState<Mission | null>(null);
  const load = useCallback(
    (cursor?: string) =>
      listMissions({
        state: state === ALL ? undefined : (state as MissionState),
        cursor,
      }),
    [state],
  );
  const missions = usePagedList<Mission>(load);
  const { missions: text, table } = copy;

  return (
    <section className="surface-panel operator-list" aria-labelledby="operator-missions">
      <header>
        <h2 id="operator-missions">{text.title}</h2>
        <p>{text.detail}</p>
      </header>

      <Dropdown
        label={text.filter}
        onChange={(event) => setState(event.currentTarget.value)}
        options={[
          { label: table.all, value: ALL },
          ...Object.values(missionStates).map((value) => ({
            label: copy.missionStates[value],
            value,
          })),
        ]}
        value={state}
      />

      {missions.error && (
        <p className="operator-tone-error" role="alert">
          {fill(table.failed, { message: missions.error })}
        </p>
      )}

      {missions.items.length === 0 && !missions.loading && !missions.error ? (
        <StatePanel description={text.emptyDetail} title={text.empty} />
      ) : (
        <div className="operator-table-scroll">
          <table className="operator-table">
            <thead>
              <tr>
                <th scope="col">{text.id}</th>
                <th scope="col">{text.state}</th>
                <th scope="col">{text.mode}</th>
                <th scope="col">{text.requested}</th>
                <th scope="col">{text.started}</th>
                <th scope="col">{text.captures}</th>
                <th scope="col">
                  <span className="visually-hidden">{text.cancel}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {missions.items.map((mission) => (
                <tr key={mission.id}>
                  <th scope="row" className="data">
                    {shortId(mission.id)}
                  </th>
                  <td>
                    <StatusIndicator
                      label={copy.missionStates[mission.state]}
                      tone={stateTone[mission.state]}
                    />
                    {mission.failureReason && (
                      <span className="operator-failure">{mission.failureReason}</span>
                    )}
                  </td>
                  <td className="data">{mission.mode}</td>
                  <td>{moment(mission.requestedAt, locale, table.none)}</td>
                  <td>{moment(mission.startedAt, locale, table.none)}</td>
                  <td className="data">{mission.captureIds?.length ?? 0}</td>
                  <td className="operator-row-actions">
                    <Link href={`/${locale}/admin/logs?mission=${mission.id}`}>
                      {text.viewLogs}
                    </Link>
                    {!terminal.includes(mission.state) && (
                      <Button
                        onClick={() => setCancelling(mission)}
                        size="small"
                        variant="secondary"
                      >
                        {text.cancel}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelling && (
        <CancelMissionDialog
          copy={copy}
          mission={cancelling}
          onCancelled={(updated) =>
            missions.replace(updated, (candidate) => candidate.id === updated.id)
          }
          onClose={() => setCancelling(null)}
        />
      )}

      {missions.loading && <p role="status">{table.loading}</p>}
      {missions.hasMore && !missions.loading && (
        <Button onClick={missions.loadMore} variant="secondary">
          {table.loadMore}
        </Button>
      )}
    </section>
  );
}
