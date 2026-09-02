"use server";

import { revalidatePath } from "next/cache";

import { platformRequest } from "@/lib/platform/client";

type PresenceInput = { locale: string; missionId: string };
type CaptureInput = PresenceInput & { captureId: string };

export async function recordMissionPresenceAction(input: unknown) {
  return platformRequest<{ viewerCount: number }>("/v1/missions/presence", {
    method: "POST",
    body: input,
  });
}

export async function leaveMissionPresenceAction(input: unknown) {
  await platformRequest<void>("/v1/missions/presence/leave", {
    method: "POST",
    body: input,
  });
}

export async function joinSharedMissionAction(input: unknown) {
  const result = await platformRequest<{ joined: true; saveableCaptureIds: string[] }>(
    "/v1/missions/shared/join",
    { method: "POST", body: input },
  );
  const { locale, missionId } = input as PresenceInput;
  revalidatePath(`/${locale}/app/missions/${missionId}/watch`);
  return result;
}

export async function leaveSharedMissionAction(input: unknown) {
  const result = await platformRequest<{ joined: false }>("/v1/missions/shared/leave", {
    method: "POST",
    body: input,
  });
  const { locale, missionId } = input as PresenceInput;
  revalidatePath(`/${locale}/app/missions/${missionId}/watch`);
  return result;
}

export async function saveSharedCaptureAction(input: unknown) {
  const result = await platformRequest<{ saved: true; captureId: string }>(
    "/v1/captures/save-shared",
    { method: "POST", body: input },
  );
  const { locale, missionId } = input as CaptureInput;
  revalidatePath(`/${locale}/app/missions/${missionId}/watch`);
  revalidatePath(`/${locale}/app/collection`);
  return result;
}
