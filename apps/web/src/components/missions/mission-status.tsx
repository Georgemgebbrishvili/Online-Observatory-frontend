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
  SCHEDULED: "cyan",
  PREPARING: "warning",
  SLEWING: "cyan",
  VERIFYING: "cyan",
  CENTERING: "cyan",
  OBSERVING: "cyan",
  CAPTURING: "cyan",
  PROCESSING: "cyan",
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
