import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import {
  captures,
  getCollectionProgress,
  progressCollections,
  type Capture,
} from "@/features/collection/captures";
import type { Locale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";

type CollectionGalleryProps = {
  locale: Locale;
};

function formatDate(locale: Locale, capturedAt: string) {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tbilisi",
  }).format(new Date(capturedAt));
}

function CaptureCard({ capture, locale }: { capture: Capture; locale: Locale }) {
  const copy = collectionGalleryCopy[locale];

  return (
    <article className="capture-card">
      <Link
        className="capture-card-image"
        href={`/${locale}/app/collection/${capture.id}`}
        aria-label={`${copy.view}: ${capture.target[locale]}`}
      >
        <ViewTransition
          name={`capture-${capture.id}`}
          share="capture-morph"
          default="none"
        >
          <Image
            src={capture.thumbnailUrl}
            alt={copy.imageAlt(capture.target[locale])}
            fill
            sizes="(min-width: 1440px) 25vw, (min-width: 768px) 42vw, 92vw"
            unoptimized
          />
        </ViewTransition>
        <span className="capture-card-corners" aria-hidden="true" />
        <span
          className={`capture-privacy capture-privacy-${capture.visibility.toLowerCase()}`}
        >
          {capture.visibility === "PUBLIC" ? copy.public : copy.private}
        </span>
      </Link>
      <div className="capture-card-copy">
        <span>
          {capture.catalogId} · {capture.id}
        </span>
        <h3>
          <Link href={`/${locale}/app/collection/${capture.id}`}>
            {capture.target[locale]}
          </Link>
        </h3>
        <p>
          {formatDate(locale, capture.capturedAt)} ·{" "}
          {copy.presets[capture.processingPreset]}
        </p>
      </div>
    </article>
  );
}

export function CollectionGallery({ locale }: CollectionGalleryProps) {
  const copy = collectionGalleryCopy[locale];
  const [featuredCapture, ...archiveCaptures] = captures;

  return (
    <div className="collection-page">
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

      <section className="featured-capture" aria-labelledby="featured-capture-title">
        <Link
          className="featured-capture-image"
          href={`/${locale}/app/collection/${featuredCapture.id}`}
        >
          <ViewTransition
            name={`capture-${featuredCapture.id}`}
            share="capture-morph"
            default="none"
          >
            <Image
              src={featuredCapture.originalAssetUrl}
              alt={copy.imageAlt(featuredCapture.target[locale])}
              fill
              preload
              sizes="(min-width: 1120px) 62vw, 100vw"
              unoptimized
            />
          </ViewTransition>
          <span className="featured-reticle" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="featured-index">
            01 / {String(captures.length).padStart(2, "0")}
          </span>
        </Link>
        <div className="featured-capture-copy">
          <span>{copy.featured}</span>
          <p>
            {featuredCapture.catalogId} · {featuredCapture.id}
          </p>
          <h2 id="featured-capture-title">{featuredCapture.target[locale]}</h2>
          <blockquote>{featuredCapture.description[locale]}</blockquote>
          <dl>
            <div>
              <dt>{copy.captured}</dt>
              <dd>{formatDate(locale, featuredCapture.capturedAt)}</dd>
            </div>
            <div>
              <dt>{copy.observatory}</dt>
              <dd>{featuredCapture.observatory[locale]}</dd>
            </div>
            <div>
              <dt>{copy.preset}</dt>
              <dd>{copy.presets[featuredCapture.processingPreset]}</dd>
            </div>
          </dl>
          <Link
            className="button button-primary button-large"
            href={`/${locale}/app/collection/${featuredCapture.id}`}
          >
            <span>{copy.view}</span>
          </Link>
        </div>
      </section>

      <section className="capture-archive" aria-labelledby="capture-archive-title">
        <header>
          <h2 id="capture-archive-title">{copy.allCaptures}</h2>
          <p>{copy.allDescription}</p>
        </header>
        <div className="capture-grid">
          {archiveCaptures.map((capture) => (
            <CaptureCard key={capture.id} capture={capture} locale={locale} />
          ))}
        </div>
      </section>

      <section
        className="progress-collections"
        aria-labelledby="progress-collections-title"
      >
        <header>
          <h2 id="progress-collections-title">{copy.progress}</h2>
          <p>{copy.progressDescription}</p>
        </header>
        <div className="progress-collection-grid">
          {progressCollections.map((collection, index) => {
            const progress = getCollectionProgress(collection);
            return (
              <article key={collection.id} className="progress-collection-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{collection.title[locale]}</h3>
                <p>{collection.description[locale]}</p>
                <div className="collection-progress-track" aria-hidden="true">
                  <span style={{ width: `${progress.percentage}%` }} />
                </div>
                <strong>
                  {progress.completed} / {progress.total} {copy.observed}
                </strong>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
