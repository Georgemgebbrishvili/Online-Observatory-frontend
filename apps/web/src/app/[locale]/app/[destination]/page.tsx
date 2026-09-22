import { notFound } from "next/navigation";

import { AppDestinationPreview } from "@/components/layout/app-destination-preview";
import {
  appDestinations,
  isAppDestinationSegment,
} from "@/features/navigation/navigation-model";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { requireUser } from "@/lib/platform/session";

type AppDestinationPageProps = {
  params: Promise<{ locale: string; destination: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    appDestinations
      .filter(
        (destination) =>
          destination.segment !== "" &&
          destination.segment !== "missions" &&
          destination.segment !== "live" &&
          destination.segment !== "collection",
      )
      .map((destination) => ({ locale, destination: destination.segment })),
  );
}

export default async function AppDestinationPage({ params }: AppDestinationPageProps) {
  const { locale, destination } = await params;

  if (!isLocale(locale) || !isAppDestinationSegment(destination)) {
    notFound();
  }

  await requireUser(locale);
  const dictionary = await getDictionary(locale);

  return (
    <AppDestinationPreview
      destination={destination}
      navigation={dictionary.navigation.app}
    />
  );
}
