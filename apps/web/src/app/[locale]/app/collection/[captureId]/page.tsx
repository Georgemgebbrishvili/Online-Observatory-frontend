import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CaptureDetail } from "@/components/collection/capture-detail";
import { StatePanel } from "@/components/ui/state-panel";
import { captureTitle } from "@/features/collection/present";
import { readCapture } from "@/features/collection/read";
import { isLocale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";
import { brand } from "@/brand";

type CaptureDetailPageProps = {
  params: Promise<{ locale: string; captureId: string }>;
};

export async function generateMetadata({
  params,
}: CaptureDetailPageProps): Promise<Metadata> {
  const { locale, captureId } = await params;
  if (!isLocale(locale)) return {};

  const result = await readCapture(captureId);
  const robots = { index: false, follow: false };
  if (result.kind !== "ok") return { robots };

  return { title: `${captureTitle(result.entry, locale)} · ${brand.en.name}`, robots };
}

export default async function CaptureDetailPage({ params }: CaptureDetailPageProps) {
  const { locale, captureId } = await params;

  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const result = await readCapture(captureId);
  if (result.kind === "not-found") notFound();
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);
  if (result.kind === "unreachable") {
    return (
      <div className="capture-detail-page">
        <StatePanel
          variant="error"
          headingLevel={1}
          {...collectionGalleryCopy[locale].unreachable}
        />
      </div>
    );
  }

  return <CaptureDetail result={result} locale={locale} />;
}
