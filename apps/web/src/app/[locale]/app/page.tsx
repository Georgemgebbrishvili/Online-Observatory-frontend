import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { readCollection } from "@/features/collection/read";
import { readObservatoryPanel, readUpcoming } from "@/features/home/read";
import { readTonight } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { authenticatedHomeCopy } from "@/i18n/resources/authenticated-home";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";
import "@/styles/missions.css";
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

  const user = await requireUser(locale);

  // Each section stands on its own: one failed read never blanks the page.
  const [tonight, panel, upcoming, collection] = await Promise.all([
    readTonight(locale),
    readObservatoryPanel(),
    readUpcoming(),
    readCollection(null, 3),
  ]);
  // The session ended between the check above and the reads.
  if (upcoming.kind === "signed-out" || collection.kind === "signed-out") {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <AuthenticatedHome
      locale={locale}
      displayName={user.displayName ?? null}
      tonight={tonight}
      panel={panel}
      upcoming={upcoming}
      collection={collection}
    />
  );
}
