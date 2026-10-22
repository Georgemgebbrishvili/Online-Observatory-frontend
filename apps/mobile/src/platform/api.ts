import type {
  ApiError,
  BookingPage,
  Capture,
  CaptureDownload,
  CapturePage,
  GetObservatoryConditionsResponse,
  GetObservatoryStatusResponse,
  GetTargetResponse,
  ListBookableObservatoriesResponse,
  ListSlotsResponse,
  ListTonightTargetsResponse,
  Mission,
  MissionCommandAccepted,
  MissionCommandRequest,
  MissionSession,
  NativeSession,
  SignInRequest,
  TargetPage,
} from "@darkview/contracts";

import { platformApiBaseUrl, platformTimeoutMs } from "./config";

export class PlatformError extends Error {
  readonly status: number;
  readonly code: ApiError["code"] | null;

  constructor(message: string, status: number, code: ApiError["code"] | null) {
    super(message);
    this.name = "PlatformError";
    this.status = status;
    this.code = code;
  }
}

/**
 * One request to the platform. A signed-in read carries the native session as
 * `Authorization: Bearer` (ADR-061); nothing here ever sends a cookie.
 */
async function request<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; token?: string } = {},
): Promise<T> {
  const response = await fetch(`${platformApiBaseUrl}${path}`, {
    method: init.method ?? "GET",
    credentials: "omit",
    headers: {
      accept: "application/json",
      ...(init.body === undefined ? {} : { "content-type": "application/json" }),
      ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(platformTimeoutMs),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as Partial<ApiError> | null;
    throw new PlatformError(
      error?.message ?? response.statusText,
      response.status,
      error?.code ?? null,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const get = <T,>(path: string) => request<T>(path);

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
  catalogue: () => get<TargetPage>("/targets?limit=100"),

  signIn: (body: SignInRequest) =>
    request<NativeSession>("/auth/native-sign-in", { method: "POST", body }),
  signOut: (token: string) => request<void>("/auth/sign-out", { method: "POST", token }),
  bookings: (token: string) => request<BookingPage>("/bookings", { token }),

  mission: (id: string, token: string) => request<Mission>(`/missions/${q(id)}`, { token }),
  /** Opens, or reopens, the controller's session; no body (as the website sends it). */
  startMission: (id: string, token: string) =>
    request<MissionSession>(`/missions/${q(id)}/start`, { method: "POST", token }),
  command: (id: string, token: string, body: MissionCommandRequest) =>
    request<MissionCommandAccepted>(`/missions/${q(id)}/command`, { method: "POST", token, body }),

  captures: (token: string) => request<CapturePage>("/captures?limit=24", { token }),
  capture: (id: string, token: string) => request<Capture>(`/captures/${q(id)}`, { token }),
  captureImage: (id: string, token: string) =>
    request<CaptureDownload>(`/captures/${q(id)}/download?kind=IMAGE`, { token }),
};
