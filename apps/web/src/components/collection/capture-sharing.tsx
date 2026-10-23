"use client";

import type { Capture } from "@darkview/contracts";
import { zSetCaptureVisibilityResponse } from "@darkview/contracts/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { captureSharingCopy } from "@/i18n/resources/collection";
import {
  ApiRequestError,
  apiRequest,
  navigateWithFreshSession,
} from "@/lib/platform/browser";

type CaptureSharingProps = {
  captureId: string;
  locale: Locale;
  mode: Capture["mode"];
  visibility: Capture["visibility"];
};

/**
 * ADR-065: the owner makes a capture public or private, then copies the link or hands it
 * to the system share sheet. A simulated capture is never shared, and says why.
 */
export function CaptureSharing({
  captureId,
  locale,
  mode,
  visibility,
}: CaptureSharingProps) {
  const copy = captureSharingCopy[locale];
  const [current, setCurrent] = useState(visibility);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<"copied" | "failed" | null>(null);
  const path = `/${locale}/c/${encodeURIComponent(captureId)}`;
  const publicUrl = () => new URL(path, window.location.origin).toString();

  async function set(next: Capture["visibility"]) {
    setSaving(true);
    setNotice(null);
    try {
      const capture = await apiRequest(`/captures/${encodeURIComponent(captureId)}`, {
        method: "PATCH",
        body: { visibility: next },
        schema: zSetCaptureVisibilityResponse,
      });
      setCurrent(capture.visibility);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        navigateWithFreshSession(`/${locale}/sign-in`);
        return;
      }
      setNotice("failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl());
      setNotice("copied");
    } catch {
      setNotice("failed");
    }
  }

  async function share() {
    try {
      await navigator.share({ url: publicUrl() });
    } catch {
      // Dismissing the share sheet is not a failure worth saying anything about.
    }
  }

  const shared = current === "GALLERY";
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <section className="capture-sharing" aria-labelledby="capture-sharing-title">
      <h2 id="capture-sharing-title" className="plate-title">
        {copy.title}
      </h2>
      {mode !== "REAL" ? (
        <p className="capture-sharing-note">{copy.simulated}</p>
      ) : (
        <>
          <p className="capture-sharing-note" data-sharing={current}>
            {shared ? copy.public : copy.private}
          </p>
          <div className="capture-sharing-actions">
            <Button
              variant={shared ? "secondary" : "primary"}
              disabled={saving}
              onClick={() => void set(shared ? "PRIVATE" : "GALLERY")}
            >
              {saving ? copy.saving : shared ? copy.makePrivate : copy.makePublic}
            </Button>
            {shared && (
              <>
                <Button variant="secondary" onClick={() => void copyLink()}>
                  {copy.copyLink}
                </Button>
                {canShare && (
                  <Button variant="secondary" onClick={() => void share()}>
                    {copy.share}
                  </Button>
                )}
              </>
            )}
          </div>
          {shared && (
            <p className="capture-sharing-link">
              <span>{copy.linkLabel}</span> <a href={path}>{path}</a>
            </p>
          )}
        </>
      )}
      {notice && (
        <p
          className="capture-sharing-notice"
          role={notice === "failed" ? "alert" : "status"}
        >
          {notice === "copied" ? copy.copied : copy.failed}
        </p>
      )}
    </section>
  );
}
