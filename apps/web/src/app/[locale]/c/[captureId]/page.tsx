import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { brand } from "@/brand";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";
import {
  formatCapturedAt,
  formatExposure,
  formatIntegration,
} from "@/features/collection/present";
import { readGalleryCapture } from "@/features/collection/read-gallery";
import { fill } from "@/features/operator/format";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { collectionGalleryCopy, galleryPageCopy } from "@/i18n/resources/collection";
import "@/styles/pages.css";
import "@/styles/gallery.css";

// A shared link is read when it is opened: a capture made private a minute ago is gone.
export const dynamic = "force-dynamic";

type GalleryPageProps = { params: Promise<{ locale: string; captureId: string }> };

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { locale, captureId } = await params;
  if (!isLocale(locale)) return {};
  // Shared, not published: the owner chose who gets the link, not a search engine.
  const robots = { index: false, follow: false };
  const result = await readGalleryCapture(captureId);
  if (result.kind !== "ok") return { robots };

  const copy = galleryPageCopy[locale];
  const { capture } = result;
  const target = locale === "ka" ? capture.target.nameKa : capture.target.nameEn;
  const date = formatCapturedAt(capture.capturedAt, capture.place.timezone, locale);
  const title = fill(copy.metadataTitle, { target });
  const description = fill(copy.metadataDescription, { target, date });
  const site = locale === "ka" ? brand.ka.nominative : brand.en.name;
  return {
    title: `${title} · ${site}`,
    description,
    robots,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale, captureId } = await params;
  if (!isLocale(locale)) notFound();

  const result = await readGalleryCapture(captureId);
  if (result.kind === "not-found") notFound();

  const dictionary = await getDictionary(locale);
  const copy = galleryPageCopy[locale];

  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      {result.kind === "unreachable" ? (
        <main className="gallery-page" id="main-content">
          <StatePanel
            variant="error"
            headingLevel={1}
            {...collectionGalleryCopy[locale].unreachable}
          />
        </main>
      ) : (
        <GalleryCaptureView locale={locale} capture={result.capture} copy={copy} />
      )}
      <SiteFooter footer={dictionary.footer} locale={locale} path={`c/${captureId}`} />
    </div>
  );
}

function GalleryCaptureView({
  capture,
  copy,
  locale,
}: {
  capture: Extract<
    Awaited<ReturnType<typeof readGalleryCapture>>,
    { kind: "ok" }
  >["capture"];
  copy: (typeof galleryPageCopy)["en" | "ka"];
  locale: "en" | "ka";
}) {
  const target = locale === "ka" ? capture.target.nameKa : capture.target.nameEn;
  const facts: [string, string][] = [
    [copy.taken, formatCapturedAt(capture.capturedAt, capture.place.timezone, locale)],
    [copy.place, copy.placeValue],
    [
      copy.instrument,
      fill(copy.instrumentValue, {
        aperture: String(capture.telescope.apertureMm),
        focal: String(capture.telescope.focalLengthMm),
      }),
    ],
    [copy.exposure, formatExposure(capture.exposureMilliseconds, locale)],
    [copy.stack, fill(copy.frames, { count: String(capture.framesStacked) })],
    [copy.integration, formatIntegration(capture.integrationSeconds, locale)],
  ];

  return (
    <main className="gallery-page" id="main-content">
      <Container>
        <header className="gallery-header">
          <p className="kicker">{copy.kicker}</p>
          <h1>{target}</h1>
        </header>
        <figure className="gallery-image">
          {/* A short-lived signed URL from the platform; next/image would cache it past its life. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.imageUrl}
            alt={fill(copy.imageAlt, { target })}
            width={capture.widthPx ?? undefined}
            height={capture.heightPx ?? undefined}
          />
        </figure>
        <div className="gallery-lower">
          <dl className="ruled-specs gallery-facts">
            {facts.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <aside className="gallery-call plate">
            <h2>{copy.callTitle}</h2>
            <p>{copy.callBody}</p>
            <ButtonLink href={`/${locale}/app/book`}>{copy.call}</ButtonLink>
          </aside>
        </div>
      </Container>
    </main>
  );
}
