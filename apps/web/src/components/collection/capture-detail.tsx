import Link from "next/link";

import {
  captureReference,
  captureTitle,
  formatCapturedAt,
  formatExposure,
  formatFrameSize,
  formatIntegration,
} from "@/features/collection/present";
import type { CaptureResult } from "@/features/collection/read";
import { targetDescription } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { captureDetailCopy, collectionGalleryCopy } from "@/i18n/resources/collection";

import { CaptureBadges, CaptureImage } from "./capture-card";
import { CaptureDownloads } from "./capture-downloads";

type CaptureDetailProps = {
  result: Extract<CaptureResult, { kind: "ok" }>;
  locale: Locale;
};

export function CaptureDetail({ locale, result }: CaptureDetailProps) {
  const copy = captureDetailCopy[locale];
  const gallery = collectionGalleryCopy[locale];
  const { entry, image, observatory, timezone } = result;
  const { capture, target } = entry;
  const title = captureTitle(entry, locale);
  const about = target ? targetDescription(target, locale) : null;
  const frameSize = formatFrameSize(capture);

  const provenance: [string, string][] = [
    [copy.source, copy.sources[capture.mode]],
    [copy.profile, gallery.profiles[capture.imagingProfile]],
    [copy.optics, copy.opticalConfigs[capture.opticalConfig]],
    ...(capture.solvedFocalLengthMm
      ? ([[copy.solvedFocalLength, `${Math.round(capture.solvedFocalLengthMm)} mm`]] as [
          string,
          string,
        ][])
      : []),
    [copy.exposure, formatExposure(capture.exposureMilliseconds, locale)],
    [copy.gain, String(capture.gain)],
    [copy.stack, copy.frames(capture.framesStacked)],
    [copy.integration, formatIntegration(capture.integrationSeconds, locale)],
    ...(frameSize ? ([[copy.frameSize, frameSize]] as [string, string][]) : []),
    [copy.mission, capture.missionId],
    [copy.captureId, capture.id],
  ];

  return (
    <article className="capture-detail-page">
      <Link className="capture-detail-back" href={`/${locale}/app/collection`}>
        <span aria-hidden="true">←</span> {copy.back}
      </Link>

      <header className="capture-detail-header">
        <div>
          <p>{captureReference(entry)}</p>
          <h1>{title}</h1>
          {entry.retired && <p className="capture-retired">{gallery.retiredTarget}</p>}
          <strong>{copy.capturedBy}</strong>
        </div>
        <dl>
          <div>
            <dt>{copy.date}</dt>
            <dd>{formatCapturedAt(capture.capturedAt, timezone, locale)}</dd>
          </div>
          {observatory && (
            <div>
              <dt>{copy.observatory}</dt>
              <dd>{locale === "ka" ? observatory.nameKa : observatory.nameEn}</dd>
            </div>
          )}
        </dl>
      </header>

      <figure className="capture-detail-image">
        {image.kind === "failed" ? (
          <span className="capture-no-preview" role="alert">
            <span aria-hidden="true">!</span>
            {copy.imageFailed}
          </span>
        ) : (
          <CaptureImage
            alt={gallery.imageAlt(title)}
            captureId={capture.id}
            noPreview={gallery.noPreview}
            preload
            sizes="(min-width: 1120px) 74vw, 100vw"
            src={image.kind === "ok" ? image.url : null}
          />
        )}
        <span className="capture-detail-corners" aria-hidden="true" />
        <figcaption>
          <CaptureBadges
            simulated={capture.mode === "SIMULATED"}
            simulatedLabel={gallery.simulated}
            visibility={capture.visibility}
            visibilityLabel={gallery.visibility[capture.visibility]}
          />
        </figcaption>
      </figure>

      <div className="capture-detail-lower">
        <div className="capture-detail-story">
          {about && (
            <>
              <h2>{copy.aboutTarget}</h2>
              <p>{about}</p>
            </>
          )}
          <CaptureDownloads
            captureId={capture.id}
            fitsAvailable={capture.fitsAvailable}
            signInPath={`/${locale}/sign-in`}
            copy={{
              download: copy.download,
              downloadFits: copy.downloadFits,
              noFits: copy.noFits,
              downloadFailed: copy.downloadFailed,
              downloadNote: copy.downloadNote,
            }}
          />
        </div>

        <aside className="capture-provenance">
          <h2>{copy.provenance}</h2>
          <dl>
            {provenance.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <div>
              <dt>{copy.visibilityLabel}</dt>
              <dd>{gallery.visibility[capture.visibility]}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </article>
  );
}
