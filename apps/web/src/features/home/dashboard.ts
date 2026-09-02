import { captures } from "@/features/collection/captures";
import { currentLiveObservation } from "@/features/live/live-data";
import { missionTargets, rankedMissionTargets } from "@/features/missions/targets";

export const homeProfile = {
  id: "user-demo",
  firstName: { en: "Observer", ka: "დამკვირვებელი" },
} as const;

export const upcomingMissions = [
  {
    id: "DV-SIM-008",
    targetId: "target-m31",
    targetSlug: "andromeda-galaxy",
    scheduledFor: "2026-08-25T19:30:00.000Z",
    schedule: { en: "Tonight · 23:30", ka: "დღეს · 23:30" },
    state: "SCHEDULED",
    simulated: true,
  },
  {
    id: "DV-SIM-009",
    targetId: "target-m57",
    targetSlug: "ring-nebula",
    scheduledFor: "2026-08-26T17:50:00.000Z",
    schedule: { en: "Tomorrow · 21:50", ka: "ხვალ · 21:50" },
    state: "SCHEDULED",
    simulated: true,
  },
] as const;

export function getHomeDashboard() {
  const capturedTargetIds = new Set(captures.map((capture) => capture.targetId));
  const uniqueObjects = new Set(captures.map((capture) => capture.catalogId)).size;

  return {
    profile: homeProfile,
    tonight: rankedMissionTargets[0],
    liveObservation: currentLiveObservation.publicSharingEnabled
      ? currentLiveObservation
      : null,
    upcomingMissions: upcomingMissions.map((mission) => ({
      ...mission,
      target: missionTargets.find((target) => target.id === mission.targetId)!,
    })),
    continueExploring: rankedMissionTargets
      .filter((target) => !capturedTargetIds.has(target.id))
      .slice(0, 3),
    collection: {
      observationsCompleted: captures.length,
      uniqueObjects,
      recentCaptures: captures.slice(0, 3),
    },
    observatory: {
      id: "tbilisi-01",
      name: { en: "Tbilisi Observatory", ka: "თბილისის ობსერვატორია" },
      status: "ONLINE",
    },
  } as const;
}
