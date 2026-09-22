import type {
  OperatorObservatoryState,
  OperatorOverrideRequest,
  SetObservatoryModeRequest,
} from "@darkview/contracts";
import {
  zAdminGetObservatoryStateResponse,
  zAdminOverrideCommandResponse,
  zAdminSetObservatoryModeResponse,
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
