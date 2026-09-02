import { observatories } from "@/features/observatory/observatories";

export const liveObservatorySnapshot = {
  status: "ONLINE",
  viewerCount: 184,
} as const;

export const observatoryNodes = observatories.map(
  (observatory) =>
    ({
      id: observatory.id,
      status: "active",
      dataMode: observatory.statusMode,
    }) as const,
);

export const privateSessionDurations = [30, 60, 120] as const;
