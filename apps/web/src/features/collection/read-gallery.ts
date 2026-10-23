import "server-only";

import type { GalleryCapture } from "@darkview/contracts";
import { zGetGalleryCaptureResponse } from "@darkview/contracts/zod";
import { cache } from "react";

import { PlatformError, platformRequest } from "@/lib/platform/client";

export type GalleryResult =
  | { kind: "ok"; capture: GalleryCapture }
  | { kind: "not-found" }
  | { kind: "unreachable" };

/**
 * ADR-065: a shared capture, for anyone. Private, simulated, deleted and unknown are all
 * the platform's one 404, and so all one not-found here.
 */
// cache(): the page, its metadata and its Open Graph image read the same capture.
export const readGalleryCapture = cache(
  async (captureId: string): Promise<GalleryResult> => {
    if (!/^[A-Za-z0-9-]{1,64}$/.test(captureId)) return { kind: "not-found" };
    try {
      const capture = zGetGalleryCaptureResponse.parse(
        await platformRequest<unknown>(`/gallery/${encodeURIComponent(captureId)}`),
      );
      return { kind: "ok", capture };
    } catch (error) {
      if (error instanceof PlatformError && error.status === 404)
        return { kind: "not-found" };
      return { kind: "unreachable" };
    }
  },
);
