import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";
import {
  missionFailureStates,
  missionStates,
  type MissionState,
} from "@/features/missions/domain";

export const missionStatuses = [...missionStates, ...missionFailureStates] as const;

export type MissionStatusValue = MissionState;

const missionTone: Record<MissionStatusValue, StatusTone> = {
  REQUESTED: "neutral",
  SCHEDULED: "active",
  PREPARING: "active",
  SLEWING: "active",
  VERIFYING: "active",
  CENTERING: "active",
  OBSERVING: "active",
  CAPTURING: "active",
  PROCESSING: "active",
  COMPLETE: "success",
  WEATHER_HOLD: "warning",
  NOT_VISIBLE: "warning",
  HARDWARE_ERROR: "danger",
  CANCELLED: "neutral",
  FAILED: "danger",
};

type MissionStatusProps = {
  status: MissionStatusValue;
  label: string;
};

export function MissionStatus({ label, status }: MissionStatusProps) {
  return <StatusIndicator label={label} tone={missionTone[status]} />;
}
