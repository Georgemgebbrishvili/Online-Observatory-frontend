"use client";

import type { CaptureAssetKind } from "@darkview/contracts";
import { zGetCaptureDownloadResponse } from "@darkview/contracts/zod";
import { useState } from "react";

import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

type CaptureDownloadsProps = {
  captureId: string;
  fitsAvailable: boolean;
  signInPath: string;
  copy: {
    download: string;
    downloadFits: string;
    noFits: string;
    downloadFailed: string;
    downloadNote: string;
  };
};

/**
 * Each link is minted on the click, not at render: a signed URL expires within
 * minutes, and a page left open would otherwise hand over a dead one.
 */
export function CaptureDownloads({
  captureId,
  copy,
  fitsAvailable,
  signInPath,
}: CaptureDownloadsProps) {
  const [pending, setPending] = useState<CaptureAssetKind | null>(null);
  const [failed, setFailed] = useState(false);

  async function download(kind: CaptureAssetKind) {
    setPending(kind);
    setFailed(false);
    try {
      const { url } = await apiRequest(
        `/captures/${encodeURIComponent(captureId)}/download?kind=${kind}`,
        { schema: zGetCaptureDownloadResponse },
      );
      // Cross-origin, so `download` would be ignored: the browser opens it instead.
      window.location.assign(url);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(signInPath);
        return;
      }
      setFailed(true);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="capture-downloads">
      <div className="capture-actions">
        <button
          className="button button-primary button-large"
          type="button"
          disabled={pending !== null}
          aria-busy={pending === "IMAGE"}
          onClick={() => download("IMAGE")}
        >
          <span>{copy.download}</span>
        </button>
        {fitsAvailable ? (
          <button
            className="button button-secondary button-large"
            type="button"
            disabled={pending !== null}
            aria-busy={pending === "FITS"}
            onClick={() => download("FITS")}
          >
            <span>{copy.downloadFits}</span>
          </button>
        ) : (
          <p className="capture-no-fits">{copy.noFits}</p>
        )}
      </div>
      <p className="capture-download-note">{copy.downloadNote}</p>
      {failed && (
        <p className="capture-action-feedback" role="alert">
          {copy.downloadFailed}
        </p>
      )}
    </div>
  );
}
