import type {
  GetObservatoryConditionsResponse,
  GetObservatoryStatusResponse,
  GetTargetResponse,
  ListBookableObservatoriesResponse,
  ListSlotsResponse,
  ListTonightTargetsResponse,
} from "@darkview/contracts";

import { platformApiBaseUrl, platformTimeoutMs } from "./config";

export class PlatformError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PlatformError";
    this.status = status;
  }
}

// Public reads only: nothing here carries a credential (ADR-059 §3).
async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${platformApiBaseUrl}${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(platformTimeoutMs),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new PlatformError(detail || response.statusText, response.status);
  }
  return (await response.json()) as T;
}

const q = encodeURIComponent;

export const platform = {
  observatories: () => get<ListBookableObservatoriesResponse>("/observatories"),
  status: (observatoryId: string) =>
    get<GetObservatoryStatusResponse>(`/observatories/${q(observatoryId)}/state`),
  conditions: (observatoryId: string) =>
    get<GetObservatoryConditionsResponse>(`/observatories/${q(observatoryId)}/conditions`),
  tonightTargets: (observatoryId: string) =>
    get<ListTonightTargetsResponse>(`/targets/tonight?observatoryId=${q(observatoryId)}`),
  target: (slug: string) => get<GetTargetResponse>(`/targets/${q(slug)}`),
  slots: (observatoryId: string, date: string) =>
    get<ListSlotsResponse>(`/slots?observatoryId=${q(observatoryId)}&date=${q(date)}`),
};
