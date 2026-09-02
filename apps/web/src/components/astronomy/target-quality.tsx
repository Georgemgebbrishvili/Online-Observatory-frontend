import { StatusIndicator, type StatusTone } from "@/components/ui/status-indicator";

export const targetQualities = ["Excellent", "Good", "Fair", "Unavailable"] as const;
export type TargetQualityValue = (typeof targetQualities)[number];

const qualityTone: Record<TargetQualityValue, StatusTone> = {
  Excellent: "cyan",
  Good: "success",
  Fair: "warning",
  Unavailable: "neutral",
};

type TargetQualityProps = {
  quality: TargetQualityValue;
  label: string;
};

export function TargetQuality({ label, quality }: TargetQualityProps) {
  return <StatusIndicator label={label} tone={qualityTone[quality]} />;
}
