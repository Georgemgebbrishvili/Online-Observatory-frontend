import "server-only";

import type { BookableObservatory, Capture, Target } from "@darkview/contracts";
import {
  zCaptureId,
  zGetCaptureDownloadResponse,
  zGetCaptureResponse,
  zGetMissionResponse,
  zListBookableObservatoriesResponse,
  zListCapturesResponse,
  zListTargetsResponse,
} from "@darkview/contracts/zod";
import { cache } from "react";

import { PlatformError, platformRequest } from "@/lib/platform/client";
import { storageOrigin } from "@/lib/platform/config";

export type CollectionEntry = {
  capture: Capture;
  /** Null when the target has been disabled since, or the catalogue could not be read. */
  target: Target | null;
  /** The catalogue was read and this target is not in it: only then is it "retired". */
  retired: boolean;
  /** The signed thumbnail, or null when there is none or this app may not load it. */
  thumbnail: string | null;
};

export type CollectionResult =
  | {
      kind: "ok";
      entries: CollectionEntry[];
      nextCursor: string | null;
      /** The first-party observatory's, for capture times; UTC when it cannot be read. */
      timezone: string;
    }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

export type CaptureImage =
  { kind: "ok"; url: string } | { kind: "none" } | { kind: "failed" };

export type CaptureResult =
  | {
      kind: "ok";
      entry: CollectionEntry;
      image: CaptureImage;
      /** Null when the mission or the observatory list could not be read. */
      observatory: BookableObservatory | null;
      timezone: string;
    }
  | { kind: "not-found" }
  | { kind: "signed-out" }
  | { kind: "unreachable" };

const pageSize = 24;

/**
 * A signed URL only if the CSP lets the browser load it. Anything else would render
 * as a broken image, so it is treated as no image at all.
 */
function loadable(url: string | null | undefined) {
  if (!url || !storageOrigin) return null;
  try {
    return new URL(url).origin === storageOrigin ? url : null;
  } catch {
    return null;
  }
}

function failure(error: unknown): { kind: "signed-out" } | { kind: "unreachable" } {
  return error instanceof PlatformError && error.status === 401
    ? { kind: "signed-out" }
    : { kind: "unreachable" };
}

export const readObservatories = cache(
  async (): Promise<BookableObservatory[] | null> => {
    try {
      return zListBookableObservatoriesResponse.parse(
        await platformRequest<unknown>("/observatories"),
      ).items;
    } catch {
      return null;
    }
  },
);

/**
 * GET /targets, every page. A capture names its target only by id, and the catalogue
 * answers enabled targets only, so a target disabled since is simply absent.
 */
export const readCatalogue = cache(async (): Promise<Map<string, Target> | null> => {
  const byId = new Map<string, Target>();
  let cursor: string | null = null;
  try {
    // Bounded, so a platform that never stops answering hasMore cannot hang a render.
    for (let page = 0; page < 20; page += 1) {
      const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
      const { items, page: meta } = zListTargetsResponse.parse(
        await platformRequest<unknown>(`/targets?limit=100${query}`),
      );
      for (const target of items) byId.set(target.id, target);
      cursor = meta.hasMore ? (meta.nextCursor ?? null) : null;
      if (!cursor) return byId;
    }
    return byId;
  } catch {
    return null;
  }
});

export function entryOf(
  capture: Capture,
  catalogue: Map<string, Target> | null,
): CollectionEntry {
  return {
    capture,
    target: catalogue?.get(capture.targetId) ?? null,
    retired: catalogue !== null && !catalogue.has(capture.targetId),
    thumbnail: loadable(capture.thumbnailUrl),
  };
}

/** The cursor is a capture id; anything else is ignored and the list starts at the newest. */
export function cursorOf(value: string | string[] | undefined) {
  return typeof value === "string" && zCaptureId.safeParse(value).success ? value : null;
}

/** GET /captures: one page of the signed-in user's Collection, newest first. */
export async function readCollection(
  cursor: string | null,
  limit = pageSize,
): Promise<CollectionResult> {
  try {
    const query = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
    const [page, catalogue, observatories] = await Promise.all([
      platformRequest<unknown>(`/captures?limit=${limit}${query}`).then((value) =>
        zListCapturesResponse.parse(value),
      ),
      readCatalogue(),
      readObservatories(),
    ]);
    // Phase 1 is one first-party telescope (ADR-003); a capture does not name its own.
    const firstParty = observatories?.find(
      (candidate) => candidate.kind === "FIRST_PARTY",
    );
    return {
      kind: "ok",
      entries: page.items.map((capture) => entryOf(capture, catalogue)),
      nextCursor: page.page.hasMore ? (page.page.nextCursor ?? null) : null,
      timezone: firstParty?.timezone ?? "UTC",
    };
  } catch (error) {
    return failure(error);
  }
}

/** GET /captures/{id}/download?kind=IMAGE, minted for this render. */
async function readImage(captureId: string): Promise<CaptureImage> {
  try {
    const { url } = zGetCaptureDownloadResponse.parse(
      await platformRequest<unknown>(
        `/captures/${encodeURIComponent(captureId)}/download?kind=IMAGE`,
      ),
    );
    const allowed = loadable(url);
    return allowed ? { kind: "ok", url: allowed } : { kind: "none" };
  } catch (error) {
    // A capture with no IMAGE asset answers 404 for that asset: an ordinary miss.
    if (error instanceof PlatformError && error.status === 404) return { kind: "none" };
    return { kind: "failed" };
  }
}

/** The observatory the capture's mission ran on. Only a label, so never fatal. */
async function readObservatory(missionId: string) {
  try {
    const [mission, observatories] = await Promise.all([
      platformRequest<unknown>(`/missions/${encodeURIComponent(missionId)}`).then(
        (value) => zGetMissionResponse.parse(value),
      ),
      readObservatories(),
    ]);
    return (
      observatories?.find((candidate) => candidate.id === mission.observatoryId) ?? null
    );
  } catch {
    return null;
  }
}

/** GET /captures/{id}. Somebody else's capture and no capture are the same 404. */
// cache(): generateMetadata and the page read the same capture in one request.
export const readCapture = cache(async (captureId: string): Promise<CaptureResult> => {
  if (!zCaptureId.safeParse(captureId).success) return { kind: "not-found" };

  let capture: Capture;
  try {
    capture = zGetCaptureResponse.parse(
      await platformRequest<unknown>(`/captures/${encodeURIComponent(captureId)}`),
    );
  } catch (error) {
    if (error instanceof PlatformError && error.status === 404)
      return { kind: "not-found" };
    return failure(error);
  }

  const [catalogue, image, observatory] = await Promise.all([
    readCatalogue(),
    readImage(capture.id),
    readObservatory(capture.missionId),
  ]);

  return {
    kind: "ok",
    entry: entryOf(capture, catalogue),
    image,
    observatory,
    timezone: observatory?.timezone ?? "UTC",
  };
});
