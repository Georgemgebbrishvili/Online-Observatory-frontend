import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MissionWatch, WatchView } from "@/components/room/mission-watch";
import { readWatch } from "@/features/missions/read-watch";
import { fill } from "@/features/operator/format";
import { isLocale } from "@/i18n/config";
import { watchCopy } from "@/i18n/resources/watch";
import { requireUser } from "@/lib/platform/session";
import "@/styles/room.css";
import "@/styles/room-console.css";

// The segment is named for the target page it shares a level with; here its value is
// the mission's id, as for the live room beside it (ADR-027 §1).
type WatchPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) return {};
  const result = await readWatch(missionId);
  const target = result.kind === "ok" ? result.view.target : null;
  const name = target ? (locale === "ka" ? target.nameKa : target.nameEn) : "—";
  return {
    title: fill(watchCopy[locale].metadataTitle, { target: name }),
    robots: { index: false, follow: false },
  };
}

/**
 * Watching somebody else's live session (Phase 4 slice 5), on `getMissionWatchView`. A
 * session not open to this caller is a state of the page, not Next's 404: the link was
 * shared, and its holder is told why there is nothing to watch.
 */
export default async function WatchPage({ params }: WatchPageProps) {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireUser(locale);
  const copy = watchCopy[locale];

  const result = await readWatch(missionId);
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);
  if (result.kind !== "ok") {
    return (
      <div className="room">
        <WatchView
          phase={result.kind === "not-found" ? "not-open" : "error"}
          copy={copy}
        />
      </div>
    );
  }

  const { view } = result;
  if (view.mission.userId === user.id) {
    return (
      <div className="room">
        <WatchView
          phase="owner"
          copy={copy}
          target={locale === "ka" ? view.target.nameKa : view.target.nameEn}
          observatory={
            locale === "ka" ? view.observatory.nameKa : view.observatory.nameEn
          }
          roomPath={`/${locale}/app/missions/${view.mission.id}/session`}
        />
      </div>
    );
  }

  return (
    <div className="room">
      <MissionWatch view={view} locale={locale} />
    </div>
  );
}
