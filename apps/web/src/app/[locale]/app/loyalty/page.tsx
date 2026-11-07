import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClubPage } from "@/components/loyalty/club-page";
import { StatePanel } from "@/components/ui/state-panel";
import { readClub } from "@/features/loyalty/read";
import { isLocale } from "@/i18n/config";
import { loyaltyCopy } from "@/i18n/resources/loyalty";
import { requireUser } from "@/lib/platform/session";
import "@/styles/loyalty.css";

type LoyaltyPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LoyaltyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: loyaltyCopy[locale].metadataTitle } : {};
}

/** ADR-084: the Loyalty Club, read from the platform (DV-090, DV-091). */
export default async function LoyaltyPage({ params }: LoyaltyPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);
  const club = await readClub();
  const copy = loyaltyCopy[locale];

  if (club.kind === "unreachable") {
    return (
      <div className="club-page">
        <StatePanel variant="error" headingLevel={1} {...copy.unreachable} />
      </div>
    );
  }

  return <ClubPage locale={locale} scheme={club.scheme} account={club.account} />;
}
