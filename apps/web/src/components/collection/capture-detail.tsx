"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, ViewTransition } from "react";

import type { Capture, CaptureVisibility } from "@/features/collection/captures";
import type { Locale } from "@/i18n/config";
import { captureDetailCopy } from "@/i18n/resources/collection";

type CaptureDetailProps = {
  capture: Capture;
  locale: Locale;
};

export function CaptureDetail({ capture, locale }: CaptureDetailProps) {
  const [visibility, setVisibility] = useState<CaptureVisibility>(capture.visibility);
  const [feedback, setFeedback] = useState<string | null>(null);
  const copy = captureDetailCopy[locale];
  const capturedAt = new Date(
    new Date(capture.capturedAt).getTime() + 4 * 60 * 60 * 1000,
  );
  const captureDate = copy.formatDate(
    capturedAt.getUTCDate(),
    copy.months[capturedAt.getUTCMonth()],
    capturedAt.getUTCFullYear(),
    `${String(capturedAt.getUTCHours()).padStart(2, "0")}:${String(
      capturedAt.getUTCMinutes(),
    ).padStart(2, "0")}`,
  );

  async function shareCapture() {
    if (visibility === "PRIVATE") {
      setFeedback(copy.privateShare);
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setFeedback(copy.copied);
    } catch {
      setFeedback(copy.copyFailed);
    }
  }

  function toggleVisibility() {
    const nextVisibility = visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setVisibility(nextVisibility);
    setFeedback(nextVisibility === "PUBLIC" ? copy.privacyPublic : copy.privacyPrivate);
  }

  return (
    <article className="capture-detail-page">
      <Link className="capture-detail-back" href={`/${locale}/app/collection`}>
        <span aria-hidden="true">←</span> {copy.back}
      </Link>

      <header className="capture-detail-header">
        <div>
          <p>
            {capture.catalogId} · {capture.id}
          </p>
          <h1>{capture.target[locale]}</h1>
          <strong>{copy.capturedBy}</strong>
        </div>
        <dl>
          <div>
            <dt>{copy.date}</dt>
            <dd>{captureDate}</dd>
          </div>
          <div>
            <dt>{copy.observatory}</dt>
            <dd>{capture.observatory[locale]}</dd>
          </div>
        </dl>
      </header>

      <figure className="capture-detail-image">
        <ViewTransition
          name={`capture-${capture.id}`}
          share="capture-morph"
          default="none"
        >
          <Image
            src={capture.originalAssetUrl}
            alt={copy.imageAlt(capture.target[locale])}
            fill
            preload
            sizes="(min-width: 1120px) 74vw, 100vw"
            unoptimized
          />
        </ViewTransition>
        <span className="capture-detail-corners" aria-hidden="true" />
        <figcaption>
          {copy.original} · {copy.presets[capture.processingPreset]}
        </figcaption>
      </figure>

      <div className="capture-detail-lower">
        <div className="capture-detail-story">
          <p>{capture.description[locale]}</p>
          <div className="capture-actions">
            <a
              className="button button-primary button-large"
              href={capture.originalAssetUrl}
              download={`${capture.id}.svg`}
            >
              <span>{copy.download}</span>
            </a>
            <button
              className="button button-secondary button-large"
              type="button"
              onClick={shareCapture}
            >
              <span>{copy.share}</span>
            </button>
            <button
              className="button button-secondary button-large"
              type="button"
              onClick={toggleVisibility}
            >
              <span>{visibility === "PUBLIC" ? copy.makePrivate : copy.makePublic}</span>
            </button>
            <Link
              className="button button-ghost button-large"
              href={`/${locale}/app/missions/${capture.missionId}/session`}
            >
              <span>{copy.viewMission}</span>
            </Link>
          </div>
          {feedback && (
            <p className="capture-action-feedback" role="status">
              {feedback}
            </p>
          )}
        </div>

        <aside className="capture-provenance">
          <h2>{copy.provenance}</h2>
          <dl>
            <div>
              <dt>{copy.telescope}</dt>
              <dd>{capture.telescope}</dd>
            </div>
            <div>
              <dt>{copy.mission}</dt>
              <dd>{capture.missionId}</dd>
            </div>
            <div>
              <dt>{copy.captureId}</dt>
              <dd>{capture.id}</dd>
            </div>
            <div>
              <dt>{copy.preset}</dt>
              <dd>{copy.presets[capture.processingPreset]}</dd>
            </div>
            <div>
              <dt>{copy.visibility}</dt>
              <dd>
                <span
                  className={`capture-privacy capture-privacy-${visibility.toLowerCase()}`}
                >
                  {visibility === "PUBLIC" ? copy.public : copy.private}
                </span>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </article>
  );
}
