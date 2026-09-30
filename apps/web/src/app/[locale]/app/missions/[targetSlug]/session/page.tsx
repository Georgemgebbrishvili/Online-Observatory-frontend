import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MissionRoom } from "@/components/room/mission-room";
import { readRoom } from "@/features/missions/read-room";
import { fill } from "@/features/operator/format";
import { isLocale } from "@/i18n/config";
import { roomCopy } from "@/i18n/resources/room";
import { requireUser } from "@/lib/platform/session";
import "@/styles/collection.css";
import "@/styles/room.css";

// The segment is named for the target page it shares a level with; here its value is
// the mission's id (ADR-027 §1).
type MissionRoomPageProps = {
  params: Promise<{ locale: string; targetSlug: string }>;
};

export async function generateMetadata({
  params,
}: MissionRoomPageProps): Promise<Metadata> {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) return {};
  const result = await readRoom(missionId);
  const target = result.kind === "ok" ? result.room.target : null;
  const name = target ? (locale === "ka" ? target.nameKa : target.nameEn) : "—";
  return {
    title: fill(roomCopy[locale].metadataTitle, { target: name }),
    robots: { index: false, follow: false },
  };
}

export default async function MissionRoomPage({ params }: MissionRoomPageProps) {
  const { locale, targetSlug: missionId } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale);

  const result = await readRoom(missionId);
  if (result.kind === "not-found") notFound();
  if (result.kind === "signed-out") redirect(`/${locale}/sign-in`);
  if (result.kind === "unreachable") {
    const copy = roomCopy[locale];
    return (
      <div className="room">
        <header className="room-head" role="alert">
          <h1>{copy.unreachable.title}</h1>
          <p>{copy.unreachable.description}</p>
        </header>
      </div>
    );
  }

  return <MissionRoom room={result.room} locale={locale} />;
}
