import { StatusIndicator } from "@/components/ui/status-indicator";

type TargetAvailabilityProps = {
  observable: boolean;
  /** "Observable now", or the platform's first reason why not. */
  label: string;
};

export function TargetAvailability({ label, observable }: TargetAvailabilityProps) {
  return <StatusIndicator label={label} tone={observable ? "success" : "neutral"} />;
}
