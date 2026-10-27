import "server-only";

import { zAdminListObservatoriesResponse } from "@darkview/contracts/zod";
import { cookies } from "next/headers";
import { cache } from "react";

import { operatorObservatoryCookie } from "@/features/operator/observatory-cookie";
import { platformRequest } from "@/lib/platform/client";

/**
 * The observatories the operator console works on, and the one it works on now.
 * First-party only (ADR-003): the demo, and the hardware test one no customer can
 * book (platform ADR-074). The choice is a cookie, honoured only when it names one.
 */
export const readOperatedObservatories = cache(async () => {
  const { items } = zAdminListObservatoriesResponse.parse(
    await platformRequest<unknown>("/admin/observatories"),
  );
  const operated = items.filter(
    (candidate) => candidate.kind === "FIRST_PARTY" || candidate.hardwareTest,
  );
  const chosen = (await cookies()).get(operatorObservatoryCookie)?.value;
  const observatory =
    operated.find((candidate) => candidate.id === chosen) ?? operated[0];
  return { operated, observatory };
});
