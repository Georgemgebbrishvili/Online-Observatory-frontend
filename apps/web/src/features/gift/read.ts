import "server-only";

import type { GiftVoucher } from "@darkview/contracts";
import { zListMyGiftVouchersResponse } from "@darkview/contracts/zod";

import { PlatformError, platformRequest } from "@/lib/platform/client";

export type GiftsResult =
  { kind: "ok"; items: GiftVoucher[] } | { kind: "signed-out" } | { kind: "unreachable" };

/** GET /vouchers (DV-112, ADR-067): the gifts the signed-in customer bought. */
export async function readGifts(): Promise<GiftsResult> {
  try {
    const list = zListMyGiftVouchersResponse.parse(
      await platformRequest<unknown>("/vouchers"),
    );
    return { kind: "ok", items: list.items };
  } catch (error) {
    if (error instanceof PlatformError && error.status === 401)
      return { kind: "signed-out" };
    return { kind: "unreachable" };
  }
}
