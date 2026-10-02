"use client";

import type { MissionState } from "@darkview/contracts";
import { zSetMissionObservationResponse } from "@darkview/contracts/zod";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { reopensSession } from "@/features/missions/live";
import { fill } from "@/features/operator/format";
import type { RoomSharingCopy } from "@/i18n/resources/room-sharing";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import { PanelHead } from "./panel-head";

export type SharingNotice = "copied" | "ended" | "failed" | null;

type RoomSharingViewProps = {
  observable: boolean;
  count: number;
  capacity: number;
  saving: boolean;
  confirming: boolean;
  notice: SharingNotice;
  copy: RoomSharingCopy;
  /** The region's name when it is not the heading: specimens side by side need their own. */
  label?: string;
  onSet?: (observable: boolean) => void;
  onCopy?: () => void;
  onConfirming?: (confirming: boolean) => void;
};

/** The sharing panel in one state, drawn from props alone: the design system shows each. */
export function RoomSharingView({
  capacity,
  confirming,
  copy,
  count,
  label,
  notice,
  observable,
  onConfirming,
  onCopy,
  onSet,
  saving,
}: RoomSharingViewProps) {
  const titleId = useId();
  const people = { count: String(count), capacity: String(capacity) };
  const message =
    notice === "copied"
      ? copy.copied
      : notice === "ended"
        ? copy.ended
        : notice === "failed"
          ? copy.failed
          : null;

  return (
    <section
      className="room-panel room-sharing"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead
        id={titleId}
        icon="share"
        title={copy.title}
        meta={observable && notice !== "ended" ? `${count} / ${capacity}` : undefined}
      />
      {notice === "ended" ? null : observable ? (
        <>
          <p>
            {copy.open} {fill(copy.seats, people)}
          </p>
          <div className="room-sharing-actions">
            <Button variant="secondary" disabled={saving} onClick={() => onCopy?.()}>
              {copy.copyLink}
            </Button>
            {!confirming && (
              <Button
                variant="ghost"
                disabled={saving}
                loading={saving}
                onClick={() => onConfirming?.(true)}
              >
                {saving ? copy.saving : copy.closeAction}
              </Button>
            )}
          </div>
          {confirming && (
            <div
              className="room-controls-confirm"
              role="group"
              aria-label={copy.closeQuestion}
            >
              <p>
                <strong>{copy.closeQuestion}</strong> {copy.closeDetail}
              </p>
              <div>
                <Button
                  variant="danger"
                  disabled={saving}
                  loading={saving}
                  onClick={() => onSet?.(false)}
                >
                  {copy.closeConfirm}
                </Button>
                <Button
                  variant="ghost"
                  disabled={saving}
                  onClick={() => onConfirming?.(false)}
                >
                  {copy.closeKeep}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p>{copy.private}</p>
          <div className="room-sharing-actions">
            <Button
              variant="secondary"
              disabled={saving}
              loading={saving}
              onClick={() => onSet?.(true)}
            >
              {saving ? copy.saving : copy.openAction}
            </Button>
          </div>
        </>
      )}
      <p className="room-sharing-status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

type RoomSharingProps = {
  missionId: string;
  missionState: MissionState;
  observable: boolean;
  observerCount: number;
  observerCapacity: number;
  /** Where a watcher goes (slice 5's watch page), absolute when copied. */
  watchPath: string;
  signInPath: string;
  copy: RoomSharingCopy;
};

/**
 * Open or close the live session to observers (Phase 4 slice 4), the owner's consent
 * (ADR-007). Each change is one `setMissionObservation`, never retried by itself; the
 * panel shows what the platform answered.
 */
export function RoomSharing({
  copy,
  missionId,
  missionState,
  observable: initialObservable,
  observerCapacity,
  observerCount,
  signInPath,
  watchPath,
}: RoomSharingProps) {
  const [mission, setMission] = useState({
    observable: initialObservable,
    count: observerCount,
    capacity: observerCapacity,
  });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<SharingNotice>(null);
  const [ended, setEnded] = useState(false);

  // The platform opens a session only while it is live (LIVE_MISSION_STATES).
  if (!reopensSession(missionState) && !ended) return null;

  async function set(observable: boolean) {
    setSaving(true);
    setNotice(null);
    try {
      const answer = await apiRequest(
        `/missions/${encodeURIComponent(missionId)}/observation`,
        {
          method: "PATCH",
          body: { observable },
          schema: zSetMissionObservationResponse,
        },
      );
      setMission({
        observable: answer.observable ?? false,
        count: answer.observerCount ?? 0,
        capacity: answer.observerCapacity ?? mission.capacity,
      });
      setConfirming(false);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      const over =
        error instanceof ApiRequestError && error.error?.code === "MISSION_NOT_ACTIVE";
      if (over) setEnded(true);
      setNotice(over ? "ended" : "failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        new URL(watchPath, window.location.origin).href,
      );
      setNotice("copied");
    } catch {
      setNotice("failed");
    }
  }

  return (
    <RoomSharingView
      observable={mission.observable}
      count={mission.count}
      capacity={mission.capacity}
      saving={saving}
      confirming={confirming}
      notice={notice}
      copy={copy}
      onSet={(observable) => void set(observable)}
      onCopy={() => void copyLink()}
      onConfirming={(next) => {
        setNotice(null);
        setConfirming(next);
      }}
    />
  );
}
