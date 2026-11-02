"use client";

import type { MissionTargetList } from "@darkview/contracts";
import { zListMissionTargetsResponse } from "@darkview/contracts/zod";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { waitUntil } from "@/features/missions/controls";
import { fill } from "@/features/operator/format";
import type { RoomSessionCopy } from "@/i18n/resources/room-session";
import { ApiRequestError, apiRequest } from "@/lib/platform/browser";

import { PanelHead } from "./panel-head";

/** How often the list is read again: what is up changes as the sky turns. */
const rereadEveryMs = 60_000;

export type TargetsRead =
  { kind: "loading" } | { kind: "ok"; list: MissionTargetList } | { kind: "unreadable" };

/**
 * `GET /missions/{id}/targets` (ADR-079 §4) while the session runs: on arrival, every
 * minute, and whenever the object on the telescope changes. A mission that is no longer
 * live (409) leaves the list as it was last read.
 */
export function useMissionTargets({
  active,
  currentTargetId,
  missionId,
}: {
  missionId: string;
  /** A session is held and the mission is live. */
  active: boolean;
  currentTargetId: string | null;
}): TargetsRead {
  const [read, setRead] = useState<TargetsRead>({ kind: "loading" });
  useEffect(() => {
    if (!active) return;
    let disposed = false;
    const load = async () => {
      try {
        const list = await apiRequest(
          `/missions/${encodeURIComponent(missionId)}/targets`,
          { schema: zListMissionTargetsResponse },
        );
        if (!disposed) setRead({ kind: "ok", list });
      } catch (error) {
        if (disposed) return;
        if (error instanceof ApiRequestError && error.status === 409) return;
        setRead((before) => (before.kind === "ok" ? before : { kind: "unreadable" }));
      }
    };
    void load();
    const id = window.setInterval(() => void load(), rereadEveryMs);
    return () => {
      disposed = true;
      window.clearInterval(id);
    };
  }, [active, currentTargetId, missionId]);
  return read;
}

export type TargetOption = { id: string; name: string; current: boolean };

type RoomTargetsViewProps = {
  copy: RoomSessionCopy["targets"];
  options: TargetOption[] | "loading" | "unreadable";
  /** When the dwell lock lifts; null or past is unlocked. */
  lockedUntil: string | null;
  now: number | null;
  /** A switch is accepted only while OBSERVING (MISSION_BUSY otherwise). */
  observing: boolean;
  /** The object a switch in flight goes to. */
  pendingId: string | null;
  /** Any command in flight: one at a time. */
  busy: boolean;
  /** What the last switch came to, in words. */
  message: string | null;
  onSwitch?: (targetId: string) => void;
  /** The region's name when it is not the heading: specimens side by side need their own. */
  label?: string;
};

/**
 * The objects a session may switch to now, best first, with the one on the telescope
 * marked (ADR-079 §4). While the 10-minute dwell runs it counts down to its end.
 */
export function RoomTargetsView({
  busy,
  copy,
  label,
  lockedUntil,
  message,
  now,
  observing,
  onSwitch,
  options,
  pendingId,
}: RoomTargetsViewProps) {
  const titleId = useId();
  const lock = waitUntil(lockedUntil, now);
  // The lock is shown, not enforced here: a press inside it is refused by the platform,
  // in words, with when it lifts (ADR-079 §4).
  const closed = !observing || busy;

  return (
    <section
      className="room-panel room-targets"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead id={titleId} icon="targets" title={copy.title} />

      {lock ? (
        <p className="room-targets-lock" data-dwell-seconds={lock.seconds}>
          <strong>
            {copy.lockedIn.split("{time}")[0]}
            <time className="data" dateTime={lock.iso}>
              {lock.text}
            </time>
            {copy.lockedIn.split("{time}")[1]}
          </strong>
          <span>{copy.dwellNote}</span>
        </p>
      ) : (
        !observing && <p className="room-muted">{copy.waiting}</p>
      )}

      {options === "loading" ? (
        <p className="room-muted">{copy.loading}</p>
      ) : options === "unreadable" ? (
        <p className="room-muted">{copy.unreadable}</p>
      ) : options.filter((option) => !option.current).length === 0 ? (
        <>
          <TargetList
            copy={copy}
            options={options}
            closed={closed}
            pendingId={pendingId}
            onSwitch={onSwitch}
          />
          <p className="room-muted">{copy.empty}</p>
        </>
      ) : (
        <TargetList
          copy={copy}
          options={options}
          closed={closed}
          pendingId={pendingId}
          onSwitch={onSwitch}
        />
      )}

      <p className="room-controls-status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

function TargetList({
  closed,
  copy,
  onSwitch,
  options,
  pendingId,
}: {
  copy: RoomSessionCopy["targets"];
  options: TargetOption[];
  closed: boolean;
  pendingId: string | null;
  onSwitch?: (targetId: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <ul className="room-targets-list">
      {options.map((option) => (
        <li
          key={option.id}
          className={option.current ? "is-current" : undefined}
          aria-current={option.current ? "true" : undefined}
          data-target-id={option.id}
        >
          <span className="room-targets-name">{option.name}</span>
          {option.current ? (
            <span className="room-targets-badge">{copy.current}</span>
          ) : (
            <Button
              size="small"
              variant="secondary"
              aria-label={fill(copy.switchTo, { target: option.name })}
              aria-disabled={closed || undefined}
              loading={pendingId === option.id}
              onClick={() => !closed && onSwitch?.(option.id)}
            >
              {copy.switch}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
