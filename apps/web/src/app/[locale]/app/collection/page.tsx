import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionGallery } from "@/components/collection/collection-gallery";
import { isLocale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { requireSession } from "@/lib/platform/session";
import "@/styles/collection.css";

type CollectionPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = collectionGalleryCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  await requireSession(locale);

  return <CollectionGallery locale={locale} />;
}
