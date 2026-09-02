import type { Locale } from "@/i18n/config";

export type ProcessingPreset = "NATURAL" | "BRIGHT" | "DETAIL";
export type CaptureState = "READY" | "CAPTURING" | "PROCESSING" | "COMPLETE";

export type LiveObservation = {
  id: string;
  missionId: string;
  observatory: Record<Locale, string>;
  target: Record<Locale, string>;
  telescopeState: Record<Locale, string>;
  exposureState: Record<Locale, string>;
  viewerCount: number;
  initialElapsedSeconds: number;
  publicSharingEnabled: boolean;
  missionOwner?: string;
  missionOwnerId?: string;
  simulated: boolean;
};

export const currentLiveObservation: LiveObservation = {
  id: "live-dv-sim-001",
  missionId: "00000000-0000-4000-8000-000000000205",
  observatory: {
    en: "Tbilisi Observatory",
    ka: "თბილისის ობსერვატორია",
  },
  target: { en: "Saturn", ka: "სატურნი" },
  telescopeState: {
    en: "Tracking steadily",
    ka: "სტაბილურად მიჰყვება",
  },
  exposureState: {
    en: "Ready for your capture",
    ka: "მზადაა გადასაღებად",
  },
  viewerCount: 184,
  initialElapsedSeconds: 1062,
  publicSharingEnabled: true,
  missionOwner: "Observer",
  missionOwnerId: "00000000-0000-4000-8000-000000000001",
  simulated: true,
};

export function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}
