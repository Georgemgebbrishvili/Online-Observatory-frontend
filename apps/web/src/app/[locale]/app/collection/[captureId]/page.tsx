import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaptureDetail } from "@/components/collection/capture-detail";
import { captures, getCapture } from "@/features/collection/captures";
import { isLocale, locales } from "@/i18n/config";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";

type CaptureDetailPageProps = {
  params: Promise<{ locale: string; captureId: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    captures.map((capture) => ({ locale, captureId: capture.id })),
  );
}

export async function generateMetadata({
  params,
}: CaptureDetailPageProps): Promise<Metadata> {
  const { locale, captureId } = await params;
  const capture = getCapture(captureId);

  if (!isLocale(locale) || !capture) return {};

  return {
    title: `${capture.target[locale]} · ${capture.id} · Darkview`,
    description: capture.description[locale],
    robots: { index: false, follow: false },
  };
}

export default async function CaptureDetailPage({ params }: CaptureDetailPageProps) {
  const { locale, captureId } = await params;

  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const capture = getCapture(captureId);
  if (!capture) notFound();

  return <CaptureDetail capture={capture} locale={locale} />;
}
