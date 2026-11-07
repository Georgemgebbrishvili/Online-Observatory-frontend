import "server-only";

import type { LoyaltyAccount, LoyaltyScheme } from "@darkview/contracts";
import { zGetLoyaltySchemeResponse, zGetMyLoyaltyResponse } from "@darkview/contracts/zod";

import { platformRequest } from "@/lib/platform/client";

export type Club =
  | { kind: "ok"; scheme: LoyaltyScheme; account: LoyaltyAccount }
  | { kind: "unreachable" };

/** `GET /loyalty/scheme` and `GET /loyalty`, on the visitor's session (DV-090, DV-091). */
export async function readClub(): Promise<Club> {
  try {
    const [scheme, account] = await Promise.all([
      platformRequest<unknown>("/loyalty/scheme").then((value) =>
        zGetLoyaltySchemeResponse.parse(value),
      ),
      platformRequest<unknown>("/loyalty").then((value) => zGetMyLoyaltyResponse.parse(value)),
    ]);
    return { kind: "ok", scheme, account };
  } catch {
    return { kind: "unreachable" };
  }
}
