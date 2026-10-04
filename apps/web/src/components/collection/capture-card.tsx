import type { CaptureVisibility } from "@darkview/contracts";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

type CaptureCardProps = {
  captureId: string;
  href: string;
  title: string;
  reference: string;
  capturedAt: string;
  thumbnail: string | null;
  simulated: boolean;
  visibility: CaptureVisibility;
  copy: {
    view: string;
    imageAlt: (target: string) => string;
    simulated: string;
    noPreview: string;
    visibility: Record<CaptureVisibility, string>;
  };
};

/** The image, or a plain statement that there is none: never a stand-in picture. */
export function CaptureImage({
  alt,
  captureId,
  noPreview,
  preload = false,
  sizes,
  src,
}: {
  alt: string;
  captureId: string;
  noPreview: string;
  preload?: boolean;
  sizes: string;
  src: string | null;
}) {
  if (!src) {
    return (
      <span className="capture-no-preview">
        <span aria-hidden="true">○</span>
        {noPreview}
      </span>
    );
  }
  return (
    <ViewTransition name={`capture-${captureId}`} share="capture-morph" default="none">
      {/* Signed, short-lived and already sized: the optimizer would cache a credential. */}
      <Image src={src} alt={alt} fill preload={preload} sizes={sizes} unoptimized />
    </ViewTransition>
  );
}

export function CaptureBadges({
  simulated,
  simulatedLabel,
  visibility,
  visibilityLabel,
}: {
  simulated: boolean;
  simulatedLabel: string;
  visibility: CaptureVisibility;
  visibilityLabel: string;
}) {
  return (
    <span className="capture-badges">
      {simulated && <span className="capture-simulated">{simulatedLabel}</span>}
      <span className={`capture-privacy capture-privacy-${visibility.toLowerCase()}`}>
        {visibilityLabel}
      </span>
    </span>
  );
}

export function CaptureCard({
  capturedAt,
  captureId,
  copy,
  href,
  reference,
  simulated,
  thumbnail,
  title,
  visibility,
}: CaptureCardProps) {
  return (
    <article className="capture-card">
      <Link
        className="capture-card-image"
        href={href}
        aria-label={`${copy.view}: ${title}`}
      >
        <CaptureImage
          alt={copy.imageAlt(title)}
          captureId={captureId}
          noPreview={copy.noPreview}
          sizes="(min-width: 1440px) 25vw, (min-width: 768px) 42vw, 92vw"
          src={thumbnail}
        />
        <CaptureBadges
          simulated={simulated}
          simulatedLabel={copy.simulated}
          visibility={visibility}
          visibilityLabel={copy.visibility[visibility]}
        />
      </Link>
      <div className="capture-card-copy">
        <span className="capture-card-reference">{reference}</span>
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        <p>{capturedAt}</p>
      </div>
    </article>
  );
}
