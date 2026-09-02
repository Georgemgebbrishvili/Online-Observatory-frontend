import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";

export const observatoryStatuses = [
  "ONLINE",
  "PREPARING",
  "OBSERVING",
  "PARKED",
  "OFFLINE",
  "WEATHER_HOLD",
  "MAINTENANCE",
] as const;

export type ObservatoryStatusValue = (typeof observatoryStatuses)[number];

const statusTone: Record<ObservatoryStatusValue, StatusTone> = {
  ONLINE: "success",
  PREPARING: "warning",
  OBSERVING: "cyan",
  PARKED: "neutral",
  OFFLINE: "neutral",
  WEATHER_HOLD: "warning",
  MAINTENANCE: "danger",
};

type ObservatoryStatusProps = {
  status: ObservatoryStatusValue;
  label: string;
};

export function ObservatoryStatus({ status, label }: ObservatoryStatusProps) {
  return (
    <StatusIndicator
      className={status === "ONLINE" ? "observatory-status-online" : undefined}
      label={label}
      tone={statusTone[status]}
    />
  );
}
