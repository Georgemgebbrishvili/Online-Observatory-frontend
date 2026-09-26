import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CollectionGallery } from "@/components/collection/collection-gallery";
import { cursorOf, readCollection } from "@/features/collection/read";
import { isLocale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";

type CollectionPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = collectionGalleryCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const cursor = cursorOf((await searchParams).cursor);
  const result = await readCollection(cursor);
  // The session ended between the check above and the read.
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);

  return <CollectionGallery locale={locale} paged={cursor !== null} result={result} />;
}
