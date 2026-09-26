import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import {
  captureReference,
  captureTitle,
  formatCapturedAt,
} from "@/features/collection/present";
import type { CollectionEntry, CollectionResult } from "@/features/collection/read";
import { targetDescription } from "@/features/targets/present";
import type { Locale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";

import { CaptureBadges, CaptureCard, CaptureImage } from "./capture-card";

type CollectionGalleryProps = {
  result: Exclude<CollectionResult, { kind: "signed-out" }>;
  /** True past the first page: no featured capture, and a way back to the newest. */
  paged: boolean;
  locale: Locale;
};

function Featured({
  entry,
  locale,
  timezone,
}: {
  entry: CollectionEntry;
  locale: Locale;
  timezone: string;
}) {
  const copy = collectionGalleryCopy[locale];
  const { capture, target, thumbnail } = entry;
  const title = captureTitle(entry, locale);
  const href = `/${locale}/app/collection/${capture.id}`;
  const about = target ? targetDescription(target, locale) : null;

  return (
    <section className="featured-capture" aria-labelledby="featured-capture-title">
      <Link
        className="featured-capture-image"
        href={href}
        aria-label={`${copy.view}: ${title}`}
      >
        <CaptureImage
          alt={copy.imageAlt(title)}
          captureId={capture.id}
          noPreview={copy.noPreview}
          preload
          sizes="(min-width: 1120px) 62vw, 100vw"
          src={thumbnail}
        />
        <span className="featured-reticle" aria-hidden="true">
          <i />
          <i />
        </span>
        <CaptureBadges
          simulated={capture.mode === "SIMULATED"}
          simulatedLabel={copy.simulated}
          visibility={capture.visibility}
          visibilityLabel={copy.visibility[capture.visibility]}
        />
      </Link>
      <div className="featured-capture-copy">
        <span>{copy.featured}</span>
        <p>{captureReference(entry)}</p>
        <h2 id="featured-capture-title">{title}</h2>
        {entry.retired && <p className="capture-retired">{copy.retiredTarget}</p>}
        {about && <blockquote>{about}</blockquote>}
        <p className="featured-capture-time">
          {formatCapturedAt(capture.capturedAt, timezone, locale)}
        </p>
        <Link className="button button-primary button-large" href={href}>
          <span>{copy.view}</span>
        </Link>
      </div>
    </section>
  );
}

export function CollectionGallery({ locale, paged, result }: CollectionGalleryProps) {
  const copy = collectionGalleryCopy[locale];
  const base = `/${locale}/app/collection`;

  const hero = (
    <header className="collection-hero">
      <p className="eyebrow">
        <span aria-hidden="true" />
        {copy.eyebrow}
      </p>
      <div>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </div>
    </header>
  );

  if (result.kind === "unreachable") {
    return (
      <div className="collection-page">
        {hero}
        <div className="collection-state">
          <StatePanel variant="error" headingLevel={2} {...copy.unreachable} />
        </div>
      </div>
    );
  }

  if (result.entries.length === 0) {
    const state = paged ? copy.noOlder : copy.empty;
    return (
      <div className="collection-page">
        {hero}
        <div className="collection-state">
          <StatePanel
            headingLevel={2}
            title={state.title}
            description={state.description}
            action={
              <Link
                className="button button-secondary"
                href={paged ? base : `/${locale}/app/missions`}
              >
                <span>{state.action}</span>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const [first, ...rest] = result.entries;
  const featured = paged ? null : first;
  const archive = paged ? result.entries : rest;

  return (
    <div className="collection-page">
      {hero}

      {featured && (
        <Featured entry={featured} locale={locale} timezone={result.timezone} />
      )}

      {archive.length > 0 && (
        <section className="capture-archive" aria-labelledby="capture-archive-title">
          <header>
            <h2 id="capture-archive-title">{copy.allCaptures}</h2>
            <p>{copy.allDescription}</p>
          </header>
          <div className="capture-grid">
            {archive.map((entry) => (
              <CaptureCard
                key={entry.capture.id}
                captureId={entry.capture.id}
                href={`${base}/${entry.capture.id}`}
                title={captureTitle(entry, locale)}
                reference={captureReference(entry)}
                capturedAt={formatCapturedAt(
                  entry.capture.capturedAt,
                  result.timezone,
                  locale,
                )}
                thumbnail={entry.thumbnail}
                simulated={entry.capture.mode === "SIMULATED"}
                visibility={entry.capture.visibility}
                copy={copy}
              />
            ))}
          </div>
        </section>
      )}

      {(paged || result.nextCursor) && (
        <nav className="collection-pages" aria-label={copy.allCaptures}>
          {paged && (
            <Link className="button button-ghost" href={base}>
              <span>{copy.newestCaptures}</span>
            </Link>
          )}
          {result.nextCursor && (
            <Link
              className="button button-secondary"
              href={`${base}?cursor=${encodeURIComponent(result.nextCursor)}`}
            >
              <span>{copy.olderCaptures}</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
