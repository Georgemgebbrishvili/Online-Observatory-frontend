import type {
  AdminCancelMissionRequest,
  AdminUpdateTargetRequest,
  AuditCategory,
  AuditEventPage,
  MissionPage,
  MissionState,
  OperatorObservatoryState,
  OperatorOverrideRequest,
  SetObservatoryModeRequest,
} from "@darkview/contracts";
import {
  zAdminCancelMissionResponse,
  zAdminGetObservatoryStateResponse,
  zAdminListAuditEventsResponse,
  zAdminListMissionsResponse,
  zAdminOverrideCommandResponse,
  zAdminSetObservatoryModeResponse,
  zAdminUpdateTargetResponse,
} from "@darkview/contracts/zod";

import { apiRequest } from "@/lib/platform/browser";

// Operator calls, from the browser to /api (ADR-016). Every one is operator-only
// on the platform, which answers 403 to anyone else whatever this page shows.

export function fetchObservatoryState(
  observatoryId: string,
): Promise<OperatorObservatoryState> {
  return apiRequest(`/admin/observatories/${encodeURIComponent(observatoryId)}/state`, {
    schema: zAdminGetObservatoryStateResponse,
  });
}

export function sendOverride(body: OperatorOverrideRequest) {
  return apiRequest("/admin/override", {
    method: "POST",
    body,
    schema: zAdminOverrideCommandResponse,
  });
}

export function setObservatoryMode(
  observatoryId: string,
  body: SetObservatoryModeRequest,
) {
  return apiRequest(`/admin/observatories/${encodeURIComponent(observatoryId)}/mode`, {
    method: "POST",
    body,
    schema: zAdminSetObservatoryModeResponse,
  });
}

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const rendered = search.toString();
  return rendered ? `?${rendered}` : "";
}

export function listMissions(
  params: { state?: MissionState; cursor?: string } = {},
): Promise<MissionPage> {
  return apiRequest(`/admin/missions${query(params)}`, {
    schema: zAdminListMissionsResponse,
  });
}

export function cancelMission(missionId: string, body: AdminCancelMissionRequest) {
  return apiRequest(`/admin/missions/${encodeURIComponent(missionId)}/cancel`, {
    method: "POST",
    body,
    schema: zAdminCancelMissionResponse,
  });
}

export function updateTarget(targetId: string, body: AdminUpdateTargetRequest) {
  return apiRequest(`/admin/targets/${encodeURIComponent(targetId)}`, {
    method: "PATCH",
    body,
    schema: zAdminUpdateTargetResponse,
  });
}

export function listAuditEvents(
  params: { missionId?: string; category?: AuditCategory; cursor?: string } = {},
): Promise<AuditEventPage> {
  return apiRequest(`/admin/logs${query(params)}`, {
    schema: zAdminListAuditEventsResponse,
  });
}
