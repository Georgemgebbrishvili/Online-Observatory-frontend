import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TonightNotices } from "@/components/astronomy/tonight-notices";
import { MissionBrowser } from "@/components/missions/mission-browser";
import { readTonight } from "@/features/targets/read";
import { isLocale } from "@/i18n/config";
import { missionBrowserCopy } from "@/i18n/resources/missions";
import { requireUser } from "@/lib/platform/session";
import "@/styles/missions.css";

type MissionsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MissionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = missionBrowserCopy[locale];
  return { title: copy.metadataTitle, description: copy.metadataDescription };
}

export default async function MissionsPage({ params }: MissionsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  await requireUser(locale);
  const tonight = await readTonight(locale);
  const copy = missionBrowserCopy[locale];

  return (
    <section className="missions-page" aria-labelledby="missions-title">
      <header className="missions-hero">
        <p className="eyebrow">
          <span aria-hidden="true" />
          {tonight.kind === "ok" ? tonight.observatory.name : copy.eyebrow}
        </p>
        <div className="missions-hero-copy">
          <h1 id="missions-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
      </header>

      <div className="tonight-notices">
        <TonightNotices result={tonight} locale={locale} headingLevel={2} />
      </div>

      {tonight.kind === "ok" && (
        <MissionBrowser
          items={tonight.items}
          timezone={tonight.observatory.timezone}
          locale={locale}
        />
      )}
    </section>
  );
}
