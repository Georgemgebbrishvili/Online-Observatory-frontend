import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { isLocale } from "@/i18n/config";
import { authenticatedHomeCopy } from "@/i18n/resources/authenticated-home";
import { requireSession } from "@/lib/platform/session";
import "@/styles/authenticated-home.css";

type AppHomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AppHomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = authenticatedHomeCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function AppHomePage({ params }: AppHomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  await requireSession(locale);

  return <AuthenticatedHome locale={locale} />;
}
