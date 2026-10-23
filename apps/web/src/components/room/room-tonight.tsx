"use client";

import type { MissionState } from "@darkview/contracts";
import { zSetMissionBroadcastResponse } from "@darkview/contracts/zod";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { reopensSession } from "@/features/missions/live";
import type { Locale } from "@/i18n/config";
import { tonightCopy } from "@/i18n/resources/tonight";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

import { PanelHead } from "./panel-head";

/**
 * Clients ADR-066: the owner's switch for Tonight, live. Off by default; closing is
 * always offered while it is on, whatever the mission is doing.
 */
export function RoomTonight({
  broadcast,
  locale,
  missionId,
  missionState,
}: {
  broadcast: boolean;
  locale: Locale;
  missionId: string;
  missionState: MissionState;
}) {
  const [open, setOpen] = useState(broadcast);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const openable = missionState === "SCHEDULED" || reopensSession(missionState);
  if (!open && !openable) return null;

  async function set(next: boolean) {
    setSaving(true);
    setFailed(false);
    try {
      const mission = await apiRequest(
        `/missions/${encodeURIComponent(missionId)}/broadcast`,
        {
          method: "PATCH",
          body: { broadcast: next },
          schema: zSetMissionBroadcastResponse,
        },
      );
      setOpen(mission.broadcast ?? false);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(`/${locale}/sign-in`);
        return;
      }
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RoomTonightView
      copy={tonightCopy[locale].room}
      open={open}
      saving={saving}
      failed={failed}
      onToggle={() => void set(!open)}
    />
  );
}

export function RoomTonightView({
  copy,
  failed,
  label,
  onToggle,
  open,
  saving,
}: {
  copy: (typeof tonightCopy)[Locale]["room"];
  failed: boolean;
  /** Only where several are on one page, as on /design-system. */
  label?: string;
  onToggle?: () => void;
  open: boolean;
  saving: boolean;
}) {
  const titleId = useId();
  return (
    <section
      className="room-panel room-broadcast"
      aria-labelledby={label ? undefined : titleId}
      aria-label={label}
    >
      <PanelHead id={titleId} icon="share" title={copy.title} />
      <p className="room-broadcast-note" data-tonight-room={open ? "on" : "off"}>
        {open ? copy.on : copy.off}
      </p>
      <Button variant="secondary" disabled={saving} onClick={onToggle}>
        {saving ? copy.saving : open ? copy.close : copy.open}
      </Button>
      {failed && (
        <p className="room-broadcast-note" role="alert">
          {copy.failed}
        </p>
      )}
    </section>
  );
}
